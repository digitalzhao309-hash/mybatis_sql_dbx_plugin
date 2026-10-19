@echo off
rem DBX plugin backend fallback launcher (Windows). The manifest points to
rem backend.exe compiled from scripts\BackendLauncher.cs; use this file only
rem if backend.exe is unavailable.
rem jar lookup matches BackendLauncher.cs: supports both bin\<target>\ and
rem backend\<target>\ layouts. (Keep this file ASCII-only.)
setlocal
set "JAR=%~dp0..\bin\mybatis_sql_dbx_backend.jar"
if exist "%JAR%" goto :havejar
set "JAR=%~dp0..\..\backend\bin\mybatis_sql_dbx_backend.jar"
if exist "%JAR%" goto :havejar
echo [mybatis_sql_dbx_backend] JAR not found (searched ..\bin and ..\..\backend\bin)
exit /b 127
:havejar
where java >nul 2>nul
if errorlevel 1 (
  echo [mybatis_sql_dbx_backend] java not found in PATH
  exit /b 127
)
java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -jar "%JAR%" %*
exit /b %errorlevel%
