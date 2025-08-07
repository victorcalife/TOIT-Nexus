@echo off
echo === TOIT Nexus Deployment Script ===
echo.

echo 1. Building frontend and backend...
cd client
npm run build
cd ..
npm run server:build

echo.
echo 2. Deploying to Railway...
railway up

echo.
echo 3. Setting up database...
railway run npm run db:setup

echo.
echo 4. Running database migrations...
railway run npm run db:push

echo.
echo Deployment process completed!
echo Check your Railway dashboard for the deployment status.
pause