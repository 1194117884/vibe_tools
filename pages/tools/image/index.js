import { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

export default function ImageTool() {
  const [files, setFiles] = useState([]);
  const [queueStatus, setQueueStatus] = useState({});
  const [selectedFormat, setSelectedFormat] = useState('jpeg');
  const [quality, setQuality] = useState(0.8);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef(null);

  const isHeicFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif';
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).filter(
      (f) => f.type.startsWith('image/') || isHeicFile(f)
    );
    if (selected.length === 0) {
      setError('Please select valid image files');
      return;
    }
    setError('');
    setFiles(selected);
    const initial = {};
    selected.forEach((f) => {
      initial[f.name] = { status: 'pending' };
    });
    setQueueStatus(initial);
    setCurrentIndex(-1);
    setIsConverting(false);
  };

  const convertFile = async (file) => {
    let imageDataUrl;
    let needsRevoke = false;
    if (isHeicFile(file)) {
      const heic2any = (await import('heic2any')).default;
      const pngBlob = await heic2any({ blob: file, toType: 'image/png' });
      imageDataUrl = URL.createObjectURL(pngBlob instanceof Blob ? pngBlob : pngBlob[0]);
      needsRevoke = true;
    } else {
      imageDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (needsRevoke) URL.revokeObjectURL(imageDataUrl);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL(`image/${selectedFormat}`, parseFloat(quality));
        resolve(dataURL);
      };
      img.onerror = () => {
        if (needsRevoke) URL.revokeObjectURL(imageDataUrl);
        reject(new Error('Failed to load image for conversion'));
      };
      img.src = imageDataUrl;
    });
  };

  const handleStartConvert = async () => {
    if (files.length === 0) {
      setError('Please select images first');
      return;
    }
    setIsConverting(true);
    setError('');
    for (let i = 0; i < files.length; i++) {
      setCurrentIndex(i);
      setQueueStatus((prev) => ({
        ...prev,
        [files[i].name]: { status: 'converting' },
      }));
      try {
        const output = await convertFile(files[i]);
        setQueueStatus((prev) => ({
          ...prev,
          [files[i].name]: { status: 'done', output },
        }));
      } catch (e) {
        setQueueStatus((prev) => ({
          ...prev,
          [files[i].name]: { status: 'error', error: e.message },
        }));
      }
    }
    setIsConverting(false);
    setCurrentIndex(-1);
  };

  const handleDownload = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    link.download = `converted_image.${selectedFormat}`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>Image Converter - Vibe Tools</title>
        <meta name="description" content="Convert images between different formats" />
      </Head>
      <header className="border-b border-border py-10">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="font-display text-product text-text mb-1 tracking-tight">Image Converter</h1>
          <p className="text-body text-textMuted">Convert between HEIC, PNG, JPG, and WebP formats</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-surface">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.heic,.heif"
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Select Image
            </Button>
            {inputImage && (
              <div className="mt-4">
                <p className="text-control text-textMuted">{inputImage.name}</p>
                {loadingPreview ? (
                  <div className="mt-2 flex items-center justify-center gap-2 text-textMuted">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-control">Decoding HEIC preview...</span>
                  </div>
                ) : (
                  <img src={heicPreviewUrl || URL.createObjectURL(inputImage)} alt="Selected" className="mt-2 max-h-40 mx-auto rounded" />
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-control font-medium text-text mb-2">Output Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full p-3 border border-border rounded bg-input text-text focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-colors duration-150"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="block text-control font-medium text-text mb-2">Quality: {quality}</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full accent-primary"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Button onClick={handleConvert} disabled={converting}>
              {converting ? 'Converting...' : 'Convert Image'}
            </Button>
            {converting && (
              <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>

          {error && (
            <div className="text-error text-control p-3 bg-errorBg rounded">{error}</div>
          )}

          {outputImage && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2.5 border-b border-border flex justify-between items-center">
                <h3 className="text-body-emphasis text-text">Converted Image</h3>
                <Button variant="ghost" size="sm" onClick={handleDownload}>Download</Button>
              </div>
              <div className="p-4 flex justify-center bg-input">
                <img src={outputImage} alt="Converted" className="max-h-60 rounded" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
