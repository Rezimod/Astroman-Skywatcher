export default function Home() {
  return (
    <main className="starfield relative min-h-screen overflow-hidden bg-void">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <div className="card max-w-3xl p-8 shadow-glow">
          <p className="mb-3 text-sm uppercase tracking-[0.24em] text-text-muted">
            Astroman Skywatcher
          </p>
          <h1 className="text-gradient text-4xl font-semibold sm:text-6xl">
            ვარსკვლავები შენ ხელთ
          </h1>
          <p className="mt-4 max-w-2xl text-base text-text-secondary sm:text-lg">
            ახალი Next.js 14 საძირკველი მზად არის. ახლა მიმდინარეობს ცის ინტელექტის,
            მისიების, პროფილების, გალერეის და საერთო დიზაინის ინტეგრაცია.
          </p>
        </div>
      </div>
    </main>
  );
}
