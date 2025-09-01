const express = require("express");
const Razorpay = require("razorpay");
const PaytmChecksum = require("paytmchecksum");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config(); // <-- Load .env variables

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize Razorpay instance with env variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Paytm configuration
const paytmConfig = {
  MID: process.env.PAYTM_MID,
  WEBSITE: process.env.PAYTM_WEBSITE,
  INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE,
  CHANNEL_ID: "WEB",
  CALLBACK_URL: process.env.PAYTM_CALLBACK_URL,
};

// API to create an order
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating order");
  }
});

// API to verify payment
app.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ success: true, message: "Payment verified successfully" });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
});

// ============ PAYTM PAYMENT GATEWAY ROUTES ============

// API to initiate Paytm payment
app.post("/paytm/initiate", async (req, res) => {
  try {
    const { amount, customerId, orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!customerId || !orderId) {
      return res.status(400).json({ error: "Customer ID and Order ID are required" });
    }

    const paytmParams = {
      MID: paytmConfig.MID,
      WEBSITE: paytmConfig.WEBSITE,
      INDUSTRY_TYPE_ID: paytmConfig.INDUSTRY_TYPE_ID,
      CHANNEL_ID: paytmConfig.CHANNEL_ID,
      ORDER_ID: orderId,
      CUST_ID: customerId,
      TXN_AMOUNT: amount.toString(),
      CALLBACK_URL: paytmConfig.CALLBACK_URL,
    };

    // Generate checksum
    const checksum = await PaytmChecksum.generateSignature(paytmParams, process.env.PAYTM_KEY);

    const response = {
      ...paytmParams,
      CHECKSUMHASH: checksum,
      paytmUrl: "https://securegw-stage.paytm.in/order/process" // Use staging URL for testing
    };

    res.json(response);
  } catch (error) {
    console.error("Paytm initiation error:", error);
    res.status(500).json({ error: "Error initiating Paytm payment" });
  }
});

// API to handle Paytm callback
app.post("/paytm/callback", async (req, res) => {
  try {
    const paytmChecksum = req.body.CHECKSUMHASH;
    delete req.body.CHECKSUMHASH;

    const isVerifySignature = PaytmChecksum.verifySignature(req.body, process.env.PAYTM_KEY, paytmChecksum);

    if (isVerifySignature) {
      const { ORDERID, TXNID, TXNAMOUNT, STATUS, RESPCODE, RESPMSG } = req.body;

      if (STATUS === "TXN_SUCCESS") {
        // Payment successful
        res.json({
          success: true,
          message: "Payment successful",
          orderId: ORDERID,
          transactionId: TXNID,
          amount: TXNAMOUNT,
          status: STATUS
        });
      } else {
        // Payment failed
        res.json({
          success: false,
          message: RESPMSG || "Payment failed",
          orderId: ORDERID,
          status: STATUS,
          responseCode: RESPCODE
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: "Checksum verification failed"
      });
    }
  } catch (error) {
    console.error("Paytm callback error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing Paytm callback"
    });
  }
});

// API to check Paytm transaction status
app.post("/paytm/status", async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const paytmParams = {
      MID: paytmConfig.MID,
      ORDERID: orderId,
    };

    const checksum = await PaytmChecksum.generateSignature(paytmParams, process.env.PAYTM_KEY);
    paytmParams.CHECKSUMHASH = checksum;

    // Make request to Paytm status API
    const https = require('https');
    const querystring = require('querystring');

    const post_data = querystring.stringify(paytmParams);

    const options = {
      hostname: 'securegw-stage.paytm.in', // Use staging for testing
      port: 443,
      path: '/order/status',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(post_data)
      }
    };

    const statusReq = https.request(options, (statusRes) => {
      let data = '';
      statusRes.on('data', (chunk) => {
        data += chunk;
      });
      statusRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          res.json(response);
        } catch (parseError) {
          res.status(500).json({ error: "Error parsing Paytm response" });
        }
      });
    });

    statusReq.on('error', (error) => {
      console.error("Paytm status check error:", error);
      res.status(500).json({ error: "Error checking transaction status" });
    });

    statusReq.write(post_data);
    statusReq.end();

  } catch (error) {
    console.error("Paytm status error:", error);
    res.status(500).json({ error: "Error checking Paytm transaction status" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Payment backend server is running",
    gateways: ["Razorpay", "Paytm"]
  });
});

// Start server
const PORT = process.env.PORT || 5055;
app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});