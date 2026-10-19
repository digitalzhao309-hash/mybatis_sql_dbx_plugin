# MyBatis SQL 生成器 — DBX 插件

粘贴 MyBatis mapper XML 与入参，基于 **MyBatis 官方引擎**（`XMLMapperBuilder` + `SqlSourceBuilder`）渲染出可直接执行的 SQL，支持 Oracle / SQL Server 方言字面量（`TO_DATE` / `TO_TIMESTAMP` / `N''` 等）。

由原 Java 桌面工具重构为 DBX 插件：UI 层为插件工作台页面，SQL 渲染逻辑下沉为 Java 8 sidecar 后端，通过 stdio JSONL JSON-RPC（Sidecar Protocol v1）与宿主通信。

## 目录结构

```
mybatis_sql_dbx_plugin/
├── manifest.json            # 插件清单（id / version / entrypoints / contributions）
├── dbx-plugin.toml          # dbx-plugin CLI 配置（打包包含目录等）
├── assets/plugin.svg        # 插件图标
├── ui/                      # 插件 UI（纯静态，无构建步骤）
│   ├── index.html           # mapper XML + 入参 → SQL 工作台
│   ├── app.js               # 调用 backend.rpc('sql/listStatements' / 'sql/render')
│   └── styles.css
├── backend/
│   ├── bin/mybatis_sql_dbx_backend.jar     # fat jar（含 MyBatis 3.5.16 + Jackson）
│   ├── windows-x64/backend.exe          # C# 启动器（拉起 java，透传 stdio）
│   ├── windows-x64/backend.cmd          # 无 csc.exe 时的 fallback 启动器
│   └── linux-x64|darwin-*/backend.sh    # 其他平台启动器
├── backend-java/            # 后端源码（Java 8 + Maven）
│   ├── pom.xml              # shade 打包，mainClass = ...sidecar.Main
│   └── src/main/java/digitalzhao/mybatis_sql_dbx_plugin/
│       ├── Dialect.java         # 方言枚举（oracle / sqlserver / mysql / ...）
│       ├── ParamParser.java     # 入参解析（JSON 或 GET 请求参数样式）
│       ├── ValueFormatter.java  # 方言化 SQL 字面量格式化
│       ├── SqlGenerator.java    # 核心：MyBatis Configuration → BoundSql → 可执行 SQL
│       └── sidecar/Main.java    # JSON-RPC sidecar 入口
├── scripts/
│   ├── build.cmd            # 一键构建（jar → backend/bin → csc.exe 编译 backend.exe）
│   └── BackendLauncher.cs   # backend.exe 源码（.NET Framework 4.x，无外部依赖）
└── tools/                   # 项目内本地化构建环境（不写系统目录）
    ├── apache-maven-3.9.9/  # Maven 本体
    ├── settings.xml         # 阿里云镜像（本地仓库由 build.cmd 以 -Dmaven.repo.local 指向 tools/m2-repo）
    ├── m2-repo/             # 本地依赖仓库
    ├── shim/                # cargo.exe 桩（cargo.cs 源码 + 编译产物）
    └── plugin-cli/          # @dbx-app/plugin-cli 0.1.9 本地安装（含独立 dbx-plugin.exe）
```

## 构建与验证

环境要求：JDK 8+（`java` 在 PATH）、.NET Framework 4.x（Windows 系统自带 csc.exe）。Maven 已内置于 `tools/`，无需全局安装；所有依赖只下载到项目内 `tools/m2-repo`。

```bat
scripts\build.cmd
```

