@echo off
setlocal
title Clearcut Background Remover

set "APP_DIR=C:\Users\solrb\Documents\Codex\2026-06-30\are\dist"
set "NODE=C:\Users\solrb\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "SERVER=C:\Users\solrb\Documents\Codex\2026-06-30\are\outputs\clearcut-server.mjs"
set "APP_URL=http://127.0.0.1:41728"

if not exist "%APP_DIR%\index.html" (
  echo Clearcut could not find its app files.
  echo Expected: %APP_DIR%\index.html
  pause
  exit /b 1
)

if not exist "%NODE%" (
  echo Clearcut could not find the local web server.
  echo Please return to Codex and ask it to repair the launcher.
  pause
  exit /b 1
)

start "Clearcut Local Server" /min "%NODE%" "%SERVER%"
ping 127.0.0.1 -n 3 >nul
start "" "%APP_URL%"
exit /b 0
