'use client'

import { useState } from 'react'
import { ToolPage, Button, ResultBox, CopyButton } from '@vibe-tools/ui'
import { unixToDate, dateToUnix, now } from '@vibe-tools/utils'

export default function TimestampTool() {
  const [timestamp, setTimestamp] = useState(String(now()))
  const [dateStr, setDateStr] = useState('')
  const [result, setResult] = useState('')

  const handleToDate = () => {
    try {
      const ts = parseInt(timestamp)
      if (isNaN(ts)) throw new Error('Invalid timestamp')
      // Detect if seconds or milliseconds
      const date = ts > 9999999999 ? new Date(ts) : unixToDate(ts)
      setResult(date.toLocaleString())
      setDateStr(date.toISOString())
    } catch (e) {
      setResult('Invalid timestamp')
      setDateStr('')
    }
  }

  const handleToTimestamp = () => {
    try {
      const date = new Date(dateStr || result)
      if (isNaN(date.getTime())) throw new Error('Invalid date')
      setTimestamp(String(Math.floor(date.getTime() / 1000)))
    } catch (e) {
      setResult('Invalid date')
    }
  }

  const handleNow = () => {
    const n = now()
    setTimestamp(String(n))
    setResult(new Date().toLocaleString())
    setDateStr(new Date().toISOString())
  }

  return (
    <ToolPage title="Timestamp" icon="🕐">
      <div className="space-y-4">
        <Button onClick={handleNow}>Now</Button>

        <div>
          <label className="block text-sm text-textMuted mb-1">Unix Timestamp (seconds)</label>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl p-4 text-text font-mono text-lg"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleToDate}>→ Date</Button>
          <Button onClick={handleToTimestamp} variant="secondary">← From Date</Button>
        </div>

        {result && (
          <ResultBox title="Result">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-text">{result}</span>
                <CopyButton text={result} />
              </div>
              {dateStr && (
                <div className="text-textMuted text-sm font-mono">{dateStr}</div>
              )}
            </div>
          </ResultBox>
        )}

        <div className="text-textDim text-sm">
          Current timestamp: {now()}
        </div>
      </div>
    </ToolPage>
  )
}