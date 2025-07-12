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

module.exports = router;
