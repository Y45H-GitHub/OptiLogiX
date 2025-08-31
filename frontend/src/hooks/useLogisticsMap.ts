import { useEffect, useRef, useState } from 'react';
import { Order, BecknTrackingData, BecknLocation } from '@/types/logistics';
import { becknTrackingService } from '@/services/becknTrackingService';

interface UseLogisticsMapProps {
    apiKey: string;
    order?: Order | null;
    becknTrackingData?: BecknTrackingData | null;
}

export const useLogisticsMap = ({ apiKey, order, becknTrackingData }: UseLogisticsMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
    const [deliveryVehicleMarker, setDeliveryVehicleMarker] = useState<google.maps.Marker | null>(null);
    const [locationUpdateInterval, setLocationUpdateInterval] = useState<NodeJS.Timeout | null>(null);
    const [isMapReady, setIsMapReady] = useState<boolean>(false);

    // Debug logging
    useEffect(() => {
        console.log('useLogisticsMap: Hook initialized with:', {
            apiKey: apiKey ? 'Present' : 'Missing',
            mapRefCurrent: mapRef.current ? 'Present' : 'Missing',
            order: order ? order.id : 'None',
            becknTrackingData: becknTrackingData ? 'Present' : 'None'
        });
    }, [apiKey, order, becknTrackingData]);

    // Initialize map
    useEffect(() => {
        if (!apiKey) {
            console.warn('useLogisticsMap: Missing API key');
            return;
        }

        if (!mapRef.current) {
            console.warn('useLogisticsMap: Map container not ready, will retry...');
            // Retry after a short delay
            const retryTimer = setTimeout(() => {
                if (mapRef.current) {
                    console.log('useLogisticsMap: Map container now available, retrying initialization');
                    // Trigger re-run of this effect
                    setMap(null);
                }
            }, 100);
            return () => clearTimeout(retryTimer);
        }

        const initMap = () => {
            try {
                if (!mapRef.current) {
                    console.error('useLogisticsMap: Map container not available');
                    return;
                }

                // Check if container has dimensions
                const rect = mapRef.current.getBoundingClientRect();
                console.log('useLogisticsMap: Map container dimensions:', {
                    width: rect.width,
                    height: rect.height,
                    visible: rect.width > 0 && rect.height > 0
                });

                if (rect.width === 0 || rect.height === 0) {
                    console.warn('useLogisticsMap: Map container has no dimensions, retrying...');
                    setTimeout(initMap, 500);
                    return;
                }

                console.log('useLogisticsMap: Initializing map...');
                const mapInstance = new google.maps.Map(mapRef.current, {
                    center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
                    zoom: 4,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                });

                const directionsServiceInstance = new google.maps.DirectionsService();
                const directionsRendererInstance = new google.maps.DirectionsRenderer({
                    suppressMarkers: true, // We'll add custom markers
                    polylineOptions: {
                        strokeColor: '#2563eb',
                        strokeWeight: 4,
                        strokeOpacity: 0.8,
                    },
                });

                directionsRendererInstance.setMap(mapInstance);

                setMap(mapInstance);
                setDirectionsService(directionsServiceInstance);
                setDirectionsRenderer(directionsRendererInstance);
                setIsMapReady(true);
                console.log('useLogisticsMap: Map initialized successfully');

                // Trigger a resize after a short delay to ensure proper rendering
                setTimeout(() => {
                    if (mapInstance) {
                        google.maps.event.trigger(mapInstance, 'resize');
                        console.log('useLogisticsMap: Map resize triggered');
                    }
                }, 500);
            } catch (error) {
                console.error('useLogisticsMap: Error initializing map:', error);
            }
        };

        if (window.google && window.google.maps) {
            console.log('useLogisticsMap: Google Maps already loaded, initializing...');
            // Add a small delay to ensure the DOM is ready
            setTimeout(initMap, 100);
        } else {
            console.log('useLogisticsMap: Google Maps not loaded, checking for existing script...');
            // Check if script is already being loaded
            const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
            if (existingScript) {
                console.log('useLogisticsMap: Google Maps script already exists, waiting for load...');
                const checkGoogleMaps = () => {
                    if (window.google && window.google.maps) {
                        console.log('useLogisticsMap: Google Maps now available, initializing...');
                        setTimeout(initMap, 100);
                    } else {
                        setTimeout(checkGoogleMaps, 200);
                    }
                };
                checkGoogleMaps();
                return;
            }

            console.log('useLogisticsMap: Loading new Google Maps script...');
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('useLogisticsMap: Google Maps script loaded successfully');
                setTimeout(initMap, 100);
            };
            script.onerror = (error) => {
                console.error('useLogisticsMap: Failed to load Google Maps script:', error);
            };
            document.head.appendChild(script);

            return () => {
                // Don't remove script as it might be used by other components
                console.log('useLogisticsMap: Cleanup - not removing script as it may be shared');
            };
        }
    }, [apiKey, mapRef.current]);

    // Update map when order changes
    useEffect(() => {
        if (!map || !directionsService || !directionsRenderer || !order) return;

        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        setMarkers([]);

        const newMarkers: google.maps.Marker[] = [];

        // Create waypoints from transit hops
        const waypoints = order.transitHops.map(hop => ({
            location: new google.maps.LatLng(hop.location.coordinates.lat, hop.location.coordinates.lng),
            stopover: true,
        }));

        // Calculate route
        const request: google.maps.DirectionsRequest = {
            origin: new google.maps.LatLng(order.origin.coordinates.lat, order.origin.coordinates.lng),
            destination: new google.maps.LatLng(order.destination.coordinates.lat, order.destination.coordinates.lng),
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
        };

        directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
                directionsRenderer.setDirections(result);

                // Add custom markers
                // Origin marker
                const originMarker = new google.maps.Marker({
                    position: { lat: order.origin.coordinates.lat, lng: order.origin.coordinates.lng },
                    map: map,
                    title: `Origin: ${order.origin.city}`,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#10b981" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">S</text>
              </svg>
            `),
                        scaledSize: new google.maps.Size(32, 32),
                    },
                });

                const originInfoWindow = new google.maps.InfoWindow({
                    content: `
            <div class="p-2">
              <h3 class="font-semibold">Origin</h3>
              <p class="text-sm">${order.origin.address}</p>
              <p class="text-sm">${order.origin.city}, ${order.origin.state}</p>
              <p class="text-xs text-gray-500">Order Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
            </div>
          `,
                });

                originMarker.addListener('click', () => {
                    originInfoWindow.open(map, originMarker);
                });

                newMarkers.push(originMarker);

                // Transit hop markers
                order.transitHops.forEach((hop, index) => {
                    const hopMarker = new google.maps.Marker({
                        position: { lat: hop.location.coordinates.lat, lng: hop.location.coordinates.lng },
                        map: map,
                        title: `Transit Hub ${index + 1}: ${hop.location.city}`,
                        icon: {
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="${hop.status === 'departed' ? '#3b82f6' :
                                    hop.status === 'arrived' ? '#f59e0b' :
                                        hop.status === 'delayed' ? '#ef4444' :
                                            '#6b7280'
                                }" stroke="white" stroke-width="2"/>
                  <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${index + 1}</text>
                </svg>
              `),
                            scaledSize: new google.maps.Size(32, 32),
                        },
                    });

                    const hopInfoWindow = new google.maps.InfoWindow({
                        content: `
              <div class="p-2">
                <h3 class="font-semibold">Transit Hub ${index + 1}</h3>
                <p class="text-sm">${hop.location.address}</p>
                <p class="text-sm">${hop.location.city}, ${hop.location.state}</p>
                <p class="text-xs text-gray-500">Status: ${hop.status}</p>
                <p class="text-xs text-gray-500">Arrived: ${new Date(hop.arrivalTime).toLocaleString()}</p>
                ${hop.departureTime ? `<p class="text-xs text-gray-500">Departed: ${new Date(hop.departureTime).toLocaleString()}</p>` : ''}
              </div>
            `,
                    });

                    hopMarker.addListener('click', () => {
                        hopInfoWindow.open(map, hopMarker);
                    });

                    newMarkers.push(hopMarker);
                });

                // Destination marker
                const destinationMarker = new google.maps.Marker({
                    position: { lat: order.destination.coordinates.lat, lng: order.destination.coordinates.lng },
                    map: map,
                    title: `Destination: ${order.destination.city}`,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${order.status === 'delivered' ? '#10b981' : '#ef4444'}" stroke="white" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="16" font-weight="bold">D</text>
              </svg>
            `),
                        scaledSize: new google.maps.Size(32, 32),
                    },
                });

                const destinationInfoWindow = new google.maps.InfoWindow({
                    content: `
            <div class="p-2">
              <h3 class="font-semibold">Destination</h3>
              <p class="text-sm">${order.destination.address}</p>
              <p class="text-sm">${order.destination.city}, ${order.destination.state}</p>
              <p class="text-xs text-gray-500">Expected: ${new Date(order.estimatedDelivery).toLocaleString()}</p>
              ${order.actualDelivery ? `<p class="text-xs text-gray-500">Delivered: ${new Date(order.actualDelivery).toLocaleString()}</p>` : ''}
            </div>
          `,
                });

                destinationMarker.addListener('click', () => {
                    destinationInfoWindow.open(map, destinationMarker);
                });

                newMarkers.push(destinationMarker);

                setMarkers(newMarkers);
            }
        });
    }, [map, directionsService, directionsRenderer, order, markers]);

    // Real-time BECKN location updates
    // Implements requirement 3.1: Display real-time delivery vehicle location
    // Implements requirement 3.2: Update map markers and route visualization automatically
    useEffect(() => {
        if (!map || !becknTrackingData?.currentLocation || !order) return;

        const updateDeliveryVehicleLocation = (location: BecknLocation) => {
            const position = {
                lat: location.latitude,
                lng: location.longitude
            };

            if (deliveryVehicleMarker) {
                // Animate marker movement to new position
                animateMarkerToPosition(deliveryVehicleMarker, position);
            } else {
                // Create new delivery vehicle marker
                const vehicleMarker = new google.maps.Marker({
                    position: position,
                    map: map,
                    title: `Delivery Vehicle - ${becknTrackingData.deliveryPartner?.name || 'Unknown Driver'}`,
                    icon: {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="3"/>
                                <circle cx="20" cy="20" r="12" fill="white" opacity="0.9"/>
                                <path d="M12 20 L20 12 L28 20 L20 28 Z" fill="#3b82f6"/>
                                <circle cx="20" cy="20" r="3" fill="white"/>
                                <circle cx="20" cy="20" r="20" fill="none" stroke="#3b82f6" stroke-width="2" opacity="0.3">
                                    <animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/>
                                    <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                                </circle>
                            </svg>
                        `),
                        scaledSize: new google.maps.Size(40, 40),
                        anchor: new google.maps.Point(20, 20)
                    },
                    zIndex: 1000 // Ensure delivery vehicle marker is on top
                });

                // Create info window for delivery vehicle
                const vehicleInfoWindow = new google.maps.InfoWindow({
                    content: `
                        <div class="p-3 max-w-xs">
                            <div class="flex items-center gap-3 mb-2">
                                <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <h3 class="font-semibold text-blue-900">Live Delivery Vehicle</h3>
                            </div>
                            ${becknTrackingData.deliveryPartner ? `
                                <div class="space-y-1 text-sm">
                                    <p><strong>Driver:</strong> ${becknTrackingData.deliveryPartner.name}</p>
                                    <p><strong>Vehicle:</strong> ${becknTrackingData.deliveryPartner.vehicle.type} (${becknTrackingData.deliveryPartner.vehicle.number})</p>
                                    <p><strong>Phone:</strong> ${becknTrackingData.deliveryPartner.phone}</p>
                                    <p><strong>Rating:</strong> ⭐ ${becknTrackingData.deliveryPartner.rating}/5</p>
                                </div>
                            ` : ''}
                            <div class="mt-2 text-xs text-gray-600">
                                <p><strong>Location:</strong> ${location.address || 'Current position'}</p>
                                <p><strong>Updated:</strong> ${new Date(location.timestamp).toLocaleTimeString()}</p>
                                ${location.accuracy ? `<p><strong>Accuracy:</strong> ±${location.accuracy}m</p>` : ''}
                            </div>
                            <div class="mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full text-center">
                                🚚 BECKN Live Tracking
                            </div>
                        </div>
                    `
                });

                vehicleMarker.addListener('click', () => {
                    vehicleInfoWindow.open(map, vehicleMarker);
                });

                setDeliveryVehicleMarker(vehicleMarker);

                // Center map on delivery vehicle if it's the first time
                map.panTo(position);
            }
        };

        // Initial location update
        updateDeliveryVehicleLocation(becknTrackingData.currentLocation);

        // Set up real-time location updates
        if (order.id && becknTrackingData.status !== 'delivered') {
            // Subscribe to BECKN updates for real-time location
            becknTrackingService.subscribeToUpdates(order.id, (updatedData) => {
                if (updatedData.currentLocation) {
                    updateDeliveryVehicleLocation(updatedData.currentLocation);
                }
            });

            // Also poll for location updates every 30 seconds
            const interval = setInterval(async () => {
                try {
                    const currentLocation = await becknTrackingService.getCurrentLocation(order.id);
                    if (currentLocation) {
                        updateDeliveryVehicleLocation(currentLocation);
                    }
                } catch (error) {
                    console.warn('Failed to update delivery vehicle location:', error);
                }
            }, 30000); // 30 seconds

            setLocationUpdateInterval(interval);
        }

        // Cleanup function
        return () => {
            if (order.id) {
                becknTrackingService.unsubscribeFromUpdates(order.id);
            }
            if (locationUpdateInterval) {
                clearInterval(locationUpdateInterval);
                setLocationUpdateInterval(null);
            }
        };
    }, [map, becknTrackingData, order, deliveryVehicleMarker, locationUpdateInterval]);

    // Cleanup delivery vehicle marker when order changes or component unmounts
    useEffect(() => {
        return () => {
            if (deliveryVehicleMarker) {
                deliveryVehicleMarker.setMap(null);
                setDeliveryVehicleMarker(null);
            }
            if (locationUpdateInterval) {
                clearInterval(locationUpdateInterval);
                setLocationUpdateInterval(null);
            }
        };
    }, [order?.id]);

    // Helper function to animate marker movement
    const animateMarkerToPosition = (marker: google.maps.Marker, newPosition: google.maps.LatLngLiteral) => {
        const currentPosition = marker.getPosition();
        if (!currentPosition) return;

        const startLat = currentPosition.lat();
        const startLng = currentPosition.lng();
        const endLat = newPosition.lat;
        const endLng = newPosition.lng;

        let step = 0;
        const numSteps = 50; // Number of animation steps
        const stepTime = 20; // Time between steps in ms

        const animateStep = () => {
            step++;
            const progress = step / numSteps;

            // Use easing function for smooth animation
            const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

            const currentLat = startLat + (endLat - startLat) * easedProgress;
            const currentLng = startLng + (endLng - startLng) * easedProgress;

            marker.setPosition({ lat: currentLat, lng: currentLng });

            if (step < numSteps) {
                setTimeout(animateStep, stepTime);
            }
        };

        animateStep();
    };

    return { mapRef, isMapReady };
};