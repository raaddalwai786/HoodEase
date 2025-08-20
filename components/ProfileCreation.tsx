
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ServiceInfo from "./ServiceInfo";

/**
 * ProfileCreation — Step 1 (profile) + Step 2 (location) in ONE file (MapLibre, draggable pin)
 * - No Leaflet. Lightweight MapLibre GL with OSM raster tiles.
 * - Inline, dismissible messages (no window.alert)
 * - Step 1: Photo upload (drag & drop or click), Name (required), Bio (optional, 300 chars)
 * - Step 2: Search suggestions + Geolocation + Draggable marker + Click-to-pin (manual after 12s)
 *
 * After finishing, this component switches to the next component <ServiceInfo /> inline,
 * mirroring the pattern used in LoginPage -> ProfileCreation (conditional render).
 *
 * Props: onComplete?(data) — optionally called with the payload on Save & Continue.
 */

// ---------- UI: Inline Message ----------
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

// ---------- Helpers & Types ----------
export type GeoPoint = { lat: number; lon: number };
export type ProfileData = {
  name: string;
  bio: string;
  photoFile?: File | null;
  location?: { label: string; position: GeoPoint; source: "search" | "geolocation" | "manual" } | null;
};

const MAX_BIO = 300;
const MAX_SIZE = 3 * 1024 * 1024; // 3MB
const DEFAULT_CENTER: GeoPoint = { lat: 20.5937, lon: 78.9629 }; // India as sensible default

export function isValidImageFile(file: File) {
  return file.type.startsWith("image/") && file.size <= MAX_SIZE;
}

export function truncateBio(bio: string) {
  return bio.slice(0, MAX_BIO);
}

export function hasName(name: string) {
  return name.trim().length > 0;
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

export function parseLatLon(latStr: string, lonStr: string): GeoPoint | null {
  const lat = Number(latStr);
  const lon = Number(lonStr);
  if (!isFinite(lat) || !isFinite(lon)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lon < -180 || lon > 180) return null;
  return { lat, lon };
}

// ---------- Robust fetch helper (prevents uncaught rejections) ----------
async function fetchJSON(url: string, opts: RequestInit = {}, timeoutMs = 8000): Promise<any | null> {
  const ctrl = new AbortController();
  const id = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    window.clearTimeout(id);
  }
}

