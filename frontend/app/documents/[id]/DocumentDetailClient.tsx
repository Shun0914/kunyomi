'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, LogIn, Plus, ArrowLeft, Network, BarChart3, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GenreSelector } from '@/components/GenreSelector';
import KnowledgeDetail from '@/components/KnowledgeDetail';

export default function DocumentDetailClient({ id }: { id: string }) {
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="flex items-center justify-between px-6 py-3 border-b sticky top-0 bg-white z-20">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-600" size={32} />
          <Link href="/document-list" className="text-xl font-bold tracking-tight">
            ナレッジベース
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="gap-2">
            <LogIn size={18} /> ログイン
          </Button>
          <Button className="bg-black text-white hover:bg-slate-800 gap-2">
            <Plus size={18} /> 新規作成
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r min-h-[calc(100vh-65px)] bg-white sticky top-[65px]">
          <GenreSelector selectedGenreId={selectedGenreId} onSelectGenre={setSelectedGenreId} />
        </aside>

        <main className="flex-1 bg-slate-50/50 p-4 md:p-8">
          <Tabs defaultValue="knowledge" className="w-full">
            <TabsList className="bg-slate-200/50 p-1 mb-8">
              <TabsTrigger value="knowledge" className="gap-2">
                <BookOpen size={16} />
                ナレッジ
              </TabsTrigger>
              <TabsTrigger value="network" className="gap-2">
                <Network size={16} />
                ネットワーク
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 size={16} />
                分析
              </TabsTrigger>
              <TabsTrigger value="ai-search" className="gap-2">
                <Bot size={16} />
                AI検索
              </TabsTrigger>
            </TabsList>

            <TabsContent value="knowledge">
              <div className="mb-6">
                <Link
                  href="/document-list"
                  className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft size={16} />
                  一覧に戻る
                </Link>
              </div>

              <div className="max-w-4xl">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
                  <KnowledgeDetail id={id} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" />
            <TabsContent value="analytics" />
            <TabsContent value="ai-search" />
          </Tabs>
        </main>
      </div>
    </div>
  );
}
