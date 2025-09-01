# Razorpay Payment Integration Setup Guide

This guide will help you configure Razorpay credentials for the payment integration in OptiLogix.

## Prerequisites

1. A Razorpay account (sign up at [razorpay.com](https://razorpay.com))
2. Access to your Razorpay Dashboard

## Step 1: Get Your Razorpay Credentials

1. **Login to Razorpay Dashboard**
   - Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
   - Login with your Razorpay account

2. **Navigate to API Keys**
   - In the left sidebar, click on "Settings"
   - Click on "API Keys"
   - Or directly go to: [https://dashboard.razorpay.com/app/keys](https://dashboard.razorpay.com/app/keys)

3. **Generate/Copy Your Keys**
   - **Key ID**: This starts with `rzp_test_` (for test mode) or `rzp_live_` (for live mode)
   - **Key Secret**: Click "Generate Key" if you don't have one, or copy existing secret

## Step 2: Configure Environment Variables

1. **Open the `.env` file** in the `frontend` directory

2. **Update the Razorpay credentials**:
   ```env
   # Razorpay Configuration
   VITE_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id_here
   VITE_RAZORPAY_KEY_SECRET=your_actual_key_secret_here
   ```

3. **Replace the placeholder values**:
   - Replace `rzp_test_your_actual_key_id_here` with your actual Key ID
   - Replace `your_actual_key_secret_here` with your actual Key Secret

## Step 3: Test vs Live Mode

### Test Mode (Recommended for Development)
- Use keys that start with `rzp_test_`
- No real money is charged
- Use test card numbers for testing

### Live Mode (Production Only)
- Use keys that start with `rzp_live_`
- Real money will be charged
- Requires business verification and activation

## Step 4: Test Card Details (Test Mode Only)

When testing payments, use these test card details:

### Successful Payment
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: Any 3 digits (e.g., `123`)
- **Name**: Any name

### Failed Payment (for testing error handling)
- **Card Number**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVV**: Any 3 digits

## Step 5: Restart Development Server

After updating the `.env` file:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Step 6: Test the Integration

1. Navigate to the Freight Quote Aggregator
2. Fill in shipment details
3. Get quotes and select one
4. Click "Book with [Provider]"
5. In the payment modal, click "Pay ₹[Amount]"
6. Use test card details to complete payment
7. Verify booking confirmation appears

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit real credentials** to version control
2. **Key Secret should be kept secure** - it's used for server-side operations
3. **Key ID is safe to expose** in frontend code
4. **Use test mode** during development
5. **Switch to live mode** only when ready for production

## Troubleshooting

### Common Issues

1. **"Payment system not loaded"**
   - Check if Razorpay script is loaded in `index.html`
   - Verify internet connection

2. **"Invalid key_id"**
   - Check if `VITE_RAZORPAY_KEY_ID` is correctly set in `.env`
   - Ensure the key starts with `rzp_test_` or `rzp_live_`

3. **Payment modal doesn't open**
   - Check browser console for errors
   - Verify Razorpay script is loaded

4. **Environment variables not working**
   - Restart the development server after changing `.env`
   - Ensure variable names start with `VITE_`

## Example .env Configuration

```env
# Razorpay Configuration - Replace with your actual credentials
VITE_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
VITE_RAZORPAY_KEY_SECRET=thisissecret
```

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)

## Support

If you encounter issues:
1. Check the Razorpay Dashboard for transaction logs
2. Review browser console for JavaScript errors
3. Verify all environment variables are correctly set
4. Ensure you're using the correct mode (test/live)