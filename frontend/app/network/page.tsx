'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Network, BarChart3, Bot, History, Settings, Plus, LogIn, ZoomIn, ZoomOut } from 'lucide-react';
import KnowledgeNetwork from '@/components/KnowledgeNetwork';

export default function NetworkPage() {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* ヘッダー上段：サービスロゴとアクションボタン */}
      <header className="flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-30">
        <Link href="/document-list" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <BookOpen className="text-blue-600" size={32} />
          <h1 className="text-xl font-bold tracking-tight">ナレッジベース</h1>
        </Link>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
            <LogIn size={18} /> ログイン
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">
            <Plus size={18} /> 新規作成
          </button>
        </div>
      </header>

      {/* ヘッダー下段：ナビゲーションタブ
      <nav className="flex items-center gap-1 px-6 py-2 border-b bg-slate-50/50 sticky top-[65px] z-20">
        <Link
          href="/document-list"
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            pathname === '/document-list'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BookOpen size={16} />
          ナレッジ
        </Link>
        <Link
          href="/network"
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            pathname === '/network'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Network size={16} />
          ネットワーク
        </Link>
        <Link
          href="/analytics"
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            pathname === '/analytics'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <BarChart3 size={16} />
          分析
        </Link>
        <Link
          href="/ai-search"
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            pathname === '/ai-search'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Bot size={16} />
          AI検索
        </Link>
        <Link
          href="/history"
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            pathname === '/history'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <History size={16} />
          履歴
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            pathname === '/settings'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Settings size={16} />
          設定
        </Link>
      </nav> */}

      {/* メインコンテンツ */}
      <main className="flex-1 bg-slate-50/50 p-4 md:p-8">
        {/* タイトルセクション */}
        <div className="max-w-7xl mx-auto mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">ナレッジネットワーク</h2>
          <p className="text-sm text-slate-600">
            ナレッジ間の関連性を視覚化しています。ノードをクリックして詳細を表示できます。
          </p>
        </div>

        {/* ネットワークグラフカード */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="text-slate-400">読み込み中...</div>
                </div>
              }
            >
              <KnowledgeNetwork />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}