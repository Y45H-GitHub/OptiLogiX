import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { SupplyChainFacility } from '../types/routeOptimization';
import { FacilityDataService } from '../services/facilityDataService';

const useGoogleMaps = (mapContainerRef: React.RefObject<HTMLDivElement>) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const facilityMarkersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key missing from environment variables');
      toast.error('Google Maps API key missing.');
      // Show fallback map
      const fallbackElement = document.getElementById('map-fallback');
      if (fallbackElement) {
        fallbackElement.style.display = 'flex';
      }
      return;
    }

    console.log('Loading Google Maps with API key:', apiKey.substring(0, 10) + '...');

    const scriptId = 'google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.log('Google Maps script loaded successfully');
        try {
          if (!mapContainerRef.current) {
            console.error('Map container ref is null');
            return;
          }

          const map = new window.google.maps.Map(mapContainerRef.current as HTMLElement, {
            center: { lat: 22.5726, lng: 88.3639 },
            zoom: 10,
          });
          mapRef.current = map;

          const renderer = new window.google.maps.DirectionsRenderer();
          renderer.setMap(map);
          directionsRendererRef.current = renderer;

          // Initialize info window for facility markers
          infoWindowRef.current = new window.google.maps.InfoWindow();

          console.log('Google Maps initialized successfully');
          toast.success('Google Maps loaded successfully');

          // Hide fallback if it was shown
          const fallbackElement = document.getElementById('map-fallback');
          if (fallbackElement) {
            fallbackElement.style.display = 'none';
          }
        } catch (error) {
          console.error('Error initializing Google Maps:', error);
          toast.error('Error initializing Google Maps - Route optimization will continue to work');
          // Show fallback map
          const fallbackElement = document.getElementById('map-fallback');
          if (fallbackElement) {
            fallbackElement.style.display = 'flex';
          }
        }
      };

      script.onerror = (error) => {
        console.error('Google Maps script failed to load:', error);
        toast.error('Google Maps script failed to load. Route optimization continues to work normally.');
        // Show fallback map
        const fallbackElement = document.getElementById('map-fallback');
        if (fallbackElement) {
          fallbackElement.style.display = 'flex';
        }
      };
    } else {
      // Script already exists, check if Google Maps is available
      if (window.google && window.google.maps && mapContainerRef.current && !mapRef.current) {
        console.log('Google Maps already loaded, initializing map');
        try {
          const map = new window.google.maps.Map(mapContainerRef.current as HTMLElement, {
            center: { lat: 22.5726, lng: 88.3639 },
            zoom: 10,
          });
          mapRef.current = map;

          const renderer = new window.google.maps.DirectionsRenderer();
          renderer.setMap(map);
          directionsRendererRef.current = renderer;

          // Initialize info window for facility markers
          infoWindowRef.current = new window.google.maps.InfoWindow();

          console.log('Google Maps initialized from existing script');

          // Hide fallback if it was shown
          const fallbackElement = document.getElementById('map-fallback');
          if (fallbackElement) {
            fallbackElement.style.display = 'none';
          }
        } catch (error) {
          console.error('Error initializing Google Maps from existing script:', error);
          // Show fallback map
          const fallbackElement = document.getElementById('map-fallback');
          if (fallbackElement) {
            fallbackElement.style.display = 'flex';
          }
        }
      }
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

  // Get marker color based on facility type
  const getFacilityMarkerColor = (facilityType: SupplyChainFacility['type']): string => {
    switch (facilityType) {
      case 'warehouse':
        return 'red';
      case 'fuel_station':
        return 'blue';
      case 'distribution_center':
        return 'green';
      case 'partner_store':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // Clear existing facility markers
  const clearFacilityMarkers = useCallback(() => {
    facilityMarkersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    facilityMarkersRef.current = [];
  }, []);

  // Add facility markers to the map
  const addFacilityMarkers = useCallback((facilities: SupplyChainFacility[]) => {
    try {
      const map = mapRef.current;
      if (!map || !window.google) {
        console.warn('Map or Google Maps API not available for facility markers');
        return;
      }

      // Clear existing markers first
      clearFacilityMarkers();

      facilities.forEach(facility => {
        try {
          const marker = new window.google.maps.Marker({
            position: facility.location,
            map: map,
            title: facility.name,
            icon: {
              url: `https://maps.google.com/mapfiles/ms/icons/${getFacilityMarkerColor(facility.type)}-dot.png`,
              scaledSize: new window.google.maps.Size(32, 32)
            }
          });

          // Add click listener for info window
          marker.addListener('click', () => {
            try {
              const infoWindow = infoWindowRef.current;
              if (infoWindow) {
                const contentString = `
                  <div style="padding: 8px; max-width: 250px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${facility.name}</h3>
                    <p style="margin: 0 0 4px 0; color: #666; text-transform: capitalize;">
                      <strong>Type:</strong> ${facility.type.replace('_', ' ')}
                    </p>
                    <p style="margin: 0 0 4px 0; color: #666;">
                      <strong>Address:</strong> ${facility.address}
                    </p>
                    <p style="margin: 0; color: #666;">
                      <strong>Detour Time:</strong> ~${facility.detourTime} minutes
                    </p>
                  </div>
                `;
                infoWindow.setContent(contentString);
                infoWindow.open(map, marker);
              }
            } catch (error) {
              console.error('Error opening info window for facility:', facility.name, error);
            }
          });

          facilityMarkersRef.current.push(marker);
        } catch (error) {
          console.error('Error creating marker for facility:', facility.name, error);
        }
      });
    } catch (error) {
      console.error('Error adding facility markers:', error);
      throw error; // Re-throw to be caught by parent component
    }
  }, [clearFacilityMarkers]);

  // Show all available facilities on the map
  const showAllFacilities = useCallback(() => {
    try {
      const facilities = FacilityDataService.getAllFacilities();
      addFacilityMarkers(facilities);
    } catch (error) {
      console.error('Error showing all facilities:', error);
      throw error; // Re-throw to be caught by parent component
    }
  }, [addFacilityMarkers]);

  // Show facilities filtered by route proximity
  const showFacilitiesAlongRoute = useCallback((route: google.maps.DirectionsRoute | null) => {
    try {
      if (!route) {
        // If no route, clear facility markers
        clearFacilityMarkers();
        return;
      }

      const facilitiesAlongRoute = FacilityDataService.getFacilitiesAlongRoute(route, 5);
      addFacilityMarkers(facilitiesAlongRoute);
    } catch (error) {
      console.error('Error showing facilities along route:', error);
      throw error; // Re-throw to be caught by parent component
    }
  }, [addFacilityMarkers, clearFacilityMarkers]);

  // Highlight a specific facility on the map
  const highlightFacility = useCallback((facilityId: string | null) => {
    try {
      if (!window.google) {
        console.warn('Google Maps API not available for facility highlighting');
        return;
      }

      facilityMarkersRef.current.forEach(marker => {
        try {
          const title = marker.getTitle();
          const facility = FacilityDataService.getAllFacilities().find(f => f.name === title);

          if (facilityId && facility && facility.id === facilityId) {
            // Highlight the marker by making it bounce and changing size
            marker.setAnimation(window.google.maps.Animation.BOUNCE);
            marker.setIcon({
              url: `https://maps.google.com/mapfiles/ms/icons/${getFacilityMarkerColor(facility.type)}-dot.png`,
              scaledSize: new window.google.maps.Size(40, 40) // Larger size for highlight
            });

            // Stop bouncing after 2 seconds
            setTimeout(() => {
              try {
                marker.setAnimation(null);
              } catch (error) {
                console.error('Error stopping marker animation:', error);
              }
            }, 2000);
          } else {
            // Reset to normal state
            marker.setAnimation(null);
            if (facility) {
              marker.setIcon({
                url: `https://maps.google.com/mapfiles/ms/icons/${getFacilityMarkerColor(facility.type)}-dot.png`,
                scaledSize: new window.google.maps.Size(32, 32) // Normal size
              });
            }
          }
        } catch (error) {
          console.error('Error highlighting individual marker:', error);
        }
      });
    } catch (error) {
      console.error('Error highlighting facility:', error);
      // Don't throw here as this is a non-critical feature
    }
  }, []);

  return {
    mapRef,
    directionsRendererRef,
    speakDirections,
    addFacilityMarkers,
    clearFacilityMarkers,
    showAllFacilities,
    showFacilitiesAlongRoute,
    highlightFacility
  };
};

export default useGoogleMaps;
