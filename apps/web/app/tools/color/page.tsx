'use client'

import { useState, useEffect } from 'react'
import { ToolPage, Button, ResultBox, CopyButton } from '@vibe-tools/ui'
import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from '@vibe-tools/utils'

export default function ColorTool() {
  const [hex, setHex] = useState('#d97706')
  const [rgb, setRgb] = useState({ r: 217, g: 119, b: 6 })
  const [hsl, setHsl] = useState({ h: 38, s: 95, l: 44 })

  useEffect(() => {
    const rgbVal = hexToRgb(hex)
    if (rgbVal) {
      setRgb(rgbVal)
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b))
    }
  }, [hex])

  const handleRgbChange = (r: number, g: number, b: number) => {
    setRgb({ r, g, b })
    setHex(rgbToHex(r, g, b))
    setHsl(rgbToHsl(r, g, b))
  }

  const handleHslChange = (h: number, s: number, l: number) => {
    setHsl({ h, s, l })
    const rgbVal = hslToRgb(h, s, l)
    setRgb(rgbVal)
    setHex(rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b))
  }

  return (
    <ToolPage title="Color Converter" icon="🎨">
      <div className="space-y-6">
        {/* Preview */}
        <div 
          className="h-32 rounded-xl border border-border"
          style={{ backgroundColor: hex }}
        />

        {/* HEX */}
        <div>
          <label className="block text-sm text-textMuted mb-1">HEX</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="flex-1 bg-surface border border-border rounded-lg p-2 text-text font-mono"
            />
            <CopyButton text={hex} />
          </div>
        </div>

        {/* RGB */}
        <ResultBox title="RGB">
          <div className="grid grid-cols-3 gap-2">
            {['r', 'g', 'b'].map((c) => (
              <div key={c}>
                <label className="block text-xs text-textMuted mb-1">{c.toUpperCase()}</label>
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb[c as keyof typeof rgb]}
                  onChange={(e) => handleRgbChange(
                    c === 'r' ? parseInt(e.target.value) || 0 : rgb.r,
                    c === 'g' ? parseInt(e.target.value) || 0 : rgb.g,
                    c === 'b' ? parseInt(e.target.value) || 0 : rgb.b
                  )}
                  className="w-full bg-background border border-border rounded-lg p-2 text-text text-center"
                />
              </div>
            ))}
          </div>
        </ResultBox>

        {/* HSL */}
        <ResultBox title="HSL">
          <div className="grid grid-cols-3 gap-2">
            {(['h', 's', 'l'] as const).map((c) => (
              <div key={c}>
                <label className="block text-xs text-textMuted mb-1">
                  {c === 'h' ? 'H (°)' : `${c.toUpperCase()} (%)`}
                </label>
                <input
                  type="number"
                  min={c === 'h' ? 0 : 0}
                  max={c === 'h' ? 360 : 100}
                  value={hsl[c]}
                  onChange={(e) => handleHslChange(
                    c === 'h' ? parseInt(e.target.value) || 0 : hsl.h,
                    c === 's' ? parseInt(e.target.value) || 0 : hsl.s,
                    c === 'l' ? parseInt(e.target.value) || 0 : hsl.l
                  )}
                  className="w-full bg-background border border-border rounded-lg p-2 text-text text-center"
                />
              </div>
            ))}
          </div>
        </ResultBox>
      </div>
    </ToolPage>
  )
}