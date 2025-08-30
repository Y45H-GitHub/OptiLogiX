import React, { useState, useEffect } from 'react';
import {
    ArrowRight,
    CheckCircle,
    DollarSign,
    Recycle,
    Package,
    Zap
} from 'lucide-react';

interface ScenarioTransitionProps {
    isVisible: boolean;
    fromScenario: string;
    toScenario: string;
    onComplete: () => void;
}

const SurplusNetworkScenarioTransition: React.FC<ScenarioTransitionProps> = ({
    isVisible,
    fromScenario,
    toScenario,
    onComplete
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const scenarioData = {
        'overstocked-electronics': {
            name: 'Overstocked Electronics',
            icon: '💻',
            color: 'from-red-500 to-red-600',
            items: 250,
            savings: 125000,
            waste: 2500
        },
        'seasonal-clearance': {
            name: 'Seasonal Clearance',
            icon: '🌡️',
            color: 'from-orange-500 to-orange-600',
            items: 650,
            savings: 85000,
            waste: 1800
        },
        'office-liquidation': {
            name: 'Office Liquidation',
            icon: '🏢',
            color: 'from-blue-500 to-blue-600',
            items: 228,
            savings: 200000,
            waste: 5000
        },
        'all': {
            name: 'All Scenarios',
            icon: '🌐',
            color: 'from-emerald-500 to-emerald-600',
            items: 1128,
            savings: 410000,
            waste: 9300
        }
    };

    const steps = [
        { message: 'Analyzing current scenario...', progress: 20 },
        { message: 'Calculating impact metrics...', progress: 40 },
        { message: 'Loading new scenario data...', progress: 70 },
        { message: 'Transition complete!', progress: 100 }
    ];

    useEffect(() => {
        if (!isVisible) {
            setCurrentStep(0);
            setIsComplete(false);
            return;
        }

        let stepIndex = 0;
        const stepDuration = 800; // 800ms per step

        const nextStep = () => {
            if (stepIndex < steps.length - 1) {
                stepIndex++;
                setCurrentStep(stepIndex);
                setTimeout(nextStep, stepDuration);
            } else {
                setIsComplete(true);
                setTimeout(() => {
                    onComplete();
                }, 1000);
            }
        };

        setTimeout(nextStep, stepDuration);
    }, [isVisible, onComplete]);

    const formatMetric = (value: number, type: 'currency' | 'weight' | 'count') => {
        switch (type) {
            case 'currency':
                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                return `$${value.toLocaleString()}`;
            case 'weight':
                if (value >= 1000) return `${(value / 1000).toFixed(1)}T`;
                return `${value} kg`;
            case 'count':
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toLocaleString();
        }
    };

    if (!isVisible) return null;

    const fromData = scenarioData[fromScenario as keyof typeof scenarioData];
    const toData = scenarioData[toScenario as keyof typeof scenarioData];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 animate-scale-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white mb-4 animate-pulse">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Scenario Transition
                    </h3>
                    <p className="text-gray-600">
                        Switching from {fromData?.name} to {toData?.name}
                    </p>
                </div>

                {/* Scenario Comparison */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* From Scenario */}
                    <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${fromData?.color} text-white mb-3 ${currentStep >= 1 ? 'opacity-50 scale-90' : ''
                            } transition-all duration-500`}>
                            <span className="text-2xl">{fromData?.icon}</span>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-2">{fromData?.name}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center justify-center space-x-1">
                                <Package className="w-3 h-3" />
                                <span>{formatMetric(fromData?.items || 0, 'count')} items</span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                                <DollarSign className="w-3 h-3" />
                                <span>{formatMetric(fromData?.savings || 0, 'currency')}</span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                                <Recycle className="w-3 h-3" />
                                <span>{formatMetric(fromData?.waste || 0, 'weight')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center">
                        <ArrowRight className={`w-8 h-8 text-gray-400 ${currentStep >= 2 ? 'text-emerald-600 animate-pulse' : ''
                            } transition-all duration-500`} />
                    </div>

                    {/* To Scenario */}
                    <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${toData?.color} text-white mb-3 ${currentStep >= 3 ? 'scale-110 shadow-lg' : currentStep < 2 ? 'opacity-30' : ''
                            } transition-all duration-500`}>
                            <span className="text-2xl">{toData?.icon}</span>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-2">{toData?.name}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center justify-center space-x-1">
                                <Package className="w-3 h-3" />
                                <span>{formatMetric(toData?.items || 0, 'count')} items</span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                                <DollarSign className="w-3 h-3" />
                                <span>{formatMetric(toData?.savings || 0, 'currency')}</span>
                            </div>
                            <div className="flex items-center justify-center space-x-1">
                                <Recycle className="w-3 h-3" />
                                <span>{formatMetric(toData?.waste || 0, 'weight')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-gray-900">
                            {steps[currentStep]?.progress || 0}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500 ease-out"
                            style={{ width: `${steps[currentStep]?.progress || 0}%` }}
                        />
                    </div>
                </div>

                {/* Current Step */}
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                            {isComplete ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            )}
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                            {steps[currentStep]?.message}
                        </p>
                    </div>
                </div>

                {/* Success Message */}
                {isComplete && (
                    <div className="text-center mt-6">
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium text-sm animate-bounce-gentle">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Scenario Updated Successfully!
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes bounceGentle {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-5px);
                    }
                }
                
                .animate-scale-in {
                    animation: scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .animate-bounce-gentle {
                    animation: bounceGentle 1s infinite;
                }
            `}</style>
        </div>
    );
};

export default SurplusNetworkScenarioTransition;