'use client';

import { useEffect, useRef, useState } from 'react';
import { getDocument, incrementViewCount } from '@/lib/api/documents';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Props = { id: string };

type DocumentDetail = {
  id: number;
  title?: string;
  content?: string;
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

      const res = await fetch(`http://127.0.0.1:8000/api/documents/${doc.id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_helpful: isHelpful }),
      });

      if (!res.ok) {
        // 409 = すでに評価済み（仕様どおり）なので「エラー表示しない」
        if (res.status === 409) {
          setEvalError(null);
          // 押した方に合わせて UI の状態だけ整える（どちらでもOKだが、ここは厳密に）
          setEvalStatus(isHelpful ? 'helpful' : 'not_helpful');
          return;
        }

        const text = await res.text().catch(() => '');
        throw new Error(`評価送信に失敗しました (${res.status}) ${text}`);
      }

      const updated = (await res.json()) as Partial<DocumentDetail>;

      // 画面表示を確実に更新（updatedに値が入らないケースでも壊れない）
      const newHelpfulCount =
        typeof updated.helpful_count === 'number'
          ? updated.helpful_count
          : (doc.helpful_count ?? helpfulCount);

      const newHelpfulnessScore =
        typeof updated.helpfulness_score === 'number'
          ? updated.helpfulness_score
          : (doc.helpfulness_score ?? helpfulnessScore);

      setHelpfulCount(pickNumber(newHelpfulCount, 0));
      setHelpfulnessScore(pickNumber(newHelpfulnessScore, 0));
      setEvalStatus(isHelpful ? 'helpful' : 'not_helpful');

      // doc自体も更新（表示に一貫性を出す）
      setDoc((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch (e: unknown) {
      setEvalError(toErrorMessage(e) || '評価送信に失敗しました');
    } finally {
      setIsSubmittingEval(false);
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>読み込みに失敗しました: {error}</div>;
  if (!doc) return <div>ドキュメントが見つかりませんでした</div>;

  return (
    <div>
      <h1>{doc.title ?? `Document ${doc.id}`}</h1>

      {typeof doc.view_count === 'number' && <div>閲覧数: {doc.view_count}</div>}

      <div className="mt-3 flex items-center gap-2">
        <button
          className={`px-3 py-1 rounded border text-sm ${
            evalStatus === 'helpful' ? 'bg-black text-white' : ''
          }`}
          onClick={() => handleEvaluate(true)}
          disabled={isSubmittingEval || evalStatus !== 'none'}
        >
          👍 役に立った
        </button>

        <button
          className={`px-3 py-1 rounded border text-sm ${
            evalStatus === 'not_helpful' ? 'bg-black text-white' : ''
          }`}
          onClick={() => handleEvaluate(false)}
          disabled={isSubmittingEval || evalStatus !== 'none'}
        >
          👎 そうでもない
        </button>

        {isSubmittingEval && <span className="text-sm text-gray-500">送信中…</span>}
        {evalStatus !== 'none' && <span className="text-sm text-gray-500">評価済み</span>}
      </div>

      <div className="mt-2 text-sm text-gray-600">
        評価件数: {helpfulCount} ／ 役立ち度: {helpfulnessScore.toFixed(2)}
      </div>

      {evalError && <div className="mt-2 text-sm text-red-600">{evalError}</div>}

      <div className="prose dark:prose-invert max-w-none border-t pt-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  {...props}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {doc.content ?? ''}
        </ReactMarkdown>
      </div>
    </div>
  );
}
