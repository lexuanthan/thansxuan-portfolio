import { fitContain, fitCover, wrapText } from "./geometry";
import type { ComposerDoc, ImageLayer, TextLayer } from "./types";

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

  ctx.fillStyle = doc.backgroundColor || "#ffffff";
  ctx.fillRect(0, 0, W, H);

  drawBackground(ctx, doc, images);

  for (const layer of doc.layers) {
    if (!layer.visible || layer.opacity <= 0) continue;

    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.translate(layer.x * W, layer.y * H);
    if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);

    if (layer.kind === "image") drawImageLayer(ctx, layer, images, W);
    else drawTextLayer(ctx, layer, W);

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

  ctx.drawImage(pickSource(img, w), -w / 2, -h / 2, w, h);
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
