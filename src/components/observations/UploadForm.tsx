"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, MapPin, Upload, X } from "lucide-react";

import { cn } from "@/components/ui/cn";
import { missions } from "@/lib/mock-data";

const EQUIPMENT = [
  "შეუიარაღებელი თვალი",
  "ბინოკლი",
  "ტელესკოპი",
  "კამერა",
] as const;

type UploadFormProps = {
  defaultObject?: string;
};

type State = "idle" | "uploading" | "success" | "error";

export function UploadForm({ defaultObject = "" }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [objectName, setObjectName] = useState(defaultObject);
  const [equipment, setEquipment] = useState<string>(EQUIPMENT[0]);
  const [observedAt, setObservedAt] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [estimatedXp, setEstimatedXp] = useState(0);

  function pickFile(f: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setErrorMsg("მხოლოდ JPG, PNG ან WEBP ფოტო.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrorMsg("ფოტო 10 MB-ზე მეტია.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setErrorMsg(null);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function detectLocation() {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => {
        setLocation({ lat: 41.7151, lng: 44.8271 });
        setLocLoading(false);
      },
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setErrorMsg("ფოტო სავალდებულოა."); return; }
    if (!objectName.trim()) { setErrorMsg("ობიექტის სახელი სავალდებულოა."); return; }

    setState("uploading");
    setErrorMsg(null);

    try {
      const form = new FormData();
      form.append("photo", file);
      form.append("objectName", objectName);
      form.append("equipment", equipment);
      form.append("observedAt", observedAt);
      if (location) {
        form.append("lat", String(location.lat));
        form.append("lng", String(location.lng));
      }

      const res = await fetch("/api/observations/upload", { method: "POST", body: form });
      const data = res.ok ? await res.json() : null;
      setEstimatedXp(data?.estimatedXp ?? 120);
      setState("success");
    } catch {
      setErrorMsg("ატვირთვა ვერ მოხერხდა. სცადე ახლიდან.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/6 p-8 text-center">
        <CheckCircle2 size={48} className="text-emerald-400" />
        <div>
          <h2 className="text-xl font-semibold text-white">ატვირთვა წარმატებულია!</h2>
          <p className="mt-2 text-sm text-slate-400">შენი დაკვირვება გადამოწმების პროცესშია.</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-6 py-3">
          <p className="text-sm text-slate-400">სავარაუდო ჯილდო</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">+{estimatedXp} ✦</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setState("idle"); setFile(null); setPreview(null); }}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/8"
          >
            ახალი ატვირთვა
          </button>
          <button
            type="button"
            onClick={() => router.push("/gallery")}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            გალერეა
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
          dragging ? "border-indigo-400 bg-indigo-500/8" : "border-white/12 hover:border-white/20",
        )}
      >
        {preview ? (
          <div className="relative h-56 w-full">
            <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Upload size={28} className="text-slate-500" />
            <p className="text-sm font-medium text-slate-300">ფოტო ჩააგდე ან დააჭირე</p>
            <p className="text-xs text-slate-600">JPG · PNG · WEBP · მაქს. 10 MB</p>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) pickFile(e.target.files[0]); }}
      />

      {/* Object name */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">ობიექტი</label>
        <input
          list="objects-list"
          value={objectName}
          onChange={(e) => setObjectName(e.target.value)}
          placeholder="მთვარე, იუპიტერი, ვენერა..."
          className="w-full rounded-xl border border-white/10 bg-[#111936] px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500/50"
        />
        <datalist id="objects-list">
          {missions.map((m) => <option key={m.id} value={m.objectName} />)}
        </datalist>
      </div>

      {/* Equipment */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">აღჭურვილობა</label>
        <select
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#111936] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
        >
          {EQUIPMENT.map((eq) => <option key={eq}>{eq}</option>)}
        </select>
      </div>

      {/* Date/time */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">დაკვირვების დრო</label>
        <input
          type="datetime-local"
          value={observedAt}
          onChange={(e) => setObservedAt(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#111936] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Location */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">მდებარეობა</label>
        <button
          type="button"
          onClick={detectLocation}
          disabled={locLoading}
          className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-[#111936] px-4 py-3 text-sm text-slate-400 transition-colors hover:border-indigo-500/30 hover:text-white disabled:opacity-60"
        >
          {locLoading ? <Loader2 size={15} className="animate-spin" /> : <MapPin size={15} />}
          {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "ლოკაციის ავტომატური განსაზღვრა"}
        </button>
      </div>

      {errorMsg && (
        <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "uploading"}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {state === "uploading" && <Loader2 size={16} className="animate-spin" />}
        ატვირთვა
      </button>
    </form>
  );
}
