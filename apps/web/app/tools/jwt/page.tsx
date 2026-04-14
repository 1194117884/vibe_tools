'use client'

import { useState } from 'react'
import { ToolPage, TextArea, ResultBox } from '@vibe-tools/ui'
import { decodeJwt, type JwtPayload } from '@vibe-tools/utils'

export default function JwtTool() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<JwtPayload | null>(null)
  const [error, setError] = useState('')

  const handleDecode = () => {
    const decoded = decodeJwt(input.trim())
    if (decoded) {
      setResult(decoded)
      setError('')
    } else {
      setError('Invalid JWT')
      setResult(null)
    }
  }

  return (
    <ToolPage title="JWT Decoder" icon="🎫">
      <div className="space-y-4">
        <TextArea
          value={input}
          onChange={(v) => { setInput(v); handleDecode() }}
          placeholder="Paste JWT token..."
        />

        {error && <div className="text-error text-sm">{error}</div>}

        {result && (
          <>
            <ResultBox title="Header">
              <pre className="text-sm font-mono text-text whitespace-pre-wrap">
                {JSON.stringify(result.header, null, 2)}
              </pre>
            </ResultBox>
            <ResultBox title="Payload">
              <pre className="text-sm font-mono text-text whitespace-pre-wrap">
                {JSON.stringify(result.payload, null, 2)}
              </pre>
            </ResultBox>
            <ResultBox title="Signature">
              <pre className="text-xs font-mono text-textMuted break-all">
                {result.signature}
              </pre>
            </ResultBox>
          </>
        )}
      </div>
    </ToolPage>
  )
}