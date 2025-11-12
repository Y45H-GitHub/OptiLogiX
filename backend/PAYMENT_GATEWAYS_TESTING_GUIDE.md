# Payment Gateways Testing Guide

This guide covers testing both Razorpay and Paytm payment gateways integrated in your OptiLogix application.

## Prerequisites

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Setup**
   Update your `.env` file with actual credentials:
   ```env
   # Razorpay Test Credentials
   RAZORPAY_KEY_ID=your_razorpay_test_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
   
   # Paytm Test Credentials
   PAYTM_MID=your_paytm_merchant_id
   PAYTM_KEY=your_paytm_merchant_key
   PAYTM_WEBSITE=WEBSTAGING
   PAYTM_INDUSTRY_TYPE=Retail
   PAYTM_CALLBACK_URL=http://localhost:5055/paytm/callback
   ```

## Getting Test Credentials

### Razorpay Test Credentials
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate Test Keys (they start with `rzp_test_`)

### Paytm Test Credentials
1. Sign up at [Paytm Developer Console](https://developer.paytm.com/)
2. Create a new app and get staging credentials
3. Use `WEBSTAGING` as website parameter for testing

## Starting the Server

```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

Server will start on `http://localhost:5055`

## Testing Razorpay Integration

### 1. Test Order Creation
```bash
curl -X POST http://localhost:5055/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

**Expected Response:**
```json
{
  "id": "order_xxxxx",
  "entity": "order",
  "amount": 10000,
  "amount_paid": 0,
  "amount_due": 10000,
  "currency": "INR",
  "receipt": "receipt_order_xxxxx",
  "status": "created"
}
```

### 2. Test Payment Verification
```bash
curl -X POST http://localhost:5055/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_xxxxx",
    "razorpay_payment_id": "pay_xxxxx", 
    "razorpay_signature": "signature_xxxxx"
  }'
```

### 3. Razorpay Test Cards
Use these test card details in Razorpay checkout:

**Successful Payment:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card: 4000 0000 0000 0002
- CVV: Any 3 digits  
- Expiry: Any future date

## Testing Paytm Integration

### 1. Test Paytm Payment Initiation
```bash
curl -X POST http://localhost:5055/paytm/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "customerId": "CUST001",
    "orderId": "ORDER_' $(date +%s) '"
  }'
```

**Expected Response:**
```json
{
  "MID": "your_merchant_id",
  "WEBSITE": "WEBSTAGING",
  "INDUSTRY_TYPE_ID": "Retail",
  "CHANNEL_ID": "WEB",
  "ORDER_ID": "ORDER_xxxxx",
  "CUST_ID": "CUST001",
  "TXN_AMOUNT": "100",
  "CALLBACK_URL": "http://localhost:5055/paytm/callback",
  "CHECKSUMHASH": "checksum_hash",
  "paytmUrl": "https://securegw-stage.paytm.in/order/process"
}
```

### 2. Test Transaction Status Check
```bash
curl -X POST http://localhost:5055/paytm/status \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_xxxxx"}'
```

### 3. Paytm Test Credentials
For Paytm staging environment:

**Test Wallet:**
- Mobile: 7777777777
- OTP: 489871

**Test Cards:**
- Card: 4111 1111 1111 1111
- CVV: 123
- Expiry: 12/25

**Test Net Banking:**
- Use any test bank from the list
- Use credentials provided in Paytm staging docs

## Frontend Integration Testing

### HTML Test Page for Razorpay
Create a simple HTML file to test Razorpay:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Razorpay Test</title>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
    <button onclick="payWithRazorpay()">Pay with Razorpay</button>
    
    <script>
    async function payWithRazorpay() {
        // Create order
        const response = await fetch('http://localhost:5055/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 100 })
        });
        const order = await response.json();
        
        // Open Razorpay checkout
        const options = {
            key: 'your_razorpay_key_id',
            amount: order.amount,
            currency: order.currency,
            name: 'OptiLogix',
            description: 'Test Payment',
            order_id: order.id,
            handler: async function(response) {
                // Verify payment
                const verifyResponse = await fetch('http://localhost:5055/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(response)
                });
                const result = await verifyResponse.json();
                alert(result.message);
            }
        };
        const rzp = new Razorpay(options);
        rzp.open();
    }
    </script>
</body>
</html>
```

### HTML Test Page for Paytm
```html
<!DOCTYPE html>
<html>
<head>
    <title>Paytm Test</title>
</head>
<body>
    <button onclick="payWithPaytm()">Pay with Paytm</button>
    
    <script>
    async function payWithPaytm() {
        const orderId = 'ORDER_' + Date.now();
        
        // Initiate Paytm payment
        const response = await fetch('http://localhost:5055/paytm/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 100,
                customerId: 'CUST001',
                orderId: orderId
            })
        });
        const paytmData = await response.json();
        
        // Create form and submit to Paytm
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paytmData.paytmUrl;
        
        Object.keys(paytmData).forEach(key => {
            if (key !== 'paytmUrl') {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = paytmData[key];
                form.appendChild(input);
            }
        });
        
        document.body.appendChild(form);
        form.submit();
    }
    </script>
</body>
</html>
```

## Health Check

Test if both gateways are properly configured:

```bash
curl http://localhost:5055/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Payment backend server is running",
  "gateways": ["Razorpay", "Paytm"]
}
```

## Common Issues & Troubleshooting

### Razorpay Issues
1. **Invalid Key Error**: Check if `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct
2. **Signature Verification Failed**: Ensure the webhook secret matches
3. **CORS Issues**: Make sure CORS is enabled for your frontend domain

### Paytm Issues
1. **Checksum Mismatch**: Verify `PAYTM_KEY` is correct
2. **Invalid MID**: Check `PAYTM_MID` configuration
3. **Callback URL**: Ensure callback URL is accessible and matches configuration

### General Issues
1. **Port Conflicts**: Make sure port 5055 is available
2. **Environment Variables**: Verify all required env vars are set
3. **Network Issues**: Check if external API calls are allowed

## Production Deployment Notes

### Razorpay Production
- Replace test keys with live keys from Razorpay dashboard
- Update webhook URLs to production domains
- Enable only required payment methods

### Paytm Production  
- Change `PAYTM_WEBSITE` from `WEBSTAGING` to `DEFAULT`
- Update `paytmUrl` to production URL: `https://securegw.paytm.in/order/process`
- Use production merchant credentials
- Update callback URLs to production domains

## Security Best Practices

1. **Environment Variables**: Never commit credentials to version control
2. **HTTPS**: Use HTTPS in production for all payment endpoints
3. **Validation**: Always validate payment amounts and user inputs
4. **Logging**: Log payment attempts but never log sensitive data
5. **Rate Limiting**: Implement rate limiting on payment endpoints
6. **Webhook Security**: Verify all webhook signatures properly

## Support & Documentation

- **Razorpay Docs**: https://razorpay.com/docs/
- **Paytm Docs**: https://developer.paytm.com/docs/
- **Test Cards**: Both gateways provide comprehensive test card lists in their documentation