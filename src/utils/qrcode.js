import QRCode from 'qrcode';

// Generate QR code as data URL
export const generateQRCode = async (text) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrDataUrl;
  } catch (error) {
    console.error('QR code generation error:', error);
    return null;
  }
};

// Build verification URL for QR code
export const buildVerificationUrl = (entryCode) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/verify/${entryCode}`;
};
