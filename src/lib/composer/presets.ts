export type SizePreset = {
  id: string;
  label: string;
  group: string;
  width: number;
  height: number;
};

export const SIZE_PRESETS: SizePreset[] = [
  { id: "fb-post", label: "Facebook post", group: "Facebook", width: 1200, height: 630 },
  { id: "fb-square", label: "Facebook vuông", group: "Facebook", width: 1080, height: 1080 },
  { id: "fb-story", label: "Facebook / IG story", group: "Story", width: 1080, height: 1920 },
  { id: "ig-post", label: "Instagram vuông", group: "Instagram", width: 1080, height: 1080 },
  { id: "ig-portrait", label: "Instagram dọc 4:5", group: "Instagram", width: 1080, height: 1350 },
  { id: "yt-thumb", label: "YouTube thumbnail", group: "YouTube", width: 1280, height: 720 },
  { id: "li-post", label: "LinkedIn post", group: "LinkedIn", width: 1200, height: 627 },
  { id: "banner-web", label: "Banner web 16:9", group: "Khác", width: 1920, height: 1080 },
  { id: "a4-poster", label: "Poster A4 (150dpi)", group: "Khác", width: 1240, height: 1754 },
];

export const DEFAULT_PRESET = SIZE_PRESETS[0];

/** Giới hạn cạnh dài nhất khi người dùng tự nhập kích thước. */
export const MAX_CANVAS_SIDE = 4096;
export const MIN_CANVAS_SIDE = 200;
