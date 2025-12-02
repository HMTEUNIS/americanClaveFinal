'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PurchaseSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [purchaseData, setPurchaseData] = useState<{
    albumTitle: string;
    downloadUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setIsLoading(false);
      return;
    }

    // Verify purchase and get download link
    const verifyPurchase = async () => {
      try {
        const response = await fetch(`/api/purchase/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setPurchaseData({
            albumTitle: data.albumTitle,
            downloadUrl: data.downloadUrl,
          });
        } else {
          setError(data.error || 'Failed to verify purchase');
        }
      } catch (err) {
        console.error('Error verifying purchase:', err);
        setError('Error verifying purchase. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPurchase();
  }, [sessionId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-[#bc7d30] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Verifying your purchase...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-[#bc7d30]">
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Purchase Verification Failed</h1>
            <p className="text-lg mb-8 text-[#bc7d30]/80">{error}</p>
            <Link
              href="/purchase"
              className="inline-block px-6 py-3 bg-[#bc7d30] text-black font-bold rounded-lg hover:bg-[#bc7d30]/80 transition-colors"
            >
              Return to Purchase Page
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!purchaseData) {
    return null;
  }

  return (
    <main className="min-h-screen bg-black text-[#bc7d30]">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Purchase Successful!</h1>
          <p className="text-2xl mb-8 text-[#bc7d30]/80">
            Thank you for your purchase of <strong>{purchaseData.albumTitle}</strong>
          </p>

          <div className="border border-[#bc7d30]/30 rounded-lg p-8 mb-8 bg-black/50">
            <h2 className="text-2xl font-bold mb-4">Download Your Album</h2>
            <p className="text-lg mb-6 text-[#bc7d30]/80">
              Your lossless WAV download is ready. Click the button below to download.
            </p>
            <a
              href={purchaseData.downloadUrl}
              download
              className="inline-block px-8 py-4 bg-[#bc7d30] text-black font-bold rounded-lg hover:bg-[#bc7d30]/80 transition-colors text-lg"
            >
              Download WAV File
            </a>
            <p className="text-sm text-[#bc7d30]/60 mt-4">
              This download link will remain active. Please save your file.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/music"
              className="block px-6 py-3 border border-[#bc7d30]/30 rounded-lg hover:border-[#bc7d30]/60 transition-colors"
            >
              Browse More Albums
            </Link>
            <Link
              href="/purchase"
              className="block px-6 py-3 border border-[#bc7d30]/30 rounded-lg hover:border-[#bc7d30]/60 transition-colors"
            >
              Purchase Another Album
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black text-[#bc7d30] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Loading...</p>
        </div>
      </main>
    }>
      <PurchaseSuccessContent />
    </Suspense>
  );
}

