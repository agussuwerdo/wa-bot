const { sendMessage, getClientStatus, getQRCode, logout } = require('../services/whatsappService');

const sendMessageController = async (req, res) => {
    try {
        const { number, message } = req.body;

        if (!number || !message) {
            return res.status(400).json({ 
                error: 'Number and message are required' 
            });
        }

        await sendMessage(number, message);
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ 
            error: 'Failed to send message',
            details: error.message 
        });
    }
};

const getStatus = async (req, res) => {
    try {
        const status = getClientStatus();
        res.json(status);
    } catch (error) {
        console.error('Error getting status:', error);
        res.status(500).json({ 
            error: 'Failed to get status',
            details: error.message 
        });
    }
};

const getQR = async (req, res) => {
    try {
        const qr = getQRCode();
        if (qr) {
            res.json({ qr });
        } else {
            res.status(404).json({ error: 'QR code not available' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get QR code' });
    }
};

const logoutController = async (req, res) => {
    try {
        await logout();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to logout' });
    }
};

module.exports = {
    sendMessage: sendMessageController,
    getStatus,
    getQR,
    logout: logoutController
}; 