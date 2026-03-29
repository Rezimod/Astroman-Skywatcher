export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-5 pb-24 sm:px-6 lg:px-8">
      <div className="card animate-pulse p-5">
        <div className="h-4 w-40 rounded-full bg-white/10" />
        <div className="mt-4 h-10 w-72 rounded-full bg-white/10" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded-full bg-white/10" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="h-20 rounded-2xl bg-white/10" />
          <div className="h-20 rounded-2xl bg-white/10" />
          <div className="h-20 rounded-2xl bg-white/10" />
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <div className="card h-40 animate-pulse bg-white/5" />
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card h-64 animate-pulse bg-white/5" />
            <div className="card h-64 animate-pulse bg-white/5" />
          </div>
          <div className="card h-56 animate-pulse bg-white/5" />
          <div className="card h-72 animate-pulse bg-white/5" />
        </div>
        <div className="space-y-5">
          <div className="card h-56 animate-pulse bg-white/5" />
          <div className="card h-96 animate-pulse bg-white/5" />
          <div className="card h-80 animate-pulse bg-white/5" />
        </div>
      </div>
    </main>
  );
}
