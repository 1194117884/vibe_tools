'use client'

import { useState } from 'react'
import { ToolPage, TextArea, Button, ResultBox, CopyButton } from '@vibe-tools/ui'
import { encodeBase64, decodeBase64 } from '@vibe-tools/utils'

export default function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleEncode = () => {
    try {
      setOutput(encodeBase64(input))
      setError('')
    } catch (e) {
      setError('Encoding failed')
      setOutput('')
    }
  }

  const handleDecode = () => {
    try {
      setOutput(decodeBase64(input))
      setError('')
    } catch (e) {
      setError('Invalid Base64')
      setOutput('')
    }
  }

  return (
    <ToolPage title="Base64" icon="Aa">
      <div className="space-y-4">
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="Enter text..."
        />
        
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleEncode}>Encode</Button>
          <Button onClick={handleDecode} variant="secondary">Decode</Button>
        </div>

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