import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    CreditCard,
    Shield,
    Clock,
    MapPin,
    Package,
    DollarSign,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { PaymentModalProps, RazorpayPaymentData, BookingData } from '@/types/payment';

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    quote,
    shipmentDetails,
    onPaymentSuccess
}) => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate payment breakdown
    const baseAmount = quote.cost;
    const taxAmount = Math.round(baseAmount * 0.18); // 18% GST
    const processingFee = 25;
    const totalAmount = baseAmount + taxAmount + processingFee;

    const generateBookingReference = (): string => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        return `BK${timestamp}${random}`.toUpperCase();
    };

    const handlePayment = async () => {
        if (!window.Razorpay) {
            toast.error('Payment system not loaded. Please refresh and try again.');
            return;
        }

        setIsProcessing(true);

        try {
            // Create order via backend API
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5055';
            const response = await fetch(`${backendUrl}/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: totalAmount
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const orderData = await response.json();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890',
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'OptiLogix Freight',
                description: `Freight booking with ${quote.provider}`,
                order_id: orderData.id,
                handler: async function (response: RazorpayPaymentData) {
                    try {
                        // Verify payment with backend
                        const verifyResponse = await fetch(`${backendUrl}/verify-payment`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyResult = await verifyResponse.json();

                        if (verifyResult.success) {
                            // Payment verified successfully
                            const bookingData: BookingData = {
                                bookingReference: generateBookingReference(),
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                amount: totalAmount,
                                status: 'success',
                                timestamp: new Date().toISOString()
                            };

                            toast.success('Payment successful! Booking confirmed.');
                            onPaymentSuccess(bookingData);
                            onClose();
                        } else {
                            toast.error('Payment verification failed. Please contact support.');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: 'Customer Name',
                    email: 'customer@example.com',
                    contact: '9999999999'
                },
                notes: {
                    provider: quote.provider,
                    origin: shipmentDetails.origin,
                    destination: shipmentDetails.destination,
                    weight: shipmentDetails.weight
                },
                theme: {
                    color: '#8B5CF6'
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        toast.info('Payment cancelled');
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                setIsProcessing(false);
                toast.error(`Payment failed: ${response.error.description}`);
            });

            rzp.open();
        } catch (error) {
            setIsProcessing(false);
            toast.error('Failed to initiate payment. Please try again.');
            console.error('Payment error:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <CreditCard className="w-6 h-6 text-purple-600" />
                        Complete Payment
                    </DialogTitle>
                    <DialogDescription>
                        Review your booking details and complete the payment to confirm your freight shipment.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Provider Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">{quote.provider}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Route</span>
                            </div>
                            <div className="text-gray-800 font-medium">
                                {shipmentDetails.origin} → {shipmentDetails.destination}
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Transit</span>
                            </div>
                            <div className="text-gray-800 font-medium">{quote.transitTime}</div>

                            <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Weight</span>
                            </div>
                            <div className="text-gray-800 font-medium">{shipmentDetails.weight} lbs</div>
                        </div>

                        <div className="mt-3">
                            <span className="text-sm text-gray-600 mb-2 block">Services:</span>
                            <div className="flex flex-wrap gap-1">
                                {quote.services.map((service, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                        {service}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Payment Breakdown */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">Payment Details</h4>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Base Freight Cost</span>
                                <span className="text-gray-800">₹{baseAmount.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">GST (18%)</span>
                                <span className="text-gray-800">₹{taxAmount.toLocaleString()}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Processing Fee</span>
                                <span className="text-gray-800">₹{processingFee}</span>
                            </div>

                            <Separator />

                            <div className="flex justify-between font-semibold text-lg">
                                <span className="text-gray-800">Total Amount</span>
                                <span className="text-purple-600">₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span>Secured by Razorpay • 256-bit SSL encryption</span>
                    </div>

                    {/* Payment Button */}
                    <Button
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Pay ₹{totalAmount.toLocaleString()}
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                        By proceeding, you agree to our terms and conditions
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;