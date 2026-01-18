/**
 * CRUD Controller - HTTP request/response handling
 * DRY pattern: Centralized request handling with consistent responses
 */
const { createRepository } = require('../repositories/baseRepository');

// Default repository instance
const repository = createRepository();

/**
 * Wrap async handlers for error handling
 * @param {Function} fn - Async handler function
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Standard API response format
 * @param {Object} res - Express response
 * @param {number} status - HTTP status code
 * @param {Object} data - Response data
 * @param {string} message - Optional message
 */
const sendResponse = (res, status, data, message = null) => {
    const response = {
        success: status >= 200 && status < 300,
        timestamp: new Date().toISOString(),
    };

    if (message) response.message = message;
    if (data !== undefined) response.data = data;

    res.status(status).json(response);
};

/**
 * Controller methods
 */
const controller = {
    /**
     * Create a new item
     * POST /api/items
     */
    create: asyncHandler(async (req, res) => {
        const { name, value, data } = req.body;

        if (!name) {
            return sendResponse(res, 400, null, 'Name is required');
        }

        const item = await repository.create({ name, value, data });
        sendResponse(res, 201, item, 'Item created successfully');
    }),

    /**
     * Get all items
     * GET /api/items
     */
    findAll: asyncHandler(async (req, res) => {
        const { limit = 100, offset = 0, orderBy } = req.query;

        const items = await repository.findAll({
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            orderBy,
        });

        const total = await repository.count();

        sendResponse(res, 200, {
            items,
            pagination: {
                total,
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
            },
        });
    }),

    /**
     * Get item by ID
     * GET /api/items/:id
     */
    findById: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const item = await repository.findById(id);

        if (!item) {
            return sendResponse(res, 404, null, 'Item not found');
        }

        sendResponse(res, 200, item);
    }),

    /**
     * Update item by ID
     * PUT /api/items/:id
     */
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, value, data } = req.body;

        // Check if item exists
        const existing = await repository.findById(id);
        if (!existing) {
            return sendResponse(res, 404, null, 'Item not found');
        }

        const item = await repository.update(id, { name, value, data });
        sendResponse(res, 200, item, 'Item updated successfully');
    }),

    /**
     * Delete item by ID
     * DELETE /api/items/:id
     */
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;

        // Check if item exists
        const existing = await repository.findById(id);
        if (!existing) {
            return sendResponse(res, 404, null, 'Item not found');
        }

        await repository.delete(id);
        sendResponse(res, 200, null, 'Item deleted successfully');
    }),
};

module.exports = controller;
