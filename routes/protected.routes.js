const express = require('express');
const router = express.Router();
const requireAuth=require('../middleware/auth.middleware');
const protectedController = require('../controllers/protected.controller');

router.get('/profile',requireAuth, protectedController.protectedProfile);
router.get('/dashboard', requireAuth, (req, res) => {
  res.status(200).json({ message: `Welcome to your dashboard, ${req.user.email}` });
});
module.exports = router;