// ---------- Dropzone for photo ----------
function PhotoDrop({ onPick }: { onPick: (file?: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || !files[0]) return;
    onPick(files[0]); // validation handled in parent
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed px-4 py-6 transition ${
        dragOver ? "border-white bg-white/10" : "border-white/40 bg-white/5 hover:bg-white/10"
      }`}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? inputRef.current?.click() : null)}
      aria-label="Upload profile photo"
    >
      <div className="text-center">
        <div className="text-sm text-white/90">Click to upload or drag & drop</div>
        <div className="mt-1 text-xs text-white/70">JPEG/PNG, up to 3MB</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ---------- Geocoding (Mapbox preferred, Nominatim fallback) ----------
export type PlaceSuggestion = { id: string; name: string; subtitle?: string; center: GeoPoint };

async function searchPlaces(q: string): Promise<PlaceSuggestion[]> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string | undefined;
  const trimmed = q.trim();
  if (!trimmed) return [];
  // Try Mapbox first (if token present), then fallback to Nominatim.
  if (token) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json?access_token=${token}&limit=7&autocomplete=true&language=en`;
    const data = await fetchJSON(url);
    if (data?.features?.length) {
      return data.features.map((f: any) => ({
        id: f.id,
        name: f.text || f.place_name,
        subtitle: f.place_name,
        center: { lat: f.center[1], lon: f.center[0] },
      }));
    }
  }
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=jsonv2&addressdetails=1&limit=7`;
  const data = await fetchJSON(url, { headers: { Accept: "application/json" } });
  if (!data) return [];
  return (data || []).map((item: any) => ({
    id: String(item.place_id),
    name: item.display_name?.split(",")[0] ?? item.display_name,
    subtitle: item.display_name,
    center: { lat: parseFloat(item.lat), lon: parseFloat(item.lon) },
  }));
}

async function reverseGeocode(point: GeoPoint): Promise<string | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string | undefined;
  if (token) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${point.lon},${point.lat}.json?access_token=${token}&limit=1`;
    const data = await fetchJSON(url);
    const label = data?.features?.[0]?.place_name;
    if (label) return label;
  }
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${point.lat}&lon=${point.lon}&format=jsonv2`;
  const data = await fetchJSON(url, { headers: { Accept: "application/json" } });
  return data?.display_name ?? null;
}

// ---------- MapLibre wrapper ----------
function MapLibrePin({
  center,
  marker,
  onPin,
  enableClickToPin,
}: {
  center: GeoPoint;
  marker: GeoPoint | null;
  onPin: (p: GeoPoint) => void;
  enableClickToPin: boolean;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const clickHandlerRef = useRef<((e: maplibregl.MapMouseEvent & maplibregl.EventData) => void) | null>(null);

  // init map once
  useEffect(() => {
    if (!mapRef.current || mapObj.current) return;
    mapObj.current = new maplibregl.Map({
      container: mapRef.current,
      center: [center.lon, center.lat],
      zoom: 4,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          } as any,
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          } as any,
        ],
      } as any,
      attributionControl: true,
    });

    mapObj.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
    };
  }, []);

  // center changes
  useEffect(() => {
    const m = mapObj.current;
    if (!m) return;
    m.easeTo({ center: [center.lon, center.lat], zoom: 14, duration: 500 });
  }, [center.lat, center.lon]);

  // marker changes
  useEffect(() => {
    const m = mapObj.current;
    if (!m) return;
    if (marker) {
      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({ draggable: true })
          .setLngLat([marker.lon, marker.lat])
          .addTo(m);
        markerRef.current.on("dragend", () => {
          const ll = markerRef.current!.getLngLat();
          onPin({ lat: ll.lat, lon: ll.lng });
        });
      } else {
        markerRef.current.setLngLat([marker.lon, marker.lat]);
      }
    } else if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, [marker?.lat, marker?.lon]);

  // click-to-pin toggle
  useEffect(() => {
    const m = mapObj.current;
    if (!m) return;
    if (enableClickToPin && !clickHandlerRef.current) {
      const handler = (e: maplibregl.MapMouseEvent & maplibregl.EventData) => {
        const p = { lat: e.lngLat.lat, lon: e.lngLat.lng };
        onPin(p);
      };
      clickHandlerRef.current = handler;
      m.on("click", handler);
    } else if (!enableClickToPin && clickHandlerRef.current) {
      m.off("click", clickHandlerRef.current);
      clickHandlerRef.current = null;
    }
    return () => {
      if (clickHandlerRef.current && m) {
        m.off("click", clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
    };
  }, [enableClickToPin, onPin]);

  return <div ref={mapRef} className="h-full w-full" />;
}

// ---------- Component ----------
export default function ProfileCreation({ onComplete }: { onComplete?: (data: ProfileData) => void }) {
  // Step control
  const [step, setStep] = useState<1 | 2>(1);

  // Messages
  const [msg, setMsg] = useState<null | { type: "success" | "error" | "info"; text: string }>(null);

  // Step 1 fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const photoUrl = useObjectUrl(photo);

  // Step 2 fields
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false); // search loading
  const [locating, setLocating] = useState(false); // geolocation in-progress
  const [allowManual, setAllowManual] = useState(false); // enable manual pin UI after timeout
  const [manualMode, setManualMode] = useState(false); // when true, enable click-to-pin

  // After finishing, switch to next component (like LoginPage -> ProfileCreation)
  const [readyForService, setReadyForService] = useState(false);
  const payloadRef = useRef<ProfileData | null>(null);

  const [coords, setCoords] = useState<GeoPoint | null>(null);
  const [selected, setSelected] = useState<{
    label: string;
    position: GeoPoint;
    source: "search" | "geolocation" | "manual";
  } | null>(null);

  // Photo choose/validate
  const pickPhoto = (file?: File) => {
    if (!file) return;
    if (!isValidImageFile(file)) {
      setMsg({ type: "error", text: "Please upload a valid image (≤ 3MB)." });
      return;
    }
    setPhoto(file);
    setMsg(null);
  };

  const removePhoto = () => setPhoto(null);

  // Step 1 submit
  const canStep1 = useMemo(() => hasName(name) && bio.length <= MAX_BIO, [name, bio]);
  const submitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canStep1) {
      setMsg({ type: "error", text: "Please enter your full name." });
      return;
    }
    setStep(2);
    setMsg({ type: "info", text: "Profile saved. Now choose your location." });
  };

  // Search debounce
  const debounceRef = useRef<number | null>(null);
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await searchPlaces(query);
        setSuggestions(res);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const setSelection = async (point: GeoPoint, source: "search" | "geolocation" | "manual") => {
    const label = (await reverseGeocode(point)) || `${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`;
    const data = { label, position: point, source };
    setSelected(data);
    setCoords(point);
    setMsg({ type: "success", text: source === "manual" ? "Pinned location set." : "Location selected." });
  };

  const chooseSuggestion = (s: PlaceSuggestion) => {
    setSelection(s.center, "search");
    setManualMode(false);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setMsg({ type: "error", text: "Geolocation not supported by this browser." });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const point = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        await setSelection(point, "geolocation");
        setLocating(false);
        setAllowManual(true);
        setManualMode(false);
      },
      (err) => {
        setMsg({ type: "error", text: err.message || "Failed to get your location." });
        setLocating(false);
        setAllowManual(true);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Auto geolocation when entering step 2
  useEffect(() => {
    if (step !== 2 || coords) return;
    const isSecure = typeof window !== "undefined" ? window.isSecureContext : true;
    if (!isSecure) {
      setMsg({ type: "info", text: "Geolocation requires HTTPS or localhost. Use search or tap 'Use my current location' after enabling HTTPS." });
      setAllowManual(true);
      return;
    }
    useMyLocation();
  }, [step, coords]);

  // Safety timeout in case geolocation prompt hangs or user ignores it
  useEffect(() => {
    if (!locating) return;
    const id = window.setTimeout(() => {
      setLocating(false);
      if (!coords) {
        setAllowManual(true);
        setManualMode(true); // automatically enable click-to-pin after timeout
      }
    }, 12000);
    return () => window.clearTimeout(id);
  }, [locating, coords]);

  // Final submit
  const canFinish = !!selected;
  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) {
      setMsg({ type: "error", text: "Please pick a location first." });
      return;
    }
    const payload: ProfileData = {
      name: name.trim(),
      bio: truncateBio(bio.trim()),
      photoFile: photo,
      location: selected,
    };
    payloadRef.current = payload;

    // Optional: inform parent if provided
    if (typeof onComplete === "function") {
      try { onComplete(payload); } catch {}
    }

    // Inline success and move to next component inline (like LoginPage -> ProfileCreation)
    setMsg({ type: "success", text: "Profile & location saved. Continuing…" });
    setReadyForService(true);
  };

  const effectiveCenter = coords ?? DEFAULT_CENTER;
  const isSecure = typeof window !== "undefined" ? window.isSecureContext : true;

  // Like LoginPage -> ProfileCreation, switch to the next component inline
  if (readyForService) {
    return <ServiceInfo />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-fuchsia-500 via-purple-600 to-pink-500">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-300/30 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Title */}
          <div className="mb-4 text-center">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {step === 1 ? "Create your profile" : "Choose your location"}
            </h2>
            <p className="mt-1 text-sm text-white/80">
              {step === 1
                ? "Add a photo, your name, and a short bio."
                : "Search, use GPS, or click the map to place a pin. Drag to fine-tune."}
            </p>
          </div>

          {msg && <MessageBanner type={msg.type} text={msg.text} onClose={() => setMsg(null)} />}

          {step === 1 ? (
            <form onSubmit={submitStep1} className="space-y-6">
              {/* Photo */}
              <div className="space-y-3">
                <span className="block text-sm font-medium text-white/80">Profile photo</span>
                {photoUrl ? (
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-white/30">
                      <img src={photoUrl} alt="Profile preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex gap-2">
                      <label className="cursor-pointer rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-purple-700 shadow hover:bg-fuchsia-50">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => pickPhoto(e.target.files?.[0])} />
                        Replace
                      </label>
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className="rounded-2xl bg-white/20 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/30"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <PhotoDrop onPick={pickPhoto} />
                )}
              </div>

              {/* Name */}
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/80">Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-2xl bg-white/90 px-3 py-3 text-gray-900 ring-1 ring-black/5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                  required
                />
              </label>

              {/* Bio */}
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/80">Bio</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(truncateBio(e.target.value))}
                  placeholder="Tell us about yourself (skills, experience, etc.)"
                  rows={4}
                  className="w-full resize-none rounded-2xl bg-white/90 px-3 py-3 text-gray-900 ring-1 ring-black/5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                />
                <div className="mt-1 text-right text-xs text-white/70">{bio.length}/{MAX_BIO}</div>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={!canStep1}
                  className="rounded-2xl bg-white px-4 py-3 font-semibold text-purple-700 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] hover:bg-fuchsia-50 disabled:opacity-60 disabled:hover:scale-100"
                >
                  Save & Continue
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinish} className="space-y-5">
              {/* Search input */}
              <div className="relative">
                <div className="group relative flex items-center rounded-2xl bg-white/90 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-fuchsia-400">
                  <span className="pl-3 pr-2 text-gray-500">🔎</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search a city, area, landmark..."
                    className="w-full rounded-2xl bg-transparent px-2 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                    aria-label="Search locations"
                  />
                  {query && (
                    <button type="button" onClick={() => setQuery("")} className="pr-3 text-gray-500 hover:text-gray-700" aria-label="Clear">✕</button>
                  )}
                </div>
                {(suggestions.length > 0 || loading) && (
                  <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/90 shadow">
                    {loading && <li className="px-4 py-3 text-sm text-gray-600">Searching…</li>}
                    {!loading &&
                      suggestions.map((s) => (
                        <li
                          key={s.id}
                          className="cursor-pointer px-4 py-3 text-sm text-gray-900 hover:bg-fuchsia-50"
                          onClick={() => chooseSuggestion(s)}
                        >
                          <div className="font-medium">{s.name}</div>
                          {s.subtitle && <div className="text-xs text-gray-600">{s.subtitle}</div>}
                        </li>
                      ))}
                  </ul>
                )}
              </div>

              {/* Quick actions */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={useMyLocation}
                  className="rounded-2xl bg-white/20 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/30"
                >
                  Use my current location
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-2xl bg-white/20 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/30"
                >
                  Back
                </button>
              </div>

              {/* Map area */}
              <div className="overflow-hidden rounded-2xl ring-2 ring-white/20">
                <div className="relative h-60 w-full">
                  <MapLibrePin
                    center={effectiveCenter}
                    marker={coords}
                    enableClickToPin={manualMode || !!coords}
                    onPin={(p) => setSelection(p, "manual")}
                  />
                  {!coords && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/30 text-sm text-gray-800 backdrop-blur-[2px] gap-3 px-3 text-center">
                      <span>
                        {locating
                          ? "Detecting your location…"
                          : isSecure
                          ? "Allow location access or click the map to place a pin"
                          : "Geolocation needs HTTPS or localhost. Click the map to place a pin or use search."}
                      </span>
                      {!locating && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={useMyLocation}
                            className="rounded-lg bg-white/80 px-2 py-1 text-xs font-semibold text-purple-700 ring-1 ring-black/10 hover:bg-white"
                          >
                            Retry
                          </button>
                          {allowManual && (
                            <button
                              type="button"
                              onClick={() => setManualMode(true)}
                              className="rounded-lg bg-white/80 px-2 py-1 text-xs font-semibold text-purple-700 ring-1 ring-black/10 hover:bg-white"
                            >
                              Set manually
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {selected && (
                  <div className="bg-white/80 px-3 py-2 text-xs text-gray-700">
                    <span className="font-medium">Selected:</span> {selected.label} · {selected.position.lat.toFixed(5)}, {selected.position.lon.toFixed(5)}
                    <a
                      className="ml-2 underline"
                      href={`https://www.openstreetmap.org/?mlat=${selected.position.lat}&mlon=${selected.position.lon}#map=15/${selected.position.lat}/${selected.position.lon}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in OSM
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={!canFinish}
                  className="rounded-2xl bg-white px-4 py-3 font-semibold text-purple-700 shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] hover:bg-fuchsia-50 disabled:opacity-60 disabled:hover:scale-100"
                >
                  Save & Continue
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-xs leading-relaxed text-white/70">
            By continuing, you agree to our <a href="#" className="font-medium text-white hover:underline">Terms</a> and
            <a href="#" className="font-medium text-white hover:underline"> Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Dev-only sanity tests (run in dev; harmless in prod builds) ----------
if ((import.meta as any)?.env?.DEV) {
  try {
    const fakeImgOk = new File([new Uint8Array(10)], "ok.png", { type: "image/png" });
    const fakeImgBig = new File([new Uint8Array(3 * 1024 * 1024 + 1)], "big.png", { type: "image/png" });
    const fakeTxt = new File([new Uint8Array(10)], "note.txt", { type: "text/plain" });

    console.assert(isValidImageFile(fakeImgOk) === true, "Image validator should accept valid image ≤ 3MB");
    console.assert(isValidImageFile(fakeImgBig) === false, "Image validator should reject > 3MB");
    console.assert(isValidImageFile(fakeTxt as unknown as File) === false, "Image validator should reject non-image MIME");

    console.assert(hasName("John") === true, "Name validator should accept non-empty");
    console.assert(hasName("   ") === false, "Name validator should reject blank");

    console.assert(truncateBio("a".repeat(500)).length === 300, "Bio should truncate to MAX_BIO");
    console.assert(truncateBio("short").length === 5, "Bio should not over-truncate short input");

    console.assert(parseLatLon("12.34", "56.78")?.lat === 12.34, "parseLatLon should parse valid numbers");
    console.assert(parseLatLon("-91", "0") === null, "parseLatLon should reject invalid latitude < -90");
    console.assert(parseLatLon("90.0001", "0") === null, "parseLatLon should reject invalid latitude > 90");
    console.assert(parseLatLon("0", "181") === null, "parseLatLon should reject invalid longitude > 180");
    console.assert(parseLatLon("0", "-180")?.lon === -180, "parseLatLon should allow boundary longitudes");

    // Ensure fetch helper doesn't throw synchronously on bad URLs
    (async () => {
      const bad = await fetchJSON("https://invalid.localhost.test/");
      console.assert(bad === null, "fetchJSON should return null on network failure");
      const empty = await searchPlaces("   ");
      console.assert(Array.isArray(empty) && empty.length === 0, "searchPlaces should return [] for blank query");
    })();
  } catch {
    // In some environments File constructor may not exist; skip.
  }
}
