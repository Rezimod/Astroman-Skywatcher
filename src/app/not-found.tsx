import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-lg p-8 text-center">
        <h1 className="text-3xl font-semibold text-white">გვერდი ვერ მოიძებნა</h1>
        <p className="mt-3 text-text-secondary">მოთხოვნილი მისამართი აღარ არსებობს ან ჯერ არ აგვიშენებია.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-medium text-white">
          მთავარ გვერდზე დაბრუნება
        </Link>
      </div>
    </main>
  );
}
