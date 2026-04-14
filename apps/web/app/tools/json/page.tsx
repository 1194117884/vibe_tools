'use client'

import { useState } from 'react'
import { ToolPage, TextArea, Button, ResultBox, CopyButton } from '@vibe-tools/ui'
import { formatJson, minifyJson, validateJson } from '@vibe-tools/utils'

export default function JsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleFormat = () => {
    try {
      setOutput(formatJson(input))
      setError('')
    } catch (e) {
      setError('Invalid JSON')
      setOutput('')
    }
  }

  const handleMinify = () => {
    try {
      setOutput(minifyJson(input))
      setError('')
    } catch (e) {
      setError('Invalid JSON')
      setOutput('')
    }
  }

  const handleValidate = () => {
    if (validateJson(input)) {
      setError('')
      setOutput('✓ Valid JSON')
    } else {
      setError('Invalid JSON')
      setOutput('')
    }
  }

  return (
    <ToolPage title="JSON Formatter" icon="{ }">
      <div className="space-y-4">
        <TextArea
          value={input}
          onChange={setInput}
          placeholder='Paste JSON here...'
        />
        
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleFormat}>Format</Button>
          <Button onClick={handleMinify} variant="secondary">Minify</Button>
          <Button onClick={handleValidate} variant="secondary">Validate</Button>
        </div>

        {error && (
          <div className="text-error text-sm">{error}</div>
        )}

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