// backend/services/becknService.js
const axios = require('axios');
const { buildSearchPayload, buildOnSearchPayload } = require('../utils/generatePayload');
const BECKN_URL = process.env.BECKN_BASE_URL || 'http://localhost:5000';

async function sendSearchRequest(query) {
  const payload = buildSearchPayload(query);

  const response = await axios.post(`${BECKN_URL}/search`, payload);
  console.log('✅ Search request sent to Beckn');
  return response.data;
}

async function sendOnSearchRequest(customData) {
  const payload = buildOnSearchPayload(customData);
  try {
    const response = await axios.post(`${BECKN_URL}/on_search`, payload);
    console.log('✅ On-Search response sent to Beckn');
    return response.data;
  } catch (error) {
    console.error('❌ Error sending On-Search response to Beckn:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error; // Re-throw the error so the calling function can handle it
  }
  return response.data;
}

module.exports = { sendSearchRequest, sendOnSearchRequest };
