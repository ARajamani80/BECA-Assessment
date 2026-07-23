@echo off
REM BECA Assessment Platform - Git Push Script
REM Removes git locks and pushes to GitHub

setlocal enabledelayedexpansion

cd /d "C:\Users\TL13 ADMIN\OneDrive - DJBH Global\Documents\Claude\Projects\BECA-Assessment"

echo.
echo ==========================================
echo BECA Assessment - GitHub Upload Script
echo ==========================================
echo.

REM Remove git lock files
echo Removing git lock files...
if exist ".git\index.lock" (
    del ".git\index.lock" 2>nul
    echo   [OK] Removed .git\index.lock
)

if exist ".git\HEAD.lock" (
    del ".git\HEAD.lock" 2>nul
    echo   [OK] Removed .git\HEAD.lock
)
echo.

REM Check git status
echo Checking git status...
git status
echo.

REM Stage all changes
echo Staging changes...
git add -A
echo   [OK] All changes staged
echo.

REM Get commit message from user
set /p commit_msg="Enter commit message (or press Enter for auto-timestamp): "

if "!commit_msg!"=="" (
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a-%%b)
    set commit_msg=Update: !mydate! !mytime!
)

REM Commit changes
echo Committing: !commit_msg!
git commit -m "!commit_msg!" 2>nul
if !errorlevel! equ 0 (
    echo   [OK] Changes committed
) else (
    echo   [!] No changes to commit or commit failed
)
echo.

REM Push to GitHub
echo Pushing to GitHub...
git push origin main

if !errorlevel! equ 0 (
    echo.
    echo   [OK] Successfully pushed to GitHub!
    echo.
    echo ==========================================
    echo Netlify will auto-deploy in 2-5 minutes
    echo Site: https://becaskill-assessment.netlify.app
    echo ==========================================
) else (
    echo   [FAILED] Push failed - check your connection
    pause
    exit /b 1
)

echo.
pause
