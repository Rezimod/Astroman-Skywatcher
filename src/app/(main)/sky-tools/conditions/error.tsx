"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
      <section className="card w-full p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-text-muted">შეცდომა</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">ცის მონაცემების ჩატვირთვა ვერ მოხერხდა</h1>
        <p className="mt-3 text-sm text-text-secondary">
          {error.message || "უცნობი შეცდომა"}
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow"
        >
          ხელახლა სცადე
        </button>
      </section>
    </main>
  );
}
