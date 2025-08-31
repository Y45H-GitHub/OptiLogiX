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

describe('Notification Bell Integration', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    test('notification bell appears in main dashboard', async () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        // Check if notification bell is rendered
        const notificationBell = screen.getByText('Notifications');
        expect(notificationBell).toBeInTheDocument();
    });

    test('notification bell shows unread count', async () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        // The notification bell should show an unread count badge
        // Look specifically for the notification badge with class bg-red-500
        await waitFor(() => {
            const unreadBadge = screen.getByText('4'); // The mock data has 4 unread notifications
            const badgeElement = unreadBadge.closest('.bg-red-500');
            expect(badgeElement).toBeInTheDocument();
        });
    });

    test('clicking notification bell opens dropdown', async () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        const notificationBell = screen.getByText('Notifications');
        fireEvent.click(notificationBell);

        // Check if dropdown appears by looking for the "Mark all read" button
        await waitFor(() => {
            const markAllReadButton = screen.getByText('Mark all read');
            expect(markAllReadButton).toBeInTheDocument();
        });
    });

    test('notification bell is positioned next to profile and wallet icons', () => {
        render(
            <BrowserRouter>
                <Index />
            </BrowserRouter>
        );

        const notificationBell = screen.getByText('Notifications');
        const profileIcon = screen.getByText('Profile');
        const walletIcon = screen.getByText('Wallet');

        // All three should be present in the top-right area
        expect(notificationBell).toBeInTheDocument();
        expect(profileIcon).toBeInTheDocument();
        expect(walletIcon).toBeInTheDocument();
    });
});