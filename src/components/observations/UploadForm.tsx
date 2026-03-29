"use client";

export function UploadForm() {
  return (
    <form className="space-y-4">
      <div className="rounded-3xl border border-dashed border-white/15 bg-space p-8 text-center text-text-secondary">
        ფოტოს ატვირთვა · JPG / PNG / WEBP · მაქს. 10MB
      </div>
      <select className="w-full rounded-2xl border border-white/10 bg-space px-4 py-3 text-white">
        <option>მთვარე</option>
        <option>ვენერა</option>
        <option>იუპიტერი</option>
      </select>
      <select className="w-full rounded-2xl border border-white/10 bg-space px-4 py-3 text-white">
        <option>შეუიარაღებელი თვალი</option>
        <option>ბინოკლი</option>
        <option>ტელესკოპი</option>
        <option>კამერა</option>
      </select>
      <input className="w-full rounded-2xl border border-white/10 bg-space px-4 py-3 text-white" type="datetime-local" />
      <button className="rounded-2xl bg-accent px-5 py-3 font-medium text-white">ატვირთვა</button>
    </form>
  );
}
