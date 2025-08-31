/**
 * Facility Data Service
 * Provides demo supply chain facility data for route optimization
 */

import { SupplyChainFacility } from '../types/routeOptimization';

/**
 * Demo facility data representing strategic supply chain locations
 * Positioned along popular demo routes for realistic testing scenarios
 */
export const DEMO_FACILITIES: SupplyChainFacility[] = [
    {
        id: 'dc_kolkata_001',
        name: 'Kolkata Central Distribution Hub',
        type: 'distribution_center',
        location: { lat: 22.5726, lng: 88.3639 }, // Kolkata center
        address: 'Salt Lake Sector V, Kolkata, West Bengal 700091',
        detourTime: 15,
        services: ['loading_dock', 'overnight_storage', 'cross_docking', 'inventory_management']
    },
    {
        id: 'fuel_nh2_001',
        name: 'Highway Fuel Station NH-2',
        type: 'fuel_station',
        location: { lat: 22.8046, lng: 86.2029 }, // Kharagpur area on NH-2
        address: 'NH-2, Kharagpur, West Bengal 721301',
        detourTime: 8,
        services: ['diesel_refuel', 'driver_rest', 'vehicle_maintenance', '24_hour_service']
    },
    {
        id: 'warehouse_durgapur_001',
        name: 'Durgapur Industrial Warehouse',
        type: 'warehouse',
        location: { lat: 23.5204, lng: 87.3119 }, // Durgapur industrial area
        address: 'City Centre, Durgapur, West Bengal 713216',
        detourTime: 12,
        services: ['bulk_storage', 'packaging', 'quality_control', 'cold_storage']
    },
    {
        id: 'store_southcity_001',
        name: 'South City Mall',
        type: 'partner_store',
        location: { lat: 22.5056, lng: 88.3577 },
        address: '375, Prince Anwar Shah Road, Kolkata',
        detourTime: 10,
        services: ['retail', 'food_court', 'entertainment']
    },
    {
        id: 'store_acropolis_001',
        name: 'Acropolis Mall',
        type: 'partner_store',
        location: { lat: 22.4994, lng: 88.3701 },
        address: '1858, Rajdanga Main Road, Kolkata',
        detourTime: 12,
        services: ['retail', 'dining', 'entertainment']
    },
    {
        id: 'store_quest_001',
        name: 'Quest Mall',
        type: 'partner_store',
        location: { lat: 22.5089, lng: 88.3666 },
        address: '33, Syed Amir Ali Avenue, Kolkata',
        detourTime: 8,
        services: ['luxury_retail', 'dining', 'entertainment']
    },
    {
        id: 'store_citycentre_001',
        name: 'City Centre Salt Lake',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.4139 },
        address: 'DC Block, Sector 1, Salt Lake',
        detourTime: 15,
        services: ['retail', 'food_court', 'entertainment']
    },
    {
        id: 'store_mani_001',
        name: 'Mani Square Mall',
        type: 'partner_store',
        location: { lat: 22.5928, lng: 88.3701 },
        address: '164/1, Maniktala Main Road, Kolkata',
        detourTime: 10,
        services: ['retail', 'dining', 'entertainment']
    },
    {
        id: 'store_axis_001',
        name: 'Axis Mall',
        type: 'partner_store',
        location: { lat: 22.5783, lng: 88.4333 },
        address: 'New Town, Kolkata',
        detourTime: 12,
        services: ['retail', 'food_court', 'entertainment']
    },
    {
        id: 'store_elgin_001',
        name: 'Elgin Road Shopping Complex',
        type: 'partner_store',
        location: { lat: 22.5417, lng: 88.3533 },
        address: '1, Elgin Road, Kolkata',
        detourTime: 8,
        services: ['retail', 'dining']
    },
    {
        id: 'store_newmarket_001',
        name: 'New Market',
        type: 'partner_store',
        location: { lat: 22.5606, lng: 88.3533 },
        address: 'Lindsay Street, Kolkata',
        detourTime: 10,
        services: ['retail', 'street_food']
    },
    {
        id: 'store_gariahat_001',
        name: 'Gariahat Market',
        type: 'partner_store',
        location: { lat: 22.5200, lng: 88.3666 },
        address: 'Gariahat Road, Kolkata',
        detourTime: 12,
        services: ['retail', 'street_food']
    },
    {
        id: 'store_hawkers_001',
        name: 'Hawkers Corner',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Park Street, Kolkata',
        detourTime: 15,
        services: ['street_food', 'entertainment']
    },
    {
        id: 'store_phoenix_001',
        name: 'Phoenix Marketcity',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.4139 },
        address: 'New Town, Kolkata',
        detourTime: 15,
        services: ['retail', 'food_court', 'entertainment']
    },
    {
        id: 'store_merlin_001',
        name: 'Merlin Homeland',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Ballygunge, Kolkata',
        detourTime: 10,
        services: ['retail', 'dining']
    },
    {
        id: 'store_metro_001',
        name: 'Metropolis Mall',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Hiland Park, Kolkata',
        detourTime: 12,
        services: ['retail', 'dining']
    },
    {
        id: 'store_central_001',
        name: 'Central Plaza',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Ballygunge, Kolkata',
        detourTime: 8,
        services: ['retail', 'dining']
    },
    {
        id: 'store_treasure_001',
        name: 'Treasure Island',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Salt Lake, Kolkata',
        detourTime: 15,
        services: ['retail', 'food_court']
    },
    {
        id: 'store_vardaan_001',
        name: 'Vardaan Market',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Ballygunge, Kolkata',
        detourTime: 10,
        services: ['retail', 'dining']
    },
    {
        id: 'store_esplanade_001',
        name: 'Esplanade Market',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Esplanade, Kolkata',
        detourTime: 12,
        services: ['retail', 'street_food']
    },
    {
        id: 'store_hatibagan_001',
        name: 'Hatibagan Market',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Hatibagan, Kolkata',
        detourTime: 8,
        services: ['retail', 'street_food']
    },
    {
        id: 'store_bailey_001',
        name: 'Bailey Road Market',
        type: 'partner_store',
        location: { lat: 22.5726, lng: 88.3639 },
        address: 'Bailey Road, Kolkata',
        detourTime: 10,
        services: ['retail', 'street_food']
    }
];

