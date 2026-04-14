'use client'

import { useState } from 'react'
import { ToolPage, TextArea, Button, ResultBox, CopyButton } from '@vibe-tools/ui'
import { encodeUrl, decodeUrl } from '@vibe-tools/utils'

export default function UrlTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleEncode = () => {
    try {
      setOutput(encodeUrl(input))
      setError('')
    } catch (e) {
      setError('Encoding failed')
      setOutput('')
    }
  }

  const handleDecode = () => {
    try {
      setOutput(decodeUrl(input))
      setError('')
    } catch (e) {
      setError('Invalid URL encoded string')
      setOutput('')
    }
  }

  return (
    <ToolPage title="URL Encoder" icon="🔗">
      <div className="space-y-4">
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="Enter URL or text..."
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