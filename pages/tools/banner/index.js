import Head from 'next/head';
import dynamic from 'next/dynamic';

const BannerContent = dynamic(() => import('./BannerContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-body text-textDim">Loading…</p>
    </div>
  ),
});

export default function BannerPage() {
  return (
    <>
      <Head>
        <title>Banner Text Generator - Vibe Tools</title>
        <meta name="description" content="Generate ASCII art text banners with FIGlet fonts" />
      </Head>
      <BannerContent />
    </>
  );
}
