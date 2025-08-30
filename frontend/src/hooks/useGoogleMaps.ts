import React, { useState, useEffect, useRef } from 'react';

interface MapOptions extends google.maps.MapOptions {
  center: google.maps.LatLngLiteral;
  zoom: number;
}

interface MarkerOptions extends google.maps.MarkerOptions {
  position: google.maps.LatLngLiteral;
}

interface GoogleMapsHook { 
  map: google.maps.Map | null;
  marker: google.maps.Marker | null;
  mapRef: React.RefObject<HTMLDivElement>;
}

const useGoogleMaps = (apiKey: string, mapOptions: MapOptions, markerOptions?: MarkerOptions): GoogleMapsHook => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!document.getElementById('google-maps-script')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.id = 'google-maps-script';
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (mapRef.current && !map) {
        const googleMap = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(googleMap);

        if (markerOptions) {
          const googleMarker = new window.google.maps.Marker({
            map: googleMap,
            ...markerOptions,
          });
          setMarker(googleMarker);
        }
      }
    };

    loadGoogleMapsScript();

    return () => {
      // Cleanup function if needed
    };
  }, [apiKey, mapOptions, markerOptions, map]);

  return { map, marker, mapRef };
};

export default useGoogleMaps;