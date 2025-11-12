import React, { useState } from 'react';

interface PaymentGatewayProps {
    amount: number;
    onSuccess: (paymentData: any) => void;
    onError: (error: string) => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const DualPaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, onSuccess, onError }) => {
    const [loading, setLoading] = useState<string | null>(null);
    const [selectedGateway, setSelectedGateway] = useState<'razorpay' | 'paytm'>('razorpay');

    const payWithRazorpay = async () => {
        try {
            setLoading('razorpay');

            // Create order
            const response = await fetch('http://localhost:5055/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const order = await response.json();

            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => openRazorpayCheckout(order);
                document.body.appendChild(script);
            } else {
                openRazorpayCheckout(order);
            }
        } catch (error) {
            setLoading(null);
            onError(error instanceof Error ? error.message : 'Payment failed');
        }
    };

    const openRazorpayCheckout = (order: any) => {
        const options = {
            key: process.env.REACT_APP_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'OptiLogix',
            description: 'Payment for OptiLogix Services',
            order_id: order.id,
            handler: async (response: any) => {
                try {
                    // Verify payment
                    const verifyResponse = await fetch('http://localhost:5055/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(response)
                    });

                    const result = await verifyResponse.json();
                    setLoading(null);

                    if (result.success) {
                        onSuccess({
                            gateway: 'razorpay',
                            orderId: order.id,
                            paymentId: response.razorpay_payment_id,
                            amount: order.amount / 100
                        });
                    } else {
                        onError(result.message || 'Payment verification failed');
                    }
                } catch (error) {
                    setLoading(null);
                    onError('Payment verification failed');
                }
            },
            modal: {
                ondismiss: () => {
                    setLoading(null);
                    onError('Payment cancelled by user');
                }
            },
            theme: {
                color: '#3399cc'
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const payWithPaytm = async () => {
        try {
            setLoading('paytm');
            const orderId = 'ORDER_' + Date.now();
            const customerId = 'CUST_' + Date.now();

            // Initiate Paytm payment
            const response = await fetch('http://localhost:5055/paytm/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    customerId,
                    orderId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to initiate Paytm payment');
            }

            const paytmData = await response.json();

            // Create form and submit to Paytm
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = paytmData.paytmUrl;
            form.target = '_blank'; // Open in new tab

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
            document.body.removeChild(form);

            setLoading(null);

            // Note: For Paytm, you'll need to handle the callback separately
            // as it redirects to a different page
            onSuccess({
                gateway: 'paytm',
                orderId: paytmData.ORDER_ID,
                message: 'Redirected to Paytm. Please complete payment.'
            });

        } catch (error) {
            setLoading(null);
            onError(error instanceof Error ? error.message : 'Paytm payment failed');
        }
    };

    return (
        <div className="dual-payment-gateway">
            <div className="payment-gateway-selector">
                <h3>Select Payment Method</h3>
                <div className="gateway-options">
                    <label className="gateway-option">
                        <input
                            type="radio"
                            value="razorpay"
                            checked={selectedGateway === 'razorpay'}
                            onChange={(e) => setSelectedGateway(e.target.value as 'razorpay')}
                        />
                        <span className="gateway-name">Razorpay</span>
                        <span className="gateway-description">Cards, UPI, Wallets, Net Banking</span>
                    </label>

                    <label className="gateway-option">
                        <input
                            type="radio"
                            value="paytm"
                            checked={selectedGateway === 'paytm'}
                            onChange={(e) => setSelectedGateway(e.target.value as 'paytm')}
                        />
                        <span className="gateway-name">Paytm</span>
                        <span className="gateway-description">Paytm Wallet, Cards, UPI</span>
                    </label>
                </div>
            </div>

            <div className="payment-amount">
                <h4>Amount: ₹{amount}</h4>
            </div>

            <div className="payment-buttons">
                {selectedGateway === 'razorpay' && (
                    <button
                        onClick={payWithRazorpay}
                        disabled={loading === 'razorpay'}
                        className="payment-button razorpay-button"
                    >
                        {loading === 'razorpay' ? 'Processing...' : 'Pay with Razorpay'}
                    </button>
                )}

                {selectedGateway === 'paytm' && (
                    <button
                        onClick={payWithPaytm}
                        disabled={loading === 'paytm'}
                        className="payment-button paytm-button"
                    >
                        {loading === 'paytm' ? 'Processing...' : 'Pay with Paytm'}
                    </button>
                )}
            </div>

            <style jsx>{`
        .dual-payment-gateway {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: white;
        }

        .payment-gateway-selector h3 {
          margin-bottom: 15px;
          color: #333;
        }

        .gateway-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .gateway-option {
          display: flex;
          align-items: center;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gateway-option:hover {
          background-color: #f5f5f5;
        }

        .gateway-option input[type="radio"] {
          margin-right: 10px;
        }

        .gateway-name {
          font-weight: bold;
          margin-right: 10px;
        }

        .gateway-description {
          color: #666;
          font-size: 0.9em;
        }

        .payment-amount {
          text-align: center;
          margin: 20px 0;
        }

        .payment-amount h4 {
          color: #2c5aa0;
          font-size: 1.2em;
        }

        .payment-buttons {
          display: flex;
          justify-content: center;
        }

        .payment-button {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 200px;
        }

        .payment-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .razorpay-button {
          background-color: #3399cc;
          color: white;
        }

        .razorpay-button:hover:not(:disabled) {
          background-color: #2980b9;
        }

        .paytm-button {
          background-color: #00baf2;
          color: white;
        }

        .paytm-button:hover:not(:disabled) {
          background-color: #0099cc;
        }
      `}</style>
        </div>
    );
};

export default DualPaymentGateway;