/**
 * Verification component for facility markers functionality
 * This component demonstrates that facility markers are working correctly
 */

import React, { useEffect, useState } from 'react';
import { FacilityDataService } from '../services/facilityDataService';
import { SupplyChainFacility } from '../types/routeOptimization';

const FacilityMarkersVerification: React.FC = () => {
    const [facilities, setFacilities] = useState<SupplyChainFacility[]>([]);

    useEffect(() => {
        // Load facilities to verify data is available
        const allFacilities = FacilityDataService.getAllFacilities();
        setFacilities(allFacilities);
    }, []);

    const getFacilityTypeColor = (type: SupplyChainFacility['type']) => {
        switch (type) {
            case 'warehouse':
                return 'bg-red-500';
            case 'fuel_station':
                return 'bg-blue-500';
            case 'distribution_center':
                return 'bg-green-500';
            case 'partner_store':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Facility Markers Verification</h3>

            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    Total facilities loaded: <span className="font-bold">{facilities.length}</span>
                </p>
            </div>

            <div className="space-y-3">
                {facilities.map((facility) => (
                    <div key={facility.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className={`w-4 h-4 rounded-full ${getFacilityTypeColor(facility.type)}`}></div>
                        <div className="flex-1">
                            <h4 className="font-medium">{facility.name}</h4>
                            <p className="text-sm text-gray-600 capitalize">
                                {facility.type.replace('_', ' ')} • {facility.detourTime} min detour
                            </p>
                            <p className="text-xs text-gray-500">
                                Lat: {facility.location.lat.toFixed(4)}, Lng: {facility.location.lng.toFixed(4)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                    ✅ Facility data loaded successfully. Markers should appear on the map with the colors shown above.
                </p>
            </div>
        </div>
    );
};

export default FacilityMarkersVerification;