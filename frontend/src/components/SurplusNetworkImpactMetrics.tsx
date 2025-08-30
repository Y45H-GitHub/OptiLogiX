import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DollarSign,
    Recycle,
    TrendingUp,
    Users,
    Package,
    Clock,
    Target,
    Zap
} from 'lucide-react';

interface ImpactMetricsProps {
    scenarioId?: string;
    animated?: boolean;
}

interface MetricData {
    label: string;
    value: number;
    unit: string;
    icon: React.ReactNode;
    color: string;
    description: string;
    trend: number; // percentage change
}

const SurplusNetworkImpactMetrics: React.FC<ImpactMetricsProps> = ({
    scenarioId = 'all',
    animated = true
}) => {
    const [displayValues, setDisplayValues] = useState<Record<string, number>>({});
    const [isAnimating, setIsAnimating] = useState(false);

    const getMetricsForScenario = (scenario: string): MetricData[] => {
        const baseMetrics = {
            'overstocked-electronics': {
                costSavings: 125000,
                wasteReduction: 2500,
                itemsRescued: 250,
                businessesHelped: 15,
                responseTime: 1.2,
                successRate: 94
            },
            'seasonal-clearance': {
                costSavings: 85000,
                wasteReduction: 1800,
                itemsRescued: 650,
                businessesHelped: 22,
                responseTime: 2.1,
                successRate: 89
            },
            'office-liquidation': {
                costSavings: 200000,
                wasteReduction: 5000,
                itemsRescued: 228,
                businessesHelped: 25,
                responseTime: 1.8,
                successRate: 91
            },
            'all': {
                costSavings: 410000,
                wasteReduction: 9300,
                itemsRescued: 1128,
                businessesHelped: 62,
                responseTime: 1.7,
                successRate: 92
            }
        };

        const data = baseMetrics[scenario as keyof typeof baseMetrics] || baseMetrics.all;

        return [
            {
                label: 'Cost Savings',
                value: data.costSavings,
                unit: '$',
                icon: <DollarSign className="w-6 h-6" />,
                color: 'from-emerald-500 to-emerald-600',
                description: 'Total value recovered from surplus inventory',
                trend: 23
            },
            {
                label: 'Waste Prevented',
                value: data.wasteReduction,
                unit: 'kg',
                icon: <Recycle className="w-6 h-6" />,
                color: 'from-blue-500 to-blue-600',
                description: 'Environmental impact reduction',
                trend: 31
            },
            {
                label: 'Items Rescued',
                value: data.itemsRescued,
                unit: '',
                icon: <Package className="w-6 h-6" />,
                color: 'from-purple-500 to-purple-600',
                description: 'Total inventory items redistributed',
                trend: 18
            },
            {
                label: 'Businesses Helped',
                value: data.businessesHelped,
                unit: '',
                icon: <Users className="w-6 h-6" />,
                color: 'from-orange-500 to-orange-600',
                description: 'Network participants benefited',
                trend: 45
            },
            {
                label: 'Avg Response Time',
                value: data.responseTime,
                unit: 'hrs',
                icon: <Clock className="w-6 h-6" />,
                color: 'from-teal-500 to-teal-600',
                description: 'Time to match surplus with demand',
                trend: -12 // negative is good for response time
            },
            {
                label: 'Success Rate',
                value: data.successRate,
                unit: '%',
                icon: <Target className="w-6 h-6" />,
                color: 'from-green-500 to-green-600',
                description: 'Successful matches and transfers',
                trend: 8
            }
        ];
    };

    const formatValue = (value: number, unit: string): string => {
        if (unit === '$') {
            if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
            return `$${value.toLocaleString()}`;
        }
        if (unit === 'kg') {
            if (value >= 1000) return `${(value / 1000).toFixed(1)}T`;
            return `${value.toLocaleString()} kg`;
        }
        if (unit === 'hrs') {
            return `${value.toFixed(1)} hrs`;
        }
        if (unit === '%') {
            return `${value}%`;
        }
        return value.toLocaleString();
    };

    const metrics = getMetricsForScenario(scenarioId);

    useEffect(() => {
        if (!animated) {
            const initialValues: Record<string, number> = {};
            metrics.forEach((metric, index) => {
                initialValues[`metric-${index}`] = metric.value;
            });
            setDisplayValues(initialValues);
            return;
        }

        setIsAnimating(true);
        const initialValues: Record<string, number> = {};
        metrics.forEach((_, index) => {
            initialValues[`metric-${index}`] = 0;
        });
        setDisplayValues(initialValues);

        // Animate each metric with staggered timing
        metrics.forEach((metric, index) => {
            const startTime = Date.now() + (index * 200); // Stagger by 200ms
            const duration = 1500; // 1.5 seconds animation

            const animateValue = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed < 0) {
                    requestAnimationFrame(animateValue);
                    return;
                }

                const progress = Math.min(elapsed / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = metric.value * easeOutQuart;

                setDisplayValues(prev => ({
                    ...prev,
                    [`metric-${index}`]: currentValue
                }));

                if (progress < 1) {
                    requestAnimationFrame(animateValue);
                } else if (index === metrics.length - 1) {
                    setIsAnimating(false);
                }
            };

            requestAnimationFrame(animateValue);
        });
    }, [scenarioId, animated, metrics]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {metrics.map((metric, index) => (
                <Card
                    key={`${scenarioId}-${index}`}
                    className={`bg-white/90 backdrop-blur-md border-2 border-gray-200 shadow-xl transition-all duration-300 ${isAnimating ? 'transform hover:scale-105' : ''
                        }`}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.color} text-white`}>
                                {metric.icon}
                            </div>
                            <div className="text-right">
                                <div className={`text-xs font-medium flex items-center ${metric.trend > 0 ? 'text-green-600' : metric.trend < 0 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                    <TrendingUp className={`w-3 h-3 mr-1 ${metric.trend < 0 ? 'transform rotate-180' : ''
                                        }`} />
                                    {Math.abs(metric.trend)}%
                                </div>
                            </div>
                        </div>

                        <div className="mb-2">
                            <p className="text-sm text-gray-600 font-medium">{metric.label}</p>
                            <p className={`text-2xl font-bold text-gray-800 ${isAnimating ? 'transition-all duration-300' : ''
                                }`}>
                                {formatValue(displayValues[`metric-${index}`] || 0, metric.unit)}
                            </p>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">
                            {metric.description}
                        </p>

                        {/* Progress bar for animation */}
                        {isAnimating && (
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div
                                        className={`h-1 rounded-full bg-gradient-to-r ${metric.color} transition-all duration-300`}
                                        style={{
                                            width: `${((displayValues[`metric-${index}`] || 0) / metric.value) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default SurplusNetworkImpactMetrics;