export interface FreightQuote {
    id: string;
    provider: string;
    cost: number;
    transitTime: string;
    reliability: number;
    services: string[];
    rating: number;
}

export interface ShipmentDetails {
    origin: string;
    destination: string;
    weight: string;
    dimensions: string;
    type: string;
}

export interface OrderData {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
}

export interface BookingData {
    bookingReference: string;
    paymentId: string;
    orderId: string;
    amount: number;
    status: 'success' | 'failed';
    timestamp: string;
}

export interface RazorpayPaymentData {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    quote: FreightQuote;
    shipmentDetails: ShipmentDetails;
    onPaymentSuccess: (bookingData: BookingData) => void;
}

// Razorpay global interface
declare global {
    interface Window {
        Razorpay: any;
    }
}