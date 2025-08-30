import SurplusRescueNetworkDashboard from '@/components/SurplusRescueNetworkDashboard';

const SurplusRescueNetworkDashboardDemo = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Surplus Rescue Network Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Monitor your network activity, track surplus inventory, and manage rescue operations
                    </p>
                </div>

                <SurplusRescueNetworkDashboard />
            </div>
        </div>
    );
};

export default SurplusRescueNetworkDashboardDemo;