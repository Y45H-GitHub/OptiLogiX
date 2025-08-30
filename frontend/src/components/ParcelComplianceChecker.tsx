
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle, XCircle, AlertTriangle, Package, Globe, Weight, Ruler } from 'lucide-react';
import { toast } from 'sonner';

interface ParcelData {
  weight: number;
  length: number;
  width: number;
  height: number;
  value: number;
  destinationCountry: string;
  itemDescription: string;
}

interface ValidationResult {
  status: 'valid' | 'rejected';
  reason?: string;
}

interface Alert {
  id: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  value: number;
  destinationCountry: string;
  itemDescription: string;
  reason: string;
  createdAt: string;
}

const ParcelComplianceChecker = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'alerts'>('entry');
  const [parcelData, setParcelData] = useState<ParcelData>({
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    value: 0,
    destinationCountry: '',
    itemDescription: ''
  });
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      weight: 2.5,
      length: 30,
      width: 20,
      height: 10,
      value: 500,
      destinationCountry: 'Iran',
      itemDescription: 'Electronics package',
      reason: 'Cannot ship to Iran',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      weight: 1.2,
      length: 15,
      width: 10,
      height: 5,
      value: 200,
      destinationCountry: 'Germany',
      itemDescription: 'Lithium battery pack',
      reason: 'Banned item: lithium battery',
      createdAt: '2024-01-15T09:15:00Z'
    }
  ]);

  const BANNED_ITEMS = ['lithium battery', 'explosive', 'flammable gas', 'hazardous material'];
  const EMBARGOED_COUNTRIES = ['North Korea', 'Iran', 'Syria', 'Russia'];

  // New compliance rules
  const MAX_WEIGHT_KG = 20;
  const MAX_DIMENSION_CM = 100; // Max for any single dimension (L, W, H)
  const MAX_GIRTH_CM = 200; // Girth = Length + 2*(Width + Height)
  const HIGH_VALUE_THRESHOLD = 1000; // USD

  const validateParcel = () => {
    // Check required fields
    // Check required fields and basic validity
    if (parcelData.weight <= 0) {
      const result = { status: 'rejected' as const, reason: 'Weight must be greater than 0' };
      setValidationResult(result);
      addAlert(result.reason);
      return;
    }
    if (parcelData.length <= 0 || parcelData.width <= 0 || parcelData.height <= 0) {
      const result = { status: 'rejected' as const, reason: 'All dimensions (length, width, height) must be greater than 0' };
      setValidationResult(result);
      addAlert(result.reason);
      return;
    }
    if (parcelData.value <= 0) {
      const result = { status: 'rejected' as const, reason: 'Value must be greater than 0' };
      setValidationResult(result);
      addAlert(result.reason);
      return;
    }

    // New compliance checks
    // 1. Weight limit
    if (parcelData.weight > MAX_WEIGHT_KG) {
      const result = { status: 'rejected' as const, reason: `Parcel weight exceeds maximum allowed (${MAX_WEIGHT_KG} kg)` };
      setValidationResult(result);
      addAlert(result.reason);
      return;
    }

    // 2. Dimension limits
    if (parcelData.length > MAX_DIMENSION_CM || parcelData.width > MAX_DIMENSION_CM || parcelData.height > MAX_DIMENSION_CM) {
      const result = { status: 'rejected' as const, reason: `One or more parcel dimensions exceed maximum allowed (${MAX_DIMENSION_CM} cm)` };
      setValidationResult(result);
      addAlert(result.reason);
      return;
    }

    // 3. Girth limit (Length + 2 * (Width + Height))
    const girth = parcelData.length + 2 * (parcelData.width + parcelData.height);
    if (girth > MAX_GIRTH_CM) {
      const result = { status: 'rejected' as const, reason: `Parcel girth exceeds maximum allowed (${MAX_GIRTH_CM} cm)` };
      setValidationResult(result);
      addAlert(result.reason);
      return;
    }

    // 4. High value item check
    if (parcelData.value > HIGH_VALUE_THRESHOLD) {
      const result = { status: 'rejected' as const, reason: `Parcel value exceeds high-value threshold (${HIGH_VALUE_THRESHOLD} USD). Requires special declaration.` };
      setValidationResult(result);
      addAlert(result.reason);
      return;
    }

    // Check banned items
    for (const bannedItem of BANNED_ITEMS) {
      if (parcelData.itemDescription.toLowerCase().includes(bannedItem)) {
        const result = { status: 'rejected' as const, reason: `Banned item: ${bannedItem}` };
        setValidationResult(result);
        addAlert(result.reason);
        return;
      }
    }

    // Check embargoed countries
    if (EMBARGOED_COUNTRIES.includes(parcelData.destinationCountry)) {
      const result = { status: 'rejected' as const, reason: `Cannot ship to ${parcelData.destinationCountry}` };
      setValidationResult(result);
      addAlert(result.reason);
      return;
    }

    // If all checks pass
    const successMessage = `Parcel accepted!\n\nDetails:\n- Weight: ${parcelData.weight} kg (≤ ${MAX_WEIGHT_KG} kg)\n- Dimensions: ${parcelData.length} × ${parcelData.width} × ${parcelData.height} cm (each ≤ ${MAX_DIMENSION_CM} cm)\n- Girth: ${girth} cm (≤ ${MAX_GIRTH_CM} cm)\n- Value: $${parcelData.value} (≤ $${HIGH_VALUE_THRESHOLD})`;
    
    setValidationResult({ 
      status: 'valid',
      reason: successMessage
    });
    toast.success(successMessage);
  };

  const addAlert = (reason: string | undefined) => {
    const newAlert: Alert = {
      id: Date.now(),
      ...parcelData,
      reason: reason || 'Unknown reason',
      createdAt: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
    toast.error(`Validation failed: ${reason || 'Unknown reason'}`);
  };

  const handleInputChange = (field: keyof ParcelData, value: string | number) => {
    setParcelData(prev => ({ ...prev, [field]: value }));
    setValidationResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-600" />
            Parcel Compliance Checker
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6">
        <Button
          onClick={() => setActiveTab('entry')}
          variant={activeTab === 'entry' ? 'default' : 'outline'}
          className={`flex items-center gap-2 ${
            activeTab === 'entry' 
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg' 
              : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          <Package className="w-4 h-4" />
          Parcel Entry
        </Button>
        <Button
          onClick={() => setActiveTab('alerts')}
          variant={activeTab === 'alerts' ? 'default' : 'outline'}
          className={`flex items-center gap-2 ${
            activeTab === 'alerts' 
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
              : 'border-red-300 text-red-700 hover:bg-red-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Alerts ({alerts.length})
        </Button>
      </div>

      {activeTab === 'entry' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entry Form */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-teal-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-6 h-6 text-teal-600" />
                Parcel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weight and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight" className="flex items-center gap-2 text-gray-700 font-medium">
                    <Weight className="w-4 h-4" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={parcelData.weight || ''}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                    className="mt-1 border-gray-300 focus:border-teal-500"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="value" className="text-gray-700 font-medium">Value ($)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={parcelData.value || ''}
                    onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                    className="mt-1 border-gray-300 focus:border-teal-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <Label className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                  <Ruler className="w-4 h-4" />
                  Dimensions (cm)
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Input
                      type="number"
                      value={parcelData.length || ''}
                      onChange={(e) => handleInputChange('length', parseFloat(e.target.value) || 0)}
                      className="border-gray-300 focus:border-teal-500"
                      placeholder="Length"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={parcelData.width || ''}
                      onChange={(e) => handleInputChange('width', parseFloat(e.target.value) || 0)}
                      className="border-gray-300 focus:border-teal-500"
                      placeholder="Width"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={parcelData.height || ''}
                      onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
                      className="border-gray-300 focus:border-teal-500"
                      placeholder="Height"
                    />
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div>
                <Label htmlFor="destination" className="flex items-center gap-2 text-gray-700 font-medium">
                  <Globe className="w-4 h-4" />
                  Destination Country
                </Label>
                <Input
                  id="destination"
                  value={parcelData.destinationCountry}
                  onChange={(e) => handleInputChange('destinationCountry', e.target.value)}
                  className="mt-1 border-gray-300 focus:border-teal-500"
                  placeholder="e.g., United States"
                />
              </div>

              {/* Item Description */}
              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium">Item Description</Label>
                <Textarea
                  id="description"
                  value={parcelData.itemDescription}
                  onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                  className="mt-1 border-gray-300 focus:border-teal-500"
                  placeholder="Describe the items being shipped..."
                  rows={3}
                />
              </div>

              <Button
                onClick={validateParcel}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 shadow-lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                Validate Parcel
              </Button>
            </CardContent>
          </Card>

          {/* Validation Result */}
          <Card className="bg-white/90 backdrop-blur-md border-2 border-cyan-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Validation Result</CardTitle>
            </CardHeader>
            <CardContent>
              {validationResult ? (
                <div className="text-center py-8">
              {validationResult.status === 'valid' ? (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-base px-4 py-2 rounded-full flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Parcel Accepted
                </Badge>
              ) : (
                <Badge className="bg-red-500 hover:bg-red-600 text-white text-base px-4 py-2 rounded-full flex items-center gap-2">
                  <XCircle className="w-5 h-5" /> Parcel Rejected
                </Badge>
              )}
              {validationResult.reason && (
                <Alert className={`mt-4 ${validationResult.status === 'valid' ? 'border-emerald-500 text-emerald-800 bg-emerald-50' : 'border-red-500 text-red-800 bg-red-50'}`}>
                  <AlertDescription className="whitespace-pre-line">
                    {validationResult.reason}
                  </AlertDescription>
                </Alert>
              )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Fill in parcel details and click validate to check compliance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'alerts' && (
        <Card className="bg-white/90 backdrop-blur-md border-2 border-red-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Non-Compliant Parcels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Alert key={alert.id} className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="font-semibold text-red-800">Rejection Reason:</p>
                        <p className="text-red-700">{alert.reason}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-sm text-gray-700">
                        <p><strong>Destination:</strong> {alert.destinationCountry}</p>
                        <p><strong>Item:</strong> {alert.itemDescription}</p>
                        <p><strong>Weight:</strong> {alert.weight}kg</p>
                        <p><strong>Value:</strong> ${alert.value}</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No compliance alerts. All parcels are compliant!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParcelComplianceChecker;
