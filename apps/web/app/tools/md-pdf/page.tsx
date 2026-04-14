'use client'

import { useState, useRef, useEffect } from 'react'
import { ToolPage, Button, TextArea } from '@vibe-tools/ui'
import { marked } from 'marked'

export default function MdPdfTool() {
  const [input, setInput] = useState('')
  const [html, setHtml] = useState('')
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHtml(marked(input) as string)
  }, [input])

  const handlePrint = () => {
    const content = printRef.current
    if (!content) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Markdown PDF</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
          }
          h1, h2, h3 { margin-top: 1.5em; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
          pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
          blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          img { max-width: 100%; }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <ToolPage title="Markdown → PDF" icon="📄">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <TextArea
            value={input}
            onChange={setInput}
            placeholder="# Title

Write your markdown here..."
            rows={20}
          />
          <Button onClick={handlePrint} disabled={!input}>
            Export to PDF
          </Button>
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6 overflow-auto max-h-[600px]">
          <div 
            ref={printRef}
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </ToolPage>
  )
}