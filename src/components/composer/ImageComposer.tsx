"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Stage from "./Stage";
import { clamp, createId } from "@/lib/composer/geometry";
import { loadImageElement, renderDocument, type ImageMap } from "@/lib/composer/render";
import {
  DEFAULT_PRESET,
  MAX_CANVAS_SIDE,
  MIN_CANVAS_SIDE,
  SIZE_PRESETS,
} from "@/lib/composer/presets";
import {
  FONT_OPTIONS,
  WEIGHT_OPTIONS,
  type ComposerDoc,
  type ImageLayer,
  type Layer,
  type TextAlign,
  type TextLayer,
} from "@/lib/composer/types";

export type PresetLogo = { id: string; name: string; url: string };

const input =
  "w-full rounded-lg border border-white/10 bg-slate-900/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-500";
const btn =
  "rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10";
const btnPrimary =
  "rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50";

function emptyDoc(): ComposerDoc {
  return {
    width: DEFAULT_PRESET.width,
    height: DEFAULT_PRESET.height,
    backgroundColor: "#0f172a",
    background: null,
    layers: [],
  };
}

export default function ImageComposer({ presetLogos }: { presetLogos: PresetLogo[] }) {
  const [doc, setDoc] = useState<ComposerDoc>(emptyDoc);
  const [images, setImages] = useState<ImageMap>(() => new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("thiet-ke");

  const historyRef = useRef<ComposerDoc[]>([]);
  const lastPushRef = useRef(0);
  const objectUrlsRef = useRef<string[]>([]);
  const bgFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const selected = doc.layers.find((l) => l.id === selectedId) ?? null;

  /* ---------------------------------------------------------------- lịch sử */

  const pushHistory = useCallback((prev: ComposerDoc, force = false) => {
    const now = Date.now();
    if (!force && now - lastPushRef.current < 600 && historyRef.current.length) return;
    lastPushRef.current = now;
    historyRef.current.push(prev);
    if (historyRef.current.length > 40) historyRef.current.shift();
  }, []);

  const mutate = useCallback(
    (fn: (d: ComposerDoc) => ComposerDoc, force = false) => {
      setDoc((prev) => {
        pushHistory(prev, force);
        return fn(prev);
      });
    },
    [pushHistory]
  );

  const undo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (prev) {
      setDoc(prev);
      lastPushRef.current = 0;
    }
  }, []);

  const patchLayer = useCallback(
    (id: string, patch: Partial<Layer>) => {
      setDoc((prev) => {
        pushHistory(prev);
        return {
          ...prev,
          layers: prev.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
        };
      });
    },
    [pushHistory]
  );

  const commit = useCallback(() => {
    lastPushRef.current = 0;
  }, []);

  /* ----------------------------------------------------------------- ảnh */

  const registerImage = useCallback((src: string, img: HTMLImageElement) => {
    setImages((prev) => {
      const next = new Map(prev);
      next.set(src, img);
      return next;
    });
  }, []);

  async function loadFrom(source: File | string): Promise<{ src: string; aspect: number }> {
    let src: string;
    if (typeof source === "string") {
      src = source;
    } else {
      src = URL.createObjectURL(source);
      objectUrlsRef.current.push(src);
    }
    const img = await loadImageElement(src);
    registerImage(src, img);
    return { src, aspect: img.naturalWidth / Math.max(1, img.naturalHeight) };
  }

  async function withBusy(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setBusy(null);
    }
  }

  /* --------------------------------------------------------------- hành động */

  function setBackground(source: File | string) {
    void withBusy("Đang tải ảnh nền…", async () => {
      const { src, aspect } = await loadFrom(source);
      mutate(
        (d) => ({
          ...d,
          background: { src, aspect, fit: "cover", zoom: 1, offsetX: 0, offsetY: 0 },
        }),
        true
      );
    });
  }

  function addLogo(source: File | string, name: string) {
    void withBusy("Đang thêm logo…", async () => {
      const { src, aspect } = await loadFrom(source);
      const layer: ImageLayer = {
        id: createId("img"),
        kind: "image",
        name,
        src,
        aspect,
        x: 0.5,
        y: 0.5,
        width: 0.28,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
      };
      mutate((d) => ({ ...d, layers: [...d.layers, layer] }), true);
      setSelectedId(layer.id);
    });
  }

  function addText() {
    const layer: TextLayer = {
      id: createId("txt"),
      kind: "text",
      name: "Chữ",
      text: "Nhập nội dung tại đây",
      x: 0.5,
      y: 0.75,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      fontSize: 0.07,
      fontFamily: FONT_OPTIONS[0].value,
      fontWeight: 700,
      color: "#ffffff",
      align: "center",
      lineHeight: 1.25,
      maxWidth: 0.8,
      letterSpacing: 0,
      strokeWidth: 0,
      strokeColor: "#000000",
      shadow: true,
    };
    mutate((d) => ({ ...d, layers: [...d.layers, layer] }), true);
    setSelectedId(layer.id);
  }

  function removeLayer(id: string) {
    mutate((d) => ({ ...d, layers: d.layers.filter((l) => l.id !== id) }), true);
    setSelectedId(null);
  }

  function duplicateLayer(id: string) {
    mutate((d) => {
      const src = d.layers.find((l) => l.id === id);
      if (!src) return d;
      const copy = {
        ...src,
        id: createId(src.kind === "image" ? "img" : "txt"),
        name: `${src.name} (bản sao)`,
        x: clamp(src.x + 0.04, 0, 1),
        y: clamp(src.y + 0.04, 0, 1),
      } as Layer;
      return { ...d, layers: [...d.layers, copy] };
    }, true);
  }

  function moveLayer(id: string, dir: -1 | 1) {
    mutate((d) => {
      const i = d.layers.findIndex((l) => l.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.layers.length) return d;
      const layers = [...d.layers];
      [layers[i], layers[j]] = [layers[j], layers[i]];
      return { ...d, layers };
    }, true);
  }

  function applyPreset(width: number, height: number) {
    mutate((d) => ({ ...d, width, height }), true);
  }

  /* --------------------------------------------------------------- bàn phím */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (typing || !selectedId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        removeLayer(selectedId);
        return;
      }

      const step = e.shiftKey ? 0.02 : 0.002;
      const nudge: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const move = nudge[e.key];
      if (move) {
        e.preventDefault();
        const l = doc.layers.find((x) => x.id === selectedId);
        if (l) patchLayer(selectedId, { x: l.x + move[0], y: l.y + move[1] });
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, doc.layers, undo]);

  /* ---------------------------------------------------------------- xuất file */

  async function exportImage(format: "png" | "jpeg") {
    await withBusy("Đang xuất ảnh…", async () => {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }

      const canvas = document.createElement("canvas");
      canvas.width = doc.width;
      canvas.height = doc.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas.");

      if (format === "jpeg") {
        ctx.fillStyle = doc.backgroundColor || "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      renderDocument(ctx, doc, images);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, `image/${format}`, format === "jpeg" ? 0.92 : undefined)
      );
      if (!blob) throw new Error("Không tạo được file ảnh.");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName || "thiet-ke"}-${doc.width}x${doc.height}.${
        format === "jpeg" ? "jpg" : "png"
      }`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  const hasContent = doc.background !== null || doc.layers.length > 0;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof SIZE_PRESETS>();
    for (const p of SIZE_PRESETS) {
      if (!map.has(p.group)) map.set(p.group, []);
      map.get(p.group)!.push(p);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)_300px]">
      {/* ================= CỘT TRÁI ================= */}
      <div className="space-y-4">
        <Panel title="Kích thước">
          <select
            className={input}
            value={`${doc.width}x${doc.height}`}
            onChange={(e) => {
              const [w, h] = e.target.value.split("x").map(Number);
              if (w && h) applyPreset(w, h);
            }}
          >
            {grouped.map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map((p) => (
                  <option key={p.id} value={`${p.width}x${p.height}`}>
                    {p.label} — {p.width}×{p.height}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="mt-3 flex items-center gap-2">
            <NumberBox
              label="Rộng"
              value={doc.width}
              onChange={(v) => applyPreset(clamp(v, MIN_CANVAS_SIDE, MAX_CANVAS_SIDE), doc.height)}
            />
            <span className="mt-5 text-slate-500">×</span>
            <NumberBox
              label="Cao"
              value={doc.height}
              onChange={(v) => applyPreset(doc.width, clamp(v, MIN_CANVAS_SIDE, MAX_CANVAS_SIDE))}
            />
          </div>
        </Panel>

        <Panel title="Ảnh nền">
          <input
            ref={bgFileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setBackground(f);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => bgFileRef.current?.click()}>
              ⬆ Chọn ảnh nền
            </button>
            {doc.background && (
              <button
                type="button"
                className={btn}
                onClick={() => mutate((d) => ({ ...d, background: null }), true)}
              >
                Gỡ nền
              </button>
            )}
          </div>

          {doc.background && (
            <div className="mt-3 space-y-3">
              <div className="flex gap-2">
                {(["cover", "contain"] as const).map((fit) => (
                  <button
                    key={fit}
                    type="button"
                    onClick={() =>
                      mutate((d) =>
                        d.background ? { ...d, background: { ...d.background, fit } } : d
                      )
                    }
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition ${
                      doc.background?.fit === fit
                        ? "border-cyan-500 bg-cyan-500/15 text-cyan-200"
                        : "border-white/10 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {fit === "cover" ? "Phủ kín" : "Vừa khung"}
                  </button>
                ))}
              </div>

              <Slider
                label="Phóng to"
                value={doc.background.zoom}
                min={0.5}
                max={3}
                step={0.01}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(zoom) =>
                  mutate((d) => (d.background ? { ...d, background: { ...d.background, zoom } } : d))
                }
              />
              <Slider
                label="Dịch ngang"
                value={doc.background.offsetX}
                min={-0.5}
                max={0.5}
                step={0.005}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(offsetX) =>
                  mutate((d) =>
                    d.background ? { ...d, background: { ...d.background, offsetX } } : d
                  )
                }
              />
              <Slider
                label="Dịch dọc"
                value={doc.background.offsetY}
                min={-0.5}
                max={0.5}
                step={0.005}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(offsetY) =>
                  mutate((d) =>
                    d.background ? { ...d, background: { ...d.background, offsetY } } : d
                  )
                }
              />
            </div>
          )}

          <label className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-300">
            Màu nền
            <input
              type="color"
              value={doc.backgroundColor}
              onChange={(e) =>
                mutate((d) => ({ ...d, backgroundColor: e.target.value }))
              }
              className="h-8 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
            />
          </label>
        </Panel>

        <Panel title="Logo">
          <input
            ref={logoFileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) addLogo(f, f.name.replace(/\.[^.]+$/, ""));
              e.target.value = "";
            }}
          />
          <button type="button" className={`${btn} w-full`} onClick={() => logoFileRef.current?.click()}>
            ⬆ Tải logo của bạn
          </button>

          {presetLogos.length > 0 && (
            <>
              <p className="mt-4 mb-2 text-xs font-semibold text-slate-400">Logo có sẵn</p>
              <div className="grid grid-cols-3 gap-2">
                {presetLogos.map((logo) => (
                  <button
                    key={logo.id}
                    type="button"
                    title={logo.name}
                    onClick={() => addLogo(logo.url, logo.name)}
                    className="flex h-16 items-center justify-center rounded-lg border border-white/10 bg-white/95 p-1.5 transition hover:border-cyan-400"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.url} alt={logo.name} className="max-h-full max-w-full object-contain" />
                  </button>
                ))}
              </div>
            </>
          )}

          <button type="button" className={`${btn} mt-3 w-full`} onClick={addText}>
            + Thêm chữ
          </button>
        </Panel>
      </div>

      {/* ================= GIỮA ================= */}
      <div className="space-y-4">
        <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
          {hasContent ? (
            <Stage
              doc={doc}
              images={images}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onPatchLayer={patchLayer}
              onCommit={commit}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-white/15 text-center"
              style={{ aspectRatio: `${doc.width} / ${doc.height}` }}
            >
              <div className="px-6">
                <div className="mb-3 text-4xl">🖼️</div>
                <p className="font-medium text-white">Bắt đầu bằng một ảnh nền</p>
                <p className="mt-1 text-sm text-slate-400">
                  Chọn ảnh ở cột trái, rồi thêm logo và chữ lên trên.
                </p>
              </div>
            </div>
          )}
        </div>

        {(busy || error) && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              error
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
            }`}
          >
            {error ?? busy}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-4">
          <input
            className={`${input} sm:max-w-[200px]`}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="ten-file"
          />
          <button
            type="button"
            className={btnPrimary}
            disabled={!hasContent || Boolean(busy)}
            onClick={() => exportImage("png")}
          >
            ⬇ Tải PNG
          </button>
          <button
            type="button"
            className={btn}
            disabled={!hasContent || Boolean(busy)}
            onClick={() => exportImage("jpeg")}
          >
            Tải JPG
          </button>
          <button type="button" className={btn} onClick={undo}>
            ↶ Hoàn tác
          </button>
          <span className="text-xs text-slate-500">
            Xuất ở đúng {doc.width}×{doc.height}px
          </span>
        </div>
      </div>

      {/* ================= CỘT PHẢI ================= */}
      <div className="space-y-4">
        <Panel title={`Lớp (${doc.layers.length})`}>
          {doc.layers.length === 0 ? (
            <p className="text-xs text-slate-500">Chưa có lớp nào.</p>
          ) : (
            <ul className="space-y-1.5">
              {[...doc.layers].reverse().map((layer) => (
                <li key={layer.id}>
                  <div
                    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition ${
                      layer.id === selectedId
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        patchLayer(layer.id, { visible: !layer.visible })
                      }
                      title={layer.visible ? "Ẩn lớp" : "Hiện lớp"}
                      className="text-xs"
                    >
                      {layer.visible ? "👁" : "🚫"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedId(layer.id)}
                      className="min-w-0 flex-1 truncate text-left text-xs text-slate-200"
                    >
                      {layer.kind === "text" ? "T" : "🖼"} {layer.name}
                    </button>
                    <button type="button" onClick={() => moveLayer(layer.id, 1)} title="Lên trên">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveLayer(layer.id, -1)} title="Xuống dưới">
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateLayer(layer.id)}
                      title="Nhân bản"
                    >
                      ⧉
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLayer(layer.id)}
                      title="Xoá"
                      className="text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {selected && (
          <Panel title="Thuộc tính">
            <Inspector
              layer={selected}
              onPatch={(patch) => patchLayer(selected.id, patch)}
              canvasWidth={doc.width}
            />
          </Panel>
        )}

        <Panel title="Mẹo">
          <ul className="space-y-1.5 text-xs leading-relaxed text-slate-400">
            <li>Kéo để di chuyển, chấm xanh góc để phóng, chấm vàng để xoay.</li>
            <li>Giữ <kbd className="rounded bg-white/10 px-1">Shift</kbd> khi kéo để tắt hút vào giữa.</li>
            <li>Phím mũi tên để nhích từng chút, Delete để xoá lớp.</li>
            <li><kbd className="rounded bg-white/10 px-1">Ctrl</kbd>+<kbd className="rounded bg-white/10 px-1">Z</kbd> để hoàn tác.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ================================================================ phụ trợ */

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      {children}
    </section>
  );
}

