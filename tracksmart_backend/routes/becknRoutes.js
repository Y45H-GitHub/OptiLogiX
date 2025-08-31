// backend/routes/becknRoutes.js
const express = require('express');
const router = express.Router();
const { sendSearchRequest, sendOnSearchRequest } = require('../services/becknService');

router.post('/buy', async (req, res) => {
  try {
    const data = await sendSearchRequest(req.body.query);
    res.json(data);
  } catch (err) {
    console.error('[ERROR /buy]', err.message);
    res.status(500).json({ error: 'Failed to search item via Beckn' });
  }
});

router.post('/beckn/webhook', (req, res) => {
  const event = req.body;

  console.log(`[Callback Received] Action: ${event.context.action}`);
  console.dir(event.message, { depth: null });

  // TODO: Save to DB or push to frontend via WebSocket
  res.sendStatus(200);
});

router.post('/on_search', async (req, res) => {
  try {
    const data = await sendOnSearchRequest(req.body.custom_data);
    res.json(data);
  } catch (err) {
    console.error('[ERROR /on_search]', err.message);
    res.status(500).json({ error: 'Failed to send on_search response to Beckn' });
  }
});

// BECKN Order Tracking endpoint
router.get('/track/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    // Mock BECKN tracking response data for demo purposes
    const mockBecknTrackingData = {
      orderId: orderId,
      becknTransactionId: `beckn_txn_${orderId}_${Date.now()}`,
      status: 'in_transit',
      deliveryPartner: {
        id: 'dp_001',
        name: 'Rajesh Kumar',
        phone: '+91-9876543210',
        email: 'rajesh.kumar@delivery.com',
        rating: 4.8,
        vehicle: {
          type: 'motorcycle',
          number: 'KA-01-AB-1234',
          model: 'Honda Activa'
        },
        photo: 'https://example.com/photos/rajesh.jpg'
      },
      currentLocation: {
        latitude: 12.9716 + (Math.random() - 0.5) * 0.01,
        longitude: 77.5946 + (Math.random() - 0.5) * 0.01,
        address: 'Near Koramangala 5th Block, Bangalore',
        timestamp: new Date().toISOString(),
        accuracy: 10
      },
      estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes from now
      trackingHistory: [
        {
          status: 'order_placed',
          timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
          location: 'Restaurant: Spice Garden',
          description: 'Order confirmed and being prepared'
        },
        {
          status: 'picked_up',
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
          location: 'Restaurant: Spice Garden',
          description: 'Order picked up by delivery partner'
        },
        {
          status: 'in_transit',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          location: 'En route to delivery address',
          description: 'Order is on the way to your location'
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    console.log(`[BECKN TRACKING] Order ${orderId} tracked successfully`);
    res.json({
      success: true,
      data: mockBecknTrackingData
    });

  } catch (err) {
    console.error('[ERROR /track]', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to track order via BECKN',
      fallback: true
    });
  }
});

module.exports = router;
