/**
 * Demo page for Route Optimizer with Facility Markers
 * This page demonstrates the enhanced map functionality
 */

import React from 'react';
import RouteOptimizer from '../components/RouteOptimizer';
import FacilityMarkersVerification from '../components/FacilityMarkersVerification';
import RouteBasedFacilityFilteringDemo from '../components/RouteBasedFacilityFilteringDemo';
import OptimizationSuggestionsPanelDemo from '../components/OptimizationSuggestionsPanelDemo';

const RouteOptimizerDemo: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Enhanced Route Optimizer
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Plan your logistics routes with integrated supply chain facility mapping.
                        See distribution centers, warehouses, and fuel stations along your route.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
                        <RouteOptimizer />
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <FacilityMarkersVerification />
                        <RouteBasedFacilityFilteringDemo />
                        <OptimizationSuggestionsPanelDemo />
                    </div>
                </div>

                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-blue-900 mb-4">
                        Facility Marker Legend
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Distribution Centers</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Fuel Stations</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Warehouses</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                            <span className="text-sm text-gray-700">Partner Stores</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                        Click on any facility marker to view detailed information including name, type, and estimated detour time.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RouteOptimizerDemo;