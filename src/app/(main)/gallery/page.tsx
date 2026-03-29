import Image from "next/image";
import { observations } from "@/lib/mock-data";

export default function GalleryPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-white">გალერეა</h1>
        <div className="flex gap-2 text-sm">
          <span className="rounded-full bg-white/5 px-4 py-2 text-white">ყველა</span>
          <span className="rounded-full bg-white/5 px-4 py-2 text-text-secondary">დამტკიცებული</span>
          <span className="rounded-full bg-white/5 px-4 py-2 text-text-secondary">განხილვაში</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {observations.map((item) => (
          <article key={item.id} className="card overflow-hidden">
            <Image
              src={item.imageUrl}
              alt={item.objectName}
              width={400}
              height={208}
              className="h-52 w-full object-cover"
              unoptimized
            />
            <div className="p-5">
              <h2 className="text-xl font-medium text-white">{item.objectName}</h2>
              <p className="mt-2 text-sm text-text-secondary">{item.username} · {item.status}</p>
              <p className="mt-3 text-sm text-gold">{item.pointsEarned} XP</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
