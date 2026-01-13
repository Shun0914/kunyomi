import { Eye, ThumbsUp, TrendingUp } from 'lucide-react';
import type { Knowledge } from '@/types/knowledge';

/**
 * ナレッジカードコンポーネント
 * * 役割: ナレッジ一覧における1つのアイテム（カード）をレンダリングする
 * * 特徴: 
 * - ホバー時のエフェクト（影、タイトルの色変化）を実装
 * - ジャンル名を右上に固定配置
 * - ビュー数や「役立った」数、独自スコアなどのメトリクスを表示
 */
export function KnowledgeCard({ data }: { data: Knowledge }) {
  // 日付を「2024年1月1日」の形式に整形
  const formattedDate = new Date(data.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative">
      
      {/* 右上のバッジ：ジャンル名表示 */}
      <div className="absolute top-6 right-6 px-2.5 py-1 bg-slate-50 rounded text-[11px] font-bold text-slate-500 border border-slate-100 uppercase">
        {data.genre_name}
      </div>

      {/* タイトル：group-hoverを使用してカード全体にマウスが乗った時に青色に変化させる */}
      <h3 className="text-lg font-bold mb-1 group-hover:text-blue-600 transition-colors pr-24 leading-snug">
        {data.title}
      </h3>

      {/* メタ情報：作成者と作成日 */}
      <div className="text-sm text-slate-400 mb-4">
        {data.creator_name} ・ {formattedDate}
      </div>

      {/* フッターセクション：キーワードタグと統計情報 */}
      <div className="flex items-center justify-between mt-auto">
        
        {/* キーワードタグ一覧：キーワードが存在する場合のみマッピングして表示 */}
        <div className="flex gap-2">
          {data.keywords?.map(kw => (
            <span key={kw.id} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium">
              #{kw.name}
            </span>
          ))}
          {(!data.keywords || data.keywords.length === 0) && (
            <span className="text-[10px] text-slate-300 italic">タグなし</span>
          )}
        </div>

        {/* 統計メトリクス：閲覧数、高評価数、AI/アルゴリズムによる貢献度スコア */}
        <div className="flex items-center gap-4 text-slate-400">
          {/* 閲覧数 */}
          <div className="flex items-center gap-1 text-xs">
            <Eye size={14} /> {data.view_count}
          </div>
          {/* 役立った（いいね）数 */}
          <div className="flex items-center gap-1 text-xs">
            <ThumbsUp size={14} /> {data.helpful_count}
          </div>
          {/* 貢献度スコア：重要指標のため背景色をつけて強調 */}
          <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            <TrendingUp size={14} /> {data.helpfulness_score}
          </div>
        </div>
      </div>
    </div>
  );
}