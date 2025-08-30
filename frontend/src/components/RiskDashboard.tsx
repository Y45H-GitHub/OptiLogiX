
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Cloud, Globe, Anchor, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface RiskAlert {
  id: string;
  type: 'weather' | 'geopolitical' | 'customs' | 'port';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  location: string;
  impact: string;
  recommendation: string;
}

const RiskDashboard = () => {
  const [risks, setRisks] = useState<RiskAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const mockRisks: RiskAlert[] = [
    {
      id: '1',
      type: 'weather',
      severity: 'high',
      title: 'Severe Storm Warning',
      description: 'Category 3 hurricane approaching the Gulf Coast',
      location: 'Houston, TX - Port of Houston',
      impact: '3-5 day delays expected',
      recommendation: 'Reroute shipments via Port of Los Angeles or delay by 1 week'
    },
    {
      id: '2',
      type: 'port',
      severity: 'medium',
      title: 'Port Congestion',
      description: 'Container backlog at major shipping terminal',
      location: 'Long Beach, CA',
      impact: '2-3 day additional wait times',
      recommendation: 'Consider alternative ports or premium handling services'
    },
    {
      id: '3',
      type: 'customs',
      severity: 'low',
      title: 'Customs Processing Delays',
      description: 'Increased inspection rates due to new regulations',
      location: 'JFK International Airport',
      impact: '6-12 hour delays',
      recommendation: 'Ensure all documentation is complete and accurate'
    },
    {
      id: '4',
      type: 'geopolitical',
      severity: 'high',
      title: 'Trade Route Disruption',
      description: 'Shipping restrictions implemented in key trade corridor',
      location: 'Suez Canal',
      impact: '7-14 day delays, 15-25% cost increase',
      recommendation: 'Use Cape of Good Hope route or consider air freight for urgent shipments'
    }
  ];

  useEffect(() => {
    // Simulate real-time data ingestion
    setTimeout(() => {
      setRisks(mockRisks);
      setLoading(false);
    }, 1500);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather': return <Cloud className="w-5 h-5" />;
      case 'geopolitical': return <Globe className="w-5 h-5" />;
      case 'customs': return <Clock className="w-5 h-5" />;
      case 'port': return <Anchor className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const riskStats = {
    totalAlerts: risks.length,
    highRisk: risks.filter(r => r.severity === 'high').length,
    mediumRisk: risks.filter(r => r.severity === 'medium').length,
    lowRisk: risks.filter(r => r.severity === 'low').length
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-md border-2 border-red-200 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing real-time risk data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/90 backdrop-blur-md border-2 border-red-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-800">{riskStats.totalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-md border-2 border-red-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{riskStats.highRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-md border-2 border-yellow-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{riskStats.mediumRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-md border-2 border-green-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{riskStats.lowRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-red-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Active Risk Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {risks.map((risk) => (
              <Card key={risk.id} className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(risk.type)}
                      <div>
                        <h3 className="font-semibold text-gray-800">{risk.title}</h3>
                        <p className="text-sm text-gray-600">{risk.location}</p>
                      </div>
                    </div>
                    <Badge className={`${getSeverityColor(risk.severity)} text-white`}>
                      {risk.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{risk.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-1">Impact</h4>
                      <p className="text-sm text-red-700">{risk.impact}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-1">Recommendation</h4>
                      <p className="text-sm text-blue-700">{risk.recommendation}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskDashboard;
