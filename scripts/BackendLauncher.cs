// DBX plugin backend launcher (Windows).
// Compiles with the .NET Framework 4.x bundled C# compiler (csc.exe), no SDK needed.
// Locates the sidecar jar and starts "java -jar <jar>" with the host-provided
// stdio handles attached directly to the JVM, so the JSONL protocol bytes pass
// through unchanged (zero-copy passthrough).
//
// 设计说明：Windows 上子进程不会自动继承宿主为本进程建立的标准句柄，
// 因此采用与 cmd.exe 相同的标准做法：先复制本进程的 stdio 句柄并标记为
// 可继承，再用 CreateProcess(STARTF_USESTDHANDLES) 显式传给 java.exe。
// 不使用 .NET 的流重定向 API，也不在进程间搬运数据（零拷贝、无转发线程），
// 进程行为与常见启动器一致，可降低被杀软误判的概率，同时减少转发延迟。
//
// jar 定位说明：CLI 打包会把 manifest 的 backend.executable 规范化为
// bin/<target>/backend.exe，而源码布局是 backend/<target>/backend.exe。
// 两种布局下 exe 的相对位置不同，因此从 exe 目录向上逐级查找，
// 同时兼容 <dir>\backend\bin\ 与 <dir>\bin\ 两种 jar 位置。
using System;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;

// 程序集元数据会写入 Win32 VERSIONINFO 资源。补全公司/产品/版本/描述等
// 元数据有助于安全软件识别程序来源，降低被杀软误杀的概率。
// 属性值保持纯 ASCII，避免 csc 按 ANSI 代码页误读非 ASCII 字面量。
[assembly: AssemblyProduct("mybatis_sql_dbx_plugin")]
[assembly: AssemblyTitle("MyBatis SQL Generator DBX Plugin Backend Launcher")]
[assembly: AssemblyDescription("DBX plugin backend launcher: starts the Java sidecar of the MyBatis SQL generator plugin.")]
[assembly: AssemblyCompany("digitalzhao")]
[assembly: AssemblyCopyright("Copyright (c) digitalzhao. All rights reserved.")]
[assembly: ComVisible(false)]
[assembly: AssemblyVersion("0.1.1.0")]
[assembly: AssemblyFileVersion("0.1.1.0")]

internal static class BackendLauncher
{
    private const string JarName = "mybatis_sql_dbx_backend.jar";

    // Win32 常量
    private const int STD_INPUT_HANDLE = -10;
    private const int STD_OUTPUT_HANDLE = -11;
    private const int STD_ERROR_HANDLE = -12;
    private const uint STARTF_USESTDHANDLES = 0x00000100;
    private const uint CREATE_NO_WINDOW = 0x08000000;
    private const uint DUPLICATE_SAME_ACCESS = 0x00000002;
    private const uint INFINITE = 0xFFFFFFFF;

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GetStdHandle(int nStdHandle);

    [DllImport("kernel32.dll")]
    private static extern IntPtr GetCurrentProcess();

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool DuplicateHandle(IntPtr hSourceProcessHandle, IntPtr hSourceHandle, IntPtr hTargetProcessHandle, out IntPtr lpTargetHandle, uint dwDesiredAccess, bool bInheritHandle, uint dwOptions);

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool CreateProcessW(string lpApplicationName, string lpCommandLine, IntPtr lpProcessAttributes, IntPtr lpThreadAttributes, bool bInheritHandles, uint dwCreationFlags, IntPtr lpEnvironment, string lpCurrentDirectory, ref STARTUPINFOW lpStartupInfo, out PROCESS_INFORMATION lpProcessInformation);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern uint WaitForSingleObject(IntPtr hHandle, uint dwMilliseconds);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool GetExitCodeProcess(IntPtr hProcess, out uint lpExitCode);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool CloseHandle(IntPtr hObject);

    [StructLayout(LayoutKind.Sequential)]
    private struct STARTUPINFOW
    {
        public uint cb;
        public IntPtr lpReserved;
        public IntPtr lpDesktop;
        public IntPtr lpTitle;
        public uint dwX;
        public uint dwY;
        public uint dwXSize;
        public uint dwYSize;
        public uint dwXCountChars;
        public uint dwYCountChars;
        public uint dwFillAttribute;
        public uint dwFlags;
        public ushort wShowWindow;
        public ushort cbReserved2;
        public IntPtr lpReserved2;
        public IntPtr hStdInput;
        public IntPtr hStdOutput;
        public IntPtr hStdError;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct PROCESS_INFORMATION
    {
        public IntPtr hProcess;
        public IntPtr hThread;
        public uint dwProcessId;
        public uint dwThreadId;
    }

