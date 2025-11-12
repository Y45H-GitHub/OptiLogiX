# Design Document

## Overview

The Razorpay payment integration will add a seamless payment flow to the existing FreightQuoteAggregator component. The design focuses on simplicity and quick implementation suitable for hackathon demonstration, using Razorpay's web SDK for frontend integration with mock backend responses.

## Architecture

### Frontend Components
- **PaymentModal**: Modal component that handles Razorpay payment flow
- **BookingConfirmation**: Success screen showing booking details
- **PaymentService**: Service layer for payment processing and order management

### Integration Points
- Razorpay Web SDK for payment processing
- Existing FreightQuoteAggregator component for quote selection
- Toast notifications for user feedback

## Components and Interfaces

### PaymentModal Component
```typescript
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: FreightQuote;
  shipmentDetails: ShipmentDetails;
  onPaymentSuccess: (bookingData: BookingData) => void;
}
```

### Payment Service
```typescript
interface PaymentService {
  createOrder(amount: number, currency: string): Promise<OrderData>;
  processPayment(paymentData: RazorpayPaymentData): Promise<BookingData>;
  generateBookingReference(): string;
}
```

### Data Models
```typescript
interface OrderData {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

interface BookingData {
  bookingReference: string;
  paymentId: string;
  orderId: string;
  amount: number;
  status: 'success' | 'failed';
  timestamp: string;
}
```

## Error Handling

### Payment Failures
- Network errors: Show retry option with clear error message
- Payment declined: Display Razorpay's error message and allow retry
- Invalid payment data: Show validation errors and prevent submission

### User Experience
- Loading states during payment processing
- Clear success/failure feedback
- Graceful modal dismissal on errors

## Testing Strategy

### Unit Tests
- PaymentModal component rendering and interactions
- PaymentService methods for order creation and processing
- Error handling scenarios

### Integration Tests
- End-to-end payment flow from quote selection to booking confirmation
- Razorpay SDK integration and callback handling

### Demo Considerations
- Use Razorpay test mode with test keys
- Mock successful payments for reliable demo experience
- Include sample booking references and transaction IDs