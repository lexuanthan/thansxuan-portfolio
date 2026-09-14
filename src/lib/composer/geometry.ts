/**
 * Toán hình học cho thao tác kéo / phóng / xoay.
 * Tách riêng khỏi React để kiểm thử được — đây là chỗ dễ sai nhất.
 */

export type Rect = { left: number; top: number; width: number; height: number };
export type Point = { x: number; y: number };

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/** Đổi toạ độ chuột trên màn hình sang toạ độ tỉ lệ 0..1 trong khung canvas. */
export function toRelative(clientX: number, clientY: number, rect: Rect): Point {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  return {
    x: (clientX - rect.left) / rect.width,
    y: (clientY - rect.top) / rect.height,
  };
}

/**
 * Kích thước khi phóng: đo khoảng cách từ tâm layer tới con trỏ, so với
 * khoảng cách lúc bắt đầu kéo, rồi nhân vào chiều rộng ban đầu.
 * Khung canvas thường không vuông nên phải quy về pixel trước khi đo.
 */
export function scaleFromPointer(args: {
  center: Point;
  pointer: Point;
  startPointer: Point;
  startWidth: number;
  rect: Rect;
  minWidth?: number;
  maxWidth?: number;
}): number {
  const { center, pointer, startPointer, startWidth, rect } = args;
  const min = args.minWidth ?? 0.02;
  const max = args.maxWidth ?? 4;

  const startDist = Math.hypot(
    (startPointer.x - center.x) * rect.width,
    (startPointer.y - center.y) * rect.height
  );
  if (startDist < 1) return startWidth;

  const dist = Math.hypot(
    (pointer.x - center.x) * rect.width,
    (pointer.y - center.y) * rect.height
  );

  return clamp((startWidth * dist) / startDist, min, max);
}

/** Góc (độ) từ tâm layer tới con trỏ. 0° là hướng lên trên. */
export function angleFromPointer(center: Point, pointer: Point, rect: Rect): number {
  const dx = (pointer.x - center.x) * rect.width;
  const dy = (pointer.y - center.y) * rect.height;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  return normalizeAngle(deg);
}

export function normalizeAngle(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** Làm tròn về bội số gần nhất khi ở trong ngưỡng — dùng cho snap góc xoay. */
export function snapAngle(deg: number, step = 15, threshold = 5): number {
  const nearest = Math.round(deg / step) * step;
  return Math.abs(normalizeAngle(deg) - normalizeAngle(nearest)) <= threshold
    ? normalizeAngle(nearest)
    : normalizeAngle(deg);
}

/** Hút về đường giữa canvas khi kéo gần tới. */
export function snapToCenter(
  value: number,
  threshold = 0.012
): { value: number; snapped: boolean } {
  return Math.abs(value - 0.5) <= threshold
    ? { value: 0.5, snapped: true }
    : { value, snapped: false };
}

/** Kích thước ảnh khi phủ kín khung (có thể tràn ra ngoài). */
export function fitCover(
  srcAspect: number,
  dstW: number,
  dstH: number
): { width: number; height: number } {
  const dstAspect = dstW / dstH;
  return srcAspect > dstAspect
    ? { width: dstH * srcAspect, height: dstH }
    : { width: dstW, height: dstW / srcAspect };
}

/** Kích thước ảnh khi nằm trọn trong khung (có thể chừa viền). */
export function fitContain(
  srcAspect: number,
  dstW: number,
  dstH: number
): { width: number; height: number } {
  const dstAspect = dstW / dstH;
  return srcAspect > dstAspect
    ? { width: dstW, height: dstW / srcAspect }
    : { width: dstH * srcAspect, height: dstH };
}

/**
 * Ngắt dòng theo bề rộng tối đa.
 * Nhận hàm đo từ bên ngoài để test được mà không cần canvas thật.
 * Tôn trọng ký tự xuống dòng người dùng gõ.
 */
export function wrapText(
  text: string,
  maxWidth: number,
  measure: (s: string) => number
): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (paragraph.trim() === "") {
      lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/).filter(Boolean);
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (measure(candidate) <= maxWidth || current === "") {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }

  return lines;
}

/** Sinh id ngắn, đủ dùng cho layer trong một phiên làm việc. */
export function createId(prefix = "l"): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}
