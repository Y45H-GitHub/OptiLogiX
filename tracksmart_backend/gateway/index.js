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
  res.send('Gateway is running!');
});

app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});