# WhatsApp Chatbot Setup Guide

This guide will help you convert your WhatsApp number into an AI-powered chatbot using Twilio's WhatsApp Business API.

## Prerequisites

1. **Twilio Account**: Sign up at [twilio.com](https://twilio.com)
2. **WhatsApp Business Number**: A dedicated WhatsApp number (can be your existing number)
3. **Environment Variables**: Update your `.env` file with Twilio credentials

## Step-by-Step Setup

### 1. Get Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com)
2. Copy your **Account SID** and **Auth Token** from the dashboard
3. Note the **Twilio WhatsApp Number** (usually starts with +14155238886)

### 2. Configure Environment Variables

Update your `.env` file with:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### 3. Set Up WhatsApp Sandbox (Testing)

1. In Twilio Console, go to **Messaging > Try it out > Try WhatsApp**
2. Follow the setup wizard to connect your WhatsApp number
3. Join the sandbox by sending the provided code to the Twilio number

### 4. Configure Webhook

1. In Twilio Console, go to **Messaging > Settings > WhatsApp**
2. Set the **Webhook URL** to: `https://yourdomain.com/api/whatsapp/webhook`
3. For local development, use ngrok: `ngrok http 5000` and use the HTTPS URL

### 5. Test the Chatbot

1. Send a message to your Twilio WhatsApp number
2. The AI should respond automatically
3. Test with messages like:
   - "Hello"
   - "I have a consumer complaint"
   - "Help me file a complaint"

## Production Deployment

### 1. Upgrade to Production WhatsApp

1. Apply for WhatsApp Business API access through Twilio
2. Provide business documentation
3. Wait for Meta's approval (can take 1-2 weeks)

### 2. Webhook Security

Add webhook validation in production:

```javascript
// In whatsapp.routes.js webhook endpoint
const twilioSignature = req.headers['x-twilio-signature'];
const isValid = twilio.validateRequest(
  process.env.TWILIO_AUTH_TOKEN,
  twilioSignature,
  req.originalUrl,
  req.body
);

if (!isValid) {
  return res.status(403).send('Invalid signature');
}
```

### 3. Database Integration

Consider storing conversation history:

```javascript
// Add to webhook handler
const conversation = new Conversation({
  phoneNumber: userPhone,
  message: Body,
  response: aiResponse.message,
  timestamp: new Date()
});
await conversation.save();
```

## Features

- 🤖 **AI-Powered Responses**: Uses Grok/xAI for intelligent legal guidance
- 🌐 **Multi-language Support**: English and Hindi responses
- 📱 **WhatsApp Integration**: Native WhatsApp experience
- 🔒 **Secure**: Webhook validation and rate limiting
- 📊 **Analytics**: Track conversation metrics

## Troubleshooting

### Common Issues

1. **"Invalid signature" error**: Check webhook URL and auth token
2. **No response from AI**: Verify Grok API key and internet connection
3. **Webhook not receiving messages**: Ensure ngrok URL is updated in Twilio

### Testing Commands

```bash
# Test webhook endpoint
curl -X GET https://yourdomain.com/api/whatsapp/webhook

# Send test message via API
curl -X POST https://yourdomain.com/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{"to": "+1234567890", "message": "Test message"}'
```

## Cost Estimation

- **Twilio WhatsApp**: $0.005 per message (both incoming and outgoing)
- **Grok API**: ~$0.001 per message (depending on length)
- **Server**: Standard hosting costs

## Next Steps

1. Implement conversation memory for better context
2. Add quick reply buttons for common actions
3. Integrate with your existing complaint system
4. Add analytics dashboard for chatbot performance

## Support

For issues with:
- **Twilio**: Check [Twilio Docs](https://www.twilio.com/docs/whatsapp)
- **WhatsApp Business API**: Visit [Meta for Developers](https://developers.facebook.com/docs/whatsapp/)
- **LegalMitra AI**: Check the main README.md