import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RouteOptimizer from '../RouteOptimizer';

// Mock the hooks and services
vi.mock('../useGoogleMaps', () => ({
    default: () => ({
        directionsRendererRef: { current: null },
        speakDirections: vi.fn(),
        showAllFacilities: vi.fn(),
        showFacilitiesAlongRoute: vi.fn(),
        highlightFacility: vi.fn(),
    }),
}));

vi.mock('../useORSRouting', () => ({
    default: () => ({
        source: '',
        setSource: vi.fn(),
        destination: '',
        setDestination: vi.fn(),
        weight: '',
        setWeight: vi.fn(),
        loading: false,
        directionsSteps: [],
        optimizeRoute: vi.fn(),
        recommendation: '',
        distanceKm: 0,
        currentRoute: null,
    }),
}));

vi.mock('../../hooks/useCO2Estimator', () => ({
    default: () => ({
        co2Emissions: 0,
    }),
}));

vi.mock('../../services/routeOptimizationService', () => ({
    RouteOptimizationService: {
        generateSuggestions: vi.fn(() => []),
    },
}));

vi.mock('../../services/facilityDataService', () => ({
    FacilityDataService: {
        getAllFacilities: vi.fn(() => []),
        getFacilitiesAlongRoute: vi.fn(() => []),
    },
}));

describe('RouteOptimizer Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render without crashing', () => {
        render(<RouteOptimizer />);

        // Check that the main components are rendered
        expect(screen.getByText('Travel Mode Recommendation')).toBeInTheDocument();
        expect(screen.getByText('CO₂ Emissions Estimate')).toBeInTheDocument();
    });

    it('should render map container', () => {
        render(<RouteOptimizer />);

        // Check that the map container is present
        const mapContainer = document.getElementById('map');
        expect(mapContainer).toBeInTheDocument();
    });

    it('should render optimization suggestions panel when enhancements are enabled', () => {
        render(<RouteOptimizer />);

        // The suggestions panel should be rendered (even if empty)
        expect(screen.getByText('Route Optimization Suggestions')).toBeInTheDocument();
    });

    it('should handle transport mode cards', () => {
        render(<RouteOptimizer />);

        expect(screen.getByText('Truck')).toBeInTheDocument();
        expect(screen.getByText('Train')).toBeInTheDocument();
        expect(screen.getByText('Plane')).toBeInTheDocument();
    });
});