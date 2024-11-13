const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

ws.onmessage = (event) => {
    console.log('Received message:', event.data);
    const data = JSON.parse(event.data);
    
    if (data.status) {
        handleStatusUpdate(data);
    }
};

function checkStatus() {
    fetch('/api/bot/status')
    .then(response => {
        if (!response.ok) {
            throw new Error('Status check failed');
        }
        return response.json();
    })
    .then(data => {
        if (data.isAuthenticated) {
            window.location.href = '/';
        }
        console.log('Status check:', data);
    })
    .catch(error => {
        console.error('Error checking status:', error);
    });
}

const handleStatusUpdate = (data) => {
    const qrContainer = document.getElementById('qrContainer');
    const qrCode = document.getElementById('qrCode');
    const connectionStatus = document.getElementById('connectionStatus');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const loader = document.getElementById('loader');
    const content = document.getElementById('content');

    switch (data.status) {
        case 'qr':
            qrContainer.style.display = 'block';
            connectionStatus.textContent = 'Please scan the QR code';
            content.classList.remove('hidden');
            loadingSpinner.classList.add('hidden');
            qrCode.classList.remove('hidden');
            loader.classList.replace('flex', 'hidden');
            
            // Clear previous QR code
            qrCode.innerHTML = '';
            
            // Generate QR code
            new QRCode(qrCode, {
                text: data.qr,
                width: 256,
                height: 256,
                correctLevel: QRCode.CorrectLevel.L,
                callback: () => {
                }
            });
            break;

        case 'ready':
            connectionStatus.textContent = 'Connected! Redirecting...';
            window.location.href = '/';
            break;
        
        case 'loading':
            loader.classList.replace('hidden', 'flex');
            content.classList.add('hidden');
            break;

        case 'logged_out':
            connectionStatus.textContent = 'Waiting for QR code...';
            qrCode.innerHTML = '';
            loadingSpinner.classList.remove('hidden');
            loader.classList.replace('flex', 'hidden');
            content.classList.remove('hidden');
            break;
    }
};

ws.onopen = () => {
    console.log('WebSocket connected');
};

ws.onclose = () => {
    console.log('WebSocket disconnected');
}; 

document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
});