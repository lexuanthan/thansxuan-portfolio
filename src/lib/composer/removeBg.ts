/**
 * Thuật toán tách / khử nền thông minh cho ảnh AI & logo trên Canvas.
 *
 * Hỗ trợ:
 * 1. Tự động nhận diện màu nền từ 4 góc và viền ảnh.
 * 2. Khử nền theo màu (Color Keying) với ngưỡng dung sai (tolerance).
 * 3. Chế độ Lan truyền từ viền (Contiguous / Flood Fill): Chỉ xóa nền bên ngoài,
 *    bảo vệ các chi tiết cùng màu nằm bên trong logo (ví dụ chữ màu trắng trong logo).
 * 4. Chế độ Toàn bộ (Global): Xóa màu nền ở mọi vị trí trên ảnh.
 * 5. Làm mềm biên (Alpha Feathering) & Khử viền lem màu (Defringe / Despill)
 *    để mép vật thể sắc nét, không bị dính viền trắng/đen mờ.
 */

export type RgbColor = [number, number, number];

export type RemoveBgOptions = {
  /** Màu nền cần khử [R, G, B]. Nếu không truyền sẽ tự động đoán từ 4 góc. */
  targetColor?: RgbColor;
  /** Độ nhạy / dung sai màu (0 - 100). Mặc định 25. */
  tolerance?: number;
  /** Chế độ: 'contiguous' (lan từ viền) hoặc 'global' (toàn ảnh). Mặc định 'contiguous'. */
  mode?: "contiguous" | "global";
  /** Độ mượt biên (0 - 100). Giúp viền không bị răng cưa. Mặc định 15. */
  feather?: number;
  /** Khử viền lem màu nền ở mép đối tượng (Defringe). Mặc định true. */
  defringe?: boolean;
};

/** Khoảng cách màu Euclidean trong không gian RGB (từ 0 đến ~441.67) */
export function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** Tự động nhận diện màu nền bằng cách lấy mẫu 4 góc và viền ảnh */
export function detectBackgroundColor(
  data: Uint8ClampedArray,
  width: number,
  height: number
): RgbColor {
  if (width <= 0 || height <= 0 || data.length === 0) {
    return [255, 255, 255];
  }

  const samplePoints: [number, number][] = [];
  const stepX = Math.max(1, Math.floor(width / 16));
  const stepY = Math.max(1, Math.floor(height / 16));

  // Lấy mẫu dọc 4 cạnh ngoài cùng
  for (let x = 0; x < width; x += stepX) {
    samplePoints.push([x, 0]);
    samplePoints.push([x, height - 1]);
  }
  for (let y = 0; y < height; y += stepY) {
    samplePoints.push([0, y]);
    samplePoints.push([width - 1, y]);
  }

  // 4 góc chuẩn
  samplePoints.push([0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]);

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let count = 0;

  for (const [x, y] of samplePoints) {
    const idx = (y * width + x) * 4;
    const a = data[idx + 3];
    // Chỉ tính pixel còn hiển thị (alpha > 128)
    if (a > 128) {
      totalR += data[idx];
      totalG += data[idx + 1];
      totalB += data[idx + 2];
      count += 1;
    }
  }

  if (count === 0) return [255, 255, 255];

  return [
    Math.round(totalR / count),
    Math.round(totalG / count),
    Math.round(totalB / count),
  ];
}

/**
 * Xử lý trực tiếp trên mảng byte RGBA của ảnh.
 * Trả về mảng mới Uint8ClampedArray đã được khử nền.
 */
