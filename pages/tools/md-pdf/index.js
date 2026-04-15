import { useState } from 'react';
import Head from 'next/head';
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
    // Since we're in the browser, we can create a print-friendly version
    // Actual PDF generation would require a library like jsPDF or Puppeteer
    alert('In a real implementation, this would generate a PDF. Currently showing HTML preview.');
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Markdown to PDF - Vibe Tools</title>
        <meta name="description" content="Convert Markdown to PDF" />
      </Head>

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">📄</div>
            <div>
              <h1 className="text-2xl font-bold text-text">Markdown to PDF</h1>
              <p className="text-textMuted">Convert Markdown to PDF format</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Markdown Input</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Enter Markdown here..."
              className="w-full h-60 p-4 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleConvert}>Convert to HTML</Button>
            <Button onClick={handleClear} variant="secondary">Clear</Button>
            <Button onClick={handleDownloadPdf} variant="secondary">Generate PDF</Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {html && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2 border-b border-border">
                <h3 className="font-medium text-text">HTML Preview</h3>
              </div>
              <div className="p-6 bg-white prose max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center text-textDim text-sm">
          Built with ❤️ using Next.js
        </div>
      </footer>
    </div>
  );
}