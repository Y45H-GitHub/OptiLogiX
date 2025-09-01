# OptiLogix Payment Backend

This is the backend server for handling Razorpay payments in the OptiLogix application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

The `.env` file is already created with your Razorpay credentials:

```env
RAZORPAY_KEY_ID=rzp_test_R8H74AbGwxIH19
RAZORPAY_KEY_SECRET=Py8QQpGw2DqsxSsyLrQlcby4
PORT=5055
```

### 3. Start the Server

For development (with auto-restart):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:5055`

## API Endpoints

### POST /create-order
Creates a new Razorpay order.

**Request Body:**
```json
{
  "amount": 1500
}
```

**Response:**
```json
{
  "id": "order_xyz123",
  "amount": 150000,
  "currency": "INR",
  "receipt": "receipt_order_1234567890"
}
```

### POST /verify-payment
Verifies a completed payment.

**Request Body:**
```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Razorpay backend server is running"
}
```

## Security Features

- ✅ **Payment Verification**: All payments are verified using Razorpay's signature verification
- ✅ **CORS Enabled**: Allows frontend to communicate with backend
- ✅ **Environment Variables**: Sensitive credentials stored in .env file
- ✅ **Error Handling**: Proper error responses for all endpoints

## Testing

You can test the backend endpoints using curl or Postman:

```bash
# Health check
curl http://localhost:5055/health

# Create order
curl -X POST http://localhost:5055/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 1500}'
```

## Production Deployment

For production deployment:

1. **Update environment variables** with live Razorpay credentials
2. **Set NODE_ENV=production**
3. **Use a process manager** like PM2
4. **Configure HTTPS** for secure communication
5. **Set up proper logging** and monitoring

## Troubleshooting

### Common Issues

1. **"Cannot connect to backend"**
   - Ensure the backend server is running on port 5055
   - Check if the port is available and not blocked by firewall

2. **"Invalid Razorpay credentials"**
   - Verify your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
   - Ensure you're using the correct test/live credentials

3. **"Payment verification failed"**
   - Check that the signature verification is working correctly
   - Ensure the key_secret matches between frontend and backend

### Logs

The server logs all important events to the console. Check the terminal where you started the server for error messages and debugging information.