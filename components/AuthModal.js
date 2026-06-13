import React, { useState, useEffect, useRef } from 'react';

export default function AuthModal({
  open,
  onVerify,
  onClose,
  error,
  loading = false,
}) {
  const [key, setKey] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setKey('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    const trimmed = key.trim();
    if (!trimmed || loading) return;
    onVerify?.(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        role="dialog"
        className="bg-[#f5f5f7] dark:bg-[#1d1d1f] rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4"
      >
        <h2 className="text-[21px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
          输入密钥解锁
        </h2>
        <p className="text-[14px] text-[#6e6e73] mb-6">
          此功能需要验证身份
        </p>

        <input
          ref={inputRef}
          type="password"
          placeholder="请输入密钥"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="w-full h-11 px-4 rounded-lg border border-[#d2d2d7] dark:border-[#424245] bg-white dark:bg-[#000000] text-[17px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:border-transparent disabled:opacity-50 mb-4"
        />

        {error && (
          <p className="text-[14px] text-red-500 mb-4 animate-shake" role="alert">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !key.trim()}
          className="w-full h-11 rounded-full bg-[#0071e3] text-white text-[17px] font-semibold hover:bg-[#0066cc] active:bg-[#0055aa] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '验证中...' : '解锁'}
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
