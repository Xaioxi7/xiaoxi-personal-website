@echo off
cd /d "%~dp0"
echo Publishing changes...
git add -A
git commit -m "Update site"
git push
echo.
echo Done. Live in about a minute at https://xaioxi7.github.io/xiaoxi-personal-website/
pause
