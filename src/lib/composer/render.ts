import { fitContain, fitCover, wrapText } from "./geometry";
import type { ComposerDoc, ImageLayer, ShapeLayer, TextLayer } from "./types";

export type ImageMap = Map<string, CanvasImageSource>;

/* ==========================================================================
   THU NHỎ ẢNH KHÔNG VỠ NÉT
   drawImage của canvas chỉ lấy mẫu 2×2 pixel. Thu một logo 1000px xuống
   146px nghĩa là bỏ qua ~98% pixel gốc → răng cưa, mất nét, chữ trong logo
   bị đứt. Cách xử lý đúng là thu nhỏ dần từng nửa một (mipmap): mỗi bước
   giảm đúng 2× nên mọi pixel đều được lấy mẫu, ảnh cuối mượt và sắc.
   Các mức thu nhỏ được cache theo từng ảnh nên kéo thả vẫn mượt.
   ========================================================================== */

const mipCache = new WeakMap<object, HTMLCanvasElement[]>();

function sourceSize(img: CanvasImageSource): { w: number; h: number } {
  const any = img as unknown as {
    naturalWidth?: number;
    naturalHeight?: number;
    width?: number;
    height?: number;
  };
  return {
    w: any.naturalWidth ?? any.width ?? 0,
    h: any.naturalHeight ?? any.height ?? 0,
  };
}

/**
 * Cần thu nhỏ mấy lần (mỗi lần một nửa) trước khi vẽ ra kích thước đích.
 * 0 nghĩa là vẽ thẳng, trình duyệt tự xử lý tốt.
 */
export function mipLevelFor(sourceWidth: number, targetWidth: number): number {
  if (!(sourceWidth > 0) || !(targetWidth > 0)) return 0;
  const ratio = sourceWidth / targetWidth;
  if (ratio < 2) return 0;
  return Math.min(8, Math.floor(Math.log2(ratio)));
}

function buildMips(img: CanvasImageSource, levels: number): HTMLCanvasElement[] {
  if (typeof document === "undefined") return [];

  const key = img as unknown as object;
  const mips = mipCache.get(key) ?? [];

  let src: CanvasImageSource = mips.length ? mips[mips.length - 1] : img;
  let w = mips.length ? mips[mips.length - 1].width : sourceSize(img).w;
  let h = mips.length ? mips[mips.length - 1].height : sourceSize(img).h;

  while (mips.length < levels && w > 1 && h > 1) {
    const nw = Math.max(1, Math.round(w / 2));
    const nh = Math.max(1, Math.round(h / 2));

    const canvas = document.createElement("canvas");
    canvas.width = nw;
    canvas.height = nh;
    const cx = canvas.getContext("2d");
    if (!cx) break;

    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = "high";
    cx.drawImage(src, 0, 0, nw, nh);

    mips.push(canvas);
    src = canvas;
    w = nw;
    h = nh;
  }

  mipCache.set(key, mips);
  return mips;
}

/** Chọn phiên bản ảnh phù hợp nhất với kích thước sắp vẽ. */
function pickSource(img: CanvasImageSource, targetWidth: number): CanvasImageSource {
  const { w } = sourceSize(img);
  const level = mipLevelFor(w, targetWidth);
  if (level < 1) return img;

  const mips = buildMips(img, level);
  return mips[level - 1] ?? img;
}

/* ========================================================================== */

/**
 * Vẽ toàn bộ tài liệu ra canvas ở đúng độ phân giải xuất file.
 * Đây là nguồn sự thật cho ảnh cuối cùng — bản xem trước cũng gọi chính
 * hàm này, nên cái nhìn thấy luôn bằng đúng cái tải về.
 */
