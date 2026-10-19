#!/bin/sh
# DBX plugin backend launcher (Linux / macOS).
# Spawns the JVM sidecar and execs into it, so stdio passes through directly.
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
JAR="$DIR/../bin/mybatis_sql_dbx_backend.jar"
if [ ! -f "$JAR" ]; then
  echo "[mybatis_sql_dbx_backend] JAR not found: $JAR" >&2
  exit 127
fi
if ! command -v java >/dev/null 2>&1; then
  echo "[mybatis_sql_dbx_backend] java not found in PATH" >&2
  exit 127
fi
exec java -Dfile.encoding=UTF-8 -Dstdout.encoding=UTF-8 -jar "$JAR" "$@"