/**
 * Service class for managing facility data operations
 */
export class FacilityDataService {
    /**
     * Get all available demo facilities
     */
    static getAllFacilities(): SupplyChainFacility[] {
        return DEMO_FACILITIES;
    }

    /**
     * Get facilities by type
     */
    static getFacilitiesByType(type: SupplyChainFacility['type']): SupplyChainFacility[] {
        return DEMO_FACILITIES.filter(facility => facility.type === type);
    }

    /**
     * Get facility by ID
     */
    static getFacilityById(id: string): SupplyChainFacility | undefined {
        return DEMO_FACILITIES.find(facility => facility.id === id);
    }

    /**
     * Calculate simple distance between two points (Haversine formula)
     * Used for basic proximity calculations
     */
    static calculateDistance(
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number
    ): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Find facilities within a specified radius of a location
     */
    static getFacilitiesNearLocation(
        lat: number,
        lng: number,
        radiusKm: number = 5
    ): SupplyChainFacility[] {
        return DEMO_FACILITIES.filter(facility => {
            const distance = this.calculateDistance(
                lat, lng,
                facility.location.lat,
                facility.location.lng
            );
            return distance <= radiusKm;
        });
    }

    /**
     * Calculate the shortest distance from a point to a line segment
     * Used for determining facility proximity to route paths
     */
    static distanceToLineSegment(
        pointLat: number,
        pointLng: number,
        line1Lat: number,
        line1Lng: number,
        line2Lat: number,
        line2Lng: number
    ): number {
        const A = pointLat - line1Lat;
        const B = pointLng - line1Lng;
        const C = line2Lat - line1Lat;
        const D = line2Lng - line1Lng;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;

        if (lenSq === 0) {
            // Line segment is actually a point
            return this.calculateDistance(pointLat, pointLng, line1Lat, line1Lng);
        }

        let param = dot / lenSq;

        let xx: number, yy: number;

        if (param < 0) {
            xx = line1Lat;
            yy = line1Lng;
        } else if (param > 1) {
            xx = line2Lat;
            yy = line2Lng;
        } else {
            xx = line1Lat + param * C;
            yy = line1Lng + param * D;
        }

        return this.calculateDistance(pointLat, pointLng, xx, yy);
    }

    /**
     * Find facilities within specified distance of a calculated route
     * Analyzes route path and returns facilities within the corridor
     */
    static getFacilitiesAlongRoute(
        route: google.maps.DirectionsRoute,
        radiusKm: number = 5
    ): SupplyChainFacility[] {
        if (!route || !route.legs || route.legs.length === 0) {
            return [];
        }

        const routePoints: { lat: number; lng: number }[] = [];

        // Extract all coordinate points from the route
        route.legs.forEach(leg => {
            leg.steps.forEach(step => {
                if (step.path) {
                    step.path.forEach(point => {
                        routePoints.push({
                            lat: point.lat(),
                            lng: point.lng()
                        });
                    });
                }
            });
        });

        // If no path points available, fall back to start/end points
        if (routePoints.length === 0) {
            route.legs.forEach(leg => {
                routePoints.push({
                    lat: leg.start_location.lat(),
                    lng: leg.start_location.lng()
                });
                routePoints.push({
                    lat: leg.end_location.lat(),
                    lng: leg.end_location.lng()
                });
            });
        }

        // Filter facilities based on proximity to route corridor
        return DEMO_FACILITIES.filter(facility => {
            let minDistance = Infinity;

            // Check distance to each route segment
            for (let i = 0; i < routePoints.length - 1; i++) {
                const distance = this.distanceToLineSegment(
                    facility.location.lat,
                    facility.location.lng,
                    routePoints[i].lat,
                    routePoints[i].lng,
                    routePoints[i + 1].lat,
                    routePoints[i + 1].lng
                );
                minDistance = Math.min(minDistance, distance);
            }

            return minDistance <= radiusKm;
        });
    }
}