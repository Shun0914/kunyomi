'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Network, BarChart3, Bot, Plus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GenreSelector } from '@/components/GenreSelector';
import KnowledgeNetwork from '@/components/KnowledgeNetwork';

/**
 * ネットワークグラフ画面（ナレッジベース）
 * 
 * 役割:
 * 1. ページ全体のレイアウト定義（ヘッダー、サイドバー、メインエリア）
 * 2. 子コンポーネント間で共有するフィルタリング状態（ジャンル）の管理
 * 3. URLパラメータ（?genre=...）からのジャンルフィルタの適用
 */
export default function NetworkPage() {
  const searchParams = useSearchParams();
  
  // --- ステート管理 ---
  
  // 選択されたジャンルID（サイドバーのGenreSelectorから更新、KnowledgeNetworkに渡してフィルタリング）
  // URLパラメータ（?genre=...）から初期値を設定
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(() => {
    const genreParam = searchParams.get('genre');
    return genreParam ? parseInt(genreParam, 10) : null;
  });
  
  // URLパラメータの変更を監視し、ジャンルIDを更新
  useEffect(() => {
    const genreParam = searchParams.get('genre');
    setSelectedGenreId(genreParam ? parseInt(genreParam, 10) : null);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* 共通ヘッダー：サービスロゴとアクションボタン */}
      <header className="flex items-center justify-between px-6 py-3 border-b sticky top-0 bg-white z-20">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600" size={32} />
          <h1 className="text-xl font-bold tracking-tight">ナレッジベース</h1>
        </div>
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
        <aside className="w-64 border-r min-h-[calc(100vh-65px)] bg-white sticky top-[65px]">
          <GenreSelector 
            selectedGenreId={selectedGenreId} 
            onSelectGenre={setSelectedGenreId} 
          />
        </aside>

        {/* メインエリア：タブ切り替えとコンテンツ表示 */}
        <main className="flex-1 bg-slate-50/50 p-4 md:p-8">
          <Tabs value="network" className="w-full">
            {/* ナビゲーションタブ：将来的に各分析画面やAI検索機能へ拡張予定 */}
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
              {/* 説明エリア */}
              <div className="max-w-4xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">ナレッジネットワーク</h2>
                <p className="text-sm text-slate-600">
                  ナレッジ間の関連性を視覚化しています。ノードをクリックして詳細を表示できます。
                </p>
              </div>

              {/* ネットワークグラフ表示コンポーネント */}
              <div className="max-w-4xl">
                <div 
                  className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden" 
                  style={{ height: 'calc(100vh - 340px)', minHeight: '500px' }}
                >
                  <KnowledgeNetwork genreId={selectedGenreId || undefined} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}