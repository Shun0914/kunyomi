'use client';

import { useEffect, useRef, useState } from 'react';
import { getDocument, incrementViewCount } from '@/lib/api/documents';

type Props = { id: string };

type DocumentDetail = {
  id: number;
  title?: string;
  content?: string;
  view_count?: number;
};

export default function KnowledgeDetail({ id }: Props) {
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // StrictModeでも「idごとに1回だけPOST」するためのガード
  const postedRef = useRef<Set<string>>(new Set());

  // 1) 詳細取得
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setDoc(null);

      try {
        const data = (await getDocument(Number(id))) as DocumentDetail;
        if (!cancelled) setDoc(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Failed to fetch');
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

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>読み込みに失敗しました: {error}</div>;
  if (!doc) return <div>ドキュメントが見つかりませんでした</div>;

  return (
    <div>
      <h1>{doc.title ?? `Document ${doc.id}`}</h1>
      {typeof doc.view_count === 'number' && <div>閲覧数: {doc.view_count}</div>}
      <div style={{ whiteSpace: 'pre-wrap' }}>{doc.content ?? ''}</div>
    </div>
  );
}