三步：Maven 打包 jar → 拷贝到 `backend\bin\` → 用系统 csc.exe 编译 `backend\windows-x64\backend.exe`。

## 打包发布

产物：`dist/digitalzhao.mybatis_sql_dbx_plugin-<version>-windows-x64.dbxp`（ZIP 容器，含 manifest.json、
checksums.json、`bin/windows-x64/backend.exe`、`backend/`、`ui/`、`assets/`）与同名
`.artifact.json`（sha256 校验元数据）。

### CLI 获取（免 Node.js，全部在项目目录内）

`@dbx-app/plugin-cli` 的 win32-x64 平台子包内含独立原生 `dbx-plugin.exe`，无需 Node.js。
本仓库 `tools/plugin-cli/` 已按如下方式安装（仅本地，未上传任何仓库）：

```powershell
# main 包与平台包各下载一份 tgz（npmmirror），解压到 tools\plugin-cli\ 对应目录
# main.tgz    → tools\plugin-cli\main\package\
# win32-x64.tgz → tools\plugin-cli\win32\package\   （bin\dbx-plugin.exe 即 CLI 本体）
```

### cargo 桩（Java sidecar 复用官方打包流程的关键）

CLI 的 `package` 命令只支持 rust/go 后端的构建编排：声明 `[backend] language="rust"` 后，
它会从 PATH 调用 `cargo build --release --manifest-path backend/Cargo.toml`，并把
`$CARGO_TARGET_DIR\release\backend.exe`（toml 的 `binary` 只填 stem，CLI 自动补 `.exe`）
复制到包内 `bin/windows-x64/`。

为复用这条官方链路打包 Java sidecar，`tools/shim/cargo.cs`（csc.exe 编译为 cargo.exe）
实现了一个桩：把预构建的 `backend/windows-x64/backend.exe` 复制到 CLI 期望的
`$CARGO_TARGET_DIR\release\` 位置，其余参数忽略；同时输出 cargo 风格的编译日志。
桩内做了两点防御（均为实测踩坑）：

- CLI 传入的路径带 `\\?\` 扩展长度前缀，.NET Framework 的 Path/FileIOPermission 拒绝该
  前缀，桩统一剥离后再处理；
- CLI 为子进程提供的 stdio 句柄可能使 `Console.WriteLine` 抛 IOException，桩所有控制台
  输出包 try/catch，诊断信息另写 `tools/shim/cargo-shim.log`。

### 打包命令（PowerShell）

```powershell
# 1. 先跑 scripts\build.cmd 产出 backend\bin\*.jar 与 backend\windows-x64\backend.exe
# 2. 把桩目录前置到 PATH，再调用 CLI
$env:PATH = "$PWD\tools\shim;" + $env:PATH
& ".\tools\plugin-cli\win32\package\bin\dbx-plugin.exe" `
  package . --target windows-x64 --output-dir dist
```

成功输出（实测）：

```
Success: Built ...\dist\digitalzhao.mybatis_sql_dbx_plugin-<version>-windows-x64.dbxp
Metadata: ...\dist\digitalzhao.mybatis_sql_dbx_plugin-<version>-windows-x64.artifact.json
Signature: unsigned review candidate
```

## Sidecar 协议（Sidecar Protocol v1）

- 传输：stdio JSONL，UTF-8；stdout 只走协议消息，日志一律写 stderr（`[mybatis_sql_dbx_backend]` 前缀）
- 握手：`plugin/initialize` → `{protocolVersion: 1, capabilities: {}, plugin: {id, version}}`，id/version 与 manifest.json 严格一致
- 业务方法：
  - `sql/listStatements` `{mapperText, dialect}` → `{statements: [{id, type}]}`
  - `sql/render` `{mapperText, statementId, paramsText, dialect}` → `{sql, warnings}`
- 粘贴的 mapper 片段或完整文档均可；后端统一补 DOCTYPE（MyBatis 的 DTD 由本地解析，离线可用）
- 容错：行首 UTF-8 BOM 自动剥离，无法解析的行记 stderr 后忽略，stdin EOF 干净退出

## 设计说明

- **真实引擎而非正则**：直接复用 MyBatis `Configuration` 解析 mapper，`<if>` / `<foreach>` / `<where>` / `<choose>` 动态 SQL 与 OGNL 求值与线上行为一致
- **backend.exe 的作用**：DBX 宿主对可执行文件直接 spawn，C# 启动器负责定位 JRE、以 UTF-8 拉起 java 并逐字节透传 stdio；无 csc.exe 时 manifest 可改指 `backend.cmd`
- **jar 定位**：CLI 打包会把 manifest 的 `backend.executable` 规范化为 `bin/<target>/backend.exe`（与源码布局 `backend/<target>/` 不同），启动器因此从 exe 目录**向上逐级**查找 `backend\bin\` 与 `bin\` 下的 jar，两种布局均可运行；java 依次尝试 PATH → `JAVA_HOME` → 常见安装目录

## 常见问题

- **宿主报 `initialization failed: closed its output stream` / `Plugin session stopped`**：说明 backend 进程启动后立即退出（多为旧版启动器在 `bin\windows-x64\` 布局下找不到 jar）。0.1.1 起启动器已改为向上逐级查找；若仍出现，检查目标机器 java 是否可用（PATH / JAVA_HOME / `C:\Program Files\Java`），或在宿主 stderr 日志中找 `[mybatis_sql_dbx_backend]` 前缀的具体原因
- **升级安装**：修改 `manifest.json` 的 `version` 时，必须同步修改 `backend-java/.../sidecar/Main.java` 的 `PLUGIN_VERSION`（宿主校验 initialize 响应与 manifest 一致），然后重跑构建与打包
- **无状态渲染**：每次请求新建引擎，mapper 变化无需重启 sidecar
