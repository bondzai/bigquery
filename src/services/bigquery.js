/**
 * BigQuery Service - Singleton client instance
 * DRY pattern: Single point of BigQuery connection management
 */
const { BigQuery } = require('@google-cloud/bigquery');
const config = require('../config');

// Singleton instance
let bigqueryClient = null;

/**
 * Get or create BigQuery client instance
 * @returns {BigQuery} BigQuery client
 */
const getClient = () => {
    if (!bigqueryClient) {
        bigqueryClient = new BigQuery({
            projectId: config.projectId,
            location: config.bigquery.location,
        });
    }
    return bigqueryClient;
};

/**
 * Execute a query with parameterized values
 * @param {string} query - SQL query string with @param placeholders
 * @param {Object} params - Query parameters
 * @param {Object} types - Optional types for null values
 * @returns {Promise<Array>} Query results
 */
const executeQuery = async (query, params = {}, types = null) => {
    const client = getClient();
    const options = {
        query,
        params,
        location: config.bigquery.location,
    };

    // Add types if provided (required for null values)
    if (types) {
        options.types = types;
    }

    const [rows] = await client.query(options);
    return rows;
};

/**
 * Insert rows into a table
 * @param {string} datasetId - Dataset ID
 * @param {string} tableId - Table ID
 * @param {Array<Object>} rows - Rows to insert
 * @returns {Promise<Object>} Insert response
 */
const insertRows = async (datasetId, tableId, rows) => {
    const client = getClient();
    const dataset = client.dataset(datasetId);
    const table = dataset.table(tableId);

    return table.insert(rows);
};

/**
 * Get dataset reference
 * @param {string} datasetId - Dataset ID
 * @returns {Dataset} Dataset reference
 */
const getDataset = (datasetId = config.bigquery.dataset) => {
    return getClient().dataset(datasetId);
};

/**
 * Get table reference
 * @param {string} tableId - Table ID
 * @param {string} datasetId - Dataset ID
 * @returns {Table} Table reference
 */
const getTable = (tableId = config.bigquery.table, datasetId = config.bigquery.dataset) => {
    return getDataset(datasetId).table(tableId);
};

/**
 * Ensure dataset and table exist (for development/testing)
 * @returns {Promise<void>}
 */
const ensureTableExists = async () => {
    const client = getClient();
    const dataset = client.dataset(config.bigquery.dataset);

    // Check/create dataset
    const [datasetExists] = await dataset.exists();
    if (!datasetExists) {
        await dataset.create();
        console.log(`Dataset ${config.bigquery.dataset} created.`);
    }

    // Check/create table with schema
    const table = dataset.table(config.bigquery.table);
    const [tableExists] = await table.exists();
    if (!tableExists) {
        const schema = [
            { name: 'id', type: 'STRING', mode: 'REQUIRED' },
            { name: 'name', type: 'STRING', mode: 'REQUIRED' },
            { name: 'value', type: 'INT64', mode: 'NULLABLE' },
            { name: 'data', type: 'JSON', mode: 'NULLABLE' },
            { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
            { name: 'updated_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
        ];
        await table.create({ schema });
        console.log(`Table ${config.bigquery.table} created.`);
    }
};

module.exports = {
    getClient,
    executeQuery,
    insertRows,
    getDataset,
    getTable,
    ensureTableExists,
};
