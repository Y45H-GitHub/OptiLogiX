import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Presentation,
    AlertTriangle,
    Clock,
    Building2,
    TrendingUp,
    Target,
    Zap,
    DollarSign,
    Recycle,
    Users
} from 'lucide-react';
import { PresentationPhase } from '../services/surplusNetworkDemoService';

interface SurplusNetworkPresentationHelperProps {
    isVisible: boolean;
    onToggle: () => void;
    presentationScript: PresentationPhase[];
}

const SurplusNetworkPresentationHelper: React.FC<SurplusNetworkPresentationHelperProps> = ({
    isVisible,
    onToggle,
    presentationScript
}) => {
    const [activePhase, setActivePhase] = useState(0);

    const phaseIcons = {
        'problem-introduction': <AlertTriangle className="w-4 h-4" />,
        'critical-electronics': <Zap className="w-4 h-4" />,
        'seasonal-urgency': <Clock className="w-4 h-4" />,
        'office-liquidation': <Building2 className="w-4 h-4" />,
        'network-impact': <Users className="w-4 h-4" />,
        'future-vision': <Target className="w-4 h-4" />
    };

    const formatMetric = (value: number, type: 'currency' | 'weight' | 'count') => {
        switch (type) {
            case 'currency':
                if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                return `$${value.toLocaleString()}`;
            case 'weight':
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M kg`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}T`;
                return `${value} kg`;
            case 'count':
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toLocaleString();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="mb-2 inline-flex items-center px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-800 transition-all duration-300 transform hover:scale-105"
            >
                <Presentation className="w-5 h-5 mr-2" />
                <span className="font-medium">Demo Script</span>
                {isVisible ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronUp className="w-4 h-4 ml-2" />}
            </button>

            {/* Presentation Helper Panel */}
            {isVisible && (
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-[420px] max-h-[500px] overflow-hidden animate-slide-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4">
                        <h3 className="font-bold text-lg flex items-center">
                            <Presentation className="w-5 h-5 mr-2" />
                            Surplus Rescue Network Demo
                        </h3>
                        <p className="text-emerald-100 text-sm mt-1">
                            Hackathon presentation script with key metrics
                        </p>
                    </div>

                    {/* Phase Navigation */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="grid grid-cols-3 gap-2">
                            {presentationScript.map((phase, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActivePhase(index)}
                                    className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center ${activePhase === index
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                                        }`}
                                >
                                    {phaseIcons[phase.phase as keyof typeof phaseIcons]}
                                    <span className="ml-1 hidden sm:inline">
                                        {index + 1}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Phase Content */}
                    <div className="p-4 max-h-80 overflow-y-auto">
                        {presentationScript[activePhase] && (
                            <div className="space-y-4">
                                {/* Phase Header */}
                                <div>
                                    <h4 className="font-bold text-gray-900 flex items-center mb-2">
                                        {phaseIcons[presentationScript[activePhase].phase as keyof typeof phaseIcons]}
                                        <span className="ml-2">{presentationScript[activePhase].title}</span>
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {presentationScript[activePhase].description}
                                    </p>
                                </div>

                                {/* Key Metrics */}
                                {presentationScript[activePhase].metrics && (
                                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200">
                                        <h5 className="font-semibold text-emerald-800 mb-2 text-sm flex items-center">
                                            <TrendingUp className="w-4 h-4 mr-1" />
                                            Impact Metrics
                                        </h5>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div className="text-center">
                                                <div className="flex items-center justify-center text-emerald-600 mb-1">
                                                    <DollarSign className="w-3 h-3" />
                                                </div>
                                                <div className="font-bold text-emerald-800">
                                                    {formatMetric(presentationScript[activePhase].metrics.costSavings, 'currency')}
                                                </div>
                                                <div className="text-emerald-600">Saved</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center text-emerald-600 mb-1">
                                                    <Recycle className="w-3 h-3" />
                                                </div>
                                                <div className="font-bold text-emerald-800">
                                                    {formatMetric(presentationScript[activePhase].metrics.wasteReduction, 'weight')}
                                                </div>
                                                <div className="text-emerald-600">Prevented</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="flex items-center justify-center text-emerald-600 mb-1">
                                                    <Target className="w-3 h-3" />
                                                </div>
                                                <div className="font-bold text-emerald-800">
                                                    {formatMetric(presentationScript[activePhase].metrics.itemsRescued, 'count')}
                                                </div>
                                                <div className="text-emerald-600">Items</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Key Talking Points */}
                                <div>
                                    <h5 className="font-semibold text-gray-800 mb-2 text-sm">Key Talking Points:</h5>
                                    <ul className="space-y-2">
                                        {presentationScript[activePhase].keyPoints.map((point, idx) => (
                                            <li key={idx} className="text-xs text-gray-700 flex items-start">
                                                <span className="text-emerald-600 mr-2 mt-0.5 font-bold">•</span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Demo Actions */}
                                <div>
                                    <h5 className="font-semibold text-gray-800 mb-2 text-sm">Demo Actions:</h5>
                                    <ul className="space-y-2">
                                        {presentationScript[activePhase].demoActions.map((action, idx) => (
                                            <li key={idx} className="text-xs text-blue-700 flex items-start bg-blue-50 p-2 rounded border-l-2 border-blue-400">
                                                <span className="text-blue-600 mr-2 mt-0.5 font-bold">→</span>
                                                <span>{action}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                        <button
                            onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
                            disabled={activePhase === 0}
                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                        >
                            Previous
                        </button>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 font-medium">
                                {activePhase + 1} of {presentationScript.length}
                            </span>
                            <div className="flex space-x-1">
                                {presentationScript.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-2 h-2 rounded-full ${index === activePhase ? 'bg-emerald-600' : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setActivePhase(Math.min(presentationScript.length - 1, activePhase + 1))}
                            disabled={activePhase === presentationScript.length - 1}
                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                .animate-slide-in {
                    animation: slideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
            `}</style>
        </div>
    );
};

export default SurplusNetworkPresentationHelper;