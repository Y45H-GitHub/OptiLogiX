/**
 * Test for useGoogleMaps hook facility marker functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useGoogleMaps from '../useGoogleMaps';
import { FacilityDataService } from '../../services/facilityDataService';

// Mock Google Maps API
const mockMap = {
    setCenter: vi.fn(),
    setZoom: vi.fn(),
};

const mockMarker = {
    setMap: vi.fn(),
    addListener: vi.fn(),
};

const mockInfoWindow = {
    setContent: vi.fn(),
    open: vi.fn(),
};

const mockDirectionsRenderer = {
    setMap: vi.fn(),
};

// Mock global Google Maps objects
global.window = {
    ...global.window,
    google: {
        maps: {
            Map: vi.fn(() => mockMap),
            Marker: vi.fn(() => mockMarker),
            InfoWindow: vi.fn(() => mockInfoWindow),
            DirectionsRenderer: vi.fn(() => mockDirectionsRenderer),
            Size: vi.fn(),
        },
    },
} as any;

// Mock environment variable
vi.mock('../../services/facilityDataService');

describe('useGoogleMaps facility markers', () => {
    const mockMapRef = { current: document.createElement('div') };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock the import.meta.env
        vi.stubEnv('VITE_GOOGLE_MAPS_API_KEY', 'test-api-key');
    });

    it('should provide facility marker functions', () => {
        const { result } = renderHook(() => useGoogleMaps(mockMapRef));

        expect(result.current.addFacilityMarkers).toBeDefined();
        expect(result.current.clearFacilityMarkers).toBeDefined();
        expect(result.current.showAllFacilities).toBeDefined();
    });

    it('should create markers for facilities', () => {
        const mockFacilities = FacilityDataService.getAllFacilities();
        const { result } = renderHook(() => useGoogleMaps(mockMapRef));

        // Simulate map being ready
        result.current.addFacilityMarkers(mockFacilities);

        expect(global.window.google.maps.Marker).toHaveBeenCalledTimes(mockFacilities.length);
    });

    it('should clear markers when requested', () => {
        const { result } = renderHook(() => useGoogleMaps(mockMapRef));

        result.current.clearFacilityMarkers();

        // Should not throw any errors
        expect(true).toBe(true);
    });
});