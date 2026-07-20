@echo off
echo Starting Frontend Deployment...

cd frontend

echo Installing dependencies...
call npm install

echo Building application...
call npm run build

echo Frontend built successfully!
echo.
echo Next steps:
echo 1. Go to https://vercel.com/new
echo 2. Import this Git repository  
echo 3. Set Root Directory to "frontend"
echo 4. Add environment variables:
echo    VITE_API_URL=https://samarthdesk-ai-backend.railway.app/api/v1
echo    VITE_WS_URL=https://samarthdesk-ai-backend.railway.app
echo    VITE_APP_NAME=Samarthdesk AI Demo
echo 5. Deploy!

pause