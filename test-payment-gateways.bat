@echo off
echo ========================================
echo Payment Gateways Testing Setup
echo ========================================
echo.

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Starting backend server...
start "Payment Backend" cmd /k "npm start"

echo.
echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Testing backend health...
curl -s http://localhost:5055/health
if %errorlevel% neq 0 (
    echo Backend health check failed. Make sure the server is running.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Backend is running successfully!
echo ========================================
echo.
echo You can now test the payment gateways:
echo.
echo 1. Razorpay Test:
echo    curl -X POST http://localhost:5055/create-order -H "Content-Type: application/json" -d "{\"amount\": 100}"
echo.
echo 2. Paytm Test:
echo    curl -X POST http://localhost:5055/paytm/initiate -H "Content-Type: application/json" -d "{\"amount\": 100, \"customerId\": \"CUST001\", \"orderId\": \"ORDER_123\"}"
echo.
echo 3. Health Check:
echo    curl http://localhost:5055/health
echo.
echo Frontend test page will be available at:
echo http://localhost:3000/payment-test (after starting frontend)
echo.
echo Press any key to continue...
pause > nul

cd ..
echo.
echo Starting frontend development server...
cd frontend
start "Frontend Dev Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Backend: http://localhost:5055
echo Frontend: http://localhost:3000
echo Test Page: http://localhost:3000/payment-test
echo.
echo Check the opened terminal windows for logs.
echo Press any key to exit...
pause > nul