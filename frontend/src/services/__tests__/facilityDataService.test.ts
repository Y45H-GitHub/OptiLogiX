/**
 * Tests for FacilityDataService
 */

import { describe, it, expect } from 'vitest';
import { FacilityDataService, DEMO_FACILITIES } from '../facilityDataService';

describe('FacilityDataService', () => {
    it('should return all demo facilities', () => {
        const facilities = FacilityDataService.getAllFacilities();
        expect(facilities).toHaveLength(3);
        expect(facilities).toEqual(DEMO_FACILITIES);
    });

    it('should filter facilities by type', () => {
        const distributionCenters = FacilityDataService.getFacilitiesByType('distribution_center');
        expect(distributionCenters).toHaveLength(1);
        expect(distributionCenters[0].name).toBe('Kolkata Central Distribution Hub');

        const fuelStations = FacilityDataService.getFacilitiesByType('fuel_station');
        expect(fuelStations).toHaveLength(1);
        expect(fuelStations[0].name).toBe('Highway Fuel Station NH-2');

        const warehouses = FacilityDataService.getFacilitiesByType('warehouse');
        expect(warehouses).toHaveLength(1);
        expect(warehouses[0].name).toBe('Durgapur Industrial Warehouse');
    });

    it('should find facility by ID', () => {
        const facility = FacilityDataService.getFacilityById('dc_kolkata_001');
        expect(facility).toBeDefined();
        expect(facility?.name).toBe('Kolkata Central Distribution Hub');

        const nonExistent = FacilityDataService.getFacilityById('non_existent');
        expect(nonExistent).toBeUndefined();
    });

    it('should calculate distance between coordinates', () => {
        // Distance between Kolkata and Kharagpur (approximately 120km)
        const distance = FacilityDataService.calculateDistance(
            22.5726, 88.3639, // Kolkata
            22.8046, 86.2029  // Kharagpur
        );
        expect(distance).toBeGreaterThan(100);
        expect(distance).toBeLessThan(150);
    });

    it('should find facilities near a location', () => {
        // Search near Kolkata center
        const nearbyFacilities = FacilityDataService.getFacilitiesNearLocation(
            22.5726, 88.3639, // Kolkata center
            10 // 10km radius
        );

        // Should find at least the Kolkata distribution center
        expect(nearbyFacilities.length).toBeGreaterThan(0);
        expect(nearbyFacilities.some(f => f.id === 'dc_kolkata_001')).toBe(true);
    });

    it('should validate facility data structure', () => {
        DEMO_FACILITIES.forEach(facility => {
            expect(facility.id).toBeDefined();
            expect(facility.name).toBeDefined();
            expect(facility.type).toMatch(/^(distribution_center|fuel_station|warehouse|partner_store)$/);
            expect(facility.location.lat).toBeTypeOf('number');
            expect(facility.location.lng).toBeTypeOf('number');
            expect(facility.address).toBeDefined();
            expect(facility.detourTime).toBeTypeOf('number');
            expect(Array.isArray(facility.services)).toBe(true);
        });
    });
});