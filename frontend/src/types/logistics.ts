export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
    status: OrderStatus;
    totalAmount: number;
    orderDate: string;
    estimatedDelivery: string;
    actualDelivery?: string;
    origin: Location;
    destination: Location;
    transitHops: TransitHop[];
    travelCompany: string;
    deliveryId: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    cancellationReason?: string;
    cancellationDate?: string;
    approvalStatus?: 'pending' | 'approved' | 'rejected';
    notes?: string;
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
}

export interface Location {
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export interface TransitHop {
    id: string;
    location: Location;
    arrivalTime: string;
    departureTime?: string;
    status: 'pending' | 'arrived' | 'departed' | 'delayed';
    notes?: string;
}

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'refunded';

export interface OrderFilter {
    status?: OrderStatus[];
    customerId?: string;
    dateRange?: {
        start: string;
        end: string;
    };
    priority?: ('low' | 'medium' | 'high' | 'urgent')[];
    searchTerm?: string;
}

export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    inTransitOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
}