@echo off
echo ========================================
echo Payment Gateway API Testing
echo ========================================
echo.

echo Testing backend health...
curl -s http://localhost:5055/health
echo.
echo.

echo Testing Razorpay order creation...
curl -X POST http://localhost:5055/create-order -H "Content-Type: application/json" -d "{\"amount\": 100}"
echo.
echo.

echo Testing Paytm payment initiation...
curl -X POST http://localhost:5055/paytm/initiate -H "Content-Type: application/json" -d "{\"amount\": 100, \"customerId\": \"CUST001\", \"orderId\": \"ORDER_%random%\"}"
echo.
echo.

echo ========================================
echo API Testing Complete!
echo ========================================
echo.
echo If you see JSON responses above, the APIs are working correctly.
echo.
pause