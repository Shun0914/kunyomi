'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Network, BarChart3, Bot, Plus, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GenreSelector } from '@/components/GenreSelector';
import { KnowledgeForm } from '@/components/KnowledgeForm';
import { getPopularKeywords } from '@/lib/api';
import type { Keyword } from '@/types/knowledge';

export default function CreatePage(): React.ReactElement {
  const router = useRouter();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
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

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* 共通ヘッダー */}
      <header className="flex items-center justify-between px-6 py-3 border-b sticky top-0 bg-white z-20">
        <Link href="/document-list" className="flex items-center gap-2">
          <BookOpen className="text-blue-600" size={32} />
          <h1 className="text-xl font-bold tracking-tight">ナレッジベース</h1>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="gap-2">
            <LogIn size={18} /> ログイン
          </Button>
          <Button asChild className="bg-black text-white hover:bg-slate-800 gap-2">
            <Link href="/document-create">
              <Plus size={18} /> 新規作成
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー */}
        <aside className="w-64 border-r min-h-[calc(100vh-65px)] bg-white sticky top-[65px]">
          <GenreSelector 
            selectedGenreId={selectedGenreId} 
            onSelectGenre={setSelectedGenreId} 
          />
        </aside>

        {/* メインエリア */}
        <main className="flex-1 bg-slate-50/50 p-4 md:p-8">
          <Tabs defaultValue="knowledge" className="w-full">
            {/* ナビゲーションタブ */}
            <TabsList className="bg-slate-200/50 p-1 mb-8">
              <TabsTrigger value="knowledge" className="gap-2">
                <BookOpen size={16} />ナレッジ
              </TabsTrigger>
              <TabsTrigger value="network" className="gap-2" onClick={() => router.push('/network')}>
                <Network size={16} />ネットワーク
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 size={16} />分析
              </TabsTrigger>
              <TabsTrigger value="ai-search" className="gap-2">
                <Bot size={16} />AI検索
              </TabsTrigger>
            </TabsList>

            {/* ナレッジ作成タブの内容 */}
            <TabsContent value="knowledge" className="space-y-6">
              <div className="max-w-4xl">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                    <p className="text-slate-500">読み込み中...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="destructive"
                    >
                      再読み込み
                    </Button>
                  </div>
                ) : (
                  <KnowledgeForm availableKeywords={keywords} />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}