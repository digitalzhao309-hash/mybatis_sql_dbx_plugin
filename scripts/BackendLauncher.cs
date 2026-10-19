// DBX plugin backend launcher (Windows).
// Compiles with the .NET Framework 4.x bundled C# compiler (csc.exe), no SDK needed.
// Spawns "java -jar <jar>" and pipes stdio byte-for-byte between the DBX host
// and the JVM, so the JSONL protocol bytes pass through unchanged.
//
// jar 定位说明：CLI 打包会把 manifest 的 backend.executable 规范化为
// bin/<target>/backend.exe，而源码布局是 backend/<target>/backend.exe。
// 两种布局下 exe 的相对位置不同，因此从 exe 目录向上逐级查找，
// 同时兼容 <dir>\backend\bin\ 与 <dir>\bin\ 两种 jar 位置。
using System;
using System.Diagnostics;
using System.IO;

internal static class BackendLauncher
{
    private const string JarName = "mybatis_sql_dbx_backend.jar";

    private static void Warn(string msg)
    {
        // 宿主提供的 stdio 句柄不保证可写；日志失败不能影响主流程
        try { Console.Error.WriteLine("[mybatis_sql_dbx_backend] " + msg); } catch (Exception) { }
    }

    private static string FindJar()
    {
        string dir = AppDomain.CurrentDomain.BaseDirectory;
        for (int i = 0; i < 8 && !string.IsNullOrEmpty(dir); i++)
        {
            string[] candidates = new string[]
            {
                Path.Combine(dir, "backend", "bin", JarName),
                Path.Combine(dir, "bin", JarName)
            };
            foreach (string c in candidates)
            {
                if (File.Exists(c)) return Path.GetFullPath(c);
            }
            DirectoryInfo parent = null;
            try { parent = Directory.GetParent(dir); } catch (Exception) { }
            dir = parent == null ? null : parent.FullName;
        }
        return null;
    }

    // PATH 上的 java 启动失败时的兜底：JAVA_HOME 与常见安装目录（取目录名排序最大者）
    private static string FindJavaFallback()
    {
        string javaHome = Environment.GetEnvironmentVariable("JAVA_HOME");
        if (!string.IsNullOrEmpty(javaHome))
        {
            string p = Path.Combine(javaHome, "bin", "java.exe");
            if (File.Exists(p)) return p;
        }

        string[] roots = new string[]
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Java"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Eclipse Adoptium"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Zulu"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Amazon Corretto"),
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Java")
        };
        string best = null;
        foreach (string root in roots)
        {
            if (string.IsNullOrEmpty(root) || !Directory.Exists(root)) continue;
            string[] subs;
            try { subs = Directory.GetDirectories(root); } catch (Exception) { continue; }
            foreach (string sub in subs)
            {
                string p = Path.Combine(sub, "bin", "java.exe");
                if (!File.Exists(p)) continue;
                if (best == null || string.CompareOrdinal(sub, Path.GetDirectoryName(best)) > 0) best = p;
            }
        }
        return best;
    }

    private static Process TryStart(string javaExe, string jarArgs)
    {
        ProcessStartInfo si = new ProcessStartInfo();
        si.FileName = javaExe;
        si.Arguments = jarArgs;
        si.UseShellExecute = false;
        si.CreateNoWindow = true;
        si.RedirectStandardInput = true;
        si.RedirectStandardOutput = true;
        si.RedirectStandardError = true;
        si.StandardErrorEncoding = System.Text.Encoding.UTF8;
        try
        {
            return Process.Start(si);
        }
        catch (Exception)
        {
            return null;
        }
    }

    private static void Main(string[] args)
    {
        string jar = FindJar();
        if (jar == null)
        {
            Warn("JAR not found (searched backend\\bin and bin upwards from " + AppDomain.CurrentDomain.BaseDirectory + ")");
            Environment.Exit(127);
            return;
        }

        string jarArgs = "-Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -jar \"" + jar + "\""
            + (args.Length > 0 ? " " + string.Join(" ", args) : string.Empty);

        Process java = TryStart("java", jarArgs);
        if (java == null)
        {
            string alt = FindJavaFallback();
            if (alt != null) java = TryStart(alt, jarArgs);
            if (java == null)
            {
                Warn("Failed to start java (not in PATH, JAVA_HOME or common install dirs)");
                Environment.Exit(127);
                return;
            }
            Warn("java resolved from fallback: " + alt);
        }
        Warn("jar=" + jar);

        Stream hostIn = Console.OpenStandardInput();
        Stream hostOut = Console.OpenStandardOutput();

        // host stdin -> java stdin (background thread); EOF closes java stdin for a clean shutdown
        System.Threading.Thread stdinPump = new System.Threading.Thread(delegate()
        {
            try
            {
                byte[] buf = new byte[8192];
                int n;
                while ((n = hostIn.Read(buf, 0, buf.Length)) > 0)
                {
                    java.StandardInput.BaseStream.Write(buf, 0, n);
                    java.StandardInput.BaseStream.Flush();
                }
            }
            catch (Exception)
            {
            }
            finally
            {
                try { java.StandardInput.Close(); } catch (Exception) { }
            }
        });
        stdinPump.IsBackground = true;
        stdinPump.Start();

        // java stderr -> host stderr (background thread, line-based; stderr carries logs only)
        System.Threading.Thread stderrPump = new System.Threading.Thread(delegate()
        {
            try
            {
                string line;
                while ((line = java.StandardError.ReadLine()) != null)
                {
                    try { Console.Error.WriteLine(line); } catch (Exception) { }
                }
            }
            catch (Exception)
            {
            }
        });
        stderrPump.IsBackground = true;
        stderrPump.Start();

        // java stdout -> host stdout (main thread, byte-for-byte)
        try
        {
            byte[] buf = new byte[8192];
            int n;
            while ((n = java.StandardOutput.BaseStream.Read(buf, 0, buf.Length)) > 0)
            {
                hostOut.Write(buf, 0, n);
                hostOut.Flush();
            }
        }
        catch (Exception)
        {
        }

        if (!java.WaitForExit(15000))
        {
            try { java.Kill(); } catch (Exception) { }
            java.WaitForExit();
        }
        Environment.ExitCode = java.ExitCode;
    }
}
