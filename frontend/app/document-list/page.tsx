'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout, TabType, ViewMode } from '@/components/AppLayout';
import { KnowledgeList } from '@/components/KnowledgeList';
import { KnowledgeForm } from '@/components/KnowledgeForm';
import KnowledgeNetwork from '@/components/KnowledgeNetwork';
import { getPopularKeywords } from '@/lib/api';
import type { Keyword } from '@/types/knowledge';

export default function DocumentListPage() {
  const searchParams = useSearchParams();

  // タブの状態管理
  const [activeTab, setActiveTab] = useState<TabType>('knowledge');

  // 表示モードの状態管理（一覧 or 作成）
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // ジャンル選択の状態管理
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(() => {
    const genreParam = searchParams.get('genre');
    return genreParam ? parseInt(genreParam, 10) : null;
  });

  // 検索クエリの状態管理
  const [searchQuery, setSearchQuery] = useState('');

  // 作成フォーム用のキーワード
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [keywordsLoading, setKeywordsLoading] = useState(false);
  const [keywordsError, setKeywordsError] = useState<string | null>(null);
  const [keywordsFetched, setKeywordsFetched] = useState(false); 

  // URLパラメータの変更を監視
  useEffect(() => {
    const genreParam = searchParams.get('genre');
    setSelectedGenreId(genreParam ? parseInt(genreParam, 10) : null);
  }, [searchParams]);

  // 作成モードに切り替わったときにキーワードを取得
useEffect(() => {
  if (viewMode === 'create' && !keywordsFetched && !keywordsLoading) { 
    const fetchKeywords = async () => {
      try {
        setKeywordsLoading(true);
        const data = await getPopularKeywords(20);
        setKeywords(data);
        setKeywordsFetched(true); 
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'キーワードの取得に失敗しました';
        setKeywordsError(msg);
        setKeywordsFetched(true); 
      } finally {
        setKeywordsLoading(false);
      }
    };
    fetchKeywords();
  }
}, [viewMode, keywordsFetched, keywordsLoading]); 

  // タブごとのコンテンツを描画
  const renderTabContent = () => {
    switch (activeTab) {
      case 'knowledge':
        // 作成モードの場合
        if (viewMode === 'create') {
          if (keywordsLoading) {
            return (
              <div className="flex flex-col items-center justify-center py-20 max-w-4xl">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                <p className="text-slate-500">読み込み中...</p>
              </div>
            );
          }
          if (keywordsError) {
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-4xl">
                <p className="text-red-600 mb-4">{keywordsError}</p>
                <Button onClick={() => window.location.reload()} variant="destructive">
                  再読み込み
                </Button>
              </div>
            );
          }
          return (
            <div className="max-w-4xl">
              <KnowledgeForm 
                availableKeywords={keywords}
                onCancel={() => setViewMode('list')}
              />
            </div>
          );
        }

        // 一覧モードの場合
        return (
          <>
            {/* 検索バー */}
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
            {/* ナレッジ一覧 */}
            <KnowledgeList
              selectedGenreId={selectedGenreId}
              searchQuery={searchQuery}
            />
          </>
        );

      case 'network':
        return (
          <>
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
                <KnowledgeNetwork 
                  genreId={selectedGenreId || undefined} 
                  onGenreSelect={setSelectedGenreId}
                />
              </div>
            </div>
          </>
        );

      case 'analytics':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed rounded-xl">
            <p className="text-lg font-medium mb-2">分析ダッシュボード</p>
            <p className="text-sm">ナレッジの統計情報を表示します（開発中）</p>
          </div>
        );

      case 'ai-search':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed rounded-xl">
            <p className="text-lg font-medium mb-2">AI検索</p>
            <p className="text-sm">AIによる高度な検索機能を提供します（開発中）</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      selectedGenreId={selectedGenreId}
      onSelectGenre={setSelectedGenreId}
      viewMode={viewMode}
      onViewModeChange={setViewMode}
    >
      {renderTabContent()}
    </AppLayout>
  );
}