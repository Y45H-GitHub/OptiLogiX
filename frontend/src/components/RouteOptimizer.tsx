import { useState, useEffect, useRef, useCallback } from 'react';
import RouteResults from './RouteResults';
import useGoogleMaps from './useGoogleMaps';
import useORSRouting from './useORSRouting';
import useCO2Estimator from '../hooks/useCO2Estimator';
import RouteInputForm from './RouteInputForm';
import OptimizationSuggestionsPanel from './OptimizationSuggestionsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { OptimizationSuggestion } from '../types/routeOptimization';
import { RouteOptimizationService } from '../services/routeOptimizationService';
import { FacilityDataService } from '../services/facilityDataService';

const RouteOptimizer = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { directionsRendererRef, speakDirections, showAllFacilities, showFacilitiesAlongRoute, highlightFacility } = useGoogleMaps(mapRef);

  const [selectedMode, setSelectedMode] = useState<'truck' | 'rail' | 'air'>('truck');
  const { source, setSource, destination, setDestination, weight, setWeight, loading, directionsSteps, optimizeRoute, recommendation, distanceKm, currentRoute } = useORSRouting({ directionsRenderer: directionsRendererRef.current, selectedMode });
  const { co2Emissions } = useCO2Estimator(distanceKm, parseFloat(weight), selectedMode);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [mapEnhancementsEnabled, setMapEnhancementsEnabled] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (directionsSteps.length > 0) {
      setCurrentStepIndex(0);
      speakDirections(directionsSteps[0]);
    }
  }, [directionsSteps]);

  // Show facility markers when the component mounts and map is ready
  useEffect(() => {
    if (!mapEnhancementsEnabled) return;

    const timer = setTimeout(() => {
      try {
        showAllFacilities();
      } catch (error) {
        console.error('Error showing facilities:', error);
        setMapError('Failed to load facility markers');
        setMapEnhancementsEnabled(false);
      }
    }, 1000); // Small delay to ensure map is fully loaded

    return () => clearTimeout(timer);
  }, [showAllFacilities, mapEnhancementsEnabled]);

  // Filter and show facilities along route when route is calculated
  useEffect(() => {
    if (!mapEnhancementsEnabled) return;

    if (currentRoute) {
      try {
        showFacilitiesAlongRoute(currentRoute);

        // Generate optimization suggestions based on facilities along the route
        const facilitiesAlongRoute = FacilityDataService.getFacilitiesAlongRoute(currentRoute, 5);
        const suggestions = RouteOptimizationService.generateSuggestions(facilitiesAlongRoute, selectedMode);
        setOptimizationSuggestions(suggestions);
      } catch (error) {
        console.error('Error processing route facilities:', error);
        setMapError('Failed to process route facilities');
        // Don't disable enhancements completely, just clear suggestions
        setOptimizationSuggestions([]);
      }
    } else {
      setOptimizationSuggestions([]);
    }
  }, [currentRoute, showFacilitiesAlongRoute, selectedMode, mapEnhancementsEnabled]);

  // Demo effect: Show sample suggestions when source and destination are set (for testing without full route)
  useEffect(() => {
    if (!mapEnhancementsEnabled) return;

    if (source && destination && !currentRoute) {
      try {
        // Generate demo suggestions using all facilities for testing
        const allFacilities = FacilityDataService.getAllFacilities();
        const demoSuggestions = RouteOptimizationService.generateSuggestions(allFacilities, selectedMode);
        setOptimizationSuggestions(demoSuggestions);
      } catch (error) {
        console.error('Error generating demo suggestions:', error);
        setOptimizationSuggestions([]);
      }
    }
  }, [source, destination, currentRoute, selectedMode, mapEnhancementsEnabled]);

  // Handle suggestion hover to highlight facility on map
  const handleSuggestionHover = useCallback((suggestion: OptimizationSuggestion | null) => {
    if (!mapEnhancementsEnabled) return;

    try {
      if (suggestion) {
        highlightFacility(suggestion.facility.id);
      } else {
        highlightFacility(null);
      }
    } catch (error) {
      console.error('Error highlighting facility:', error);
      // Don't disable enhancements for this minor error
    }
  }, [highlightFacility, mapEnhancementsEnabled]);

  // Handle suggestion click for future implementation
  const handleSuggestionClick = useCallback((suggestion: OptimizationSuggestion) => {
    console.log('Suggestion clicked:', suggestion);
    // Future implementation: Add waypoint to route
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <RouteInputForm {...{ source, setSource, destination, setDestination, weight, setWeight, selectedMode, setSelectedMode, optimizeRoute, loading }} />

      <div className="relative">
        <div id="map" ref={mapRef} style={{ height: '500px', width: '100%' }} />

        {/* Error message overlay if map enhancements fail */}
        {mapError && (
          <div className="absolute top-2 left-2 right-2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded-md text-sm">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <span>{mapError} - Route optimization continues to work normally</span>
              <button
                onClick={() => setMapError(null)}
                className="ml-auto text-yellow-700 hover:text-yellow-900"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Fallback message if map fails to load completely */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg" style={{ display: 'none' }} id="map-fallback">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Loading...</h3>
            <p className="text-sm text-gray-500">
              If the map doesn't load, you can still use the route optimization features below.
            </p>
          </div>
        </div>
      </div>

      <RouteResults directions={directionsSteps} speakDirections={speakDirections} />

      {directionsSteps && directionsSteps.length > 0 && (
        <div className="p-4 border rounded-md shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2">Directions</h2>
          <div>
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => {
                  const newIndex = Math.max(0, currentStepIndex - 1);
                  setCurrentStepIndex(newIndex);
                  speakDirections(directionsSteps[newIndex]);
                }}
                disabled={currentStepIndex === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const newIndex = Math.min(directionsSteps.length - 1, currentStepIndex + 1);
                  setCurrentStepIndex(newIndex);
                  speakDirections(directionsSteps[newIndex]);
                }}
                disabled={currentStepIndex === directionsSteps.length - 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
            {directionsSteps.length > 0 && (
              <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#333', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                {directionsSteps[currentStepIndex].replace(/<[^>]*>/g, '')}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-4 border rounded-md shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-2">Travel Mode Recommendation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className={cn("transition-all duration-300", recommendation === 'TRUCK' && "border-blue-500 ring-2 ring-blue-500 shadow-lg animate-blink")}>
            <CardHeader>
              <CardTitle>Truck</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Recommended for weights less than 50 kg.</p>
            </CardContent>
          </Card>
          <Card className={cn("transition-all duration-300", recommendation === 'TRAIN' && "border-blue-500 ring-2 ring-blue-500 shadow-lg animate-blink")}>
            <CardHeader>
              <CardTitle>Train</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Recommended for weights between 50 kg and 100 kg.</p>
            </CardContent>
          </Card>
          <Card className={cn("transition-all duration-300", recommendation === 'PLANE' && "border-blue-500 ring-2 ring-blue-500 shadow-lg animate-blink")}>
            <CardHeader>
              <CardTitle>Plane</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Recommended for weights over 100 kg.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-4 border rounded-md shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-2">CO₂ Emissions Estimate</h2>
        <p className="text-lg">Estimated CO₂ Emissions: <span className="font-bold">{co2Emissions} grams</span></p>
      </div>

      {mapEnhancementsEnabled && (
        <OptimizationSuggestionsPanel
          suggestions={optimizationSuggestions}
          onSuggestionHover={handleSuggestionHover}
          onSuggestionClick={handleSuggestionClick}
        />
      )}
    </div>
  );
};

export default RouteOptimizer;
