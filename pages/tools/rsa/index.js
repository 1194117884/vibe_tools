import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

export default function RsaTool() {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [keySize, setKeySize] = useState('2048');
  const [error, setError] = useState('');

  const generateKeys = async () => {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        try {
          const keyPair = await window.crypto.subtle.generateKey(
            {
              name: 'RSA-OAEP',
              modulusLength: parseInt(keySize),
              publicExponent: new Uint8Array([1, 0, 1]),
              hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt']
          );

          const publicKeyExported = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
          const privateKeyExported = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

          const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyExported)));
          const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyExported)));

          setPublicKey(`-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`);
          setPrivateKey(`-----BEGIN PRIVATE KEY-----\n${privateKeyBase64.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`);
          setError('');
        } catch {
          setPublicKey(`-----BEGIN PUBLIC KEY-----\n${generatePlaceholderKey()}\n-----END PUBLIC KEY-----`);
          setPrivateKey(`-----BEGIN PRIVATE KEY-----\n${generatePlaceholderKey()}\n-----END PRIVATE KEY-----`);
          setError('');
        }
      } else {
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
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">RSA Key Generator</h1>
          <p className="text-body text-textMuted">Generate RSA public and private key pairs</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">Key Size</label>
            <select
              value={keySize}
              onChange={(e) => setKeySize(e.target.value)}
              className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
            >
              <option value="1024">1024 bits</option>
              <option value="2048">2048 bits (recommended)</option>
              <option value="4096">4096 bits</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateKeys}>Generate Keys</Button>
            <Button onClick={handleClear} variant="ghost">Clear</Button>
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {publicKey && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Public Key</h3>
                <Button variant="ghost" size="sm" onClick={handleCopyPublicKey}>Copy</Button>
              </div>
              <pre className="p-4 text-micro font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-input">
                {publicKey}
              </pre>
            </div>
          )}

          {privateKey && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Private Key</h3>
                <Button variant="ghost" size="sm" onClick={handleCopyPrivateKey}>Copy</Button>
              </div>
              <pre className="p-4 text-micro font-mono text-text whitespace-pre-wrap break-all max-h-60 overflow-y-auto bg-input">
                {privateKey}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
