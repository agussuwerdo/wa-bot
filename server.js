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
const authenticateAPI = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'Invalid or missing API key'
        });
    }
    
    next();
};

// API routes
app.use('/api/bot', authenticateAPI, botRoutes);

// Initialize services
initializeWhatsApp();
initializeWebSocket(server);

// Middleware to check WhatsApp connection status
const checkWhatsAppAuth = (req, res, next) => {
    const { getClientStatus } = require('./services/whatsappService');
    const status = getClientStatus();
    
    // Always allow access to login page and its assets
    if (req.path === '/login.html' || req.path.startsWith('/css/') || req.path.startsWith('/js/')) {
        return next();
    }
    
    // If not authenticated and trying to access any other page
    if (!status.isReady) {
        return res.redirect('/login.html');
    }
    
    next();
};

// Apply middleware to all routes except API and static files
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' ws: wss:;"
    );
    next();
});

// Serve static files
app.use(express.static('public'));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Monitor page available at http://localhost:${PORT}`);
}); 