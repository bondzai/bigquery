/**
 * Server Entry Point - Cloud Run
 * Starts the Express HTTP server
 */
const app = require('./app');
const config = require('./config');
const { ensureTableExists } = require('./services/bigquery');

const PORT = config.server.port;

// Initialize BigQuery dataset/table, then start server
const startServer = async () => {
    try {
        console.log('Initializing BigQuery...');
        await ensureTableExists();
        console.log('BigQuery ready!');
    } catch (err) {
        console.warn('BigQuery initialization warning:', err.message);
        console.warn('Continuing anyway - tables may need manual creation or mock mode enabled.');
    }

    app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════╗
║           BigQuery CRUD API Server                 ║
╠════════════════════════════════════════════════════╣
║  Status:      Running                              ║
║  Port:        ${String(PORT).padEnd(37)}║
║  Environment: ${config.server.env.padEnd(37)}║
║  Project:     ${config.projectId.padEnd(37)}║
║  Dataset:     ${config.bigquery.dataset.padEnd(37)}║
║  Health:      http://localhost:${PORT}/health${' '.repeat(14)}║
╚════════════════════════════════════════════════════╝
    `);
    });
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
