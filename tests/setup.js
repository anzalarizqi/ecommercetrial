// Global test setup
const axios = require('axios');

// Default base URL for API tests — override with TEST_BASE_URL env var
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

axios.defaults.baseURL = BASE_URL;
axios.defaults.timeout = 5000;

// Make BASE_URL available globally
global.BASE_URL = BASE_URL;

console.log(`[QA Setup] Test base URL: ${BASE_URL}`);
