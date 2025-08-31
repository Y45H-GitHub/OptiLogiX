import {
    BecknTrackingData,
    BecknDeliveryPartner,
    BecknLocation,
    BecknOrderStatus,
    BecknTrackingEvent
} from '@/types/logistics';

/**
 * BECKN Demo Service
 * Manages demo toggle state and provides realistic mock data with live location simulation
 * Implements task 7: Create demo toggle and mock data
 */
class BecknDemoService {
    private isDemoMode = false;
    private locationSimulationIntervals = new Map<string, NodeJS.Timeout>();
    private demoDataCache = new Map<string, BecknTrackingData>();

    /**
     * Toggle demo mode on/off
     */
    toggleDemoMode(): boolean {
        this.isDemoMode = !this.isDemoMode;
        console.log(`[BECKN Demo] Demo mode ${this.isDemoMode ? 'enabled' : 'disabled'}`);

        if (!this.isDemoMode) {
            // Clean up location simulations when demo mode is disabled
            this.stopAllLocationSimulations();
        }

        return this.isDemoMode;
    }

    /**
     * Check if demo mode is active
     */
    isDemoModeActive(): boolean {
        return this.isDemoMode;
    }

    /**
     * Set demo mode state
     */
    setDemoMode(enabled: boolean): void {
        this.isDemoMode = enabled;
        if (!enabled) {
            this.stopAllLocationSimulations();
        }
    }

    /**
     * Get enhanced demo data with live location simulation
     */
    getDemoTrackingData(orderId: string): BecknTrackingData | null {
        if (!this.isDemoMode) {
            return null;
        }

        // Check if we have cached demo data
        if (this.demoDataCache.has(orderId)) {
            return this.demoDataCache.get(orderId)!;
        }

        // Generate new demo data
        const demoData = this.generateRealisticDemoData(orderId);
        if (demoData) {
            this.demoDataCache.set(orderId, demoData);
            this.startLocationSimulation(orderId);
        }

        return demoData;
    }

    /**
     * Generate realistic demo data for different order scenarios
     */
    private generateRealisticDemoData(orderId: string): BecknTrackingData | null {
        const demoScenarios: Record<string, Partial<BecknTrackingData>> = {
            'ORD-001': {
                status: 'in_transit',
                deliveryPartner: {
                    id: 'DP-DEMO-001',
                    name: 'Rajesh Kumar',
                    phone: '+91-9876543210',
                    email: 'rajesh.kumar@fasttrack.com',
                    rating: 4.8,
                    vehicle: {
                        type: 'Motorcycle',
                        number: 'MH-12-AB-1234',
                        model: 'Honda Activa'
                    },
                    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
                },
                currentLocation: {
                    latitude: 35.3733,
                    longitude: -119.0187,
                    address: '789 Distribution Center, Bakersfield, CA',
                    timestamp: new Date().toISOString(),
                    accuracy: 10
                },
                estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
            },
            'ORD-002': {
                status: 'out_for_delivery',
                deliveryPartner: {
                    id: 'DP-DEMO-002',
                    name: 'Sarah Johnson',
                    phone: '+1-555-0198',
                    email: 'sarah.j@quickdelivery.com',
                    rating: 4.9,
                    vehicle: {
                        type: 'Electric Bike',
                        number: 'CA-789-EV',
                        model: 'Tesla Bike Pro'
                    },
                    photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
                },
                currentLocation: {
                    latitude: 37.7749,
                    longitude: -122.4194,
                    address: 'Near 456 Market St, San Francisco, CA',
                    timestamp: new Date().toISOString(),
                    accuracy: 5
                },
                estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
            },
            'ORD-003': {
                status: 'picked_up',
                deliveryPartner: {
                    id: 'DP-DEMO-003',
                    name: 'Michael Chen',
                    phone: '+1-555-0167',
                    rating: 4.7,
                    vehicle: {
                        type: 'Van',
                        number: 'NY-456-DEL',
                        model: 'Ford Transit'
                    }
                },
                currentLocation: {
                    latitude: 40.7128,
                    longitude: -74.0060,
                    address: 'Warehouse District, New York, NY',
                    timestamp: new Date().toISOString(),
                    accuracy: 8
                },
                estimatedDelivery: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
            },
            'ORD-004': {
                status: 'delivered',
                deliveryPartner: {
                    id: 'DP-DEMO-004',
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
                    address: '987 Tech Ave, Austin, TX',
                    timestamp: new Date().toISOString(),
                    accuracy: 3
                },
                estimatedDelivery: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
                actualDelivery: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
            }
        };

        const scenario = demoScenarios[orderId];
        if (!scenario) {
            return null;
        }

        const baseData: BecknTrackingData = {
            orderId,
            becknTransactionId: `BECKN-DEMO-${orderId}`,
            status: scenario.status || 'in_transit',
            deliveryPartner: scenario.deliveryPartner,
            currentLocation: scenario.currentLocation,
            estimatedDelivery: scenario.estimatedDelivery || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            actualDelivery: scenario.actualDelivery,
            trackingHistory: this.generateTrackingHistory(orderId, scenario.status || 'in_transit'),
            lastUpdated: new Date().toISOString()
        };

        return baseData;
    }

