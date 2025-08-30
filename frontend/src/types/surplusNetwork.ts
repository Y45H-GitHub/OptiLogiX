// Core data models for Surplus Rescue Network

export interface SurplusInventoryItem {
    id: string;
    participantId: string;
    sku: string;
    productName: string;
    description: string;
    category: string;
    quantityAvailable: number;
    unitPrice: number;
    condition: 'new' | 'like_new' | 'good' | 'fair';
    expirationDate?: Date;
    location: string;
    images: string[];
    status: 'available' | 'reserved' | 'transferred' | 'expired';
    createdAt: Date;
    updatedAt: Date;
}

export interface InventoryRequest {
    id: string;
    requesterId: string;
    surplusItemId: string;
    requestedQuantity: number;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    deliveryPreference: string;
    notes: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

export interface NetworkParticipant {
    id: string;
    companyName: string;
    contactEmail: string;
    contactPhone?: string;
    address: string;
    verificationStatus: 'pending' | 'verified' | 'suspended';
    reputationScore: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Transfer {
    id: string;
    requestId: string;
    trackingNumber?: string;
    carrier?: string;
    status: 'initiated' | 'in_transit' | 'delivered' | 'cancelled';
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

// Filter and search interfaces
export interface InventoryFilters {
    category?: string;
    location?: string;
    condition?: string[];
    priceRange?: { min: number; max: number };
    quantityRange?: { min: number; max: number };
    expirationDate?: { before: Date; after: Date };
    searchTerm?: string;
}

export interface NetworkAnalytics {
    totalItemsShared: number;
    totalItemsReceived: number;
    totalCostSavings: number;
    averageResponseTime: number;
    successfulTransfers: number;
    networkReputationScore: number;
    monthlyTrends: {
        month: string;
        itemsShared: number;
        itemsReceived: number;
        costSavings: number;
    }[];
}