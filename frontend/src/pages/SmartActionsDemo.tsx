import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Lightbulb,
    Target,
    Network,
    BarChart3
} from 'lucide-react';
import SmartQuickActions from '@/components/SmartQuickActions';
import NetworkAnalysisReport from '@/components/NetworkAnalysisReport';
import { SmartAction } from '@/services/smartActionsService';

const SmartActionsDemo = () => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'report'>('dashboard');
    const [selectedAction, setSelectedAction] = useState<SmartAction | null>(null);

    const handleSmartAction = (action: SmartAction) => {
        setSelectedAction(action);

        if (action.type === 'generate_report') {
            setCurrentView('report');
        } else {
            // Show action details
            console.log('Smart action triggered:', action);
        }
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
        setSelectedAction(null);
    };

    if (currentView === 'report') {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="outline"
                        onClick={handleBackToDashboard}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Network Analysis Report</h1>
                </div>
                <NetworkAnalysisReport onClose={handleBackToDashboard} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Smart Actions Demo</h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Experience intelligent, context-aware actions that adapt to your network's current state.
                    The system analyzes inventory levels, identifies opportunities, and suggests optimal actions.
                </p>
            </div>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Intelligent Analysis</h3>
                        <p className="text-sm text-gray-600">
                            Automatically analyzes inventory levels and identifies overstock/understock situations
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Targeted Actions</h3>
                        <p className="text-sm text-gray-600">
                            Suggests specific actions based on current network needs and opportunities
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Network className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Network Matching</h3>
                        <p className="text-sm text-gray-600">
                            Identifies high-potential network partners for collaboration
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Detailed Reports</h3>
                        <p className="text-sm text-gray-600">
                            Generates comprehensive analysis reports with actionable insights
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Smart Actions Component */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <SmartQuickActions onActionClick={handleSmartAction} />
                </div>

                {/* Action Details */}
                <div>
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                Action Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedAction ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-2">{selectedAction.title}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{selectedAction.description}</p>
                                        <Badge className={`text-xs ${selectedAction.priority === 'critical' ? 'bg-red-100 text-red-800' :
                                                selectedAction.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    selectedAction.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedAction.priority} priority
                                        </Badge>
                                    </div>

                                    {selectedAction.data && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <h4 className="font-medium text-gray-900 mb-2">Additional Context:</h4>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                {selectedAction.type === 'browse_overstock' && selectedAction.data.category && (
                                                    <>
                                                        <p>• Category: {selectedAction.data.category}</p>
                                                        <p>• Available items: {selectedAction.data.items?.length || 0}</p>
                                                    </>
                                                )}
                                                {selectedAction.type === 'browse_understock' && selectedAction.data.category && (
                                                    <>
                                                        <p>• Category: {selectedAction.data.category}</p>
                                                        <p>• Pending requests: {selectedAction.data.requests?.length || 0}</p>
                                                    </>
                                                )}
                                                {selectedAction.type === 'connect_network' && selectedAction.data.companyName && (
                                                    <>
                                                        <p>• Company: {selectedAction.data.companyName}</p>
                                                        <p>• Match score: {Math.round((selectedAction.data.matchScore || 0) * 100)}%</p>
                                                        <p>• Can provide: {selectedAction.data.canProvide?.join(', ') || 'N/A'}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No action selected</p>
                                    <p className="text-sm">Click on a smart action to see details</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* How It Works */}
            <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">How Smart Actions Work</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">1</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Analyze</h3>
                            <p className="text-sm text-gray-600">
                                System continuously analyzes inventory levels, requests, and network patterns
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">2</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Identify</h3>
                            <p className="text-sm text-gray-600">
                                Identifies opportunities for optimization, partnerships, and efficiency improvements
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">3</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Suggest</h3>
                            <p className="text-sm text-gray-600">
                                Presents prioritized, actionable recommendations with clear next steps
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SmartActionsDemo;