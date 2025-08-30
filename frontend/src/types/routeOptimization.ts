/**
 * Route Optimization Types
 * Types for supply chain facility mapping and route enhancement
 */

export interface SupplyChainFacility {
    id: string;
    name: string;
    type: 'distribution_center' | 'fuel_station' | 'warehouse' | 'partner_store';
    location: {
        lat: number;
        lng: number;
    };
    address: string;
    detourTime: number; // minutes
    services: string[];
}

export interface OptimizationSuggestion {
    id: string;
    type: 'fuel_stop' | 'consolidation' | 'pickup_optimization';
    facility: SupplyChainFacility;
    estimatedSavings: {
        time: number; // minutes
        fuel: number; // liters
        cost: number; // currency units
    };
    description: string;
}

export interface RouteEnhancement {
    originalRoute: google.maps.DirectionsRoute;
    suggestedWaypoints: google.maps.LatLng[];
    facilities: SupplyChainFacility[];
    optimizations: OptimizationSuggestion[];
    estimatedImpact: {
        timeChange: number;
        costChange: number;
        co2Change: number;
    };
}