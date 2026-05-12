import { useState, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { marked } from 'marked';

marked.use({ breaks: true });

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function MdPdfTool() {
  const [state, setState] = useState('idle'); // idle | loading | rendered | error
  const [fileName, setFileName] = useState('');
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback((file) => {
    if (!file.name.toLowerCase().endsWith('.md')) {
      setError('请上传 .md 格式的文件');
      setState('error');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('文件超过 10MB 大小限制，请选择更小的文件');
      setState('error');
      return;
    }

    setState('loading');
    setFileName(file.name);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rendered = marked.parse(text);
        setHtml(rendered);
        setState('rendered');
      } catch (err) {
        setError('Markdown 解析失败：' + err.message);
        setState('error');
      }
    };
    reader.onerror = () => {
      setError('文件读取失败，请重试');
      setState('error');
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDownload = useCallback(() => {
    window.print();
  }, []);

  const handleReset = useCallback(() => {
    setState('idle');
    setFileName('');
    setHtml('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Markdown to PDF - Vibe Tools</title>
        <meta name="description" content="Convert Markdown to PDF via browser print" />
      </Head>

      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center gap-6">
          <Link href="/" className="text-control text-textDim hover:text-text transition-colors">Vibe Tools</Link>
          <span className="text-control text-textDim">/</span>
          <span className="text-control font-medium text-text">Markdown to PDF</span>
        </div>
      </nav>

      <header className="border-b border-border py-10 page-header">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Markdown to PDF</h1>
          <p className="text-body text-textMuted">上传 .md 文件，生成精美 PDF</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Usage Guide — always visible */}
        <div className="usage-guide mb-8 p-5 bg-surface border border-border rounded-lg">
          <h2 className="text-body-emphasis font-semibold text-text mb-3">使用说明</h2>
          <ol className="list-decimal list-inside space-y-1.5 text-body text-textDim">
            <li><strong className="text-text">上传 Markdown 文件</strong> — 点击上传或拖拽 .md 文件到下方区域</li>
            <li><strong className="text-text">预览渲染效果</strong> — 自动渲染为排版精美的文档</li>
            <li><strong className="text-text">下载 PDF</strong> — 点击按钮，在打印对话框中选择"另存为 PDF"</li>
          </ol>
        </div>

        {/* Upload Area */}
        {(state === 'idle' || state === 'error') && (
          <div
            className={`upload-area relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-surface/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <div className="text-4xl mb-3 text-textDim">📄</div>
            <p className="text-body text-text font-medium mb-1">
              拖拽 .md 文件到此处
            </p>
            <p className="text-control text-textDim">
              或点击选择文件
            </p>
          </div>
        )}

        {/* Loading State */}
        {state === 'loading' && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-body text-textDim">正在渲染 {fileName}...</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {state === 'error' && error && (
          <div className="error-msg mt-4 text-error text-control p-4 bg-errorBg rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
            <button
              onClick={handleReset}
              className="ml-auto text-control underline hover:text-text transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {/* Rendered Preview */}
        {html && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-control text-textDim font-medium">
                文件：{fileName}
              </span>
              <button
                onClick={handleReset}
                className="text-control text-textDim underline hover:text-text transition-colors ml-auto"
              >
                换一个文件
              </button>
            </div>

            <div
              className="md-pdf-preview"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Download Button */}
            <div className="download-btn text-center mt-8 mb-12">
              <Button onClick={handleDownload} size="lg">
                下载 PDF
              </Button>
              <p className="text-micro text-textDim mt-2">
                点击后将在打印对话框中选择「另存为 PDF」保存文件
              </p>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-border py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center text-micro text-textDim">
          Vibe Tools
        </div>
      </footer>
    </div>
  );
}
