'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { BookOpen, Network, BarChart3, Bot, Plus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GenreSelector } from '@/components/GenreSelector';
import KnowledgeNetwork from '@/components/KnowledgeNetwork';

/**
 * ネットワークグラフ画面
 * 
 * 役割:
 * 1. ページ全体のレイアウト定義（ヘッダー、サイドバー、メインエリア）
 * 2. ジャンル選択によるネットワークグラフのフィルタリング
 * 3. タブナビゲーションでネットワークビューをアクティブ表示
 */
export default function NetworkPage() {
  // --- ステート管理 ---
  
  // 選択されたジャンルID（サイドバーのGenreSelectorから更新、KnowledgeNetworkに渡してフィルタリング）
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* 共通ヘッダー：サービスロゴとアクションボタン */}
      <header className="flex items-center justify-between px-6 py-3 border-b sticky top-0 bg-white z-20">
        <Link href="/document-list" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <BookOpen className="text-blue-600" size={32} />
          <h1 className="text-xl font-bold tracking-tight">ナレッジベース</h1>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="gap-2"><LogIn size={18} /> ログイン</Button>
          <Button asChild className="bg-black text-white hover:bg-slate-800 gap-2">
            <Link href="/document-create">
              <Plus size={18} /> 新規作成
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー：ジャンル選択によるフィルタリング */}
        <aside className="w-60 border-r min-h-[calc(100vh-65px)] bg-white sticky top-[65px] overflow-y-auto">
          <GenreSelector 
            selectedGenreId={selectedGenreId} 
            onSelectGenre={setSelectedGenreId} 
          />
        </aside>

        {/* メインエリア：タブ切り替えとコンテンツ表示 */}
        <main className="flex-1 bg-slate-50/50 p-4 md:p-8 min-w-0">
          <Tabs value="network" className="w-full">
            {/* ナビゲーションタブ：ネットワークをアクティブに */}
            <TabsList className="bg-slate-200/50 p-1 mb-8">
              <TabsTrigger value="knowledge" className="gap-2" asChild>
                <Link href="/document-list">
                  <BookOpen size={16}/>ナレッジ
                </Link>
              </TabsTrigger>
              <TabsTrigger value="network" className="gap-2">
                <Network size={16}/>ネットワーク
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2" asChild>
                <Link href="/analytics">
                  <BarChart3 size={16}/>分析
                </Link>
              </TabsTrigger>
              <TabsTrigger value="ai-search" className="gap-2" asChild>
                <Link href="/ai-search">
                  <Bot size={16}/>AI検索
                </Link>
              </TabsTrigger>
            </TabsList>

            {/* ネットワークタブの内容 */}
            <TabsContent value="network" className="space-y-6">
              {/* 説明テキスト */}
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">ナレッジネットワーク</h2>
                <p className="text-sm text-slate-600">
                  ナレッジ間の関連性を視覚化しています。ノードをクリックして詳細を表示できます。
                  {selectedGenreId && '左のサイドバーからジャンルを選択してフィルタリングできます。'}
                </p>
              </div>

              {/* ネットワークグラフカード */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 340px)', minHeight: '500px' }}>
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <div className="text-slate-400">読み込み中...</div>
                    </div>
                  }
                >
                  <KnowledgeNetwork genreId={selectedGenreId || undefined} />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}