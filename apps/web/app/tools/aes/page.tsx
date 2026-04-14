'use client'

import { useState } from 'react'
import { ToolPage, TextArea, Button, ResultBox, CopyButton } from '@vibe-tools/ui'
import { encryptAes, decryptAes } from '@vibe-tools/utils'

export default function AesTool() {
  const [text, setText] = useState('')
  const [password, setPassword] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')

  const handleSubmit = async () => {
    if (!text || !password) {
      setError('Please enter text and password')
      return
    }
    setError('')
    try {
      if (mode === 'encrypt') {
        setOutput(await encryptAes(text, password))
      } else {
        setOutput(await decryptAes(text, password))
      }
    } catch (e) {
      setError(mode === 'encrypt' ? 'Encryption failed' : 'Decryption failed - check your password')
      setOutput('')
    }
  }

  return (
    <ToolPage title="AES Encrypt" icon="🔐">
      <div className="space-y-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setMode('encrypt')}
            className={`px-3 py-1 rounded-lg text-sm ${mode === 'encrypt' ? 'bg-primary text-white' : 'bg-surface border border-border text-text'}`}
          >
            Encrypt
          </button>
          <button
            onClick={() => setMode('decrypt')}
            className={`px-3 py-1 rounded-lg text-sm ${mode === 'decrypt' ? 'bg-primary text-white' : 'bg-surface border border-border text-text'}`}
          >
            Decrypt
          </button>
        </div>

        <div>
          <label className="block text-sm text-textMuted mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl p-3 text-text focus:outline-none focus:border-primary"
            placeholder="Enter password..."
          />
        </div>

        <TextArea
          value={text}
          onChange={setText}
          placeholder={mode === 'encrypt' ? 'Enter plaintext...' : 'Enter ciphertext...'}
        />
        
        <Button onClick={handleSubmit}>
          {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </Button>

        {error && <div className="text-error text-sm">{error}</div>}

        {output && (
          <ResultBox title="Result">
            <div className="flex justify-between items-start gap-2">
              <pre className="text-sm font-mono text-text whitespace-pre-wrap break-all flex-1">{output}</pre>
              <CopyButton text={output} />
            </div>
          </ResultBox>
        )}
      </div>
    </ToolPage>
  )
}