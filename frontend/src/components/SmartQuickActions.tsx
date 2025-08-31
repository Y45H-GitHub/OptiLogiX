import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  Bell,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  storeNetworkService,
  SmartStoreAction,
} from "@/services/storeNetworkService";
import {
  smartActionsService,
  SmartAction,
} from "@/services/smartActionsService";
import UnderstockRequestModal from "./UnderstockRequestModal";
import MatchNotification from "./MatchNotification";
import { SurplusInventoryItem, InventoryMatch } from "@/types/surplusNetwork";
import { toast } from "sonner";

interface SmartQuickActionsProps {
  onActionClick?: (action: SmartAction | SmartStoreAction) => void;
  currentStoreId?: string;
}

const SmartQuickActions = ({
  onActionClick,
  currentStoreId = "store-1",
}: SmartQuickActionsProps) => {
  const [actions, setActions] = useState<SmartStoreAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingParticipant, setConnectingParticipant] = useState<
    string | null
  >(null);
  const [requestingCategory, setRequestingCategory] = useState<string | null>(
    null
  );
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [matchedItems, setMatchedItems] = useState<SurplusInventoryItem[]>([]);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<InventoryMatch | null>(
    null
  );
  const [liveMetrics, setLiveMetrics] = useState({
    totalSavings: 0,
    activeMatches: 0,
    networkEfficiency: 0,
    responseTime: 0,
  });

  useEffect(() => {
    loadSmartActions();
    loadNotifications();
    startLiveMetrics();
  }, [currentStoreId]);

  const startLiveMetrics = () => {
    // Update live metrics every 5 seconds to simulate real-time data
    const interval = setInterval(async () => {
      try {
        const matches = await storeNetworkService.findStoreMatches();
        const totalSavings = matches.reduce(
          (sum, m) => sum + m.estimatedSavings,
          0
        );
        const activeMatches = matches.filter(
          (m) => m.status === "pending" || m.status === "proposed"
        ).length;

        setLiveMetrics({
          totalSavings,
          activeMatches,
          networkEfficiency: Math.round(Math.random() * 20 + 80), // 80-100% efficiency
          responseTime: Math.round(Math.random() * 2 + 1), // 1-3 hours
        });
      } catch (err) {
        console.error("Error updating live metrics:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  };

  const loadSmartActions = async () => {
    try {
      setLoading(true);
      setError(null);
      const smartActions =
        await storeNetworkService.generateSmartStoreActions();
      setActions(smartActions);
    } catch (err) {
      console.error("Error loading smart actions:", err);
      setError("Failed to load smart actions");
      // Fallback to default actions
      setActions(getDefaultActions());
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const storeNotifications =
        await storeNetworkService.getStoreNotifications(currentStoreId);
      setNotifications(storeNotifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
    }
  };

  const getDefaultActions = (): SmartStoreAction[] => [
    {
      id: "list-surplus",
      type: "surplus_match",
      title: "List Surplus Inventory",
      description: "Add new surplus items to the marketplace",
      icon: "Plus",
      priority: "medium",
      estimatedImpact: {
        costSavings: 0,
        timeSavings: 0,
        efficiencyGain: 0,
      },
    },
    {
      id: "browse-marketplace",
      type: "need_fulfillment",
      title: "Browse Marketplace",
      description: "Find items available in the network",
      icon: "Search",
      priority: "medium",
      estimatedImpact: {
        costSavings: 0,
        timeSavings: 0,
        efficiencyGain: 0,
      },
    },
    {
      id: "manage-network",
      type: "store_connection",
      title: "Manage Network",
      description: "Connect with network partners",
      icon: "Network",
      priority: "medium",
      estimatedImpact: {
        costSavings: 0,
        timeSavings: 0,
        efficiencyGain: 0,
      },
    },
    {
      id: "view-reports",
      type: "network_optimization",
      title: "View Reports",
      description: "Analyze network performance",
      icon: "BarChart3",
      priority: "medium",
      estimatedImpact: {
        costSavings: 0,
        timeSavings: 0,
        efficiencyGain: 0,
      },
    },
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
      Bell,
      CheckCircle,
      XCircle,
    };
    return iconMap[iconName] || Activity;
  };

  const getPriorityColor = (priority: SmartStoreAction["priority"]) => {
    const colors = {
      critical: "text-red-600 bg-red-50 border-red-200",
      high: "text-orange-600 bg-orange-50 border-orange-200",
      medium: "text-blue-600 bg-blue-50 border-blue-200",
      low: "text-green-600 bg-green-50 border-green-200",
    };
    return colors[priority];
  };

  const getPriorityBadgeColor = (priority: SmartStoreAction["priority"]) => {
    const colors = {
      critical: "bg-red-100 text-red-800",
      high: "bg-orange-100 text-orange-800",
      medium: "bg-blue-100 text-blue-800",
      low: "bg-green-100 text-green-800",
    };
    return colors[priority];
  };

  const handleActionClick = async (action: SmartStoreAction) => {
    if (onActionClick) {
      onActionClick(action);
    }

    try {
      switch (action.type) {
        case "surplus_match":
          if (action.data) {
            setSelectedMatch(action.data);
            setShowMatchNotification(true);
          }
          break;

        case "need_fulfillment":
          if (action.data?.need) {
            setSelectedCategory(action.data.need.category);
            setShowRequestModal(true);
          }
          break;

        case "store_connection":
          if (action.data) {
            await handleStoreConnection(action.data);
          }
          break;

        case "inventory_alert":
          toast.info(`Inventory alert: ${action.title}`);
          break;

        case "network_optimization":
          if (action.data) {
            await handleNetworkOptimization(action.data);
          }
          break;

        default:
          console.log("Smart action triggered:", action);
      }
    } catch (err) {
      console.error("Error handling smart action:", err);
      toast.error("Failed to process action");
    }
  };

  const handleStoreConnection = async (connectionData: any) => {
    setConnectingParticipant(connectionData.storeId);
    try {
      // Simulate connection process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`Connected with ${connectionData.storeName}`);
      await loadSmartActions();
    } catch (err) {
      toast.error("Failed to connect with store");
    } finally {
      setConnectingParticipant(null);
    }
  };

  const handleNetworkOptimization = async (optimizationData: any) => {
    try {
      // Simulate optimization process
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(`Network optimized with ${optimizationData.storeName}`);
      await loadSmartActions();
    } catch (err) {
      toast.error("Failed to optimize network");
    }
  };

  const handleMatchProposal = async (
    match: InventoryMatch,
    accepted: boolean
  ) => {
    try {
      const success = await storeNetworkService.respondToMatch(
        match.id,
        accepted
      );
      if (success) {
        toast.success(accepted ? "Match accepted!" : "Match rejected");
        setShowMatchNotification(false);
        setSelectedMatch(null);
        await loadSmartActions();
        await loadNotifications();
      } else {
        toast.error("Failed to process match");
      }
    } catch (err) {
      toast.error("Error processing match");
    }
  };

  const handleProposeMatch = async (match: InventoryMatch) => {
    try {
      const success = await storeNetworkService.proposeMatch(
        match.id,
        currentStoreId
      );
      if (success) {
        toast.success("Match proposal sent!");
        setShowMatchNotification(false);
        setSelectedMatch(null);
        await loadNotifications();
      } else {
        toast.error("Failed to propose match");
      }
    } catch (err) {
      toast.error("Error proposing match");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTime = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Actions</h2>
          <p className="text-gray-600">
            AI-powered recommendations for your supply chain
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="flex items-center space-x-1"
            >
              <Bell className="w-3 h-3" />
              <span>{notifications.filter((n) => !n.read).length}</span>
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={loadSmartActions}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Activity className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Savings
                </p>
                <p className="text-xl font-bold text-green-900">
                  {formatCurrency(liveMetrics.totalSavings)}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Active Matches
                </p>
                <p className="text-xl font-bold text-blue-900">
                  {liveMetrics.activeMatches}
                </p>
              </div>
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Network Efficiency
                </p>
                <p className="text-xl font-bold text-purple-900">
                  {liveMetrics.networkEfficiency}%
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Avg Response
                </p>
                <p className="text-xl font-bold text-orange-900">
                  {liveMetrics.responseTime}h
                </p>
              </div>
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Smart Actions Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => {
            const IconComponent = getIconComponent(action.icon);
            return (
              <Card
                key={action.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 ${getPriorityColor(
                  action.priority
                )}`}
                onClick={(e) => {
                  // Don't trigger if clicking on the button
                  if ((e.target as HTMLElement).closest("button")) return;
                  handleActionClick(action);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5" />
                      <Badge className={getPriorityBadgeColor(action.priority)}>
                        {action.priority}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{action.description}</p>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold text-green-700">
                        {formatCurrency(action.estimatedImpact.costSavings)}
                      </div>
                      <div className="text-green-600">Savings</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-semibold text-blue-700">
                        {formatTime(action.estimatedImpact.timeSavings)}
                      </div>
                      <div className="text-blue-600">Time</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="font-semibold text-purple-700">
                        {Math.round(
                          action.estimatedImpact.efficiencyGain * 100
                        )}
                        %
                      </div>
                      <div className="text-purple-600">Efficiency</div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    disabled={connectingParticipant === action.data?.storeId}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(action);
                    }}
                  >
                    {connectingParticipant === action.data?.storeId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : action.type === "store_connection" ? (
                      <>
                        Connect
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Take Action
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Match Notification Modal */}
      {showMatchNotification && selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Surplus Match Found!</h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm">
                  <strong>{selectedMatch.surplusItem.productName}</strong>{" "}
                  available from another store
                </p>
                <p className="text-xs text-gray-600">
                  Quantity: {selectedMatch.storeNeed.quantityNeeded} units
                </p>
                <p className="text-xs text-gray-600">
                  Match Score: {Math.round(selectedMatch.matchScore * 100)}%
                </p>
                <p className="text-xs text-gray-600">
                  Estimated Savings:{" "}
                  {formatCurrency(selectedMatch.estimatedSavings)}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleMatchProposal(selectedMatch, true)}
                  className="flex-1"
                  variant="default"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept
                </Button>
                <Button
                  onClick={() => handleMatchProposal(selectedMatch, false)}
                  className="flex-1"
                  variant="outline"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
              <Button
                onClick={() => setShowMatchNotification(false)}
                variant="ghost"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Understock Request Modal */}
      {showRequestModal && (
        <UnderstockRequestModal
          isOpen={showRequestModal}
          category={selectedCategory}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            loadSmartActions();
          }}
        />
      )}
    </div>
  );
};

export default SmartQuickActions;