export function removeBackgroundBuffer(
  sourceData: Uint8ClampedArray,
  width: number,
  height: number,
  options: RemoveBgOptions = {}
): Uint8ClampedArray {
  const totalPixels = width * height;
  const out = new Uint8ClampedArray(sourceData);
  if (totalPixels === 0) return out;

  const target = options.targetColor ?? detectBackgroundColor(sourceData, width, height);
  const [tr, tg, tb] = target;

  const tol = Math.max(1, Math.min(100, options.tolerance ?? 25));
  // Khoảng cách tối đa ~442, chuyển tolerance (1..100) sang ngưỡng khoảng cách
  const maxThreshold = (tol / 100) * 380;
  const feather = Math.max(0, Math.min(100, options.feather ?? 15));
  const featherSpan = (feather / 100) * maxThreshold * 0.45;
  const minThreshold = Math.max(0, maxThreshold - featherSpan);
  const mode = options.mode ?? "contiguous";
  const defringe = options.defringe ?? true;

  if (mode === "global") {
    // Xóa màu nền trên toàn bộ bề mặt ảnh
    for (let i = 0; i < totalPixels; i += 1) {
      const idx = i * 4;
      const a = out[idx + 3];
      if (a === 0) continue;

      const r = out[idx];
      const g = out[idx + 1];
      const b = out[idx + 2];
      const dist = colorDistance(r, g, b, tr, tg, tb);

      if (dist <= minThreshold) {
        out[idx + 3] = 0;
      } else if (dist < maxThreshold) {
        const factor = (dist - minThreshold) / Math.max(0.001, maxThreshold - minThreshold);
        const newAlpha = Math.round(a * factor);
        out[idx + 3] = newAlpha;

        if (defringe && newAlpha > 0 && newAlpha < 255) {
          const fa = newAlpha / 255;
          out[idx] = Math.max(0, Math.min(255, Math.round((r - tr * (1 - fa)) / fa)));
          out[idx + 1] = Math.max(0, Math.min(255, Math.round((g - tg * (1 - fa)) / fa)));
          out[idx + 2] = Math.max(0, Math.min(255, Math.round((b - tb * (1 - fa)) / fa)));
        }
      }
    }
    return out;
  }

  // Chế độ contiguous (Flood fill bằng hàng đợi BFS từ các cạnh ngoài cùng)
  const isBgCandidate = new Uint8Array(totalPixels);
  const queue = new Int32Array(totalPixels);
  let qHead = 0;
  let qTail = 0;

  // Tính khoảng cách cho từng pixel
  const distances = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i += 1) {
    const idx = i * 4;
    distances[i] = colorDistance(out[idx], out[idx + 1], out[idx + 2], tr, tg, tb);
  }

  function enqueue(x: number, y: number) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const p = y * width + x;
    if (isBgCandidate[p] === 0 && distances[p] <= maxThreshold) {
      isBgCandidate[p] = 1;
      queue[qTail++] = p;
    }
  }

  // Bắt đầu lan truyền từ toàn bộ viền bao quanh ảnh
  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  // Thuật toán loang 4 hướng
  while (qHead < qTail) {
    const p = queue[qHead++];
    const px = p % width;
    const py = (p - px) / width;

    // 4 lân cận
    if (px > 0) enqueue(px - 1, py);
    if (px < width - 1) enqueue(px + 1, py);
    if (py > 0) enqueue(px, py - 1);
    if (py < height - 1) enqueue(px, py + 1);
  }

  // Áp dụng độ trong suốt dựa trên vùng loang được
  for (let i = 0; i < totalPixels; i += 1) {
    if (isBgCandidate[i] === 1) {
      const idx = i * 4;
      const a = out[idx + 3];
      if (a === 0) continue;

      const dist = distances[i];
      if (dist <= minThreshold) {
        out[idx + 3] = 0;
      } else {
        const factor = (dist - minThreshold) / Math.max(0.001, maxThreshold - minThreshold);
        const newAlpha = Math.round(a * factor);
        out[idx + 3] = newAlpha;

        if (defringe && newAlpha > 0 && newAlpha < 255) {
          const fa = newAlpha / 255;
          const r = out[idx];
          const g = out[idx + 1];
          const b = out[idx + 2];
          out[idx] = Math.max(0, Math.min(255, Math.round((r - tr * (1 - fa)) / fa)));
          out[idx + 1] = Math.max(0, Math.min(255, Math.round((g - tg * (1 - fa)) / fa)));
          out[idx + 2] = Math.max(0, Math.min(255, Math.round((b - tb * (1 - fa)) / fa)));
        }
      }
    }
  }

  return out;
}

/** Chuyển Canvas / Image thành ảnh mới đã khử nền dạng Data URL (PNG) */
export function processImageBackgroundRemoval(
  imgOrCanvas: HTMLImageElement | HTMLCanvasElement,
  options: RemoveBgOptions = {}
): string {
  const w = "naturalWidth" in imgOrCanvas ? imgOrCanvas.naturalWidth : imgOrCanvas.width;
  const h = "naturalHeight" in imgOrCanvas ? imgOrCanvas.naturalHeight : imgOrCanvas.height;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.drawImage(imgOrCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const processed = removeBackgroundBuffer(imgData.data, w, h, options);
  const outImgData = ctx.createImageData(w, h);
  outImgData.data.set(processed);
  ctx.putImageData(outImgData, 0, 0);

  return canvas.toDataURL("image/png");
}
