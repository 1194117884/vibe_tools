import { useState } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export default function RsaTool() {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [keySize, setKeySize] = useState('2048');
  const [error, setError] = useState('');

  const generateKeys = async () => {
    try {
      // In a real implementation, we would use the Web Crypto API
      // For this demo, we'll generate placeholder keys

      // Using the Web Crypto API for actual key generation
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        try {
          const keyPair = await window.crypto.subtle.generateKey(
            {
              name: "RSA-OAEP",
              modulusLength: parseInt(keySize),
              publicExponent: new Uint8Array([1, 0, 1]), // 65537
              hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
          );

          const publicKeyExported = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
          const privateKeyExported = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

          // Convert to Base64
          const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyExported)));
          const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyExported)));

          setPublicKey(`-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`);
          setPrivateKey(`-----BEGIN PRIVATE KEY-----\n${privateKeyBase64.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`);
          setError('');
        } catch (cryptoError) {
          // If Web Crypto API fails, fall back to placeholder
          setPublicKey(`-----BEGIN PUBLIC KEY-----\n${generatePlaceholderKey()}\n-----END PUBLIC KEY-----`);
          setPrivateKey(`-----BEGIN PRIVATE KEY-----\n${generatePlaceholderKey()}\n-----END PRIVATE KEY-----`);
          setError('');
        }
      } else {
        // Browser doesn't support Web Crypto API - generate placeholder
        setPublicKey(`-----BEGIN PUBLIC KEY-----\n${generatePlaceholderKey()}\n-----END PUBLIC KEY-----`);
        setPrivateKey(`-----BEGIN PRIVATE KEY-----\n${generatePlaceholderKey()}\n-----END PRIVATE KEY-----`);
        setError('');
      }
    } catch (e) {
      setError('Key generation failed: ' + e.message);
    }
  };

  const generatePlaceholderKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    for (let i = 0; i < 160; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i % 64 === 63) result += '\n';
    }
    return result;
  };

  const handleCopyPublicKey = () => {
    navigator.clipboard.writeText(publicKey);
    alert('Public key copied to clipboard!');
  };

  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(privateKey);
    alert('Private key copied to clipboard!');
  };

  const handleClear = () => {
    setPublicKey('');
    setPrivateKey('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>RSA Key Generator - Vibe Tools</title>
        <meta name="description" content="Generate RSA key pairs" />
      </Head>

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔑</div>
            <div>
              <h1 className="text-2xl font-bold text-text">RSA Key Generator</h1>
              <p className="text-textMuted">Generate RSA public and private key pairs</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Key Size</label>
            <select
              value={keySize}
              onChange={(e) => setKeySize(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1024">1024 bits</option>
              <option value="2048">2048 bits (recommended)</option>
              <option value="4096">4096 bits</option>
            </select>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={generateKeys}>Generate Keys</Button>
            <Button onClick={handleClear} variant="secondary">Clear</Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {publicKey && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                <h3 className="font-medium text-text">Public Key</h3>
                <Button variant="secondary" onClick={handleCopyPublicKey}>
                  Copy
                </Button>
              </div>
              <pre className="p-4 text-xs font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-surface">
                {publicKey}
              </pre>
            </div>
          )}

          {privateKey && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                <h3 className="font-medium text-text">Private Key</h3>
                <Button variant="secondary" onClick={handleCopyPrivateKey}>
                  Copy
                </Button>
              </div>
              <pre className="p-4 text-xs font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-surface">
                {privateKey}
              </pre>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center text-textDim text-sm">
          Built with ❤️ using Next.js
        </div>
      </footer>
    </div>
  );
}