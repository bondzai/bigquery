/**
 * API Routes - Express router configuration
 */
const express = require('express');
const crudController = require('../controllers/crudController');

const router = express.Router();

/**
 * Items CRUD routes
 */
router.post('/items', crudController.create);
router.get('/items', crudController.findAll);
router.get('/items/:id', crudController.findById);
router.put('/items/:id', crudController.update);
router.delete('/items/:id', crudController.delete);

module.exports = router;
