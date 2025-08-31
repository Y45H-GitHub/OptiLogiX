import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BecknDemoToggle from '../BecknDemoToggle';
import { becknDemoService } from '@/services/becknDemoService';

// Mock the demo service
vi.mock('@/services/becknDemoService', () => ({
    becknDemoService: {
        isDemoModeActive: vi.fn(),
        toggleDemoMode: vi.fn(),
        getDemoStatusInfo: vi.fn()
    }
}));

describe('BecknDemoToggle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (becknDemoService.isDemoModeActive as any).mockReturnValue(false);
        (becknDemoService.getDemoStatusInfo as any).mockReturnValue({
            isDemoMode: false,
            activeSimulations: 0,
            cachedOrders: []
        });
    });

    it('renders demo toggle in OFF state initially', () => {
        render(<BecknDemoToggle />);

        expect(screen.getByText('Demo Mode OFF')).toBeInTheDocument();
        expect(screen.getByText('Regular Mode')).toBeInTheDocument();
        expect(screen.getByText('Regular Tracking Mode')).toBeInTheDocument();
    });

    it('toggles to demo mode when clicked', async () => {
        (becknDemoService.toggleDemoMode as any).mockReturnValue(true);
        (becknDemoService.getDemoStatusInfo as any).mockReturnValue({
            isDemoMode: true,
            activeSimulations: 2,
            cachedOrders: ['ORD-001', 'ORD-002']
        });

        const onToggle = vi.fn();
        render(<BecknDemoToggle onToggle={onToggle} />);

        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(becknDemoService.toggleDemoMode).toHaveBeenCalled();
            expect(onToggle).toHaveBeenCalledWith(true);
        });
    });

    it('shows demo mode active state', () => {
        (becknDemoService.isDemoModeActive as any).mockReturnValue(true);
        (becknDemoService.getDemoStatusInfo as any).mockReturnValue({
            isDemoMode: true,
            activeSimulations: 2,
            cachedOrders: ['ORD-001', 'ORD-002']
        });

        render(<BecknDemoToggle />);

        expect(screen.getByText('Demo Mode ON')).toBeInTheDocument();
        expect(screen.getByText('Live BECKN Demo')).toBeInTheDocument();
        expect(screen.getByText('BECKN Demo Mode Active')).toBeInTheDocument();
        expect(screen.getByText('2 live simulations')).toBeInTheDocument();
        expect(screen.getByText('2 demo orders')).toBeInTheDocument();
    });

    it('shows demo instructions when active', () => {
        (becknDemoService.isDemoModeActive as any).mockReturnValue(true);
        (becknDemoService.getDemoStatusInfo as any).mockReturnValue({
            isDemoMode: true,
            activeSimulations: 1,
            cachedOrders: ['ORD-001']
        });

        render(<BecknDemoToggle />);

        expect(screen.getByText(/Try tracking orders ORD-001, ORD-002, ORD-003, or ORD-004/)).toBeInTheDocument();
        expect(screen.getByText(/Enhanced tracking with live location simulation/)).toBeInTheDocument();
    });

    it('calls onToggle callback when provided', async () => {
        const onToggle = vi.fn();
        (becknDemoService.toggleDemoMode as any).mockReturnValue(true);

        render(<BecknDemoToggle onToggle={onToggle} />);

        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);

        await waitFor(() => {
            expect(onToggle).toHaveBeenCalledWith(true);
        });
    });
});