'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { incrementViewCount } from '@/lib/api/documents';

export default function ViewCountUpdater({ id }: { id: number }) {
  const router = useRouter();
  const ranRef = useRef(false);

  useEffect(() => {
    // dev(StrictMode)等の二重実行・再レンダー対策
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        await incrementViewCount(id);
        // 表示中のview_countも更新したいので再取得
        router.refresh();
      } catch (e) {
        // ここで落とすと詳細画面自体がエラーになるので握る
        console.error('incrementViewCount failed', e);
      }
    })();
  }, [id, router]);

  return null;
}
