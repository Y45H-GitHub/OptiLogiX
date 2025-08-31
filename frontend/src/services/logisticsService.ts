import { Order, OrderFilter, OrderStats, OrderStatus } from '@/types/logistics';

// Mock data for demonstration
const mockOrders: Order[] = [
    {
        id: 'ORD-001',
        customerId: 'CUST-001',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        items: [
            {
                id: 'ITEM-001',
                name: 'Wireless Headphones',
                quantity: 2,
                price: 199.99,
                weight: 0.5,
                dimensions: { length: 20, width: 15, height: 8 }
            },
            {
                id: 'ITEM-002',
                name: 'Phone Case',
                quantity: 1,
                price: 29.99,
                weight: 0.1,
                dimensions: { length: 15, width: 8, height: 2 }
            }
        ],
        status: 'in_transit',
        totalAmount: 429.97,
        orderDate: '2024-01-15T10:30:00Z',
        estimatedDelivery: '2024-01-20T16:00:00Z',
        origin: {
            address: '123 Warehouse St',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            zipCode: '90210',
            coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        destination: {
            address: '456 Customer Ave',
            city: 'San Francisco',
            state: 'CA',
            country: 'USA',
            zipCode: '94102',
            coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        transitHops: [
            {
                id: 'HOP-001',
                location: {
                    address: '789 Distribution Center',
                    city: 'Bakersfield',
                    state: 'CA',
                    country: 'USA',
                    zipCode: '93301',
                    coordinates: { lat: 35.3733, lng: -119.0187 }
                },
                arrivalTime: '2024-01-16T14:30:00Z',
                departureTime: '2024-01-16T18:00:00Z',
                status: 'departed'
            },
            {
                id: 'HOP-002',
                location: {
                    address: '321 Transit Hub',
                    city: 'Fresno',
                    state: 'CA',
                    country: 'USA',
                    zipCode: '93721',
                    coordinates: { lat: 36.7378, lng: -119.7871 }
                },
                arrivalTime: '2024-01-17T08:15:00Z',
                departureTime: '2024-01-17T12:00:00Z',
                status: 'departed'
            },
            {
                id: 'HOP-003',
                location: {
                    address: '654 Final Hub',
                    city: 'San Jose',
                    state: 'CA',
                    country: 'USA',
                    zipCode: '95110',
                    coordinates: { lat: 37.3382, lng: -121.8863 }
                },
                arrivalTime: '2024-01-18T16:45:00Z',
                status: 'arrived'
            }
        ],
        travelCompany: 'FastTrack Logistics',
        deliveryId: 'FTL-789456123',
        priority: 'medium',
        isBecknEnabled: true
    },
    {
        id: 'ORD-002',
        customerId: 'CUST-002',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.johnson@email.com',
        items: [
            {
                id: 'ITEM-003',
                name: 'Laptop Computer',
                quantity: 1,
                price: 1299.99,
                weight: 2.5,
                dimensions: { length: 35, width: 25, height: 3 }
            }
        ],
        status: 'delivered',
        totalAmount: 1299.99,
        orderDate: '2024-01-10T09:15:00Z',
        estimatedDelivery: '2024-01-15T14:00:00Z',
        actualDelivery: '2024-01-14T13:30:00Z',
        origin: {
            address: '123 Warehouse St',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            zipCode: '90210',
            coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        destination: {
            address: '789 Business Blvd',
            city: 'Seattle',
            state: 'WA',
            country: 'USA',
            zipCode: '98101',
            coordinates: { lat: 47.6062, lng: -122.3321 }
        },
        transitHops: [
            {
                id: 'HOP-004',
                location: {
                    address: '456 Portland Hub',
                    city: 'Portland',
                    state: 'OR',
                    country: 'USA',
                    zipCode: '97201',
                    coordinates: { lat: 45.5152, lng: -122.6784 }
                },
                arrivalTime: '2024-01-12T10:00:00Z',
                departureTime: '2024-01-12T14:00:00Z',
                status: 'departed'
            }
        ],
        travelCompany: 'Express Delivery Co',
        deliveryId: 'EDC-456789012',
        priority: 'high',
        isBecknEnabled: false
    },
    {
        id: 'ORD-003',
        customerId: 'CUST-003',
        customerName: 'Mike Davis',
        customerEmail: 'mike.davis@email.com',
        items: [
            {
                id: 'ITEM-004',
                name: 'Gaming Chair',
                quantity: 1,
                price: 399.99,
                weight: 15.0,
                dimensions: { length: 70, width: 70, height: 120 }
            }
        ],
        status: 'cancelled',
        totalAmount: 399.99,
        orderDate: '2024-01-12T16:45:00Z',
        estimatedDelivery: '2024-01-18T12:00:00Z',
        cancellationReason: 'Customer requested cancellation',
        cancellationDate: '2024-01-13T10:30:00Z',
        approvalStatus: 'pending',
        origin: {
            address: '123 Warehouse St',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            zipCode: '90210',
            coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        destination: {
            address: '321 Gamer St',
            city: 'Phoenix',
            state: 'AZ',
            country: 'USA',
            zipCode: '85001',
            coordinates: { lat: 33.4484, lng: -112.0740 }
        },
        transitHops: [],
        travelCompany: 'Heavy Freight Express',
        deliveryId: 'HFE-123456789',
        priority: 'low',
        notes: 'Customer changed mind about purchase',
        isBecknEnabled: false
    },
    {
        id: 'ORD-004',
        customerId: 'CUST-004',
        customerName: 'Emily Chen',
        customerEmail: 'emily.chen@email.com',
        items: [
            {
                id: 'ITEM-005',
                name: 'Smart Watch',
                quantity: 1,
                price: 299.99,
                weight: 0.2,
                dimensions: { length: 10, width: 8, height: 2 }
            }
        ],
        status: 'out_for_delivery',
        totalAmount: 299.99,
        orderDate: '2024-01-18T11:20:00Z',
        estimatedDelivery: '2024-01-22T15:00:00Z',
        origin: {
            address: '123 Warehouse St',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            zipCode: '90210',
            coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        destination: {
            address: '987 Tech Ave',
            city: 'Austin',
            state: 'TX',
            country: 'USA',
            zipCode: '73301',
            coordinates: { lat: 30.2672, lng: -97.7431 }
        },
        transitHops: [
            {
                id: 'HOP-005',
                location: {
                    address: '555 Dallas Hub',
                    city: 'Dallas',
                    state: 'TX',
                    country: 'USA',
                    zipCode: '75201',
                    coordinates: { lat: 32.7767, lng: -96.7970 }
                },
                arrivalTime: '2024-01-20T09:30:00Z',
                departureTime: '2024-01-20T13:00:00Z',
                status: 'departed'
            }
        ],
        travelCompany: 'Quick Ship Solutions',
        deliveryId: 'QSS-987654321',
        priority: 'urgent',
        isBecknEnabled: true
    },
    {
        id: 'ORD-005',
        customerId: 'CUST-005',
        customerName: 'Robert Wilson',
        customerEmail: 'robert.wilson@email.com',
        items: [
            {
                id: 'ITEM-006',
                name: 'Office Desk',
                quantity: 1,
                price: 599.99,
                weight: 25.0,
                dimensions: { length: 150, width: 75, height: 75 }
            }
        ],
        status: 'cancelled',
        totalAmount: 599.99,
        orderDate: '2024-01-14T14:15:00Z',
        estimatedDelivery: '2024-01-21T10:00:00Z',
        cancellationReason: 'Delivery address changed',
        cancellationDate: '2024-01-15T09:45:00Z',
        approvalStatus: 'pending',
        origin: {
            address: '123 Warehouse St',
            city: 'Los Angeles',
            state: 'CA',
            country: 'USA',
            zipCode: '90210',
            coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        destination: {
            address: '147 Office Park',
            city: 'Denver',
            state: 'CO',
            country: 'USA',
            zipCode: '80201',
            coordinates: { lat: 39.7392, lng: -104.9903 }
        },
        transitHops: [],
        travelCompany: 'Furniture Express',
        deliveryId: 'FE-147258369',
        priority: 'medium',
        notes: 'Customer moved to new office location',
        isBecknEnabled: false
    }
];

class LogisticsService {
    private orders: Order[] = [...mockOrders];

    async getOrders(filter?: OrderFilter): Promise<Order[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let filteredOrders = [...this.orders];

        if (filter) {
            if (filter.status && filter.status.length > 0) {
                filteredOrders = filteredOrders.filter(order => filter.status!.includes(order.status));
            }

            if (filter.customerId) {
                filteredOrders = filteredOrders.filter(order => order.customerId === filter.customerId);
            }

            if (filter.priority && filter.priority.length > 0) {
                filteredOrders = filteredOrders.filter(order => filter.priority!.includes(order.priority));
            }

            if (filter.searchTerm) {
                const searchLower = filter.searchTerm.toLowerCase();
                filteredOrders = filteredOrders.filter(order =>
                    order.id.toLowerCase().includes(searchLower) ||
                    order.customerName.toLowerCase().includes(searchLower) ||
                    order.deliveryId.toLowerCase().includes(searchLower)
                );
            }

            if (filter.dateRange) {
                const startDate = new Date(filter.dateRange.start);
                const endDate = new Date(filter.dateRange.end);
                filteredOrders = filteredOrders.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    return orderDate >= startDate && orderDate <= endDate;
                });
            }
        }

        return filteredOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    }

    async getOrderById(id: string): Promise<Order | null> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.orders.find(order => order.id === id) || null;
    }

    async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const orderIndex = this.orders.findIndex(order => order.id === id);
        if (orderIndex === -1) return null;

        this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            status
        };

        return this.orders[orderIndex];
    }

    async approveCancellation(id: string): Promise<Order | null> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const orderIndex = this.orders.findIndex(order => order.id === id);
        if (orderIndex === -1) return null;

        this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            approvalStatus: 'approved'
        };

        return this.orders[orderIndex];
    }

    async rejectCancellation(id: string, reason?: string): Promise<Order | null> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const orderIndex = this.orders.findIndex(order => order.id === id);
        if (orderIndex === -1) return null;

        this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            approvalStatus: 'rejected',
            status: 'processing', // Revert to processing
            notes: reason ? `Cancellation rejected: ${reason}` : 'Cancellation rejected'
        };

        return this.orders[orderIndex];
    }

    async getOrderStats(): Promise<OrderStats> {
        await new Promise(resolve => setTimeout(resolve, 300));

        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(o => o.status === 'pending').length;
        const inTransitOrders = this.orders.filter(o => ['shipped', 'in_transit', 'out_for_delivery'].includes(o.status)).length;
        const deliveredOrders = this.orders.filter(o => o.status === 'delivered').length;
        const cancelledOrders = this.orders.filter(o => o.status === 'cancelled').length;

        // Calculate average delivery time for delivered orders
        const deliveredWithTimes = this.orders.filter(o => o.status === 'delivered' && o.actualDelivery);
        const averageDeliveryTime = deliveredWithTimes.length > 0
            ? deliveredWithTimes.reduce((sum, order) => {
                const orderTime = new Date(order.orderDate).getTime();
                const deliveryTime = new Date(order.actualDelivery!).getTime();
                return sum + (deliveryTime - orderTime) / (1000 * 60 * 60 * 24); // days
            }, 0) / deliveredWithTimes.length
            : 0;

        // Calculate on-time delivery rate
        const onTimeDeliveries = deliveredWithTimes.filter(order => {
            const actualDelivery = new Date(order.actualDelivery!);
            const estimatedDelivery = new Date(order.estimatedDelivery);
            return actualDelivery <= estimatedDelivery;
        }).length;

        const onTimeDeliveryRate = deliveredWithTimes.length > 0
            ? (onTimeDeliveries / deliveredWithTimes.length) * 100
            : 0;

        return {
            totalOrders,
            pendingOrders,
            inTransitOrders,
            deliveredOrders,
            cancelledOrders,
            averageDeliveryTime,
            onTimeDeliveryRate
        };
    }

    async getCancelledOrdersForApproval(): Promise<Order[]> {
        await new Promise(resolve => setTimeout(resolve, 300));
        return this.orders.filter(order =>
            order.status === 'cancelled' && order.approvalStatus === 'pending'
        );
    }
}

export const logisticsService = new LogisticsService();