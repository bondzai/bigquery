/**
 * Express Application Setup
 * Shared between Cloud Run and Cloud Functions
 */
const express = require('express');
const routes = require('./routes');
const config = require('./config');

const app = express();

// ============================================
// Middleware
// ============================================

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (config.server.env === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// ============================================
// Routes
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.server.env,
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'BigQuery CRUD API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            items: '/api/items',
        },
    });
});

// API routes
app.use('/api', routes);

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const status = err.status || err.statusCode || 500;
    const message = config.server.env === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(status).json({
        success: false,
        message,
        ...(config.server.env !== 'production' && { stack: err.stack }),
    });
});

module.exports = app;
