"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

// -----------------------------------------------
// ServiceInfo — provider selects a service + uploads up to 6 photos
// - Services: Salon, Food, Tutor, Tailoring
// - Add photos via click or drag & drop (max 6)
// - Previews with remove buttons
// - No window.alert; inline messages only
// - Uses square tiles that are robust even without Tailwind aspect utilities
// - Includes a ResponsiveGrid fallback so tiles don't full-width if Tailwind grid classes are missing
// -----------------------------------------------

export type ServiceType = "salon" | "food" | "tutor" | "tailoring";

// NOTE: Avoid raw emoji literals to prevent "Expecting Unicode escape sequence" errors in some builders.
// Use surrogate pair escapes for full compatibility.
const SERVICES: Array<{
  key: ServiceType;
  label: string;
  icon: string; // simple icon as escaped unicode
}> = [
  { key: "salon", label: "Salon", icon: "\u2702\uFE0F"}, // ✂️
  { key: "food", label: "Food", icon: "\uD83C\uDF7D\uFE0F"}, // 🍽️
  { key: "tutor", label: "Tutor", icon: "\uD83D\uDCDA"}, // 📚
  { key: "tailoring", label: "Tailoring", icon: "\uD83E\uDDF5"}, // 🧵
];

const MAX_PHOTOS = 6;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB per image

function MessageBanner({
  type,
  text,
  onClose,
}: {
  type: "success" | "error" | "info";
  text: string;
  onClose: () => void;
}) {
  const classes =
    type === "success"
      ? "bg-emerald-600/20 text-emerald-100 ring-emerald-400/40"
      : type === "error"
      ? "bg-rose-600/20 text-rose-100 ring-rose-400/40"
      : "bg-sky-600/20 text-sky-100 ring-sky-400/40";
  return (
    <div className={`mb-4 flex items-start justify-between gap-3 rounded-2xl px-4 py-3 ring-1 ${classes}`}>
      <p className="text-sm leading-5">{text}</p>
      <button onClick={onClose} className="rounded-md px-2 text-xs ring-1 ring-white/30 hover:bg-white/10" aria-label="Dismiss">✕</button>
    </div>
  );
}

function isValidImage(file: File) {
  return file.type.startsWith("image/") && file.size <= MAX_SIZE;
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    if (!file) { setUrl(""); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

// Square tile that works even without aspect-ratio support or Tailwind plugins.
function SquareTile({
  children,
  className = "",
  onClick,
  ariaPressed,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
  ariaPressed?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div className="relative w-full">
      {/* Fallback ensures a 1:1 box in all environments */}
      <span style={{ display: 'block', paddingTop: '100%' }} aria-hidden="true" />
      <button
        type="button"
        onClick={onClick}
        aria-pressed={ariaPressed}
        aria-label={ariaLabel}
        className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl border ring-1 outline-none ${className}`}
      >
        {children}
      </button>
    </div>
  );
}

function PhotoThumb({ file, onRemove }: { file: File; onRemove: () => void }) {
  const url = useObjectUrl(file);
  return (
    <div className="relative w-full overflow-hidden rounded-xl ring-1 ring-white/30">
      {/* Fallback square */}
      <span style={{ display: 'block', paddingTop: '100%' }} aria-hidden="true" />
      {url ? (
        <img src={url} alt={file.name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-xs text-white/70">Loading…</div>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-md bg-black/50 px-1.5 py-0.5 text-xs text-white hover:bg-black/70"
        aria-label={`Remove ${file.name}`}
      >
        ✕
      </button>
    </div>
  );
}

// Small "+" square used when at least one photo exists (adds more photos)
function AddPhotoTile({ onFiles }: { onFiles: (files: FileList | File[]) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  return (
    <div className="relative w-full">
      <span style={{ display: 'block', paddingTop: '100%' }} aria-hidden="true" />
      <div
        className={`absolute inset-0 grid place-items-center rounded-xl border-2 border-dashed transition ${
          dragOver ? 'border-white bg-white/10' : 'border-white/40 bg-white/5 hover:bg-white/10'
        } cursor-pointer`}
        role="button"
        tabIndex={0}
        aria-label="Add more photos"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? inputRef.current?.click() : undefined)}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
      >
        <div className="text-center">
          <div className="text-2xl leading-none text-white/90">+</div>
          <div className="text-[10px] text-white/70">Add</div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files as FileList)}
      />
    </div>
  );
}

// Responsive grid fallback (if Tailwind grid utilities are not generated in your build)
function ResponsiveGrid(
  { children, className = "", ...rest }: React.HTMLAttributes<HTMLDivElement>
) {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const calc = () => setCols((typeof window !== 'undefined' && window.innerWidth >= 640) ? 4 : 2);
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return (
    <div
      {...rest}
      className={`grid gap-3 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}

function DropZone({ onFiles }: { onFiles: (files: FileList | File[]) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? inputRef.current?.click() : undefined)}
      className={`w-full cursor-pointer rounded-2xl border-2 border-dashed px-4 py-6 transition ${
        dragOver ? "border-white bg-white/10" : "border-white/40 bg-white/5 hover:bg-white/10"
      }`}
      aria-label="Add service photos"
    >
      {/* Force vertical stacking and centering even if some global CSS interferes */}
      <div className="text-center" style={{ display: 'grid', placeItems: 'center', rowGap: '0.25rem' }}>
        <div className="text-white/90">Click to upload or drag & drop</div>
        <div className="text-xs text-white/70">JPEG/PNG (max 6 photos, ≤ 5MB each)</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files as FileList)}
      />
    </div>
  );
}

