"use client";

import { useEffect, useRef, useState } from "react";
import type { ImageLayer } from "@/lib/composer/types";
import {
  detectBackgroundColor,
  processImageBackgroundRemoval,
  type RemoveBgOptions,
  type RgbColor,
} from "@/lib/composer/removeBg";

function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16) || 0,
    parseInt(clean.slice(2, 4), 16) || 0,
    parseInt(clean.slice(4, 6), 16) || 0,
  ];
}

function rgbToHex([r, g, b]: RgbColor): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}

export default function RemoveBgModal({
  layer,
  imageElement,
  onApply,
  onClose,
}: {
  layer: ImageLayer;
  imageElement: HTMLImageElement | undefined;
  onApply: (dataUrl: string, asNewLayer: boolean) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"contiguous" | "global">("contiguous");
  const [colorPreset, setColorPreset] = useState<"auto" | "white" | "black" | "custom">("auto");
  const [customHex, setCustomHex] = useState("#ffffff");
  const [tolerance, setTolerance] = useState(25);
  const [feather, setFeather] = useState(15);
  const [defringe, setDefringe] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Cập nhật bản xem trước mỗi khi thay đổi thiết lập
  useEffect(() => {
    if (!imageElement) return;

    let cancelled = false;
    setIsProcessing(true);

    const timer = setTimeout(() => {
      try {
        let targetColor: RgbColor | undefined;
        if (colorPreset === "white") targetColor = [255, 255, 255];
        else if (colorPreset === "black") targetColor = [0, 0, 0];
        else if (colorPreset === "custom") targetColor = hexToRgb(customHex);

        const options: RemoveBgOptions = {
          targetColor,
          tolerance,
          mode,
          feather,
          defringe,
        };

        const resultUrl = processImageBackgroundRemoval(imageElement, options);
        if (!cancelled) {
          setPreviewUrl(resultUrl);
        }
      } catch (err) {
        console.error("Lỗi xem trước khử nền:", err);
      } finally {
        if (!cancelled) setIsProcessing(false);
      }
    }, 80);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [imageElement, mode, colorPreset, customHex, tolerance, feather, defringe]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
              <span className="text-xl">🪄</span> Khử nền thông minh cho ảnh AI / Logo
            </h2>
            <p className="text-xs text-ink-500">
              Xóa nền màu của ảnh thiết kế từ ChatGPT/AI thành lớp trong suốt sắc nét
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-surface-soft hover:text-ink-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 overflow-y-auto p-6 md:grid-cols-12">
          {/* Xem trước bên trái (7 cols) */}
          <div className="flex flex-col items-center justify-center md:col-span-7">
            <div className="relative flex aspect-square w-full max-w-[400px] items-center justify-center overflow-hidden rounded-xl border border-line-strong bg-neutral-100 shadow-inner">
              {/* Nền bàn cờ caro đại diện cho độ trong suốt */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                }}
              />

              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Xem trước tách nền"
                  className="relative max-h-full max-w-full object-contain p-2"
                />
              ) : (
                <span className="relative text-xs text-ink-400">Đang chuẩn bị xem trước…</span>
              )}

              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                  <span className="rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 shadow">
                    Đang xử lý…
                  </span>
                </div>
              )}
            </div>

            <p className="mt-2 text-center text-[11px] text-ink-400">
              Vùng bàn cờ xám là phần trong suốt (không còn nền che khuất thiết kế).
            </p>
          </div>

          {/* Bảng điều khiển bên phải (5 cols) */}
          <div className="space-y-4 md:col-span-5">
            {/* Chế độ khử nền */}
            <div>
              <label className="text-xs font-bold text-ink-800">Chế độ khử nền</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("contiguous")}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    mode === "contiguous"
                      ? "border-brand-500 bg-brand-50 text-brand-800 font-semibold"
                      : "border-line text-ink-700 hover:bg-surface-soft"
                  }`}
                >
                  🛡 Lan từ viền
                </button>
                <button
                  type="button"
                  onClick={() => setMode("global")}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    mode === "global"
                      ? "border-brand-500 bg-brand-50 text-brand-800 font-semibold"
                      : "border-line text-ink-700 hover:bg-surface-soft"
                  }`}
                >
                  ⚡ Toàn bộ ảnh
                </button>
              </div>
              <p className="mt-1 text-[11px] text-ink-400">
                {mode === "contiguous"
                  ? "Khuyên dùng cho logo: Bảo vệ các chi tiết cùng màu nền nằm bên trong logo."
                  : "Xóa màu nền ở mọi vị trí trên ảnh (kể cả bên trong họa tiết)."}
              </p>
            </div>

            {/* Màu nền cần xóa */}
            <div>
              <label className="text-xs font-bold text-ink-800">Màu nền cần xóa</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setColorPreset("auto")}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                    colorPreset === "auto"
                      ? "border-brand-500 bg-brand-50 font-semibold text-brand-800"
                      : "border-line text-ink-600 hover:bg-surface-soft"
                  }`}
                >
                  Tự động đoán
                </button>
                <button
                  type="button"
                  onClick={() => setColorPreset("white")}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition ${
                    colorPreset === "white"
                      ? "border-brand-500 bg-brand-50 font-semibold text-brand-800"
                      : "border-line text-ink-600 hover:bg-surface-soft"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full border border-line bg-white shadow-sm" />
                  Nền trắng
                </button>
                <button
                  type="button"
                  onClick={() => setColorPreset("black")}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition ${
                    colorPreset === "black"
                      ? "border-brand-500 bg-brand-50 font-semibold text-brand-800"
                      : "border-line text-ink-600 hover:bg-surface-soft"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full border border-line bg-black" />
                  Nền đen
                </button>
                <button
                  type="button"
                  onClick={() => setColorPreset("custom")}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition ${
                    colorPreset === "custom"
                      ? "border-brand-500 bg-brand-50 font-semibold text-brand-800"
                      : "border-line text-ink-600 hover:bg-surface-soft"
                  }`}
                >
                  Tự chọn màu
                </button>
              </div>

              {colorPreset === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded border border-line bg-transparent"
                  />
                  <span className="text-xs font-mono text-ink-600">{customHex}</span>
                </div>
              )}
            </div>

            {/* Độ nhạy / dung sai màu */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink-800">Độ nhạy (Dung sai)</span>
                <span className="font-mono text-ink-500">{tolerance}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={80}
                step={1}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="mt-1 w-full accent-brand-500"
              />
              <span className="text-[10px] text-ink-400">
                Tăng nếu còn sót vệt nền; giảm nếu mép logo bị lẹm.
              </span>
            </div>

            {/* Làm mịn viền */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink-800">Làm mịn viền (Feather)</span>
                <span className="font-mono text-ink-500">{feather}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={feather}
                onChange={(e) => setFeather(Number(e.target.value))}
                className="mt-1 w-full accent-brand-500"
              />
            </div>

            {/* Khử viền lem màu nền */}
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-line p-2 text-xs text-ink-700 hover:bg-surface-soft">
              <div>
                <span className="block font-semibold">Khử lem màu viền (Defringe)</span>
                <span className="text-[10px] text-ink-400">Làm sạch ánh viền trắng/đen bám mép</span>
              </div>
              <input
                type="checkbox"
                checked={defringe}
                onChange={(e) => setDefringe(e.target.checked)}
                className="h-4 w-4 accent-brand-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line bg-surface-soft px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-ink-600 transition hover:bg-surface"
          >
            Đóng
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!previewUrl}
              onClick={() => {
                if (previewUrl) {
                  onApply(previewUrl, true);
                  onClose();
                }
              }}
              className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-ink-700 transition hover:bg-surface disabled:opacity-50"
            >
              + Tạo lớp mới
            </button>
            <button
              type="button"
              disabled={!previewUrl}
              onClick={() => {
                if (previewUrl) {
                  onApply(previewUrl, false);
                  onClose();
                }
              }}
              className="rounded-xl bg-brand-400 px-5 py-2 text-xs font-bold text-ink-900 shadow-brand transition hover:bg-brand-300 disabled:opacity-50"
            >
              ✓ Áp dụng tách nền
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
