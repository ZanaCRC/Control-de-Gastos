export function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-7 w-48 rounded bg-zinc-200" />
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-zinc-100" />
          <div className="h-4 w-3/4 rounded bg-zinc-100" />
          <div className="h-4 w-1/2 rounded bg-zinc-100" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 h-24" />
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 h-24" />
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-100">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="h-8 w-8 rounded-full bg-zinc-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-32 rounded bg-zinc-100" />
              <div className="h-2 w-20 rounded bg-zinc-50" />
            </div>
            <div className="h-3 w-16 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
