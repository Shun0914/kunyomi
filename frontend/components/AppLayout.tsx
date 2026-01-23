'use client';

import React, { ReactNode } from 'react';
import Image from 'next/image';
import { BookOpen, Network, BarChart3, Bot, Plus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GenreSelector } from '@/components/GenreSelector';

export type TabType = 'knowledge' | 'network' | 'analytics' | 'ai-search';
export type ViewMode = 'list' | 'create';

interface AppLayoutProps {
  children: ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  selectedGenreId: number | null;
  onSelectGenre: (id: number | null) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const tabs: { value: TabType; label: string; icon: React.ReactNode }[] = [
  { value: 'knowledge', label: 'ナレッジ', icon: <BookOpen size={16} /> },
  { value: 'network', label: 'ネットワーク', icon: <Network size={16} /> },
  { value: 'analytics', label: '分析', icon: <BarChart3 size={16} /> },
  { value: 'ai-search', label: 'AI検索', icon: <Bot size={16} /> },
];

export function AppLayout({
  children,
  activeTab,
  onTabChange,
  selectedGenreId,
  onSelectGenre,
  viewMode, // 現時点では直接使っていないが、親との契約として保持
  onViewModeChange,
}: AppLayoutProps) {
  const handleLogoClick = () => {
    onViewModeChange('list');
    onTabChange('knowledge');
  };

  const handleCreateClick = () => {
    onViewModeChange('create');
    onTabChange('knowledge');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* 共通ヘッダー */}
      <header className="flex items-center justify-between px-6 py-3 border-b sticky top-0 bg-white z-20">
        <button
          onClick={handleLogoClick}
          className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="TSUMIBA Home"
        >
          <Image
            src="/brand/tsumiba-logo-trim.png"
            alt="TSUMIBA"
            width={260}
            height={52}
            priority
            className="h-10 md:h-12 w-auto"
          />
        </button>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="gap-2">
            <LogIn size={18} /> ログイン
          </Button>

          <Button onClick={handleCreateClick} className="bg-black text-white hover:bg-slate-800 gap-2">
            <Plus size={18} /> 新規作成
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー */}
        <aside className="w-64 border-r bg-white sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto">
          <GenreSelector selectedGenreId={selectedGenreId} onSelectGenre={onSelectGenre} />
        </aside>

        {/* メインエリア */}
        <main className="flex-1 bg-slate-50/50 p-4 md:p-8">
          {/* タブナビゲーション */}
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-slate-200/50 p-1 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onTabChange(tab.value)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 gap-2 ${
                    activeTab === tab.value
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-white/50'
                  }`}
                aria-current={activeTab === tab.value ? 'page' : undefined}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* コンテンツ */}
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
