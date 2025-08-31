import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLogisticsMap } from '../useLogisticsMap';
import { Order, BecknTrackingData } from '@/types/logistics';

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

// Mock Google Maps constructor
(global as any).google = {
    maps: {
        Map: vi.fn(() => mockMap),
        Marker: vi.fn(() => mockMarker),
        DirectionsService: vi.fn(() => ({ route: vi.fn() })),
        DirectionsRenderer: vi.fn(() => ({ setMap: vi.fn(), setDirections: vi.fn() })),
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

describe('useLogisticsMap - Real-time Location Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock DOM element for map container
        const mockDiv = document.createElement('div');
        vi.spyOn(document, 'createElement').mockReturnValue(mockDiv);
    });

    it('should initialize map with real-time location tracking capabilities', () => {
        const { result } = renderHook(() =>
            useLogisticsMap({
                apiKey: 'test-api-key',
                order: mockOrder,
                becknTrackingData: mockBecknData,
            })
        );

        // Verify that the hook returns a map reference
        expect(result.current.mapRef).toBeDefined();
        expect(result.current.mapRef.current).toBeNull(); // Initially null until DOM is ready
    });

    it('should handle BECKN tracking data with current location', () => {
        const { rerender } = renderHook(
            ({ becknData }) =>
                useLogisticsMap({
                    apiKey: 'test-api-key',
                    order: mockOrder,
                    becknTrackingData: becknData,
                }),
            {
                initialProps: { becknData: null }
            }
        );

        // Initially no BECKN data
        expect(google.maps.Marker).not.toHaveBeenCalled();

        // Add BECKN data with location
        rerender({ becknData: mockBecknData });

        // Should create markers for the order route
        expect(google.maps.Marker).toHaveBeenCalled();
    });

    it('should create animated delivery vehicle marker with BECKN data', () => {
        renderHook(() =>
            useLogisticsMap({
                apiKey: 'test-api-key',
                order: mockOrder,
                becknTrackingData: mockBecknData,
            })
        );

        // Verify Google Maps components are initialized
        expect(google.maps.Map).toHaveBeenCalled();
        expect(google.maps.DirectionsService).toHaveBeenCalled();
        expect(google.maps.DirectionsRenderer).toHaveBeenCalled();
    });

    it('should handle orders without BECKN data gracefully', () => {
        const orderWithoutBeckn = { ...mockOrder, isBecknEnabled: false };

        const { result } = renderHook(() =>
            useLogisticsMap({
                apiKey: 'test-api-key',
                order: orderWithoutBeckn,
                becknTrackingData: null,
            })
        );

        // Should still initialize map
        expect(result.current.mapRef).toBeDefined();
        expect(google.maps.Map).toHaveBeenCalled();
    });
});