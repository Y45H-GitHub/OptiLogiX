import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Package, Truck, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InventoryRequest, SurplusInventoryItem } from '@/types/surplusNetwork';
import { surplusNetworkService } from '@/services/surplusNetworkService';

interface RequestWithItem extends InventoryRequest {
    item?: SurplusInventoryItem;
}

interface RequestStatusTrackerProps {
    onRequestUpdate?: (request: InventoryRequest) => void;
}

const RequestStatusTracker: React.FC<RequestStatusTrackerProps> = ({ onRequestUpdate }) => {
    const [requests, setRequests] = useState<RequestWithItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const requestsData = await surplusNetworkService.getInventoryRequests();
            const inventoryData = await surplusNetworkService.getSurplusInventory();

            // Enrich requests with item details
            const enrichedRequests = requestsData.map(request => ({
                ...request,
                item: inventoryData.find(item => item.id === request.surplusItemId)
            }));

            setRequests(enrichedRequests);
        } catch (error) {
            console.error('Error loading requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: InventoryRequest['status']) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'accepted':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'completed':
                return <Package className="w-5 h-5 text-blue-500" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusBadgeColor = (status: InventoryRequest['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'completed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getUrgencyBadgeColor = (urgency: InventoryRequest['urgencyLevel']) => {
        switch (urgency) {
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const getStatusProgress = (status: InventoryRequest['status']) => {
        switch (status) {
            case 'pending':
                return 25;
            case 'accepted':
                return 75;
            case 'completed':
                return 100;
            case 'rejected':
                return 100;
            default:
                return 0;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600">
                    Your inventory requests will appear here once you submit them.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                    <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Request Status Tracker</h2>
                    <p className="text-gray-600">Track your inventory requests and their progress</p>
                </div>
            </div>

            <div className="grid gap-6">
                {requests.map((request) => (
                    <Card key={request.id} className="bg-white/90 backdrop-blur-md border-2 border-emerald-200 shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(request.status)}
                                    <div>
                                        <CardTitle className="text-lg text-gray-800">
                                            {request.item?.productName || 'Unknown Item'}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600">
                                            Request ID: {request.id}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge className={`text-xs ${getUrgencyBadgeColor(request.urgencyLevel)}`}>
                                        {request.urgencyLevel.toUpperCase()}
                                    </Badge>
                                    <Badge className={`text-xs ${getStatusBadgeColor(request.status)}`}>
                                        {request.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Progress</span>
                                    <span>{getStatusProgress(request.status)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getStatusProgress(request.status)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm">
                                        <Package className="w-4 h-4 mr-2 text-emerald-500" />
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="ml-2 font-medium">{request.requestedQuantity} units</span>
                                    </div>

                                    {request.item && (
                                        <div className="flex items-center text-sm">
                                            <span className="text-gray-600">Unit Price:</span>
                                            <span className="ml-2 font-medium">{formatPrice(request.item.unitPrice)}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center text-sm">
                                        <Clock className="w-4 h-4 mr-2 text-emerald-500" />
                                        <span className="text-gray-600">Requested:</span>
                                        <span className="ml-2 font-medium">{formatDate(request.createdAt)}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {request.item && (
                                        <div className="flex items-center text-sm">
                                            <span className="text-gray-600">SKU:</span>
                                            <span className="ml-2 font-medium">{request.item.sku}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center text-sm">
                                        <Truck className="w-4 h-4 mr-2 text-emerald-500" />
                                        <span className="text-gray-600">Delivery:</span>
                                        <span className="ml-2 font-medium">{request.deliveryPreference}</span>
                                    </div>

                                    {request.item && (
                                        <div className="flex items-center text-sm">
                                            <span className="text-gray-600">Total Cost:</span>
                                            <span className="ml-2 font-bold text-emerald-600">
                                                {formatPrice(request.requestedQuantity * request.item.unitPrice)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            {request.notes && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Notes:</span> {request.notes}
                                    </p>
                                </div>
                            )}

                            {/* Status Timeline */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Status Timeline</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">
                                            Request submitted - {formatDate(request.createdAt)}
                                        </span>
                                    </div>

                                    {request.status !== 'pending' && (
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-2 h-2 rounded-full ${request.status === 'accepted' ? 'bg-green-500' :
                                                    request.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                                                }`}></div>
                                            <span className="text-sm text-gray-600">
                                                Request {request.status} - {formatDate(request.updatedAt)}
                                            </span>
                                        </div>
                                    )}

                                    {request.status === 'completed' && (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            <span className="text-sm text-gray-600">
                                                Transfer completed - {formatDate(request.updatedAt)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {request.status === 'pending' && (
                                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            // In a real app, this would cancel the request
                                            console.log('Cancel request:', request.id);
                                        }}
                                    >
                                        Cancel Request
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default RequestStatusTracker;