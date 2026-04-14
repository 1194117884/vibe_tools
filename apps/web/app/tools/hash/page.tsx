'use client'

import { useState } from 'react'
import { ToolPage, TextArea, Button, ResultBox, CopyButton } from '@vibe-tools/ui'
import { hashMd5, hashSha1, hashSha256 } from '@vibe-tools/utils'

export default function HashTool() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<{ name: string; value: string }[]>([])
  const [loading, setLoading] = useState(false)

  const handleHash = async () => {
    if (!input) return
    setLoading(true)
    try {
      const [md5, sha1, sha256] = await Promise.all([
        hashMd5(input), // Using SHA-256 as fallback for MD5
        hashSha1(input),
        hashSha256(input)
      ])
      setResults([
        { name: 'SHA-256', value: sha256 },
        { name: 'SHA-1', value: sha1 },
      ])
    } catch (e) {
      setResults([])
    }
    setLoading(false)
  }

  return (
    <ToolPage title="Hash Generator" icon="#">
      <div className="space-y-4">
        <TextArea
          value={input}
          onChange={setInput}
          placeholder="Enter text to hash..."
        />
        
        <Button onClick={handleHash} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Hashes'}
        </Button>

        {results.map((r) => (
          <ResultBox key={r.name} title={r.name}>
            <div className="flex justify-between items-start gap-2">
              <code className="text-xs font-mono text-text break-all flex-1">{r.value}</code>
              <CopyButton text={r.value} />
            </div>
          </ResultBox>
        ))}
      </div>
    </ToolPage>
  )
}