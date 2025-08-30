import React from 'react';
import { AlertTriangle, Clock, Building2, RotateCcw, TrendingUp, DollarSign, Package } from 'lucide-react';
import { DemoScenario } from '../services/surplusNetworkDemoService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SurplusNetworkDemoSelectorProps {
    scenarios: DemoScenario[];
    currentScenario: string;
    onScenarioChange: (scenarioId: string) => void;
}

const SurplusNetworkDemoSelector: React.FC<SurplusNetworkDemoSelectorProps> = ({
    scenarios,
    currentScenario,
    onScenarioChange
}) => {
    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'border-red-200 bg-red-50';
            case 'high': return 'border-orange-200 bg-orange-50';
            case 'medium': return 'border-blue-200 bg-blue-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'destructive';
            case 'high': return 'default';
            case 'medium': return 'secondary';
            default: return 'outline';
        }
    };

    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toLocaleString()}`;
    };

    if (scenarios.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Surplus Categories</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        View inventory by category and priority level
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => onScenarioChange('all')}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Show All Categories
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scenarios.map((scenario) => (
                    <Card
                        key={scenario.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${currentScenario === scenario.id
                                ? `${getUrgencyColor(scenario.urgencyLevel)} border-2`
                                : 'border border-gray-200 hover:border-gray-300'
                            }`}
                        onClick={() => onScenarioChange(scenario.id)}
                    >
                        <CardContent className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <Badge variant={getUrgencyBadge(scenario.urgencyLevel) as any} className="text-xs">
                                        {scenario.urgencyLevel}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {scenario.items.length} items
                                    </p>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-4">
                                <h4 className="font-semibold text-gray-900 mb-2">{scenario.name}</h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {scenario.description}
                                </p>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-2 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Potential Value:</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(scenario.costSavings)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Environmental Impact:</span>
                                    <span className="font-medium text-gray-900">
                                        {(scenario.wasteReduction / 1000).toFixed(1)}T saved
                                    </span>
                                </div>
                            </div>

                            {/* Active indicator */}
                            {currentScenario === scenario.id && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                        <span className="text-xs font-medium text-emerald-700">
                                            Currently viewing
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SurplusNetworkDemoSelector;