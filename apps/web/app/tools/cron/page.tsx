'use client'

import { useState } from 'react'
import { ToolPage, Button, ResultBox, CopyButton } from '@vibe-tools/ui'

const presets = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at noon', value: '0 12 * * *' },
  { label: 'Every Monday', value: '0 0 * * 1' },
  { label: 'Every month 1st', value: '0 0 1 * *' },
]

export default function CronTool() {
  const [minute, setMinute] = useState('*')
  const [hour, setHour] = useState('*')
  const [day, setDay] = useState('*')
  const [month, setMonth] = useState('*')
  const [weekday, setWeekday] = useState('*')

  const expression = `${minute} ${hour} ${day} ${month} ${weekday}`

  const getDescription = (expr: string): string => {
    const [min, hr, d, mo, wd] = expr.split(' ')
    const parts = []
    if (min === '*') parts.push('every minute')
    else parts.push(`at minute ${min}`)
    if (hr === '*') parts.push('every hour')
    else parts.push(`at hour ${hr}`)
    if (d === '*') parts.push('every day')
    else parts.push(`on day ${d}`)
    if (mo === '*') parts.push('every month')
    else parts.push(`in month ${mo}`)
    if (wd === '*') parts.push('every day of week')
    else {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      parts.push(`on ${days[parseInt(wd)] || wd}`)
    }
    return parts.join(', ')
  }

  return (
    <ToolPage title="Cron Generator" icon="⏰">
      <div className="space-y-6">
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Minute', value: minute, set: setMinute, min: 0, max: 59 },
            { label: 'Hour', value: hour, set: setHour, min: 0, max: 23 },
            { label: 'Day', value: day, set: setDay, min: 1, max: 31 },
            { label: 'Month', value: month, set: setMonth, min: 1, max: 12 },
            { label: 'Weekday', value: weekday, set: setWeekday, min: 0, max: 6 },
          ].map(({ label, value, set, min, max }) => (
            <div key={label}>
              <label className="block text-xs text-textMuted mb-1">{label}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => set(e.target.value)}
                className="w-full bg-surface border border-border rounded-lg p-2 text-text text-center font-mono"
                placeholder="*"
              />
            </div>
          ))}
        </div>

        <ResultBox title="Cron Expression">
          <div className="flex justify-between items-center gap-2">
            <code className="text-lg font-mono text-primary">{expression}</code>
            <CopyButton text={expression} />
          </div>
        </ResultBox>

        <div className="text-textMuted text-sm">
          {getDescription(expression)}
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="text-sm text-textMuted mb-2">Presets</h3>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  const [min, hr, d, mo, wd] = p.value.split(' ')
                  setMinute(min); setHour(hr); setDay(d); setMonth(mo); setWeekday(wd)
                }}
                className="px-3 py-1 text-sm bg-surface border border-border rounded-lg text-text hover:bg-surfaceHover"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}