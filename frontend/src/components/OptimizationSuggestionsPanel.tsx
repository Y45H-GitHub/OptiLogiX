/**
 * Optimization Suggestions Panel
 * Displays actionable route optimization suggestions with estimated savings
 */

import React from 'react';
import { OptimizationSuggestion } from '../types/routeOptimization';
import { RouteOptimizationService } from '../services/routeOptimizationService';

interface OptimizationSuggestionsPanelProps {
    suggestions: OptimizationSuggestion[];
    onSuggestionHover?: (suggestion: OptimizationSuggestion | null) => void;
    onSuggestionClick?: (suggestion: OptimizationSuggestion) => void;
}

const OptimizationSuggestionsPanel: React.FC<OptimizationSuggestionsPanelProps> = ({
    suggestions,
    onSuggestionHover,
    onSuggestionClick
}) => {
    if (suggestions.length === 0) {
        return (
            <div className="p-4 border rounded-md shadow-sm bg-white">
                <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="mr-2">💡</span>
                    Route Optimization Suggestions
                </h2>
                <p className="text-gray-500 text-sm">
                    Calculate a route to see optimization suggestions
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-md shadow-sm bg-white">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Route Optimization Suggestions
            </h2>

            <div className="space-y-3">
                {suggestions.map((suggestion) => (
                    <div
                        key={suggestion.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${RouteOptimizationService.getSuggestionColor(suggestion.type)}`}
                        onMouseEnter={() => onSuggestionHover?.(suggestion)}
                        onMouseLeave={() => onSuggestionHover?.(null)}
                        onClick={() => onSuggestionClick?.(suggestion)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <span className="text-xl mr-2">
                                        {RouteOptimizationService.getSuggestionIcon(suggestion.type)}
                                    </span>
                                    <h3 className="font-semibold text-sm">
                                        {suggestion.type === 'fuel_stop' && 'Fuel Stop Available'}
                                        {suggestion.type === 'consolidation' && 'Warehouse Nearby'}
                                        {suggestion.type === 'pickup_optimization' && 'Distribution Hub Available'}
                                    </h3>
                                </div>

                                <p className="text-sm mb-3 leading-relaxed">
                                    {suggestion.description}
                                </p>

                                <div className="flex flex-wrap gap-3 text-xs">
                                    {suggestion.estimatedSavings.time > 0 && (
                                        <div className="flex items-center">
                                            <span className="mr-1">⏱️</span>
                                            <span className="font-medium">
                                                {suggestion.estimatedSavings.time} min saved
                                            </span>
                                        </div>
                                    )}

                                    {suggestion.estimatedSavings.fuel > 0 && (
                                        <div className="flex items-center">
                                            <span className="mr-1">⛽</span>
                                            <span className="font-medium">
                                                {suggestion.estimatedSavings.fuel}L saved
                                            </span>
                                        </div>
                                    )}

                                    {suggestion.estimatedSavings.cost > 0 && (
                                        <div className="flex items-center">
                                            <span className="mr-1">💰</span>
                                            <span className="font-medium">
                                                ₹{suggestion.estimatedSavings.cost} saved
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="ml-3 flex-shrink-0">
                                <button className="text-xs px-3 py-1 bg-white bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors">
                                    View Details
                                </button>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                            <div className="flex items-center text-xs">
                                <span className="mr-1">📍</span>
                                <span className="truncate">
                                    {suggestion.facility.name} • {suggestion.facility.detourTime} min detour
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                    💡 Hover over suggestions to highlight facilities on the map
                </p>
            </div>
        </div>
    );
};

export default OptimizationSuggestionsPanel;