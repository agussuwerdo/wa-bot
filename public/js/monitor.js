let chats = new Map(); // Store chat history grouped by chat
let selectedChat = null; // Currently selected chat

// Initialize DOM elements at the top
let messagesDiv = null;
let totalMessagesElement = null;
let connectionStatusElement = null;
let clearMessagesButton = null;
let qrCodeElement = null;
let messageForm = null;
let logoutButton = null;
let chatSearch = null;

// Add these functions at the top of the file after the variable declarations
function saveChatsToStorage() {
    try {
        const chatsData = Array.from(chats.entries()).map(([id, chat]) => {
            return [id, {
                ...chat,
                messages: chat.messages.slice(-50) // Only store last 50 messages per chat
            }];
        });
        localStorage.setItem('whatsapp_chats', JSON.stringify(chatsData));
    } catch (error) {
        console.error('Error saving chats to storage:', error);
    }
}

function loadChatsFromStorage() {
    try {
        const storedChats = localStorage.getItem('whatsapp_chats');
        if (storedChats) {
            const chatsData = JSON.parse(storedChats);
            chats = new Map(chatsData);
            updateChatList();
            
            // If there was a selected chat, restore it
            const storedSelectedChat = localStorage.getItem('whatsapp_selected_chat');
            if (storedSelectedChat && chats.has(storedSelectedChat)) {
                selectedChat = storedSelectedChat;
                displayChatMessages(chats.get(storedSelectedChat));
            }
        }
    } catch (error) {
        console.error('Error loading chats from storage:', error);
    }
}

function saveSelectedChat(chatId) {
    localStorage.setItem('whatsapp_selected_chat', chatId);
}

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
function handleNewMessage(message) {
    if (!messagesDiv) return;
    
    const messageElement = document.createElement('div');
    // Add flex container with justify-end for messages from me
    messageElement.className = `flex ${message.fromMe ? 'justify-end' : 'justify-start'}`;
    
    const messageContent = `
        <div class="${message.fromMe 
            ? 'bg-[#d9fdd3] rounded-lg p-2 max-w-[60%] break-words shadow-sm' 
            : 'bg-white rounded-lg p-2 max-w-[60%] break-words shadow-sm'
        }">
            <div class="text-sm">${message.body || ''}</div>
            <div class="text-[11px] text-gray-500 text-right">
                ${new Date(message.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    `;
    
    messageElement.innerHTML = messageContent;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Update stats function
function updateStats(totalMessages) {
    if (totalMessagesElement) {
        totalMessagesElement.textContent = totalMessages;
    }
}

// Add this function after the updateStats function
function checkStatus() {
    fetch('/api/bot/status')
    .then(response => {
        if (!response.ok) {
            throw new Error('Status check failed');
        }
        return response.json();
    })
    .then(data => {
        if (!data.isAuthenticated) {
            localStorage.clear(); // Clear stored chats if not authenticated
            window.location.href = '/login.html';
        }
        console.log('Status check:', data);
    })
    .catch(error => {
        console.error('Error checking status:', error);
    });
}

// Initialize WebSocket with error handling
const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
    if (connectionStatusElement) {
        connectionStatusElement.textContent = 'Connection Error';
        connectionStatusElement.className = 'text-error';
    }
    // Redirect to login if connection fails
    window.location.href = '/login.html';
    localStorage.clear(); // Clear stored chats on connection error
};

// WebSocket event handlers
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received data:', data);
    
    if (data.type === 'chat_history') {
        // Clear existing messages and chats
        chats.clear();
        localStorage.clear();
        if (messagesDiv) {
            messagesDiv.innerHTML = '';
        }

        // Process chat history - filter out call_logs
        data.messages
            .filter(chat => chat.messages.some(msg => msg.type === 'chat')) // Only include chats with chat messages
            .forEach(chat => {
                const chatId = chat.id._serialized;
                chats.set(chatId, {
                    id: chatId,
                    name: chat.name || chat.id.user,
                    messages: chat.messages
                        .filter(msg => msg.type === 'chat') // Filter out call_log messages
                        .map(msg => ({
                            from: msg.from,
                            fromMe: msg.fromMe,
                            body: msg.body,
                            timestamp: msg.timestamp,
                            hasMedia: msg.hasMedia || false,
                            _data: msg._data
                        })),
                    lastMessage: chat.lastMessage,
                    unreadCount: chat.unreadCount || 0
                });
            });

        saveChatsToStorage();
        updateChatList();
    } else if (data.type === 'chat') {
        // Handle new message
        const chatId = data.from;
        if (!chats.has(chatId)) {
            chats.set(chatId, {
                id: chatId,
                name: data.chatName || data.senderName || data.from.split('@')[0],
                messages: [],
                lastMessage: null,
                unreadCount: 0
            });
        }
        
        const chat = chats.get(chatId);
        const messageData = {
            from: data.from,
            fromMe: data.contact.isMe === true,
            body: data.body,
            timestamp: data.timestamp,
            hasMedia: data.hasMedia || false,
            _data: data
        };
        
        chat.messages.push(messageData);
        chat.lastMessage = messageData;
        saveChatsToStorage();
        updateChatList();
        
        // If this chat is selected, display the new message
        if (selectedChat === chatId) {
            handleNewMessage(messageData);
        }
    } else if (data.status === 'qr' && qrCodeElement) {
        qrCodeElement.innerHTML = '';
        const qrImage = document.createElement('img');
        qrImage.src = `data:image/png;base64,${data.qr}`;
        qrCodeElement.appendChild(qrImage);
    } else if (data.status === 'ready') {
        if (qrCodeElement) qrCodeElement.style.display = 'none';
        window.location.href = '/';
    } else if (data.status === 'logged_out') {
        window.location.href = window.location.protocol + '//' + window.location.host + '/login.html';
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
    connectionStatusElement = document.getElementById('connectionStatus');
    clearMessagesButton = document.getElementById('clearMessages');
    qrCodeElement = document.getElementById('qrCode');
    messageForm = document.getElementById('messageForm');
    logoutButton = document.getElementById('logoutBtn');
    chatSearch = document.getElementById('chatSearch');

    // Load stored chats
    loadChatsFromStorage();

    // Initialize message form handler
    if (messageForm) {
        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const number = document.getElementById('number').value;
            const messageText = document.getElementById('message').value;
            
            try {
                const response = await fetch('/api/bot/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ number, message: messageText })
                });

                if (!response.ok) {
                    throw new Error('Failed to send message');
                }

                // Clear the message input
                document.getElementById('message').value = '';
                
                // Create a temporary message object for immediate display
                const tempMessage = {
                    from: `${number}@c.us`,
                    fromMe: true,
                    body: messageText,
                    timestamp: Math.floor(Date.now() / 1000),
                    hasMedia: false
                };
                
                // Add to current chat
                const chatId = `${number}@c.us`;
                if (!chats.has(chatId)) {
                    chats.set(chatId, {
                        id: chatId,
                        name: number,
                        messages: [],
                        lastMessage: null,
                        unreadCount: 0
                    });
                }
                
                const chat = chats.get(chatId);
                chat.messages.push(tempMessage);
                chat.lastMessage = tempMessage;
                saveChatsToStorage();
                updateChatList();
                
                // If this is the selected chat or no chat is selected, display the message
                if (!selectedChat || selectedChat === chatId) {
                    selectedChat = chatId;
                    displayChatMessages(chatId);
                }

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
            }
        });
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', logoutWhatsApp);
    }

    // Add chat search functionality
    if (chatSearch) {
        chatSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            updateChatList(searchTerm);
        });
    }

    // Add periodic status check
    checkStatus(); // Initial check
    setInterval(checkStatus, 30000); // Check every 30 seconds
});