export function renderDocument(
  ctx: CanvasRenderingContext2D,
  doc: ComposerDoc,
  images: ImageMap
): void {
  const W = doc.width;
  const H = doc.height;

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (doc.backgroundColor && doc.backgroundColor !== "transparent") {
    ctx.fillStyle = doc.backgroundColor;
    ctx.fillRect(0, 0, W, H);
  }

  drawBackground(ctx, doc, images);

  for (const layer of doc.layers) {
    if (!layer.visible || layer.opacity <= 0) continue;

    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.translate(layer.x * W, layer.y * H);
    if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);

    if (layer.kind === "image") drawImageLayer(ctx, layer, images, W);
    else if (layer.kind === "text") drawTextLayer(ctx, layer, W);
    else if (layer.kind === "shape") drawShapeLayer(ctx, layer, W, H);

    ctx.restore();
  }

  ctx.restore();
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  doc: ComposerDoc,
  images: ImageMap
): void {
  const bg = doc.background;
  if (!bg) return;

  const img = images.get(bg.src);
  if (!img) return;

  const W = doc.width;
  const H = doc.height;

  const base = bg.fit === "cover" ? fitCover(bg.aspect, W, H) : fitContain(bg.aspect, W, H);
  const zoom = bg.zoom > 0 ? bg.zoom : 1;
  const w = base.width * zoom;
  const h = base.height * zoom;

  const cx = W / 2 + bg.offsetX * W;
  const cy = H / 2 + bg.offsetY * H;

  ctx.drawImage(pickSource(img, w), cx - w / 2, cy - h / 2, w, h);
}

function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  images: ImageMap,
  canvasWidth: number
): void {
  const img = images.get(layer.src);
  if (!img) return;

  const w = layer.width * canvasWidth;
  const aspect = layer.aspect > 0 ? layer.aspect : 1;
  const h = w / aspect;
  if (w <= 0 || h <= 0) return;

  const filter = layer.filter;
  let filterStr = "";
  if (filter) {
    if (filter.grayscale) filterStr += " grayscale(100%)";
    if (filter.invert) filterStr += " invert(100%)";
    if (filter.brightness !== undefined && filter.brightness !== 1) {
      filterStr += ` brightness(${Math.round(filter.brightness * 100)}%)`;
    }
    if (filter.contrast !== undefined && filter.contrast !== 1) {
      filterStr += ` contrast(${Math.round(filter.contrast * 100)}%)`;
    }
  }

  const prevFilter = ctx.filter;
  if (filterStr.trim()) {
    ctx.filter = filterStr.trim();
  }

  // Nhuộm màu toàn bộ logo (Color Overlay / Tint)
  if (filter?.tintColor && filter.tintColor !== "transparent" && typeof document !== "undefined") {
    const off = document.createElement("canvas");
    off.width = Math.max(1, Math.round(w));
    off.height = Math.max(1, Math.round(h));
    const octx = off.getContext("2d");
    if (octx) {
      octx.drawImage(pickSource(img, w), 0, 0, off.width, off.height);
      octx.globalCompositeOperation = "source-in";
      octx.fillStyle = filter.tintColor;
      octx.fillRect(0, 0, off.width, off.height);
      ctx.drawImage(off, -w / 2, -h / 2, w, h);
      if (filterStr.trim()) ctx.filter = prevFilter || "none";
      return;
    }
  }

  ctx.drawImage(pickSource(img, w), -w / 2, -h / 2, w, h);
  if (filterStr.trim()) ctx.filter = prevFilter || "none";
}

