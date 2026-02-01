@echo off
cd /d "%~dp0"
echo Committing and Pushing Dashboard Fixes...
git add src/App.jsx
git commit -m "Fix category name display (underscore removal) for Veg Burger"
git push origin main
pause
