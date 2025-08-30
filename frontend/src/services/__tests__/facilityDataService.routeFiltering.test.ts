/**
 * Test suite for route-based facility filtering functionality
 */

import { FacilityDataService } from '../facilityDataService';

// Mock Google Maps types for testing
const createMockRoute = (coordinates: { lat: number; lng: number }[]): google.maps.DirectionsRoute => {
    const mockSteps = coordinates.slice(0, -1).map((coord, index) => ({
        path: [
            { lat: () => coord.lat, lng: () => coord.lng },
            { lat: () => coordinates[index + 1].lat, lng: () => coordinates[index + 1].lng }
        ]
    }));

    return {
        legs: [{
            start_location: { lat: () => coordinates[0].lat, lng: () => coordinates[0].lng },
            end_location: { lat: () => coordinates[coordinates.length - 1].lat, lng: () => coordinates[coordinates.length - 1].lng },
            steps: mockSteps
        }]
    } as any;
};

describe('FacilityDataService - Route Filtering', () => {
    describe('distanceToLineSegment', () => {
        it('should calculate distance from point to line segment correctly', () => {
            // Test point directly on line
            const distance1 = FacilityDataService.distanceToLineSegment(
                22.5726, 88.3639, // Point (Kolkata center)
                22.5726, 88.3639, // Line start (same point)
                22.8046, 86.2029  // Line end (Kharagpur)
            );
            expect(distance1).toBe(0);

            // Test point perpendicular to line
            const distance2 = FacilityDataService.distanceToLineSegment(
                23.0000, 87.0000, // Point offset from line
                22.5726, 88.3639, // Line start (Kolkata)
                22.8046, 86.2029  // Line end (Kharagpur)
            );
            expect(distance2).toBeGreaterThan(0);
        });
    });

    describe('getFacilitiesAlongRoute', () => {
        it('should return empty array for null route', () => {
            const facilities = FacilityDataService.getFacilitiesAlongRoute(null as any);
            expect(facilities).toEqual([]);
        });

        it('should return empty array for route with no legs', () => {
            const emptyRoute = { legs: [] } as google.maps.DirectionsRoute;
            const facilities = FacilityDataService.getFacilitiesAlongRoute(emptyRoute);
            expect(facilities).toEqual([]);
        });

        it('should filter facilities within 5km of route path', () => {
            // Create a route that passes near Kolkata facilities
            const routeCoordinates = [
                { lat: 22.5726, lng: 88.3639 }, // Kolkata center (near DC)
                { lat: 22.8046, lng: 86.2029 }, // Kharagpur (near fuel station)
                { lat: 23.5204, lng: 87.3119 }  // Durgapur (near warehouse)
            ];

            const mockRoute = createMockRoute(routeCoordinates);
            const facilities = FacilityDataService.getFacilitiesAlongRoute(mockRoute, 5);

            // Should return facilities that are within 5km of the route
            expect(facilities.length).toBeGreaterThan(0);
            expect(facilities.every(f => ['dc_kolkata_001', 'fuel_nh2_001', 'warehouse_durgapur_001'].includes(f.id))).toBe(true);
        });

        it('should filter facilities with custom radius', () => {
            // Create a route that passes through Kolkata area
            const routeCoordinates = [
                { lat: 22.5726, lng: 88.3639 }, // Kolkata center
                { lat: 22.6000, lng: 88.4000 }  // Nearby point
            ];

            const mockRoute = createMockRoute(routeCoordinates);

            // Test with very small radius (should return fewer facilities)
            const facilitiesSmallRadius = FacilityDataService.getFacilitiesAlongRoute(mockRoute, 1);

            // Test with larger radius (should return more facilities)
            const facilitiesLargeRadius = FacilityDataService.getFacilitiesAlongRoute(mockRoute, 50);

            expect(facilitiesLargeRadius.length).toBeGreaterThanOrEqual(facilitiesSmallRadius.length);
        });

        it('should handle route with no path data by using start/end points', () => {
            // Create a route without path data (fallback scenario)
            const mockRoute = {
                legs: [{
                    start_location: { lat: () => 22.5726, lng: () => 88.3639 },
                    end_location: { lat: () => 22.8046, lng: () => 86.2029 },
                    steps: [{ path: undefined }] // No path data
                }]
            } as any;

            const facilities = FacilityDataService.getFacilitiesAlongRoute(mockRoute, 50);

            // Should still return facilities based on start/end points
            expect(facilities.length).toBeGreaterThan(0);
        });
    });

    describe('Integration with existing facilities', () => {
        it('should work with all demo facilities', () => {
            const allFacilities = FacilityDataService.getAllFacilities();
            expect(allFacilities.length).toBe(3); // Verify we have our demo facilities

            // Create a route that should capture all facilities
            const wideRoute = createMockRoute([
                { lat: 22.0000, lng: 86.0000 },
                { lat: 24.0000, lng: 89.0000 }
            ]);

            const facilitiesAlongRoute = FacilityDataService.getFacilitiesAlongRoute(wideRoute, 100);
            expect(facilitiesAlongRoute.length).toBe(3); // Should capture all facilities with large radius
        });
    });
});