export default function ServiceInfo({
  onSubmit,
}: {
  onSubmit?: (payload: { service: ServiceType; photos: File[] }) => void;
}) {
  const [service, setService] = useState<ServiceType | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [msg, setMsg] = useState<null | { type: "success" | "error" | "info"; text: string }>(null);

  const remaining = useMemo(() => Math.max(0, MAX_PHOTOS - photos.length), [photos.length]);

  const tryAddFiles = (list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (!incoming.length) return;

    const valid = incoming.filter((f) => isValidImage(f));
    const invalidCount = incoming.length - valid.length;

    const slot = remaining;
    const toAdd = valid.slice(0, slot);
    const droppedCount = valid.length - toAdd.length;

    setPhotos((prev) => [...prev, ...toAdd]);

    const notes: string[] = [];
    if (toAdd.length) notes.push(`Added ${toAdd.length} photo${toAdd.length > 1 ? "s" : ""}.`);
    if (droppedCount > 0) notes.push(`Only ${MAX_PHOTOS} photos allowed. ${droppedCount} not added.`);
    if (invalidCount > 0) notes.push(`${invalidCount} file${invalidCount > 1 ? "s" : ""} skipped (not images or > 5MB).`);

    if (notes.length) setMsg({ type: "info", text: notes.join(" ") });
  };

  const removeAt = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSubmit = !!service;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) {
      setMsg({ type: "error", text: "Please select a service to continue." });
      return;
    }
    const payload = { service, photos };
    setMsg({ type: "success", text: "Service info saved. Redirecting to dashboard…" });

    // Optional callback to let parent persist
    try { onSubmit?.(payload); } catch {}

    // Redirect to /dashboard (SPA router can map this path; hard nav fallback works too)
    window.setTimeout(() => {
      try { window.location.assign("/dashboard"); } catch { (window as any).location.href = "/dashboard"; }
    }, 250);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-fuchsia-500 via-purple-600 to-pink-500">
      {/* soft glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 text-center">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Service Info</h2>
            <p className="mt-1 text-sm text-white/80">Select the service you provide and add up to six photos showcasing your work.</p>
          </div>

          {msg && <MessageBanner type={msg.type} text={msg.text} onClose={() => setMsg(null)} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service selection */}
            <div>
              <span className="mb-2 block text-sm font-medium text-white/80">Select a service</span>
              <ResponsiveGrid aria-label="Service options">
                {SERVICES.map((s) => {
                  const active = service === s.key;
                  return (
                    <SquareTile
                      key={s.key}
                      onClick={() => setService(s.key)}
                      ariaPressed={active}
                      ariaLabel={s.label}
                      className={`${active ? "border-white/60 bg-white/20 ring-white/60" : "border-white/20 bg-white/10 ring-white/20 hover:bg-white/15"} px-3 py-3 transition text-white/90 focus:ring-2 focus:ring-fuchsia-400`}
                    >
                      <span className="text-2xl leading-none">{s.icon}</span>
                      <span className="mt-1 text-sm font-semibold">{s.label}</span>
                      
                    </SquareTile>
                  );
                })}
              </ResponsiveGrid>
            </div>

            {/* Photos */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="block text-sm font-medium text-white/80">Add photos</span>
                <span className="text-xs text-white/70">{photos.length}/{MAX_PHOTOS}</span>
              </div>

              {photos.length > 0 ? (
                <div className="mb-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
                  {photos.map((f, i) => (
                    <PhotoThumb key={`${f.name}-${i}`} file={f} onRemove={() => removeAt(i)} />
                  ))}
                  {remaining > 0 && <AddPhotoTile onFiles={tryAddFiles} />}
                </div>
              ) : (
                remaining > 0 && <DropZone onFiles={tryAddFiles} />
              )}
              {remaining === 0 && (
                <div className="rounded-2xl mt-3 bg-white/10 px-3 py-2 text-xs text-white/80 ring-1 ring-white/20">You have added the maximum of {MAX_PHOTOS} photos.</div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={!canSubmit}
                className="rounded-2xl bg-white px-4 py-3 font-semibold text-purple-700 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] hover:bg-fuchsia-50 disabled:opacity-60 disabled:hover:scale-100"
              >
                Save & Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// --------- Dev-only lightweight tests (safe in prod) ---------
if ((import.meta as any)?.env?.DEV) {
  try {
    const smallImg = new File([new Uint8Array(10)], "x.png", { type: "image/png" });
    const bigImg = new File([new Uint8Array(MAX_SIZE + 1)], "big.png", { type: "image/png" });

    console.assert(isValidImage(smallImg) === true, "isValidImage should accept a small PNG");
    console.assert(isValidImage(bigImg) === false, "isValidImage should reject > 5MB");

    // Extra sanity checks for services list
    console.assert(SERVICES.length === 4, "SERVICES should contain 4 entries");
    console.assert(SERVICES.every(s => typeof s.icon === 'string' && s.icon.length > 0), "Each service should have a non-empty icon string");
  } catch {
    // Some environments may not support File() ctor; ignore.
  }
}
