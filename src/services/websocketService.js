const WebSocket = require('ws');
const { onMessage, onStatus, onMessages } = require('./whatsappService');

let wss;

const initializeWebSocket = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');

        // Subscribe to WhatsApp messages
        const unsubscribeMessage = onMessage((messageData) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(messageData));
            }
        });

        // Subscribe to chat history
        const unsubscribeMessages = onMessages((messages) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'chat_history', messages }));
            }
        });

        // Subscribe to status updates
        const unsubscribeStatus = onStatus((statusData) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(statusData));
            }
        });

        ws.on('close', () => {
            unsubscribeMessage();
            unsubscribeMessages();
            unsubscribeStatus();
            console.log('Client disconnected');
        });
    });
};

const broadcastMessage = (message) => {
    if (!wss) return;

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

module.exports = {
    initializeWebSocket,
    broadcastMessage
}; 