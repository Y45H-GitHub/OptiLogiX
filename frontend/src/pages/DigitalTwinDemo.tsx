import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DigitalTwinDashboard from '@/components/DigitalTwinDashboard';

const DigitalTwinDemo = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Digital Twin Dashboard</h1>
                            <p className="text-gray-600">Real-time supply chain visualization and analytics</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="py-8">
                <DigitalTwinDashboard />
            </div>
        </div>
    );
};

export default DigitalTwinDemo;