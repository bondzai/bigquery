/**
 * Centralized configuration management
 * All environment variables and app config in one place
 */
const config = {
  // Google Cloud settings
  projectId: process.env.GOOGLE_PROJECT_ID || process.env.GCP_PROJECT || 'your-project-id',
  
  // BigQuery settings
  bigquery: {
    dataset: process.env.BIGQUERY_DATASET || 'test_dataset',
    table: process.env.BIGQUERY_TABLE || 'items',
    location: process.env.BIGQUERY_LOCATION || 'US',
  },
  
  // Server settings
  server: {
    port: parseInt(process.env.PORT, 10) || 8080,
    env: process.env.NODE_ENV || 'development',
  },
  
  // Feature flags
  features: {
    enableMockMode: process.env.ENABLE_MOCK_MODE === 'true',
  },
};

/**
 * Validate required configuration
 * @throws {Error} if required config is missing
 */
const validateConfig = () => {
  const required = ['projectId'];
  const missing = required.filter(key => !config[key] || config[key] === 'your-project-id');
  
  if (missing.length > 0 && !config.features.enableMockMode) {
    console.warn(`Warning: Missing configuration: ${missing.join(', ')}. Set ENABLE_MOCK_MODE=true for local testing.`);
  }
};

validateConfig();

module.exports = config;
