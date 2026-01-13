import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { getDocuments } from '@/lib/api/documents';
import { KnowledgeCard } from './KnowledgeCard';
import type { Knowledge } from '@/types/knowledge';

/**
 * ナレッジ一覧制御コンポーネント
 * * 役割:
 * 1. 外部API（getDocuments）を使用したデータの非同期取得
 * 2. 取得したデータの検索クエリによるフィルタリング（フロントエンド側）
 * 3. ローディング状態および「データなし」状態のUI管理
 */
interface KnowledgeListProps {
  selectedGenreId: number | null; // 親から渡されるフィルタ用ジャンルID
  searchQuery: string;            // 親から渡される検索文字列
}

export function KnowledgeList({ selectedGenreId, searchQuery }: KnowledgeListProps) {
  // --- ステート定義 ---
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]); // 取得した全データ（フィルタ前）
  const [loading, setLoading] = useState(true);                  // 通信中フラグ

  /**
   * APIからナレッジデータを取得する関数
   * useCallbackにより、selectedGenreIdが変更されない限り関数インスタンスを保持
   */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      // APIクライアント経由でバックエンドから取得
      const data = await getDocuments({
        genre_id: selectedGenreId, // ジャンルによる絞り込みをサーバー側で実行
        status: 'published',
        skip: 0,
        limit: 20
      });
      setKnowledges(data || []);
    } catch (error) {
      console.error("Failed to fetch:", error);
      setKnowledges([]); // エラー時はリストを空にする
    } finally {
      setLoading(false); // 成功・失敗に関わらずローディングを終了
    }
  }, [selectedGenreId]); // ジャンルが切り替わるたびにこの関数を更新

  /**
   * コンポーネントのマウント時、および fetchItems 関数が更新された時に実行
   */
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /**
   * 検索クエリによるフィルタリング
   * サーバーから取得済みの knowledges に対して、タイトルまたは内容で部分一致検索を行う
   * searchQuery によるキーワード検索は、現在 メモリ上（クライアント側） で行っています。
   * 別のチケットでここをAPIパラメータに含める対応を行います。by よこち
   */
  const filtered = knowledges.filter(k => 
    k.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- レンダリングロジック ---

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );
  }

   return (
    <div className="space-y-6"> {/* 全体を囲むdivを追加 */}
      
      {/* --- 件数表示ロジック --- */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500 font-medium">
          {loading ? '読み込み中...' : `${filtered.length} 件のナレッジ`}
        </p>
      </div>

      <div className="grid gap-4 max-w-4xl">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 border-2 border-dashed rounded-xl">
            該当するナレッジが見つかりませんでした。
          </div>
        ) : (
          filtered.map(item => <KnowledgeCard key={item.id} data={item} />)
        )}
      </div>
    </div>
  );
}