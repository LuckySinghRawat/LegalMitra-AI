// Simple WhatsApp test script
// This demonstrates how to integrate with your existing server

const express = require('express');
const bodyParser = require('body-parser');
const aiService = require('./services/ai.service');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Test endpoint for WhatsApp webhook
app.post('/whatsapp', async (req, res) => {
  try {
    const incomingMsg = req.body.Body;
    console.log("User:", incomingMsg);

    // Use AI service for intelligent responses
    const aiResponse = await aiService.chatWithAI(incomingMsg, 'whatsapp', 'en');

    // Send TwiML response
    res.set('Content-Type', 'text/xml');
    res.send(`
      <Response>
        <Message>${aiResponse.message}</Message>
      </Response>
    `);
  } catch (error) {
    console.error('Error:', error);
    res.set('Content-Type', 'text/xml');
    res.send(`
      <Response>
        <Message>Sorry, I'm having trouble processing your message. Please try again.</Message>
      </Response>
    `);
  }
});

// Health check
app.get('/whatsapp', (req, res) => {
  res.send('WhatsApp bot is running!');
});

// Run on different port to avoid conflict
app.listen(5002, () => console.log("WhatsApp bot running on port 5002"));