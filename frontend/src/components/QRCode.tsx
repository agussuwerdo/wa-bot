import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  code: string | null;
}

export const QRCode: React.FC<QRCodeProps> = ({ code }) => {
  return (
    <div className="p-8 flex flex-col items-center bg-white rounded-lg shadow-lg">
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
        alt="WhatsApp Logo" 
        className="w-16 h-16 mb-4"
      />
      <h2 className="text-xl font-semibold mb-6">Scan QR Code to Login</h2>
      <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-center" style={{ minHeight: '256px', minWidth: '256px' }}>
        {code ? (
          <QRCodeSVG value={code} size={256} />
        ) : (
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#00a884]"></div>
        )}
      </div>
      <p className="mt-4 text-md text-gray-600">To use WhatsApp Bot on your computer:</p>
      <ol className="mt-2 text-sm text-gray-600 space-y-2">
        <li>1. Open WhatsApp on your phone</li>
        <li>2. Tap Menu or Settings and select WhatsApp Web</li>
        <li>3. Point your phone to this screen to capture the code</li>
      </ol>
    </div>
  );
}; 