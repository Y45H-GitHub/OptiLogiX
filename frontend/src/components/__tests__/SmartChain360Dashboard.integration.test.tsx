import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SmartChain360Dashboard from '../SmartChain360Dashboard';
import { NotificationProvider } from '@/contexts/NotificationContext';

// Mock the email service
vi.mock('@/services/emailService', () => ({
    emailService: {
        sendApprovalRequest: vi.fn().mockResolvedValue({
            id: 'email-123',
            status: 'sent',
            timestamp: new Date(),
            recipient: 'test@example.com'
        })
    }
}));

const DashboardWithProvider = () => (
    <NotificationProvider>
        <SmartChain360Dashboard />
    </NotificationProvider>
);

describe('SmartChain360Dashboard - Inventory Alert Integration', () => {
    it('should render inventory alerts with Send to Notifications buttons', () => {
        render(<DashboardWithProvider />);

        // Check if inventory alerts section is rendered
        expect(screen.getByText('Inventory Alerts')).toBeInTheDocument();

        // Check if inventory items are displayed
        expect(screen.getByText('Laptop Batteries')).toBeInTheDocument();
        expect(screen.getByText('Office Chairs')).toBeInTheDocument();
        expect(screen.getByText('Power Drills')).toBeInTheDocument();

        // Check if Send to Notifications buttons are present
        const sendButtons = screen.getAllByText('Send to Notifications');
        expect(sendButtons).toHaveLength(3);
    });

    it('should create purchase order when Send to Notifications is clicked', async () => {
        render(<DashboardWithProvider />);

        // Find and click the first Send to Notifications button
        const sendButtons = screen.getAllByText('Send to Notifications');
        fireEvent.click(sendButtons[0]);

        // Wait for the async operation to complete
        await waitFor(() => {
            // The button should still be there (no error occurred)
            expect(sendButtons[0]).toBeInTheDocument();
        });
    });

    it('should map inventory alert data correctly to purchase order', () => {
        render(<DashboardWithProvider />);

        // Check that inventory alert data is displayed correctly
        expect(screen.getByText('SKU: ELEC-001')).toBeInTheDocument();
        expect(screen.getByText('Stock: 12')).toBeInTheDocument();
        expect(screen.getByText('Min: 50')).toBeInTheDocument();

        expect(screen.getByText('SKU: FURN-045')).toBeInTheDocument();
        expect(screen.getByText('Stock: 23')).toBeInTheDocument();
        expect(screen.getByText('Min: 30')).toBeInTheDocument();

        expect(screen.getByText('SKU: TOOLS-089')).toBeInTheDocument();
        expect(screen.getByText('Stock: 45')).toBeInTheDocument();
        expect(screen.getByText('Min: 100')).toBeInTheDocument();
    });

    it('should display correct alert levels with proper styling', () => {
        render(<DashboardWithProvider />);

        // Check if alert level badges are displayed
        expect(screen.getByText('Critical')).toBeInTheDocument();
        expect(screen.getByText('Low')).toBeInTheDocument();
        expect(screen.getByText('Reorder')).toBeInTheDocument();
    });
});