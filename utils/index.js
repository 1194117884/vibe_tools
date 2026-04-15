// utils/index.js
export * from './formatters';

// Base64 utils
export function encodeBase64(input) {
  if (typeof window !== 'undefined') {
    return btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
  } else {
    // For server-side rendering
    return Buffer.from(input, 'utf-8').toString('base64');
  }
}

export function decodeBase64(input) {
  if (typeof window !== 'undefined') {
    return decodeURIComponent(atob(input).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
  } else {
    // For server-side rendering
    return Buffer.from(input, 'base64').toString('utf-8');
  }
}

// Hash utils (will use browser crypto when available)
export async function hashString(str, algorithm = 'SHA-256') {
  if (typeof window !== 'undefined') {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashAlgo = algorithm.replace('-', '').toLowerCase();

    const digest = await crypto.subtle.digest(hashAlgo, data);
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // For server-side, return placeholder
    const crypto = await import('crypto');
    return crypto.createHash(algorithm.toLowerCase().replace('-', '')).update(str).digest('hex');
  }
}

// URL encoding utils
export function encodeUrl(input) {
  return encodeURIComponent(input);
}

export function decodeUrl(input) {
  return decodeURIComponent(input);
}

// Timestamp utils
export function timestampToDate(timestamp) {
  return new Date(parseInt(timestamp) * 1000).toISOString();
}

export function dateToTimestamp(dateStr) {
  return Math.floor(new Date(dateStr).getTime() / 1000);
}

// Color conversion utils
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Image utils (placeholder functions)
export function resizeImage(file, maxWidth, maxHeight) {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      } else if (height > maxWidth) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(resolve, file.type);
    };

    img.src = objectUrl;
  });
}