@echo off
echo Starting WhatsApp Bot...
cd /d "%~dp0backend"
echo Running from: %cd%
node whatsapp.js
pause