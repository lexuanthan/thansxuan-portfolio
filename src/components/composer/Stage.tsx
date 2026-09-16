"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  angleFromPointer,
  clamp,
  normalizeAngle,
  snapAngle,
  snapToCenter,
  toRelative,
  type Point,
  type Rect,
} from "@/lib/composer/geometry";
import { measureTextBlock, renderDocument, type ImageMap } from "@/lib/composer/render";
import type { ComposerDoc, Layer } from "@/lib/composer/types";

/** Giới hạn độ phân giải bản xem trước cho đỡ nặng máy. */
const PREVIEW_MAX_SIDE = 2000;

type Drag =
  | { mode: "move"; id: string; grabX: number; grabY: number }
  | {
      mode: "scale";
      id: string;
      startValue: number;
      startFontSize: number;
      startPointer: Point;
      center: Point;
    }
  | { mode: "rotate"; id: string; startAngle: number; startRotation: number }
  | null;

export default function Stage({
  doc,
  images,
  selectedId,
  onSelect,
  onPatchLayer,
  onCommit,
}: {
  doc: ComposerDoc;
  images: ImageMap;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPatchLayer: (id: string, patch: Partial<Layer>) => void;
  onCommit: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const measureRef = useRef<CanvasRenderingContext2D | null>(null);
  const dragRef = useRef<Drag>(null);

  const [guides, setGuides] = useState<{ v: boolean; h: boolean }>({ v: false, h: false });

  // Canvas ẩn chỉ dùng để đo chữ.
  if (measureRef.current === null && typeof document !== "undefined") {
    measureRef.current = document.createElement("canvas").getContext("2d");
  }

  // Vẽ lại bản xem trước mỗi khi tài liệu hoặc ảnh đổi.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scale = Math.min(1, PREVIEW_MAX_SIDE / Math.max(doc.width, doc.height));
    canvas.width = Math.round(doc.width * scale);
    canvas.height = Math.round(doc.height * scale);

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    renderDocument(ctx, doc, images);
  }, [doc, images]);

  const getRect = useCallback((): Rect => {
    const el = wrapRef.current;
    if (!el) return { left: 0, top: 0, width: 1, height: 1 };
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }, []);

  // Kéo / phóng / xoay: gắn listener lên window để chuột ra ngoài khung vẫn theo.
  useEffect(() => {
    function onMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;

      const rect = getRect();
      const p = toRelative(e.clientX, e.clientY, rect);
      const layer = doc.layers.find((l) => l.id === drag.id);
      if (!layer) return;

      if (drag.mode === "move") {
        let x = p.x - drag.grabX;
        let y = p.y - drag.grabY;
        let vGuide = false;
        let hGuide = false;

        if (!e.shiftKey) {
          const sx = snapToCenter(x);
          const sy = snapToCenter(y);
          x = sx.value;
          y = sy.value;
          vGuide = sx.snapped;
          hGuide = sy.snapped;
        }
        setGuides({ v: vGuide, h: hGuide });
        onPatchLayer(drag.id, { x: clamp(x, -0.5, 1.5), y: clamp(y, -0.5, 1.5) });
        return;
      }

      if (drag.mode === "scale") {
        const startDist = Math.hypot(
          (drag.startPointer.x - drag.center.x) * rect.width,
          (drag.startPointer.y - drag.center.y) * rect.height
        );
        const dist = Math.hypot(
          (p.x - drag.center.x) * rect.width,
          (p.y - drag.center.y) * rect.height
        );
        const ratio = startDist < 1 ? 1 : dist / startDist;

        if (layer.kind === "image") {
          onPatchLayer(drag.id, {
            width: clamp(drag.startValue * ratio, 0.02, 4),
          } as Partial<Layer>);
        } else {
          onPatchLayer(drag.id, {
            maxWidth: clamp(drag.startValue * ratio, 0.05, 2),
            fontSize: clamp(drag.startFontSize * ratio, 0.005, 0.5),
          } as Partial<Layer>);
        }
        return;
      }

      if (drag.mode === "rotate") {
        const center = { x: layer.x, y: layer.y };
        const angle = angleFromPointer(center, p, rect);
        const next = drag.startRotation + (angle - drag.startAngle);
        onPatchLayer(drag.id, {
          rotation: e.shiftKey ? normalizeAngle(next) : snapAngle(next),
        });
      }
    }

    function onUp() {
      if (dragRef.current) {
        dragRef.current = null;
        setGuides({ v: false, h: false });
        onCommit();
      }
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [doc.layers, getRect, onPatchLayer, onCommit]);

  function startMove(e: React.PointerEvent, layer: Layer) {
    if (layer.locked) return;
    e.stopPropagation();
    onSelect(layer.id);
    const rect = getRect();
    const p = toRelative(e.clientX, e.clientY, rect);
    dragRef.current = {
      mode: "move",
      id: layer.id,
      grabX: p.x - layer.x,
      grabY: p.y - layer.y,
    };
  }

  function startScale(e: React.PointerEvent, layer: Layer) {
    e.stopPropagation();
    const rect = getRect();
    dragRef.current = {
      mode: "scale",
      id: layer.id,
      startValue: layer.kind === "image" ? layer.width : layer.maxWidth,
      startFontSize: layer.kind === "text" ? layer.fontSize : 0,
      startPointer: toRelative(e.clientX, e.clientY, rect),
      center: { x: layer.x, y: layer.y },
    };
  }

  function startRotate(e: React.PointerEvent, layer: Layer) {
    e.stopPropagation();
    const rect = getRect();
    const p = toRelative(e.clientX, e.clientY, rect);
    dragRef.current = {
      mode: "rotate",
      id: layer.id,
      startAngle: angleFromPointer({ x: layer.x, y: layer.y }, p, rect),
      startRotation: layer.rotation,
    };
  }

  /** Khung bao của layer, tính theo phần trăm khung canvas. */
  function boxOf(layer: Layer): { w: number; h: number } {
    if (layer.kind === "image") {
      const wPx = layer.width * doc.width;
      const hPx = wPx / (layer.aspect > 0 ? layer.aspect : 1);
      return { w: (wPx / doc.width) * 100, h: (hPx / doc.height) * 100 };
    }
    const ctx = measureRef.current;
    if (!ctx) return { w: layer.maxWidth * 100, h: 10 };
    const m = measureTextBlock(ctx, layer, doc.width);
    return { w: (m.width / doc.width) * 100, h: (m.height / doc.height) * 100 };
  }

  return (
    <div
      className="relative mx-auto w-full max-w-full select-none"
      style={{ aspectRatio: `${doc.width} / ${doc.height}` }}
      ref={wrapRef}
      onPointerDown={() => onSelect(null)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full rounded-lg border border-line shadow-lift"
        style={{ backgroundColor: doc.backgroundColor }}
      />

      {/* Đường gióng khi hút vào giữa */}
      {guides.v && (
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-cyan-400" />
      )}
      {guides.h && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-cyan-400" />
      )}

      {/* Vùng bắt chuột — trong suốt, nằm đúng vị trí nét vẽ trên canvas */}
      {doc.layers.map((layer) => {
        if (!layer.visible) return null;
        const box = boxOf(layer);
        const selected = layer.id === selectedId;

        return (
          <div
            key={layer.id}
            onPointerDown={(e) => startMove(e, layer)}
            className={`absolute ${layer.locked ? "cursor-not-allowed" : "cursor-move"}`}
            style={{
              left: `${layer.x * 100}%`,
              top: `${layer.y * 100}%`,
              width: `${box.w}%`,
              height: `${box.h}%`,
              transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
            }}
          >
            {selected && (
              <>
                <div className="pointer-events-none absolute inset-0 border-2 border-cyan-400" />

                <button
                  type="button"
                  aria-label="Phóng to thu nhỏ"
                  onPointerDown={(e) => startScale(e, layer)}
                  className="absolute -bottom-2 -right-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-cyan-400 shadow"
                />
                <button
                  type="button"
                  aria-label="Xoay"
                  onPointerDown={(e) => startRotate(e, layer)}
                  className="absolute -top-7 left-1/2 h-4 w-4 -translate-x-1/2 cursor-grab rounded-full border-2 border-white bg-amber-400 shadow"
                />
                <div className="pointer-events-none absolute -top-5 left-1/2 h-5 w-px -translate-x-1/2 bg-cyan-400" />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
