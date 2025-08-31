import {
    BecknTrackingData,
    BecknDeliveryPartner,
    BecknLocation
} from '@/types/logistics';
import { becknDemoService } from './becknDemoService';

// Configuration
const BECKN_API_BASE_URL = import.meta.env.VITE_BECKN_API_URL || 'http://localhost:3001';
const API_TIMEOUT = 5000; // 5 seconds as per requirement 6.2
const MAX_RETRY_ATTEMPTS = 3; // As per requirement 6.2

// Error types for better error handling
export class BecknApiError extends Error {
    constructor(message: string, public statusCode?: number) {
        super(message);
        this.name = 'BecknApiError';
    }
}

export class BecknTimeoutError extends Error {
    constructor(message: string = 'BECKN API request timed out') {
        super(message);
        this.name = 'BecknTimeoutError';
    }
}

// Mock data for development and fallback scenarios
const mockBecknData: Record<string, BecknTrackingData> = {
    'ORD-001': {
        orderId: 'ORD-001',
        becknTransactionId: 'BECKN-TXN-001',
        status: 'in_transit',
        deliveryPartner: {
            id: 'DP-001',
            name: 'Rajesh Kumar',
            phone: '+91-9876543210',
            email: 'rajesh.kumar@fasttrack.com',
            rating: 4.8,
            vehicle: {
                type: 'Motorcycle',
                number: 'MH-12-AB-1234',
                model: 'Honda Activa'
            },
            photo: 'https://example.com/photos/rajesh.jpg'
        },
        currentLocation: {
            latitude: 35.3733,
            longitude: -119.0187,
            address: '789 Distribution Center, Bakersfield, CA',
            timestamp: new Date().toISOString(),
            accuracy: 10
        },
        estimatedDelivery: '2024-01-20T16:00:00Z',
        trackingHistory: [
            {
                id: 'EVT-001',
                status: 'order_placed',
                timestamp: '2024-01-15T10:30:00Z',
                description: 'Order placed and confirmed'
            },
            {
                id: 'EVT-002',
                status: 'partner_assigned',
                timestamp: '2024-01-15T11:00:00Z',
                description: 'Delivery partner assigned'
            },
            {
                id: 'EVT-003',
                status: 'picked_up',
                timestamp: '2024-01-16T09:00:00Z',
                description: 'Package picked up from warehouse'
            },
            {
                id: 'EVT-004',
                status: 'in_transit',
                timestamp: '2024-01-16T14:30:00Z',
                location: {
                    latitude: 35.3733,
                    longitude: -119.0187,
                    address: '789 Distribution Center, Bakersfield, CA',
                    timestamp: '2024-01-16T14:30:00Z'
                },
                description: 'Package in transit via Bakersfield hub'
            }
        ],
        lastUpdated: new Date().toISOString()
    },
    'ORD-004': {
        orderId: 'ORD-004',
        becknTransactionId: 'BECKN-TXN-004',
        status: 'out_for_delivery',
        deliveryPartner: {
            id: 'DP-004',
            name: 'Maria Rodriguez',
            phone: '+1-555-0123',
            rating: 4.9,
            vehicle: {
                type: 'Van',
                number: 'TX-789-DEF',
                model: 'Ford Transit'
            }
        },
        currentLocation: {
            latitude: 30.2672,
            longitude: -97.7431,
            address: 'Near 987 Tech Ave, Austin, TX',
            timestamp: new Date().toISOString(),
            accuracy: 5
        },
        estimatedDelivery: '2024-01-22T15:00:00Z',
        trackingHistory: [
            {
                id: 'EVT-005',
                status: 'order_placed',
                timestamp: '2024-01-18T11:20:00Z',
                description: 'Order placed and confirmed'
            },
            {
                id: 'EVT-006',
                status: 'out_for_delivery',
                timestamp: '2024-01-22T08:00:00Z',
                location: {
                    latitude: 30.2672,
                    longitude: -97.7431,
                    address: 'Austin delivery hub',
                    timestamp: '2024-01-22T08:00:00Z'
                },
                description: 'Out for delivery - arriving soon'
            }
        ],
        lastUpdated: new Date().toISOString()
    }
};

/**
 * BECKN Tracking Service
 * Provides real-time order tracking through BECKN protocol with fallback to existing data
 */
class BecknTrackingService {
    private cache = new Map<string, { data: BecknTrackingData; timestamp: number }>();
    private readonly CACHE_TTL = 30000; // 30 seconds cache as per design
    private subscriptions = new Map<string, ((data: BecknTrackingData) => void)[]>();

    /**
     * Track an order using BECKN protocol
     * Implements requirement 1.1: Query BECKN network for real-time order status
     * Implements requirement 1.3: Graceful fallback when BECKN data unavailable
     * Implements task 7: Demo toggle integration
     */
    async trackOrder(orderId: string): Promise<BecknTrackingData | null> {
        try {
            // Check if demo mode is active first
            if (becknDemoService.isDemoModeActive()) {
                const demoData = becknDemoService.getDemoTrackingData(orderId);
                if (demoData) {
                    console.log(`[BECKN] Using demo data for order ${orderId}`);
                    return demoData;
                }
            }

            // Check cache first
            const cached = this.getCachedData(orderId);
            if (cached) {
                console.log(`[BECKN] Using cached data for order ${orderId}`);
                return cached;
            }

            // Attempt to fetch from BECKN API with retry logic
            const becknData = await this.fetchWithRetry(`/beckn/track/${orderId}`);

            if (becknData) {
                // Cache the successful response
                this.cache.set(orderId, {
                    data: becknData,
                    timestamp: Date.now()
                });

                console.log(`[BECKN] Successfully tracked order ${orderId}`);
                return becknData;
            }

            // Fallback to mock data for demo purposes
            return this.getFallbackData(orderId);

        } catch (error) {
            console.warn(`[BECKN] Failed to track order ${orderId}:`, error);

            // Requirement 1.3: Graceful fallback to existing data
            return this.getFallbackData(orderId);
        }
    }

