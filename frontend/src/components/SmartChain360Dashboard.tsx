
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layout, MapPin, Package, AlertTriangle, TrendingUp, Users, Clock, DollarSign, Truck, Globe } from 'lucide-react';

const SmartChain360Dashboard = () => {
  const [realTimeData, setRealTimeData] = useState({
    activeShipments: 127,
    pendingCompliance: 8,
    riskAlerts: 3,
    todayRevenue: 245680,
    onTimeDelivery: 94.2
  });

  const [liveShipments] = useState([
    { id: 'SH-001', route: 'LA → London', status: 'In Transit', eta: '2 days', risk: 'low' },
    { id: 'SH-002', route: 'NYC → Tokyo', status: 'Port Delay', eta: '5 days', risk: 'high' },
    { id: 'SH-003', route: 'Miami → Amsterdam', status: 'On Schedule', eta: '3 days', risk: 'low' },
    { id: 'SH-004', route: 'Seattle → Sydney', status: 'Weather Hold', eta: '7 days', risk: 'medium' }
  ]);

  const [inventoryAlerts] = useState([
    { sku: 'ELEC-001', item: 'Laptop Batteries', level: 'Critical', stock: 12, threshold: 50 },
    { sku: 'FURN-045', item: 'Office Chairs', level: 'Low', stock: 23, threshold: 30 },
    { sku: 'TOOLS-089', item: 'Power Drills', level: 'Reorder', stock: 45, threshold: 100 }
  ]);

  const [complianceIssues] = useState([
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveShipments.map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getRiskColor(shipment.risk)} text-white text-xs`}>
                      {shipment.id}
                    </Badge>
                    <div>
                      <p className="font-medium text-gray-800">{shipment.route}</p>
                      <p className="text-sm text-gray-600">{shipment.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">ETA: {shipment.eta}</p>
                    <Badge className={`${getRiskColor(shipment.risk)} text-white text-xs`}>
                      {shipment.risk.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card className="bg-white/90 backdrop-blur-md border-2 border-orange-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-600" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryAlerts.map((alert) => (
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
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">Stock: {alert.stock}</p>
                    <p className="text-xs text-gray-600">Min: {alert.threshold}</p>
                  </div>
                </div>
              ))}
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
              <div key={issue.id} className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-l-red-500 rounded-lg">
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
                  <Button size="sm" variant="outline" className="text-xs">
                    Review
                  </Button>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white text-xs">
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
