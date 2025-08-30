import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Package,
    Recycle,
    DollarSign,
    Clock,
    Plus,
    Search,
    TrendingUp,
    Users,
    CheckCircle,
    AlertCircle,
    Filter,
    BarChart3,
    Network,
    ArrowUpRight,
    ArrowDownRight,
    Activity
} from 'lucide-react';
import { surplusNetworkService } from '@/services/surplusNetworkService';
import { SurplusInventoryItem, InventoryRequest, NetworkAnalytics } from '@/types/surplusNetwork';
import { DemoScenario } from '@/services/surplusNetworkDemoService';
import SurplusNetworkDemoSelector from './SurplusNetworkDemoSelector';
import SmartQuickActions from './SmartQuickActions';
import { SmartAction } from '@/services/smartActionsService';

const SurplusRescueNetworkDashboard = () => {
    const [analytics, setAnalytics] = useState<NetworkAnalytics | null>(null);
    const [recentListings, setRecentListings] = useState<SurplusInventoryItem[]>([]);
    const [activeRequests, setActiveRequests] = useState<InventoryRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Demo features state
    const [demoScenarios, setDemoScenarios] = useState<DemoScenario[]>([]);
    const [currentScenario, setCurrentScenario] = useState<string>('all');
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);

                // Load demo scenarios
                const scenarios = await surplusNetworkService.getDemoScenarios();
                setDemoScenarios(scenarios);

                // Load analytics data (scenario-specific if selected)
                const analyticsData = await surplusNetworkService.getNetworkAnalytics(
                    currentScenario !== 'all' ? currentScenario : undefined
                );
                setAnalytics(analyticsData);

                // Load surplus listings based on current scenario
                let inventory: SurplusInventoryItem[];
                if (currentScenario === 'all') {
                    inventory = await surplusNetworkService.getSurplusInventory();
                } else {
                    inventory = await surplusNetworkService.getSurplusInventoryByScenario(currentScenario);
                }

                const recent = inventory
                    .filter(item => item.status === 'available')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);
                setRecentListings(recent);

                // Load active requests
                const allRequests = await surplusNetworkService.getInventoryRequests();
                const active = allRequests
                    .filter(req => req.status === 'pending' || req.status === 'accepted')
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);
                setActiveRequests(active);

            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [currentScenario]);

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-500';
            case 'pending': return 'bg-yellow-500';
            case 'rejected': return 'bg-red-500';
            case 'completed': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    const handleScenarioChange = (scenarioId: string) => {
        setCurrentScenario(scenarioId);
    };

    const handleSmartAction = (action: SmartAction) => {
        console.log('Smart action triggered:', action);

        // Handle different action types
        switch (action.type) {
            case 'browse_overstock':
                if (action.data?.category) {
                    console.log(`Browsing overstock in category: ${action.data.category}`);
                    // In a real app: navigate to marketplace with overstock filter
                }
                break;
            case 'browse_understock':
                if (action.data?.category) {
                    console.log(`Finding items for understock category: ${action.data.category}`);
                    // In a real app: navigate to marketplace with understock filter
                }
                break;
            case 'connect_network':
                if (action.data?.participantId) {
                    console.log(`Connecting with participant: ${action.data.companyName}`);
                    // In a real app: navigate to network connection page
                }
                break;
            case 'generate_report':
                console.log('Generating network analysis report');
                // In a real app: navigate to reports page or open modal
                break;
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
        return `$${amount.toLocaleString()}`;
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="bg-white/90 backdrop-blur-md border-2 border-gray-200 shadow-xl animate-pulse">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
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

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Surplus Network Dashboard</h1>
                    <p className="text-gray-600 mt-1">Monitor and manage surplus inventory across your network</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setFilterOpen(!filterOpen)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                    <Button
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                    </Button>
                </div>
            </div>

            {/* Demo Scenario Selector - More Professional */}
            <SurplusNetworkDemoSelector
                scenarios={demoScenarios}
                currentScenario={currentScenario}
                onScenarioChange={handleScenarioChange}
            />

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatCurrency(analytics?.totalCostSavings || 0)}
                                </p>
                                <div className="flex items-center mt-2">
                                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-600 ml-1">+12.5% from last month</span>
                                </div>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg">
                                <DollarSign className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active Listings</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatNumber(analytics?.totalItemsShared || 0)}
                                </p>
                                <div className="flex items-center mt-2">
                                    <ArrowUpRight className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-600 ml-1">+8.2% this week</span>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Package className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Successful Matches</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {formatNumber(analytics?.totalItemsReceived || 0)}
                                </p>
                                <div className="flex items-center mt-2">
                                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm text-emerald-600 ml-1">94% success rate</span>
                                </div>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg">
                                <Network className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {analytics?.averageResponseTime?.toFixed(1) || '0'}h
                                </p>
                                <div className="flex items-center mt-2">
                                    <ArrowDownRight className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-600 ml-1">-15% improvement</span>
                                </div>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Smart Quick Actions */}
            <SmartQuickActions onActionClick={handleSmartAction} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Surplus Listings */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-gray-700" />
                                Recent Listings
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                                View All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentListings.length > 0 ? (
                                recentListings.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Package className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.productName}</p>
                                                <p className="text-sm text-gray-600">
                                                    {item.quantityAvailable} units • {formatCurrency(item.unitPrice)} each
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {item.category}
                                                    </Badge>
                                                    <Badge
                                                        variant={item.condition === 'new' ? 'default' : 'outline'}
                                                        className="text-xs"
                                                    >
                                                        {item.condition.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">{item.location}</p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Listed {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No recent listings</p>
                                    <p className="text-sm">New surplus inventory will appear here</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Active Requests */}
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-700" />
                                Active Requests
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                                Manage All
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activeRequests.length > 0 ? (
                                activeRequests.map((request) => {
                                    const surplusItem = recentListings.find(item => item.id === request.surplusItemId);
                                    return (
                                        <div key={request.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {surplusItem?.productName || 'Item Request'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Requesting {request.requestedQuantity} units
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge
                                                            variant={request.urgencyLevel === 'critical' ? 'destructive' :
                                                                request.urgencyLevel === 'high' ? 'default' : 'secondary'}
                                                            className="text-xs"
                                                        >
                                                            {request.urgencyLevel}
                                                        </Badge>
                                                        <Badge
                                                            variant={request.status === 'accepted' ? 'default' : 'outline'}
                                                            className="text-xs"
                                                        >
                                                            {request.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-600">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No active requests</p>
                                    <p className="text-sm">Incoming requests will appear here</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Network Activity */}
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-gray-700" />
                            Network Activity
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                            View All Activity
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Successful Match Completed</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Standing Desk Converters successfully transferred to Global Office Supplies
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                    <Badge variant="default" className="text-xs">Completed</Badge>
                                    <span className="text-xs text-gray-500">2 hours ago</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Package className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">New Inventory Listed</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    HP LaserJet Printers added to marketplace by TechCorp Solutions
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                    <Badge variant="secondary" className="text-xs">New Listing</Badge>
                                    <span className="text-xs text-gray-500">4 hours ago</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">New Network Member</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Sustainable Solutions Inc. joined the surplus network
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                    <Badge variant="outline" className="text-xs">Network Growth</Badge>
                                    <span className="text-xs text-gray-500">1 day ago</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg">
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Request Awaiting Response</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Dell Latitude Laptops requested by Global Office Supplies
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                    <Badge variant="outline" className="text-xs">Pending</Badge>
                                    <span className="text-xs text-gray-500">2 days ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SurplusRescueNetworkDashboard;