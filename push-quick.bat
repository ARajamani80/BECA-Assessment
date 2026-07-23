@echo off
REM Quick push to GitHub - Auto timestamp commit

cd /d "C:\Users\TL13 ADMIN\OneDrive - DJBH Global\Documents\Claude\Projects\BECA-Assessment"

echo Pushing to GitHub...
git add .
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a-%%b)
git commit -m "Update: !mydate! !mytime!" 2>nul
git push origin main

echo.
echo Done! Netlify deploying...
pause
