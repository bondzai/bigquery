/**
 * Cloud Functions Entry Point
 * HTTP function handler for Google Cloud Functions
 */
const functions = require('@google-cloud/functions-framework');
const app = require('./app');

/**
 * HTTP Cloud Function
 * Routes all requests through the Express app
 */
functions.http('handleRequest', app);

// Export for direct invocation (testing)
module.exports = { handleRequest: app };
