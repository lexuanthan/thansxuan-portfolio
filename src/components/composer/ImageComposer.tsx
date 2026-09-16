"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Stage from "./Stage";
import { clamp, createId } from "@/lib/composer/geometry";
import { loadImageElement, renderDocument, type ImageMap } from "@/lib/composer/render";
import { dilateMask, hasMask, inpaint } from "@/lib/composer/inpaint";
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
  "w-full rounded-lg border border-line bg-surface-soft px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-brand-400 focus:bg-surface";
const btn =
  "rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700";
const btnPrimary =
  "rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-brand transition hover:bg-brand-300 disabled:opacity-50 disabled:shadow-none";

function emptyDoc(): ComposerDoc {
  return {
    width: DEFAULT_PRESET.width,
    height: DEFAULT_PRESET.height,
    backgroundColor: "#ffffff",
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

  // Công cụ xoá đối tượng
  const [eraseMode, setEraseMode] = useState(false);
  const [brushSize, setBrushSize] = useState(40);
  const [hasStrokes, setHasStrokes] = useState(false);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const paintingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);


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

  /* ------------------------------------------------------- xoá đối tượng */

  /**
   * Đổi toạ độ con trỏ sang toạ độ trên lớp mặt nạ.
   * Lớp mặt nạ có đúng kích thước tài liệu nhưng được CSS kéo giãn cho vừa
   * khung hiển thị, nên phải nhân lại theo tỷ lệ giữa hai bên.
   */
  function maskPoint(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = maskRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      scale: canvas.width / rect.width,
    };
  }

  function paintTo(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = maskRef.current;
    const point = maskPoint(e);
    if (!canvas || !point) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const radius = (brushSize * point.scale) / 2;

    ctx.fillStyle = "rgba(244, 63, 94, 0.55)";
    ctx.strokeStyle = "rgba(244, 63, 94, 0.55)";
    ctx.lineWidth = radius * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const last = lastPointRef.current;
    if (last) {
      // Nối hai điểm liên tiếp: chuột di nhanh sẽ nhảy cách nhau cả chục pixel,
      // chỉ chấm tròn thì nét vẽ đứt quãng thành chuỗi hạt.
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    lastPointRef.current = { x: point.x, y: point.y };
    setHasStrokes(true);
  }

  function clearMask() {
    const canvas = maskRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    lastPointRef.current = null;
    setHasStrokes(false);
  }

  function toggleEraseMode() {
    clearMask();
    setEraseMode((v) => !v);
    setSelectedId(null);
  }

  /**
   * Lấp vùng đã bôi rồi đặt kết quả làm ảnh nền mới.
   *
   * Ảnh nền được vẽ lại đúng khung hình đang thấy trước khi lấp, nên sau thao
   * tác này phần ảnh nằm ngoài khung sẽ mất và các nút phóng to / dịch chuyển
   * nền quay về mặc định. Đổi lại, vùng bôi khớp chính xác với chỗ đang nhìn.
   */
  function applyErase() {
    const maskCanvas = maskRef.current;
    if (!maskCanvas || !doc.background) return;

    void withBusy("Đang xoá vật thể…", async () => {
      const W = doc.width;
      const H = doc.height;

      // Vẽ riêng ảnh nền, bỏ hết lớp logo và chữ ở trên
      const flat = document.createElement("canvas");
      flat.width = W;
      flat.height = H;
      const flatCtx = flat.getContext("2d", { willReadFrequently: true });
      if (!flatCtx) throw new Error("Trình duyệt không hỗ trợ canvas.");

      renderDocument(flatCtx, { ...doc, layers: [] }, images);

      // Đọc vùng đã bôi: alpha > 0 nghĩa là điểm cần xoá
      const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (!maskCtx) throw new Error("Không đọc được vùng đã chọn.");

      const maskPixels = maskCtx.getImageData(0, 0, W, H).data;
      const mask = new Uint8Array(W * H);
      for (let i = 0; i < mask.length; i += 1) {
        if (maskPixels[i * 4 + 3] > 10) mask[i] = 1;
      }

      if (!hasMask(mask)) throw new Error("Chưa bôi vùng nào để xoá.");

      const image = flatCtx.getImageData(0, 0, W, H);
      // Nới thêm 2 điểm ảnh để không sót viền của chính vật thể vừa xoá
      inpaint(image.data, W, H, dilateMask(mask, W, H, 2));
      flatCtx.putImageData(image, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        flat.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Không tạo được ảnh sau khi xoá.");

      const url = URL.createObjectURL(blob);
      objectUrlsRef.current.push(url);

      const img = await loadImageElement(url);
      registerImage(url, img);

      mutate(
        (d) => ({
          ...d,
          background: {
            src: url,
            aspect: W / H,
            fit: "cover",
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
          },
        }),
        true
      );

      clearMask();
    });
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
    <div className="grid gap-5 xl:grid-cols-[19rem_minmax(0,1fr)_19rem]">
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
            <span className="mt-5 text-ink-400">×</span>
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
                        ? "border-brand-400 bg-brand-100 text-brand-800"
                        : "border-line text-ink-700 hover:bg-brand-50"
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

          <label className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-700">
            Màu nền
            <input
              type="color"
              value={doc.backgroundColor}
              onChange={(e) =>
                mutate((d) => ({ ...d, backgroundColor: e.target.value }))
              }
              className="h-8 w-14 cursor-pointer rounded border border-line bg-transparent"
            />
          </label>
        </Panel>

        <Panel title="Xoá đối tượng">
          {!doc.background ? (
            <p className="text-[11px] leading-relaxed text-ink-400">
              Cần có ảnh nền trước đã. Chọn ảnh ở ô bên trên rồi quay lại đây.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleEraseMode}
                className={
                  eraseMode
                    ? "w-full rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400"
                    : `${btn} w-full py-2.5 text-sm`
                }
              >
                {eraseMode ? "✓ Xong, thoát chế độ xoá" : "🩹 Bật chế độ xoá"}
              </button>

              {eraseMode && (
                <>
                  <label className="mt-3 block text-xs text-ink-500">
                    <span className="mb-1 flex items-center justify-between">
                      Cỡ cọ
                      <span className="text-ink-400">{brushSize}px</span>
                    </span>
                    <input
                      type="range"
                      min={8}
                      max={160}
                      step={2}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-rose-500"
                    />
                  </label>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={applyErase}
                      disabled={!hasStrokes || Boolean(busy)}
                      className="flex-1 rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:opacity-50"
                    >
                      Xoá vùng đã bôi
                    </button>
                    <button
                      type="button"
                      onClick={clearMask}
                      disabled={!hasStrokes}
                      className={`${btn} disabled:opacity-50`}
                    >
                      Bôi lại
                    </button>
                  </div>

                  <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
                    Bôi đè lên vật thể muốn xoá, bôi rộng hơn mép một chút. Chỗ đó
                    sẽ được lấp bằng màu xung quanh.
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
                    Hợp với vật nhỏ trên nền trơn. Nền có hoa văn hay chữ thì chỗ
                    xoá sẽ thành mảng mờ — đó là giới hạn của cách lấp này.
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-ink-400">
                    Sau khi xoá, ảnh nền được cố định theo khung đang thấy. Bấm
                    Hoàn tác nếu muốn quay lại.
                  </p>
                </>
              )}
            </>
          )}
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

          <p className="mt-4 mb-2 text-xs font-semibold text-ink-500">
            Logo có sẵn {presetLogos.length > 0 && `(${presetLogos.length})`}
          </p>

          {presetLogos.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {presetLogos.map((logo) => (
                <button
                  key={logo.id}
                  type="button"
                  title={`Chèn ${logo.name}`}
                  onClick={() => addLogo(logo.url, logo.name)}
                  className="flex h-16 items-center justify-center rounded-lg border border-line bg-white p-1.5 transition hover:border-brand-400"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo.url} alt={logo.name} className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-line-strong px-3 py-4 text-center text-[11px] leading-relaxed text-ink-400">
              Chưa có logo nào được nạp sẵn.
              <br />
              Quản trị viên thêm ở mục <span className="text-ink-500">Logo có sẵn</span> trong admin.
            </p>
          )}

          <button type="button" className={`${btn} mt-3 w-full`} onClick={addText}>
            + Thêm chữ
          </button>
        </Panel>
      </div>

      {/* ================= GIỮA ================= */}
      <div className="space-y-4">
        <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
          {hasContent ? (
            <div className="relative">
              <Stage
                doc={doc}
                images={images}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onPatchLayer={patchLayer}
                onCommit={commit}
              />

              {/* Lớp bôi vùng cần xoá — chỉ hiện khi bật chế độ xoá */}
              {eraseMode && (
                <canvas
                  ref={maskRef}
                  width={doc.width}
                  height={doc.height}
                  className="absolute inset-0 h-full w-full cursor-crosshair rounded-lg"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.currentTarget.setPointerCapture(e.pointerId);
                    paintingRef.current = true;
                    lastPointRef.current = null;
                    paintTo(e);
                  }}
                  onPointerMove={(e) => {
                    if (paintingRef.current) paintTo(e);
                  }}
                  onPointerUp={() => {
                    paintingRef.current = false;
                    lastPointRef.current = null;
                  }}
                  onPointerLeave={() => {
                    paintingRef.current = false;
                    lastPointRef.current = null;
                  }}
                />
              )}
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-lg border-2 border-dashed border-line-strong text-center"
              style={{ aspectRatio: `${doc.width} / ${doc.height}` }}
            >
              <div className="px-6">
                <div className="mb-3 text-4xl">🖼️</div>
                <p className="font-medium text-ink-900">Bắt đầu bằng một ảnh nền</p>
                <p className="mt-1 text-sm text-ink-500">
                  Chọn ảnh ở cột trái, rồi thêm logo và chữ lên trên.
                </p>
              </div>
            </div>
          )}
        </div>

        {(busy || error) && (
          <div
            className={`rounded-card border px-4 py-3 text-sm font-medium ${
              error
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-brand-300 bg-brand-50 text-brand-800"
            }`}
          >
            {error ?? busy}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-soft">
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
          <span className="text-xs text-ink-400">
            Xuất ở đúng {doc.width}×{doc.height}px
          </span>
        </div>
      </div>

      {/* ================= CỘT PHẢI ================= */}
      <div className="space-y-4">
        <Panel title={`Lớp (${doc.layers.length})`}>
          {doc.layers.length === 0 ? (
            <p className="text-xs text-ink-400">Chưa có lớp nào.</p>
          ) : (
            <ul className="space-y-1.5">
              {[...doc.layers].reverse().map((layer) => (
                <li key={layer.id}>
                  <div
                    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition ${
                      layer.id === selectedId
                        ? "border-brand-400 bg-brand-50"
                        : "border-line hover:bg-brand-50"
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
                      className="min-w-0 flex-1 truncate text-left text-xs text-ink-700"
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
          <ul className="space-y-1.5 text-xs leading-relaxed text-ink-500">
            <li>Kéo để di chuyển, chấm xanh góc để phóng, chấm vàng để xoay.</li>
            <li>Giữ <kbd className="rounded bg-brand-100 px-1">Shift</kbd> khi kéo để tắt hút vào giữa.</li>
            <li>Phím mũi tên để nhích từng chút, Delete để xoá lớp.</li>
            <li><kbd className="rounded bg-brand-100 px-1">Ctrl</kbd>+<kbd className="rounded bg-brand-100 px-1">Z</kbd> để hoàn tác.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ================================================================ phụ trợ */

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-soft">
      <h3 className="mb-3 text-sm font-bold text-ink-900">{title}</h3>
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
    <label className="flex-1 text-xs text-ink-500">
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
    <label className="block text-xs text-ink-500">
      <span className="mb-1 flex items-center justify-between">
        {label}
        <span className="text-ink-400">{format ? format(value) : value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-500"
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
      <label className="block text-xs text-ink-500">
        Tên lớp
        <input
          className={`${input} mt-1`}
          value={layer.name}
          onChange={(e) => onPatch({ name: e.target.value })}
        />
      </label>

      {layer.kind === "text" && (
        <>
          <label className="block text-xs text-ink-500">
            Nội dung
            <textarea
              className={`${input} mt-1 min-h-[80px] resize-y`}
              value={layer.text}
              onChange={(e) => onPatch({ text: e.target.value } as Partial<Layer>)}
            />
          </label>

          <label className="block text-xs text-ink-500">
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
            <label className="flex-1 text-xs text-ink-500">
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
            <label className="flex-1 text-xs text-ink-500">
              Màu chữ
              <input
                type="color"
                className="mt-1 h-[38px] w-full cursor-pointer rounded-lg border border-line bg-transparent"
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
                    ? "border-brand-400 bg-brand-100 text-brand-800"
                    : "border-line text-ink-700 hover:bg-brand-50"
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
            <label className="flex items-center justify-between text-xs text-ink-500">
              Màu viền
              <input
                type="color"
                value={layer.strokeColor}
                onChange={(e) => onPatch({ strokeColor: e.target.value } as Partial<Layer>)}
                className="h-8 w-14 cursor-pointer rounded border border-line bg-transparent"
              />
            </label>
          )}
          <label className="flex cursor-pointer items-center justify-between text-xs text-ink-700">
            Đổ bóng cho dễ đọc
            <input
              type="checkbox"
              checked={layer.shadow}
              onChange={(e) => onPatch({ shadow: e.target.checked } as Partial<Layer>)}
              className="h-4 w-4 accent-brand-500"
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
