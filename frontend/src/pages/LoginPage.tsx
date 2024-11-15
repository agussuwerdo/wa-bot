import React from 'react';
import { QRCode } from '../components/QRCode';

interface LoginPageProps {
  qrCode: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ qrCode }) => {
  return (
    <div className="h-full flex items-center justify-center bg-[#F0F2F5]">
      <QRCode code={qrCode} />
    </div>
  );
};
