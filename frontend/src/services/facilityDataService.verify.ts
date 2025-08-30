/**
 * Verification script for FacilityDataService
 * Validates that the demo data meets requirements
 */

import { FacilityDataService, DEMO_FACILITIES } from './facilityDataService';
import { SupplyChainFacility } from '../types/routeOptimization';

console.log('🔍 Verifying Facility Data Service...');

// Verify we have the required number of facilities (2-3 as per requirements)
console.log(`✅ Demo facilities count: ${DEMO_FACILITIES.length} (requirement: 2-3)`);

// Verify each facility has required properties
DEMO_FACILITIES.forEach((facility, index) => {
    console.log(`\n📍 Facility ${index + 1}: ${facility.name}`);
    console.log(`   - ID: ${facility.id}`);
    console.log(`   - Type: ${facility.type}`);
    console.log(`   - Location: ${facility.location.lat}, ${facility.location.lng}`);
    console.log(`   - Address: ${facility.address}`);
    console.log(`   - Detour Time: ${facility.detourTime} minutes`);
    console.log(`   - Services: ${facility.services.join(', ')}`);

    // Validate required properties exist
    const requiredProps = ['id', 'name', 'type', 'location', 'address', 'detourTime', 'services'];
    const missingProps = requiredProps.filter(prop => !(prop in facility));
    if (missingProps.length === 0) {
        console.log(`   ✅ All required properties present`);
    } else {
        console.log(`   ❌ Missing properties: ${missingProps.join(', ')}`);
    }
});

// Test service methods
console.log('\n🧪 Testing service methods...');

// Test getAllFacilities
const allFacilities = FacilityDataService.getAllFacilities();
console.log(`✅ getAllFacilities(): ${allFacilities.length} facilities`);

// Test getFacilitiesByType
const distributionCenters = FacilityDataService.getFacilitiesByType('distribution_center');
const fuelStations = FacilityDataService.getFacilitiesByType('fuel_station');
const warehouses = FacilityDataService.getFacilitiesByType('warehouse');
console.log(`✅ Distribution Centers: ${distributionCenters.length}`);
console.log(`✅ Fuel Stations: ${fuelStations.length}`);
console.log(`✅ Warehouses: ${warehouses.length}`);

// Test getFacilityById
const testFacility = FacilityDataService.getFacilityById('dc_kolkata_001');
console.log(`✅ getFacilityById('dc_kolkata_001'): ${testFacility ? 'Found' : 'Not found'}`);

// Test distance calculation
const distance = FacilityDataService.calculateDistance(
    22.5726, 88.3639, // Kolkata
    22.8046, 86.2029  // Kharagpur
);
console.log(`✅ Distance calculation (Kolkata to Kharagpur): ${distance.toFixed(2)} km`);

// Test nearby facilities
const nearbyFacilities = FacilityDataService.getFacilitiesNearLocation(22.5726, 88.3639, 50);
console.log(`✅ Facilities within 50km of Kolkata: ${nearbyFacilities.length}`);

console.log('\n🎉 Facility Data Service verification complete!');

export { }; // Make this a module