import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { becknTrackingService, BecknApiError, BecknTimeoutError } from '../becknTrackingService';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BecknTrackingService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        becknTrackingService.cleanup();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('trackOrder', () => {
        it('should return BECKN tracking data for valid order', async () => {
            const mockResponse = {
                orderId: 'ORD-001',
                becknTransactionId: 'BECKN-TXN-001',
                status: 'in_transit',
                lastUpdated: new Date().toISOString()
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await becknTrackingService.trackOrder('ORD-001');

            expect(result).toBeDefined();
            expect(result?.orderId).toBe('ORD-001');
            expect(result?.status).toBe('in_transit');
        });

        it('should return fallback data when API fails', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await becknTrackingService.trackOrder('ORD-001');

            expect(result).toBeDefined();
            expect(result?.orderId).toBe('ORD-001');
            expect(result?.becknTransactionId).toBe('BECKN-TXN-001');
        });

        it('should return null for unknown orders when API fails', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await becknTrackingService.trackOrder('UNKNOWN-ORDER');

            expect(result).toBeNull();
        });

        it('should use cached data within TTL', async () => {
            const mockResponse = {
                orderId: 'ORD-001',
                becknTransactionId: 'BECKN-TXN-001',
                status: 'in_transit',
                lastUpdated: new Date().toISOString()
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            // First call should fetch from API
            const result1 = await becknTrackingService.trackOrder('ORD-001');
            expect(mockFetch).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const result2 = await becknTrackingService.trackOrder('ORD-001');
            expect(mockFetch).toHaveBeenCalledTimes(1); // No additional API call
            expect(result1).toEqual(result2);
        });
    });

    describe('getDeliveryPartner', () => {
        it('should return delivery partner from tracking data', async () => {
            const result = await becknTrackingService.getDeliveryPartner('ORD-001');

            expect(result).toBeDefined();
            expect(result?.name).toBe('Rajesh Kumar');
            expect(result?.phone).toBe('+91-9876543210');
            expect(result?.rating).toBe(4.8);
        });

        it('should return null for orders without delivery partner', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await becknTrackingService.getDeliveryPartner('UNKNOWN-ORDER');

            expect(result).toBeNull();
        });
    });

    describe('getCurrentLocation', () => {
        it('should return current location from tracking data', async () => {
            const result = await becknTrackingService.getCurrentLocation('ORD-001');

            expect(result).toBeDefined();
            expect(result?.latitude).toBe(35.3733);
            expect(result?.longitude).toBe(-119.0187);
            expect(result?.address).toContain('Bakersfield');
        });

        it('should return null for orders without location data', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            const result = await becknTrackingService.getCurrentLocation('UNKNOWN-ORDER');

            expect(result).toBeNull();
        });
    });

    describe('isBecknAvailable', () => {
        it('should return true when BECKN service is available', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ available: true })
            });

            const result = await becknTrackingService.isBecknAvailable('ORD-001');

            expect(result).toBe(true);
        });

        it('should return false when BECKN service is unavailable', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Service unavailable'));

            const result = await becknTrackingService.isBecknAvailable('ORD-001');

            expect(result).toBe(false);
        });
    });

    describe('subscribeToUpdates', () => {
        it('should allow subscribing to order updates', () => {
            const callback = vi.fn();

            expect(() => {
                becknTrackingService.subscribeToUpdates('ORD-001', callback);
            }).not.toThrow();
        });

        it('should allow unsubscribing from order updates', () => {
            const callback = vi.fn();
            becknTrackingService.subscribeToUpdates('ORD-001', callback);

            expect(() => {
                becknTrackingService.unsubscribeFromUpdates('ORD-001');
            }).not.toThrow();
        });
    });

    describe('error handling', () => {
        it('should handle timeout errors gracefully', async () => {
            // Mock a slow response that will timeout
            mockFetch.mockImplementationOnce(() =>
                new Promise((resolve, reject) => {
                    setTimeout(() => reject(new Error('AbortError')), 100);
                })
            );

            const result = await becknTrackingService.trackOrder('ORD-001');

            // Should fallback to mock data
            expect(result).toBeDefined();
            expect(result?.orderId).toBe('ORD-001');
        }, 10000);

        it('should handle HTTP errors gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            const result = await becknTrackingService.trackOrder('ORD-001');

            // Should fallback to mock data
            expect(result).toBeDefined();
            expect(result?.orderId).toBe('ORD-001');
        });
    });
});