    private static void Warn(string msg)
    {
        // 宿主提供的 stdio 句柄不保证可写；日志失败不能影响主流程
        try { Console.Error.WriteLine("[mybatis_sql_dbx_backend] " + msg); } catch (Exception) { }
    }

    private static bool IsStdHandleValid(IntPtr h)
    {
        return h != IntPtr.Zero && h != new IntPtr(-1);
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

    // 启动 java 并把宿主 stdio 句柄显式传给它；成功返回进程句柄，失败返回 IntPtr.Zero
    private static IntPtr StartJava(string javaExe, string jarArgs)
    {
        // 1. 取宿主为本进程建立的标准句柄（协议管道）
        IntPtr stdIn = GetStdHandle(STD_INPUT_HANDLE);
        IntPtr stdOut = GetStdHandle(STD_OUTPUT_HANDLE);
        IntPtr stdErr = GetStdHandle(STD_ERROR_HANDLE);
        if (!IsStdHandleValid(stdIn) || !IsStdHandleValid(stdOut) || !IsStdHandleValid(stdErr))
        {
            Warn("Host stdio handles are not available");
            return IntPtr.Zero;
        }

        // 2. 复制为可继承句柄（子进程才能拿到这组管道）
        IntPtr dupIn = IntPtr.Zero, dupOut = IntPtr.Zero, dupErr = IntPtr.Zero;
        IntPtr proc = GetCurrentProcess();
        if (!DuplicateHandle(proc, stdIn, proc, out dupIn, 0, true, DUPLICATE_SAME_ACCESS)
            || !DuplicateHandle(proc, stdOut, proc, out dupOut, 0, true, DUPLICATE_SAME_ACCESS)
            || !DuplicateHandle(proc, stdErr, proc, out dupErr, 0, true, DUPLICATE_SAME_ACCESS))
        {
            Warn("DuplicateHandle failed (win32 error " + Marshal.GetLastWin32Error() + ")");
            if (IsStdHandleValid(dupIn)) CloseHandle(dupIn);
            if (IsStdHandleValid(dupOut)) CloseHandle(dupOut);
            if (IsStdHandleValid(dupErr)) CloseHandle(dupErr);
            return IntPtr.Zero;
        }

        try
        {
            // 3. 显式把句柄传给子进程（与 cmd.exe 启动子进程的做法一致）
            STARTUPINFOW si = new STARTUPINFOW();
            si.cb = (uint)Marshal.SizeOf(typeof(STARTUPINFOW));
            si.dwFlags = STARTF_USESTDHANDLES;
            si.hStdInput = dupIn;
            si.hStdOutput = dupOut;
            si.hStdError = dupErr;

            // backend.exe 由宿主以管道方式拉起（无控制台）；为 java 指定
            // CREATE_NO_WINDOW，避免子进程额外弹出新控制台窗口。
            PROCESS_INFORMATION pi;
            string cmdLine = "\"" + javaExe + "\" " + jarArgs;
            if (!CreateProcessW(null, cmdLine, IntPtr.Zero, IntPtr.Zero, true, CREATE_NO_WINDOW, IntPtr.Zero, null, ref si, out pi))
            {
                Warn("CreateProcess failed for " + javaExe + " (win32 error " + Marshal.GetLastWin32Error() + ")");
                return IntPtr.Zero;
            }
            CloseHandle(pi.hThread);
            return pi.hProcess;
        }
        finally
        {
            // 父进程侧的可继承副本用完即关；子进程已持有自己的拷贝
            if (IsStdHandleValid(dupIn)) CloseHandle(dupIn);
            if (IsStdHandleValid(dupOut)) CloseHandle(dupOut);
            if (IsStdHandleValid(dupErr)) CloseHandle(dupErr);
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

        IntPtr java = StartJava("java", jarArgs);
        if (java == IntPtr.Zero)
        {
            string alt = FindJavaFallback();
            if (alt != null) java = StartJava(alt, jarArgs);
            if (java == IntPtr.Zero)
            {
                Warn("Failed to start java (not in PATH, JAVA_HOME or common install dirs)");
                Environment.Exit(127);
                return;
            }
            Warn("java resolved from fallback: " + alt);
        }
        Warn("jar=" + jar);

        // stdio 已直连宿主；本进程仅等待 JVM 退出并回传退出码
        WaitForSingleObject(java, INFINITE);
        uint code;
        if (!GetExitCodeProcess(java, out code)) code = 1;
        CloseHandle(java);
        Environment.ExitCode = unchecked((int)code);
    }
}
