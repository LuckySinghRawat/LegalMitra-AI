const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const aiService = require('../services/ai.service');

// Twilio credentials (will be loaded from environment variables)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = twilio(accountSid, authToken);

// Webhook endpoint for incoming WhatsApp messages
router.post('/webhook', async (req, res) => {
  try {
    const { Body, From, To } = req.body;

    // Extract phone number from WhatsApp format (whatsapp:+1234567890)
    const userPhone = From.replace('whatsapp:', '');

    console.log(`📱 WhatsApp message from ${userPhone}: ${Body}`);

    // Process the message with AI
    const aiResponse = await aiService.chatWithAI(Body, 'whatsapp', 'en');

    // Send response back via WhatsApp
    await client.messages.create({
      body: aiResponse.message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: From
    });

    console.log(`✅ WhatsApp response sent to ${userPhone}`);

    // Respond to Twilio
    res.status(200).send('OK');

  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Health check endpoint for Twilio
router.get('/webhook', (req, res) => {
  res.status(200).send('WhatsApp webhook is active');
});

// Send message endpoint (for testing or internal use)
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    const response = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${to}`
    });

    res.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      sid: response.sid
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp message',
      error: error.message
    });
  }
});

module.exports = router;