import React, { useState, useEffect, useRef, useCallback } from 'react';
import RouteResults from './RouteResults';
import useGoogleMaps from './useGoogleMaps';
import useORSRouting from './useORSRouting';
import useCO2Estimator from '../hooks/useCO2Estimator';
import RouteInputForm from './RouteInputForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const RouteOptimizer = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { directionsRendererRef, speakDirections } = useGoogleMaps(mapRef);

   const [selectedMode, setSelectedMode] = useState<'truck' | 'rail' | 'air'>('truck');
   const { source, setSource, destination, setDestination, weight, setWeight, loading, setLoading, directionsSteps, setDirectionsSteps, optimizeRoute, recommendation, distanceKm } = useORSRouting({ directionsRenderer: directionsRendererRef.current, selectedMode });
   const { co2Emissions } = useCO2Estimator(distanceKm, parseFloat(weight), selectedMode);

   const [currentStepIndex, setCurrentStepIndex] = useState(0);

   useEffect(() => {
     if (directionsSteps.length > 0) {
       setCurrentStepIndex(0);
       speakDirections(directionsSteps[0]);
     }
   }, [directionsSteps]);

   return (
    <div className="max-w-6xl mx-auto space-y-6">
      <RouteInputForm {...{ source, setSource, destination, setDestination, weight, setWeight, selectedMode, setSelectedMode, optimizeRoute, loading }} />

      <div id="map" ref={mapRef} style={{ height: '500px', width: '100%' }} />

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
    </div>
  );
};

export default RouteOptimizer;