    /**
     * Generate realistic tracking history based on order status
     */
    private generateTrackingHistory(orderId: string, currentStatus: BecknOrderStatus): BecknTrackingEvent[] {
        const baseTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        const events: BecknTrackingEvent[] = [];

        // Always start with order placed
        events.push({
            id: `EVT-${orderId}-001`,
            status: 'order_placed',
            timestamp: new Date(baseTime).toISOString(),
            description: 'Order placed and confirmed through BECKN network'
        });

        // Add partner assignment
        if (['partner_assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(currentStatus)) {
            events.push({
                id: `EVT-${orderId}-002`,
                status: 'partner_assigned',
                timestamp: new Date(baseTime + 30 * 60 * 1000).toISOString(),
                description: 'Delivery partner assigned via BECKN protocol'
            });
        }

        // Add pickup event
        if (['picked_up', 'in_transit', 'out_for_delivery', 'delivered'].includes(currentStatus)) {
            events.push({
                id: `EVT-${orderId}-003`,
                status: 'picked_up',
                timestamp: new Date(baseTime + 2 * 60 * 60 * 1000).toISOString(),
                description: 'Package picked up from origin location'
            });
        }

        // Add in transit event
        if (['in_transit', 'out_for_delivery', 'delivered'].includes(currentStatus)) {
            events.push({
                id: `EVT-${orderId}-004`,
                status: 'in_transit',
                timestamp: new Date(baseTime + 4 * 60 * 60 * 1000).toISOString(),
                location: {
                    latitude: 35.3733,
                    longitude: -119.0187,
                    address: 'Transit hub, Bakersfield, CA',
                    timestamp: new Date(baseTime + 4 * 60 * 60 * 1000).toISOString()
                },
                description: 'Package in transit - passing through distribution center'
            });
        }

        // Add out for delivery event
        if (['out_for_delivery', 'delivered'].includes(currentStatus)) {
            events.push({
                id: `EVT-${orderId}-005`,
                status: 'out_for_delivery',
                timestamp: new Date(baseTime + 20 * 60 * 60 * 1000).toISOString(),
                description: 'Out for delivery - arriving soon'
            });
        }

        // Add delivered event
        if (currentStatus === 'delivered') {
            events.push({
                id: `EVT-${orderId}-006`,
                status: 'delivered',
                timestamp: new Date(baseTime + 22 * 60 * 60 * 1000).toISOString(),
                description: 'Package delivered successfully'
            });
        }

        return events;
    }

    /**
     * Start live location simulation for an order
     */
    private startLocationSimulation(orderId: string): void {
        if (this.locationSimulationIntervals.has(orderId)) {
            return; // Already running
        }

        const demoData = this.demoDataCache.get(orderId);
        if (!demoData || !demoData.currentLocation) {
            return;
        }

        // Simulate location updates every 15 seconds
        const interval = setInterval(() => {
            const updatedData = this.demoDataCache.get(orderId);
            if (!updatedData || !updatedData.currentLocation) {
                this.stopLocationSimulation(orderId);
                return;
            }

            // Simulate small location changes (within 0.001 degrees ~ 100m)
            const latChange = (Math.random() - 0.5) * 0.002;
            const lngChange = (Math.random() - 0.5) * 0.002;

            updatedData.currentLocation.latitude += latChange;
            updatedData.currentLocation.longitude += lngChange;
            updatedData.currentLocation.timestamp = new Date().toISOString();
            updatedData.lastUpdated = new Date().toISOString();

            // Update address occasionally
            if (Math.random() < 0.3) {
                const addresses = [
                    'Moving along Highway 99',
                    'Approaching city center',
                    'Near downtown area',
                    'On delivery route',
                    'Close to destination'
                ];
                updatedData.currentLocation.address = addresses[Math.floor(Math.random() * addresses.length)];
            }

            console.log(`[BECKN Demo] Location updated for ${orderId}:`, {
                lat: updatedData.currentLocation.latitude.toFixed(6),
                lng: updatedData.currentLocation.longitude.toFixed(6)
            });

        }, 15000); // Update every 15 seconds

        this.locationSimulationIntervals.set(orderId, interval);
        console.log(`[BECKN Demo] Started location simulation for ${orderId}`);
    }

    /**
     * Stop location simulation for a specific order
     */
    private stopLocationSimulation(orderId: string): void {
        const interval = this.locationSimulationIntervals.get(orderId);
        if (interval) {
            clearInterval(interval);
            this.locationSimulationIntervals.delete(orderId);
            console.log(`[BECKN Demo] Stopped location simulation for ${orderId}`);
        }
    }

    /**
     * Stop all location simulations
     */
    private stopAllLocationSimulations(): void {
        this.locationSimulationIntervals.forEach((interval, orderId) => {
            clearInterval(interval);
            console.log(`[BECKN Demo] Stopped location simulation for ${orderId}`);
        });
        this.locationSimulationIntervals.clear();
        this.demoDataCache.clear();
    }

    /**
     * Get demo status indicators
     */
    getDemoStatusInfo() {
        return {
            isDemoMode: this.isDemoMode,
            activeSimulations: this.locationSimulationIntervals.size,
            cachedOrders: Array.from(this.demoDataCache.keys())
        };
    }

    /**
     * Cleanup service resources
     */
    cleanup(): void {
        this.stopAllLocationSimulations();
        console.log('[BECKN Demo] Service cleanup completed');
    }
}

// Export singleton instance
export const becknDemoService = new BecknDemoService();