/**
 * Chuẩn hoá dữ liệu gửi sang Cloudflare Workers AI.
 * Tách riêng khỏi route để kiểm thử được mà không cần gọi mạng.
 */

/** Giới hạn của model FLUX.1 schnell. */
export const MAX_PROMPT_LENGTH = 2048;
export const MIN_STEPS = 1;
export const MAX_STEPS = 8;
export const DEFAULT_STEPS = 4;

/** Đơn giá Neuron của Cloudflare cho flux-1-schnell. */
export const NEURONS_PER_TILE = 4.8;
export const NEURONS_PER_STEP = 9.6;
/** Ảnh 1024×1024 = 4 ô 512×512. */
export const TILES_PER_IMAGE = 4;
/** Hạn mức miễn phí mỗi ngày, reset 0h UTC. */
export const FREE_NEURONS_PER_DAY = 10000;

export function normalizePrompt(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_PROMPT_LENGTH);
}

export function normalizeSteps(raw: unknown): number {
  // Number(null), Number(""), Number([]), Number(false) đều ra 0 — nếu để lọt
  // vào clamp thì 0 bị kẹp thành 1 bước, ảnh sinh ra mờ mà không ai báo lỗi.
  // Chỉ số thật hoặc chuỗi số mới được coi là giá trị người dùng nhập.
  let n: number;
  if (typeof raw === "number") {
    n = raw;
  } else if (typeof raw === "string" && raw.trim() !== "") {
    n = Number(raw);
  } else {
    return DEFAULT_STEPS;
  }

  if (!Number.isFinite(n)) return DEFAULT_STEPS;
  return Math.min(MAX_STEPS, Math.max(MIN_STEPS, Math.round(n)));
}

/** Ước lượng số Neuron tiêu tốn cho một ảnh. */
export function estimateNeurons(steps: number, tiles = TILES_PER_IMAGE): number {
  const s = normalizeSteps(steps);
  return tiles * NEURONS_PER_TILE + s * NEURONS_PER_STEP;
}

/** Ước lượng còn sinh được bao nhiêu ảnh trong hạn mức miễn phí mỗi ngày. */
export function estimateFreeImagesPerDay(steps: number): number {
  return Math.floor(FREE_NEURONS_PER_DAY / estimateNeurons(steps));
}
