import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Order, OrderStats, OrderStatus, BecknTrackingData } from '@/types/logistics';
import { logisticsService } from '@/services/logisticsService';
import { becknTrackingService } from '@/services/becknTrackingService';
import { useLogisticsMap } from '../hooks/useLogisticsMap';
import BecknDeliveryPartnerCard from '@/components/BecknDeliveryPartnerCard';
import BecknDemoToggle from '@/components/BecknDemoToggle';
import BecknLiveIndicator from '@/components/BecknLiveIndicator';

const LogisticsPage: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // BECKN tracking state
  const [becknTrackingData, setBecknTrackingData] = useState<BecknTrackingData | null>(null);
  const [becknLoading, setBecknLoading] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus[]>([]);

  // Form states
  const [orderId, setOrderId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Map integration
  const { mapRef, isMapReady } = useLogisticsMap({
    apiKey,
    order: selectedOrder,
    becknTrackingData
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [ordersData, statsData, cancelledData] = await Promise.all([
          logisticsService.getOrders(),
          logisticsService.getOrderStats(),
          logisticsService.getCancelledOrdersForApproval()
        ]);

        setOrders(ordersData);
        setFilteredOrders(ordersData);
        setOrderStats(statsData);
        setCancelledOrders(cancelledData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      if (selectedOrder) {
        becknTrackingService.unsubscribeFromUpdates(selectedOrder.id);
      }
    };
  }, [selectedOrder]);

  // Apply filters
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...orders];

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(order =>
          order.id.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.deliveryId.toLowerCase().includes(searchLower)
        );
      }

      if (statusFilter.length > 0) {
        filtered = filtered.filter(order => statusFilter.includes(order.status));
      }

      setFilteredOrders(filtered);
    };

    applyFilters();
  }, [orders, searchTerm, statusFilter]);

  // Utility functions
  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      in_transit: 'bg-orange-100 text-orange-800',
      out_for_delivery: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Event handlers
  const handleCheckOrder = async () => {
    if (!orderId.trim()) return;

    try {
      setBecknLoading(true);
      const order = await logisticsService.getOrderById(orderId);

      if (order) {
        setSelectedOrder(order);
        setError(null);

        // Try to fetch BECKN tracking data
        try {
          const becknData = await becknTrackingService.trackOrder(orderId);
          setBecknTrackingData(becknData);

          // Subscribe to real-time updates if BECKN data is available
          if (becknData) {
            becknTrackingService.subscribeToUpdates(orderId, (updatedData) => {
              setBecknTrackingData(updatedData);
            });
          }
        } catch (becknError) {
          console.warn('BECKN tracking unavailable:', becknError);
          setBecknTrackingData(null);
        }
      } else {
        setError(`Order ${orderId} not found`);
        setSelectedOrder(null);
        setBecknTrackingData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching order');
      setBecknTrackingData(null);
    } finally {
      setBecknLoading(false);
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!orderId.trim()) return;

    try {
      const updatedOrder = await logisticsService.updateOrderStatus(orderId, newStatus);
      if (updatedOrder) {
        // Refresh orders list
        const updatedOrders = await logisticsService.getOrders();
        setOrders(updatedOrders);
        setError(null);
        alert(`Order ${orderId} status updated to ${newStatus}`);
      } else {
        setError(`Order ${orderId} not found`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating order');
    }
  };

  const handleApproveCancellation = async (orderIdToApprove: string) => {
    try {
      await logisticsService.approveCancellation(orderIdToApprove);

      // Refresh data
      const [updatedOrders, updatedCancelled] = await Promise.all([
        logisticsService.getOrders(),
        logisticsService.getCancelledOrdersForApproval()
      ]);

      setOrders(updatedOrders);
      setCancelledOrders(updatedCancelled);
      alert(`Cancellation approved for order ${orderIdToApprove}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error approving cancellation');
    }
  };

  const handleRejectCancellation = async (orderIdToReject: string) => {
    try {
      await logisticsService.rejectCancellation(orderIdToReject, rejectionReason);

      // Refresh data
      const [updatedOrders, updatedCancelled] = await Promise.all([
        logisticsService.getOrders(),
        logisticsService.getCancelledOrdersForApproval()
      ]);

      setOrders(updatedOrders);
      setCancelledOrders(updatedCancelled);
      setRejectionReason('');
      alert(`Cancellation rejected for order ${orderIdToReject}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting cancellation');
    }
  };

  const showOrderOnMap = (order: Order) => {
    setSelectedOrder(order);
    // The map will be updated in the Track Order tab
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading logistics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logistics Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage orders, track shipments, and monitor logistics operations</p>
        </div>
      </div>

      {/* BECKN Demo Toggle */}
      <div className="mb-6">
        <BecknDemoToggle
          onToggle={(demoMode) => {
            setIsDemoMode(demoMode);
            // Clear current tracking data when toggling modes
            setBecknTrackingData(null);
            setSelectedOrder(null);
          }}
        />
      </div>

      {/* Stats Cards */}
      {orderStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold">{orderStats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">In Transit</p>
                  <p className="text-xl font-bold">{orderStats.inTransitOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-xl font-bold">{orderStats.deliveredOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">On-Time Rate</p>
                  <p className="text-xl font-bold">{orderStats.onTimeDeliveryRate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="order-history" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="order-history">Order History</TabsTrigger>
          <TabsTrigger value="check-order">Check Order</TabsTrigger>
          <TabsTrigger value="track-order">Track Order</TabsTrigger>
          <TabsTrigger value="update-order">Update Status</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals
            {cancelledOrders.length > 0 && (
              <Badge className="ml-2 bg-red-100 text-red-800">{cancelledOrders.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Order History Tab */}
        <TabsContent value="order-history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Order History
              </CardTitle>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>

                <Select value={statusFilter.join(',')} onValueChange={(value) => setStatusFilter(value && value !== 'all' ? value.split(',') as OrderStatus[] : [])}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{order.id}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => showOrderOnMap(order)}
                        >
                          <MapPin className="w-4 h-4 mr-1" />
                          Track
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-medium">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Order Date</p>
                        <p className="font-medium">{formatDate(order.orderDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Amount</p>
                        <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="mt-3 text-sm">
                      <p className="text-gray-600">Items: {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}</p>
                      <p className="text-gray-600">Route: {order.origin.city}, {order.origin.state} → {order.destination.city}, {order.destination.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Check Order Tab */}
        <TabsContent value="check-order" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Check Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="orderIdCheck">Order ID</Label>
                    <Input
                      id="orderIdCheck"
                      placeholder="Enter Order ID (e.g., ORD-001)"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleCheckOrder}>
                      <Search className="w-4 h-4 mr-2" />
                      Check Status
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                {selectedOrder && (
                  <div className="border rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">{selectedOrder.id}</h3>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-medium">{selectedOrder.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Travel Company</p>
                          <p className="font-medium">{selectedOrder.travelCompany}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Delivery ID</p>
                          <p className="font-medium">{selectedOrder.deliveryId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Priority</p>
                          <Badge className={getPriorityColor(selectedOrder.priority)}>
                            {selectedOrder.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Order Date</p>
                          <p className="font-medium">{formatDate(selectedOrder.orderDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estimated Delivery</p>
                          <p className="font-medium">{formatDate(selectedOrder.estimatedDelivery)}</p>
                        </div>
                        {selectedOrder.actualDelivery && (
                          <div>
                            <p className="text-sm text-gray-600">Actual Delivery</p>
                            <p className="font-medium">{formatDate(selectedOrder.actualDelivery)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-medium">${selectedOrder.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Items</h4>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded">
                            <span>{item.name} × {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Route</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{selectedOrder.origin.city}, {selectedOrder.origin.state}</span>
                        <span>→</span>
                        <span>{selectedOrder.destination.city}, {selectedOrder.destination.state}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Track Order Tab */}
        <TabsContent value="track-order" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Track Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="orderIdTrack">Order ID</Label>
                    <Input
                      id="orderIdTrack"
                      placeholder="Enter Order ID to track"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleCheckOrder} disabled={becknLoading}>
                      <Truck className="w-4 h-4 mr-2" />
                      {becknLoading ? 'Tracking...' : 'Track Order'}
                    </Button>
                  </div>
                </div>

                {selectedOrder && (
                  <div className="space-y-6">
                    {/* Order Tracking Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold">Order Tracking</h2>
                    </div>

                    {/* BECKN Live Indicator */}
                    {becknTrackingData && (
                      <BecknLiveIndicator
                        becknData={becknTrackingData}
                        variant="banner"
                        className="mb-6"
                      />
                    )}

                    {/* BECKN Delivery Partner Card */}
                    {becknTrackingData?.deliveryPartner ? (
                      <BecknDeliveryPartnerCard
                        deliveryPartner={becknTrackingData.deliveryPartner}
                        className="max-w-md"
                      />
                    ) : becknTrackingData && (
                      <Card className="max-w-md bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Truck className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-blue-900">BECKN Tracking Active</p>
                              <p className="text-sm text-blue-700">Delivery partner will be assigned soon</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">Live</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* BECKN Live Tracking Panel */}
                    {becknTrackingData && (
                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-900">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <Truck className="w-4 h-4 text-blue-600" />
                            </div>
                            Live BECKN Tracking
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Current Status */}
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-gray-900">Current Status</span>
                              </div>
                              <p className="text-lg font-semibold text-blue-700 capitalize">
                                {becknTrackingData.status ? becknTrackingData.status.replace('_', ' ') : 'Unknown'}
                              </p>
                            </div>

                            {/* Estimated Delivery */}
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-gray-900">Estimated Delivery</span>
                              </div>
                              <p className="text-lg font-semibold text-green-700">
                                {formatDate(becknTrackingData.estimatedDelivery)}
                              </p>
                            </div>

                            {/* Current Location */}
                            {becknTrackingData.currentLocation && (
                              <div className="bg-white rounded-lg p-4 border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="w-4 h-4 text-orange-600" />
                                  <span className="font-medium text-gray-900">Current Location</span>
                                </div>
                                <p className="text-sm text-gray-700">
                                  {becknTrackingData.currentLocation.address}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Updated: {formatDate(becknTrackingData.currentLocation.timestamp)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* BECKN Tracking History */}
                          {becknTrackingData.trackingHistory && becknTrackingData.trackingHistory.length > 0 && (
                            <div className="bg-white rounded-lg p-4 border border-blue-100">
                              <h4 className="font-medium text-gray-900 mb-3">BECKN Tracking Events</h4>
                              <div className="space-y-3">
                                {becknTrackingData.trackingHistory.slice(-3).reverse().map((event, index) => (
                                  <div key={event.id} className="flex items-start gap-3">
                                    <div className={`w-2 h-2 rounded-full mt-2 ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{event.description}</p>
                                      <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                                      {event.location && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          📍 {event.location.address}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Transit Timeline */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">Transit Timeline</h3>
                          {!becknTrackingData && (
                            <Badge variant="outline" className="text-gray-600">
                              Standard Tracking
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-4">
                          {/* Origin */}
                          <div className="flex items-start gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                            <div>
                              <p className="font-medium">Origin</p>
                              <p className="text-sm text-gray-600">
                                {selectedOrder.origin.address}, {selectedOrder.origin.city}
                              </p>
                              <p className="text-xs text-gray-500">{formatDate(selectedOrder.orderDate)}</p>
                            </div>
                          </div>

                          {/* Transit Hops */}
                          {selectedOrder.transitHops.map((hop, index) => (
                            <div key={hop.id} className="flex items-start gap-3">
                              <div className={`w-3 h-3 rounded-full mt-2 ${hop.status === 'departed' ? 'bg-green-500' :
                                hop.status === 'arrived' ? 'bg-blue-500' :
                                  hop.status === 'delayed' ? 'bg-red-500' :
                                    'bg-gray-300'
                                }`}></div>
                              <div>
                                <p className="font-medium">Transit Hub {index + 1}</p>
                                <p className="text-sm text-gray-600">
                                  {hop.location.address}, {hop.location.city}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Arrived: {formatDate(hop.arrivalTime)}
                                  {hop.departureTime && ` • Departed: ${formatDate(hop.departureTime)}`}
                                </p>
                                <Badge className={`text-xs ${hop.status === 'departed' ? 'bg-green-100 text-green-800' :
                                  hop.status === 'arrived' ? 'bg-blue-100 text-blue-800' :
                                    hop.status === 'delayed' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                  }`}>
                                  {hop.status}
                                </Badge>
                              </div>
                            </div>
                          ))}

                          {/* Destination */}
                          <div className="flex items-start gap-3">
                            <div className={`w-3 h-3 rounded-full mt-2 ${selectedOrder.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                            <div>
                              <p className="font-medium">Destination</p>
                              <p className="text-sm text-gray-600">
                                {selectedOrder.destination.address}, {selectedOrder.destination.city}
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedOrder.actualDelivery
                                  ? `Delivered: ${formatDate(selectedOrder.actualDelivery)}`
                                  : becknTrackingData?.estimatedDelivery
                                    ? `BECKN ETA: ${formatDate(becknTrackingData.estimatedDelivery)}`
                                    : `Expected: ${formatDate(selectedOrder.estimatedDelivery)}`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Real-time Location Tracking Panel */}
                      {becknTrackingData?.currentLocation && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <h4 className="font-semibold text-blue-900">Real-time Vehicle Tracking</h4>
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                🚚 BECKN Live
                              </Badge>
                            </div>
                            <div className="text-xs text-blue-700">
                              Updated: {new Date(becknTrackingData.currentLocation.timestamp).toLocaleTimeString()}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-3 border border-blue-100">
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-medium text-gray-900">Current Location</span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {becknTrackingData.currentLocation.address || 'Live position'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Lat: {becknTrackingData.currentLocation.latitude.toFixed(4)},
                                Lng: {becknTrackingData.currentLocation.longitude.toFixed(4)}
                              </p>
                            </div>

                            {becknTrackingData.deliveryPartner && (
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <Truck className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-900">Vehicle Info</span>
                                </div>
                                <p className="text-sm text-gray-700">
                                  {becknTrackingData.deliveryPartner.vehicle.type} - {becknTrackingData.deliveryPartner.vehicle.number}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Driver: {becknTrackingData.deliveryPartner.name}
                                </p>
                              </div>
                            )}

                            <div className="bg-white rounded-lg p-3 border border-blue-100">
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-gray-900">ETA</span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {formatDate(becknTrackingData.estimatedDelivery)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Status: {becknTrackingData.status.replace('_', ' ')}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded px-2 py-1 inline-block">
                            💡 Blue vehicle marker on map shows live location with automatic updates
                          </div>
                        </div>
                      )}

                      {/* Map */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold">Route Map</h3>
                          <div className="flex items-center gap-2">
                            {becknTrackingData?.currentLocation && (
                              <Badge className="bg-orange-100 text-orange-800 animate-pulse">
                                🔴 Live Location
                              </Badge>
                            )}
                            {becknTrackingData && (
                              <Badge className="bg-green-100 text-green-800">
                                BECKN Enabled
                              </Badge>
                            )}
                          </div>
                        </div>


                        <div className="relative w-full h-96 border rounded-lg" style={{ minHeight: '400px' }}>
                          <div
                            ref={mapRef}
                            className="w-full h-full rounded-lg"
                          />
                          {/* Loading overlay */}
                          {!isMapReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-gray-600">Loading map...</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {selectedOrder ? `Tracking ${selectedOrder.id}` : 'Initializing Google Maps'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-2 space-y-1">
                          <p>Map shows route from {selectedOrder.origin.city} to {selectedOrder.destination.city}</p>
                          {becknTrackingData?.currentLocation && (
                            <div className="flex items-center gap-2 text-blue-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="font-medium">
                                Blue animated marker shows live delivery vehicle location
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Origin
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Transit Hubs
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Destination
                            </span>
                            {becknTrackingData?.currentLocation && (
                              <span className="flex items-center gap-1 text-blue-600 font-medium">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                Live Vehicle
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Update Order Tab */}
        <TabsContent value="update-order" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Update Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orderIdUpdate">Order ID</Label>
                    <Input
                      id="orderIdUpdate"
                      placeholder="Enter Order ID"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newStatus">New Status</Label>
                    <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={handleUpdateOrderStatus} className="w-full">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Update Status
                </Button>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Cancellation Approvals
                {cancelledOrders.length > 0 && (
                  <Badge className="bg-red-100 text-red-800">{cancelledOrders.length} pending</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cancelledOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No pending cancellations</p>
                  <p className="text-sm">All cancellation requests have been processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cancelledOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{order.id}</h3>
                          <Badge className="bg-red-100 text-red-800">Cancellation Pending</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(order.cancellationDate!)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-medium">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Order Amount</p>
                          <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Cancellation Reason</p>
                        <p className="font-medium">{order.cancellationReason}</p>
                        {order.notes && (
                          <p className="text-sm text-gray-500 mt-1">{order.notes}</p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApproveCancellation(order.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>

                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Rejection reason (optional)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-64 h-10"
                          />
                          <Button
                            onClick={() => handleRejectCancellation(order.id)}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogisticsPage;