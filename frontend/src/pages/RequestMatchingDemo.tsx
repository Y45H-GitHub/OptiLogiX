import React, { useState } from 'react';
import { ArrowLeft, Package, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NetworkMarketplace from '@/components/NetworkMarketplace';
import RequestStatusTracker from '@/components/RequestStatusTracker';
import { SurplusInventoryItem, InventoryRequest } from '@/types/surplusNetwork';

const RequestMatchingDemo: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'marketplace' | 'requests'>('marketplace');
    const [requestCount, setRequestCount] = useState(0);
    const [matchCount, setMatchCount] = useState(0);

    const handleRequestSubmitted = (request: InventoryRequest) => {
        setRequestCount(prev => prev + 1);
        setMatchCount(prev => prev + 1);
    };

    const handleRequestItem = (item: SurplusInventoryItem) => {
        console.log('Item requested:', item.productName);
    };

    const handleRequestUpdate = (request: InventoryRequest) => {
        console.log('Request updated:', request);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-emerald-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.history.back()}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Request & Matching System Demo
                                </h1>
                                <p className="text-gray-600">
                                    Experience the surplus rescue network request and matching workflow
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-emerald-600">{requestCount}</div>
                                <div className="text-xs text-gray-600">Requests</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-teal-600">{matchCount}</div>
                                <div className="text-xs text-gray-600">Matches</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="flex space-x-1 bg-white/60 backdrop-blur-md rounded-lg p-1 border border-emerald-200 mb-6">
                    <button
                        onClick={() => setActiveTab('marketplace')}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'marketplace'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                            }`}
                    >
                        <Package className="w-4 h-4" />
                        <span>Browse & Request</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'requests'
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        <span>Track Requests</span>
                    </button>
                </div>

                {/* Demo Instructions */}
                <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-blue-900 flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5" />
                            <span>Demo Instructions</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <h4 className="font-semibold mb-2">Browse & Request Tab:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Browse available surplus inventory items</li>
                                    <li>Click "Request Item" to open the request modal</li>
                                    <li>Fill out request details and submit</li>
                                    <li>Watch for instant "Match Found!" notifications</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Track Requests Tab:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>View all submitted requests and their status</li>
                                    <li>Track progress from pending → matched → completed</li>
                                    <li>See request details and timeline</li>
                                    <li>Monitor delivery preferences and notes</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content */}
                <div className="bg-white/60 backdrop-blur-md rounded-lg border border-emerald-200 p-6">
                    {activeTab === 'marketplace' && (
                        <NetworkMarketplace
                            onRequestItem={handleRequestItem}
                            onRequestSubmitted={handleRequestSubmitted}
                        />
                    )}

                    {activeTab === 'requests' && (
                        <RequestStatusTracker
                            onRequestUpdate={handleRequestUpdate}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestMatchingDemo;