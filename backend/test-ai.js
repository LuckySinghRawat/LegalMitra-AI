// Test the WhatsApp AI functionality
const aiService = require('./services/ai.service');

async function testWhatsApp() {
  console.log('🧪 Testing WhatsApp AI Integration...\n');

  const testMessages = [
    'Hello',
    'I have a consumer complaint',
    'Someone stole my phone',
    'Help me file a legal complaint'
  ];

  for (const message of testMessages) {
    console.log(`User: ${message}`);
    try {
      const response = await aiService.chatWithAI(message, 'whatsapp', 'en');
      console.log(`Bot: ${response.message}`);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
    console.log('---');
  }
}

testWhatsApp();