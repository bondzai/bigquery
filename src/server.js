/**
 * Server Entry Point - Cloud Run
 * Starts the Express HTTP server
 */
const app = require('./app');
const config = require('./config');

const PORT = config.server.port;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════╗
║           BigQuery CRUD API Server                 ║
╠════════════════════════════════════════════════════╣
║  Status:      Running                              ║
║  Port:        ${String(PORT).padEnd(37)}║
║  Environment: ${config.server.env.padEnd(37)}║
║  Health:      http://localhost:${PORT}/health${' '.repeat(14)}║
╚════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});
