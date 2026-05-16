@echo off
cd /d "%~dp0"
echo Cleaning .next cache...
node scripts\clean-caches.mjs --next
echo Starting dev server on http://localhost:3003
set LISTINGS_SKIP_DB=1
node node_modules\next\dist\bin\next dev -p 3003
