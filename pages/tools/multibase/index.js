import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import {
  hexToDecimal, decimalToHex, decimalToBinary, decimalToAscii,
  binaryToDecimal, asciiToBinaryLong, binaryToAsciiLong,
  asciiToDecimalLong, decimalArrayToAscii, asciiToHexLong,
  hexToAsciiLong
} from '../../../utils';

export default function MultiBaseConverter() {
  const [hexValue, setHexValue] = useState('');
  const [decimalValue, setDecimalValue] = useState('');
  const [binaryValue, setBinaryValue] = useState('');
  const [asciiValue, setAsciiValue] = useState('');
  const [hexLongValue, setHexLongValue] = useState('');
  const [hexError, setHexError] = useState('');
  const [decimalError, setDecimalError] = useState('');
  const [binaryError, setBinaryError] = useState('');
  const [asciiError, setAsciiError] = useState('');
  const [hexLongError, setHexLongError] = useState('');
  const [lastUpdatedField, setLastUpdatedField] = useState(null);

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
        setBinaryValue(decimalToBinary(decimal));
        setDecimalValue(decimal.toString());
        setDecimalError(''); setBinaryError(''); setHexError(''); setHexLongError('');
      } catch (error) {
        setAsciiValue(''); setBinaryValue(''); setDecimalValue(''); setHexLongValue('');
        setHexError(error.message);
      }
    }
  }, [hexValue, lastUpdatedField]);

  useEffect(() => {
    if (lastUpdatedField === 'decimal' && decimalValue) {
      try {
        const decimalNum = parseInt(decimalValue);
        if (isNaN(decimalNum) || decimalNum < 0) throw new Error('Invalid decimal number');
        setHexValue(decimalToHex(decimalNum));
        setBinaryValue(decimalToBinary(decimalNum));
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
        setDecimalError(''); setBinaryError(''); setHexError(''); setHexLongError('');
      } catch (error) {
        setHexValue(''); setBinaryValue(''); setAsciiValue(''); setHexLongValue('');
        setDecimalError(error.message);
      }
    }
  }, [decimalValue, lastUpdatedField]);

  useEffect(() => {
    if (lastUpdatedField === 'binary' && binaryValue) {
      try {
        const decimal = binaryToDecimal(binaryValue);
        setDecimalValue(decimal.toString());
        setHexValue(decimalToHex(decimal));
        if (binaryValue.trim().replace(/\s/g, '').length % 8 === 0) {
          const ascii = binaryToAsciiLong(binaryValue);
          setAsciiValue(ascii);
          setAsciiError('');
          setHexLongValue(asciiToHexLong(ascii));
        } else if (decimal >= 0 && decimal <= 127) {
          const ascii = decimalToAscii(decimal);
          setAsciiValue(ascii);
          setAsciiError('');
          setHexLongValue(asciiToHexLong(ascii));
        } else {
          setAsciiValue('');
          setHexLongValue('');
          setAsciiError('Binary does not correspond to valid ASCII');
        }
        setDecimalError(''); setHexError(''); setBinaryError(''); setHexLongError('');
      } catch (error) {
        setHexValue(''); setDecimalValue(''); setAsciiValue(''); setHexLongValue('');
        setBinaryError(error.message);
      }
    }
  }, [binaryValue, lastUpdatedField]);

  useEffect(() => {
    if (lastUpdatedField === 'ascii' && asciiValue) {
      try {
        if (asciiValue.length === 1) {
          const decimalArray = asciiToDecimalLong(asciiValue);
          if (decimalArray.length > 0) {
            setDecimalValue(decimalArray[0].toString());
            setHexValue(decimalToHex(decimalArray[0]));
            setBinaryValue(decimalToBinary(decimalArray[0]));
            setHexLongValue(asciiToHexLong(asciiValue));
          }
        } else {
          setBinaryValue(asciiToBinaryLong(asciiValue));
          setHexLongValue(asciiToHexLong(asciiValue));
          const decimalArray = asciiToDecimalLong(asciiValue);
          if (decimalArray.length > 0) {
            const avgDecimal = Math.round(decimalArray.reduce((a, b) => a + b, 0) / decimalArray.length);
            setDecimalValue(avgDecimal.toString());
            setHexValue(decimalToHex(avgDecimal));
          }
        }
        setAsciiError(''); setDecimalError(''); setHexError(''); setBinaryError(''); setHexLongError('');
      } catch (error) {
        setHexValue(''); setDecimalValue(''); setBinaryValue(''); setHexLongValue('');
        setAsciiError(error.message);
      }
    }
  }, [asciiValue, lastUpdatedField]);

  useEffect(() => {
    if (lastUpdatedField === 'hexLong' && hexLongValue) {
      try {
        const ascii = hexToAsciiLong(hexLongValue);
        setAsciiValue(ascii);
        setBinaryValue(asciiToBinaryLong(ascii));
        const decimalArray = asciiToDecimalLong(ascii);
        if (decimalArray.length > 0) {
          const avgDecimal = Math.round(decimalArray.reduce((a, b) => a + b, 0) / decimalArray.length);
          setDecimalValue(avgDecimal.toString());
          setHexValue(decimalToHex(avgDecimal));
        }
        setHexLongError(''); setAsciiError(''); setDecimalError(''); setHexError(''); setBinaryError('');
      } catch (error) {
        setAsciiValue(''); setBinaryValue(''); setDecimalValue(''); setHexValue('');
        setHexLongError(error.message);
      }
    }
  }, [hexLongValue, lastUpdatedField]);

  const handleClear = () => {
    setHexValue(''); setDecimalValue(''); setBinaryValue(''); setAsciiValue(''); setHexLongValue('');
    setHexError(''); setDecimalError(''); setBinaryError(''); setAsciiError(''); setHexLongError('');
    setLastUpdatedField(null);
  };

  const fields = [
    {
      label: 'Hexadecimal (0x)', placeholder: 'e.g., 0x0001 or FF',
      value: hexValue, error: hexError,
      onChange: (e) => { setLastUpdatedField('hex'); setHexValue(e.target.value); },
      type: 'text',
    },
    {
      label: 'Decimal', placeholder: 'e.g., 1 or 65',
      value: decimalValue, error: decimalError,
      onChange: (e) => { setLastUpdatedField('decimal'); setDecimalValue(e.target.value); },
      type: 'number',
    },
    {
      label: 'Binary', placeholder: 'e.g., 1 or 01000001',
      value: binaryValue, error: binaryError,
      onChange: (e) => { setLastUpdatedField('binary'); setBinaryValue(e.target.value); },
      type: 'text',
    },
    {
      label: 'ASCII String', placeholder: 'e.g., Hello or A',
      value: asciiValue, error: asciiError,
      onChange: (e) => { setLastUpdatedField('ascii'); setAsciiValue(e.target.value); },
      type: 'text',
    },
    {
      label: 'Hex (Multi-byte)', placeholder: 'e.g., 48 65 6C 6C 6F',
      value: hexLongValue, error: hexLongError,
      onChange: (e) => { setLastUpdatedField('hexLong'); setHexLongValue(e.target.value); },
      type: 'text',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Multi-Base Converter - Vibe Tools</title>
        <meta name="description" content="Convert between hexadecimal, decimal, binary, and ASCII" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Multi-Base Converter</h1>
          <p className="text-body text-textMuted">Convert between hexadecimal, decimal, binary, and ASCII</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-input border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.label}>
                <label className="block text-control font-medium text-text mb-2">{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={field.placeholder}
                  min={field.type === 'number' ? '0' : undefined}
                  className={`w-full p-3 border rounded bg-background text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150 ${field.error ? 'border-error' : 'border-border'}`}
                />
                {field.error && <p className="text-error text-micro mt-1">{field.error}</p>}
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={handleClear} variant="ghost" size="sm">Clear All</Button>
          </div>
        </div>

        <div className="mt-8 bg-input border border-border rounded-lg p-6">
          <h2 className="text-utility text-text mb-4">About Multi-Base Conversion</h2>
          <div className="max-w-none text-textMuted text-body space-y-3">
            <p>This tool converts between hexadecimal, decimal, binary, and ASCII representations. When you enter a value in any field, the other fields update automatically.</p>
            <h3 className="text-body-emphasis text-text mt-4">Features:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Enter a hexadecimal value (with or without '0x' prefix)</li>
              <li>Enter a decimal value</li>
              <li>Enter a binary value (single or multi-byte sequence)</li>
              <li>Enter an ASCII string (single character or longer string)</li>
              <li>Enter multi-byte hex (e.g., "48 65 6C 6C 6F" or "0x48 0x65")</li>
              <li>All fields update in real-time as you type</li>
            </ul>
            <div className="p-4 bg-surfaceHover rounded">
              <p className="text-body-emphasis text-text">Example:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
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
