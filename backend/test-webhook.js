// Test WhatsApp webhook locally
const axios = require('axios');

async function testWebhook() {
  try {
    console.log('🧪 Testing WhatsApp webhook locally...\n');

    // Test health check
    const healthResponse = await axios.get('http://localhost:5001/whatsapp');
    console.log('✅ Health check:', healthResponse.data);

    // Test message processing
    const messageResponse = await axios.post('http://localhost:5001/whatsapp', {
      Body: 'Hello LegalMitra, I need help with a legal complaint',
      From: 'whatsapp:+1234567890',
      To: 'whatsapp:+14155238886'
    });

    console.log('✅ Message response received');
    console.log('Response:', messageResponse.data);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your WhatsApp bot is running on port 5001');
    console.log('Run: double-click run-whatsapp.bat');
  }
}

testWebhook();