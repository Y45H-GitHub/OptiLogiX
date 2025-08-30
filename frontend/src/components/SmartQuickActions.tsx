import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    Package,
    Search,
    Network,
    BarChart3,
    Plus,
    AlertTriangle,
    TrendingUp,
    Users,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { smartActionsService, SmartAction } from '@/services/smartActionsService';
import UnderstockRequestModal from './UnderstockRequestModal';
import { toast } from 'sonner';

interface SmartQuickActionsProps {
    onActionClick?: (action: SmartAction) => void;
}

const SmartQuickActions = ({ onActionClick }: SmartQuickActionsProps) => {
    const [actions, setActions] = useState<SmartAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectingParticipant, setConnectingParticipant] = useState<string | null>(null);
    const [requestingCategory, setRequestingCategory] = useState<string | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        loadSmartActions();
    }, []);

    const loadSmartActions = async () => {
        try {
            setLoading(true);
            setError(null);
            const smartActions = await smartActionsService.generateSmartActions();
            setActions(smartActions);
        } catch (err) {
            console.error('Error loading smart actions:', err);
            setError('Failed to load smart actions');
            // Fallback to default actions
            setActions(getDefaultActions());
        } finally {
            setLoading(false);
        }
    };

    const getDefaultActions = (): SmartAction[] => [
        {
            id: 'list-surplus',
            type: 'browse_overstock',
            title: 'List Surplus Inventory',
            description: 'Add new surplus items to the marketplace',
            icon: 'Plus',
            priority: 'medium'
        },
        {
            id: 'browse-marketplace',
            type: 'browse_understock',
            title: 'Browse Marketplace',
            description: 'Find items available in the network',
            icon: 'Search',
            priority: 'medium'
        },
        {
            id: 'manage-network',
            type: 'connect_network',
            title: 'Manage Network',
            description: 'Connect with network partners',
            icon: 'Network',
            priority: 'medium'
        },
        {
            id: 'view-reports',
            type: 'generate_report',
            title: 'View Reports',
            description: 'Analyze network performance',
            icon: 'BarChart3',
            priority: 'medium'
        }
    ];

    const getIconComponent = (iconName: string) => {
        const iconMap: { [key: string]: any } = {
            Package,
            Search,
            Network,
            BarChart3,
            Plus,
            AlertTriangle,
            TrendingUp,
            Users,
            Activity
        };
        const IconComponent = iconMap[iconName] || Activity;
        return <IconComponent className="w-4 h-4" />;
    };

    const getPriorityColor = (priority: SmartAction['priority']) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-600 hover:bg-red-700 text-white border-red-600';
            case 'high':
                return 'bg-orange-600 hover:bg-orange-700 text-white border-orange-600';
            case 'medium':
                return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
            case 'low':
                return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
            default:
                return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
        }
    };

    const getPriorityBadgeColor = (priority: SmartAction['priority']) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleActionClick = async (action: SmartAction) => {
        if (action.type === 'connect_network' && action.data) {
            await handleConnectParticipant(action.data);
        } else if (action.type === 'browse_understock' && action.data?.category) {
            await handleCreateRequest(action.data.category);
        } else if (onActionClick) {
            onActionClick(action);
        } else if (action.actionUrl) {
            // In a real app, this would use React Router
            console.log('Navigate to:', action.actionUrl);
        } else {
            console.log('Execute action:', action);
        }
    };

    const handleConnectParticipant = async (participantData: any) => {
        try {
            setConnectingParticipant(participantData.participantId);

            const result = await smartActionsService.connectWithParticipant(
                participantData.participantId,
                participantData.canProvide || []
            );

            if (result.success) {
                toast.success(result.message);
                // Refresh actions to reflect changes
                await loadSmartActions();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to connect with participant');
        } finally {
            setConnectingParticipant(null);
        }
    };

    const handleCreateRequest = (category: string) => {
        setSelectedCategory(category);
        setShowRequestModal(true);
    };

    const handleRequestSuccess = async () => {
        await loadSmartActions();
    };

    if (loading) {
        return (
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-700" />
                        Smart Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-600">Analyzing network...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-700" />
                        Smart Actions
                        {actions.some(a => a.priority === 'critical' || a.priority === 'high') && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 ml-2">
                                Action Required
                            </Badge>
                        )}
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadSmartActions}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Refresh
                    </Button>
                </div>
                {error && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {actions.map((action) => (
                        <div
                            key={action.id}
                            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`p-2 rounded-lg ${getPriorityColor(action.priority).replace('hover:', '').replace('text-white', 'text-white').split(' ')[0]} bg-opacity-10`}>
                                    {getIconComponent(action.icon)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                                        <Badge className={`text-xs ${getPriorityBadgeColor(action.priority)}`}>
                                            {action.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600">{action.description}</p>

                                    {/* Show additional context for specific action types */}
                                    {action.type === 'browse_overstock' && action.data && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                            <Package className="w-3 h-3" />
                                            <span>{action.data.items?.length || 0} items available</span>
                                        </div>
                                    )}

                                    {action.type === 'browse_understock' && action.data && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                            <Search className="w-3 h-3" />
                                            <span>{action.data.requests?.length || 0} pending requests</span>
                                        </div>
                                    )}

                                    {action.type === 'connect_network' && action.data && (
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                            <Users className="w-3 h-3" />
                                            <span>Match score: {Math.round((action.data.matchScore || 0) * 100)}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {action.type === 'browse_understock' && (
                                    <Button
                                        onClick={() => handleCreateRequest(action.data?.category || '')}
                                        disabled={requestingCategory === action.data?.category}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                    >
                                        {requestingCategory === action.data?.category ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            'Request Items'
                                        )}
                                    </Button>
                                )}
                                <Button
                                    onClick={() => handleActionClick(action)}
                                    disabled={
                                        (action.type === 'connect_network' && connectingParticipant === action.data?.participantId) ||
                                        (action.type === 'browse_understock' && requestingCategory === action.data?.category)
                                    }
                                    className={getPriorityColor(action.priority)}
                                    size="sm"
                                >
                                    {action.type === 'connect_network' && connectingParticipant === action.data?.participantId ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <>
                                            {action.type === 'browse_overstock' && 'Browse'}
                                            {action.type === 'browse_understock' && 'Find Items'}
                                            {action.type === 'connect_network' && 'Connect'}
                                            {action.type === 'generate_report' && 'Generate'}
                                            <ArrowRight className="w-3 h-3 ml-1" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick add action always available */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button
                        onClick={() => handleActionClick({
                            id: 'quick-add',
                            type: 'browse_overstock',
                            title: 'List New Surplus',
                            description: 'Add surplus inventory to marketplace',
                            icon: 'Plus',
                            priority: 'medium'
                        })}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        List Surplus Inventory
                    </Button>
                </div>
            </CardContent>

            <UnderstockRequestModal
                category={selectedCategory}
                isOpen={showRequestModal}
                onClose={() => setShowRequestModal(false)}
                onSuccess={handleRequestSuccess}
            />
        </Card>
    );
};

export default SmartQuickActions;