import React, { useEffect, useState, useRef } from 'react';
import { fetchLogisticsData } from '../api/LogisticsAPI';

interface LogisticsItem {
  id: string;
  name: string;
  description: string;
  price: number;
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import useGoogleMaps from '../hooks/useGoogleMaps';

const LogisticsPage: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Use environment variable
  const defaultMapOptions = {
    center: { lat: 34.052235, lng: -118.243683 }, // Default to Los Angeles
    zoom: 10,
  };
  const defaultMarkerOptions = {
    position: { lat: 34.052235, lng: -118.243683 },
  };

  const { mapRef } = useGoogleMaps(apiKey, defaultMapOptions, defaultMarkerOptions);
  const [logisticsData, setLogisticsData] = useState<LogisticsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<string>('');
interface OrderDetails {
  id: string;
  status: string;
  travelCompany: string;
  deliveryId: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  items: string[];
}

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const getLogisticsData = async () => {
      try {
        const data = await fetchLogisticsData();
        setLogisticsData(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    getLogisticsData();
  }, []);

  const handleCheckOrder = () => {
    console.log(`Checking order: ${orderId}`);
    // Simulate fetching order details
    if (orderId === '12345') {
      setOrderDetails({
        id: '12345',
        status: 'In Transit',
        travelCompany: 'Global Express',
        deliveryId: 'GE-987654321',
        origin: 'New York, USA',
        destination: 'Los Angeles, USA',
        estimatedDelivery: '2024-07-20',
        items: ['Package A', 'Package B'],
      });
      setOrderStatus(`Order ${orderId}: Details fetched successfully.`);
    } else {
      setOrderDetails(null);
      setOrderStatus(`Order ${orderId}: Not found or invalid ID.`);
    }
  };

  const handleTrackOrder = () => {
    console.log(`Tracking order: ${orderId}`);
    // Implement actual track order logic here
    setOrderStatus(`Tracking for ${orderId}: Out for delivery.`);
  };

  const handleCancelOrder = () => {
    console.log(`Cancelling order: ${orderId}`);
    // Implement actual cancel order logic here
    setOrderStatus(`Cancellation for ${orderId}: Order cancelled.`);
  };

  const handleUpdateOrder = () => {
    console.log(`Updating order ${orderId} to status: ${orderStatus}`);
    // Implement actual update order logic here
    setOrderStatus(`Order ${orderId} updated to: ${orderStatus}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Logistics Dashboard</h1>
      <Tabs defaultValue="check-order" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="check-order">Check Order</TabsTrigger>
          <TabsTrigger value="track-order">Track Order</TabsTrigger>
          <TabsTrigger value="cancel-order">Cancel Order</TabsTrigger>
          <TabsTrigger value="update-order">Update Order</TabsTrigger>
        </TabsList>
        <TabsContent value="check-order" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-semibold mb-4">Check Order Status</h2>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="orderIdCheck">Order ID</Label>
            <Input type="text" id="orderIdCheck" placeholder="Enter Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </div>
          <Button onClick={handleCheckOrder} className="mt-4">Check Status</Button>
          {orderStatus && <p className="mt-4 text-green-600">{orderStatus}</p>}
          {orderDetails && (
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <h3 className="text-xl font-semibold mb-2">Order Details for {orderDetails.id}</h3>
              <p><strong>Status:</strong> {orderDetails.status}</p>
              <p><strong>Travel Company:</strong> {orderDetails.travelCompany}</p>
              <p><strong>Delivery ID:</strong> {orderDetails.deliveryId}</p>
              <p><strong>Origin:</strong> {orderDetails.origin}</p>
              <p><strong>Destination:</strong> {orderDetails.destination}</p>
              <p><strong>Estimated Delivery:</strong> {orderDetails.estimatedDelivery}</p>
              <p><strong>Items:</strong> {orderDetails.items.join(', ')}</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="track-order" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-semibold mb-4">Track Order</h2>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="orderIdTrack">Order ID</Label>
            <Input type="text" id="orderIdTrack" placeholder="Enter Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </div>
          <Button onClick={handleTrackOrder} className="mt-4">Track Order</Button>
          {orderStatus && <p className="mt-4 text-blue-600">{orderStatus}</p>}
          <div ref={mapRef} style={{ width: '100%', height: '400px', marginTop: '20px' }} />
          <p className="mt-4 text-sm text-gray-500">Map will display live location here.</p>
        </TabsContent>
        <TabsContent value="cancel-order" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-semibold mb-4">Cancel Order</h2>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="orderIdCancel">Order ID</Label>
            <Input type="text" id="orderIdCancel" placeholder="Enter Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </div>
          <Button onClick={handleCancelOrder} className="mt-4">Cancel Order</Button>
          {orderStatus && <p className="mt-4 text-red-600">{orderStatus}</p>}
        </TabsContent>
        <TabsContent value="update-order" className="p-4 border rounded-md mt-4">
          <h2 className="text-2xl font-semibold mb-4">Update Order Status</h2>
          <div className="grid w-full max-w-sm items-center gap-1.5 mb-4">
            <Label htmlFor="orderIdUpdate">Order ID</Label>
            <Input type="text" id="orderIdUpdate" placeholder="Enter Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="newStatus">New Status</Label>
            <Input type="text" id="newStatus" placeholder="Enter New Status" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} />
          </div>
          <Button onClick={handleUpdateOrder} className="mt-4">Update Status</Button>
          {orderStatus && <p className="mt-4 text-purple-600">{orderStatus}</p>}
        </TabsContent>
      </Tabs>

      {/* Original logistics data display, can be moved or removed as needed */}
      {!loading && !error && logisticsData.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-3">Fetched Logistics Data:</h2>
          <ul className="list-disc pl-5">
            {logisticsData.map((item: LogisticsItem) => (
              <li key={item.id} className="mb-2">
                <strong>{item.name}</strong>: {item.description} (Price: ${item.price})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LogisticsPage;