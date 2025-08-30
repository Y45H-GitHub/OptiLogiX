import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Presentation, Target, TrendingUp, Zap, Star, AlertTriangle } from 'lucide-react';
import { demoDataService } from '../services/demoDataService';

interface DemoPresentationHelperProps {
    isVisible: boolean;
    onToggle: () => void;
}

const DemoPresentationHelper: React.FC<DemoPresentationHelperProps> = ({ isVisible, onToggle }) => {
    const [activePhase, setActivePhase] = useState(0);
    const presentationScript = demoDataService.getDemoPresentationScript();

    const phaseIcons = {
        'opening': <Presentation className="w-5 h-5" />,
        'problem-identification': <AlertTriangle className="w-5 h-5" />,
        'seasonal-intelligence': <TrendingUp className="w-5 h-5" />,
        'workflow-automation': <Target className="w-5 h-5" />,
        'trending-products': <Zap className="w-5 h-5" />,
        'innovation-showcase': <Star className="w-5 h-5" />
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="mb-2 inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105"
            >
                <Presentation className="w-4 h-4 mr-2" />
                Demo Script
                {isVisible ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronUp className="w-4 h-4 ml-2" />}
            </button>

            {/* Presentation Helper Panel */}
            {isVisible && (
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-96 max-h-96 overflow-hidden animate-slide-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
                        <h3 className="font-bold text-lg flex items-center">
                            <Presentation className="w-5 h-5 mr-2" />
                            Hackathon Demo Script
                        </h3>
                        <p className="text-purple-100 text-sm mt-1">Click phases to see talking points</p>
                    </div>

                    {/* Phase Navigation */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="grid grid-cols-3 gap-2">
                            {presentationScript.map((phase, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActivePhase(index)}
                                    className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center ${activePhase === index
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                                        }`}
                                >
                                    {phaseIcons[phase.phase as keyof typeof phaseIcons]}
                                    <span className="ml-1 hidden sm:inline">Phase {index + 1}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Phase Content */}
                    <div className="p-4 max-h-64 overflow-y-auto">
                        {presentationScript[activePhase] && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-gray-900 flex items-center mb-2">
                                        {phaseIcons[presentationScript[activePhase].phase as keyof typeof phaseIcons]}
                                        <span className="ml-2">{presentationScript[activePhase].title}</span>
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-3">
                                        {presentationScript[activePhase].description}
                                    </p>
                                </div>

                                <div>
                                    <h5 className="font-semibold text-gray-800 mb-2 text-sm">Key Talking Points:</h5>
                                    <ul className="space-y-1">
                                        {presentationScript[activePhase].keyPoints.map((point, idx) => (
                                            <li key={idx} className="text-xs text-gray-700 flex items-start">
                                                <span className="text-purple-600 mr-2 mt-0.5">•</span>
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h5 className="font-semibold text-gray-800 mb-2 text-sm">Demo Actions:</h5>
                                    <ul className="space-y-1">
                                        {presentationScript[activePhase].demoActions.map((action, idx) => (
                                            <li key={idx} className="text-xs text-blue-700 flex items-start bg-blue-50 p-2 rounded border">
                                                <span className="text-blue-600 mr-2 mt-0.5">→</span>
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
                        <span className="text-xs text-gray-500 font-medium">
                            {activePhase + 1} of {presentationScript.length}
                        </span>
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

export default DemoPresentationHelper;