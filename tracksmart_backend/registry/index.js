require('dotenv').config();
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Load keys
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH, 'utf8');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Registry is running!');
});

app.post('/lookup', (req, res) => {
  console.log('Registry lookup request received:', req.body);
  // Mock response for a BAP subscriber
  const mockSubscriber = {
    "subscriber_id": "dev.bap.faiz.protocol-server.com.dsep:jobs.BAP",
    "subscriber_url": "http://localhost:5003",
    "type": "BAP",
    "domain": "retail",
    "city": "std:080",
    "country": "IND",
    "status": "SUBSCRIBED",
    "valid_from": "2023-01-01T00:00:00.000Z",
    "valid_until": "2025-12-31T23:59:59.000Z",
    "ukId": "dev.bap.faiz.protocol-server.key",
    "signing_public_key": publicKey,
    "enc_public_key": publicKey
  };
  res.json([mockSubscriber]);
});

app.listen(PORT, () => {
  console.log(`Registry listening on port ${PORT}`);
});