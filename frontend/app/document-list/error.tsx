'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ログ収集サービス（Sentryなど）がある場合はここでエラーを送信します
    console.error('Unhandled Error:', error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-red-50 p-4">
          <AlertCircle className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">問題が発生しました</h2>
        <p className="max-w-[400px] text-slate-500">
          データの読み込み中に予期せぬエラーが発生しました。
          ネットワーク状況を確認して、もう一度お試しください。
        </p>
        <div className="flex gap-3 mt-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            ページ全体を更新
          </Button>
          <Button
            className="gap-2"
            onClick={() => reset()} // Next.jsが提供する再試行関数
          >
            <RotateCcw size={16} /> 再試行する
          </Button>
        </div>
      </div>
    </div>
  );
}