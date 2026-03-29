export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="h-12 rounded-card border border-white/8 bg-white/5" />
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-32" />
          <Skeleton className="h-96" />
        </div>
        <div className="space-y-4 lg:col-span-7">
          <Skeleton className="h-32" />
          <Skeleton className="h-[28rem]" />
          <Skeleton className="h-24" />
        </div>
      </div>
    </main>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-card border border-white/8 bg-white/5 ${className}`} />;
}
