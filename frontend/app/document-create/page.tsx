'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /document-create への直接アクセス時は /document-list にリダイレクト
 * 新規作成はメインページ内の「新規作成」ボタンから行う
 */
export default function CreatePage() {
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