# SMS Detector Android App

Real-time SMS detection app that forwards messages to a webhook server.

## Features
- 📱 Detects incoming SMS messages
- 🚀 Real-time webhook forwarding
- 🔌 WebSocket support
- 📊 SMS categorization (OTP, Bank, Promotion, Other)

## Configuration
The app is configured to connect to:
- API Server: `http://192.168.1.150:3003`
- WebSocket: `ws://192.168.1.150:3002`

## Installation
1. Download the APK from [Releases](../../releases)
2. Enable "Install from unknown sources" on your Android device
3. Install the APK
4. Grant SMS permissions when prompted

## Build
This project uses GitHub Actions for automated builds. Every push to main branch triggers a new APK build.

## Permissions Required
- READ_SMS
- RECEIVE_SMS
- INTERNET

## Server Setup
Make sure your webhook server is running on the same network as your phone.

## License
MIT