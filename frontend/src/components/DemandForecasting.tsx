import React, { useState, useEffect } from 'react';
import { ShoppingCart, TrendingUp, AlertTriangle, Package, BarChart3, Activity, Check, X, Clock, Truck, Zap, Star, AlertCircle } from 'lucide-react';
import { useNotifications, PurchaseOrder } from '../contexts/NotificationContext';
import Toast from './Toast';
import { forecastCalculationService, InventoryItem } from '../services/forecastCalculationService';
import DemandForecastChart from './DemandForecastChart';
import { demoDataService, EnhancedInventoryItem } from '../services/demoDataService';
import DemoPresentationHelper from './DemoPresentationHelper';
import DemoScenarioSelector from './DemoScenarioSelector';

interface ForecastItem extends EnhancedInventoryItem {
    predictedDemand: number;
    recommendedOrder: number;
    priority: 'low' | 'medium' | 'high';
    stockoutRisk: number;
    confidenceLevel: number;
    orderStatus?: 'idle' | 'creating' | 'pending' | 'approving' | 'approved' | 'rejecting' | 'rejected';
    orderId?: string;
}

// Enhanced inventory data with compelling demo scenarios - moved inside component to avoid module-level execution issues

const DemandForecasting: React.FC = () => {
    const { createPurchaseOrder, approveOrder, rejectOrder } = useNotifications();
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({
        message: '',
        type: 'success',
        isVisible: false
    });
    const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedChartProduct, setSelectedChartProduct] = useState<string>('WH-PRO-001');
    const [isDemoHelperVisible, setIsDemoHelperVisible] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState<string>('all');

    // Get enhanced inventory data safely inside component
    const baseInventoryData: EnhancedInventoryItem[] = React.useMemo(() => {
        try {
            const data = demoDataService.getEnhancedInventoryData();
            console.log('Demo data loaded successfully:', data.length, 'items');
            return data;
        } catch (error) {
            console.error('Error loading demo data:', error);
            // Fallback to basic data if enhanced data fails
            return [
                {
                    sku: 'WH-PRO-001',
                    productName: 'Premium Noise-Canceling Headphones',
                    currentStock: 8,
                    unitPrice: 299.99,
                    supplier: 'AudioTech Premium',
                    category: 'Electronics',
                    leadTime: 21,
                    safetyStockLevel: 25,
                    scenario: 'critical' as const,
                    storyContext: 'Critical stock situation',
                    urgencyLevel: 'critical' as const,
                    businessImpact: 'High revenue risk'
                }
            ];
        }
    }, []);

    // Generate dynamic forecast data on component mount
    useEffect(() => {
        const generateForecastData = () => {
            if (!baseInventoryData || baseInventoryData.length === 0) {
                console.warn('No base inventory data available');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);

            try {
                const dynamicForecastData = baseInventoryData.map(item => {
                    const forecast = forecastCalculationService.generateForecast(item);

                    return {
                        ...item,
                        predictedDemand: forecast.predictedDemand,
                        recommendedOrder: forecast.recommendedOrder,
                        priority: forecast.priority,
                        stockoutRisk: forecast.stockoutRisk,
                        confidenceLevel: forecast.confidenceLevel,
                        orderStatus: 'idle' as const
                    };
                });

                setForecastData(dynamicForecastData);
                console.log('Forecast data generated:', dynamicForecastData.length, 'items');
            } catch (error) {
                console.error('Error generating forecast data:', error);
                setForecastData([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Simulate loading time for demo purposes
        setTimeout(generateForecastData, 500);

        // Refresh data every 30 seconds to show dynamic nature
        const interval = setInterval(generateForecastData, 30000);

        return () => clearInterval(interval);
    }, [baseInventoryData]);

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const handleCreatePurchaseOrder = async (item: ForecastItem) => {
        const orderId = `PO-${Date.now().toString().slice(-6)}`;

        // Update item status to creating
        setForecastData(prev => prev.map(i =>
            i.sku === item.sku ? { ...i, orderStatus: 'creating' } : i
        ));

        try {
            showToast('Creating purchase order...', 'info');

            const purchaseOrder: PurchaseOrder = {
                id: orderId,
                sku: item.sku,
                productName: item.productName,
                quantity: item.recommendedOrder,
                unitPrice: item.unitPrice,
                totalCost: item.recommendedOrder * item.unitPrice,
                supplier: item.supplier,
                requestedBy: 'Supply Chain Manager',
                requestDate: new Date(),
                priority: item.priority,
                justification: `AI-predicted stockout risk: ${item.stockoutRisk}% - Current inventory: ${item.currentStock} units, predicted demand: ${item.predictedDemand} units`,
                status: 'pending'
            };

            const emailStatus = await createPurchaseOrder(purchaseOrder);

            // Update item status to pending with order ID
            setForecastData(prev => prev.map(i =>
                i.sku === item.sku ? { ...i, orderStatus: 'pending', orderId } : i
            ));

            showToast(`Purchase order ${orderId} created successfully!`, 'success');

            // Show email notification status
            setTimeout(() => {
                if (emailStatus.status === 'sent') {
                    showToast(`📧 Email sent to approvers for order ${orderId}`, 'success');
                } else if (emailStatus.status === 'failed') {
                    showToast(`⚠️ Email delivery failed for order ${orderId}: ${emailStatus.error}`, 'error');
                }
            }, 1000);

        } catch (error) {
            // Reset status on error
            setForecastData(prev => prev.map(i =>
                i.sku === item.sku ? { ...i, orderStatus: 'idle' } : i
            ));
            showToast('Failed to create purchase order', 'error');
            console.error('Error creating purchase order:', error);
        }
    };

    const handleApproveOrder = async (item: ForecastItem) => {
        if (!item.orderId) return;

        // Update status to approving
        setForecastData(prev => prev.map(i =>
            i.sku === item.sku ? { ...i, orderStatus: 'approving' } : i
        ));

        try {
            showToast('Approving order...', 'info');

            const emailStatus = await approveOrder(item.orderId, 'Approved via demand forecasting dashboard');

            // Update status to approved
            setForecastData(prev => prev.map(i =>
                i.sku === item.sku ? { ...i, orderStatus: 'approved' } : i
            ));

            showToast(`✅ Order ${item.orderId} approved successfully!`, 'success');

            // Show next steps
            setTimeout(() => {
                showToast(`📦 Order sent to supplier: ${item.supplier}`, 'success');
            }, 1500);

            // Show email status
            setTimeout(() => {
                if (emailStatus.status === 'sent') {
                    showToast(`📧 Approval confirmation sent`, 'success');
                } else if (emailStatus.status === 'failed') {
                    showToast(`⚠️ Email delivery failed: ${emailStatus.error}`, 'error');
                }
            }, 2500);

        } catch (error) {
            // Reset status on error
            setForecastData(prev => prev.map(i =>
                i.sku === item.sku ? { ...i, orderStatus: 'pending' } : i
            ));
            showToast('Failed to approve order', 'error');
            console.error('Error approving order:', error);
        }
    };

    const handleRejectOrder = async (item: ForecastItem) => {
        if (!item.orderId) return;

        // Update status to rejecting
        setForecastData(prev => prev.map(i =>
            i.sku === item.sku ? { ...i, orderStatus: 'rejecting' } : i
        ));

        try {
            showToast('Rejecting order...', 'info');

            const reason = 'Budget constraints - order rejected via demand forecasting dashboard';
            const emailStatus = await rejectOrder(item.orderId, reason);

            // Update status to rejected
            setForecastData(prev => prev.map(i =>
                i.sku === item.sku ? { ...i, orderStatus: 'rejected' } : i
            ));

            showToast(`❌ Order ${item.orderId} rejected`, 'error');

            // Show next steps
            setTimeout(() => {
                showToast(`💡 Consider adjusting quantity or setting reminder`, 'info');
            }, 1500);

            // Show email status
            setTimeout(() => {
                if (emailStatus.status === 'sent') {
                    showToast(`📧 Rejection notification sent`, 'success');
                } else if (emailStatus.status === 'failed') {
                    showToast(`⚠️ Email delivery failed: ${emailStatus.error}`, 'error');
                }
            }, 2500);

        } catch (error) {
            // Reset status on error
            setForecastData(prev => prev.map(i =>
                i.sku === item.sku ? { ...i, orderStatus: 'pending' } : i
            ));
            showToast('Failed to reject order', 'error');
            console.error('Error rejecting order:', error);
        }
    };

    const handleResetOrderStatus = (item: ForecastItem) => {
        setForecastData(prev => prev.map(i =>
            i.sku === item.sku ? { ...i, orderStatus: 'idle', orderId: undefined } : i
        ));
        showToast(`Order status reset for ${item.productName}`, 'info');
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300';
            case 'medium':
                return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300';
            case 'low':
                return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300';
            default:
                return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300';
        }
    };

    const getRiskIndicator = (risk: number) => {
        if (risk >= 80) return {
            color: 'text-red-700',
            bg: 'bg-gradient-to-r from-red-50 to-red-100',
            border: 'border-red-300',
            shadow: 'shadow-red-100',
            pulse: 'animate-pulse'
        };
        if (risk >= 60) return {
            color: 'text-orange-700',
            bg: 'bg-gradient-to-r from-orange-50 to-orange-100',
            border: 'border-orange-300',
            shadow: 'shadow-orange-100',
            pulse: ''
        };
        return {
            color: 'text-green-700',
            bg: 'bg-gradient-to-r from-green-50 to-green-100',
            border: 'border-green-300',
            shadow: 'shadow-green-100',
            pulse: ''
        };
    };

    const getScenarioBadge = (scenario: string, urgencyLevel: string) => {
        const badges = {
            'critical': {
                icon: <AlertCircle className="w-3 h-3" />,
                text: 'CRITICAL',
                style: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 animate-pulse'
            },
            'seasonal': {
                icon: <TrendingUp className="w-3 h-3" />,
                text: 'SEASONAL',
                style: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300'
            },
            'high-demand': {
                icon: <Zap className="w-3 h-3" />,
                text: 'HIGH DEMAND',
                style: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300'
            },
            'new-product': {
                icon: <Star className="w-3 h-3" />,
                text: 'NEW PRODUCT',
                style: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
            },
            'stable': {
                icon: <Package className="w-3 h-3" />,
                text: 'STABLE',
                style: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300'
            }
        };

        const badge = badges[scenario as keyof typeof badges] || badges.stable;

        return (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${badge.style} shadow-sm`}>
                {badge.icon}
                <span className="ml-1">{badge.text}</span>
            </div>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const renderActionButtons = (item: ForecastItem) => {
        const status = item.orderStatus || 'idle';

        switch (status) {
            case 'idle':
                return (
                    <button
                        onClick={() => handleCreatePurchaseOrder(item)}
                        className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm leading-4 font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-200/50 active:scale-95"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                        Create PO
                    </button>
                );

            case 'creating':
                return (
                    <div className="inline-flex items-center px-4 py-2.5 border border-blue-300 text-sm leading-4 font-semibold rounded-xl text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 animate-slide-in shadow-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Creating...
                    </div>
                );

            case 'pending':
                return (
                    <div className="flex space-x-3 animate-slide-in">
                        <button
                            onClick={() => handleApproveOrder(item)}
                            className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm leading-4 font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-200/50 active:scale-95"
                        >
                            <Check className="w-4 h-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                            Approve
                        </button>
                        <button
                            onClick={() => handleRejectOrder(item)}
                            className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm leading-4 font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-200/50 active:scale-95"
                        >
                            <X className="w-4 h-4 mr-1.5 transition-transform duration-300 group-hover:scale-110" />
                            Reject
                        </button>
                    </div>
                );

            case 'approving':
                return (
                    <div className="inline-flex items-center px-4 py-2.5 border border-green-300 text-sm leading-4 font-semibold rounded-xl text-green-700 bg-gradient-to-r from-green-50 to-green-100 animate-slide-in shadow-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        Approving...
                    </div>
                );

            case 'approved':
                return (
                    <div className="flex flex-col space-y-2 animate-slide-in">
                        <div className="inline-flex items-center px-4 py-2.5 border border-green-300 text-sm leading-4 font-semibold rounded-xl text-green-700 bg-gradient-to-r from-green-50 to-green-100 shadow-md">
                            <Check className="w-4 h-4 mr-2 text-green-600" />
                            Approved
                        </div>
                        <div className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 animate-fade-in shadow-sm">
                            <Truck className="w-3 h-3 mr-1.5" />
                            Order Sent to Supplier
                        </div>
                        <button
                            onClick={() => handleResetOrderStatus(item)}
                            className="text-xs text-gray-500 hover:text-blue-600 hover:underline transition-colors duration-200 mt-1 font-medium"
                        >
                            Reset for Demo
                        </button>
                    </div>
                );

            case 'rejecting':
                return (
                    <div className="inline-flex items-center px-4 py-2.5 border border-red-300 text-sm leading-4 font-semibold rounded-xl text-red-700 bg-gradient-to-r from-red-50 to-red-100 animate-slide-in shadow-sm">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        Rejecting...
                    </div>
                );

            case 'rejected':
                return (
                    <div className="flex flex-col space-y-2 animate-slide-in">
                        <div className="inline-flex items-center px-4 py-2.5 border border-red-300 text-sm leading-4 font-semibold rounded-xl text-red-700 bg-gradient-to-r from-red-50 to-red-100 shadow-md">
                            <X className="w-4 h-4 mr-2 text-red-600" />
                            Rejected
                        </div>
                        <div className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-orange-700 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 animate-fade-in shadow-sm">
                            <Clock className="w-3 h-3 mr-1.5" />
                            Consider Adjusting
                        </div>
                        <button
                            onClick={() => handleResetOrderStatus(item)}
                            className="text-xs text-gray-500 hover:text-blue-600 hover:underline transition-colors duration-200 mt-1 font-medium"
                        >
                            Reset for Demo
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    // Filter data based on selected scenario
    const getFilteredData = () => {
        if (selectedScenario === 'all') return forecastData;
        return forecastData.filter(item => item.scenario === selectedScenario);
    };

    const filteredData = getFilteredData();

    // Calculate dynamic KPIs based on filtered data
    const totalValue = filteredData.reduce((sum, item) => sum + (item.recommendedOrder * item.unitPrice), 0);
    const highRiskItems = filteredData.filter(item => item.stockoutRisk >= 60).length;
    const totalItemsTracked = filteredData.length;
    const averageConfidence = filteredData.length > 0
        ? filteredData.reduce((sum, item) => sum + item.confidenceLevel, 0) / filteredData.length
        : 0;

    // Early return if no data to prevent rendering errors
    if (!baseInventoryData || baseInventoryData.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading demo data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-15px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes bounceIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.3);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.05);
                    }
                    70% {
                        transform: scale(0.9);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes shimmer {
                    0% {
                        background-position: -200px 0;
                    }
                    100% {
                        background-position: calc(200px + 100%) 0;
                    }
                }
                
                .animate-slide-in {
                    animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .animate-fade-in {
                    animation: fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .animate-bounce-in {
                    animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
                
                .status-transition {
                    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                }
                
                .shimmer {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200px 100%;
                    animation: shimmer 1.5s infinite;
                }
            `}</style>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Demand Forecasting</h1>
                        <p className="text-lg text-gray-600 font-medium">AI-powered inventory optimization and procurement planning</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => {
                                setIsLoading(true);
                                setTimeout(() => {
                                    const dynamicForecastData = baseInventoryData.map(item => {
                                        const forecast = forecastCalculationService.generateForecast(item);
                                        const existingItem = forecastData.find(f => f.sku === item.sku);
                                        return {
                                            ...item,
                                            predictedDemand: forecast.predictedDemand,
                                            recommendedOrder: forecast.recommendedOrder,
                                            priority: forecast.priority,
                                            stockoutRisk: forecast.stockoutRisk,
                                            confidenceLevel: forecast.confidenceLevel,
                                            orderStatus: existingItem?.orderStatus || 'idle',
                                            orderId: existingItem?.orderId
                                        };
                                    });
                                    setForecastData(dynamicForecastData);
                                    setIsLoading(false);
                                    showToast('Forecast data refreshed successfully', 'success');
                                }, 800);
                            }}
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm leading-4 font-semibold rounded-xl text-gray-700 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                    Refreshing...
                                </>
                            ) : (
                                <>
                                    <Activity className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-180" />
                                    Refresh Data
                                </>
                            )}
                        </button>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm">
                            <Activity className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Last updated: {new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                                <BarChart3 className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Total Forecast Value</p>
                                {isLoading ? (
                                    <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{formatCurrency(totalValue)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:shadow-red-100/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl group-hover:from-red-100 group-hover:to-red-200 transition-all duration-300">
                                <AlertTriangle className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-700 transition-colors duration-300">High Risk Items</p>
                                {isLoading ? (
                                    <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900 group-hover:text-red-700 transition-colors duration-300">{highRiskItems}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:shadow-green-100/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl group-hover:from-green-100 group-hover:to-green-200 transition-all duration-300">
                                <Package className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Items Tracked</p>
                                {isLoading ? (
                                    <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">{totalItemsTracked}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl group-hover:from-purple-100 group-hover:to-purple-200 transition-all duration-300">
                                <TrendingUp className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Forecast Accuracy</p>
                                {isLoading ? (
                                    <div className="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">{averageConfidence.toFixed(1)}%</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Scenario Selector */}
            <DemoScenarioSelector
                currentScenario={selectedScenario}
                onScenarioChange={setSelectedScenario}
            />

            {/* Active Scenario Context */}
            {selectedScenario !== 'all' && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                {selectedScenario === 'critical' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                                {selectedScenario === 'seasonal' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                                {selectedScenario === 'high-demand' && <Zap className="w-4 h-4 text-orange-600" />}
                                {selectedScenario === 'new-product' && <Star className="w-4 h-4 text-blue-600" />}
                            </div>
                        </div>
                        <div className="ml-3">
                            <h4 className="font-bold text-blue-900 capitalize">{selectedScenario.replace('-', ' ')} Scenario Active</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                {selectedScenario === 'critical' && 'Showing products with dangerously low inventory requiring immediate action to prevent stockouts.'}
                                {selectedScenario === 'seasonal' && 'Displaying items experiencing seasonal demand surges that require proactive inventory positioning.'}
                                {selectedScenario === 'high-demand' && 'Featuring fast-moving products with consistently high demand and growth trends.'}
                                {selectedScenario === 'new-product' && 'Highlighting recently launched products with uncertain demand patterns requiring careful monitoring.'}
                            </p>
                            <div className="mt-2 text-xs text-blue-600 font-medium">
                                Showing {filteredData.length} items • Total forecast value: {formatCurrency(totalValue)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Demand Forecast Chart */}
            <div className="mb-10">
                <DemandForecastChart
                    selectedProduct={selectedChartProduct}
                    onProductChange={setSelectedChartProduct}
                />
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Inventory Forecast & Procurement Recommendations</h2>
                    <p className="text-sm text-gray-600 mt-1">AI-powered insights for optimal inventory management</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="w-80 px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                                <th className="w-32 px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Current Stock</th>
                                <th className="w-40 px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Predicted Demand</th>
                                <th className="w-36 px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Risk Level</th>
                                <th className="w-40 px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Recommended Order</th>
                                <th className="w-40 px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Supplier</th>
                                <th className="w-48 px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                // Loading skeleton rows
                                Array.from({ length: 4 }).map((_, index) => (
                                    <tr key={index} className="animate-pulse hover:bg-gray-50">
                                        <td className="px-6 py-5 overflow-hidden">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex-shrink-0"></div>
                                                <div className="ml-4 flex-1 min-w-0">
                                                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full mb-2"></div>
                                                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 overflow-hidden">
                                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full mb-2"></div>
                                            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                                        </td>
                                        <td className="px-6 py-5 overflow-hidden">
                                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full mb-2"></div>
                                            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5"></div>
                                        </td>
                                        <td className="px-6 py-5 overflow-hidden">
                                            <div className="space-y-2">
                                                <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-full"></div>
                                                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-4/5"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 overflow-hidden">
                                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full mb-2"></div>
                                            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5"></div>
                                        </td>
                                        <td className="px-6 py-5 overflow-hidden">
                                            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full mb-2"></div>
                                            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-4/5"></div>
                                        </td>
                                        <td className="px-6 py-5 overflow-hidden">
                                            <div className="flex justify-end">
                                                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-24"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                filteredData.map((item) => {
                                    const riskIndicator = getRiskIndicator(item.stockoutRisk);
                                    return (
                                        <tr key={item.sku} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 transition-all duration-200 group">
                                            <td className="px-6 py-5 overflow-hidden">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300 shadow-sm">
                                                            <Package className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1 flex-wrap">
                                                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-900 transition-colors duration-300 truncate">{item.productName}</div>
                                                            {item.scenario && item.urgencyLevel && (
                                                                <div className="flex-shrink-0">
                                                                    {getScenarioBadge(item.scenario, item.urgencyLevel)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-medium mb-1 truncate">SKU: {item.sku}</div>
                                                        {item.storyContext && (
                                                            <div className="text-xs text-gray-600 italic leading-relaxed bg-gray-50 px-2 py-1 rounded border truncate">
                                                                💡 {item.storyContext}
                                                            </div>
                                                        )}
                                                        {item.businessImpact && item.urgencyLevel !== 'low' && (
                                                            <div className="text-xs text-red-600 font-medium mt-1 truncate">
                                                                ⚠️ {item.businessImpact}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 overflow-hidden">
                                                <div className="text-sm text-gray-900 font-bold truncate">{item.currentStock.toLocaleString()}</div>
                                                <div className="text-xs text-gray-500 font-medium">units</div>
                                            </td>
                                            <td className="px-6 py-5 overflow-hidden">
                                                <div className="text-sm text-gray-900 font-bold truncate">{item.predictedDemand.toLocaleString()}</div>
                                                <div className="text-xs text-gray-500 font-medium truncate">
                                                    30-day forecast ({item.confidenceLevel}% confidence)
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 overflow-hidden">
                                                <div className="space-y-2">
                                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${riskIndicator.bg} ${riskIndicator.color} ${riskIndicator.border} ${riskIndicator.shadow} ${riskIndicator.pulse} shadow-sm w-full max-w-full`}>
                                                        <div className={`w-2 h-2 rounded-full mr-1 flex-shrink-0 ${item.stockoutRisk >= 80 ? 'bg-red-500' : item.stockoutRisk >= 60 ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                                        <span className="truncate">{item.stockoutRisk}% Risk</span>
                                                    </div>
                                                    <div className={`text-xs ${getPriorityBadge(item.priority)} inline-flex px-2 py-1 rounded-full font-bold shadow-sm w-full max-w-full`}>
                                                        <span className="truncate">{item.priority.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 overflow-hidden">
                                                <div className="text-sm text-gray-900 font-bold truncate">{item.recommendedOrder.toLocaleString()} units</div>
                                                <div className="text-xs text-gray-500 font-semibold truncate">{formatCurrency(item.recommendedOrder * item.unitPrice)}</div>
                                            </td>
                                            <td className="px-6 py-5 overflow-hidden">
                                                <div className="text-sm text-gray-900 font-semibold truncate">{item.supplier}</div>
                                                <div className="text-xs text-gray-500 font-medium truncate">{formatCurrency(item.unitPrice)}/unit</div>
                                            </td>
                                            <td className="px-6 py-5 overflow-hidden text-right text-sm font-medium">
                                                <div className="flex justify-end">
                                                    {renderActionButtons(item)}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Dynamic Calculations Info */}
            <div className="mt-10 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-sm">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-base font-bold text-green-900 mb-2">Dynamic AI Forecasting Active</h3>
                        <p className="text-sm text-green-700 leading-relaxed">
                            All values are calculated dynamically using AI algorithms based on historical sales data, seasonal patterns, and current inventory levels.
                            Data refreshes automatically every 30 seconds or click "Refresh Data" for immediate updates.
                        </p>
                    </div>
                </div>
            </div>

            {/* Email Demo Info */}
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-blue-600 text-lg font-bold">📧</span>
                        </div>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-base font-bold text-blue-900 mb-2">Email Notification System Active</h3>
                        <p className="text-sm text-blue-700 leading-relaxed">
                            Purchase orders trigger automated email notifications to approvers. Check browser console for detailed email logs and notification bell for real-time updates.
                        </p>
                    </div>
                </div>
            </div>

            {/* Demo Presentation Helper */}
            <DemoPresentationHelper
                isVisible={isDemoHelperVisible}
                onToggle={() => setIsDemoHelperVisible(!isDemoHelperVisible)}
            />
        </>
    );
};

export default DemandForecasting;