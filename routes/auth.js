const express = require('express');
const router = express.Router();
const { login, getMe, registerPrincipal } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/register-principal', registerPrincipal);
router.get('/me', protect, getMe);

module.exports = router;
