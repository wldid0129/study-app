@echo off
setlocal

echo [1/6] Fetching latest from origin...
git fetch --all || goto :fail

echo [2/6] Switching to work branch...
git checkout work || goto :fail

echo [3/6] Setting upstream to origin/work...
git branch --set-upstream-to=origin/work work || goto :fail

echo [4/6] Pulling latest work...
git pull --ff-only || goto :fail

echo [5/6] Installing dependencies (if needed)...
call npm install || goto :fail

echo [6/6] Starting dev server...
call npm run dev || goto :fail

goto :eof

:fail
echo.
echo Failed. Check output above.
exit /b 1
