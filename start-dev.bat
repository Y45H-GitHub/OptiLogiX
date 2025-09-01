@echo off
echo Starting OptiLogix Development Environment...
echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
echo.
echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo Both servers are starting...
echo Backend: http://localhost:5055
echo Frontend: http://localhost:5173
pause