function NumberBox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex-1 text-xs text-slate-400">
      {label}
      <input
        type="number"
        className={`${input} mt-1`}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="block text-xs text-slate-400">
      <span className="mb-1 flex items-center justify-between">
        {label}
        <span className="text-slate-500">{format ? format(value) : value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500"
      />
    </label>
  );
}

function Inspector({
  layer,
  onPatch,
  canvasWidth,
}: {
  layer: Layer;
  onPatch: (patch: Partial<Layer>) => void;
  canvasWidth: number;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-xs text-slate-400">
        Tên lớp
        <input
          className={`${input} mt-1`}
          value={layer.name}
          onChange={(e) => onPatch({ name: e.target.value })}
        />
      </label>

      {layer.kind === "text" && (
        <>
          <label className="block text-xs text-slate-400">
            Nội dung
            <textarea
              className={`${input} mt-1 min-h-[80px] resize-y`}
              value={layer.text}
              onChange={(e) => onPatch({ text: e.target.value } as Partial<Layer>)}
            />
          </label>

          <label className="block text-xs text-slate-400">
            Phông chữ
            <select
              className={`${input} mt-1`}
              value={layer.fontFamily}
              onChange={(e) => onPatch({ fontFamily: e.target.value } as Partial<Layer>)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <label className="flex-1 text-xs text-slate-400">
              Độ đậm
              <select
                className={`${input} mt-1`}
                value={layer.fontWeight}
                onChange={(e) =>
                  onPatch({ fontWeight: Number(e.target.value) } as Partial<Layer>)
                }
              >
                {WEIGHT_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 text-xs text-slate-400">
              Màu chữ
              <input
                type="color"
                className="mt-1 h-[38px] w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
                value={layer.color}
                onChange={(e) => onPatch({ color: e.target.value } as Partial<Layer>)}
              />
            </label>
          </div>

          <div className="flex gap-2">
            {(["left", "center", "right"] as TextAlign[]).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => onPatch({ align: a } as Partial<Layer>)}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition ${
                  layer.align === a
                    ? "border-cyan-500 bg-cyan-500/15 text-cyan-200"
                    : "border-white/10 text-slate-300 hover:bg-white/5"
                }`}
              >
                {a === "left" ? "Trái" : a === "center" ? "Giữa" : "Phải"}
              </button>
            ))}
          </div>

          <Slider
            label="Cỡ chữ"
            value={layer.fontSize}
            min={0.01}
            max={0.3}
            step={0.002}
            format={(v) => `${Math.round(v * canvasWidth)}px`}
            onChange={(fontSize) => onPatch({ fontSize } as Partial<Layer>)}
          />
          <Slider
            label="Bề rộng khối chữ"
            value={layer.maxWidth}
            min={0.1}
            max={1.5}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(maxWidth) => onPatch({ maxWidth } as Partial<Layer>)}
          />
          <Slider
            label="Giãn dòng"
            value={layer.lineHeight}
            min={0.8}
            max={2.5}
            step={0.05}
            onChange={(lineHeight) => onPatch({ lineHeight } as Partial<Layer>)}
          />
          <Slider
            label="Viền chữ"
            value={layer.strokeWidth}
            min={0}
            max={0.2}
            step={0.005}
            format={(v) => (v === 0 ? "tắt" : `${(v * 100).toFixed(1)}%`)}
            onChange={(strokeWidth) => onPatch({ strokeWidth } as Partial<Layer>)}
          />
          {layer.strokeWidth > 0 && (
            <label className="flex items-center justify-between text-xs text-slate-400">
              Màu viền
              <input
                type="color"
                value={layer.strokeColor}
                onChange={(e) => onPatch({ strokeColor: e.target.value } as Partial<Layer>)}
                className="h-8 w-14 cursor-pointer rounded border border-white/10 bg-transparent"
              />
            </label>
          )}
          <label className="flex cursor-pointer items-center justify-between text-xs text-slate-300">
            Đổ bóng cho dễ đọc
            <input
              type="checkbox"
              checked={layer.shadow}
              onChange={(e) => onPatch({ shadow: e.target.checked } as Partial<Layer>)}
              className="h-4 w-4 accent-cyan-500"
            />
          </label>
        </>
      )}

      {layer.kind === "image" && (
        <Slider
          label="Kích thước"
          value={layer.width}
          min={0.02}
          max={2}
          step={0.005}
          format={(v) => `${Math.round(v * canvasWidth)}px`}
          onChange={(width) => onPatch({ width } as Partial<Layer>)}
        />
      )}

      <Slider
        label="Xoay"
        value={layer.rotation}
        min={0}
        max={360}
        step={1}
        format={(v) => `${Math.round(v)}°`}
        onChange={(rotation) => onPatch({ rotation })}
      />
      <Slider
        label="Độ mờ"
        value={layer.opacity}
        min={0}
        max={1}
        step={0.01}
        format={(v) => `${Math.round(v * 100)}%`}
        onChange={(opacity) => onPatch({ opacity })}
      />

      <div className="grid grid-cols-2 gap-2">
        <button type="button" className={btn} onClick={() => onPatch({ x: 0.5 })}>
          Canh giữa ngang
        </button>
        <button type="button" className={btn} onClick={() => onPatch({ y: 0.5 })}>
          Canh giữa dọc
        </button>
      </div>
    </div>
  );
}
