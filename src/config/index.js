/**
 * Centralized configuration management
 * All environment variables and app config in one place
 */
const fs = require('fs');
const path = require('path');

/**
 * Try to read project ID from service account file
 */
const getProjectIdFromCredentials = () => {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credPath) return null;

  try {
    const fullPath = path.resolve(credPath);
    if (fs.existsSync(fullPath)) {
      const creds = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      return creds.project_id || null;
    }
  } catch (err) {
    console.warn('Could not read project_id from credentials file:', err.message);
  }
  return null;
};

const config = {
  // Google Cloud settings - auto-detect from credentials if not set
  projectId: process.env.GOOGLE_PROJECT_ID
    || process.env.GCP_PROJECT
    || getProjectIdFromCredentials()
    || 'your-project-id',

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
  } else {
    console.log(`Using project: ${config.projectId}`);
  }
};

validateConfig();

module.exports = config;
