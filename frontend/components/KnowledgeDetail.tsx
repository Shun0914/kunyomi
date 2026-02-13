'use client';

import { useEffect, useRef, useState } from 'react';
import { getDocument, incrementViewCount, evaluateDocument } from '@/lib/api/documents';
import { ApiError } from '@/lib/api/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Props = { id: string };

type KeywordLike = { id?: number; name?: string } | string;

type DocumentDetail = {
  id: number;

  title?: string;
  content?: string;

  created_at?: string;
  updated_at?: string;
  created_by?: number | null;
  updated_by?: number | null;

  genre_id?: number | null;
  keywords?: KeywordLike[];

  view_count?: number;
  helpful_count?: number;
  helpfulness_score?: number;
};



type EvalStatus = 'none' | 'helpful' | 'not_helpful';

function toErrorMessage(e: unknown): string {
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object') {
    const anyE = e as any;
    if (anyE?.message) return String(anyE.message);
    if (anyE?.detail) return String(anyE.detail);
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
  return String(e);
}

function pickNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}
function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeKeywordNames(keywords?: KeywordLike[]): string[] {
  if (!keywords || keywords.length === 0) return [];
  return keywords
    .map((kw) => (typeof kw === 'string' ? kw : kw?.name))
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
}

export default function KnowledgeDetail({ id }: Props) {
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [evalStatus, setEvalStatus] = useState<EvalStatus>('none');
  const [helpfulCount, setHelpfulCount] = useState<number>(0);
  const [helpfulnessScore, setHelpfulnessScore] = useState<number>(0);
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  // StrictModeでも「idごとに1回だけPOST」するためのガード（view更新用）
  const postedRef = useRef<Set<string>>(new Set());

  // 1) 詳細取得
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setEvalError(null);
      setDoc(null);

      try {
        const data = (await getDocument(Number(id))) as DocumentDetail;
        


        if (!cancelled) {
          setDoc(data);
          setHelpfulCount(data.helpful_count ?? 0);
          setHelpfulnessScore(data.helpfulness_score ?? 0);
          // ここでは「評価済みかどうか」は分からないので evalStatus は触らない
          // （評価済み判定APIが無い前提）
        }
      } catch (e: unknown) {
        if (cancelled) return;
        setError(toErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 2) 表示後に1回だけ view を更新（docが取れてから）
  useEffect(() => {
    if (!doc) return;

    if (postedRef.current.has(id)) return;
    postedRef.current.add(id);

    incrementViewCount(Number(id)).catch(() => {
      // view更新の失敗は、表示自体を壊さない
    });
  }, [id, doc]);

  const handleEvaluate = async (isHelpful: boolean) => {
    if (!doc) return;
    if (evalStatus !== 'none') return;

    try {
      setIsSubmittingEval(true);
      setEvalError(null);

      const updated = await evaluateDocument(doc.id, isHelpful);

      // 画面表示を確実に更新
      const newHelpfulCount = pickNumber(updated.helpful_count, helpfulCount);
      const newHelpfulnessScore = pickNumber(updated.helpfulness_score, helpfulnessScore);

      setHelpfulCount(newHelpfulCount);
      setHelpfulnessScore(newHelpfulnessScore);
      setEvalStatus(isHelpful ? 'helpful' : 'not_helpful');

      // doc自体も更新（表示に一貫性を出す）
      setDoc((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch (e: unknown) {
      // 409 = すでに評価済み（仕様どおり）なので「エラー表示しない」
      if (e instanceof ApiError && e.status === 409) {
        setEvalError(null);
        // 押した方に合わせて UI の状態だけ整える
        setEvalStatus(isHelpful ? 'helpful' : 'not_helpful');
      } else {
        const errorMessage = toErrorMessage(e);
        setEvalError(errorMessage || '評価送信に失敗しました');
      }
    } finally {
      setIsSubmittingEval(false);
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>読み込みに失敗しました: {error}</div>;
  if (!doc) return <div>ドキュメントが見つかりませんでした</div>;

return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white shadow-sm rounded-lg">
      {/* 1. ドキュメントタイトル (大きく、太字) */}
      <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">
        {doc.title ?? `Document ${doc.id}`}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded">
        {/* 2. 作成者 (和名で表示) */}
        <div>
          <span className="font-semibold text-gray-500">作成者:</span> {doc.creator?.name ?? '不明'}
        </div>

        {/* 4. ジャンル (和名で表示) */}
        <div>
          <span className="font-semibold text-gray-500">ジャンル:</span> {doc.genre?.name ?? '未分類'}
        </div>

        {/* 3. 作成日時と更新日時の両方を表示 */}
        <div>
          <span className="font-semibold text-gray-500">作成日時:</span> {formatDateTime(doc.created_at)}
        </div>
        <div>
          <span className="font-semibold text-gray-500">更新日時:</span> {formatDateTime(doc.updated_at)}
        </div>
        {/* キーワード */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-500">キーワード:</span>
          {normalizeKeywordNames(doc.keywords).map((name, idx) => (
            <span key={`${name}-${idx}`} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">
              {name}
            </span>
          ))}
        </div>
      </div>


      {/* 本文 (Markdown) */}
      <div className="prose prose-slate max-w-none py-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter {...props} style={vscDarkPlus} language={match[1]} PreTag="div">
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>{children}</code>
              );
            },
          }}
        >
          {doc.content ?? ''}
        </ReactMarkdown>
      </div>

      <hr className="border-t-2 border-gray-100" />

      {/* 5. 閲覧数・評価数・役立ち度を表示 */}
      <div className="flex items-center justify-between text-sm text-gray-500 px-2">
        <div className="flex gap-6">
          <span>閲覧数: <strong className="text-gray-900">{doc.view_count}</strong></span>
          <span>評価件数: <strong className="text-gray-900">{helpfulCount}</strong></span>
          <span>役立ち度: <strong className="text-gray-900">{helpfulnessScore.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* 5. 線で区切った後に評価ボタンを表示 */}
      <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300">
        <p className="text-center text-sm text-gray-600 mb-4 font-medium">このドキュメントは役に立ちましたか？</p>
        <div className="flex justify-center items-center gap-4">
          <button
            className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${
              evalStatus === 'helpful' ? 'bg-green-600 text-white border-green-600' : 'bg-white hover:bg-green-50 text-gray-700'
            }`}
            onClick={() => handleEvaluate(true)}
            disabled={isSubmittingEval || evalStatus !== 'none'}
          >
            👍 役に立った
          </button>

          <button
            className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${
              evalStatus === 'not_helpful' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white hover:bg-gray-100 text-gray-700'
            }`}
            onClick={() => handleEvaluate(false)}
            disabled={isSubmittingEval || evalStatus !== 'none'}
          >
            👎 そうでもない
          </button>
        </div>
        {evalStatus !== 'none' && <p className="text-center text-blue-600 text-xs mt-3">評価済み</p>}
        {evalError && <div className="mt-2 text-center text-xs text-red-600">{evalError}</div>}
      </div>
    </div>
  );
}
