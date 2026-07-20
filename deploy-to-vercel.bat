@echo off
echo 🚀 Deploying Frontend to Vercel...

cd frontend
echo Building frontend...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed! Fix errors and try again.
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 📤 Deploying to Vercel...

cd ..
call npx vercel --prod --yes --cwd frontend

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 🎉 Deployment successful!
    echo Your app should be available at your Vercel URL
    echo.
    echo Test login with:
    echo Email: admin@samarthdesk.com  
    echo Password: Admin@123
) else (
    echo ❌ Deployment failed!
    echo Try manual deployment via Vercel dashboard
)

pause