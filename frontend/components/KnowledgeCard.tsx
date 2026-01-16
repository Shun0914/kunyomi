import Link from 'next/link';
import { Eye, ThumbsUp, TrendingUp } from 'lucide-react';
import type { Knowledge } from '@/types/knowledge';

/**
 * ナレッジカードコンポーネント
 */
export function KnowledgeCard({ data }: { data: Knowledge }) {
  const formattedDate = new Date(data.created_at).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      href={`/documents/${data.id}`}
      className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative block"
    >
      {/* 右上のバッジ：ジャンル名表示 */}
      <div className="absolute top-6 right-6 px-2.5 py-1 bg-slate-50 rounded text-[11px] font-bold text-slate-500 border border-slate-100 uppercase">
        {data.genre_name}
      </div>

      {/* タイトル */}
      <h3 className="text-lg font-bold mb-1 group-hover:text-blue-600 transition-colors pr-24 leading-snug">
        {data.title}
      </h3>

      {/* メタ情報 */}
      <div className="text-sm text-slate-400 mb-4">
        {data.creator_name} ・ {formattedDate}
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between mt-auto">
        {/* キーワード */}
        <div className="flex gap-2">
          {data.keywords?.map((kw) => (
            <span
              key={kw.id}
              className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium"
            >
              #{kw.name}
            </span>
          ))}
          {(!data.keywords || data.keywords.length === 0) && (
            <span className="text-[10px] text-slate-300 italic">タグなし</span>
          )}
        </div>

        {/* 統計 */}
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1 text-xs">
            <Eye size={14} /> {data.view_count}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <ThumbsUp size={14} /> {data.helpful_count}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            <TrendingUp size={14} /> {data.helpfulness_score}
          </div>
        </div>
      </div>
    </Link>
  );
}
