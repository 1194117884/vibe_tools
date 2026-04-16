// utils/index.js
export * from './formatters.js';

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

// Hexadecimal/Decimal/Binary/ASCII conversion utils
export function hexToDecimal(hexInput) {
  // Remove any prefix like '0x'
  const cleanHex = hexInput.replace(/^0x/i, '');
  if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
    throw new Error('Invalid hexadecimal input: only 0-9 and A-F characters are allowed');
  }

  return parseInt(cleanHex, 16);
}

export function decimalToHex(decimalInput) {
  if (isNaN(decimalInput) || decimalInput < 0) {
    throw new Error('Invalid decimal input: must be a positive number');
  }

  const num = Number(decimalInput);
  return '0x' + Math.floor(num).toString(16).toUpperCase();
}

export function decimalToBinary(decimalInput) {
  if (isNaN(decimalInput) || decimalInput < 0) {
    throw new Error('Invalid decimal input: must be a positive number');
  }

  return Math.floor(Number(decimalInput)).toString(2);
}

export function decimalToAscii(decimalInput) {
  if (isNaN(decimalInput) || decimalInput < 0 || decimalInput > 127) {
    throw new Error('Invalid decimal input: must be between 0 and 127 for ASCII conversion');
  }

  return String.fromCharCode(Math.floor(Number(decimalInput)));
}

export function binaryToDecimal(binaryInput) {
  // Remove any spaces and validate input contains only 0s and 1s
  const cleanBinary = binaryInput.replace(/\s/g, '');
  if (!/^[01]+$/.test(cleanBinary)) {
    throw new Error('Invalid binary input: only 0s and 1s are allowed');
  }

  return parseInt(cleanBinary, 2);
}

export function asciiToDecimal(asciiInput) {
  if (asciiInput.length === 0) {
    throw new Error('ASCII input cannot be empty');
  }

  // Return decimal value for first character for backward compatibility
  // but note that this is for single character
  if (asciiInput.length === 1) {
    return asciiInput.charCodeAt(0);
  } else {
    // For longer strings, we'll return the decimal values of all characters as an array
    return asciiInput.split('').map(char => char.charCodeAt(0));
  }
}

// Enhanced ASCII to binary for longer strings
export function asciiToBinaryLong(asciiInput) {
  if (asciiInput.length === 0) {
    return '';
  }

  return asciiInput.split('').map(char => {
    const binary = char.charCodeAt(0).toString(2);
    // Pad with zeros to make it 8 bits
    return binary.padStart(8, '0');
  }).join(' ');
}

// Enhanced binary to ASCII for longer strings
export function binaryToAsciiLong(binaryInput) {
  // Remove any spaces and validate input contains only 0s and 1s
  const cleanBinary = binaryInput.replace(/\s/g, '');
  if (!/^[01]+$/.test(cleanBinary)) {
    throw new Error('Invalid binary input: only 0s and 1s are allowed');
  }

  // Ensure the binary string length is divisible by 8 (full bytes)
  if (cleanBinary.length % 8 !== 0) {
    throw new Error('Invalid binary input: length must be a multiple of 8 bits');
  }

  // Split the binary string into chunks of 8 bits (1 byte)
  const bytes = [];
  for (let i = 0; i < cleanBinary.length; i += 8) {
    const byte = cleanBinary.substr(i, 8);
    bytes.push(String.fromCharCode(parseInt(byte, 2)));
  }

  return bytes.join('');
}

// ASCII to Decimal conversion for longer strings
export function asciiToDecimalLong(asciiInput) {
  if (asciiInput.length === 0) {
    return [];
  }

  return asciiInput.split('').map(char => char.charCodeAt(0));
}

// Decimal array to ASCII for longer strings
export function decimalArrayToAscii(decimalArray) {
  if (!Array.isArray(decimalArray) || decimalArray.length === 0) {
    return '';
  }

  return decimalArray.map(code => {
    if (code < 0 || code > 127) {
      throw new Error(`Invalid decimal value: ${code}. Must be between 0 and 127 for ASCII conversion.`);
    }
    return String.fromCharCode(code);
  }).join('');
}

// ASCII to Hex for longer strings - returns space-separated double-digit hex (e.g., "AB" -> "41 42")
export function asciiToHexLong(asciiInput) {
  if (asciiInput.length === 0) {
    return '';
  }

  return asciiInput.split('').map(char => {
    const hex = char.charCodeAt(0).toString(16).toUpperCase();
    // Pad with zero to make it 2 digits
    return hex.padStart(2, '0');
  }).join(' ');
}

// Hex to ASCII for longer strings - supports formats like "41 42", "0x41 0x42", "4142"
export function hexToAsciiLong(hexInput) {
  if (!hexInput || hexInput.trim().length === 0) {
    return '';
  }

  // Normalize the input: handle "0x41 0x42" or "41 42" or "4142" formats
  // Remove all "0x" or "0X" prefixes and spaces
  const cleanHex = hexInput.replace(/0x/gi, '').replace(/\s/g, '');

  if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
    throw new Error('Invalid hexadecimal input: only 0-9 and A-F characters are allowed');
  }

  // Ensure the hex string length is even (full bytes)
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex input: length must be even (complete bytes)');
  }

  // Split the hex string into chunks of 2 characters (1 byte each)
  const chars = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    const byte = cleanHex.substr(i, 2);
    const code = parseInt(byte, 16);
    if (code < 0 || code > 127) {
      throw new Error(`Hex value 0x${byte} (${code}) is outside ASCII range (0-127)`);
    }
    chars.push(String.fromCharCode(code));
  }

  return chars.join('');
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