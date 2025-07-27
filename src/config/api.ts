// API Configuration
// For production, replace with your actual server URL
export const API_CONFIG = {
  // Development server (your computer's IP)
  WEBHOOK_URL: 'http://192.168.1.150:3003',
  WS_URL: 'ws://192.168.1.150:3002',
  
  // Production server (update before building release APK)
  // WEBHOOK_URL: 'https://your-production-server.com',
  // WS_URL: 'wss://your-production-server.com',
  
  // API endpoints
  ENDPOINTS: {
    SMS: '/api/sms',
    HEALTH: '/health',
    TEST: '/api/notifications/test'
  },
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 30000
};