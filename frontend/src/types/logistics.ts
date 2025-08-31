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
    // BECKN Protocol Integration
    becknData?: BecknTrackingData;
    isBecknEnabled: boolean;
    becknFallbackReason?: string;
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

// BECKN Protocol Data Types
export interface BecknLocation {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
    accuracy?: number;
}

export interface BecknDeliveryPartner {
    id: string;
    name: string;
    phone: string;
    email?: string;
    rating: number;
    vehicle: {
        type: string;
        number: string;
        model?: string;
    };
    photo?: string;
}

export interface BecknTrackingEvent {
    id: string;
    status: BecknOrderStatus;
    timestamp: string;
    location?: BecknLocation;
    description: string;
}

export type BecknOrderStatus =
    | 'order_placed'
    | 'order_confirmed'
    | 'partner_assigned'
    | 'picked_up'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned';

export interface BecknTrackingData {
    orderId: string;
    becknTransactionId: string;
    status: BecknOrderStatus;
    deliveryPartner?: BecknDeliveryPartner;
    currentLocation?: BecknLocation;
    estimatedDelivery: string;
    actualDelivery?: string;
    trackingHistory: BecknTrackingEvent[];
    lastUpdated: string;
}