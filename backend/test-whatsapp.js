// Test script for WhatsApp chatbot functionality
// Run this with: node test-whatsapp.js

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/whatsapp';

// Test webhook endpoint
async function testWebhook() {
  try {
    console.log('🧪 Testing WhatsApp webhook endpoint...');
    const response = await axios.get(`${BASE_URL}/webhook`);
    console.log('✅ Webhook endpoint accessible:', response.data);
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
  }
}

// Test sending a message (requires Twilio setup)
async function testSendMessage() {
  try {
    console.log('📤 Testing message sending...');
    const response = await axios.post(`${BASE_URL}/send`, {
      to: '+1234567890', // Replace with test number
      message: 'Hello from LegalMitra test!'
    });
    console.log('✅ Message sent:', response.data);
  } catch (error) {
    console.error('❌ Message send failed:', error.response?.data || error.message);
  }
}

// Test AI chat functionality
async function testAIChat() {
  try {
    console.log('🤖 Testing AI chat functionality...');
    const aiService = require('./services/ai.service');

    const response = await aiService.chatWithAI(
      'I have a consumer complaint about a defective product',
      'whatsapp',
      'en'
    );

    console.log('✅ AI Response:', response);
  } catch (error) {
    console.error('❌ AI chat test failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting WhatsApp Chatbot Tests...\n');

  await testWebhook();
  console.log('');

  await testAIChat();
  console.log('');

  console.log('📋 To test sending messages:');
  console.log('1. Set up Twilio credentials in .env');
  console.log('2. Run: await testSendMessage()');
  console.log('3. Send WhatsApp message to your Twilio number');
  console.log('');

  console.log('📖 Setup instructions: Check WHATSAPP_SETUP.md');
}

if (require.main === module) {
  runTests();
}

module.exports = { testWebhook, testSendMessage, testAIChat };