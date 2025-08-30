import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Cpu,
    Database,
    Globe,
    Layers,
    Monitor,
    Network,
    RefreshCw,
    Settings,
    TrendingUp,
    Zap
} from 'lucide-react';
import { digitalTwinService } from '@/services/digitalTwinService';
import { DigitalTwinData, SupplyChainNode } from '@/types/digitalTwin';
import InteractiveSupplyChainGraph from './InteractiveSupplyChainGraph';
import CarbonHeatmap from './CarbonHeatmap';
import SupplierSwapRecommendations from './SupplierSwapRecommendations';

const DigitalTwinDashboard = () => {
    const [digitalTwinData, setDigitalTwinData] = useState<DigitalTwinData | null>(null);
    const [selectedNode, setSelectedNode] = useState<SupplyChainNode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        loadDigitalTwinData();

        // Set up real-time updates every 30 seconds
        const interval = setInterval(() => {
            loadDigitalTwinData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadDigitalTwinData = async () => {
        try {
            setError(null);
            const data = await digitalTwinService.getDigitalTwinData();
            setDigitalTwinData(data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error loading digital twin data:', err);
            setError('Failed to load digital twin data');
        } finally {
            setLoading(false);
        }
    };

    const handleNodeSelect = (node: SupplyChainNode | null) => {
        setSelectedNode(node);
    };

    const handleRefresh = () => {
        setLoading(true);
        loadDigitalTwinData();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'operational':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'maintenance':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading && !digitalTwinData) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto">
                <Card className="border-red-200">
                    <CardContent className="p-6 text-center">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Digital Twin</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={handleRefresh} className="bg-red-600 hover:bg-red-700">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!digitalTwinData) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Digital Twin Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        Real-time supply chain visualization and analytics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-500">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Settings
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Network className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Nodes</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {digitalTwinData.nodes.filter(n => n.status === 'operational').length}
                                </p>
                                <p className="text-xs text-gray-500">
                                    of {digitalTwinData.nodes.length} total
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Efficiency Score</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {Math.round(digitalTwinData.metrics.efficiency * 100)}%
                                </p>
                                <p className="text-xs text-green-600">
                                    +2.3% from last week
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Zap className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Carbon Footprint</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {digitalTwinData.metrics.carbonFootprint.toFixed(1)}t
                                </p>
                                <p className="text-xs text-orange-600">
                                    -5.2% reduction
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Activity className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Alerts</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {digitalTwinData.alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length}
                                </p>
                                <p className="text-xs text-gray-500">
                                    high priority
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Supply Chain Graph */}
                <div className="lg:col-span-2">
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                Supply Chain Network
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <InteractiveSupplyChainGraph
                                nodes={digitalTwinData.nodes}
                                connections={digitalTwinData.connections}
                                onNodeSelect={handleNodeSelect}
                                selectedNode={selectedNode}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Node Details */}
                <div>
                    <Card className="bg-white border border-gray-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="w-5 h-5" />
                                Node Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedNode ? (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            {selectedNode.name}
                                        </h3>
                                        <Badge className={getStatusColor(selectedNode.status)}>
                                            {selectedNode.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Type:</span>
                                            <span className="text-sm font-medium">{selectedNode.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Location:</span>
                                            <span className="text-sm font-medium">{selectedNode.location}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Capacity:</span>
                                            <span className="text-sm font-medium">
                                                {selectedNode.capacity.current}/{selectedNode.capacity.max}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Utilization:</span>
                                            <span className="text-sm font-medium">
                                                {Math.round((selectedNode.capacity.current / selectedNode.capacity.max) * 100)}%
                                            </span>
                                        </div>
                                    </div>

                                    {selectedNode.metrics && (
                                        <div className="pt-3 border-t border-gray-100">
                                            <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Efficiency:</span>
                                                    <span className="font-medium">
                                                        {Math.round(selectedNode.metrics.efficiency * 100)}%
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Throughput:</span>
                                                    <span className="font-medium">
                                                        {selectedNode.metrics.throughput}/hr
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No node selected</p>
                                    <p className="text-sm">Click on a node in the graph to view details</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Carbon Footprint and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CarbonHeatmap data={digitalTwinData} />
                <SupplierSwapRecommendations
                    recommendations={digitalTwinData.recommendations}
                    onApplyRecommendation={(id) => {
                        console.log('Applying recommendation:', id);
                        // In a real app, this would trigger the recommendation
                    }}
                />
            </div>

            {/* Alerts and System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Active Alerts */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Active Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {digitalTwinData.alerts.slice(0, 5).map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`p-3 rounded-lg border ${alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                                        alert.severity === 'high' ? 'border-orange-200 bg-orange-50' :
                                            alert.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                                                'border-blue-200 bg-blue-50'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-1">
                                                {alert.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {alert.description}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(alert.severity)}>
                                                    {alert.severity}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {alert.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cpu className="w-5 h-5" />
                            System Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-600">Data Sync</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                    Healthy
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Network className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-600">Network</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                    Connected
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-600">Services</span>
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-800">
                                    Degraded
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-600">Analytics</span>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                    Running
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DigitalTwinDashboard;