// Digital Twin data models for supply chain visualization and carbon tracking

export interface Supplier {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    carbonEmission: number; // kg CO2 per unit
    sustainabilityScore: number; // 0-100
    products: string[];
    certifications: string[];
    deliveryMethods: DeliveryMethod[];
    monthlyVolume: number;
    costPerUnit: number;
    reliability: number; // 0-100
}

export interface Product {
    id: string;
    name: string;
    category: string;
    carbonFootprint: number; // kg CO2 per unit
    supplierId: string;
    stores: string[];
    donationEligible: boolean;
    shelfLife: number; // days
    weight: number; // kg
    volume: number; // cubic meters
}

export interface Store {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    type: 'retail' | 'warehouse' | 'distribution_center';
    capacity: number;
    currentStock: number;
    demandForecast: number;
    carbonEfficiency: number; // 0-100
    wasteGeneration: number; // kg per month
}

export interface DonationFlow {
    id: string;
    productId: string;
    fromStoreId: string;
    toOrganization: string;
    quantity: number;
    carbonSaved: number; // kg CO2 saved from waste prevention
    date: Date;
    status: 'pending' | 'in_transit' | 'completed';
}

export interface DeliveryMethod {
    type: 'truck' | 'rail' | 'ship' | 'air';
    carbonPerKm: number; // kg CO2 per km
    costPerKm: number;
    capacity: number; // kg
    speed: number; // km/h
}

export interface SupplyChainFlow {
    id: string;
    supplierId: string;
    productId: string;
    storeId: string;
    quantity: number;
    distance: number; // km
    deliveryMethod: DeliveryMethod;
    totalCarbon: number; // kg CO2
    totalCost: number;
    estimatedDelivery: Date;
}

export interface CarbonHotspot {
    id: string;
    type: 'supplier' | 'product' | 'route' | 'store';
    entityId: string;
    carbonEmission: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    improvementPotential: number; // % reduction possible
    recommendations: string[];
}

export interface SupplierSwapRecommendation {
    currentSupplierId: string;
    recommendedSupplierId: string;
    productId: string;
    carbonSavings: number; // kg CO2 per unit
    costImpact: number; // % change in cost
    reliabilityImpact: number; // % change in reliability
    estimatedAnnualSavings: number; // kg CO2 per year
    implementationComplexity: 'low' | 'medium' | 'high';
    paybackPeriod: number; // months
}

export interface DigitalTwinAnalytics {
    totalCarbonEmissions: number; // kg CO2 per month
    carbonIntensity: number; // kg CO2 per $ revenue
    wasteReduction: number; // kg waste prevented through donations
    supplierEfficiencyScore: number; // 0-100
    networkOptimizationScore: number; // 0-100
    monthlyTrends: {
        month: string;
        emissions: number;
        donations: number;
        efficiency: number;
    }[];
    topEmitters: CarbonHotspot[];
    swapOpportunities: SupplierSwapRecommendation[];
}

export interface NetworkNode {
    id: string;
    type: 'supplier' | 'product' | 'store' | 'donation';
    name: string;
    position: { x: number; y: number };
    carbonLevel: number;
    size: number;
    connections: string[];
    metadata: any;
}

export interface NetworkEdge {
    id: string;
    source: string;
    target: string;
    type: 'supply' | 'donation' | 'transport';
    weight: number;
    carbonFlow: number;
    animated: boolean;
    color: string;
}

export interface InteractiveGraph {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
    layout: 'force' | 'hierarchical' | 'circular';
    filters: {
        showSuppliers: boolean;
        showProducts: boolean;
        showStores: boolean;
        showDonations: boolean;
        carbonThreshold: number;
    };
}

// Supply Chain Node for the dashboard
export interface SupplyChainNode {
    id: string;
    name: string;
    type: 'supplier' | 'warehouse' | 'distribution_center' | 'retail';
    location: string;
    status: 'operational' | 'warning' | 'critical' | 'maintenance';
    capacity: {
        current: number;
        max: number;
    };
    metrics?: {
        efficiency: number;
        throughput: number;
    };
}

// Supply Chain Connection
export interface SupplyChainConnection {
    id: string;
    source: string;
    target: string;
    type: 'supply' | 'transport' | 'distribution';
    status: 'active' | 'inactive' | 'congested';
    flow: number;
    carbonEmission: number;
}

// System Alert
export interface SystemAlert {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    nodeId?: string;
}

// Digital Twin Metrics
export interface DigitalTwinMetrics {
    efficiency: number;
    carbonFootprint: number;
    throughput: number;
    reliability: number;
}

// Main Digital Twin Data structure
export interface DigitalTwinData {
    nodes: SupplyChainNode[];
    connections: SupplyChainConnection[];
    metrics: DigitalTwinMetrics;
    alerts: SystemAlert[];
    recommendations: SupplierSwapRecommendation[];
}