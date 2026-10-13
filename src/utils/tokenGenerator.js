import html2canvas from 'html2canvas';

// Generate downloadable PNG token card
export const generateTokenImage = async (elementId, filename = 'entry-token.png') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Token element not found');
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      backgroundColor: '#0a0e1a',
      scale: 2, // Higher quality
      logging: false,
      useCORS: true
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');

    return true;
  } catch (error) {
    console.error('Token image generation error:', error);
    return false;
  }
};

// Print token
export const printToken = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Token element not found');
    return false;
  }

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Entry Token</title>
      <style>
        body {
          margin: 0;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      ${element.outerHTML}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
  
  return true;
};
