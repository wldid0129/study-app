@echo off
setlocal

echo [1/5] Current branch / last commit
git branch --show-current
git log --oneline -n 1

echo [2/5] Fetching remotes
git fetch --all || goto :fail

echo [3/5] Pushing local work -> origin/work
git push -u origin work || goto :fail

echo [4/5] Showing remote heads
git ls-remote --heads origin main work

echo [5/5] Done. If main must reflect changes, merge PR or run:
echo     git checkout main ^&^& git pull origin main ^&^& git merge work ^&^& git push origin main

goto :eof

:fail
echo.
echo Failed. Check output above.
exit /b 1
