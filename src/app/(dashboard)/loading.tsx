export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Balance skeleton */}
      <div className="rounded-2xl bg-zinc-900 p-6 h-28" />

      {/* Month summary skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 h-20" />
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 h-20" />
      </div>

      {/* Category breakdown skeleton */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="h-4 w-40 rounded bg-zinc-200 mb-4" />
        <div className="space-y-3">
          <div className="h-3 rounded bg-zinc-100 w-full" />
          <div className="h-3 rounded bg-zinc-100 w-3/4" />
          <div className="h-3 rounded bg-zinc-100 w-1/2" />
        </div>
      </div>

      {/* Recent transactions skeleton */}
      <div>
        <div className="h-4 w-36 rounded bg-zinc-200 mb-3" />
        <div className="rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-zinc-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 rounded bg-zinc-100" />
                <div className="h-2 w-16 rounded bg-zinc-50" />
              </div>
              <div className="h-3 w-20 rounded bg-zinc-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
