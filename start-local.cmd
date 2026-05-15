@echo off
setlocal
cd /d "%~dp0"

rem Next.js sets NODE_ENV itself — never force production for local scripts.
set NODE_ENV=development

echo === J3 Clusters local dev ===
echo.

where docker >nul 2>&1
if %ERRORLEVEL% equ 0 (
  echo Starting PostgreSQL container...
  docker compose up -d
  if errorlevel 1 (
    echo Docker compose failed. Install Docker Desktop or start Postgres manually.
    pause
    exit /b 1
  )
  echo Waiting for Postgres to accept connections...
  timeout /t 3 /nobreak >nul
) else (
  echo NOTE: "docker" not found in PATH. If Postgres is not already running on localhost:5432,
  echo install Docker Desktop and reopen this window, or install PostgreSQL and fix DATABASE_URL in .env.local
  echo.
)

echo Syncing schema ^(prisma db push --accept-data-loss^)...
echo This aligns your DB when older columns exist ^(e.g. legacy fields removed from schema^).
call npm.cmd run db:sync
if errorlevel 1 (
  echo.
  echo db:sync failed. Ensure DATABASE_URL in .env.local is correct and Postgres is running.
  pause
  exit /b 1
)

echo Seeding database...
call npm.cmd run db:seed
if errorlevel 1 (
  pause
  exit /b 1
)

echo.
echo Starting Next.js on http://localhost:3003
echo Admin login: check ADMIN_EMAIL / ADMIN_PASSWORD in .env.local
echo Press Ctrl+C to stop.
echo.
call npm.cmd run dev
