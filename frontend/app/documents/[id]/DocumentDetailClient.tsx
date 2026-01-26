'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppLayout, TabType } from '@/components/AppLayout';
import KnowledgeDetail from '@/components/KnowledgeDetail';
import DocumentQASession from '@/components/DocumentQASession';

export default function DocumentDetailClient({ id }: { id: string }) {
  // 一覧画面と共通の状態管理
  const [activeTab, setActiveTab] = useState<TabType>('knowledge');
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  // タブごとのコンテンツを描画
  const renderTabContent = () => {
    switch (activeTab) {
      case 'knowledge':
        return (
          <div className="max-w-4xl space-y-6">
            <div className="mb-2">
              <Link
                href="/document-list"
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={16} />
                一覧に戻る
              </Link>
            </div>

            {/* ナレッジ本文エリア */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
              <KnowledgeDetail id={id} />
            </div>

            {/* QAセッション */}
            <DocumentQASession documentId={id} />
          </div>
        );

      case 'network':
        return (
          <div className="max-w-4xl text-center py-20 text-slate-500">
            ネットワーク表示は一覧画面で確認してください。
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed rounded-xl">
            <p className="text-sm">この機能は詳細画面では開発中です</p>
          </div>
        );
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      selectedGenreId={selectedGenreId}
      onSelectGenre={setSelectedGenreId}
      // 詳細画面なので viewMode は固定、または必要に応じて管理
      viewMode="list" 
      onViewModeChange={() => {}} 
    >
      {renderTabContent()}
    </AppLayout>
  );
}