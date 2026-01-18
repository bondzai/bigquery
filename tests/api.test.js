/**
 * API Tests - Simple test suite for CRUD endpoints
 * Uses Node.js built-in test runner (node --test)
 */
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

const BASE_URL = process.env.API_URL || 'http://localhost:8080';

/**
 * Helper to make HTTP requests
 */
async function request(path, options = {}) {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    const data = await response.json();
    return { status: response.status, data };
}

describe('Health Check', () => {
    it('should return healthy status', async () => {
        const { status, data } = await request('/health');

        assert.strictEqual(status, 200);
        assert.strictEqual(data.status, 'healthy');
        assert.ok(data.timestamp);
    });
});

describe('Root Endpoint', () => {
    it('should return API info', async () => {
        const { status, data } = await request('/');

        assert.strictEqual(status, 200);
        assert.strictEqual(data.name, 'BigQuery CRUD API');
        assert.ok(data.endpoints);
    });
});

describe('CRUD Operations', () => {
    let createdItemId = null;

    it('POST /api/items - should create an item', async () => {
        const { status, data } = await request('/api/items', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Test Item',
                value: 42,
                data: { foo: 'bar' },
            }),
        });

        assert.strictEqual(status, 201);
        assert.strictEqual(data.success, true);
        assert.strictEqual(data.data.name, 'Test Item');
        assert.strictEqual(data.data.value, 42);
        assert.ok(data.data.id);

        createdItemId = data.data.id;
    });

    it('GET /api/items - should list items', async () => {
        const { status, data } = await request('/api/items');

        assert.strictEqual(status, 200);
        assert.strictEqual(data.success, true);
        assert.ok(Array.isArray(data.data.items));
        assert.ok(data.data.pagination);
    });

    it('GET /api/items/:id - should get item by ID', async () => {
        if (!createdItemId) {
            console.log('Skipping: no item created');
            return;
        }

        const { status, data } = await request(`/api/items/${createdItemId}`);

        assert.strictEqual(status, 200);
        assert.strictEqual(data.success, true);
        assert.strictEqual(data.data.id, createdItemId);
    });

    it('PUT /api/items/:id - should update item', async () => {
        if (!createdItemId) {
            console.log('Skipping: no item created');
            return;
        }

        const { status, data } = await request(`/api/items/${createdItemId}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: 'Updated Item',
                value: 100,
            }),
        });

        assert.strictEqual(status, 200);
        assert.strictEqual(data.success, true);
        assert.strictEqual(data.data.name, 'Updated Item');
        assert.strictEqual(data.data.value, 100);
    });

    it('DELETE /api/items/:id - should delete item', async () => {
        if (!createdItemId) {
            console.log('Skipping: no item created');
            return;
        }

        const { status, data } = await request(`/api/items/${createdItemId}`, {
            method: 'DELETE',
        });

        assert.strictEqual(status, 200);
        assert.strictEqual(data.success, true);
    });

    it('GET /api/items/:id - should return 404 for deleted item', async () => {
        if (!createdItemId) {
            console.log('Skipping: no item created');
            return;
        }

        const { status, data } = await request(`/api/items/${createdItemId}`);

        assert.strictEqual(status, 404);
        assert.strictEqual(data.success, false);
    });
});

describe('Validation', () => {
    it('POST /api/items - should reject missing name', async () => {
        const { status, data } = await request('/api/items', {
            method: 'POST',
            body: JSON.stringify({ value: 123 }),
        });

        assert.strictEqual(status, 400);
        assert.strictEqual(data.success, false);
    });

    it('GET /api/items/:id - should return 404 for non-existent ID', async () => {
        const { status, data } = await request('/api/items/non-existent-id');

        assert.strictEqual(status, 404);
        assert.strictEqual(data.success, false);
    });
});

describe('404 Handler', () => {
    it('should return 404 for unknown endpoints', async () => {
        const { status, data } = await request('/unknown/endpoint');

        assert.strictEqual(status, 404);
        assert.strictEqual(data.success, false);
    });
});
