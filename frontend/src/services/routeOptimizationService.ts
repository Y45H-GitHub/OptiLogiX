/**
 * Route Optimization Service
 * Generates intelligent suggestions for supply chain optimizations along routes
 */

import { SupplyChainFacility, OptimizationSuggestion } from '../types/routeOptimization';

export class RouteOptimizationService {
    /**
     * Generate optimization suggestions based on facilities along the route
     * Returns hardcoded demo suggestions for hackathon presentation
     */
    static generateSuggestions(
        facilities: SupplyChainFacility[],
        transportMode: 'truck' | 'rail' | 'air' = 'truck'
    ): OptimizationSuggestion[] {
        const suggestions: OptimizationSuggestion[] = [];

        // Find fuel stations for fuel optimization suggestions
        const fuelStations = facilities.filter(f => f.type === 'fuel_station');
        if (fuelStations.length > 0) {
            const fuelStation = fuelStations[0];
            suggestions.push({
                id: `fuel_${fuelStation.id}`,
                type: 'fuel_stop',
                facility: fuelStation,
                estimatedSavings: {
                    time: 15, // Hardcoded demo value
                    fuel: 25, // Hardcoded demo value
                    cost: 850 // Hardcoded demo value in rupees
                },
                description: `Fuel Stop Available - Save ₹850 with strategic refueling at ${fuelStation.name}`
            });
        }

        // Find warehouses for consolidation opportunities
        const warehouses = facilities.filter(f => f.type === 'warehouse');
        if (warehouses.length > 0) {
            const warehouse = warehouses[0];
            suggestions.push({
                id: `consolidation_${warehouse.id}`,
                type: 'consolidation',
                facility: warehouse,
                estimatedSavings: {
                    time: 30, // Hardcoded demo value
                    fuel: 0, // No fuel savings for consolidation
                    cost: 1200 // Hardcoded demo value in rupees
                },
                description: `Warehouse Nearby - Consolidate shipments at ${warehouse.name} to save ₹1,200`
            });
        }

        // Find distribution centers for pickup optimization
        const distributionCenters = facilities.filter(f => f.type === 'distribution_center');
        if (distributionCenters.length > 0) {
            const dc = distributionCenters[0];
            suggestions.push({
                id: `pickup_${dc.id}`,
                type: 'pickup_optimization',
                facility: dc,
                estimatedSavings: {
                    time: 20, // Hardcoded demo value
                    fuel: 15, // Hardcoded demo value
                    cost: 600 // Hardcoded demo value in rupees
                },
                description: `Distribution Hub Available - Optimize pickup route via ${dc.name} to save 20 minutes`
            });
        }

        // Limit to 2 suggestions for clean demo presentation
        return suggestions.slice(0, 2);
    }

    /**
     * Get suggestion icon based on type
     */
    static getSuggestionIcon(type: OptimizationSuggestion['type']): string {
        switch (type) {
            case 'fuel_stop':
                return '⛽';
            case 'consolidation':
                return '📦';
            case 'pickup_optimization':
                return '🚚';
            default:
                return '💡';
        }
    }

    /**
     * Get suggestion color based on type
     */
    static getSuggestionColor(type: OptimizationSuggestion['type']): string {
        switch (type) {
            case 'fuel_stop':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'consolidation':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'pickup_optimization':
                return 'bg-orange-50 border-orange-200 text-orange-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    }
}