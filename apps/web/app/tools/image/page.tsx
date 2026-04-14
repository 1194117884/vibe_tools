'use client'

import { useState, useRef } from 'react'
import { ToolPage, Button, ResultBox } from '@vibe-tools/ui'

export default function ImageTool() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')
  const [preview, setPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(f)
    }
  }

  const handleConvert = async () => {
    if (!file || !canvasRef.current) return
    setLoading(true)
    
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current!
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      
      const dataUrl = canvas.toDataURL(`image/${format}`, 0.9)
      setPreview(dataUrl)
      setLoading(false)
    }
    img.src = preview
  }

  const handleDownload = () => {
    if (!preview) return
    const a = document.createElement('a')
    a.href = preview
    a.download = `converted.${format}`
    a.click()
  }

  return (
    <ToolPage title="Image Convert" icon="🖼">
      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-textMuted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-surface file:text-text file:cursor-pointer"
        />

        <div className="flex gap-2">
          {(['jpeg', 'png', 'webp'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3 py-1 rounded-lg text-sm ${format === f ? 'bg-primary text-white' : 'bg-surface border border-border text-text'}`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {file && (
          <Button onClick={handleConvert} disabled={loading}>
            {loading ? 'Converting...' : 'Convert'}
          </Button>
        )}

        {preview && (
          <ResultBox title="Preview">
            <img src={preview} alt="Preview" className="max-w-full rounded-lg" />
            <Button onClick={handleDownload} className="mt-2">
              Download
            </Button>
          </ResultBox>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </ToolPage>
  )
}