require('dotenv').config();
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const axios = require('axios');

// Load keys
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH, 'utf8');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('BAP is running!');
});

app.get('/fetch-item/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bppResponse = await axios.get(`http://localhost:3002/items/${id}`);
    res.json(bppResponse.data);
  } catch (error) {
    console.error('Error fetching item from BPP:', error.message);
    res.status(500).send('Failed to fetch item from BPP');
  }
});

app.get('/fetch-item-by-name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const bppResponse = await axios.get(`http://localhost:3002/items/by-name/${encodeURIComponent(name)}`);
    res.json(bppResponse.data);
  } catch (error) {
    console.error('Error fetching item from BPP by name:', error.message);
    res.status(500).send('Failed to fetch item from BPP by name');
  }
});

app.listen(PORT, () => {
  console.log(`BAP listening on port ${PORT}`);
});