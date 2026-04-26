import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { marked } from 'marked';

export default function MdPdfTool() {
  const [markdown, setMarkdown] = useState('# Hello World\n\nThis is a sample **markdown** document.');
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  const handleConvert = async () => {
    try {
      const convertedHtml = await marked(markdown);
      setHtml(convertedHtml);
      setError('');
    } catch (e) {
      setError('Conversion failed: ' + e.message);
      setHtml('');
    }
  };

  const handleClear = () => {
    setMarkdown('');
    setHtml('');
    setError('');
  };

  const handleDownloadPdf = () => {
    alert('In a real implementation, this would generate a PDF. Currently showing HTML preview.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Markdown to PDF - Vibe Tools</title>
        <meta name="description" content="Convert Markdown to PDF" />
      </Head>

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center gap-6">
          <Link href="/" className="text-control text-textDim hover:text-text transition-colors">Vibe Tools</Link>
          <span className="text-control text-textDim">/</span>
          <span className="text-control font-medium text-text">Markdown to PDF</span>
        </div>
      </nav>

      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Markdown to PDF</h1>
          <p className="text-body text-textMuted">Convert Markdown to PDF format</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-control font-medium text-text mb-2">Markdown Input</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Enter Markdown here..."
              className="w-full h-60 p-4 border border-border rounded bg-input text-text placeholder:text-textDim focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent resize-y font-mono text-control transition-colors duration-150"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleConvert}>Convert to HTML</Button>
            <Button onClick={handleClear} variant="ghost">Clear</Button>
            <Button onClick={handleDownloadPdf} variant="outline">Generate PDF</Button>
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {html && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border">
                <h3 className="text-body-emphasis text-text">HTML Preview</h3>
              </div>
              <div className="p-6 bg-background text-text text-body">
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center text-micro text-textDim">
          Vibe Tools
        </div>
      </footer>
    </div>
  );
}
