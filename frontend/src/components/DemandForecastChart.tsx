import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Package } from 'lucide-react';
import { chartDataService, ChartDataPoint, timeRanges } from '../services/chartDataService';

interface DemandForecastChartProps {
    selectedProduct?: string;
    onProductChange?: (sku: string) => void;
}

const DemandForecastChart: React.FC<DemandForecastChartProps> = ({
    selectedProduct = 'WH-001',
    onProductChange
}) => {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'3M' | '6M'>('6M');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProductName, setSelectedProductName] = useState('Wireless Headphones');

    const availableProducts = chartDataService.getAvailableProducts();

    // Generate chart data when product or time range changes
    useEffect(() => {
        setIsLoading(true);

        // Simulate loading time for demo purposes
        setTimeout(() => {
            const fullData = chartDataService.generateHistoricalData(selectedProduct, 6);
            const filteredData = chartDataService.filterDataByTimeRange(fullData, selectedTimeRange);
            setChartData(filteredData);

            // Update product name
            const product = availableProducts.find(p => p.sku === selectedProduct);
            setSelectedProductName(product?.name || 'Unknown Product');

            setIsLoading(false);
        }, 300);
    }, [selectedProduct, selectedTimeRange]);

    const handleProductChange = (sku: string) => {
        if (onProductChange) {
            onProductChange(sku);
        }
    };

    const handleTimeRangeChange = (range: '3M' | '6M') => {
        setSelectedTimeRange(range);
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const date = new Date(label);

            return (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-medium text-gray-900 mb-2">
                        {date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-blue-600 flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                Actual Demand:
                            </span>
                            <span className="font-medium text-gray-900 ml-2">
                                {data.actualDemand.toLocaleString()} units
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                Predicted:
                            </span>
                            <span className="font-medium text-gray-900 ml-2">
                                {data.predictedDemand.toLocaleString()} units
                            </span>
                        </div>
                        {data.confidence && (
                            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                                <span className="text-xs text-gray-500">Confidence:</span>
                                <span className="text-xs font-medium text-gray-700">
                                    {data.confidence}%
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    // Format chart data for Recharts
    const formattedChartData = chartData.map(point => ({
        ...point,
        date: point.date.toISOString().split('T')[0], // Format date for chart
        formattedDate: point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Demand Forecast Trends</h3>
                        <p className="text-sm text-gray-600">Historical vs Predicted Demand Analysis</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-4">
                    {/* Product Selector */}
                    <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-500" />
                        <select
                            value={selectedProduct}
                            onChange={(e) => handleProductChange(e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {availableProducts.map(product => (
                                <option key={product.sku} value={product.sku}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {timeRanges.map((range) => (
                                <button
                                    key={range.value}
                                    onClick={() => handleTimeRangeChange(range.value)}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${selectedTimeRange === range.value
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-80">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-sm text-gray-500">Loading chart data...</p>
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={formattedChartData}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="formattedDate"
                                tick={{ fontSize: 12 }}
                                stroke="#6b7280"
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                stroke="#6b7280"
                                label={{ value: 'Units', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="actualDemand"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                name="Actual Demand"
                            />
                            <Line
                                type="monotone"
                                dataKey="predictedDemand"
                                stroke="#10b981"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                                name="Predicted Demand"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Chart Info */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600 space-y-2 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span>Actual historical demand</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span>AI predicted demand</span>
                    </div>
                </div>
                <div className="text-left sm:text-right">
                    <p className="font-medium text-gray-900">{selectedProductName}</p>
                    <p className="text-xs">
                        Showing {selectedTimeRange === '3M' ? '3' : '6'} months of data ({chartData.length} data points)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DemandForecastChart;