const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');

let client;
let isReady = false;
let messageCallbacks = new Set();
let qrCode = null;
let statusCallbacks = new Set();
let qrCodeScanned = false;

// Message handler function
const handleMessage = async (message) => {
    if (!isReady) {
        console.error('Client is not ready to handle messages.');
        return;
    }

    try {
        // Get message details
        const chat = await message.getChat();
        const contact = await message.getContact();

        const messageData = {
            from: message.from,
            body: message.body,
            timestamp: message.timestamp,
            type: message.type,
            hasMedia: message.hasMedia,
            isGroup: chat.isGroup,
            author: chat.isGroup ? message.author : message.from,
            senderName: contact.pushname || contact.name || 'Unknown',
            chatName: chat.name,
        };

        // If message has media
        if (message.hasMedia) {
            try {
                const media = await message.downloadMedia();
                if (media) {
                    messageData.media = {
                        mimetype: media.mimetype,
                        data: media.data, // base64 data
                        filename: media.filename
                    };
                }
            } catch (mediaError) {
                console.error('Error downloading media:', mediaError);
            }
        }

        // Notify all registered callbacks
        messageCallbacks.forEach(callback => {
            callback(messageData);
        });

        // Handle basic commands
        if (message.body.startsWith('!')) {
            await handleCommands(message);
        }

    } catch (error) {
        console.error('Error handling message:', error);
    }
};

// Command handler
const handleCommands = async (message) => {
    const command = message.body.toLowerCase();

    switch (command) {
        case '!help':
            await message.reply(
                '*Available Commands*\n' +
                '!help - Show this message\n' +
                '!ping - Check bot status\n' +
                '!info - Get chat info'
            );
            break;

        case '!ping':
            await message.reply('🤖 Bot is active!');
            break;

        case '!info':
            const chat = await message.getChat();
            await message.reply(
                `*Chat Info*\n` +
                `Name: ${chat.name}\n` +
                `IsGroup: ${chat.isGroup}\n` +
                `Participants: ${chat.isGroup ? chat.participants.length : 1}`
            );
            break;
    }
};

const initializeWhatsApp = () => {
    isReady = false;
    qrCodeScanned = false;

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ],
            defaultViewport: null,
            timeout: 0
        }
    });

    client.on('qr', (qr) => {
        console.log('QR Code received, waiting for scan...');
        qrCode = qr;
        qrCodeScanned = false;

        // Send the raw QR code directly
        statusCallbacks.forEach(callback => {
            callback({ status: 'qr', qr: qr });
        });
    });

    client.on('loading_screen', (percent, message) => {
        console.log('Loading:', percent, '%', message);
        statusCallbacks.forEach(callback => {
            callback({ status: 'loading', percent, message });
        });
    });

    client.on('authenticated', () => {
        console.log('WhatsApp authentication successful!');
        qrCodeScanned = true;
        statusCallbacks.forEach(callback => {
            callback({ status: 'authenticated' });
        });
    });

    client.on('ready', async () => {
        console.log('WhatsApp client is ready!');
        isReady = true;
        qrCode = null;
        statusCallbacks.forEach(callback => {
            callback({ status: 'ready' });
        });

        // Fetch chat history after client is ready
        await fetchChatHistory();
    });

    client.on('disconnected', async (reason) => {
        console.log('Client disconnected:', reason);
        isReady = false;
        statusCallbacks.forEach(callback => {
            callback({ status: 'disconnected', reason });
        });

        // Attempt to reinitialize after a delay
        setTimeout(() => {
            if (!isReady) {
                console.log('Attempting to reconnect...');
                client.initialize();
            }
        }, 5000);
    });

    // Add error handler for client
    client.on('auth_failure', () => {
        console.error('Auth Failed!');
        statusCallbacks.forEach(callback => {
            callback({ status: 'auth_failure' });
        });
    });

    // Message listener
    client.on('message', handleMessage);

    // Message_create includes messages sent by the bot
    client.on('message_create', (message) => {
        if (message.fromMe) {
            handleMessage(message);
        }
    });

    // Handle group events
    client.on('group_join', async (notification) => {
        const group = await notification.getChat();
        messageCallbacks.forEach(callback => {
            callback({
                type: 'group_join',
                groupName: group.name,
                participants: notification.recipientIds
            });
        });
    });

    client.on('group_leave', async (notification) => {
        const group = await notification.getChat();
        messageCallbacks.forEach(callback => {
            callback({
                type: 'group_leave',
                groupName: group.name,
                participants: notification.recipientIds
            });
        });
    });

    client.initialize();

    module.exports = {
        initializeWhatsApp,
        sendMessage,
        getClientStatus,
        onMessage,
        getQRCode,
        onStatus,
        logout
    };
};

// Register callback for new messages
const onMessage = (callback) => {
    messageCallbacks.add(callback);
    return () => messageCallbacks.delete(callback); // Return unsubscribe function
};

const sendMessage = async (number, message) => {
    if (!isReady) {
        throw new Error('WhatsApp client not ready');
    }

    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
    return await client.sendMessage(chatId, message);
};

const getClientStatus = () => {
    return {
        isReady: isReady && client?.isReady || false,
        qrCode: qrCode,
        isAuthenticated: qrCodeScanned
    };
};

const getQRCode = () => qrCode;

const onStatus = (callback) => {
    statusCallbacks.add(callback);
    return () => statusCallbacks.delete(callback);
};

const logout = async () => {
    if (client) {
        await client.logout();
        client = null;
        isReady = false;
        qrCode = null;
        qrCodeScanned = false;
        statusCallbacks.forEach(callback => {
            callback({ status: 'logged_out' });
        });

        // Clear message callbacks
        messageCallbacks.clear();

        // delete .wwebjs_auth and .webjs_cache
        fs.rmSync('.wwebjs_auth', { recursive: true, force: true });
        fs.rmSync('.webjs_auth', { recursive: true, force: true });

        // Reinitialize the client after a short delay
        setTimeout(() => {
            initializeWhatsApp();
        }, 1000);
    }
};

// Add this function after initializeWhatsApp
const fetchChatHistory = async () => {
    if (!client || !isReady) {
        throw new Error('WhatsApp client not ready');
    }

    try {
        const chats = await client.getChats();
        for (const chat of chats) {
            // Fetch last 50 messages from each chat
            const messages = await chat.fetchMessages({ limit: 50 });

            // Process each message through the existing handler
            for (const message of messages) {
                await handleMessage(message);
            }
        }
    } catch (error) {
        console.error('Error fetching chat history:', error);
    }
};

module.exports = {
    initializeWhatsApp,
    sendMessage,
    getClientStatus,
    onMessage,
    getQRCode,
    onStatus,
    logout
}; 