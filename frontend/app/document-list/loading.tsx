import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex">
      {/* サイドバーのスケルトン */}
      <aside className="w-64 border-r min-h-[calc(100vh-65px)] bg-white p-4">
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded" />
          ))}
        </div>
      </aside>

      {/* メインエリアのスケルトン */}
      <main className="flex-1 bg-slate-50/50 p-4 md:p-8 space-y-8">
        {/* タブ部分 */}
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded" />
          ))}
        </div>

        {/* 検索バー */}
        <Skeleton className="h-12 max-w-4xl w-full rounded-lg" />

        {/* カードリストのスケルトン */}
        <div className="grid gap-4 max-w-4xl">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-6 bg-white border rounded-xl space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-1/4" />
              <div className="flex justify-between mt-4">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}