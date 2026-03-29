"use client";

export default function TelescopeFinderError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-card border border-rose-400/20 bg-rose-400/10 p-6">
        <h1 className="text-2xl font-semibold text-text-primary">კითხვარი ჩაიშალა</h1>
        <p className="mt-2 text-sm text-text-secondary">სცადე თავიდან, ან დაბრუნდი დაფაზე.</p>
        <div className="mt-4 flex gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            თავიდან ცდა
          </button>
        </div>
      </div>
    </main>
  );
}
