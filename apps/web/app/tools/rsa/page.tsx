'use client'

import { useState } from 'react'
import { ToolPage, Button, ResultBox, CopyButton } from '@vibe-tools/ui'
import { generateRsaKeyPair } from '@vibe-tools/utils'

export default function RsaTool() {
  const [keys, setKeys] = useState<{ publicKey: string; privateKey: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const keyPair = await generateRsaKeyPair()
      setKeys(keyPair)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <ToolPage title="RSA Key Gen" icon="🔑">
      <div className="space-y-4">
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate RSA 2048 Key Pair'}
        </Button>

        {keys && (
          <>
            <ResultBox title="Public Key">
              <div className="flex justify-between items-start gap-2">
                <pre className="text-xs font-mono text-text whitespace-pre-wrap break-all flex-1">{keys.publicKey}</pre>
                <CopyButton text={keys.publicKey} />
              </div>
            </ResultBox>
            <ResultBox title="Private Key">
              <div className="flex justify-between items-start gap-2">
                <pre className="text-xs font-mono text-text whitespace-pre-wrap break-all flex-1">{keys.privateKey}</pre>
                <CopyButton text={keys.privateKey} />
              </div>
            </ResultBox>
          </>
        )}
      </div>
    </ToolPage>
  )
}