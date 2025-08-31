import { useEffect, useRef, useState } from 'react';
import { Order } from '@/types/logistics';

interface UseLogisticsMapProps {
    apiKey: string;
    order?: Order | null;
}

export const useLogisticsMap = ({ apiKey, order }: UseLogisticsMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
    const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

    // Initialize map
    useEffect(() => {
        if (!apiKey || !mapRef.current) return;

        const initMap = () => {
            const mapInstance = new google.maps.Map(mapRef.current!, {
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
        };

        if (window.google && window.google.maps) {
            initMap();
        } else {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
            script.async = true;
            script.defer = true;
            script.onload = initMap;
            document.head.appendChild(script);

            return () => {
                document.head.removeChild(script);
            };
        }
    }, [apiKey]);

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

    return { mapRef };
};