function drawTextLayer(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasWidth: number
): void {
  const fontSize = layer.fontSize * canvasWidth;
  if (fontSize <= 0) return;

  ctx.font = `${layer.fontWeight} ${fontSize}px ${layer.fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = layer.align;

  // letterSpacing chỉ được một số trình duyệt hỗ trợ; không có cũng không sao.
  const spacing = layer.letterSpacing * canvasWidth;
  if (spacing) {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${spacing}px`;
  }

  const maxWidth = Math.max(1, layer.maxWidth * canvasWidth);
  const lines = wrapText(layer.text, maxWidth, (s) => ctx.measureText(s).width);
  const lineHeight = fontSize * layer.lineHeight;
  const blockHeight = lineHeight * lines.length;

  // Toạ độ x của mỗi dòng phụ thuộc cách canh lề, tính so với tâm khối chữ.
  const anchorX =
    layer.align === "left" ? -maxWidth / 2 : layer.align === "right" ? maxWidth / 2 : 0;

  if (layer.shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = fontSize * 0.18;
    ctx.shadowOffsetY = fontSize * 0.06;
  }

  lines.forEach((line, i) => {
    const y = -blockHeight / 2 + lineHeight * (i + 0.5);

    if (layer.strokeWidth > 0) {
      ctx.save();
      ctx.shadowColor = "transparent";
      ctx.lineWidth = layer.strokeWidth * fontSize;
      ctx.strokeStyle = layer.strokeColor;
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeText(line, anchorX, y);
      ctx.restore();
    }

    ctx.fillStyle = layer.color;
    ctx.fillText(line, anchorX, y);
  });

  if (layer.shadow) {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
  if (spacing) {
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "0px";
  }
}

const ICON_SVG_PATHS: Record<string, string> = {
  crown: "M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 14h14v2H5v-2z",
  shield: "M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z",
  sparkle: "M12 2c.5 4.5 4 8 8 8.5-4 .5-7.5 4-8 8.5-.5-4.5-4-8-8-8.5 4-.5 7.5-4 8-8.5z",
  flame: "M12 2c-.5 3-2 5-4 7-2.5 2.5-3 5.5-2 8.5 1.5 4.5 6 6.5 10 5 3-1 5-4 5-7.5 0-4-3-7-4-10-1 2-2 3.5-3.5 4 .5-2.5 0-5-1.5-7z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm-3.8 2.2L6 22l6-3.2L18 22l-2.2-4.8a8.9 8.9 0 0 1-7.6 0z",
  heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  gem: "M6 3h12l4 6-10 12L2 9l4-6zm1.5 2l-2.7 4h14.4l-2.7-4H7.5z",
  verified: "M12 2l2.4 2.1 3.2-.4 1.4 2.9 3 .9-.2 3.2 2.1 2.4-1.4 2.9.4 3.2-3 .9-.9 3-3.2-.2-2.1 2.4-2.4-2.1-3.2.4-1.4-2.9-3-.9.2-3.2L1.7 12l1.4-2.9-.4-3.2 3-.9.9-3 3.2.2L12 2zm-1.5 13.5l6-6-1.4-1.4-4.6 4.6-2.1-2.1-1.4 1.4 3.5 3.5z",
  ribbon: "M4 4h16v12l-4-2-4 2-4-2-4 2V4z",
};

