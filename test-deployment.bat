@echo off
echo Starting deployment test for cPanel environment...
echo.

REM Check if .env.local exists
if not exist .env.local (
  echo ERROR: .env.local file is missing!
  echo Please create an .env.local file with your production environment variables.
  exit /b 1
) else (
  echo [OK] .env.local file exists
)

REM Check for presence of critical files
for %%F in (next.config.js package.json tsconfig.json) do (
  if not exist %%F (
    echo ERROR: %%F is missing!
    exit /b 1
  ) else (
    echo [OK] %%F exists
  )
)

REM Check Node.js version
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Node.js version: %NODE_VERSION%

REM Check npm version
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo npm version: %NPM_VERSION%

REM Check TypeScript configuration
findstr "bundler" tsconfig.json >nul
if %ERRORLEVEL% EQU 0 (
  echo WARNING: moduleResolution is set to 'bundler' which may cause issues on cPanel. Consider using 'node' instead.
) else (
  echo [OK] TypeScript moduleResolution looks good
)

REM Run npm build to see if there are any issues
echo Running npm build to check for compilation issues...
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Build failed! Fix TypeScript and build errors before deploying.
  exit /b 1
) else (
  echo [OK] Build completed successfully
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo WARNING: Docker is not installed or not in PATH. Skipping Docker tests.
  echo Deployment build check completed.
  echo Your application should build on cPanel if the same Node.js version is used.
  exit /b 0
)

echo Testing Docker environment that simulates cPanel...
docker-compose up -d --build

if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Docker environment failed to start!
  exit /b 1
) else (
  echo [OK] Docker environment started successfully
  echo Waiting 10 seconds for the application to initialize...
  timeout /t 10 /nobreak >nul
)

echo Testing if the application is accessible...
curl -s -o nul -w "%%{http_code}" http://localhost:3000 > temp_status.txt
set /p HTTP_STATUS=<temp_status.txt
del temp_status.txt

REM Check if status code starts with 2
echo %HTTP_STATUS% | findstr /b "2" >nul
if %ERRORLEVEL% EQU 0 (
  echo [OK] Application is running and returning HTTP status %HTTP_STATUS%
) else (
  echo ERROR: Application is not accessible or returned HTTP status %HTTP_STATUS%
  echo Check the logs for more information:
  docker-compose logs
  docker-compose down
  exit /b 1
)

REM Stop Docker containers
echo Stopping Docker environment...
docker-compose down

echo.
echo [OK] Deployment test completed successfully!
echo Your application should work in cPanel. Remember to set up all required environment variables. 