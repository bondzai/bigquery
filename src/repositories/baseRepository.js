/**
 * Base Repository - Generic CRUD operations
 * DRY pattern: Reusable data access layer
 */
const { v4: uuidv4 } = require('uuid');
const bigqueryService = require('../services/bigquery');
const config = require('../config');

/**
 * Create a repository for a specific table
 * @param {string} tableName - Table name (defaults to config)
 * @param {string} datasetName - Dataset name (defaults to config)
 * @returns {Object} Repository methods
 */
const createRepository = (
    tableName = config.bigquery.table,
    datasetName = config.bigquery.dataset
) => {
    const fullTableName = `\`${config.projectId}.${datasetName}.${tableName}\``;

    return {
        /**
     * Create a new record using SQL INSERT (free tier compatible)
     * @param {Object} data - Record data
     * @returns {Promise<Object>} Created record
     */
        async create(data) {
            const id = uuidv4();
            const now = new Date().toISOString();

            const record = {
                id,
                name: data.name,
                value: data.value !== undefined && data.value !== null ? data.value : null,
                data: data.data ? JSON.stringify(data.data) : null,
                created_at: now,
                updated_at: now,
            };

            // Use SQL INSERT instead of streaming (free tier compatible)
            const query = `
        INSERT INTO ${fullTableName} (id, name, value, data, created_at, updated_at)
        VALUES (@id, @name, @value, @data, @created_at, @updated_at)
      `;

            // Types are required for nullable fields when value is null
            const types = {
                id: 'STRING',
                name: 'STRING',
                value: 'INT64',
                data: 'STRING',
                created_at: 'STRING',
                updated_at: 'STRING',
            };

            await bigqueryService.executeQuery(query, {
                id: record.id,
                name: record.name,
                value: record.value,
                data: record.data,
                created_at: record.created_at,
                updated_at: record.updated_at,
            }, types);

            return { ...record, data: data.data || null };
        },

        /**
         * Find all records with optional filtering
         * @param {Object} options - Query options (limit, offset, orderBy)
         * @returns {Promise<Array>} Records
         */
        async findAll(options = {}) {
            const { limit = 100, offset = 0, orderBy = 'created_at DESC' } = options;

            const query = `
        SELECT id, name, value, data, created_at, updated_at
        FROM ${fullTableName}
        ORDER BY ${orderBy}
        LIMIT @limit OFFSET @offset
      `;

            const rows = await bigqueryService.executeQuery(query, { limit, offset });

            return rows.map(row => ({
                ...row,
                data: row.data ? JSON.parse(row.data) : null,
            }));
        },

        /**
         * Find a record by ID
         * @param {string} id - Record ID
         * @returns {Promise<Object|null>} Record or null
         */
        async findById(id) {
            const query = `
        SELECT id, name, value, data, created_at, updated_at
        FROM ${fullTableName}
        WHERE id = @id
        LIMIT 1
      `;

            const rows = await bigqueryService.executeQuery(query, { id });

            if (rows.length === 0) {
                return null;
            }

            const row = rows[0];
            return {
                ...row,
                data: row.data ? JSON.parse(row.data) : null,
            };
        },

        /**
         * Update a record by ID
         * BigQuery doesn't support UPDATE directly, so we use MERGE
         * @param {string} id - Record ID
         * @param {Object} data - Updated data
         * @returns {Promise<Object|null>} Updated record or null
         */
        async update(id, data) {
            const now = new Date().toISOString();

            // Build SET clauses dynamically
            const setClauses = ['updated_at = @updated_at'];
            const params = { id, updated_at: now };

            if (data.name !== undefined) {
                setClauses.push('name = @name');
                params.name = data.name;
            }
            if (data.value !== undefined) {
                setClauses.push('value = @value');
                params.value = data.value;
            }
            if (data.data !== undefined) {
                setClauses.push('data = @data');
                params.data = JSON.stringify(data.data);
            }

            const query = `
        UPDATE ${fullTableName}
        SET ${setClauses.join(', ')}
        WHERE id = @id
      `;

            await bigqueryService.executeQuery(query, params);

            // Fetch and return updated record
            return this.findById(id);
        },

        /**
         * Delete a record by ID
         * @param {string} id - Record ID
         * @returns {Promise<boolean>} True if deleted
         */
        async delete(id) {
            const query = `
        DELETE FROM ${fullTableName}
        WHERE id = @id
      `;

            await bigqueryService.executeQuery(query, { id });
            return true;
        },

        /**
         * Count all records
         * @returns {Promise<number>} Total count
         */
        async count() {
            const query = `
        SELECT COUNT(*) as total
        FROM ${fullTableName}
      `;

            const rows = await bigqueryService.executeQuery(query);
            return rows[0]?.total || 0;
        },
    };
};

module.exports = { createRepository };
