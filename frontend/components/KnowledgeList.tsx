'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, SearchX } from 'lucide-react';
import { getDocuments, searchDocuments } from '@/lib/api/documents';
import { KnowledgeCard } from './KnowledgeCard';
import type { Knowledge } from '@/types/knowledge';

/**
 * プロパティの型定義
 * @param selectedGenreId - サイドバーで選択されたジャンルのID（nullの場合は全ジャンル）
 * @param searchQuery - 検索バーに入力された文字列
 */
interface KnowledgeListProps {
  selectedGenreId: number | null;
  searchQuery: string;
}

/**
 * ナレッジ一覧表示コンポーネント
 * 検索キーワードの有無に応じて、検索APIと通常の一覧APIを使い分けます。
 */
export function KnowledgeList({ selectedGenreId, searchQuery }: KnowledgeListProps) {
  // 表示対象のナレッジリスト
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  // データ取得中の状態管理
  const [loading, setLoading] = useState(true);

  /**
   * APIからデータを取得するメインロジック
   * useCallback を使用し、ジャンル選択や検索ワードの変化をトリガーに再生成します。
   */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      let data: Knowledge[];

      // 【ロジック分岐】
      // 1. 検索ワードがある場合: バックエンドの全文検索APIを使用
      // 2. 検索ワードがない場合: ジャンル絞り込みを伴う一覧取得APIを使用
      if (searchQuery.trim()) {
        data = await searchDocuments(searchQuery);
      } else {
        data = await getDocuments({
          genre_id: selectedGenreId,
          status: 'published', // 公開済みドキュメントのみ取得
          skip: 0,
          limit: 20
        });
      }
      
      setKnowledges(data || []);
    } catch (error) {
      // API呼び出し失敗時のエラーハンドリング
      console.error("Failed to fetch documents:", error);
      setKnowledges([]); 
    } finally {
      setLoading(false);
    }
    // ジャンル変更または検索ワード入力のたびに fetchItems を再定義
  }, [selectedGenreId, searchQuery]);

  /**
   * fetchItems が更新された際（selectedGenreId/searchQuery 変化時）に実行
   */
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // --- ローディング中のUI表示 ---
  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 検索結果または一覧の状態を表示するヘッダーエリア */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500 font-medium">
          {searchQuery ? (
            <span>&quot;{searchQuery}&quot; の検索結果: </span>
          ) : (
            <span>ナレッジ一覧: </span>
          )}
          <span className="text-slate-900 ml-1">{knowledges.length} 件</span>
        </p>
      </div>

      {/* ナレッジカードのレンダリングエリア */}
      <div className="grid gap-4 max-w-4xl">
        {knowledges.length === 0 ? (
          /* データが0件の場合の空状態（Empty State）表示 */
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed rounded-xl space-y-2">
            <SearchX className="h-8 w-8 text-slate-300" />
            <p>
              {searchQuery 
                ? "キーワードに一致するナレッジが見つかりませんでした。" 
                : "この条件で表示できるナレッジはありません。"}
            </p>
          </div>
        ) : (
          /* 取得したデータをループ展開 */
          knowledges.map(item => (
            <KnowledgeCard key={item.id} data={item} />
          ))
        )}
      </div>
    </div>
  );
}