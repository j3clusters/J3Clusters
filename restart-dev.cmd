@echo off
setlocal
cd /d "%~dp0"

rem Ensure dev mode (never inherit NODE_ENV=production from the shell)
set NODE_ENV=development

echo Stopping listeners on port 3003...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$listen = Get-NetTCPConnection -State Listen -LocalPort 3003 -ErrorAction SilentlyContinue ^| Where-Object { $_.OwningProcess -gt 0 }; ^
   $pids = $listen.OwningProcess ^| Sort-Object -Unique; ^
   foreach ($procId in $pids) { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue }" 2>nul
if errorlevel 1 (
  echo PowerShell port cleanup skipped — trying netstat fallback...
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3003" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
  )
)

echo Clearing .next cache...
if exist .next rmdir /s /q .next

echo Generating Prisma client...
call npx.cmd prisma generate
if errorlevel 1 (
  if exist "src\generated\prisma\index.js" (
    echo WARNING: prisma generate failed — continuing with existing src\generated\prisma
    echo If the site errors on DB, close ALL Node/Cursor terminals and run this script again.
  ) else (
    echo prisma generate failed and no client exists under src\generated\prisma
    echo Close apps locking the project folder, then retry.
    pause
    exit /b 1
  )
)

echo.
echo Open: http://localhost:3003
echo If pages show database errors, run: npm run db:sync
echo Use Ctrl+C to stop.
echo.
call npm.cmd run dev
