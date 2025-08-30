const { Client } = require('pg');
require('dotenv').config();

// Create a new PostgreSQL client instance
const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch((err) => {
    console.error('Connection error', err.stack);
  });

// Export the client instance for usage in other parts of the app
module.exports = client;
