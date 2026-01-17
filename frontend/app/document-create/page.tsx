'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { KnowledgeForm } from '@/components/KnowledgeForm';
import { getPopularKeywords } from '@/lib/api';
import type { Keyword } from '@/types/knowledge';

export default function CreatePage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 人気キーワードを取得
        const keywordsData = await getPopularKeywords(20);
        setKeywords(keywordsData);
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'データの取得に失敗しました';
        setError(errorMessage);
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        {/* 共通ヘッダー：サービスロゴとアクションボタン */}
        <header className="flex items-center justify-between px-6 py-3 border-b sticky top-0 bg-white dark:bg-black z-20">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" size={32} />
            <h1 className="text-xl font-bold tracking-tight">ナレッジベース</h1>
          </div>
        </header>

        {/* ローディング */}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-50 mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black">      
        {/* 共通ヘッダー：サービスロゴとアクションボタン */}
        <header className="flex items-center justify-between px-6 py-3 border-b sticky top-0 bg-white dark:bg-black z-20">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" size={32} />
            <h1 className="text-xl font-bold tracking-tight">ナレッジベース</h1>
          </div>
        </header>

        {/* エラー表示 */}
        <div className="container mx-auto p-8">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              再読み込み
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* 共通ヘッダー：サービスロゴとアクションボタン */}
      <header className="flex items-center justify-between px-6 py-3 border-b sticky top-0 bg-white dark:bg-black z-20">
        <Link href="/document-list" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" size={32} />
            <h1 className="text-xl font-bold tracking-tight">ナレッジベース</h1>
          </div>
        </Link>
      </header>

      {/* フォーム */}
      <div className="container mx-auto p-8 max-w-4xl">
        <KnowledgeForm 
          availableKeywords={keywords}
        />
      </div>
    </div>
  );
}