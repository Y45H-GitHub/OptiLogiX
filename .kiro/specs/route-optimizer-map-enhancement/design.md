# Design Document

## Overview

The Route Optimizer Map Enhancement extends the existing RouteOptimizer component with an interactive Google Maps interface that displays supply chain facilities along optimized routes. The design prioritizes minimal disruption to existing functionality while adding strategic value through visual route context and intelligent waypoint suggestions.

## Architecture

### Component Structure
```
RouteOptimizer (existing)
├── RouteInputForm (existing)
├── EnhancedMapView (new)
│   ├── GoogleMapContainer
│   ├── RouteRenderer
│   ├── FacilityMarkers
│   └── SuggestionPanel
├── RouteResults (existing)
└── CO2Estimator (existing - enhanced)
```

### Integration Strategy
- **Non-Breaking Enhancement**: New map functionality wraps around existing Google Maps integration
- **Progressive Enhancement**: Map features activate only when route data is available
- **Fallback Graceful**: System maintains full functionality if map enhancements fail

## Components and Interfaces

### EnhancedMapView Component
```typescript
interface EnhancedMapViewProps {
  mapRef: React.RefObject<HTMLDivElement>;
  directionsRenderer: google.maps.DirectionsRenderer | null;
  route: google.maps.DirectionsResult | null;
  selectedMode: 'truck' | 'rail' | 'air';
}
```

**Responsibilities:**
- Render Google Maps with route overlay
- Plot supply chain facilities along route corridor
- Display optimization suggestions panel
- Handle marker interactions and info windows

### FacilityService
```typescript
interface SupplyChainFacility {
  id: string;
  name: string;
  type: 'distribution_center' | 'fuel_station' | 'warehouse' | 'partner_store';
  location: { lat: number; lng: number };
  address: string;
  detourTime: number; // minutes
  services: string[];
}

interface FacilityService {
  findFacilitiesAlongRoute(route: google.maps.DirectionsRoute): Promise<SupplyChainFacility[]>;
  calculateDetourTime(facility: SupplyChainFacility, route: google.maps.DirectionsRoute): number;
}
```

### RouteOptimizationService
```typescript
interface OptimizationSuggestion {
  id: string;
  type: 'fuel_stop' | 'consolidation' | 'pickup_optimization';
  facility: SupplyChainFacility;
  estimatedSavings: {
    time: number; // minutes
    fuel: number; // liters
    cost: number; // currency units
  };
  description: string;
}

interface RouteOptimizationService {
  generateSuggestions(
    route: google.maps.DirectionsRoute,
    facilities: SupplyChainFacility[],
    transportMode: string
  ): OptimizationSuggestion[];
}
```

## Data Models

### Facility Data Structure
```typescript
// Mock data for hackathon demo - represents real supply chain network
const DEMO_FACILITIES: SupplyChainFacility[] = [
  {
    id: 'dc_001',
    name: 'Central Distribution Hub',
    type: 'distribution_center',
    location: { lat: 40.7589, lng: -73.9851 },
    address: '123 Logistics Ave, NYC',
    detourTime: 15,
    services: ['loading_dock', 'overnight_storage', 'cross_docking']
  },
  // Additional facilities strategically placed for demo scenarios
];
```

### Route Enhancement Data
```typescript
interface RouteEnhancement {
  originalRoute: google.maps.DirectionsRoute;
  suggestedWaypoints: google.maps.LatLng[];
  facilities: SupplyChainFacility[];
  optimizations: OptimizationSuggestion[];
  estimatedImpact: {
    timeChange: number;
    costChange: number;
    co2Change: number;
  };
}
```

## Implementation Strategy

### Phase 1: Map Integration (Minimal Viable Enhancement)
1. **Enhance existing useGoogleMaps hook** to support facility plotting
2. **Create FacilityMarkerLayer** component for rendering supply chain points
3. **Implement basic facility data service** with mock data for demo

### Phase 2: Intelligence Layer
1. **Add RouteAnalysisService** for corridor-based facility discovery
2. **Implement OptimizationEngine** for generating actionable suggestions
3. **Create SuggestionPanel** UI for displaying recommendations

### Phase 3: Integration & Polish
1. **Enhance CO2 calculator** to account for suggested waypoints
2. **Add route modification capabilities** for accepted suggestions
3. **Implement smooth animations** for marker appearances and route updates

## Error Handling

### Google Maps API Failures
- **Graceful Degradation**: Fall back to existing route display without map enhancements
- **User Notification**: Display informative message about reduced functionality
- **Retry Logic**: Attempt to reload map features after network recovery

### Facility Data Unavailability
- **Default Behavior**: Continue with route optimization without facility suggestions
- **Cached Fallback**: Use previously loaded facility data if available
- **Progressive Loading**: Load facilities incrementally as they become available

## Testing Strategy

### Unit Testing
- **FacilityService**: Test facility discovery algorithms with mock route data
- **OptimizationEngine**: Verify suggestion generation logic with various scenarios
- **RouteEnhancement**: Test route modification calculations

### Integration Testing
- **Map Rendering**: Verify Google Maps integration doesn't break existing functionality
- **Route Calculation**: Ensure enhanced routes maintain accuracy
- **Performance**: Test with multiple facilities and complex routes

### Demo Scenarios
1. **NYC to Philadelphia Route**: Show distribution centers and fuel optimization
2. **Cross-State Delivery**: Demonstrate warehouse consolidation opportunities
3. **Multi-Stop Route**: Display partner store pickup suggestions

## Performance Considerations

### Map Rendering Optimization
- **Marker Clustering**: Group nearby facilities to reduce visual clutter
- **Lazy Loading**: Load facility details only when markers are clicked
- **Viewport Filtering**: Show only facilities visible in current map bounds

### Data Efficiency
- **Route Corridor Calculation**: Limit facility searches to 5km route buffer
- **Caching Strategy**: Cache facility data for frequently used routes
- **Debounced Updates**: Prevent excessive API calls during route modifications

## Security & Privacy

### API Key Management
- **Environment Variables**: Google Maps API key already secured in .env
- **Domain Restrictions**: Ensure API key is restricted to application domain
- **Rate Limiting**: Implement client-side request throttling

### Data Handling
- **Mock Data Only**: Use simulated facility data for hackathon demo
- **No Personal Data**: Avoid storing or transmitting sensitive location information
- **Minimal Tracking**: Limit data collection to essential functionality