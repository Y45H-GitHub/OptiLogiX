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
  condition: "new" | "like_new" | "good" | "fair";
  expirationDate?: Date;
  location: string;
  images: string[];
  status: "available" | "reserved" | "transferred" | "expired";
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryRequest {
  id: string;
  requesterId: string;
  surplusItemId: string;
  requestedQuantity: number;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  deliveryPreference: string;
  notes: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface NetworkParticipant {
  id: string;
  companyName: string;
  contactEmail: string;
  contactPhone?: string;
  address: string;
  verificationStatus: "pending" | "verified" | "suspended";
  reputationScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transfer {
  id: string;
  requestId: string;
  trackingNumber?: string;
  carrier?: string;
  status: "initiated" | "in_transit" | "delivered" | "cancelled";
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// NEW: Store-to-Store Communication Interfaces
export interface StoreInventory {
  storeId: string;
  storeName: string;
  location: string;
  categories: {
    [category: string]: {
      currentStock: number;
      minThreshold: number;
      maxThreshold: number;
      lastUpdated: Date;
    };
  };
  surplusItems: SurplusInventoryItem[];
  needsItems: StoreNeed[];
}

export interface StoreNeed {
  id: string;
  storeId: string;
  category: string;
  productName?: string;
  sku?: string;
  quantityNeeded: number;
  urgencyLevel: "low" | "medium" | "high" | "critical";
  maxPrice?: number;
  deliveryDeadline?: Date;
  status: "active" | "fulfilled" | "expired";
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMatch {
  id: string;
  surplusItem: SurplusInventoryItem;
  storeNeed: StoreNeed;
  matchScore: number;
  estimatedSavings: number;
  distance: number; // in miles/km
  status: "pending" | "proposed" | "accepted" | "rejected" | "completed";
  proposedBy?: string;
  proposedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreConnection {
  id: string;
  storeId: string;
  connectedStoreId: string;
  connectionType: "surplus_provider" | "surplus_receiver" | "bidirectional";
  totalTransfers: number;
  totalValue: number;
  lastInteraction: Date;
  trustScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RealTimeNotification {
  id: string;
  storeId: string;
  type:
    | "surplus_match"
    | "need_fulfilled"
    | "connection_request"
    | "inventory_alert";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  priority: "low" | "medium" | "high" | "critical";
  createdAt: Date;
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
