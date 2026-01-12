'use client';

import { useState } from 'react';
import { Search, BookOpen, Network, BarChart3, Bot, Plus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GenreSelector } from '@/components/GenreSelector';
import { KnowledgeList } from '@/components/KnowledgeList';

/**
 * ドキュメント一覧画面（ナレッジベース）メインコンポーネント
 * * 役割:
 * 1. ページ全体のレイアウト定義（ヘッダー、サイドバー、メインエリア）
 * 2. 子コンポーネント間で共有するフィルタリング状態（ジャンル、検索ワード）の管理
 */
export default function DocumentListPage() {
  // --- ステート管理 ---
  
  // 選択されたジャンルID（サイドバーのGenreSelectorから更新、KnowledgeListに渡してフィルタリング）
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  
  // 検索入力文字列（検索バーから更新、KnowledgeListに渡して絞り込み）
  const [searchQuery, setSearchQuery] = useState('');

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
          <Button className="bg-black text-white hover:bg-slate-800 gap-2">
            <Plus size={18} /> 新規作成
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
          <Tabs defaultValue="knowledge" className="w-full">
            {/* ナビゲーションタブ：将来的に各分析画面やAI検索機能へ拡張予定 */}
            <TabsList className="bg-slate-200/50 p-1 mb-8">
              <TabsTrigger value="knowledge" className="gap-2"><BookOpen size={16}/>ナレッジ</TabsTrigger>
              <TabsTrigger value="network" className="gap-2"><Network size={16}/>ネットワーク</TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2"><BarChart3 size={16}/>分析</TabsTrigger>
              <TabsTrigger value="ai-search" className="gap-2"><Bot size={16}/>AI検索</TabsTrigger>
            </TabsList>

            {/* ナレッジ一覧タブの内容 */}
            <TabsContent value="knowledge" className="space-y-6">
              {/* テキスト入力による動的検索バー */}
              <div className="relative max-w-4xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  placeholder="ナレッジを検索..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* ナレッジ一覧表示コンポーネント
                  propsとしてフィルタリング用のステートを渡し、内部でAPI通信と表示を実行
              */}
              <KnowledgeList 
                selectedGenreId={selectedGenreId} 
                searchQuery={searchQuery} 
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}