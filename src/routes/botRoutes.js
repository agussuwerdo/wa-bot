const express = require('express');
const botController = require('../controllers/botController');
const router = express.Router();
const { logout } = require('../services/whatsappService');

router.post('/send', botController.sendMessage);
router.get('/status', botController.getStatus);
router.get('/qr', botController.getQR);
router.post('/logout', async (req, res) => {
    try {
        await logout();
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            error: 'Failed to logout',
            details: error.message 
        });
    }
});

module.exports = router; 