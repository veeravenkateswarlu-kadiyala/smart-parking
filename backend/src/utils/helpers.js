import QRCode from 'qrcode';

export const generateQRCode = async (data) => {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (error) {
    throw new Error('QR Code generation failed');
  }
};

export const calculatePrice = (durationHours) => {
  const hours = Math.min(Math.max(1, Math.ceil(durationHours)), 24);
  return hours * 100;
};

export const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;
