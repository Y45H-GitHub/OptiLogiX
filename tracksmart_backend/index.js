// // index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
// const { initializeDatabase, query } = require('./db/database');

const app = express();
app.use(express.json());
app.use(cors());

const becknRoutes = require('./routes/becknRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
app.use('/beckn', becknRoutes);
app.use('/api/logistics', logisticsRoutes);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

app.post('/search', async (req, res) => {
  try {
    const payload = {
      context: {
        domain: 'retail',
        action: 'search',
        city: 'std:080',
        core_version: '1.1.0',
        transaction_id: 'txn-' + Date.now(),
        message_id: 'msg-' + Date.now(),
        timestamp: new Date().toISOString(),
        bap_id: 'dev.bap.faiz.protocol-server.com.dsep:jobs.BAP',
        bap_uri: 'http://localhost:5003' // protocol-server URI
      },
      message: {
        intent: {
          provider: {},
          item: {}
        }
      }
    };

    const becknResponse = await axios.post('http://localhost:5003/search', payload);
    res.status(200).json(becknResponse.data);
  } catch (err) {
    console.error('Error sending to Beckn:', err.message);
    res.status(500).send('Failed to send search request');
  }
});

app.post('/beckn/webhook', (req, res) => {
  const event = req.body;
  console.log('📥 Received Beckn callback:', event);

  if (event.context?.action === 'on_search') {
    console.log('🧾 Search result:', JSON.stringify(event.message.catalog, null, 2));
  }

  res.sendStatus(200);
});
