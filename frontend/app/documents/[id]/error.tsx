'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: 16 }}>
      <h2>読み込みに失敗しました</h2>
      <p style={{ opacity: 0.8 }}>{error.message}</p>
      <button onClick={() => reset()}>再試行</button>
    </div>
  );
}
