import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SurplusRescueNetworkDashboard from '../SurplusRescueNetworkDashboard';
import { surplusNetworkService } from '../../services/surplusNetworkService';

// Mock the surplus network service
vi.mock('../../services/surplusNetworkService', () => ({
    surplusNetworkService: {
        getNetworkAnalytics: vi.fn(),
        getSurplusInventory: vi.fn(),
        getInventoryRequests: vi.fn(),
    },
}));

const mockAnalytics = {
    totalItemsShared: 156,
    totalItemsReceived: 89,
    totalCostSavings: 45230.50,
    averageResponseTime: 2.4,
    successfulTransfers: 134,
    networkReputationScore: 4.6,
    monthlyTrends: [
        { month: 'Jan 2024', itemsShared: 23, itemsReceived: 15, costSavings: 8450.00 },
        { month: 'Feb 2024', itemsShared: 31, itemsReceived: 22, costSavings: 12340.25 },
        { month: 'Mar 2024', itemsShared: 28, itemsReceived: 18, costSavings: 9890.75 }
    ]
};

const mockInventory = [
    {
        id: 'surplus-1',
        participantId: 'participant-1',
        sku: 'LAPTOP-DEL-001',
        productName: 'Dell Latitude 5520 Laptops',
        description: 'Business laptops with Intel i5, 8GB RAM, 256GB SSD',
        category: 'Electronics',
        quantityAvailable: 25,
        unitPrice: 650.00,
        condition: 'like_new' as const,
        location: 'San Francisco, CA',
        images: ['/images/dell-laptop.jpg'],
        status: 'available' as const,
        createdAt: new Date('2024-02-15'),
        updatedAt: new Date('2024-02-15')
    }
];

const mockRequests = [
    {
        id: 'request-1',
        requesterId: 'participant-2',
        surplusItemId: 'surplus-1',
        requestedQuantity: 10,
        urgencyLevel: 'medium' as const,
        deliveryPreference: 'Standard shipping within 5-7 business days',
        notes: 'Need for new employee onboarding program',
        status: 'pending' as const,
        createdAt: new Date('2024-03-06'),
        updatedAt: new Date('2024-03-06')
    }
];

describe('SurplusRescueNetworkDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementations
        (surplusNetworkService.getNetworkAnalytics as any).mockResolvedValue(mockAnalytics);
        (surplusNetworkService.getSurplusInventory as any).mockResolvedValue(mockInventory);
        (surplusNetworkService.getInventoryRequests as any).mockResolvedValue(mockRequests);
    });

    it('renders loading state initially', () => {
        render(<SurplusRescueNetworkDashboard />);

        // Should show loading skeleton
        const loadingCards = document.querySelectorAll('.animate-pulse');
        expect(loadingCards.length).toBeGreaterThan(0);
    });

    it('displays key metrics cards after loading', async () => {
        render(<SurplusRescueNetworkDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Total Items Listed')).toBeInTheDocument();
            expect(screen.getByText('Items Rescued')).toBeInTheDocument();
            expect(screen.getByText('Cost Savings')).toBeInTheDocument();
            expect(screen.getByText('Active Requests')).toBeInTheDocument();
        });

        // Check metric values
        expect(screen.getByText('156')).toBeInTheDocument(); // Total Items Listed
        expect(screen.getByText('89')).toBeInTheDocument(); // Items Rescued
        expect(screen.getByText('$45,231')).toBeInTheDocument(); // Cost Savings
        expect(screen.getByText('1')).toBeInTheDocument(); // Active Requests
    });

    it('displays quick action buttons', async () => {
        render(<SurplusRescueNetworkDashboard />);

        await waitFor(() => {
            expect(screen.getByText('List Surplus')).toBeInTheDocument();
            expect(screen.getByText('Browse Network')).toBeInTheDocument();
        });
    });

    it('shows recent surplus listings', async () => {
        render(<SurplusRescueNetworkDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Recent Surplus Listings')).toBeInTheDocument();
            expect(screen.getByText('Dell Latitude 5520 Laptops')).toBeInTheDocument();
            expect(screen.getByText('Electronics')).toBeInTheDocument();
            expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
        });
    });

    it('shows active requests', async () => {
        render(<SurplusRescueNetworkDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Active Requests')).toBeInTheDocument();
            expect(screen.getByText('MEDIUM')).toBeInTheDocument(); // Urgency level
            expect(screen.getByText('PENDING')).toBeInTheDocument(); // Status
        });
    });

    it('shows recent network activity', async () => {
        render(<SurplusRescueNetworkDashboard />);

        await waitFor(() => {
            expect(screen.getByText('Recent Network Activity')).toBeInTheDocument();
            expect(screen.getByText('Match Found!')).toBeInTheDocument();
            expect(screen.getByText('New Listing Added')).toBeInTheDocument();
            expect(screen.getByText('Request Pending')).toBeInTheDocument();
        });
    });

    it('handles empty data gracefully', async () => {
        // Mock empty responses
        (surplusNetworkService.getSurplusInventory as any).mockResolvedValue([]);
        (surplusNetworkService.getInventoryRequests as any).mockResolvedValue([]);

        render(<SurplusRescueNetworkDashboard />);

        await waitFor(() => {
            expect(screen.getByText('No recent listings available')).toBeInTheDocument();
            expect(screen.getByText('No active requests')).toBeInTheDocument();
        });
    });

    it('handles service errors gracefully', async () => {
        // Mock service errors
        (surplusNetworkService.getNetworkAnalytics as any).mockRejectedValue(new Error('Service error'));
        (surplusNetworkService.getSurplusInventory as any).mockRejectedValue(new Error('Service error'));
        (surplusNetworkService.getInventoryRequests as any).mockRejectedValue(new Error('Service error'));

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(<SurplusRescueNetworkDashboard />);

        await waitFor(() => {
            // Should still render the component structure even with errors
            expect(screen.getByText('Total Items Listed')).toBeInTheDocument();
        });

        consoleSpy.mockRestore();
    });
});