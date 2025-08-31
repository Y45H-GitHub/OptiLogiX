
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BecknLiveIndicator from '../BecknLiveIndicator';
import { BecknTrackingData } from '@/types/logistics';
import { becknDemoService } from '@/services/becknDemoService';

// Mock the demo service
vi.mock('@/services/becknDemoService', () => ({
    becknDemoService: {
        isDemoModeActive: vi.fn()
    }
}));

describe('BecknLiveIndicator', () => {
    const mockBecknData: BecknTrackingData = {
        orderId: 'ORD-001',
        becknTransactionId: 'BECKN-TXN-001',
        status: 'in_transit',
        deliveryPartner: {
            id: 'DP-001',
            name: 'John Doe',
            phone: '+1-555-0123',
            rating: 4.8,
            vehicle: {
                type: 'Motorcycle',
                number: 'ABC-123'
            }
        },
        currentLocation: {
            latitude: 37.7749,
            longitude: -122.4194,
            address: 'San Francisco, CA',
            timestamp: new Date().toISOString()
        },
        estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        trackingHistory: [],
        lastUpdated: new Date().toISOString()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (becknDemoService.isDemoModeActive as any).mockReturnValue(false);
    });

    it('renders nothing when no BECKN data provided', () => {
        const { container } = render(<BecknLiveIndicator becknData={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders compact variant correctly', () => {
        render(<BecknLiveIndicator becknData={mockBecknData} variant="compact" />);

        expect(screen.getByText('BECKN Live')).toBeInTheDocument();
    });

    it('renders demo mode indicator when demo is active', () => {
        (becknDemoService.isDemoModeActive as any).mockReturnValue(true);

        render(<BecknLiveIndicator becknData={mockBecknData} variant="compact" />);

        expect(screen.getByText('BECKN Demo Live')).toBeInTheDocument();
    });

    it('renders banner variant with full status', () => {
        render(<BecknLiveIndicator becknData={mockBecknData} variant="banner" />);

        expect(screen.getByText('Live BECKN Tracking Active')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText(/Location:/)).toBeInTheDocument();
        expect(screen.getByText(/Updated:/)).toBeInTheDocument();
    });

    it('renders detailed variant with comprehensive status', () => {
        render(<BecknLiveIndicator becknData={mockBecknData} variant="detailed" />);

        expect(screen.getByText('Live BECKN Tracking')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('in transit')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows demo mode notice in detailed variant when demo active', () => {
        (becknDemoService.isDemoModeActive as any).mockReturnValue(true);

        render(<BecknLiveIndicator becknData={mockBecknData} variant="detailed" />);

        expect(screen.getByText('BECKN Demo Tracking')).toBeInTheDocument();
        expect(screen.getByText(/Demo mode active with live location simulation/)).toBeInTheDocument();
    });

    it('displays transaction ID in detailed variant', () => {
        render(<BecknLiveIndicator becknData={mockBecknData} variant="detailed" />);

        expect(screen.getByText(/ID:.*TXN-001/)).toBeInTheDocument();
    });

    it('handles missing optional data gracefully', () => {
        const minimalData: BecknTrackingData = {
            orderId: 'ORD-002',
            becknTransactionId: 'BECKN-TXN-002',
            status: 'order_placed',
            estimatedDelivery: new Date().toISOString(),
            trackingHistory: [],
            lastUpdated: new Date().toISOString()
        };

        render(<BecknLiveIndicator becknData={minimalData} variant="detailed" />);

        expect(screen.getByText('Live BECKN Tracking')).toBeInTheDocument();
        expect(screen.getByText('order placed')).toBeInTheDocument();
    });
});