/**
 * Demo component for Optimization Suggestions Panel
 * Shows the panel working independently of Google Maps
 */

import React, { useState } from 'react';
import OptimizationSuggestionsPanel from './OptimizationSuggestionsPanel';
import { OptimizationSuggestion } from '../types/routeOptimization';
import { RouteOptimizationService } from '../services/routeOptimizationService';
import { FacilityDataService } from '../services/facilityDataService';

const OptimizationSuggestionsPanelDemo: React.FC = () => {
    const [selectedMode, setSelectedMode] = useState<'truck' | 'rail' | 'air'>('truck');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Generate demo suggestions
    const allFacilities = FacilityDataService.getAllFacilities();
    const suggestions = RouteOptimizationService.generateSuggestions(allFacilities, selectedMode);

    const handleSuggestionHover = (suggestion: OptimizationSuggestion | null) => {
        if (suggestion) {
            console.log('Hovering over suggestion:', suggestion.facility.name);
        } else {
            console.log('Stopped hovering');
        }
    };

    const handleSuggestionClick = (suggestion: OptimizationSuggestion) => {
        console.log('Clicked suggestion:', suggestion);
        alert(`Clicked: ${suggestion.description}`);
    };

    return (
        <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Optimization Suggestions Demo</h2>

                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transport Mode
                        </label>
                        <select
                            value={selectedMode}
                            onChange={(e) => setSelectedMode(e.target.value as 'truck' | 'rail' | 'air')}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="truck">Truck</option>
                            <option value="rail">Rail</option>
                            <option value="air">Air</option>
                        </select>
                    </div>

                    <button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        {showSuggestions ? 'Hide' : 'Show'} Optimization Suggestions
                    </button>
                </div>
            </div>

            {showSuggestions && (
                <OptimizationSuggestionsPanel
                    suggestions={suggestions}
                    onSuggestionHover={handleSuggestionHover}
                    onSuggestionClick={handleSuggestionClick}
                />
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Demo Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Click "Show Optimization Suggestions" to see the panel</li>
                    <li>• Hover over suggestions to see console logs</li>
                    <li>• Click suggestions to see alerts</li>
                    <li>• Change transport mode to see different suggestions</li>
                </ul>
            </div>
        </div>
    );
};

export default OptimizationSuggestionsPanelDemo;