    /**
     * Get delivery partner information for an order
     * Implements requirement 2.1: Display BECKN delivery partner details
     * Implements task 7: Demo mode integration
     */
    async getDeliveryPartner(orderId: string): Promise<BecknDeliveryPartner | null> {
        try {
            const trackingData = await this.trackOrder(orderId);
            return trackingData?.deliveryPartner || null;
        } catch (error) {
            console.warn(`[BECKN] Failed to get delivery partner for order ${orderId}:`, error);
            return null;
        }
    }

    /**
     * Get current location of delivery vehicle
     * Implements requirement 3.1: Display real-time delivery vehicle location
     * Implements task 7: Demo mode with live location simulation
     */
    async getCurrentLocation(orderId: string): Promise<BecknLocation | null> {
        try {
            const trackingData = await this.trackOrder(orderId);
            return trackingData?.currentLocation || null;
        } catch (error) {
            console.warn(`[BECKN] Failed to get current location for order ${orderId}:`, error);
            return null;
        }
    }

    /**
     * Subscribe to real-time updates for an order
     * Implements requirement 1.4: Automatic refresh without page reload
     */
    subscribeToUpdates(orderId: string, callback: (data: BecknTrackingData) => void): void {
        if (!this.subscriptions.has(orderId)) {
            this.subscriptions.set(orderId, []);
        }

        this.subscriptions.get(orderId)!.push(callback);

        // Start polling for updates (in a real implementation, this would use WebSocket)
        this.startPolling(orderId);

        console.log(`[BECKN] Subscribed to updates for order ${orderId}`);
    }

    /**
     * Unsubscribe from real-time updates
     */
    unsubscribeFromUpdates(orderId: string): void {
        this.subscriptions.delete(orderId);
        console.log(`[BECKN] Unsubscribed from updates for order ${orderId}`);
    }

    /**
     * Check if BECKN tracking is available for an order
     */
    async isBecknAvailable(orderId: string): Promise<boolean> {
        try {
            const response = await this.fetchWithTimeout(`/beckn/status/${orderId}`, 2000);
            return response !== null;
        } catch {
            return false;
        }
    }

    /**
     * Private method to fetch data with retry logic
     * Implements requirement 6.2: Exponential backoff retry with max 3 attempts
     */
    private async fetchWithRetry(endpoint: string, attempt = 1): Promise<BecknTrackingData | null> {
        try {
            return await this.fetchWithTimeout(endpoint, API_TIMEOUT);
        } catch (error) {
            if (attempt >= MAX_RETRY_ATTEMPTS) {
                throw error;
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`[BECKN] Retry attempt ${attempt} after ${delay}ms delay`);

            await new Promise(resolve => setTimeout(resolve, delay));
            return this.fetchWithRetry(endpoint, attempt + 1);
        }
    }

    /**
     * Private method to fetch data with timeout
     * Implements requirement 6.2: 5-second timeout with fallback
     */
    private async fetchWithTimeout(endpoint: string, timeout: number): Promise<BecknTrackingData | null> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(`${BECKN_API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new BecknApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
            }

            const data = await response.json();
            return this.transformBecknResponse(data);

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new BecknTimeoutError();
            }

            throw error;
        }
    }

    /**
     * Transform BECKN API response to internal format
     */
    private transformBecknResponse(apiResponse: any): BecknTrackingData {
        // In a real implementation, this would transform the actual BECKN protocol response
        // For now, we'll assume the API returns data in our expected format
        return apiResponse as BecknTrackingData;
    }

    /**
     * Get cached data if available and not expired
     */
    private getCachedData(orderId: string): BecknTrackingData | null {
        const cached = this.cache.get(orderId);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            return cached.data;
        }

        // Remove expired cache entry
        if (cached) {
            this.cache.delete(orderId);
        }

        return null;
    }

    /**
     * Get fallback data for demo and error scenarios
     * Implements requirement 1.3: Fallback to existing data
     */
    private getFallbackData(orderId: string): BecknTrackingData | null {
        const fallbackData = mockBecknData[orderId];
        if (fallbackData) {
            console.log(`[BECKN] Using fallback data for order ${orderId}`);
            return fallbackData;
        }

        console.log(`[BECKN] No fallback data available for order ${orderId}`);
        return null;
    }

    /**
     * Start polling for updates (simplified implementation)
     * In production, this would use WebSocket connections
     */
    private startPolling(orderId: string): void {
        const pollInterval = setInterval(async () => {
            if (!this.subscriptions.has(orderId)) {
                clearInterval(pollInterval);
                return;
            }

            try {
                // Force refresh by clearing cache
                this.cache.delete(orderId);
                const updatedData = await this.trackOrder(orderId);

                if (updatedData) {
                    const callbacks = this.subscriptions.get(orderId) || [];
                    callbacks.forEach(callback => {
                        try {
                            callback(updatedData);
                        } catch (error) {
                            console.error('[BECKN] Error in update callback:', error);
                        }
                    });
                }
            } catch (error) {
                console.warn(`[BECKN] Polling error for order ${orderId}:`, error);
            }
        }, 10000); // Poll every 10 seconds
    }

    /**
     * Clear all caches and subscriptions (useful for cleanup)
     */
    cleanup(): void {
        this.cache.clear();
        this.subscriptions.clear();
        console.log('[BECKN] Service cleanup completed');
    }
}

// Export singleton instance
export const becknTrackingService = new BecknTrackingService();