// Logout functionality
async function logoutWhatsApp() {
    try {
        localStorage.clear(); // Clear stored chats on logout
        const response = await fetch('/api/bot/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Logout failed');
        }

        window.location.href = window.location.protocol + '//' + window.location.host + '/login.html';
        console.log('Logout successful');
    } catch (error) {
        console.error('Error during logout:', error);
        alert('Failed to logout. Please try again.');
    }
}

// Add function to update chat list
function updateChatList(searchTerm = null) {
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '';

    const allChats = Array.from(chats.values());
    let totalMessages = 0;
    // count total messages and media messages
    allChats.forEach(chat => {
        totalMessages += chat.messages.length;
    });
    updateStats(totalMessages);

    // Filter chats based on search term if provided
    const filteredChats = searchTerm ? Array.from(chats.values()).filter(chat => chat.name.toLowerCase().includes(searchTerm)) : Array.from(chats.values());

    // Convert Map to Array and sort by latest message
    const sortedChats = filteredChats
        .sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));

    sortedChats.forEach(chat => {
        const chatElement = document.createElement('div');
        chatElement.className = `p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
            selectedChat === chat.id ? 'bg-gray-100' : ''
        }`;
        
        const lastMessage = chat.lastMessage;
        const timestamp = lastMessage ? new Date(lastMessage.timestamp * 1000).toLocaleString() : '';
        
        chatElement.innerHTML = `
            <div class="flex justify-between">
                <div class="flex-1">
                    <h3 class="font-semibold">${escapeHtml(chat.name)}</h3>
                    <p class="text-sm text-gray-500 truncate">${
                        lastMessage ? escapeHtml(lastMessage.body) : ''
                    }</p>
                </div>
                <span class="text-xs text-gray-400">${timestamp}</span>
            </div>
        `;

        chatElement.addEventListener('click', () => {
            selectedChat = chat.id;
            saveSelectedChat(chat.id);
            updateChatList(); // Refresh selection highlight
            displayChatMessages(chat.id);
        });

        chatList.appendChild(chatElement);
    });
}

// Add function to display chat messages
function displayChatMessages(chatId) {
    if (!messagesDiv) return;
    
    messagesDiv.innerHTML = '';
    const chat = chats.get(chatId);
    
    if (!chat) return;
    
    // Update the selected chat header
    const selectedChatName = document.getElementById('selectedChatName');
    if (selectedChatName) {
        selectedChatName.textContent = chat.name;
    }
    
    // Update the phone number input with the selected chat's number
    const numberInput = document.getElementById('number');
    if (numberInput) {
        // Extract the phone number from the chat ID (remove "@c.us" suffix)
        const phoneNumber = chat.id.split('@')[0];
        numberInput.value = phoneNumber;
    }
    
    chat.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `flex ${message.fromMe ? 'justify-end' : 'justify-start'} mb-2`;
        
        const messageContent = `
            <div class="${message.fromMe 
                ? 'bg-[#d9fdd3] rounded-lg p-2 max-w-[60%] break-words shadow-sm' 
                : 'bg-white rounded-lg p-2 max-w-[60%] break-words shadow-sm'
            }">
                <div class="text-sm">${escapeHtml(message.body) || ''}</div>
                <div class="text-[11px] text-gray-500 text-right">
                    ${new Date(message.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        `;
        
        messageElement.innerHTML = messageContent;
        messagesDiv.appendChild(messageElement);
    });
    
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}