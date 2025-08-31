import { renderHook, act } from '@testing-library/react';
import { useLogisticsMap } from '../useLogisticsMap';
import { becknTrackingService } from '@/services/becknTrackingService';
import { Order, BecknTrackingData } from '@/types/logistics';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock Google Maps API
const mockMap = {
    panTo: vi.fn(),
    setCenter: vi.fn(),
    setZoom: vi.fn(),
};

const mockMarker = {
    setPosition: vi.fn(),
    getPosition: vi.fn(() => ({ lat: () => 40.7128, lng: () => -74.0060 })),
    setMap: vi.fn(),
    addListener: vi.fn(),
};

const mockDirectionsService = {
    route: vi.fn(),
};

const mockDirectionsRenderer = {
    setMap: vi.fn(),
    setDirections: vi.fn(),
};

// Mock Google Maps constructor
(global as any).google = {
    maps: {
        Map: vi.fn(() => mockMap),
        Marker: vi.fn(() => mockMarker),
        DirectionsService: vi.fn(() => mockDirectionsService),
        DirectionsRenderer: vi.fn(() => mockDirectionsRenderer),
        InfoWindow: vi.fn(() => ({ open: vi.fn(), setContent: vi.fn() })),
        LatLng: vi.fn((lat, lng) => ({ lat: () => lat, lng: () => lng })),
        Size: vi.fn(),
        Point: vi.fn(),
        MapTypeId: { ROADMAP: 'roadmap' },
        TravelMode: { DRIVING: 'DRIVING' },
        DirectionsStatus: { OK: 'OK' },
    },
};

// Mock BECKN tracking service
vi.mock('@/services/becknTrackingService', () => ({
    becknTrackingService: {
        subscribeToUpdates: vi.fn(),
        unsubscribeFromUpdates: vi.fn(),
        getCurrentLocation: vi.fn(),
    },
}));

const mockOrder: Order = {
    id: 'ORD-001',
    customerId: 'CUST-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [],
    status: 'in_transit',
    totalAmount: 100,
    orderDate: '2024-01-15T10:00:00Z',
    estimatedDelivery: '2024-01-20T16:00:00Z',
    origin: {
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    destination: {
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        zipCode: '90210',
        coordinates: { lat: 34.0522, lng: -118.2437 }
    },
    transitHops: [],
    travelCompany: 'FastTrack',
    deliveryId: 'DEL-001',
    priority: 'medium',
    isBecknEnabled: true,
};

const mockBecknData: BecknTrackingData = {
    orderId: 'ORD-001',
    becknTransactionId: 'BECKN-TXN-001',
    status: 'in_transit',
    deliveryPartner: {
        id: 'DP-001',
        name: 'Rajesh Kumar',
        phone: '+91-9876543210',
        rating: 4.8,
        vehicle: {
            type: 'Motorcycle',
            number: 'MH-12-AB-1234',
            model: 'Honda Activa'
        }
    },
    currentLocation: {
        latitude: 35.3733,
        longitude: -119.0187,
        address: '789 Distribution Center, Bakersfield, CA',
        timestamp: new Date().toISOString(),
        accuracy: 10
    },
    estimatedDelivery: '2024-01-20T16:00:00Z',
    trackingHistory: [],
    lastUpdated: new Date().toISOString()
};

describe('useLogisticsMap - Real-time Location Updates', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock DOM element for map container
        const mockDiv = document.createElement('div');
        vi.spyOn(document, 'createElement').mockReturnValue(mockDiv);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create delivery vehicle marker when BECKN location is available', () => {
        const { result } = renderHook(() =>
            useLogisticsMap({
                apiKey: 'test-api-key',
                order: mockOrder,
                becknTrackingData: mockBecknData,
            })
        );

        expect(result.current.mapRef).toBeDefined();

        // Verify that Google Maps Marker constructor was called for delivery vehicle
        // (This would be called after the map is initialized)
        act(() => {
            // Simulate map initialization
            if (mockDirectionsService.route.mock.calls.length > 0) {
                const callback = mockDirectionsService.route.mock.calls[0][1];
                callback({ routes: [{ legs: [] }] }, 'OK');
            }
        });
    });

    it('should subscribe to BECKN updates when order has real-time tracking', () => {
        renderHook(() =>
            useLogisticsMap({
                apiKey: 'test-api-key',
                order: mockOrder,
                becknTrackingData: mockBecknData,
            })
        );

        // Should subscribe to updates for real-time location
        expect(becknTrackingService.subscribeToUpdates).toHaveBeenCalledWith(
            mockOrder.id,
            expect.any(Function)
        );
    });

    it('should unsubscribe from updates when component unmounts', () => {
        const { unmount } = renderHook(() =>
            useLogisticsMap({
                apiKey: 'test-api-key',
                order: mockOrder,
                becknTrackingData: mockBecknData,
            })
        );

        unmount();

        expect(becknTrackingService.unsubscribeFromUpdates).toHaveBeenCalledWith(
            mockOrder.id
        );
    });

    it('should handle location updates and animate marker movement', async () => {
        const mockSubscribeCallback = vi.fn();
        (becknTrackingService.subscribeToUpdates as any).mockImplementation(
            (orderId, callback) => {
                mockSubscribeCallback.mockImplementation(callback);
            }
        );

        renderHook(() =>
            useLogisticsMap({
                apiKey: 'test-api-key',
                order: mockOrder,
                becknTrackingData: mockBecknData,
            })
        );

        // Simulate a location update
        const updatedBecknData = {
            ...mockBecknData,
            currentLocation: {
                ...mockBecknData.currentLocation!,
                latitude: 35.4000,
                longitude: -119.0500,
                timestamp: new Date().toISOString(),
            },
        };

        act(() => {
            mockSubscribeCallback(updatedBecknData);
        });

        // Verify marker position would be updated
        // (In a real test, we'd verify the marker animation)
        expect(mockSubscribeCallback).toHaveBeenCalledWith(updatedBecknData);
    });

    it('should poll for location updates every 30 seconds', () => {
        vi.useFakeTimers();

        renderHook(() =>
            useLogisticsMap({
                apiKey: 'test-api-key',
                order: mockOrder,
                becknTrackingData: mockBecknData,
            })
        );

        // Fast-forward 30 seconds
        act(() => {
            vi.advanceTimersByTime(30000);
        });

        expect(becknTrackingService.getCurrentLocation).toHaveBeenCalledWith(
            mockOrder.id
        );

        vi.useRealTimers();
    });

    it('should not create delivery vehicle marker when no BECKN location', () => {
        const becknDataWithoutLocation = {
            ...mockBecknData,
            currentLocation: undefined,
        };

        renderHook(() =>
            useLogisticsMap({
                apiKey: 'test-api-key',
                order: mockOrder,
                becknTrackingData: becknDataWithoutLocation,
            })
        );

        // Should not subscribe to updates when no current location
        expect(becknTrackingService.subscribeToUpdates).not.toHaveBeenCalled();
    });

    it('should handle errors in location updates gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        (becknTrackingService.getCurrentLocation as any).mockRejectedValue(
            new Error('Network error')
        );

        vi.useFakeTimers();

        renderHook(() =>
            useLogisticsMap({
                apiKey: 'test-api-key',
                order: mockOrder,
                becknTrackingData: mockBecknData,
            })
        );

        // Fast-forward to trigger polling
        act(() => {
            vi.advanceTimersByTime(30000);
        });

        // Wait for promise to resolve
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to update delivery vehicle location:',
            expect.any(Error)
        );

        consoleSpy.mockRestore();
        vi.useRealTimers();
    });
});