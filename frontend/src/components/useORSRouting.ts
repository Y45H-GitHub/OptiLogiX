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
  const [currentRoute, setCurrentRoute] = useState<google.maps.DirectionsRoute | null>(null);

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
      // Fallback: Create a mock route for testing when Google Maps is not available
      console.log('Google Maps not available, creating mock route for testing');

      // Create a mock route object for testing
      const mockRoute = {
        legs: [{
          start_location: { lat: () => 22.5726, lng: () => 88.3639 }, // Kolkata
          end_location: { lat: () => 23.5204, lng: () => 87.3119 }, // Durgapur
          distance: { value: 160000, text: '160 km' },
          duration: { value: 10800, text: '3 hours' },
          steps: [
            { instructions: 'Head north on Park Street toward Chowringhee Road' },
            { instructions: 'Turn right onto Chowringhee Road' },
            { instructions: 'Continue on NH-2 toward Durgapur' },
            { instructions: 'Take the exit toward City Centre, Durgapur' },
            { instructions: 'Arrive at destination' }
          ]
        }]
      } as google.maps.DirectionsRoute;

      const steps = mockRoute.legs[0].steps.map(step => step.instructions);
      setDirectionsSteps(steps);
      setDistanceKm(160); // Mock distance
      setDurationText('3 hours');
      setCurrentRoute(mockRoute);

      toast.success('Mock route created for testing (Google Maps unavailable)');
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
        const route = response.routes[0];
        const leg = route.legs[0];
        const steps = leg.steps.map(step => step.instructions);
        setDirectionsSteps(steps);
        setDistanceKm(leg.distance?.value ? leg.distance.value / 1000 : 0);
        setDurationText(leg.duration?.text || '');
        setCurrentRoute(route);
        toast.success('Route loaded successfully!');
      } else {
        toast.error(`Directions request failed: No routes found.`);
        setDirectionsSteps(['No route found.']);
        setDistanceKm(0);
        setDurationText('');
        setCurrentRoute(null);
      }
    } catch (error: unknown) {
      toast.error(`Error fetching directions: ${(error as Error).message}`);
      setDirectionsSteps(['Error fetching route.']);
      setCurrentRoute(null);
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
    durationText,
    currentRoute
  };
};

export default useORSRouting;
