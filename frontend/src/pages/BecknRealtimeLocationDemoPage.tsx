import React from 'react';
import BecknRealtimeLocationDemo from '@/components/BecknRealtimeLocationDemo';

const BecknRealtimeLocationDemoPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">BECKN Real-time Location Tracking</h1>
                <p className="text-gray-600 mt-2">
                    Task 6 Implementation: Real-time location updates with animated delivery vehicle markers
                </p>
            </div>

            <BecknRealtimeLocationDemo />
        </div>
    );
};

export default BecknRealtimeLocationDemoPage;