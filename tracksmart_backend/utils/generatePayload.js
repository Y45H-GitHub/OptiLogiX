// backend/utils/generatePayload.js
require('dotenv').config();

function buildSearchPayload(query) {
  const timestamp = new Date().toISOString();
  const transactionId = `txn-${Date.now()}`;
  const messageId = `msg-${Date.now()}`;

  return {
    context: {
      domain: 'retail',
      action: 'search',
      version: '1.1.0',
      city: 'std:080',
      country: 'IND',
      core_version: '1.1.0',
      transaction_id: transactionId,
      message_id: messageId,
      timestamp: timestamp,
      bap_id: process.env.BAP_ID,
      bap_uri: process.env.BAP_URI
    },
    message: {
      intent: {
        item: {
          descriptor: {
            name: query || 'default item'
          }
        }
      }
    }
  };
}

function buildOnSearchPayload(customData) {
  const timestamp = new Date().toISOString();
  const transactionId = `txn-${Date.now()}`;
  const messageId = `msg-${Date.now()}`;

  return {
    context: {
      domain: 'retail',
      action: 'on_search',
      version: '1.1.0',
      city: 'std:080',
      country: 'IND',
      core_version: '1.1.0',
      transaction_id: transactionId,
      message_id: messageId,
      timestamp: timestamp,
      bpp_id: process.env.BPP_ID,
      bpp_uri: process.env.BPP_URI
    },
    message: {
      catalog: {
        custom_bpp_data: customData
      }
    }
  };
}

module.exports = { buildSearchPayload, buildOnSearchPayload };
