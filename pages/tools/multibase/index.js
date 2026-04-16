import Head from 'next/head';
import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import {
  hexToDecimal,
  decimalToHex,
  decimalToBinary,
  decimalToAscii,
  binaryToDecimal,
  asciiToBinaryLong,
  binaryToAsciiLong,
  asciiToDecimalLong,
  decimalArrayToAscii,
  asciiToHexLong,
  hexToAsciiLong
} from '../../../utils';

export default function MultiBaseConverter() {
  const [hexValue, setHexValue] = useState('');
  const [decimalValue, setDecimalValue] = useState('');
  const [binaryValue, setBinaryValue] = useState('');
  const [asciiValue, setAsciiValue] = useState('');
  const [hexLongValue, setHexLongValue] = useState(''); // For multi-byte hex (e.g., "41 42")

  const [hexError, setHexError] = useState('');
  const [decimalError, setDecimalError] = useState('');
  const [binaryError, setBinaryError] = useState('');
  const [asciiError, setAsciiError] = useState('');
  const [hexLongError, setHexLongError] = useState('');

  // Track which field initiated the update to prevent cycles
  const [lastUpdatedField, setLastUpdatedField] = useState(null);

  // Debounced update to avoid cycles
  useEffect(() => {
    if (lastUpdatedField === 'hex' && hexValue) {
      try {
        const decimal = hexToDecimal(hexValue);
        if (decimal >= 0 && decimal <= 127) {
          const ascii = decimalToAscii(decimal);
          setAsciiValue(ascii);
          setHexLongValue(asciiToHexLong(ascii));
          setAsciiError('');
        } else {
          setAsciiValue('');
          setHexLongValue('');
          setAsciiError('Hex value out of single ASCII range (0x00-0x7F)');
        }

        const binary = decimalToBinary(decimal);
        setBinaryValue(binary);

        setDecimalValue(decimal.toString());
        setDecimalError('');
        setBinaryError('');
        setHexError('');
        setHexLongError('');
      } catch (error) {
        setAsciiValue('');
        setBinaryValue('');
        setDecimalValue('');
        setHexLongValue('');
        setHexError(error.message);
      }
    }
  }, [hexValue, lastUpdatedField]);

  useEffect(() => {
    if (lastUpdatedField === 'decimal' && decimalValue) {
      try {
        const decimalNum = parseInt(decimalValue);
        if (isNaN(decimalNum) || decimalNum < 0) {
          throw new Error('Invalid decimal number');
        }

        const hex = decimalToHex(decimalNum);
        setHexValue(hex);

        const binary = decimalToBinary(decimalNum);
        setBinaryValue(binary);

        if (decimalNum >= 0 && decimalNum <= 127) {
          const ascii = decimalToAscii(decimalNum);
          setAsciiValue(ascii);
          setHexLongValue(asciiToHexLong(ascii));
          setAsciiError('');
        } else {
          setAsciiValue('');
          setHexLongValue('');
          setAsciiError('Decimal value out of single ASCII range (0-127)');
        }

        setDecimalError('');
        setBinaryError('');
        setHexError('');
        setHexLongError('');
      } catch (error) {
        setHexValue('');
        setBinaryValue('');
        setAsciiValue('');
        setHexLongValue('');
        setDecimalError(error.message);
      }
    }
  }, [decimalValue, lastUpdatedField]);

  useEffect(() => {
    if (lastUpdatedField === 'binary' && binaryValue) {
      try {
        const decimal = binaryToDecimal(binaryValue);
        setDecimalValue(decimal.toString());

        const hex = decimalToHex(decimal);
        setHexValue(hex);

        if (binaryValue.trim().replace(/\s/g, '').length % 8 === 0) {
          // It's a full byte sequence, convert to ASCII string
          const ascii = binaryToAsciiLong(binaryValue);
          setAsciiValue(ascii);
          setAsciiError('');

          // Also update hex long
          const hexLong = asciiToHexLong(ascii);
          setHexLongValue(hexLong);
        } else if (decimal >= 0 && decimal <= 127) {
          // It's a single character
          const ascii = decimalToAscii(decimal);
          setAsciiValue(ascii);
          setAsciiError('');
          setHexLongValue(asciiToHexLong(ascii));
        } else {
          setAsciiValue('');
          setHexLongValue('');
          setAsciiError('Binary does not correspond to valid ASCII');
        }

        setDecimalError('');
        setHexError('');
        setBinaryError('');
        setHexLongError('');
      } catch (error) {
        setHexValue('');
        setDecimalValue('');
        setAsciiValue('');
        setHexLongValue('');
        setBinaryError(error.message);
      }
    }
  }, [binaryValue, lastUpdatedField]);

  useEffect(() => {
    if (lastUpdatedField === 'ascii' && asciiValue) {
      try {
        if (asciiValue.length === 1) {
          // Single character
          const decimalArray = asciiToDecimalLong(asciiValue);
          if (decimalArray.length > 0) {
            const decimal = decimalArray[0];
            setDecimalValue(decimal.toString());

            const hex = decimalToHex(decimal);
            setHexValue(hex);

            const binary = decimalToBinary(decimal);
            setBinaryValue(binary);

            // Single char hex long is just the 2-digit hex
            setHexLongValue(asciiToHexLong(asciiValue));
          }
        } else {
          // Multiple characters
          const binary = asciiToBinaryLong(asciiValue);
          setBinaryValue(binary);

          // Multi-byte hex representation (e.g., "AB" -> "41 42")
          const hexLong = asciiToHexLong(asciiValue);
          setHexLongValue(hexLong);

          // For multi-char ASCII, we'll set the decimal to an average or leave empty
          const decimalArray = asciiToDecimalLong(asciiValue);
          if (decimalArray.length > 0) {
            const avgDecimal = Math.round(decimalArray.reduce((a, b) => a + b, 0) / decimalArray.length);
            setDecimalValue(avgDecimal.toString());

            const hex = decimalToHex(avgDecimal);
            setHexValue(hex);
          }
        }

        setAsciiError('');
        setDecimalError('');
        setHexError('');
        setBinaryError('');
        setHexLongError('');
      } catch (error) {
        setHexValue('');
        setDecimalValue('');
        setBinaryValue('');
        setHexLongValue('');
        setAsciiError(error.message);
      }
    }
  }, [asciiValue, lastUpdatedField]);

  useEffect(() => {
    if (lastUpdatedField === 'hexLong' && hexLongValue) {
      try {
        // Convert hex long to ASCII
        const ascii = hexToAsciiLong(hexLongValue);
        setAsciiValue(ascii);

        // Also update binary
        const binary = asciiToBinaryLong(ascii);
        setBinaryValue(binary);

        // Calculate average decimal for the single-value fields
        const decimalArray = asciiToDecimalLong(ascii);
        if (decimalArray.length > 0) {
          const avgDecimal = Math.round(decimalArray.reduce((a, b) => a + b, 0) / decimalArray.length);
          setDecimalValue(avgDecimal.toString());

          const hex = decimalToHex(avgDecimal);
          setHexValue(hex);
        }

        setHexLongError('');
        setAsciiError('');
        setDecimalError('');
        setHexError('');
        setBinaryError('');
      } catch (error) {
        setAsciiValue('');
        setBinaryValue('');
        setDecimalValue('');
        setHexValue('');
        setHexLongError(error.message);
      }
    }
  }, [hexLongValue, lastUpdatedField]);

  const handleHexChange = (e) => {
    setLastUpdatedField('hex');
    setHexValue(e.target.value);
  };

  const handleDecimalChange = (e) => {
    setLastUpdatedField('decimal');
    setDecimalValue(e.target.value);
  };

  const handleBinaryChange = (e) => {
    setLastUpdatedField('binary');
    setBinaryValue(e.target.value);
  };

  const handleAsciiChange = (e) => {
    setLastUpdatedField('ascii');
    setAsciiValue(e.target.value);
  };

  const handleHexLongChange = (e) => {
    setLastUpdatedField('hexLong');
    setHexLongValue(e.target.value);
  };

  // Clear all inputs
  const handleClear = () => {
    setHexValue('');
    setDecimalValue('');
    setBinaryValue('');
    setAsciiValue('');
    setHexLongValue('');
    setHexError('');
    setDecimalError('');
    setBinaryError('');
    setAsciiError('');
    setHexLongError('');
    setLastUpdatedField(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Multi-Base Converter - Vibe Tools</title>
        <meta name="description" content="Convert between hexadecimal, decimal, binary, and ASCII" />
      </Head>

      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-text">Multi-Base Converter</h1>
          <p className="text-textMuted mt-1">Convert between hexadecimal, decimal, binary, and ASCII</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hexadecimal Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Hexadecimal (0x)
              </label>
              <input
                type="text"
                value={hexValue}
                onChange={handleHexChange}
                placeholder="e.g., 0x0001 or FF"
                className={`w-full p-3 border rounded-lg bg-input text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  hexError ? 'border-red-500' : 'border-border'
                }`}
              />
              {hexError && <p className="text-red-500 text-sm mt-1">{hexError}</p>}
            </div>

            {/* Decimal Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Decimal
              </label>
              <input
                type="number"
                value={decimalValue}
                onChange={handleDecimalChange}
                placeholder="e.g., 1 or 65"
                min="0"
                className={`w-full p-3 border rounded-lg bg-input text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  decimalError ? 'border-red-500' : 'border-border'
                }`}
              />
              {decimalError && <p className="text-red-500 text-sm mt-1">{decimalError}</p>}
            </div>

            {/* Binary Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Binary
              </label>
              <input
                type="text"
                value={binaryValue}
                onChange={handleBinaryChange}
                placeholder="e.g., 1 or 01000001 or 01001000 01101001"
                className={`w-full p-3 border rounded-lg bg-input text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  binaryError ? 'border-red-500' : 'border-border'
                }`}
              />
              {binaryError && <p className="text-red-500 text-sm mt-1">{binaryError}</p>}
            </div>

            {/* ASCII Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                ASCII String
              </label>
              <input
                type="text"
                value={asciiValue}
                onChange={handleAsciiChange}
                placeholder="e.g., Hello or A"
                className={`w-full p-3 border rounded-lg bg-input text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  asciiError ? 'border-red-500' : 'border-border'
                }`}
              />
              {asciiError && <p className="text-red-500 text-sm mt-1">{asciiError}</p>}
            </div>

            {/* Multi-byte Hex Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Hex (Multi-byte)
              </label>
              <input
                type="text"
                value={hexLongValue}
                onChange={handleHexLongChange}
                placeholder="e.g., 48 65 6C 6C 6F or 0x48 0x65"
                className={`w-full p-3 border rounded-lg bg-input text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                  hexLongError ? 'border-red-500' : 'border-border'
                }`}
              />
              {hexLongError && <p className="text-red-500 text-sm mt-1">{hexLongError}</p>}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleClear} variant="secondary">
              Clear All
            </Button>
          </div>
        </div>

        <div className="mt-8 bg-surface border border-border rounded-xl p-6">
          <h2 className="text-xl font-semibold text-text mb-4">About Multi-Base Conversion</h2>
          <div className="prose prose-invert max-w-none text-textMuted">
            <p>
              This tool converts between hexadecimal, decimal, binary, and ASCII representations.
              When you enter a value in any field, the other fields update automatically.
            </p>
            <h3 className="text-text mt-4">Features:</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Enter a hexadecimal value (with or without '0x' prefix)</li>
              <li>Enter a decimal value</li>
              <li>Enter a binary value (single or multi-byte sequence)</li>
              <li>Enter an ASCII string (single character or longer string)</li>
              <li>Enter multi-byte hex (e.g., "48 65 6C 6C 6F" or "0x48 0x65")</li>
              <li>All fields update in real-time as you type</li>
            </ul>
            <div className="mt-4 p-3 bg-surfaceHover rounded-lg">
              <p className="font-medium text-text">Example:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Hex: 0x41 → Decimal: 65 → Binary: 1000001 → ASCII: A → Hex Long: 41</li>
                <li>ASCII: "Hi" → Binary: 01001000 01101001 → Hex Long: 48 69</li>
                <li>Hex Long: 48 65 6C 6C 6F → ASCII: "Hello"</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}