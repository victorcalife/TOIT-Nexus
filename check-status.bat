@echo off
echo === TOIT Nexus Status Check ===
echo.
echo Current Directory:
cd
echo.
echo Directory Contents:
dir
echo.
echo Environment Variables:
echo DATABASE_URL: %DATABASE_URL%
echo SESSION_SECRET: %SESSION_SECRET%
echo PORT: %PORT%
echo.
echo === Status Check Complete ===