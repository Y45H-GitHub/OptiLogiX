import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LogisticsPage from '../../pages/LogisticsPage';

// Mock the services
vi.mock('../../services/logisticsService', () => ({
    logisticsService: {
        getOrders: vi.fn(() => Promise.resolve([])),
        getOrderStats: vi.fn(() => Promise.resolve({
            totalOrders: 0,
            pendingOrders: 0,
            inTransitOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            averageDeliveryTime: 0,
            onTimeDeliveryRate: 0
        })),
        getCancelledOrdersForApproval: vi.fn(() => Promise.resolve([])),
        getOrderById: vi.fn(() => Promise.resolve(null)),
        updateOrderStatus: vi.fn(() => Promise.resolve(null)),
        approveCancellation: vi.fn(() => Promise.resolve()),
        rejectCancellation: vi.fn(() => Promise.resolve())
    }
}));

vi.mock('../../services/becknTrackingService', () => ({
    becknTrackingService: {
        trackOrder: vi.fn(() => Promise.resolve(null)),
        subscribeToUpdates: vi.fn(),
        unsubscribeFromUpdates: vi.fn()
    }
}));

vi.mock('../../services/becknDemoService', () => ({
    becknDemoService: {
        isDemoModeActive: vi.fn(() => false),
        toggleDemoMode: vi.fn(() => true),
        getDemoStatusInfo: vi.fn(() => ({
            isDemoMode: false,
            activeSimulations: 0,
            cachedOrders: []
        }))
    }
}));

vi.mock('../../hooks/useLogisticsMap', () => ({
    useLogisticsMap: vi.fn(() => ({
        mapRef: { current: null }
    }))
}));

describe('LogisticsPage Render Test', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders LogisticsPage without crashing', async () => {
        render(
            <BrowserRouter>
                <LogisticsPage />
            </BrowserRouter>
        );

        // Wait for the loading to complete
        await waitFor(() => {
            expect(screen.getByText('Logistics Dashboard')).toBeInTheDocument();
        });

        // Check if the description is rendered
        expect(screen.getByText('Manage orders, track shipments, and monitor logistics operations')).toBeInTheDocument();

        // Check if the demo toggle is rendered
        expect(screen.getByText('Demo Mode OFF')).toBeInTheDocument();
    });

    test('renders all tabs correctly', async () => {
        render(
            <BrowserRouter>
                <LogisticsPage />
            </BrowserRouter>
        );

        // Wait for the loading to complete and check for tab buttons specifically
        await waitFor(() => {
            expect(screen.getByRole('tab', { name: 'Order History' })).toBeInTheDocument();
        });
        expect(screen.getByRole('tab', { name: 'Check Order' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Track Order' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Update Status' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /Approvals/ })).toBeInTheDocument();
    });
});