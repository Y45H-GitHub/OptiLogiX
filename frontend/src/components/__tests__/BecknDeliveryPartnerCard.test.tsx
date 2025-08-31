import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BecknDeliveryPartnerCard from '../BecknDeliveryPartnerCard';
import { BecknDeliveryPartner } from '@/types/logistics';

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
    value: mockWindowOpen,
    writable: true,
});

const mockDeliveryPartner: BecknDeliveryPartner = {
    id: 'DP-001',
    name: 'Rajesh Kumar',
    phone: '+91-9876543210',
    email: 'rajesh.kumar@fasttrack.com',
    rating: 4.8,
    vehicle: {
        type: 'Motorcycle',
        number: 'MH-12-AB-1234',
        model: 'Honda Activa'
    },
    photo: 'https://example.com/photos/rajesh.jpg'
};

const mockDeliveryPartnerNoEmail: BecknDeliveryPartner = {
    id: 'DP-002',
    name: 'Maria Rodriguez',
    phone: '+1-555-0123',
    rating: 4.9,
    vehicle: {
        type: 'Van',
        number: 'TX-789-DEF'
    }
};

describe('BecknDeliveryPartnerCard', () => {
    beforeEach(() => {
        mockWindowOpen.mockClear();
    });

    it('renders delivery partner information correctly', () => {
        render(<BecknDeliveryPartnerCard deliveryPartner={mockDeliveryPartner} />);

        // Check partner name
        expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();

        // Check phone number
        expect(screen.getByText('+91-9876543210')).toBeInTheDocument();

        // Check email
        expect(screen.getByText('rajesh.kumar@fasttrack.com')).toBeInTheDocument();

        // Check rating
        expect(screen.getByText('4.8')).toBeInTheDocument();

        // Check vehicle information
        expect(screen.getByText('Motorcycle')).toBeInTheDocument();
        expect(screen.getByText('MH-12-AB-1234')).toBeInTheDocument();
        expect(screen.getByText('Honda Activa')).toBeInTheDocument();

        // Check BECKN badge
        expect(screen.getByText('BECKN Enabled')).toBeInTheDocument();
    });

    it('renders without email when email is not provided', () => {
        render(<BecknDeliveryPartnerCard deliveryPartner={mockDeliveryPartnerNoEmail} />);

        expect(screen.getByText('Maria Rodriguez')).toBeInTheDocument();
        expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
        expect(screen.queryByText('@')).not.toBeInTheDocument();

        // Email button should not be present
        expect(screen.queryByText('Email')).not.toBeInTheDocument();
    });

    it('renders without vehicle model when model is not provided', () => {
        render(<BecknDeliveryPartnerCard deliveryPartner={mockDeliveryPartnerNoEmail} />);

        expect(screen.getByText('Van')).toBeInTheDocument();
        expect(screen.getByText('TX-789-DEF')).toBeInTheDocument();
        expect(screen.queryByText('Honda Activa')).not.toBeInTheDocument();
    });

    it('handles call button click', () => {
        render(<BecknDeliveryPartnerCard deliveryPartner={mockDeliveryPartner} />);

        const callButton = screen.getByText('Call');
        fireEvent.click(callButton);

        expect(mockWindowOpen).toHaveBeenCalledWith('tel:+91-9876543210', '_self');
    });

    it('handles SMS button click', () => {
        render(<BecknDeliveryPartnerCard deliveryPartner={mockDeliveryPartner} />);

        const smsButton = screen.getByText('SMS');
        fireEvent.click(smsButton);

        expect(mockWindowOpen).toHaveBeenCalledWith('sms:+91-9876543210', '_self');
    });

    it('handles email button click when email is available', () => {
        render(<BecknDeliveryPartnerCard deliveryPartner={mockDeliveryPartner} />);

        const emailButton = screen.getByText('Email');
        fireEvent.click(emailButton);

        expect(mockWindowOpen).toHaveBeenCalledWith('mailto:rajesh.kumar@fasttrack.com', '_self');
    });

    it('displays correct rating color for high rating', () => {
        render(<BecknDeliveryPartnerCard deliveryPartner={mockDeliveryPartner} />);

        const ratingElement = screen.getByText('4.8');
        expect(ratingElement).toHaveClass('text-green-600');
    });

    it('displays partner photo when available', () => {
        render(<BecknDeliveryPartnerCard deliveryPartner={mockDeliveryPartner} />);

        const photoElement = screen.getByAltText('Rajesh Kumar');
        expect(photoElement).toBeInTheDocument();
        expect(photoElement).toHaveAttribute('src', 'https://example.com/photos/rajesh.jpg');
    });

    it('displays default avatar when photo is not available', () => {
        render(<BecknDeliveryPartnerCard deliveryPartner={mockDeliveryPartnerNoEmail} />);

        // Should not have an img element with alt text
        expect(screen.queryByAltText('Maria Rodriguez')).not.toBeInTheDocument();

        // Should have the default user icon container
        expect(screen.getByText('Maria Rodriguez').closest('div')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
        const { container } = render(
            <BecknDeliveryPartnerCard
                deliveryPartner={mockDeliveryPartner}
                className="custom-class"
            />
        );

        const cardElement = container.querySelector('.custom-class');
        expect(cardElement).toBeInTheDocument();
    });
});