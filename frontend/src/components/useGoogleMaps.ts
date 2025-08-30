import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const useGoogleMaps = (mapContainerRef: React.RefObject<HTMLDivElement>) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      toast.error('Google Maps API key missing.');
      return;
    }

    const scriptId = 'google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        const map = new window.google.maps.Map(mapContainerRef.current as HTMLElement, {
          center: { lat: 22.5726, lng: 88.3639 },
          zoom: 10,
        });
        mapRef.current = map;
        const renderer = new window.google.maps.DirectionsRenderer();
        renderer.setMap(map);
        directionsRendererRef.current = renderer;
      };

      script.onerror = () => {
        toast.error('Google Maps script failed to load.');
      };
    }
  }, []);

  const speakDirections = (step: string) => {
    const renderer = directionsRendererRef.current;
    if (!renderer || !renderer.getDirections()) {
      toast.info('No directions available to speak.');
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(step.replace(/<[^>]*>/g, ''));
    window.speechSynthesis.speak(utterance);
  };

  return { mapRef, directionsRendererRef, speakDirections };
};

export default useGoogleMaps;
