/**
 * Demo component to verify route-based facility filtering functionality
 */

import React, { useState } from 'react';
import { FacilityDataService } from '../services/facilityDataService';
import { SupplyChainFacility } from '../types/routeOptimization';

const RouteBasedFacilityFilteringDemo: React.FC = () => {
    const [filteredFacilities, setFilteredFacilities] = useState<SupplyChainFacility[]>([]);
    const [routeDescription, setRouteDescription] = useState<string>('');

    // Mock route data for demonstration
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

    const testRouteScenarios = [
        {
            name: 'Kolkata to Kharagpur Route',
            description: 'Route passing through Kolkata center and Kharagpur area',
            coordinates: [
                { lat: 22.5726, lng: 88.3639 }, // Kolkata center
                { lat: 22.8046, lng: 86.2029 }  // Kharagpur
            ]
        },
        {
            name: 'Wide Bengal Route',
            description: 'Route covering multiple districts in West Bengal',
            coordinates: [
                { lat: 22.5726, lng: 88.3639 }, // Kolkata
                { lat: 22.8046, lng: 86.2029 }, // Kharagpur
                { lat: 23.5204, lng: 87.3119 }  // Durgapur
            ]
        },
        {
            name: 'Narrow City Route',
            description: 'Short route within Kolkata city limits',
            coordinates: [
                { lat: 22.5726, lng: 88.3639 }, // Kolkata center
                { lat: 22.6000, lng: 88.4000 }  // Nearby area
            ]
        }
    ];

    const testRouteFiltering = (scenarioIndex: number) => {
        const scenario = testRouteScenarios[scenarioIndex];
        const mockRoute = createMockRoute(scenario.coordinates);
        const facilities = FacilityDataService.getFacilitiesAlongRoute(mockRoute, 5);

        setFilteredFacilities(facilities);
        setRouteDescription(scenario.description);
    };

    const showAllFacilities = () => {
        const allFacilities = FacilityDataService.getAllFacilities();
        setFilteredFacilities(allFacilities);
        setRouteDescription('All available facilities (no route filtering)');
    };

    const clearFacilities = () => {
        setFilteredFacilities([]);
        setRouteDescription('No facilities displayed');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Route-Based Facility Filtering Demo
            </h2>

            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Test Scenarios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {testRouteScenarios.map((scenario, index) => (
                            <button
                                key={index}
                                onClick={() => testRouteFiltering(index)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                            >
                                {scenario.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={showAllFacilities}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                        Show All Facilities
                    </button>
                    <button
                        onClick={clearFacilities}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        Clear
                    </button>
                </div>

                {routeDescription && (
                    <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-800">
                            <strong>Current Filter:</strong> {routeDescription}
                        </p>
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        Filtered Facilities ({filteredFacilities.length})
                    </h3>

                    {filteredFacilities.length === 0 ? (
                        <p className="text-gray-500 italic">No facilities to display</p>
                    ) : (
                        <div className="space-y-2">
                            {filteredFacilities.map((facility) => (
                                <div key={facility.id} className="border rounded p-3 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{facility.name}</h4>
                                            <p className="text-sm text-gray-600 capitalize">
                                                {facility.type.replace('_', ' ')}
                                            </p>
                                            <p className="text-xs text-gray-500">{facility.address}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`w-4 h-4 rounded-full ${facility.type === 'distribution_center' ? 'bg-green-500' :
                                                    facility.type === 'fuel_station' ? 'bg-blue-500' :
                                                        facility.type === 'warehouse' ? 'bg-red-500' :
                                                            'bg-orange-500'
                                                }`}></div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                ~{facility.detourTime}min
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-yellow-50 p-4 rounded">
                    <h4 className="font-medium text-yellow-800 mb-2">How it works:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Route coordinates are analyzed to create a 5km corridor</li>
                        <li>• Facilities within this corridor are identified using distance calculations</li>
                        <li>• Only relevant facilities along the route path are displayed</li>
                        <li>• This reduces visual clutter and focuses on actionable stops</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RouteBasedFacilityFilteringDemo;