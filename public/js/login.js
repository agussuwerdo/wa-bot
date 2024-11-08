const ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

ws.onmessage = (event) => {
    console.log('Received message:', event.data);
    const data = JSON.parse(event.data);
    
    if (data.status) {
        handleStatusUpdate(data);
    }
};

const handleStatusUpdate = (data) => {
    const qrContainer = document.getElementById('qrContainer');
    const qrCode = document.getElementById('qrCode');
    const connectionStatus = document.getElementById('connectionStatus');

    switch (data.status) {
        case 'qr':
            qrContainer.style.display = 'block';
            connectionStatus.textContent = 'Please scan the QR code';
            
            // Generate QR code
            qrCode.innerHTML = '';
            new QRCode(qrCode, {
                text: data.qr,
                width: 256,
                height: 256
            });
            break;

        case 'ready':
            connectionStatus.textContent = 'Connected! Redirecting...';
            // Redirect to monitor page
            window.location.href = '/';
            break;

        case 'logged_out':
            connectionStatus.textContent = 'Waiting for QR code...';
            qrCode.innerHTML = '';
            break;
    }
};

ws.onopen = () => {
    console.log('WebSocket connected');
};

ws.onclose = () => {
    console.log('WebSocket disconnected');
}; 