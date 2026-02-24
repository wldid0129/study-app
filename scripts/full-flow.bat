@echo off
setlocal

REM Usage:
REM   scripts\full-flow.bat sync      -> sync local with origin/work and run dev
REM   scripts\full-flow.bat publish   -> commit helper message then push work
REM   scripts\full-flow.bat deploy    -> push main and run vercel --prod

set MODE=%1
if "%MODE%"=="" goto :usage

if /I "%MODE%"=="sync" goto :sync
if /I "%MODE%"=="publish" goto :publish
if /I "%MODE%"=="deploy" goto :deploy

goto :usage

:sync
echo [SYNC 1/5] fetch
git fetch --all || goto :fail
echo [SYNC 2/5] checkout work
git checkout work || goto :fail
echo [SYNC 3/5] set upstream
git branch --set-upstream-to=origin/work work || goto :fail
echo [SYNC 4/5] pull latest
git pull --ff-only || goto :fail
echo [SYNC 5/5] install + run dev
call npm install || goto :fail
call npm run dev || goto :fail
goto :eof

:publish
echo [PUBLISH 1/4] status
git status -sb || goto :fail
echo [PUBLISH 2/4] add
git add . || goto :fail
echo [PUBLISH 3/4] commit (edit message after -m)
if "%2"=="" (
  echo Please provide commit message.
  echo Example: scripts\full-flow.bat publish "fix: history unlock"
  exit /b 1
)
git commit -m "%~2" || goto :fail
echo [PUBLISH 4/4] push work
git push -u origin work || goto :fail
goto :eof

:deploy
echo [DEPLOY 1/4] checkout main
git checkout main || goto :fail
echo [DEPLOY 2/4] pull main
git pull origin main || goto :fail
echo [DEPLOY 3/4] merge work
git merge work || goto :fail
echo [DEPLOY 4/4] push main + vercel
git push origin main || goto :fail
vercel --prod || goto :fail
goto :eof

:usage
echo Usage:
echo   scripts\full-flow.bat sync
echo   scripts\full-flow.bat publish "your commit message"
echo   scripts\full-flow.bat deploy
exit /b 1

:fail
echo.
echo Failed. Check output above.
exit /b 1
