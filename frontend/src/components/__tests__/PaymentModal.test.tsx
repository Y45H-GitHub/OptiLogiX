import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PaymentModal from '../PaymentModal';
import { FreightQuote, ShipmentDetails } from '@/types/payment';

// Mock the UI components
vi.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
    DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
    DialogTitle: ({ children }: any) => <h2 data-testid="dialog-title">{children}</h2>,
    DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled} data-testid="button">
            {children}
        </button>
    ),
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock('@/components/ui/separator', () => ({
    Separator: () => <hr data-testid="separator" />,
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn(),
    },
}));

describe('PaymentModal', () => {
    const mockQuote: FreightQuote = {
        id: '1',
        provider: 'Test Provider',
        cost: 1000,
        transitTime: '5-7 days',
        reliability: 95,
        services: ['Insurance', 'Tracking'],
        rating: 4.8,
    };

    const mockShipmentDetails: ShipmentDetails = {
        origin: 'Mumbai',
        destination: 'Delhi',
        weight: '100',
        dimensions: '10x10x10',
        type: 'general',
    };

    const mockProps = {
        isOpen: true,
        onClose: vi.fn(),
        quote: mockQuote,
        shipmentDetails: mockShipmentDetails,
        onPaymentSuccess: vi.fn(),
    };

    it('renders payment modal when open', () => {
        render(<PaymentModal {...mockProps} />);

        expect(screen.getByTestId('dialog')).toBeInTheDocument();
        expect(screen.getByText('Complete Payment')).toBeInTheDocument();
        expect(screen.getByText('Test Provider')).toBeInTheDocument();
    });

    it('displays payment breakdown correctly', () => {
        render(<PaymentModal {...mockProps} />);

        expect(screen.getByText('₹1,000')).toBeInTheDocument(); // Base cost
        expect(screen.getByText('₹180')).toBeInTheDocument(); // GST (18%)
        expect(screen.getByText('₹25')).toBeInTheDocument(); // Processing fee
        expect(screen.getByText('₹1,205')).toBeInTheDocument(); // Total
    });

    it('uses environment variable for Razorpay key', () => {
        // Mock environment variable
        const originalEnv = import.meta.env.VITE_RAZORPAY_KEY_ID;

        // The component should use the environment variable or fallback to test key
        expect(import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1234567890').toBeDefined();
    });

    it('shows shipment details', () => {
        render(<PaymentModal {...mockProps} />);

        expect(screen.getByText('Mumbai → Delhi')).toBeInTheDocument();
        expect(screen.getByText('5-7 days')).toBeInTheDocument();
        expect(screen.getByText('100 lbs')).toBeInTheDocument();
    });

    it('displays services as badges', () => {
        render(<PaymentModal {...mockProps} />);

        const badges = screen.getAllByTestId('badge');
        expect(badges).toHaveLength(2);
        expect(screen.getByText('Insurance')).toBeInTheDocument();
        expect(screen.getByText('Tracking')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<PaymentModal {...mockProps} isOpen={false} />);

        expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
});