
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Blocks, Shield, Eye, Clock, MapPin, Package, Truck, CheckCircle, AlertCircle, Hash } from 'lucide-react';

interface BlockchainRecord {
  id: string;
  blockHash: string;
  timestamp: string;
  event: string;
  location: string;
  actor: string;
  verified: boolean;
  carbonFootprint?: number;
}

interface ShipmentProvenance {
  shipmentId: string;
  status: 'active' | 'completed' | 'disputed';
  totalBlocks: number;
  verificationScore: number;
  carbonFootprint: number;
  sustainabilityIndex: number;
}

const BlockchainProvenance = () => {
  const [selectedShipment, setSelectedShipment] = useState('SH-2024-001');
  const [shipmentData, setShipmentData] = useState<ShipmentProvenance>({
    shipmentId: 'SH-2024-001',
    status: 'active',
    totalBlocks: 12,
    verificationScore: 98.5,
    carbonFootprint: 245.7,
    sustainabilityIndex: 87.2
  });

  const [blockchainRecords, setBlockchainRecords] = useState<BlockchainRecord[]>([
    {
      id: '1',
      blockHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
      timestamp: '2024-01-15 09:30:00',
      event: 'Shipment Created',
      location: 'Los Angeles, CA',
      actor: 'Warehouse Manager',
      verified: true,
      carbonFootprint: 0
    },
    {
      id: '2',
      blockHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
      timestamp: '2024-01-15 14:45:00',
      event: 'Compliance Check Passed',
      location: 'Los Angeles, CA',
      actor: 'Compliance Officer',
      verified: true,
      carbonFootprint: 2.1
    },
    {
      id: '3',
      blockHash: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
      timestamp: '2024-01-16 08:15:00',
      event: 'Loaded onto Truck',
      location: 'LA Port Terminal',
      actor: 'Dock Worker',
      verified: true,
      carbonFootprint: 45.3
    },
    {
      id: '4',
      blockHash: '0x4d5e6f7890abcdef1234567890abcdef12345678',
      timestamp: '2024-01-16 16:20:00',
      event: 'Port Departure',
      location: 'Port of Los Angeles',
      actor: 'Port Authority',
      verified: true,
      carbonFootprint: 12.8
    },
    {
      id: '5',
      blockHash: '0x5e6f7890abcdef1234567890abcdef1234567890',
      timestamp: '2024-01-18 11:30:00',
      event: 'Sea Transit - Checkpoint 1',
      location: 'Pacific Ocean (32°N, 118°W)',
      actor: 'Ship Captain',
      verified: true,
      carbonFootprint: 89.4
    },
    {
      id: '6',
      blockHash: '0x6f7890abcdef1234567890abcdef123456789012',
      timestamp: '2024-01-22 09:45:00',
      event: 'Port Arrival',
      location: 'Port of Rotterdam',
      actor: 'Port Authority',
      verified: true,
      carbonFootprint: 96.1
    }
  ]);

  const [anomalies, setAnomalies] = useState([
    {
      id: 'A001',
      type: 'Temperature Variance',
      severity: 'medium',
      description: 'Container temperature exceeded threshold by 2°C for 45 minutes',
      blockHash: '0x5e6f7890abcdef1234567890abcdef1234567890',
      mlConfidence: 94.2
    },
    {
      id: 'A002',
      type: 'Route Deviation',
      severity: 'low',
      description: 'Ship deviated 12 nautical miles from optimal route due to weather',
      blockHash: '0x5e6f7890abcdef1234567890abcdef1234567890',
      mlConfidence: 87.6
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'disputed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSustainabilityGrade = (index: number) => {
    if (index >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (index >= 80) return { grade: 'A', color: 'text-green-500' };
    if (index >= 70) return { grade: 'B', color: 'text-yellow-500' };
    if (index >= 60) return { grade: 'C', color: 'text-orange-500' };
    return { grade: 'D', color: 'text-red-500' };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/90 backdrop-blur-md border-2 border-purple-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Blocks className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Blockchain Records</p>
                <p className="text-2xl font-bold text-gray-800">{shipmentData.totalBlocks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border-2 border-green-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Verification Score</p>
                <p className="text-2xl font-bold text-gray-800">{shipmentData.verificationScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border-2 border-blue-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Carbon Footprint</p>
                <p className="text-2xl font-bold text-gray-800">{shipmentData.carbonFootprint}kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border-2 border-teal-200 shadow-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sustainability Index</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-800">{shipmentData.sustainabilityIndex}</p>
                  <Badge className={`${getSustainabilityGrade(shipmentData.sustainabilityIndex).color} bg-transparent border-0 text-lg font-bold`}>
                    {getSustainabilityGrade(shipmentData.sustainabilityIndex).grade}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blockchain Timeline */}
        <div className="lg:col-span-2">
          <Card className="bg-white/90 backdrop-blur-md border-2 border-purple-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <Blocks className="w-6 h-6 text-purple-600" />
                Blockchain Provenance Timeline
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(shipmentData.status)} text-white`}>
                  {shipmentData.status.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-600">Shipment ID: {shipmentData.shipmentId}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {blockchainRecords.map((record, index) => (
                  <div key={record.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${record.verified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {index < blockchainRecords.length - 1 && <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{record.event}</h3>
                        <div className="flex items-center gap-2">
                          {record.verified ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          <Badge className="bg-gray-200 text-gray-700 text-xs">
                            <Hash className="w-3 h-3 mr-1" />
                            {record.blockHash.substring(0, 10)}...
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {record.timestamp}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {record.location}
                        </div>
                        <div>Actor: {record.actor}</div>
                        {record.carbonFootprint !== undefined && (
                          <div>Carbon: {record.carbonFootprint}kg CO₂</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ML Anomaly Detection */}
        <div className="space-y-6">
          <Card className="bg-white/90 backdrop-blur-md border-2 border-orange-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <Eye className="w-6 h-6 text-orange-600" />
                ML Anomaly Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {anomalies.map((anomaly) => (
                  <div key={anomaly.id} className="p-3 bg-orange-50 border-l-4 border-l-orange-500 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 text-sm">{anomaly.type}</h4>
                      <Badge className={`${getSeverityColor(anomaly.severity)} text-white text-xs`}>
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{anomaly.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Block: {anomaly.blockHash.substring(0, 10)}...</span>
                      <span className="text-gray-500">ML Confidence: {anomaly.mlConfidence}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Carbon Footprint Tracker */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-green-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <Package className="w-6 h-6 text-green-600" />
                Carbon Footprint Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {shipmentData.carbonFootprint}kg
                  </div>
                  <p className="text-sm text-gray-600">Total CO₂ Emissions</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Transportation</span>
                    <span>185.2kg (75%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Packaging</span>
                    <span>35.4kg (14%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '14%' }}></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Handling</span>
                    <span>25.1kg (11%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '11%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Sustainability Grade</span>
                    <div className={`text-xl font-bold ${getSustainabilityGrade(shipmentData.sustainabilityIndex).color}`}>
                      {getSustainabilityGrade(shipmentData.sustainabilityIndex).grade}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    23% below industry average
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verification Actions */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-cyan-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-600" />
            Blockchain Verification & Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              <Hash className="w-4 h-4 mr-2" />
              Verify Chain
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
              <Eye className="w-4 h-4 mr-2" />
              Audit Trail
            </Button>
            <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white">
              <Package className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
              <AlertCircle className="w-4 h-4 mr-2" />
              Flag Dispute
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockchainProvenance;
