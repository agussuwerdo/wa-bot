let totalMessages = 0;
let mediaMessages = 0;

// Initialize DOM elements at the top
let messagesDiv = null;
let totalMessagesElement = null;
let mediaMessagesElement = null;
let connectionStatusElement = null;
let clearMessagesButton = null;
let qrCodeElement = null;
let messageForm = null;

// Helper function for escaping HTML
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>"']/g, function(match) {
        const escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return escape[match];
    });
}

// Message handling function
function handleNewMessage(data) {
    if (!messagesDiv) return;

    // Increment counters
    totalMessages++;
    if (data.hasMedia) {
        mediaMessages++;
    }
    updateStats();

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'bg-white rounded-lg shadow-md p-4 mb-4';

    // Format timestamp
    const timestamp = new Date(data.timestamp * 1000).toLocaleString();

    // Build message HTML
    let messageHtml = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <p class="text-sm text-gray-500">
                    From: ${escapeHtml(data.from)}
                    ${data.fromMe ? ' (You)' : ''}
                </p>
                <p class="text-gray-800 mt-1">${escapeHtml(data.body)}</p>
                ${data.hasMedia ? '<p class="text-blue-500 text-sm mt-1">[Media attached]</p>' : ''}
            </div>
            <span class="text-xs text-gray-400">${timestamp}</span>
        </div>
    `;

    messageDiv.innerHTML = messageHtml;
    messagesDiv.insertBefore(messageDiv, messagesDiv.firstChild);

    // Limit the number of displayed messages
    const maxMessages = 100;
    while (messagesDiv.children.length > maxMessages) {
        messagesDiv.removeChild(messagesDiv.lastChild);
    }
}

// Update stats function
function updateStats() {
    if (totalMessagesElement) {
        totalMessagesElement.textContent = totalMessages;
    }
    if (mediaMessagesElement) {
        mediaMessagesElement.textContent = mediaMessages;
    }
}

// Initialize WebSocket
const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

// WebSocket event handlers
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received data:', data);
    
    if (data.status === 'qr' && qrCodeElement) {
        qrCodeElement.innerHTML = '';
        const qrImage = document.createElement('img');
        qrImage.src = `data:image/png;base64,${data.qr}`;
        qrCodeElement.appendChild(qrImage);
    } else if (data.status === 'ready') {
        if (qrCodeElement) qrCodeElement.style.display = 'none';
        window.location.href = '/';
    } else if (data.status === 'logged_out') {
        window.location.href = '/login.html';
    } else if (data.type) {
        handleNewMessage(data);
    }
};

ws.onopen = () => {
    if (connectionStatusElement) {
        connectionStatusElement.textContent = 'Connected';
        connectionStatusElement.className = 'text-success';
    }
};

ws.onclose = () => {
    if (connectionStatusElement) {
        connectionStatusElement.textContent = 'Disconnected';
        connectionStatusElement.className = 'text-error';
    }
};

// DOM Ready handler
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all DOM elements
    messagesDiv = document.getElementById('messages');
    totalMessagesElement = document.getElementById('totalMessages');
    mediaMessagesElement = document.getElementById('mediaMessages');
    connectionStatusElement = document.getElementById('connectionStatus');
    clearMessagesButton = document.getElementById('clearMessages');
    qrCodeElement = document.getElementById('qrCode');
    messageForm = document.getElementById('messageForm');

    // Initialize message form handler
    if (messageForm) {
        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const number = document.getElementById('number').value;
            const message = document.getElementById('message').value;
            
            try {
                const response = await fetch('/api/bot/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': localStorage.getItem('apiKey')
                    },
                    body: JSON.stringify({ number, message })
                });

                if (!response.ok) {
                    throw new Error('Failed to send message');
                }

                document.getElementById('message').value = '';
                alert('Message sent successfully!');
            } catch (error) {
                console.error('Error sending message:', error);
                alert('Failed to send message. Please try again.');
            }
        });
    }

    // Initialize other buttons and handlers...
    if (clearMessagesButton) {
        clearMessagesButton.addEventListener('click', () => {
            if (messagesDiv) {
                messagesDiv.innerHTML = '';
                totalMessages = 0;
                mediaMessages = 0;
                updateStats();
            }
        });
    }
});

// API Key Management
function saveApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value;
    if (apiKey) {
        localStorage.setItem('apiKey', apiKey);
        location.reload();
    }
}

// Logout functionality
async function logoutWhatsApp() {
    const apiKey = localStorage.getItem('apiKey');
    
    try {
        const response = await fetch('/api/bot/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                console.error('API key invalid or missing');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Logout failed');
        }

        console.log('Logout successful');
    } catch (error) {
        console.error('Error during logout:', error);
        alert('Failed to logout. Please try again.');
    }
}