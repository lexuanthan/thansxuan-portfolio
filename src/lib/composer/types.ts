/**
 * Mô hình dữ liệu của trình ghép ảnh.
 *
 * Toạ độ và kích thước đều lưu dưới dạng TỈ LỆ (0..1) so với khung canvas,
 * nhờ vậy đổi preset kích thước thì bố cục vẫn giữ nguyên tương quan.
 */

export type LayerBase = {
  id: string;
  name: string;
  /** Tâm layer theo chiều ngang, 0..1 so với chiều rộng canvas. */
  x: number;
  /** Tâm layer theo chiều dọc, 0..1 so với chiều cao canvas. */
  y: number;
  /** Góc xoay, tính bằng độ. */
  rotation: number;
  /** Độ mờ 0..1. */
  opacity: number;
  visible: boolean;
  locked: boolean;
};

export type ImageLayer = LayerBase & {
  kind: "image";
  src: string;
  /** Chiều rộng layer theo tỉ lệ chiều rộng canvas. */
  width: number;
  /** Tỉ lệ khung hình gốc của ảnh (rộng / cao) — dùng để suy ra chiều cao. */
  aspect: number;
};

export type TextAlign = "left" | "center" | "right";

export type TextLayer = LayerBase & {
  kind: "text";
  text: string;
  /** Cỡ chữ theo tỉ lệ chiều rộng canvas. */
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  align: TextAlign;
  lineHeight: number;
  /** Bề rộng tối đa của khối chữ, theo tỉ lệ chiều rộng canvas. */
  maxWidth: number;
  letterSpacing: number;
  /** Viền chữ — giúp chữ nổi trên nền ảnh rối. */
  strokeWidth: number;
  strokeColor: string;
  /** Đổ bóng nhẹ cho dễ đọc. */
  shadow: boolean;
};

export type Layer = ImageLayer | TextLayer;

export type BackgroundFit = "cover" | "contain";

export type Background = {
  src: string;
  aspect: number;
  fit: BackgroundFit;
  /** Hệ số phóng to thêm so với mức vừa khung. 1 = vừa khít. */
  zoom: number;
  /** Dịch chuyển theo tỉ lệ chiều rộng / chiều cao canvas. */
  offsetX: number;
  offsetY: number;
};

export type ComposerDoc = {
  width: number;
  height: number;
  backgroundColor: string;
  background: Background | null;
  layers: Layer[];
};

export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "Inter (mặc định)", value: "Inter, system-ui, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Tahoma", value: "Tahoma, Verdana, sans-serif" },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
];

export const WEIGHT_OPTIONS = [300, 400, 500, 600, 700, 800, 900];
