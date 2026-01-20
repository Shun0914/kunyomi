'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /network への直接アクセス時は /document-list にリダイレクト
 * ネットワーク表示はメインページ内の「ネットワーク」タブから行う
 */
export default function NetworkPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/document-list');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">リダイレクト中...</p>
    </div>
  );
}