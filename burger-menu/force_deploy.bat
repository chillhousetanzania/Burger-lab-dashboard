@echo off
echo ==========================================
echo Force Deploying Menu Images
echo ==========================================

cd /d "d:\websites\burger-dashboard"

echo.
echo 1. Checking for files...
if exist "burger-menu\images\gunners_chicken.png" echo [OK] gunners_chicken.png exists
if exist "burger-menu\images\jalapeno_chicken.png" echo [OK] jalapeno_chicken.png exists
if exist "burger-menu\images\flaky_chicken.png" echo [OK] flaky_chicken.png exists
if exist "burger-menu\images\butter_chicken.png" echo [OK] butter_chicken.png exists

echo.
echo 2. Forcing git add...
git add -f "burger-menu/images/gunners_chicken.png"
git add -f "burger-menu/images/jalapeno_chicken.png"
git add -f "burger-menu/images/flaky_chicken.png"
git add -f "burger-menu/images/butter_chicken.png"

echo.
echo 3. Checking git status...
git status

echo.
echo 4. Committing and Pushing...
git commit -m "Add generated menu images (forced)"
git push

echo.
echo ==========================================
echo Deployment Complete!
echo ==========================================
pause
