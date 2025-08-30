import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    DollarSign,
    Recycle,
    Users,
    TrendingUp,
    Zap,
    Package,
    Clock
} from 'lucide-react';

interface AnimationStep {
    time: number;
    message: string;
    progress: number;
}

interface SuccessAnimationProps {
    type: 'matchFound' | 'transferComplete' | 'networkGrowth';
    isVisible: boolean;
    onComplete: () => void;
    metrics?: {
        costSavings?: number;
        wasteReduction?: number;
        itemsRescued?: number;
    };
}

const SurplusNetworkSuccessAnimation: React.FC<SuccessAnimationProps> = ({
    type,
    isVisible,
    onComplete,
    metrics = {}
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const animations = {
        matchFound: {
            duration: 3000,
            steps: [
                { time: 0, message: 'Analyzing surplus inventory...', progress: 15 },
                { time: 800, message: 'Scanning network for potential buyers...', progress: 40 },
                { time: 1600, message: 'Found 3 verified buyers nearby!', progress: 70 },
                { time: 2400, message: 'Match confirmed! Buyer notified instantly.', progress: 100 }
            ],
            icon: <Zap className="w-8 h-8" />,
            color: 'from-emerald-500 to-teal-600',
            title: 'Instant Match Found!'
        },
        transferComplete: {
            duration: 4000,
            steps: [
                { time: 0, message: 'Transfer request initiated...', progress: 20 },
                { time: 1000, message: 'Pickup scheduled and confirmed...', progress: 40 },
                { time: 2200, message: 'Items in transit to new owner...', progress: 70 },
                { time: 3200, message: 'Delivery confirmed! Waste prevented.', progress: 100 }
            ],
            icon: <Package className="w-8 h-8" />,
            color: 'from-blue-500 to-indigo-600',
            title: 'Transfer Successful!'
        },
        networkGrowth: {
            duration: 3500,
            steps: [
                { time: 0, message: 'New business joining network...', progress: 25 },
                { time: 1000, message: 'Verifying credentials and reputation...', progress: 50 },
                { time: 2000, message: 'Integration with existing partners...', progress: 75 },
                { time: 2800, message: 'Network expanded! New opportunities unlocked.', progress: 100 }
            ],
            icon: <Users className="w-8 h-8" />,
            color: 'from-purple-500 to-pink-600',
            title: 'Network Growing!'
        }
    };

    const currentAnimation = animations[type];

    useEffect(() => {
        if (!isVisible) {
            setCurrentStep(0);
            setProgress(0);
            setIsComplete(false);
            return;
        }

        const steps = currentAnimation.steps;
        let stepIndex = 0;
        let startTime = Date.now();

        const updateAnimation = () => {
            const elapsed = Date.now() - startTime;

            // Find current step
            while (stepIndex < steps.length - 1 && elapsed >= steps[stepIndex + 1].time) {
                stepIndex++;
            }

            setCurrentStep(stepIndex);

            // Calculate progress within current step
            const currentStepData = steps[stepIndex];
            const nextStepData = steps[stepIndex + 1];

            if (nextStepData) {
                const stepProgress = (elapsed - currentStepData.time) / (nextStepData.time - currentStepData.time);
                const interpolatedProgress = currentStepData.progress +
                    (nextStepData.progress - currentStepData.progress) * Math.min(stepProgress, 1);
                setProgress(interpolatedProgress);
            } else {
                setProgress(currentStepData.progress);
            }

            if (elapsed >= currentAnimation.duration) {
                setIsComplete(true);
                setTimeout(() => {
                    onComplete();
                }, 1500);
            } else {
                requestAnimationFrame(updateAnimation);
            }
        };

        requestAnimationFrame(updateAnimation);
    }, [isVisible, type, currentAnimation, onComplete]);

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
                {/* Header with animated icon */}
                <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${currentAnimation.color} text-white mb-4 animate-bounce-gentle`}>
                        {currentAnimation.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {currentAnimation.title}
                    </h3>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-gray-900">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full bg-gradient-to-r ${currentAnimation.color} transition-all duration-300 ease-out`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Current step message */}
                <div className="mb-6">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                            {isComplete ? (
                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                                <Clock className="w-5 h-5 text-blue-600 animate-spin" />
                            )}
                        </div>
                        <p className="text-sm text-gray-700 font-medium">
                            {currentAnimation.steps[currentStep]?.message}
                        </p>
                    </div>
                </div>

                {/* Success metrics */}
                {isComplete && metrics && (
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {metrics.costSavings && (
                            <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <DollarSign className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                <div className="text-sm font-bold text-emerald-800">
                                    {formatMetric(metrics.costSavings, 'currency')}
                                </div>
                                <div className="text-xs text-emerald-600">Saved</div>
                            </div>
                        )}
                        {metrics.wasteReduction && (
                            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <Recycle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <div className="text-sm font-bold text-blue-800">
                                    {formatMetric(metrics.wasteReduction, 'weight')}
                                </div>
                                <div className="text-xs text-blue-600">Prevented</div>
                            </div>
                        )}
                        {metrics.itemsRescued && (
                            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                <div className="text-sm font-bold text-purple-800">
                                    {formatMetric(metrics.itemsRescued, 'count')}
                                </div>
                                <div className="text-xs text-purple-600">Items</div>
                            </div>
                        )}
                    </div>
                )}

                {/* Success message */}
                {isComplete && (
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg font-medium text-sm">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mission Accomplished!
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
                        transform: translateY(-10px);
                    }
                }
                
                .animate-scale-in {
                    animation: scaleIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .animate-bounce-gentle {
                    animation: bounceGentle 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default SurplusNetworkSuccessAnimation;