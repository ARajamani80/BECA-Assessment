@echo off
REM ============================================
REM BECA-Assessment - Auto Push to GitHub
REM ============================================

setlocal enabledelayedexpansion

REM Set project path
set PROJECT_PATH=C:\Users\TL13 ADMIN\OneDrive - DJBH Global\Documents\Claude\Projects\BECA-Assessment

REM Navigate to project
cd /d "%PROJECT_PATH%"

echo.
echo ============================================
echo BECA-Assessment - GitHub Auto Push
echo ============================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Check git status
echo Checking git status...
git status >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not a git repository
    pause
    exit /b 1
)

REM Show current status
echo.
echo Current Status:
git status --short
echo.

REM Ask for commit message
set /p COMMIT_MSG="Enter commit message (or press Enter for auto-message): "

if "%COMMIT_MSG%"=="" (
    REM Generate auto-message with timestamp
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a-%%b)
    set COMMIT_MSG=Update: !mydate! !mytime!
)

REM Stage all changes
echo.
echo Staging files...
git add .
if errorlevel 1 (
    echo ERROR: Failed to stage files
    pause
    exit /b 1
)

REM Check if there are changes to commit
git diff --cached --quiet
if errorlevel 1 (
    REM There are changes
    echo.
    echo Committing changes: "%COMMIT_MSG%"
    git commit -m "%COMMIT_MSG%"

    if errorlevel 1 (
        echo ERROR: Failed to commit
        pause
        exit /b 1
    )

    REM Push to GitHub
    echo.
    echo Pushing to GitHub (origin/main)...
    git push origin main

    if errorlevel 1 (
        echo ERROR: Failed to push to GitHub
        echo.
        echo Possible solutions:
        echo 1. Check your internet connection
        echo 2. Verify GitHub credentials
        echo 3. Check if remote URL is correct: git remote -v
        pause
        exit /b 1
    )

    echo.
    echo ============================================
    echo SUCCESS! Changes pushed to GitHub
    echo ============================================
    echo.
    echo Netlify will auto-deploy in 1-2 minutes
    echo Monitor deployment at: https://app.netlify.com
    echo.
) else (
    echo.
    echo No changes to commit
    echo.
)

REM Show latest commits
echo.
echo Latest Commits:
git log --oneline -5
echo.

pause
