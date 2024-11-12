const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const botRoutes = require('./src/routes/botRoutes');
const { initializeWhatsApp } = require('./src/services/whatsappService');
const { initializeWebSocket } = require('./src/services/websocketService');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Configure Helmet with custom CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            connectSrc: ["'self'", "ws:", "wss:"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    }
}));

app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add this before your routes
const logRequest = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

// API routes
app.use('/api/bot', logRequest, botRoutes);

// Initialize services
initializeWhatsApp();
initializeWebSocket(server);

// Middleware to check WhatsApp connection status
const checkWhatsAppAuth = (req, res, next) => {
    const { getClientStatus } = require('./src/services/whatsappService');
    const status = getClientStatus();
    
    // Always allow access to login page and its assets
    if (req.path === '/login.html' || 
        req.path.startsWith('/css/') || 
        req.path.startsWith('/js/') ||
        req.path === '/api/bot/logout') {
        return next();
    }
    
    // If not authenticated and trying to access any other page
    if (!status.isReady) {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        // return res.redirect(`${protocol}://${req.get('host')}/login.html`);
    }
    
    next();
};

// Apply authentication check before static files
app.use(checkWhatsAppAuth);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Monitor page available at http://localhost:${PORT}`);
}); 