import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index from '../../pages/Index';
import { vi } from 'vitest';

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
    onAuthStateChanged: vi.fn(() => vi.fn()),
    signOut: vi.fn(),
    auth: {}
}));

// Mock Firebase config
vi.mock('../../lib/firebase', () => ({
    auth: {}
}));

// Mock MetaMask detection
vi.mock('@metamask/detect-provider', () => ({
    default: vi.fn(() => Promise.resolve(null))
}));

// Mock ethers
vi.mock('ethers', () => ({
    BrowserProvider: vi.fn(),
    formatEther: vi.fn(() => '0.0'),
    JsonRpcSigner: vi.fn(),
    BigNumberish: vi.fn()
}));

// Mock email service
vi.mock('../../services/emailService', () => ({
    emailService: {
        sendApprovalConfirmation: vi.fn(() => Promise.resolve({
            id: 'email-test',
            status: 'sent',
            timestamp: new Date(),
            recipient: 'test@example.com'
        })),
        sendRejectionNotification: vi.fn(() => Promise.resolve({
            id: 'email-test',
            status: 'sent',
            timestamp: new Date(),
            recipient: 'test@example.com'
        })),
        sendApprovalRequest: vi.fn(() => Promise.resolve({
            id: 'email-test',
            status: 'sent',
            timestamp: new Date(),
            recipient: 'test@example.com'
        }))
    }
}));

describe('Inventory Alert Removal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('inventory alert is removed from dashboard when approved', async () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        // Switch to dashboard tab
        const dashboardTab = screen.getByText('Dashboard');
        fireEvent.click(dashboardTab);

        // Wait for dashboard to load and verify initial inventory alerts
        await waitFor(() => {
            const inventorySection = screen.getByText('Inventory Alerts');
            expect(inventorySection).toBeInTheDocument();
        });

        // Count initial alerts
        const initialSendButtons = screen.getAllByText('Send to Notifications');
        const initialAlertCount = initialSendButtons.length;
        expect(initialAlertCount).toBeGreaterThan(0);

        // Send first alert to notifications
        fireEvent.click(initialSendButtons[0]);

        // Open notification dropdown
        const notificationBell = screen.getByText('Notifications');
        fireEvent.click(notificationBell);

        // Find and approve the notification
        await waitFor(() => {
            const approveButtons = screen.getAllByText('Approve');
            expect(approveButtons.length).toBeGreaterThan(0);
            fireEvent.click(approveButtons[0]);
        });

        // Close notification dropdown
        fireEvent.click(notificationBell);

        // Verify that the inventory alert was removed from dashboard
        await waitFor(() => {
            const remainingSendButtons = screen.getAllByText('Send to Notifications');
            expect(remainingSendButtons.length).toBe(initialAlertCount - 1);
        });
    });

    test('inventory alert is removed from dashboard when rejected', async () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        // Switch to dashboard tab
        const dashboardTab = screen.getByText('Dashboard');
        fireEvent.click(dashboardTab);

        // Wait for dashboard to load
        await waitFor(() => {
            const inventorySection = screen.getByText('Inventory Alerts');
            expect(inventorySection).toBeInTheDocument();
        });

        // Count initial alerts
        const initialSendButtons = screen.getAllByText('Send to Notifications');
        const initialAlertCount = initialSendButtons.length;

        // Send first alert to notifications
        fireEvent.click(initialSendButtons[0]);

        // Open notification dropdown
        const notificationBell = screen.getByText('Notifications');
        fireEvent.click(notificationBell);

        // Find and reject the notification
        await waitFor(() => {
            const rejectButtons = screen.getAllByText('Reject');
            expect(rejectButtons.length).toBeGreaterThan(0);
            fireEvent.click(rejectButtons[0]);
        });

        // Enter rejection reason and confirm
        await waitFor(() => {
            const reasonInput = screen.getByPlaceholderText('Rejection reason...');
            fireEvent.change(reasonInput, { target: { value: 'Budget constraints' } });

            const confirmRejectButton = screen.getByText('Confirm Reject');
            fireEvent.click(confirmRejectButton);
        });

        // Close notification dropdown
        fireEvent.click(notificationBell);

        // Verify that the inventory alert was removed from dashboard
        await waitFor(() => {
            const remainingSendButtons = screen.getAllByText('Send to Notifications');
            expect(remainingSendButtons.length).toBe(initialAlertCount - 1);
        });
    });

    test('reset button restores all inventory alerts', async () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        // Switch to dashboard tab
        const dashboardTab = screen.getByText('Dashboard');
        fireEvent.click(dashboardTab);

        // Wait for dashboard to load
        await waitFor(() => {
            const inventorySection = screen.getByText('Inventory Alerts');
            expect(inventorySection).toBeInTheDocument();
        });

        // Find and click reset button
        const resetButton = screen.getByText('Reset Demo');
        expect(resetButton).toBeInTheDocument();

        fireEvent.click(resetButton);

        // Verify that all alerts are restored (should be 3 initial alerts)
        await waitFor(() => {
            const sendButtons = screen.getAllByText('Send to Notifications');
            expect(sendButtons.length).toBe(3); // Based on initial mock data
        });
    });

    test('shows empty state message when all alerts are processed', async () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        // Switch to dashboard tab
        const dashboardTab = screen.getByText('Dashboard');
        fireEvent.click(dashboardTab);

        // Wait for dashboard to load
        await waitFor(() => {
            const inventorySection = screen.getByText('Inventory Alerts');
            expect(inventorySection).toBeInTheDocument();
        });

        // Process all alerts by sending them to notifications and approving them
        const sendButtons = screen.getAllByText('Send to Notifications');
        const alertCount = sendButtons.length;

        for (let i = 0; i < alertCount; i++) {
            // Send alert to notifications
            const currentSendButtons = screen.getAllByText('Send to Notifications');
            if (currentSendButtons.length > 0) {
                fireEvent.click(currentSendButtons[0]);

                // Open notification dropdown and approve
                const notificationBell = screen.getByText('Notifications');
                fireEvent.click(notificationBell);

                await waitFor(() => {
                    const approveButtons = screen.getAllByText('Approve');
                    if (approveButtons.length > 0) {
                        fireEvent.click(approveButtons[0]);
                    }
                });

                // Close dropdown
                fireEvent.click(notificationBell);
            }
        }

        // Verify empty state message appears
        await waitFor(() => {
            const emptyMessage = screen.getByText('All inventory alerts processed!');
            expect(emptyMessage).toBeInTheDocument();
        });
    });
});