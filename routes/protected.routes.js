const express = require('express');
const router = express.Router();
const protectedController = require('../controllers/protected.controller');

router.get('/profile', protectedController.protectedProfile);

module.exports = router;