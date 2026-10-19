using System;
using System.IO;

static class Shim
{
    static string LogFile;
    static string Cwd;

    // 大小写不敏感的全串替换（.NET Framework 没有 string.Replace 的 IgnoreCase 重载）
    static string ReplaceIC(string s, string oldV, string newV)
    {
        if (string.IsNullOrEmpty(s) || string.IsNullOrEmpty(oldV)) return s;
        var sb = new System.Text.StringBuilder();
        int i = 0;
        while (i < s.Length)
        {
            int idx = s.IndexOf(oldV, i, StringComparison.OrdinalIgnoreCase);
            if (idx < 0) { sb.Append(s, i, s.Length - i); break; }
            sb.Append(s, i, idx - i).Append(newV);
            i = idx + oldV.Length;
        }
        return sb.ToString();
    }

    static void Log(string msg)
    {
        // 剥 \\?\ 扩展前缀，并把项目根（cwd）前缀折叠为相对路径（cwd 本身折叠为 "."）。
        msg = ReplaceIC(ReplaceIC(ReplaceIC(msg, @"\\?\", ""), Cwd + "\\", ""), Cwd, ".");
        try { File.AppendAllText(LogFile, DateTime.Now.ToString("HH:mm:ss.fff ") + msg + Environment.NewLine); } catch { }
        try { Console.WriteLine(msg); } catch { }
    }

    // 移除 .NET Path API 视为非法的字符（引号等，可能由 CLI 的 shell 包装引入）
    static string Sanitize(string s)
    {
        if (s == null) return null;
        // .NET Framework 4.x 不接受 \\?\ 扩展长度前缀（FileIOPermission 会抛
        // ArgumentException），CLI 传入的路径统一剥掉该前缀再处理。
        if (s.Length > 4 && s.StartsWith(@"\\?\"))
        {
            s = s.Substring(4);
        }
        var sb = new System.Text.StringBuilder();
        foreach (char c in s)
        {
            if (c == '"' || c == '<' || c == '>' || c == '|' || c < 32) continue;
            sb.Append(c);
        }
        return sb.ToString();
    }

    static int Main(string[] args)
    {
        Cwd = Directory.GetCurrentDirectory();
        LogFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "cargo-shim.log");
        try
        {
            Log("args: " + string.Join(" | ", args));
            Log("cwd: " + Directory.GetCurrentDirectory());
            Log("CARGO_TARGET_DIR=" + Environment.GetEnvironmentVariable("CARGO_TARGET_DIR"));

            string manifestPath = null;
            for (int i = 0; i + 1 < args.Length; i++)
            {
                if (args[i] == "--manifest-path") manifestPath = args[i + 1];
            }
            string backendDir = "backend";
            if (manifestPath != null && manifestPath.Trim().Length > 0)
            {
                string clean = Sanitize(manifestPath.Trim());
                backendDir = Path.GetDirectoryName(Path.GetFullPath(clean));
            }
            Log("backendDir: " + backendDir);

            string targetDir = Environment.GetEnvironmentVariable("CARGO_TARGET_DIR");
            if (string.IsNullOrEmpty(targetDir))
            {
                targetDir = Path.Combine(backendDir, "target");
            }
            string releaseDir = Path.Combine(Sanitize(targetDir), "release");
            Directory.CreateDirectory(releaseDir);

            string src = Path.Combine(backendDir, "windows-x64", "backend.exe");
            string dst = Path.Combine(releaseDir, "backend.exe");
            if (!File.Exists(src))
            {
                Log("error: prebuilt backend.exe not found: " + src);
                Environment.Exit(101);
            }
            if (!string.Equals(Path.GetFullPath(src), Path.GetFullPath(dst), StringComparison.OrdinalIgnoreCase))
            {
                File.Copy(src, dst, true);
            }
            Log("copied: " + src + " -> " + dst);
            Log("   Compiling backend v0.1.0 (shim: prebuilt java sidecar)");
            Log("    Finished `release` profile [optimized] target(s)");
            Environment.Exit(0);
        }
        catch (Exception e)
        {
            Log("ERROR: " + e.GetType().FullName + ": " + e.Message);
            Log("STACK: " + e.StackTrace);
            Environment.Exit(101);
        }
        return 0;
    }
}
