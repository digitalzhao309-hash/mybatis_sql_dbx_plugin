@echo off
rem Build script for the mybatis_sql_dbx_plugin DBX plugin backend.
rem Steps: 1) Maven package the Java sidecar  2) copy jar into backend\bin
rem        3) compile backend.exe with the bundled csc.exe (.NET Framework 4.x)
rem NOTE: cd into the project root first and use relative paths everywhere,
rem       so no machine-absolute paths leak into build outputs or logs.
rem       (Keep this file ASCII-only: cmd.exe parses .cmd in the ANSI codepage.)
setlocal
set "ROOT=%~dp0.."
pushd "%ROOT%"
if errorlevel 1 (
  echo BUILD FAILED: cannot enter project root.
  exit /b 1
)
set "JAR=backend-java\target\mybatis_sql_dbx_backend.jar"
set "BINDIR=backend\bin"
set "EXEDIR=backend\windows-x64"

echo [1/3] Building backend jar with Maven ...
rem Prefer the project-local Maven (tools\apache-maven-3.9.9) so the build
rem works without any global Maven installation; fall back to PATH mvn.
rem The local repo is passed via -Dmaven.repo.local (tools\m2-repo) so that
rem settings.xml contains no machine-absolute path.
set "MVN_CMD=tools\apache-maven-3.9.9\bin\mvn.cmd"
if exist "%MVN_CMD%" (
  call "%MVN_CMD%" -q -s tools\settings.xml -Dmaven.repo.local=tools\m2-repo -f backend-java\pom.xml package
) else (
  call mvn -q -s tools\settings.xml -Dmaven.repo.local=tools\m2-repo -f backend-java\pom.xml package
)
if errorlevel 1 (
  echo BUILD FAILED: Maven package step failed.
  popd
  exit /b 1
)
if not exist "%JAR%" (
  echo BUILD FAILED: jar not found at %JAR%
  popd
  exit /b 1
)

echo [2/3] Copying jar to backend\bin ...
if not exist "%BINDIR%" mkdir "%BINDIR%"
copy /y "%JAR%" "%BINDIR%\mybatis_sql_dbx_backend.jar" >nul
rem maven-status records machine-absolute source paths; drop it to keep the
rem project free of absolute paths (classes and the jar are unaffected).
if exist "backend-java\target\maven-status" rmdir /s /q "backend-java\target\maven-status"

echo [3/3] Compiling backend.exe with csc.exe ...
set "CSC="
if exist "%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" set "CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not defined CSC if exist "%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe" set "CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
if not defined CSC (
  echo WARNING: csc.exe not found. backend.exe was NOT compiled.
  echo The manifest points to backend\windows-x64\backend.exe. Compile it manually
  echo or change the manifest executable to backend\windows-x64\backend.cmd.
  goto :done
)
"%CSC%" /nologo /target:exe /optimize+ /out:"%EXEDIR%\backend.exe" scripts\BackendLauncher.cs
if errorlevel 1 (
  echo BUILD FAILED: csc.exe compile step failed.
  popd
  exit /b 1
)

:done
echo.
echo BUILD OK.
echo   backend\bin\mybatis_sql_dbx_backend.jar
if exist "%EXEDIR%\backend.exe" echo   backend\windows-x64\backend.exe
echo.
echo Optional: package the plugin with the DBX CLI:
echo   dbx-plugin package . --target windows-x64 --output-dir dist
popd
endlocal
exit /b 0
