@echo off
REM SV5T Local Development Launcher for Windows
REM This script starts both backend and frontend servers

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     SV5T Readiness Evaluator - Local Development          ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  echo.
)

REM One-click setup (copies .env if missing and validates files)
echo Running npm run setup ...
call npm run setup
echo.

REM Start servers
echo ✅ Starting development servers...
echo.
echo 🔸 Backend: http://localhost:5000
echo 🔸 Frontend: http://localhost:3000
echo 🔸 Prisma Studio: npm run prisma:studio
echo.

REM Start backend in new window
start "SV5T Backend Server" cmd /k npm run server:dev

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend in new window
start "SV5T Frontend Server" cmd /k npm run dev

echo.
echo ✅ Both servers started in new windows
echo.
echo 📖 Documentation:
echo   - LOCAL_SETUP_GUIDE.md
echo   - DATABASE_QUICK_START.md
echo   - POSTGRESQL_MIGRATION_GUIDE.md
echo.
pause
