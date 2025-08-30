import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface UseORSRoutingProps {
  directionsRenderer: google.maps.DirectionsRenderer | null;
  selectedMode: 'truck' | 'rail' | 'air';
}

const useORSRouting = ({ directionsRenderer, selectedMode }: UseORSRoutingProps) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');


  const [loading, setLoading] = useState(false);
  const [directionsSteps, setDirectionsSteps] = useState([]);
  const [recommendation, setRecommendation] = useState('');
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationText, setDurationText] = useState('');

  const optimizeRoute = useCallback(async () => {


    // Recommendation logic based on weight
    const weightNum = parseFloat(weight);
    if (!isNaN(weightNum)) {
      if (weightNum < 50) {
        setRecommendation('For this weight, Truck is recommended.');
      } else if (weightNum > 50 && weightNum <= 100) {
        setRecommendation('For this weight, Train is recommended.');
      } else {
        setRecommendation('For this weight, Plane is recommended.');
      }
    } else {
      setRecommendation('Please enter a valid weight for travel mode recommendation.');
    }

    if (!source || !destination) {
      toast.error('Please enter both source and destination.');
      return;
    }
    setLoading(true);
    setDirectionsSteps([]);

    if (selectedMode === 'air') {
      setDistanceKm(0);
      setDurationText('N/A');
      setLoading(false);
      setDirectionsSteps(['Air travel does not provide step-by-step directions.']);
      toast.success('CO2 estimated for air travel.');
      return;
    }

    if (!directionsRenderer) {
      toast.error('Directions renderer not initialized.');
      setLoading(false);
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    try {
      let travelMode: google.maps.TravelMode;
      let transitOptions: google.maps.TransitOptions | undefined;

      if (selectedMode === 'truck') {
        travelMode = google.maps.TravelMode.DRIVING;
      } else if (selectedMode === 'rail') {
        travelMode = google.maps.TravelMode.TRANSIT;
        transitOptions = { modes: [google.maps.TransitMode.TRAIN] };
      } else {
        // Fallback or error for unsupported modes
        toast.error('Unsupported travel mode selected.');
        setLoading(false);
        return;
      }

      const request: google.maps.DirectionsRequest = {
        origin: source,
        destination: destination,
        travelMode: travelMode,
        transitOptions: transitOptions,
      };

      const response = await directionsService.route(request);

      if (response.routes && response.routes.length > 0) {
        directionsRenderer.setDirections(response);
        const leg = response.routes[0].legs[0];
        const steps = leg.steps.map(step => step.instructions);
        setDirectionsSteps(steps);
        setDistanceKm(leg.distance?.value ? leg.distance.value / 1000 : 0);
        setDurationText(leg.duration?.text || '');
        toast.success('Route loaded successfully!');
      } else {
        toast.error(`Directions request failed: No routes found.`);
        setDirectionsSteps(['No route found.']);
        setDistanceKm(0);
        setDurationText('');
      }
    } catch (error: unknown) {
      toast.error(`Error fetching directions: ${(error as Error).message}`);
      setDirectionsSteps(['Error fetching route.']);
    } finally {
      setLoading(false);
    }
  }, [source, destination, directionsRenderer, selectedMode]);

  return {
    source, setSource,
    destination, setDestination,
    weight, setWeight,

    loading, setLoading,
    directionsSteps, setDirectionsSteps,
    optimizeRoute,
    recommendation,
    distanceKm,
    durationText
  };
};

export default useORSRouting;
