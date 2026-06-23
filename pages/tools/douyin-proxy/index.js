import React, { useCallback, useState } from 'react';
import Head from 'next/head';
import { useAuth } from '../../../contexts/AuthContext';
import AuthModal from '../../../components/AuthModal';

const EMBED_URL = 'https://douyin-proxy.qq1194117884.workers.dev';

export default function DouyinProxyTool() {
  const { isAuthenticated, verify } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

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

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Douyin Proxy -- Vibe Tools</title>
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

  return (
    <>
      <Head>
        <title>Douyin Proxy -- Vibe Tools</title>
      </Head>

      <div className="h-[calc(100vh-3rem)] md:h-screen bg-white dark:bg-black">
        <iframe
          title="Douyin Proxy"
          src={EMBED_URL}
          className="h-full w-full border-0"
          referrerPolicy="no-referrer"
          sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        />
      </div>
    </>
  );
}
