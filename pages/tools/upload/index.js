import React, { useState, useRef, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../../../contexts/AuthContext';
import AuthModal from '../../../components/AuthModal';

const MAX_CONCURRENT = 3;

export default function UploadTool() {
  const { isAuthenticated, verify, token } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [queueActive, setQueueActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleVerify = useCallback(async (key) => {
    setAuthLoading(true);
    setAuthError('');
    const err = await verify(key);
    if (err) {
      setAuthError(err);
    } else {
      setShowAuthModal(false);
      setAuthError('');
    }
    setAuthLoading(false);
  }, [verify]);

  const addFiles = useCallback((newFiles) => {
    const entries = Array.from(newFiles).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      status: 'pending',
      progress: 0,
      publicUrl: null,
      error: null,
    }));
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const removeFile = useCallback((id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const retryFile = useCallback((id) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'pending', error: null, progress: 0 } : f))
    );
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer?.files;
    if (dropped?.length) addFiles(dropped);
  }, [addFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer?.types?.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = '';
  }, [addFiles]);

  const uploadFile = useCallback(async (fileEntry) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileEntry.id ? { ...f, status: 'uploading', progress: 0 } : f))
    );

    try {
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileName: fileEntry.file.name,
          fileSize: fileEntry.file.size,
          contentType: fileEntry.file.type || 'application/octet-stream',
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error || '获取上传地址失败');
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', fileEntry.file.type || 'application/octet-stream');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setFiles((prev) =>
              prev.map((f) => (f.id === fileEntry.id ? { ...f, progress } : f))
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) resolve();
          else reject(new Error(`Upload failed with status ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error('网络连接中断'));
        xhr.send(fileEntry.file);
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileEntry.id ? { ...f, status: 'done', progress: 100, publicUrl } : f
        )
      );
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileEntry.id ? { ...f, status: 'error', error: err.message } : f
        )
      );
    }
  }, [token]);

  // Auto-queue: when uploads finish and more are pending, start the next batch
  useEffect(() => {
    if (!queueActive) return;

    const pending = files.filter((f) => f.status === 'pending');
    const uploading = files.filter((f) => f.status === 'uploading');

    if (pending.length === 0 && uploading.length === 0) {
      setQueueActive(false);
      return;
    }

    if (pending.length > 0 && uploading.length < MAX_CONCURRENT) {
      const slots = MAX_CONCURRENT - uploading.length;
      const nextBatch = pending.slice(0, slots);
      nextBatch.forEach((f) => uploadFile(f));
    }
  }, [files, queueActive, uploadFile]);

  const startQueue = useCallback(() => {
    setQueueActive(true);
    const pending = files.filter((f) => f.status === 'pending');
    const uploading = files.filter((f) => f.status === 'uploading');
    const slots = MAX_CONCURRENT - uploading.length;
    pending.slice(0, slots).forEach((f) => uploadFile(f));
  }, [files, uploadFile]);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }, []);

  // --- Locked state ---
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Upload -- Vibe Tools</title>
        </Head>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-16 h-16 rounded-full bg-[#f5f5f7] dark:bg-[#1d1d1f] flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[#86868b]">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="text-[21px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            这是一个私密工具
          </h2>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-5 h-10 rounded-full bg-[#0071e3] text-white text-[15px] font-semibold hover:bg-[#0066cc] transition-colors"
          >
            输入密钥解锁
          </button>
        </div>

        <AuthModal
          open={showAuthModal}
          onVerify={handleVerify}
          onClose={() => setShowAuthModal(false)}
          error={authError}
          loading={authLoading}
        />
      </>
    );
  }

  // --- Unlocked state ---
  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const uploadingCount = files.filter((f) => f.status === 'uploading').length;
  const errorCount = files.filter((f) => f.status === 'error').length;
  const hasPending = pendingCount > 0 && !queueActive;

  return (
    <>
      <Head>
        <title>Upload -- Vibe Tools</title>
      </Head>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-[28px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-6">
          上传文件
        </h1>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#0071e3] bg-[#0071e3]/5'
              : 'border-[#d2d2d7] dark:border-[#424245] hover:border-[#86868b]'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[#86868b]">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-[17px] text-[#1d1d1f] dark:text-[#f5f5f7] font-medium">
              拖拽文件到此处或点击选择
            </p>
            <p className="text-[14px] text-[#6e6e73]">
              支持图片、PDF、文档、压缩包，最大 100MB
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Queue status banner */}
        {queueActive && (uploadingCount > 0 || pendingCount > 0) && (
          <div className="mt-4 px-4 py-2 bg-[#0071e3]/10 rounded-xl text-center">
            <span className="text-[14px] text-[#0071e3] font-medium">
              上传中 {uploadingCount} 个
              {pendingCount > 0 && ` · 等待中 ${pendingCount} 个`}
            </span>
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            {files.map((f) => (
              <div
                key={f.id}
                className="bg-white dark:bg-[#1d1d1f] border border-[#d2d2d7] dark:border-[#424245] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[17px] truncate text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {f.file.name}
                    </span>
                    <span className="text-[14px] text-[#6e6e73] shrink-0">
                      {(f.file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  {(f.status === 'pending' || f.status === 'error') && (
                    <button
                      onClick={() => removeFile(f.id)}
                      title="移除文件"
                      className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] shrink-0 ml-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="4" x2="12" y2="12" />
                        <line x1="12" y1="4" x2="4" y2="12" />
                      </svg>
                    </button>
                  )}
                  {f.status === 'done' && (
                    <button
                      onClick={() => removeFile(f.id)}
                      title="移除文件"
                      className="text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] shrink-0 ml-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="4" x2="12" y2="12" />
                        <line x1="12" y1="4" x2="4" y2="12" />
                      </svg>
                    </button>
                  )}
                </div>

                {(f.status === 'pending' || f.status === 'uploading') && (
                  <div className="w-full h-1.5 bg-[#f5f5f7] dark:bg-[#000000] rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-[#0071e3] rounded-full transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  {f.status === 'pending' && (
                    <span className="text-[14px] text-[#86868b]">等待上传</span>
                  )}
                  {f.status === 'uploading' && (
                    <span className="text-[14px] text-[#0071e3]">上传中 {f.progress}%</span>
                  )}
                  {f.status === 'done' && (
                    <>
                      <span className="text-[14px] text-green-600">{'✅ 上传完成'}</span>
                      <button
                        onClick={() => copyToClipboard(f.publicUrl)}
                        className="text-[14px] text-[#0071e3] hover:text-[#0066cc] font-medium"
                      >
                        复制链接
                      </button>
                    </>
                  )}
                  {f.status === 'error' && (
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] text-red-500">{f.error}</span>
                      <button
                        onClick={() => retryFile(f.id)}
                        className="text-[14px] text-[#0071e3] hover:text-[#0066cc] font-medium"
                      >
                        重试
                      </button>
                    </div>
                  )}
                </div>

                {f.publicUrl && (
                  <div className="mt-2 p-2 bg-[#f5f5f7] dark:bg-[#000000] rounded-lg">
                    <code className="text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] break-all font-mono">
                      {f.publicUrl}
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Start / Retry All button */}
        {hasPending && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={startQueue}
              className="px-6 h-11 rounded-full bg-[#0071e3] text-white text-[15px] font-semibold hover:bg-[#0066cc] transition-colors"
            >
              开始上传
            </button>
          </div>
        )}

        {/* Retry all failed button */}
        {!queueActive && errorCount > 0 && !hasPending && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.status === 'error' ? { ...f, status: 'pending', error: null, progress: 0 } : f
                  )
                );
              }}
              className="px-6 h-11 rounded-full border border-[#0071e3] text-[#0071e3] text-[15px] font-semibold hover:bg-[#0071e3]/10 transition-colors"
            >
              重试全部失败 ({errorCount})
            </button>
          </div>
        )}
      </div>
    </>
  );
}
