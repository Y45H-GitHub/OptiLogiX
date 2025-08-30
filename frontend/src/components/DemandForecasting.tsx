
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Package, AlertTriangle, BarChart } from 'lucide-react';

interface ProductForecast {
  id: string;
  sku: string;
  name: string;
  currentStock: number;
  predictedDemand: number;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  weeklyForecast: number[];
  recommendation: string;
}

const DemandForecasting = () => {
  const [forecasts, setForecasts] = useState<ProductForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('4weeks');

  const mockForecasts: ProductForecast[] = [
    {
      id: '1',
      sku: 'WH-001',
      name: 'Wireless Headphones',
      currentStock: 150,
      predictedDemand: 340,
      riskLevel: 'high',
      trend: 'up',
      weeklyForecast: [85, 92, 78, 85],
      recommendation: 'Order 200 units immediately - high risk of stockout'
    },
    {
      id: '2',
      sku: 'SM-445',
      name: 'Smartphone Cases',
      currentStock: 890,
      predictedDemand: 245,
      riskLevel: 'low',
      trend: 'down',
      weeklyForecast: [65, 58, 62, 60],
      recommendation: 'Consider reducing next order - potential overstock'
    },
    {
      id: '3',
      sku: 'TB-220',
      name: 'Gaming Tablets',
      currentStock: 45,
      predictedDemand: 120,
      riskLevel: 'medium',
      trend: 'up',
      weeklyForecast: [28, 32, 30, 30],
      recommendation: 'Order 80 units within 2 weeks'
    },
    {
      id: '4',
      sku: 'AC-789',
      name: 'USB-C Adapters',
      currentStock: 320,
      predictedDemand: 180,
      riskLevel: 'low',
      trend: 'stable',
      weeklyForecast: [45, 44, 46, 45],
      recommendation: 'Stock levels adequate - maintain current ordering schedule'
    }
  ];

  useEffect(() => {
    setLoading(true);
    // Simulate AI model prediction
    setTimeout(() => {
      setForecasts(mockForecasts);
      setLoading(false);
    }, 2000);
  }, [timeframe]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <BarChart className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStockStatus = (current: number, predicted: number) => {
    const ratio = current / predicted;
    if (ratio < 0.5) return { status: 'Understock', color: 'text-red-600' };
    if (ratio > 2) return { status: 'Overstock', color: 'text-yellow-600' };
    return { status: 'Optimal', color: 'text-green-600' };
  };

  const stats = {
    totalProducts: forecasts.length,
    highRisk: forecasts.filter(f => f.riskLevel === 'high').length,
    understocked: forecasts.filter(f => f.currentStock < f.predictedDemand * 0.5).length,
    overstocked: forecasts.filter(f => f.currentStock > f.predictedDemand * 2).length
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-md border-2 border-orange-200 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Running AI demand forecasting models...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Controls */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-orange-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              Demand Forecasting Engine
            </CardTitle>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Forecast Period:</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="4weeks">Next 4 Weeks</option>
                <option value="8weeks">Next 8 Weeks</option>
                <option value="12weeks">Next 12 Weeks</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/90 backdrop-blur-md border-2 border-orange-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total SKUs</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-md border-2 border-red-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-md border-2 border-yellow-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Understocked</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.understocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-md border-2 border-blue-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Overstocked</p>
                <p className="text-2xl font-bold text-blue-600">{stats.overstocked}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecasting Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {forecasts.map((forecast) => {
          const stockStatus = getStockStatus(forecast.currentStock, forecast.predictedDemand);
          return (
            <Card key={forecast.id} className="bg-white/90 backdrop-blur-md border-2 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-800">{forecast.name}</CardTitle>
                    <p className="text-sm text-gray-600">SKU: {forecast.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(forecast.trend)}
                    <Badge className={`${getRiskColor(forecast.riskLevel)} text-white`}>
                      {forecast.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">Current Stock</p>
                      <p className="text-xl font-bold text-blue-800">{forecast.currentStock}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-sm text-purple-700">Predicted Demand</p>
                      <p className="text-xl font-bold text-purple-800">{forecast.predictedDemand}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock Status:</span>
                    <span className={`font-semibold ${stockStatus.color}`}>
                      {stockStatus.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Weekly Forecast:</p>
                    <div className="flex gap-2">
                      {forecast.weeklyForecast.map((demand, index) => (
                        <div key={index} className="flex-1 bg-gray-100 p-2 rounded text-center">
                          <p className="text-xs text-gray-600">W{index + 1}</p>
                          <p className="font-semibold text-gray-800">{demand}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Recommendation:</p>
                    <p className="text-sm text-yellow-700">{forecast.recommendation}</p>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                    Create Purchase Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DemandForecasting;
