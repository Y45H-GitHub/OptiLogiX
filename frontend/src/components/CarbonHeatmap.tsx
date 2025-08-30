import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Thermometer,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Filter,
    RefreshCw,
    Zap,
    Leaf
} from 'lucide-react';
import { digitalTwinService } from '@/services/digitalTwinService';
import { CarbonHotspot, Supplier, Product, DigitalTwinData } from '@/types/digitalTwin';

interface CarbonHeatmapProps {
    data?: DigitalTwinData;
    onHotspotClick?: (hotspot: CarbonHotspot) => void;
}

const CarbonHeatmap = ({ data, onHotspotClick }: CarbonHeatmapProps) => {
    const [hotspots, setHotspots] = useState<CarbonHotspot[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedHotspot, setSelectedHotspot] = useState<CarbonHotspot | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');

    useEffect(() => {
        if (data) {
            // Use external data
            setHotspots(generateHotspotsFromData(data));
            setLoading(false);
        } else {
            // Load internal data
            loadHeatmapData();
        }
    }, [data]);

    const generateHotspotsFromData = (digitalTwinData: DigitalTwinData): CarbonHotspot[] => {
        const generatedHotspots: CarbonHotspot[] = [];

        // Generate hotspots from nodes with high carbon emissions
        digitalTwinData.nodes.forEach(node => {
            const carbonLevel = node.type === 'supplier' ?
                (node.metrics?.efficiency ? (1 - node.metrics.efficiency) * 10 : 5) :
                (node.metrics?.efficiency ? (1 - node.metrics.efficiency) * 8 : 4);

            if (carbonLevel > 3) {
                generatedHotspots.push({
                    id: `hotspot-${node.id}`,
                    type: node.type === 'supplier' ? 'supplier' : 'store',
                    entityId: node.id,
                    carbonEmission: carbonLevel,
                    severity: carbonLevel > 6 ? 'critical' : carbonLevel > 4 ? 'high' : 'medium',
                    improvementPotential: Math.round(30 + Math.random() * 40),
                    recommendations: [
                        'Implement energy-efficient processes',
                        'Switch to renewable energy sources',
                        'Optimize transportation routes',
                        'Reduce packaging waste'
                    ]
                });
            }
        });

        // Generate hotspots from high carbon connections
        digitalTwinData.connections.forEach(connection => {
            if (connection.carbonEmission > 50) {
                generatedHotspots.push({
                    id: `hotspot-route-${connection.id}`,
                    type: 'route',
                    entityId: connection.id,
                    carbonEmission: connection.carbonEmission,
                    severity: connection.carbonEmission > 100 ? 'critical' : 'high',
                    improvementPotential: Math.round(20 + Math.random() * 30),
                    recommendations: [
                        'Optimize delivery routes',
                        'Use more efficient transportation',
                        'Consolidate shipments',
                        'Consider local suppliers'
                    ]
                });
            }
        });

        return generatedHotspots.sort((a, b) => b.carbonEmission - a.carbonEmission);
    };

    const loadHeatmapData = async () => {
        try {
            setLoading(true);
            const [hotspotsData, suppliersData, productsData] = await Promise.all([
                digitalTwinService.analyzeCarbonHotspots(),
                digitalTwinService.getSuppliers(),
                digitalTwinService.getProducts()
            ]);
            setHotspots(hotspotsData);
            setSuppliers(suppliersData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading heatmap data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: CarbonHotspot['severity']) => {
        switch (severity) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getSeverityTextColor = (severity: CarbonHotspot['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-800 bg-red-100 border-red-200';
            case 'high': return 'text-orange-800 bg-orange-100 border-orange-200';
            case 'medium': return 'text-yellow-800 bg-yellow-100 border-yellow-200';
            case 'low': return 'text-green-800 bg-green-100 border-green-200';
            default: return 'text-gray-800 bg-gray-100 border-gray-200';
        }
    };

    const getEntityName = (hotspot: CarbonHotspot) => {
        if (data) {
            // When using external data, get name from nodes
            const node = data.nodes.find(n => n.id === hotspot.entityId);
            if (node) return node.name;

            // For route hotspots, create a descriptive name
            if (hotspot.type === 'route') {
                const connection = data.connections.find(c => c.id === hotspot.entityId);
                if (connection) {
                    const sourceNode = data.nodes.find(n => n.id === connection.source);
                    const targetNode = data.nodes.find(n => n.id === connection.target);
                    return `${sourceNode?.name || 'Unknown'} → ${targetNode?.name || 'Unknown'}`;
                }
            }
        } else {
            // When using internal data
            if (hotspot.type === 'supplier') {
                const supplier = suppliers.find(s => s.id === hotspot.entityId);
                return supplier?.name || 'Unknown Supplier';
            } else if (hotspot.type === 'product') {
                const product = products.find(p => p.id === hotspot.entityId);
                return product?.name || 'Unknown Product';
            }
        }
        return hotspot.entityId;
    };

    const getEntityDetails = (hotspot: CarbonHotspot) => {
        if (data) {
            // When using external data
            const node = data.nodes.find(n => n.id === hotspot.entityId);
            if (node) {
                return {
                    location: node.location,
                    type: node.type,
                    capacity: `${node.capacity.current}/${node.capacity.max}`,
                    efficiency: node.metrics?.efficiency ? `${Math.round(node.metrics.efficiency * 100)}%` : 'N/A'
                };
            }

            if (hotspot.type === 'route') {
                const connection = data.connections.find(c => c.id === hotspot.entityId);
                if (connection) {
                    return {
                        type: 'route',
                        flow: connection.flow,
                        status: connection.status,
                        carbonEmission: connection.carbonEmission
                    };
                }
            }
        } else {
            // When using internal data
            if (hotspot.type === 'supplier') {
                const supplier = suppliers.find(s => s.id === hotspot.entityId);
                return supplier ? {
                    location: supplier.location.address,
                    sustainabilityScore: supplier.sustainabilityScore,
                    monthlyVolume: supplier.monthlyVolume,
                    certifications: supplier.certifications
                } : null;
            } else if (hotspot.type === 'product') {
                const product = products.find(p => p.id === hotspot.entityId);
                return product ? {
                    category: product.category,
                    weight: product.weight,
                    donationEligible: product.donationEligible,
                    shelfLife: product.shelfLife
                } : null;
            }
        }
        return null;
    };

    const filteredHotspots = hotspots.filter(hotspot =>
        filterSeverity === 'all' || hotspot.severity === filterSeverity
    );

    const handleHotspotClick = (hotspot: CarbonHotspot) => {
        setSelectedHotspot(hotspot);
        onHotspotClick?.(hotspot);
    };

    if (loading) {
        return (
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5" />
                        Carbon Emission Heatmap
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Analyzing carbon emissions...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Heatmap Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Thermometer className="w-5 h-5" />
                            Carbon Emission Heatmap
                            <Badge variant="outline" className="ml-2">
                                {filteredHotspots.length} hotspots
                            </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">All Severities</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            >
                                {viewMode === 'grid' ? 'List View' : 'Grid View'}
                            </Button>
                            <Button variant="outline" size="sm" onClick={loadHeatmapData}>
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <span className="font-semibold text-red-800">Critical</span>
                            </div>
                            <p className="text-2xl font-bold text-red-900">
                                {hotspots.filter(h => h.severity === 'critical').length}
                            </p>
                        </div>
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                                <span className="font-semibold text-orange-800">High</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-900">
                                {hotspots.filter(h => h.severity === 'high').length}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-yellow-600" />
                                <span className="font-semibold text-yellow-800">Medium</span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-900">
                                {hotspots.filter(h => h.severity === 'medium').length}
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Leaf className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-green-800">Low</span>
                            </div>
                            <p className="text-2xl font-bold text-green-900">
                                {hotspots.filter(h => h.severity === 'low').length}
                            </p>
                        </div>
                    </div>

                    {/* Heatmap Visualization */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredHotspots.map((hotspot) => {
                                const entityDetails = getEntityDetails(hotspot);
                                return (
                                    <div
                                        key={hotspot.id}
                                        onClick={() => handleHotspotClick(hotspot)}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${selectedHotspot?.id === hotspot.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge className={getSeverityTextColor(hotspot.severity)}>
                                                {hotspot.severity.toUpperCase()}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-gray-500">
                                                    {hotspot.type === 'supplier' ? '🏭' : '📦'}
                                                </span>
                                                <span className="text-xs text-gray-500 capitalize">
                                                    {hotspot.type}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-2 truncate">
                                            {getEntityName(hotspot)}
                                        </h3>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Emissions:</span>
                                                <span className="font-medium text-red-600">
                                                    {hotspot.carbonEmission.toFixed(1)} kg CO₂
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Reduction Potential:</span>
                                                <span className="font-medium text-green-600">
                                                    {hotspot.improvementPotential}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Carbon intensity bar */}
                                        <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                <span>Carbon Intensity</span>
                                                <span>{Math.round((hotspot.carbonEmission / 10) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${getSeverityColor(hotspot.severity)}`}
                                                    style={{ width: `${Math.min(100, (hotspot.carbonEmission / 10) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {entityDetails && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    {hotspot.type === 'supplier' && entityDetails.location && (
                                                        <div>📍 {entityDetails.location}</div>
                                                    )}
                                                    {hotspot.type === 'product' && entityDetails.category && (
                                                        <div>🏷️ {entityDetails.category}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredHotspots.map((hotspot) => (
                                <div
                                    key={hotspot.id}
                                    onClick={() => handleHotspotClick(hotspot)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${selectedHotspot?.id === hotspot.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Badge className={getSeverityTextColor(hotspot.severity)}>
                                                {hotspot.severity}
                                            </Badge>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {getEntityName(hotspot)}
                                                </h3>
                                                <p className="text-sm text-gray-600 capitalize">
                                                    {hotspot.type}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-red-600">
                                                {hotspot.carbonEmission.toFixed(1)} kg CO₂
                                            </p>
                                            <p className="text-sm text-green-600">
                                                {hotspot.improvementPotential}% reduction potential
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Selected Hotspot Details */}
            {selectedHotspot && (
                <Card className="bg-white border border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Hotspot Analysis: {getEntityName(selectedHotspot)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-3">Current Status</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Severity Level:</span>
                                        <Badge className={getSeverityTextColor(selectedHotspot.severity)}>
                                            {selectedHotspot.severity.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Carbon Emissions:</span>
                                        <span className="font-semibold text-red-600">
                                            {selectedHotspot.carbonEmission.toFixed(1)} kg CO₂
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Improvement Potential:</span>
                                        <span className="font-semibold text-green-600">
                                            {selectedHotspot.improvementPotential}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Entity Type:</span>
                                        <span className="font-medium capitalize">{selectedHotspot.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3">Recommendations</h4>
                                <div className="space-y-2">
                                    {selectedHotspot.recommendations.map((rec, index) => (
                                        <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                                            <span className="text-blue-600 mt-0.5">•</span>
                                            <span className="text-sm text-blue-800">{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Potential Impact */}
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Potential Impact</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-700">
                                        {(selectedHotspot.carbonEmission * selectedHotspot.improvementPotential / 100).toFixed(1)}
                                    </p>
                                    <p className="text-green-600">kg CO₂ Reduction</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-700">
                                        {Math.round(selectedHotspot.improvementPotential * 12)}
                                    </p>
                                    <p className="text-green-600">Annual Savings (%)</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-700">
                                        ${Math.round(selectedHotspot.carbonEmission * 25)}
                                    </p>
                                    <p className="text-green-600">Est. Cost Savings</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CarbonHeatmap;