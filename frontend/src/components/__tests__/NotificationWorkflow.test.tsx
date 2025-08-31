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

describe('Notification Workflow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('inventory alerts from dashboard appear in notification dropdown', async () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        // Switch to dashboard tab
        const dashboardTab = screen.getByText('Dashboard');
        fireEvent.click(dashboardTab);

        // Wait for dashboard to load and find an inventory alert
        await waitFor(() => {
            const inventorySection = screen.getByText('Inventory Alerts');
            expect(inventorySection).toBeInTheDocument();
        });

        // Find and click a "Send to Notifications" button
        await waitFor(() => {
            const sendToNotificationButtons = screen.getAllByText('Send to Notifications');
            expect(sendToNotificationButtons.length).toBeGreaterThan(0);

            // Click the first one
            fireEvent.click(sendToNotificationButtons[0]);
        });

        // Open notification dropdown
        const notificationBell = screen.getByText('Notifications');
        fireEvent.click(notificationBell);

        // Verify that notifications appear in dropdown
        await waitFor(() => {
            const markAllReadButton = screen.getByText('Mark all read');
            expect(markAllReadButton).toBeInTheDocument();
        });
    });

    test('approve workflow from notifications', async () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        // Open notification dropdown
        const notificationBell = screen.getByText('Notifications');
        fireEvent.click(notificationBell);

        // Wait for dropdown to appear and find approve button
        await waitFor(() => {
            const approveButtons = screen.getAllByText('Approve');
            expect(approveButtons.length).toBeGreaterThan(0);

            // Click the first approve button
            fireEvent.click(approveButtons[0]);
        });

        // Verify success feedback appears
        await waitFor(() => {
            // The notification should be processed and marked as approved
            const historyTab = screen.getByText(/History/);
            expect(historyTab).toBeInTheDocument();
        });
    });

    test('reject workflow from notifications', async () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        // Open notification dropdown
        const notificationBell = screen.getByText('Notifications');
        fireEvent.click(notificationBell);

        // Wait for dropdown to appear and find reject button
        await waitFor(() => {
            const rejectButtons = screen.getAllByText('Reject');
            expect(rejectButtons.length).toBeGreaterThan(0);

            // Click the first reject button
            fireEvent.click(rejectButtons[0]);
        });

        // Wait for rejection reason input to appear
        await waitFor(() => {
            const reasonInput = screen.getByPlaceholderText('Rejection reason...');
            expect(reasonInput).toBeInTheDocument();

            // Enter a reason
            fireEvent.change(reasonInput, { target: { value: 'Budget constraints' } });

            // Click confirm reject
            const confirmRejectButton = screen.getByText('Confirm Reject');
            fireEvent.click(confirmRejectButton);
        });

        // Verify rejection is processed
        await waitFor(() => {
            const historyTab = screen.getByText(/History/);
            expect(historyTab).toBeInTheDocument();
        });
    });
});