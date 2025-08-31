
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Package, AlertTriangle, Clock, DollarSign, Truck, Globe, Bell } from 'lucide-react';
import { useNotifications, PurchaseOrder } from '@/contexts/NotificationContext';
import { useInventoryAlerts } from '@/hooks/useInventoryAlerts';

const SmartChain360Dashboard = () => {
  const { createPurchaseOrder, resetNotifications } = useNotifications();
  const { inventoryAlerts, resetInventoryAlerts } = useInventoryAlerts();
  const navigate = useNavigate();

  const [realTimeData, setRealTimeData] = useState({
    activeShipments: 127,
    pendingCompliance: 8,
    riskAlerts: 3,
    todayRevenue: 245680,
    onTimeDelivery: 94.2
  });

  // Initial shipment data with more realistic structure for live updates
  const [liveShipments, setLiveShipments] = useState([
    { id: 'SH-001', route: 'LA → London', status: 'In Transit', eta: '2 days', risk: 'low', progress: 45 },
    { id: 'SH-002', route: 'NYC → Tokyo', status: 'Port Delay', eta: '5 days', risk: 'high', progress: 20 },
    { id: 'SH-003', route: 'Miami → Amsterdam', status: 'On Schedule', eta: '3 days', risk: 'low', progress: 65 },
    { id: 'SH-004', route: 'Seattle → Sydney', status: 'Weather Hold', eta: '7 days', risk: 'medium', progress: 15 },
    { id: 'SH-005', route: 'Houston → Hamburg', status: 'In Transit', eta: '4 days', risk: 'low', progress: 30 },
    { id: 'SH-006', route: 'Portland → Singapore', status: 'Delayed', eta: '6 days', risk: 'medium', progress: 55 }
  ]);

  // Available statuses for rotation
  const statusOptions = ['In Transit', 'Delayed', 'Port Delay', 'Weather Hold', 'On Schedule', 'Delivered'];
  const riskOptions = ['low', 'medium', 'high'];
  const etaOptions = ['1 day', '2 days', '3 days', '4 days', '5 days', '6 days', '7 days'];

  // Live data update effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveShipments(prevShipments => {
        return prevShipments.map(shipment => {
          // Random chance to update each shipment (30% chance per update cycle)
          if (Math.random() < 0.3) {
            const newStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
            const newRisk = riskOptions[Math.floor(Math.random() * riskOptions.length)];
            const newEta = etaOptions[Math.floor(Math.random() * etaOptions.length)];
            const progressChange = Math.random() < 0.5 ? 5 : -2; // Progress can increase or slightly decrease
            const newProgress = Math.max(0, Math.min(100, shipment.progress + progressChange));

            // If shipment is delivered, replace it with a new one
            if (newStatus === 'Delivered') {
              const routes = [
                'Chicago → Berlin', 'Boston → Paris', 'Denver → Rome', 'Phoenix → Madrid',
                'Atlanta → Barcelona', 'Dallas → Milan', 'San Diego → Vienna'
              ];
              const newRoute = routes[Math.floor(Math.random() * routes.length)];
              const newId = `SH-${String(Math.floor(Math.random() * 999) + 100).padStart(3, '0')}`;

              return {
                id: newId,
                route: newRoute,
                status: 'In Transit',
                eta: etaOptions[Math.floor(Math.random() * etaOptions.length)],
                risk: riskOptions[Math.floor(Math.random() * riskOptions.length)],
                progress: Math.floor(Math.random() * 20) + 5 // Start with 5-25% progress
              };
            }

            return {
              ...shipment,
              status: newStatus,
              eta: newEta,
              risk: newRisk,
              progress: newProgress
            };
          }
          return shipment;
        });
      });

      // Update real-time metrics based on current shipments
      setRealTimeData(prevData => {
        const currentShipments = liveShipments;
        const riskAlerts = currentShipments.filter(s => s.risk === 'high' || s.status === 'Delayed' || s.status === 'Port Delay').length;
        const revenueChange = Math.floor(Math.random() * 10000) - 5000; // Random revenue fluctuation

        return {
          ...prevData,
          riskAlerts,
          todayRevenue: Math.max(200000, prevData.todayRevenue + revenueChange),
          onTimeDelivery: parseFloat((Math.max(85, Math.min(98, prevData.onTimeDelivery + (Math.random() - 0.5) * 2))).toFixed(2))
        };
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [liveShipments]);

  const handleResetDemo = () => {
    resetInventoryAlerts();
    resetNotifications();
  };

  const [complianceIssues, setComplianceIssues] = useState([
    { id: 'C-001', type: 'Restricted Item', destination: 'Germany', issue: 'Lithium battery documentation missing' },
    { id: 'C-002', type: 'Embargo', destination: 'Iran', issue: 'Cannot ship to embargoed country' },
    { id: 'C-003', type: 'Documentation', destination: 'Brazil', issue: 'Commercial invoice required' }
  ]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'bg-red-500';
      case 'Low': return 'bg-yellow-500';
      case 'Reorder': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Function to handle sending inventory alerts to notification system
  const handleSendToNotifications = async (alert: typeof inventoryAlerts[0]) => {
    // Map inventory alert data to PurchaseOrder interface
    const suggestedQuantity = Math.max(alert.threshold - alert.stock, alert.threshold * 0.5);
    const unitPrice = getEstimatedUnitPrice(alert.sku);

    const purchaseOrder: PurchaseOrder = {
      id: `PO-${Date.now()}`,
      sku: alert.sku,
      productName: alert.item,
      quantity: Math.ceil(suggestedQuantity),
      unitPrice: unitPrice,
      totalCost: Math.ceil(suggestedQuantity) * unitPrice,
      supplier: getSupplierForSku(alert.sku),
      requestedBy: 'Dashboard System',
      requestDate: new Date(),
      priority: alert.level === 'Critical' ? 'high' : alert.level === 'Low' ? 'medium' : 'low',
      justification: `Inventory alert: ${alert.level} stock level. Current: ${alert.stock}, Threshold: ${alert.threshold}`,
      status: 'pending'
    };

    try {
      await createPurchaseOrder(purchaseOrder);
      // You could add a toast notification here for user feedback
    } catch (error) {
      console.error('Failed to create purchase order:', error);
      // You could add error handling/toast here
    }
  };

  // Helper function to get estimated unit price based on SKU
  const getEstimatedUnitPrice = (sku: string): number => {
    const priceMap: { [key: string]: number } = {
      'ELEC-001': 25.99, // Laptop Batteries
      'FURN-045': 149.99, // Office Chairs
      'TOOLS-089': 89.99, // Power Drills
    };
    return priceMap[sku] || 50.00; // Default price if SKU not found
  };

  // Helper function to get supplier based on SKU
  const getSupplierForSku = (sku: string): string => {
    const supplierMap: { [key: string]: string } = {
      'ELEC-001': 'ElectroTech Supply Co.',
      'FURN-045': 'Office Furniture Direct',
      'TOOLS-089': 'Industrial Tools Inc.',
    };
    return supplierMap[sku] || 'General Supplier Co.';
  };

  // Function to handle compliance alert navigation
  const handleComplianceAlertClick = (issue: typeof complianceIssues[0]) => {
    // Store compliance issue data in localStorage for the compliance checker to access
    localStorage.setItem('complianceIssueData', JSON.stringify(issue));

    // Navigate to compliance checker page
    navigate('/compliance-checker');
  };

  // Function to resolve compliance alert (remove from dashboard)
  const handleResolveComplianceAlert = (issueId: string) => {
    setComplianceIssues(prevIssues =>
      prevIssues.filter(issue => issue.id !== issueId)
    );

    // Update the pending compliance count in real-time data
    setRealTimeData(prevData => ({
      ...prevData,
      pendingCompliance: Math.max(0, prevData.pendingCompliance - 1)
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Truck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-800">{realTimeData.activeShipments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border-2 border-yellow-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Compliance Issues</p>
                <p className="text-2xl font-bold text-gray-800">{realTimeData.pendingCompliance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border-2 border-red-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Globe className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Alerts</p>
                <p className="text-2xl font-bold text-gray-800">{realTimeData.riskAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border-2 border-green-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-800">${realTimeData.todayRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border-2 border-blue-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">On-Time Delivery</p>
                <p className="text-2xl font-bold text-gray-800">{realTimeData.onTimeDelivery}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Shipment Map */}
        <Card className="bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-600" />
              Live Shipment Tracking
              <div className="flex items-center gap-1 ml-auto">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveShipments.map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-500 hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getRiskColor(shipment.risk)} text-white text-xs`}>
                      {shipment.id}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-800">{shipment.route}</p>
                      <p className="text-sm text-gray-600">{shipment.status}</p>
                      <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: `${shipment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">ETA: {shipment.eta}</p>
                    <Badge className={`${getRiskColor(shipment.risk)} text-white text-xs`}>
                      {shipment.risk.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{shipment.progress}% complete</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card className="bg-white/90 backdrop-blur-md border-2 border-orange-200 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <Package className="w-6 h-6 text-orange-600" />
                Inventory Alerts
              </CardTitle>
              <Button
                size="sm"
                onClick={handleResetDemo}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs"
              >
                Reset Demo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">All inventory alerts processed!</p>
                  <p className="text-sm">Click "Reset Demo" to restore alerts for presentation.</p>
                </div>
              ) : (
                inventoryAlerts.map((alert) => (
                  <div key={alert.sku} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getAlertColor(alert.level)} text-white text-xs`}>
                        {alert.level}
                      </Badge>
                      <div>
                        <p className="font-medium text-gray-800">{alert.item}</p>
                        <p className="text-sm text-gray-600">SKU: {alert.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">Stock: {alert.stock}</p>
                        <p className="text-xs text-gray-600">Min: {alert.threshold}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendToNotifications(alert)}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs flex items-center gap-1"
                      >
                        <Bell className="w-3 h-3" />
                        Send to Notifications
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alert Feed */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-red-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Compliance Alert Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-l-red-500 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                onClick={() => handleComplianceAlertClick(issue)}
              >
                <div className="flex items-center gap-3">
                  <Badge className="bg-red-500 text-white text-xs">
                    {issue.type}
                  </Badge>
                  <div>
                    <p className="font-medium text-gray-800">Destination: {issue.destination}</p>
                    <p className="text-sm text-gray-600">{issue.issue}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking Review
                      handleComplianceAlertClick(issue);
                    }}
                  >
                    Review
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white text-xs"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking Resolve
                      handleResolveComplianceAlert(issue.id);
                    }}
                  >
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartChain360Dashboard;
