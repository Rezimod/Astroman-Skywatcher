import { observations } from "@/lib/mock-data";

export default function AdminObservationsPage() {
  return (
    <div className="card p-6">
      <h1 className="text-3xl font-semibold text-white">დაკვირვებების განხილვა</h1>
      <div className="mt-6 space-y-4">
        {observations.filter((item) => item.status === "pending").map((item) => (
          <article key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-space p-4">
            <div>
              <p className="text-white">{item.objectName}</p>
              <p className="text-sm text-text-secondary">{item.username}</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-full bg-aurora/15 px-4 py-2 text-sm text-aurora">Approve</button>
              <button className="rounded-full bg-gold/15 px-4 py-2 text-sm text-gold">Reject</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
