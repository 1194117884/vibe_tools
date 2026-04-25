import { useState, useRef } from 'react';
import Head from 'next/head';
import { Button } from '../../../components/ui/button';

export default function ImageTool() {
  const [inputImage, setInputImage] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('jpeg');
  const [quality, setQuality] = useState(0.8);
  const [error, setError] = useState('');
  const [heicPreviewUrl, setHeicPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [converting, setConverting] = useState(false);
  const fileInputRef = useRef(null);

  const isHeicFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif';
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && (file.type.startsWith('image/') || isHeicFile(file))) {
      setInputImage(file);
      setError('');
      setOutputImage(null);

      // For HEIC, immediately decode a preview since browsers can't render HEIC natively
      if (isHeicFile(file)) {
        setLoadingPreview(true);
        try {
          const heic2any = (await import('heic2any')).default;
          const pngBlob = await heic2any({ blob: file, toType: 'image/png' });
          const blob = pngBlob instanceof Blob ? pngBlob : pngBlob[0];
          if (heicPreviewUrl) URL.revokeObjectURL(heicPreviewUrl);
          setHeicPreviewUrl(URL.createObjectURL(blob));
        } catch {
          setHeicPreviewUrl(null);
        } finally {
          setLoadingPreview(false);
        }
      } else {
        if (heicPreviewUrl) URL.revokeObjectURL(heicPreviewUrl);
        setHeicPreviewUrl(null);
      }
    } else {
      setError('Please select a valid image file');
    }
  };

const handleConvert = async () => {
    if (!inputImage) {
      setError('Please select an image first');
      return;
    }

    setConverting(true);
    setError('');
    try {
      let imageDataUrl;

      if (isHeicFile(inputImage)) {
        const heic2any = (await import('heic2any')).default;
        const pngBlob = await heic2any({
          blob: inputImage,
          toType: 'image/png',
        });
        imageDataUrl = URL.createObjectURL(pngBlob instanceof Blob ? pngBlob : pngBlob[0]);
      } else {
        imageDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(inputImage);
        });
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL(`image/${selectedFormat}`, parseFloat(quality));
        setOutputImage(dataURL);
        setConverting(false);
      };
      img.onerror = () => {
        setError('Failed to load image for conversion');
        setConverting(false);
      };
      img.src = imageDataUrl;
    } catch (e) {
      setError('Conversion failed: ' + e.message);
      setConverting(false);
    }
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

      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🖼</div>
            <div>
              <h1 className="text-2xl font-bold text-text">Image Converter</h1>
              <p className="text-textMuted">Convert between HEIC, PNG, JPG, and WebP formats</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
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
                <p className="text-sm text-textMuted">{inputImage.name}</p>
                {loadingPreview ? (
                  <div className="mt-2 flex items-center justify-center gap-2 text-textMuted">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm">Decoding HEIC preview...</span>
                  </div>
                ) : (
                  <img src={heicPreviewUrl || URL.createObjectURL(inputImage)} alt="Selected" className="mt-2 max-h-40 mx-auto rounded" />
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Output Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">Quality: {quality}</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
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
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {outputImage && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-surface px-4 py-2 border-b border-border flex justify-between items-center">
                <h3 className="font-medium text-text">Converted Image</h3>
                <Button variant="secondary" onClick={handleDownload}>
                  Download
                </Button>
              </div>
              <div className="p-4 flex justify-center">
                <img src={outputImage} alt="Converted" className="max-h-60 rounded" />
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