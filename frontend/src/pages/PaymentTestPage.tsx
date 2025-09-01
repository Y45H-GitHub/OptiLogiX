import React, { useState } from 'react';
import DualPaymentGateway from '../components/DualPaymentGateway';

const PaymentTestPage: React.FC = () => {
    const [paymentResult, setPaymentResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(100);

    const handlePaymentSuccess = (paymentData: any) => {
        setPaymentResult(paymentData);
        setError(null);
        console.log('Payment successful:', paymentData);
    };

    const handlePaymentError = (errorMessage: string) => {
        setError(errorMessage);
        setPaymentResult(null);
        console.error('Payment error:', errorMessage);
    };

    const resetTest = () => {
        setPaymentResult(null);
        setError(null);
    };

    return (
        <div className="payment-test-page">
            <div className="container">
                <h1>Payment Gateway Testing</h1>
                <p>Test both Razorpay and Paytm payment gateways</p>

                <div className="amount-selector">
                    <label htmlFor="amount">Test Amount (₹):</label>
                    <select
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    >
                        <option value={1}>₹1 (Minimum)</option>
                        <option value={10}>₹10</option>
                        <option value={100}>₹100</option>
                        <option value={500}>₹500</option>
                        <option value={1000}>₹1000</option>
                    </select>
                </div>

                {!paymentResult && !error && (
                    <DualPaymentGateway
                        amount={amount}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                    />
                )}

                {paymentResult && (
                    <div className="result-card success">
                        <h3>✅ Payment Successful!</h3>
                        <div className="result-details">
                            <p><strong>Gateway:</strong> {paymentResult.gateway}</p>
                            <p><strong>Order ID:</strong> {paymentResult.orderId}</p>
                            {paymentResult.paymentId && (
                                <p><strong>Payment ID:</strong> {paymentResult.paymentId}</p>
                            )}
                            {paymentResult.amount && (
                                <p><strong>Amount:</strong> ₹{paymentResult.amount}</p>
                            )}
                            {paymentResult.message && (
                                <p><strong>Message:</strong> {paymentResult.message}</p>
                            )}
                        </div>
                        <button onClick={resetTest} className="reset-button">
                            Test Another Payment
                        </button>
                    </div>
                )}

                {error && (
                    <div className="result-card error">
                        <h3>❌ Payment Failed</h3>
                        <p className="error-message">{error}</p>
                        <button onClick={resetTest} className="reset-button">
                            Try Again
                        </button>
                    </div>
                )}

                <div className="test-info">
                    <h3>Testing Information</h3>

                    <div className="gateway-info">
                        <h4>Razorpay Test Cards</h4>
                        <ul>
                            <li><strong>Success:</strong> 4111 1111 1111 1111</li>
                            <li><strong>Failure:</strong> 4000 0000 0000 0002</li>
                            <li><strong>CVV:</strong> Any 3 digits</li>
                            <li><strong>Expiry:</strong> Any future date</li>
                        </ul>
                    </div>

                    <div className="gateway-info">
                        <h4>Paytm Test Credentials</h4>
                        <ul>
                            <li><strong>Mobile:</strong> 7777777777</li>
                            <li><strong>OTP:</strong> 489871</li>
                            <li><strong>Test Card:</strong> 4111 1111 1111 1111</li>
                            <li><strong>CVV:</strong> 123, <strong>Expiry:</strong> 12/25</li>
                        </ul>
                    </div>

                    <div className="gateway-info">
                        <h4>Backend Status</h4>
                        <button
                            onClick={() => window.open('http://localhost:5055/health', '_blank')}
                            className="health-check-button"
                        >
                            Check Backend Health
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .payment-test-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        h1 {
          text-align: center;
          color: white;
          margin-bottom: 10px;
        }

        p {
          text-align: center;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 30px;
        }

        .amount-selector {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }

        .amount-selector label {
          display: block;
          margin-bottom: 10px;
          font-weight: bold;
          color: #333;
        }

        .amount-selector select {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .result-card {
          background: white;
          padding: 30px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }

        .result-card.success {
          border-left: 5px solid #4caf50;
        }

        .result-card.error {
          border-left: 5px solid #f44336;
        }

        .result-details {
          text-align: left;
          margin: 20px 0;
          background: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
        }

        .result-details p {
          margin: 5px 0;
          color: #333;
        }

        .error-message {
          color: #f44336;
          font-weight: bold;
          margin: 15px 0;
        }

        .reset-button {
          background: #2196f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .reset-button:hover {
          background: #1976d2;
        }

        .test-info {
          background: white;
          padding: 30px;
          border-radius: 8px;
          margin-top: 30px;
        }

        .test-info h3 {
          color: #333;
          margin-bottom: 20px;
          text-align: center;
        }

        .gateway-info {
          margin-bottom: 25px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 6px;
        }

        .gateway-info h4 {
          color: #2c5aa0;
          margin-bottom: 10px;
        }

        .gateway-info ul {
          margin: 0;
          padding-left: 20px;
        }

        .gateway-info li {
          margin: 5px 0;
          color: #555;
        }

        .health-check-button {
          background: #4caf50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .health-check-button:hover {
          background: #45a049;
        }
      `}</style>
        </div>
    );
};

export default PaymentTestPage;