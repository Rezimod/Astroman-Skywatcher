export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-5 h-28 rounded-card border border-white/8 bg-white/5" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-36" />
          <Skeleton className="h-32" />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
          <Skeleton className="h-36" />
        </div>
        <div className="space-y-4 lg:col-span-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </main>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-card border border-white/8 bg-white/5 ${className}`} />;
}