function drawShapeLayer(
  ctx: CanvasRenderingContext2D,
  layer: ShapeLayer,
  canvasWidth: number,
  canvasHeight: number
): void {
  const w = layer.width * canvasWidth;
  const h = layer.height * canvasHeight;
  if (w <= 0 || h <= 0) return;

  if (layer.shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = Math.min(w, h) * 0.12;
    ctx.shadowOffsetY = Math.min(w, h) * 0.04;
  }

  const svgD = ICON_SVG_PATHS[layer.shapeType];
  if (svgD && typeof Path2D !== "undefined") {
    const p2d = new Path2D(svgD);
    ctx.save();
    ctx.translate(-w / 2, -h / 2);
    ctx.scale(w / 24, h / 24);
    if (layer.fillColor && layer.fillColor !== "transparent") {
      ctx.fillStyle = layer.fillColor;
      ctx.fill(p2d);
    }
    if (layer.strokeWidth > 0 && layer.strokeColor && layer.strokeColor !== "transparent") {
      ctx.lineWidth = (layer.strokeWidth * canvasWidth) / (w / 24);
      ctx.strokeStyle = layer.strokeColor;
      ctx.stroke(p2d);
    }
    ctx.restore();
    return;
  }

  ctx.beginPath();
  switch (layer.shapeType) {
    case "rect":
      ctx.rect(-w / 2, -h / 2, w, h);
      break;
    case "rounded-rect": {
      const radius = Math.min(w / 2, h / 2, (layer.cornerRadius ?? 0.12) * Math.min(w, h));
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(-w / 2, -h / 2, w, h, radius);
      } else {
        const hw = w / 2;
        const hh = h / 2;
        ctx.moveTo(-hw + radius, -hh);
        ctx.lineTo(hw - radius, -hh);
        ctx.quadraticCurveTo(hw, -hh, hw, -hh + radius);
        ctx.lineTo(hw, hh - radius);
        ctx.quadraticCurveTo(hw, hh, hw - radius, hh);
        ctx.lineTo(-hw + radius, hh);
        ctx.quadraticCurveTo(-hw, hh, -hw, hh - radius);
        ctx.lineTo(-hw, -hh + radius);
        ctx.quadraticCurveTo(-hw, -hh, -hw + radius, -hh);
        ctx.closePath();
      }
      break;
    }
    case "circle":
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    case "star": {
      const spikes = 5;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.42;
      for (let i = 0; i < spikes * 2; i += 1) {
        const rad = (i * Math.PI) / spikes - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = Math.cos(rad) * r;
        const py = Math.sin(rad) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case "badge": {
      const points = 12;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.82;
      for (let i = 0; i < points * 2; i += 1) {
        const rad = (i * Math.PI) / points - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const px = Math.cos(rad) * r;
        const py = Math.sin(rad) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case "triangle":
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(w / 2, h / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();
      break;
    case "line":
      ctx.moveTo(-w / 2, 0);
      ctx.lineTo(w / 2, 0);
      break;
  }

  if (layer.shapeType !== "line" && layer.fillColor && layer.fillColor !== "transparent") {
    ctx.fillStyle = layer.fillColor;
    ctx.fill();
  }

  if (layer.strokeWidth > 0 && layer.strokeColor && layer.strokeColor !== "transparent") {
    if (layer.shadow) {
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    }
    ctx.lineWidth = layer.strokeWidth * canvasWidth;
    ctx.strokeStyle = layer.strokeColor;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
  }

  if (layer.shadow) {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  }
}


/**
 * Tải ảnh về dạng blob rồi tạo objectURL.
 * Đi đường vòng qua fetch để canvas KHÔNG bị "tainted" — nếu vẽ thẳng ảnh
 * từ domain khác thì toBlob() sẽ ném SecurityError và không xuất file được.
 */
export async function loadImageElement(src: string): Promise<HTMLImageElement> {
  let objectUrl: string | null = null;
  let url = src;

  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src, { mode: "cors", cache: "force-cache" });
    if (!res.ok) throw new Error(`Không tải được ảnh (HTTP ${res.status})`);
    const blob = await res.blob();
    objectUrl = URL.createObjectURL(blob);
    url = objectUrl;
  }

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Không đọc được file ảnh."));
      img.src = url;
    });
  } finally {
    // Ảnh đã decode xong nên thu hồi URL tạm được ngay.
    if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
}

/**
 * Kích thước khối chữ (theo pixel canvas) — dùng để vẽ khung chọn và vùng bấm
 * khớp chính xác với chữ mà drawTextLayer sẽ vẽ ra.
 */
export function measureTextBlock(
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  canvasWidth: number
): { width: number; height: number; lines: string[] } {
  const fontSize = Math.max(1, layer.fontSize * canvasWidth);
  ctx.font = `${layer.fontWeight} ${fontSize}px ${layer.fontFamily}`;

  const maxWidth = Math.max(1, layer.maxWidth * canvasWidth);
  const lines = wrapText(layer.text, maxWidth, (s) => ctx.measureText(s).width);
  const lineHeight = fontSize * layer.lineHeight;

  return {
    width: maxWidth,
    height: Math.max(lineHeight, lineHeight * lines.length),
    lines,
  };
}
