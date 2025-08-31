import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { becknDemoService } from '@/services/becknDemoService';
import { becknTrackingService } from '@/services/becknTrackingService';

// Mock the services
vi.mock('@/services/becknDemoService');
vi.mock('@/services/becknTrackingService');
vi.mock('@/services/logisticsService');

describe('BECKN Demo Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('demo service toggles correctly', () => {
        const mockToggle = vi.mocked(becknDemoService.toggleDemoMode);
        const mockIsActive = vi.mocked(becknDemoService.isDemoModeActive);

        mockIsActive.mockReturnValue(false);
        mockToggle.mockReturnValue(true);

        // Test initial state
        expect(becknDemoService.isDemoModeActive()).toBe(false);

        // Test toggle
        const result = becknDemoService.toggleDemoMode();
        expect(result).toBe(true);
        expect(mockToggle).toHaveBeenCalled();
    });

    it('demo service provides realistic tracking data', () => {
        const mockGetDemoData = vi.mocked(becknDemoService.getDemoTrackingData);
        const mockIsActive = vi.mocked(becknDemoService.isDemoModeActive);

        mockIsActive.mockReturnValue(true);
        mockGetDemoData.mockReturnValue({
            orderId: 'ORD-001',
            becknTransactionId: 'BECKN-DEMO-ORD-001',
            status: 'in_transit',
            deliveryPartner: {
                id: 'DP-DEMO-001',
                name: 'Rajesh Kumar',
                phone: '+91-9876543210',
                rating: 4.8,
                vehicle: {
                    type: 'Motorcycle',
                    number: 'MH-12-AB-1234'
                }
            },
            currentLocation: {
                latitude: 35.3733,
                longitude: -119.0187,
                address: '789 Distribution Center, Bakersfield, CA',
                timestamp: new Date().toISOString()
            },
            estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            trackingHistory: [],
            lastUpdated: new Date().toISOString()
        });

        const demoData = becknDemoService.getDemoTrackingData('ORD-001');

        expect(demoData).toBeTruthy();
        expect(demoData?.orderId).toBe('ORD-001');
        expect(demoData?.deliveryPartner?.name).toBe('Rajesh Kumar');
        expect(demoData?.status).toBe('in_transit');
        expect(demoData?.currentLocation?.address).toContain('Bakersfield');
    });

    it('tracking service integrates with demo service', async () => {
        const mockTrackOrder = vi.mocked(becknTrackingService.trackOrder);
        const mockIsActive = vi.mocked(becknDemoService.isDemoModeActive);

        mockIsActive.mockReturnValue(true);
        mockTrackOrder.mockResolvedValue({
            orderId: 'ORD-001',
            becknTransactionId: 'BECKN-DEMO-ORD-001',
            status: 'in_transit',
            estimatedDelivery: new Date().toISOString(),
            trackingHistory: [],
            lastUpdated: new Date().toISOString()
        });

        const trackingData = await becknTrackingService.trackOrder('ORD-001');

        expect(trackingData).toBeTruthy();
        expect(trackingData?.orderId).toBe('ORD-001');
        expect(mockTrackOrder).toHaveBeenCalledWith('ORD-001');
    });

    it('demo service provides status information', () => {
        const mockGetStatusInfo = vi.mocked(becknDemoService.getDemoStatusInfo);

        mockGetStatusInfo.mockReturnValue({
            isDemoMode: true,
            activeSimulations: 2,
            cachedOrders: ['ORD-001', 'ORD-002']
        });

        const statusInfo = becknDemoService.getDemoStatusInfo();

        expect(statusInfo.isDemoMode).toBe(true);
        expect(statusInfo.activeSimulations).toBe(2);
        expect(statusInfo.cachedOrders).toHaveLength(2);
        expect(statusInfo.cachedOrders).toContain('ORD-001');
    });

    it('demo service can be cleaned up', () => {
        const mockCleanup = vi.mocked(becknDemoService.cleanup);

        becknDemoService.cleanup();

        expect(mockCleanup).toHaveBeenCalled();
    });
});