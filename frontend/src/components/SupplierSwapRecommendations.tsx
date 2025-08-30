import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRightLeft,
    TrendingDown,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
    Play,
    BarChart3
} from 'lucide-react';
import { digitalTwinService } from '@/services/digitalTwinService';
import { SupplierSwapRecommendation, Supplier, Product } from '@/types/digitalTwin';
import { toast } from 'sonner';

interface SupplierSwapRecommendationsProps {
    recommendations?: SupplierSwapRecommendation[];
    onApplyRecommendation?: (id: string) => void;
    onSwapSimulated?: (swapId: string, results: any) => void;
}

const SupplierSwapRecommendations = ({
    recommendations: externalRecommendations,
    onApplyRecommendation,
    onSwapSimulated
}: SupplierSwapRecommendationsProps) => {
    const [recommendations, setRecommendations] = useState<SupplierSwapRecommendation[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [simulatingSwap, setSimulatingSwap] = useState<string | null>(null);
    const [selectedSwap, setSelectedSwap] = useState<SupplierSwapRecommendation | null>(null);
    const [sortBy, setSortBy] = useState<'carbonSavings' | 'costImpact' | 'paybackPeriod'>('carbonSavings');

    useEffect(() => {
        if (externalRecommendations) {
            // Use external data
            setRecommendations(externalRecommendations);
            setLoading(false);
            // Still load suppliers and products for name resolution
            loadSuppliersAndProducts();
        } else {
            // Load internal data
            loadRecommendations();
        }
    }, [externalRecommendations]);

    const loadSuppliersAndProducts = async () => {
        try {
            const [suppliersData, productsData] = await Promise.all([
                digitalTwinService.getSuppliers(),
                digitalTwinService.getProducts()
            ]);
            setSuppliers(suppliersData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading suppliers and products:', error);
        }
    };

    const loadRecommendations = async () => {
        try {
            setLoading(true);
            const [recsData, suppliersData, productsData] = await Promise.all([
                digitalTwinService.generateSupplierSwapRecommendations(),
                digitalTwinService.getSuppliers(),
                digitalTwinService.getProducts()
            ]);
            setRecommendations(recsData);
            setSuppliers(suppliersData);
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSupplierName = (supplierId: string) => {
        const supplier = suppliers.find(s => s.id === supplierId);
        return supplier?.name || 'Unknown Supplier';
    };

    const getProductName = (productId: string) => {
        const product = products.find(p => p.id === productId);
        return product?.name || 'Unknown Product';
    };

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'low': return 'text-green-800 bg-green-100 border-green-200';
            case 'medium': return 'text-yellow-800 bg-yellow-100 border-yellow-200';
            case 'high': return 'text-red-800 bg-red-100 border-red-200';
            default: return 'text-gray-800 bg-gray-100 border-gray-200';
        }
    };

    const getCostImpactColor = (impact: number) => {
        if (impact < -10) return 'text-green-600'; // Significant cost reduction
        if (impact < 0) return 'text-green-500'; // Cost reduction
        if (impact < 10) return 'text-yellow-600'; // Minimal cost increase
        return 'text-red-600'; // Significant cost increase
    };

    const handleSimulateSwap = async (recommendation: SupplierSwapRecommendation) => {
        try {
            setSimulatingSwap(recommendation.currentSupplierId + recommendation.recommendedSupplierId);

            const results = await digitalTwinService.simulateSupplierSwap(
                recommendation.currentSupplierId + recommendation.recommendedSupplierId
            );

            if (results.success) {
                toast.success(`Simulation completed: ${results.carbonReduction.toFixed(1)} kg CO₂ reduction`);
                onSwapSimulated?.(recommendation.currentSupplierId + recommendation.recommendedSupplierId, results);
                onApplyRecommendation?.(recommendation.currentSupplierId + recommendation.recommendedSupplierId);
            } else {
                toast.error('Simulation failed');
            }
        } catch (error) {
            toast.error('Error running simulation');
        } finally {
            setSimulatingSwap(null);
        }
    };

    const sortedRecommendations = [...recommendations].sort((a, b) => {
        switch (sortBy) {
            case 'carbonSavings':
                return b.estimatedAnnualSavings - a.estimatedAnnualSavings;
            case 'costImpact':
                return a.costImpact - b.costImpact; // Lower cost impact is better
            case 'paybackPeriod':
                return a.paybackPeriod - b.paybackPeriod; // Shorter payback is better
            default:
                return 0;
        }
    });

    if (loading) {
        return (
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5" />
                        Supplier Swap Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Analyzing swap opportunities...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main Recommendations Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <ArrowRightLeft className="w-5 h-5" />
                            Low Emission Supplier Swaps
                            <Badge variant="outline" className="ml-2">
                                {recommendations.length} opportunities
                            </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="carbonSavings">Carbon Savings</option>
                                <option value="costImpact">Cost Impact</option>
                                <option value="paybackPeriod">Payback Period</option>
                            </select>
                            <Button variant="outline" size="sm" onClick={loadRecommendations}>
                                <BarChart3 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-green-800">Total CO₂ Savings</span>
                            </div>
                            <p className="text-2xl font-bold text-green-900">
                                {Math.round(recommendations.reduce((sum, r) => sum + r.estimatedAnnualSavings, 0)).toLocaleString()}
                            </p>
                            <p className="text-sm text-green-600">kg CO₂/year</p>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-blue-800">Avg Cost Impact</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-900">
                                {(recommendations.reduce((sum, r) => sum + r.costImpact, 0) / recommendations.length).toFixed(1)}%
                            </p>
                            <p className="text-sm text-blue-600">cost change</p>
                        </div>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold text-purple-800">Avg Payback</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-900">
                                {Math.round(recommendations.reduce((sum, r) => sum + r.paybackPeriod, 0) / recommendations.length)}
                            </p>
                            <p className="text-sm text-purple-600">months</p>
                        </div>
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-orange-600" />
                                <span className="font-semibold text-orange-800">Quick Wins</span>
                            </div>
                            <p className="text-2xl font-bold text-orange-900">
                                {recommendations.filter(r => r.implementationComplexity === 'low' && r.paybackPeriod <= 6).length}
                            </p>
                            <p className="text-sm text-orange-600">low complexity</p>
                        </div>
                    </div>

                    {/* Recommendations List */}
                    <div className="space-y-4">
                        {sortedRecommendations.map((recommendation, index) => {
                            const swapId = recommendation.currentSupplierId + recommendation.recommendedSupplierId;
                            const isSimulating = simulatingSwap === swapId;

                            return (
                                <div
                                    key={swapId}
                                    className={`p-4 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${selectedSwap === recommendation
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="text-xs">
                                                #{index + 1}
                                            </Badge>
                                            <Badge className={getComplexityColor(recommendation.implementationComplexity)}>
                                                {recommendation.implementationComplexity} complexity
                                            </Badge>
                                            {recommendation.paybackPeriod <= 6 && recommendation.implementationComplexity === 'low' && (
                                                <Badge className="text-green-800 bg-green-100 border-green-200">
                                                    Quick Win
                                                </Badge>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => handleSimulateSwap(recommendation)}
                                            disabled={isSimulating}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {isSimulating ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Simulating...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="w-4 h-4 mr-2" />
                                                    Simulate Swap
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Swap Details */}
                                        <div>
                                            <h4 className="font-semibold mb-3">Supplier Swap</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 p-3 bg-red-50 border border-red-200 rounded">
                                                        <p className="text-sm text-red-600 font-medium">Current</p>
                                                        <p className="font-semibold text-red-800">
                                                            {getSupplierName(recommendation.currentSupplierId)}
                                                        </p>
                                                    </div>
                                                    <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                                                    <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded">
                                                        <p className="text-sm text-green-600 font-medium">Recommended</p>
                                                        <p className="font-semibold text-green-800">
                                                            {getSupplierName(recommendation.recommendedSupplierId)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                                                    <p className="text-sm text-gray-600 font-medium">Product</p>
                                                    <p className="font-semibold text-gray-800">
                                                        {getProductName(recommendation.productId)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Impact Metrics */}
                                        <div>
                                            <h4 className="font-semibold mb-3">Expected Impact</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                                                    <div>
                                                        <p className="text-sm text-green-600">Carbon Savings</p>
                                                        <p className="font-bold text-green-800">
                                                            {recommendation.carbonSavings.toFixed(2)} kg CO₂/unit
                                                        </p>
                                                    </div>
                                                    <TrendingDown className="w-5 h-5 text-green-600" />
                                                </div>

                                                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                                                    <div>
                                                        <p className="text-sm text-blue-600">Annual CO₂ Reduction</p>
                                                        <p className="font-bold text-blue-800">
                                                            {Math.round(recommendation.estimatedAnnualSavings).toLocaleString()} kg
                                                        </p>
                                                    </div>
                                                    <BarChart3 className="w-5 h-5 text-blue-600" />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                                                        <p className="text-sm text-gray-600">Cost Impact</p>
                                                        <p className={`font-bold ${getCostImpactColor(recommendation.costImpact)}`}>
                                                            {recommendation.costImpact > 0 ? '+' : ''}{recommendation.costImpact.toFixed(1)}%
                                                        </p>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                                                        <p className="text-sm text-gray-600">Payback Period</p>
                                                        <p className="font-bold text-gray-800">
                                                            {recommendation.paybackPeriod} months
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                                                    <p className="text-sm text-purple-600">Reliability Impact</p>
                                                    <p className={`font-bold ${recommendation.reliabilityImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {recommendation.reliabilityImpact > 0 ? '+' : ''}{recommendation.reliabilityImpact.toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ROI Calculation */}
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="w-4 h-4 text-yellow-600" />
                                            <span className="font-semibold text-yellow-800">Financial Impact</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-yellow-700">
                                                    ${Math.round(recommendation.estimatedAnnualSavings * 0.025).toLocaleString()}
                                                </p>
                                                <p className="text-yellow-600">Annual Carbon Credit Value</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-yellow-700">
                                                    {recommendation.costImpact < 0 ? 'Savings' : 'Investment'}
                                                </p>
                                                <p className="text-yellow-600">Cost Category</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-yellow-700">
                                                    {Math.round((recommendation.estimatedAnnualSavings * 0.025) / Math.max(1, Math.abs(recommendation.costImpact)))}x
                                                </p>
                                                <p className="text-yellow-600">ROI Multiplier</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Implementation Guide */}
            <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Implementation Guide
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                                <h3 className="font-semibold text-green-800">Prioritize Quick Wins</h3>
                            </div>
                            <p className="text-sm text-green-700">
                                Start with low complexity swaps that have short payback periods. These provide immediate carbon reductions with minimal risk.
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                                <h3 className="font-semibold text-blue-800">Run Simulations</h3>
                            </div>
                            <p className="text-sm text-blue-700">
                                Use the simulation feature to validate assumptions and understand the full impact before making supplier changes.
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                                <h3 className="font-semibold text-purple-800">Monitor Results</h3>
                            </div>
                            <p className="text-sm text-purple-700">
                                Track actual carbon reductions and cost impacts after implementation to refine future recommendations.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SupplierSwapRecommendations;