import { describe, it, expect } from 'vitest';
import PaymentModal from '../PaymentModal';
import { FreightQuote, ShipmentDetails } from '@/types/payment';

describe('PaymentModal Integration', () => {
    it('should import PaymentModal component successfully', () => {
        expect(PaymentModal).toBeDefined();
        expect(typeof PaymentModal).toBe('function');
    });

    it('should import payment types successfully', () => {
        const mockQuote: FreightQuote = {
            id: '1',
            provider: 'Test Provider',
            cost: 1000,
            transitTime: '5-7 days',
            reliability: 95,
            services: ['Insurance'],
            rating: 4.8,
        };

        const mockShipmentDetails: ShipmentDetails = {
            origin: 'Mumbai',
            destination: 'Delhi',
            weight: '100',
            dimensions: '10x10x10',
            type: 'general',
        };

        expect(mockQuote).toBeDefined();
        expect(mockShipmentDetails).toBeDefined();
        expect(mockQuote.provider).toBe('Test Provider');
        expect(mockShipmentDetails.origin).toBe('Mumbai');
    });
});