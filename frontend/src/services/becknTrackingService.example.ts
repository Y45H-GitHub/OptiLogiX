/**
 * Example usage of BecknTrackingService
 * This file demonstrates how to integrate the BECKN tracking service
 * with existing logistics functionality
 */

import { becknTrackingService } from './becknTrackingService';
import { logisticsService } from './logisticsService';
import { Order } from '@/types/logistics';

/**
 * Enhanced order tracking that combines BECKN data with existing logistics data
 * This demonstrates the hybrid approach mentioned in requirements 1.1 and 1.3
 */
export async function getEnhancedOrderTracking(orderId: string): Promise<Order | null> {
    try {
        // Get base order data from existing logistics service
        const baseOrder = await logisticsService.getOrderById(orderId);
        if (!baseOrder) {
            return null;
        }

        // Try to enhance with BECKN tracking data
        const becknData = await becknTrackingService.trackOrder(orderId);

        if (becknData) {
            // Successfully got BECKN data - enhance the order
            return {
                ...baseOrder,
                becknData,
                isBecknEnabled: true,
                // Update status if BECKN provides more recent information
                status: mapBecknStatusToOrderStatus(becknData.status) || baseOrder.status,
                // Use BECKN estimated delivery if available
                estimatedDelivery: becknData.estimatedDelivery || baseOrder.estimatedDelivery,
                actualDelivery: becknData.actualDelivery || baseOrder.actualDelivery
            };
        } else {
            // No BECKN data available - return base order with BECKN disabled
            return {
                ...baseOrder,
                isBecknEnabled: false,
                becknFallbackReason: 'BECKN service unavailable'
            };
        }
    } catch (error) {
        console.error('Error getting enhanced order tracking:', error);

        // Fallback to base order data
        const baseOrder = await logisticsService.getOrderById(orderId);
        if (baseOrder) {
            return {
                ...baseOrder,
                isBecknEnabled: false,
                becknFallbackReason: 'BECKN integration error'
            };
        }

        return null;
    }
}

/**
 * Subscribe to real-time order updates
 * Implements requirement 1.4: Automatic refresh without page reload
 */
export function subscribeToOrderUpdates(
    orderId: string,
    onUpdate: (order: Order) => void
): () => void {
    const handleBecknUpdate = async () => {
        const enhancedOrder = await getEnhancedOrderTracking(orderId);
        if (enhancedOrder) {
            onUpdate(enhancedOrder);
        }
    };

    // Subscribe to BECKN updates
    becknTrackingService.subscribeToUpdates(orderId, handleBecknUpdate);

    // Return unsubscribe function
    return () => {
        becknTrackingService.unsubscribeFromUpdates(orderId);
    };
}

/**
 * Check if BECKN tracking is available for an order
 * Useful for UI to show BECKN-specific features
 */
export async function checkBecknAvailability(orderId: string): Promise<boolean> {
    return await becknTrackingService.isBecknAvailable(orderId);
}

/**
 * Get delivery partner information with fallback
 * Implements requirement 2.1: Display BECKN delivery partner details
 */
export async function getDeliveryPartnerInfo(orderId: string) {
    const becknPartner = await becknTrackingService.getDeliveryPartner(orderId);

    if (becknPartner) {
        return {
            type: 'beckn',
            partner: becknPartner,
            // Additional BECKN-specific features
            hasRealTimeLocation: true,
            hasDirectContact: true,
            hasRating: true
        };
    }

    // Fallback to existing travel company info
    const order = await logisticsService.getOrderById(orderId);
    if (order) {
        return {
            type: 'traditional',
            company: order.travelCompany,
            deliveryId: order.deliveryId,
            hasRealTimeLocation: false,
            hasDirectContact: false,
            hasRating: false
        };
    }

    return null;
}

/**
 * Get real-time location for map display
 * Implements requirement 3.1: Display real-time delivery vehicle location
 */
export async function getDeliveryLocation(orderId: string) {
    const becknLocation = await becknTrackingService.getCurrentLocation(orderId);

    if (becknLocation) {
        return {
            type: 'real-time',
            location: becknLocation,
            accuracy: becknLocation.accuracy || 10,
            lastUpdated: becknLocation.timestamp
        };
    }

    // Fallback to transit hop data
    const order = await logisticsService.getOrderById(orderId);
    if (order && order.transitHops.length > 0) {
        const currentHop = order.transitHops
            .filter(hop => hop.status === 'arrived' || hop.status === 'departed')
            .pop();

        if (currentHop) {
            return {
                type: 'estimated',
                location: {
                    latitude: currentHop.location.coordinates.lat,
                    longitude: currentHop.location.coordinates.lng,
                    address: currentHop.location.address,
                    timestamp: currentHop.arrivalTime
                },
                accuracy: 1000, // Less accurate
                lastUpdated: currentHop.arrivalTime
            };
        }
    }

    return null;
}

/**
 * Map BECKN order status to internal order status
 * Ensures compatibility between BECKN and existing status systems
 */
function mapBecknStatusToOrderStatus(becknStatus: string): string | null {
    const statusMap: Record<string, string> = {
        'order_placed': 'pending',
        'order_confirmed': 'confirmed',
        'partner_assigned': 'processing',
        'picked_up': 'shipped',
        'in_transit': 'in_transit',
        'out_for_delivery': 'out_for_delivery',
        'delivered': 'delivered',
        'cancelled': 'cancelled',
        'returned': 'returned'
    };

    return statusMap[becknStatus] || null;
}

/**
 * Batch check BECKN availability for multiple orders
 * Useful for dashboard views with multiple orders
 */
export async function batchCheckBecknAvailability(orderIds: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    // Check availability for all orders in parallel
    const checks = orderIds.map(async (orderId) => {
        const available = await becknTrackingService.isBecknAvailable(orderId);
        results[orderId] = available;
    });

    await Promise.all(checks);
    return results;
}

/**
 * Get comprehensive tracking data for dashboard display
 * Combines all BECKN features for a complete tracking view
 */
export async function getComprehensiveTrackingData(orderId: string) {
    const [
        enhancedOrder,
        deliveryPartner,
        currentLocation,
        isBecknAvailable
    ] = await Promise.all([
        getEnhancedOrderTracking(orderId),
        getDeliveryPartnerInfo(orderId),
        getDeliveryLocation(orderId),
        checkBecknAvailability(orderId)
    ]);

    return {
        order: enhancedOrder,
        deliveryPartner,
        currentLocation,
        isBecknAvailable,
        features: {
            realTimeTracking: isBecknAvailable,
            deliveryPartnerInfo: deliveryPartner?.type === 'beckn',
            liveLocation: currentLocation?.type === 'real-time',
            directContact: deliveryPartner?.hasDirectContact || false
        }
    };
}