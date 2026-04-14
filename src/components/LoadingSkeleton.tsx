export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded-lg w-3/4" />
              <div className="h-3 bg-white/5 rounded-lg w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
