import React from 'react';
import { AlertTriangle, TrendingUp, Zap, Star, Package, RotateCcw } from 'lucide-react';

interface DemoScenarioSelectorProps {
    onScenarioChange: (scenario: string) => void;
    currentScenario: string;
}

const DemoScenarioSelector: React.FC<DemoScenarioSelectorProps> = ({ onScenarioChange, currentScenario }) => {
    const scenarios = [
        {
            id: 'all',
            name: 'All Products',
            description: 'Complete inventory overview',
            icon: <Package className="w-4 h-4" />,
            color: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
            count: '10 items'
        },
        {
            id: 'critical',
            name: 'Critical Stock',
            description: 'Urgent attention required',
            icon: <AlertTriangle className="w-4 h-4" />,
            color: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
            count: '2 items'
        },
        {
            id: 'seasonal',
            name: 'Seasonal Surge',
            description: 'Peak demand periods',
            icon: <TrendingUp className="w-4 h-4" />,
            color: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
            count: '2 items'
        },
        {
            id: 'high-demand',
            name: 'High Demand',
            description: 'Fast-moving inventory',
            icon: <Zap className="w-4 h-4" />,
            color: 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
            count: '2 items'
        },
        {
            id: 'new-product',
            name: 'New Products',
            description: 'Innovation pipeline',
            icon: <Star className="w-4 h-4" />,
            color: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
            count: '2 items'
        }
    ];

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Demo Scenarios</h3>
                </div>
                <button
                    onClick={() => onScenarioChange('all')}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-all duration-200"
                >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset View
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {scenarios.map((scenario) => (
                    <button
                        key={scenario.id}
                        onClick={() => onScenarioChange(scenario.id)}
                        className={`p-4 rounded-xl text-white text-left transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${currentScenario === scenario.id
                            ? `${scenario.color} shadow-lg scale-105 ring-2 ring-white ring-opacity-50`
                            : scenario.color
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            {scenario.icon}
                            <span className="text-xs font-medium opacity-90">{scenario.count}</span>
                        </div>
                        <div className="mb-1">
                            <h4 className="font-bold text-sm">{scenario.name}</h4>
                        </div>
                        <p className="text-xs opacity-90 leading-relaxed">{scenario.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default DemoScenarioSelector;