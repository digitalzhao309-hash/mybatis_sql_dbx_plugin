@echo off
rem One-shot build + package for the mybatis_sql_dbx_plugin.
rem Usage: scripts\package.cmd
rem Steps: 1) scripts\build.cmd  (mvn jar -> backend\bin, csc backend.exe)
rem        2) dbx-plugin package . --target windows-x64 --output-dir dist
rem Remember to bump the version in manifest.json and
rem backend-java\src\main\java\digitalzhao\mybatis_sql_dbx_plugin\sidecar\Main.java
rem (PLUGIN_VERSION) whenever functionality changes.
setlocal
set "ROOT=%~dp0.."

echo [1/2] Building jar and backend.exe ...
call "%ROOT%\scripts\build.cmd"
if errorlevel 1 (
  echo PACKAGE FAILED: build step failed.
  exit /b 1
)

if not exist "%ROOT%\backend\windows-x64\backend.exe" (
  echo PACKAGE FAILED: backend\windows-x64\backend.exe missing - antivirus may have removed it. Rerun package.cmd.
  exit /b 1
)

echo [2/2] Packaging .dbxp ...
set "PATH=%ROOT%\tools\shim;%PATH%"
set "CLI=%ROOT%\tools\plugin-cli\win32\package\bin\dbx-plugin.exe"
if not exist "%CLI%" (
  echo PACKAGE FAILED: CLI not found at %CLI%
  exit /b 1
)
pushd "%ROOT%"
"%CLI%" package . --target windows-x64 --output-dir dist
set "PKGERR=%errorlevel%"
popd
if not "%PKGERR%"=="0" (
  echo PACKAGE FAILED: dbx-plugin package step failed.
  exit /b 1
)

echo.
echo PACKAGE OK. Output in %ROOT%\dist
endlocal
exit /b 0
