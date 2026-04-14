@echo off
echo ============================================
echo  LegalMitra WhatsApp Bot Setup Script
echo ============================================
echo.

echo Step 1: Starting WhatsApp Bot Server...
cd /d "%~dp0backend"
start cmd /k "node whatsapp.js"

echo.
echo Step 2: Starting ngrok tunnel...
echo (Make sure ngrok is installed and authenticated)
echo.
echo If ngrok is not installed, download from: https://ngrok.com/download
echo Then run: ngrok authtoken YOUR_AUTH_TOKEN
echo.
echo Press any key to continue with ngrok setup...
pause >nul

echo.
echo IMPORTANT SETUP STEPS:
echo ======================
echo 1. Your WhatsApp bot should now be running on port 5001
echo 2. Run this command in a new terminal: ngrok http 5001
echo 3. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok.io)
echo 4. Go to Twilio Console -^> Messaging -^> WhatsApp
echo 5. Set the Webhook URL to: YOUR_NGROK_URL/whatsapp
echo 6. Test by sending a message to your Twilio WhatsApp number
echo.
echo Example webhook URL: https://abc123.ngrok.io/whatsapp
echo.

echo Press any key to exit...
pause >nul