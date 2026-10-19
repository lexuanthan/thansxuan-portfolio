import type { AiTool, Project, Settings } from "@/lib/types";

export type HeroMode = "3d" | "image" | "portrait";
export type MotionPreset = "static" | "light" | "standard";
export type HomeSectionId =
  | "featured"
  | "utility_banner"
  | "perspective"
  | "posts"
  | "connect";

export type HomeSectionConfig = {
  id: HomeSectionId;
  label: string;
  enabled: boolean;
  order: number;
};

export type HomeConfigCore = {
  eyebrow: string;
  headline_line1: string;
  headline_line2: string;
  lead: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_secondary_label: string;
  cta_secondary_href: string;
  hero_mode: HeroMode;
  motion_preset: MotionPreset;
  featured_ids: string[];
  utility_banner_title: string;
  utility_banner_subtitle: string;
  utility_banner_cta_label: string;
  perspective_line1: string;
  perspective_line2: string;
  perspective_text: string;
  connect_title: string;
  connect_subtitle: string;
  connect_cta_label: string;
  sections: HomeSectionConfig[];
};

export type HomeConfig = HomeConfigCore & {
  draft?: Partial<HomeConfigCore> | null;
  updated_version?: number;
};

export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  { id: "featured", label: "Dự án & tiện ích nổi bật", enabled: true, order: 1 },
  { id: "utility_banner", label: "Dải mở kho tiện ích", enabled: true, order: 2 },
  { id: "perspective", label: "Về tôi / Góc nhìn", enabled: true, order: 3 },
  { id: "posts", label: "Bài viết nổi bật", enabled: true, order: 4 },
  { id: "connect", label: "Lời mời kết nối", enabled: true, order: 5 },
];

export const DEFAULT_HOME_CONFIG: HomeConfig = {
  eyebrow: "TRUYỀN THÔNG / SÁNG TẠO / CÔNG NGHỆ",
  headline_line1: "Tư duy sáng tạo.",
  headline_line2: "Kiến tạo giá trị.",
  lead: "Tôi là Lê Xuân Thân. Kết nối ý tưởng và công nghệ để tạo ra những điều hữu ích.",
  cta_primary_label: "Khám phá dự án",
  cta_primary_href: "/du-an",
  cta_secondary_label: "Về tôi",
  cta_secondary_href: "/gioi-thieu",
  hero_mode: "3d",
  motion_preset: "standard",
  featured_ids: ["career-guidance-v3", "logo-composer", "training-quiz"],
  utility_banner_title: "Công cụ nhỏ. Giá trị thiết thực.",
  utility_banner_subtitle: "Hướng nghiệp, thiết kế và học tập.",
  utility_banner_cta_label: "Mở kho tiện ích",
  perspective_line1: "Luôn học hỏi.",
  perspective_line2: "Luôn kiến tạo.",
  perspective_text:
    "Tôi tin rằng công nghệ và sự sáng tạo có thể giúp giải quyết những vấn đề thực tế, theo cách đơn giản và gần gũi hơn.",
  connect_title: "Cùng tạo nên điều hữu ích.",
  connect_subtitle: "Kết nối và chia sẻ ý tưởng. Tôi luôn sẵn sàng lắng nghe.",
  connect_cta_label: "Kết nối với tôi",
  sections: DEFAULT_HOME_SECTIONS,
  draft: null,
  updated_version: 1,
};

/**
 * Đọc cấu hình trang chủ từ bản ghi Settings.
 * Hỗ trợ đọc cả cột `home_config` (nếu đã chạy migration v4) lẫn trường ẩn
 * `social._home_config` để tương thích 100% với database hiện hữu mà không lỗi.
 */
export function resolveHomeConfig(
  settings: Settings,
  options?: { useDraft?: boolean }
): HomeConfig {
  const rawFromCol = (settings as Record<string, unknown>).home_config;
  const rawFromSocial = (settings.social as Record<string, unknown> | undefined)?.[
    "_home_config"
  ];
  const raw =
    rawFromCol && typeof rawFromCol === "object"
      ? (rawFromCol as Partial<HomeConfig>)
      : rawFromSocial && typeof rawFromSocial === "object"
        ? (rawFromSocial as Partial<HomeConfig>)
        : {};

  const mergedSections = Array.isArray(raw.sections) && raw.sections.length > 0
    ? DEFAULT_HOME_SECTIONS.map((def) => {
        const found = raw.sections?.find((s) => s.id === def.id);
        return found ? { ...def, ...found } : def;
      }).sort((a, b) => a.order - b.order)
    : DEFAULT_HOME_SECTIONS;

  const base: HomeConfig = {
    ...DEFAULT_HOME_CONFIG,
    ...raw,
    featured_ids:
      Array.isArray(raw.featured_ids) && raw.featured_ids.length > 0
        ? raw.featured_ids
        : DEFAULT_HOME_CONFIG.featured_ids,
    sections: mergedSections,
  };

  if (options?.useDraft && base.draft && typeof base.draft === "object") {
    return {
      ...base,
      ...base.draft,
      featured_ids:
        Array.isArray(base.draft.featured_ids) && base.draft.featured_ids.length > 0
          ? base.draft.featured_ids
          : base.featured_ids,
      sections:
        Array.isArray(base.draft.sections) && base.draft.sections.length > 0
          ? [...base.draft.sections].sort((a, b) => a.order - b.order)
          : base.sections,
    };
  }

  return base;
}

export type ResolvedFeaturedCard = {
  id: string;
  sourceType: "tool" | "project";
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  href: string;
  image_url: string | null;
  status: string | null;
  visualPreset: "career" | "canvas" | "quiz" | "edupath" | "brand" | "university" | "default";
};

function detectVisualPreset(
  id: string,
  href: string | null
): ResolvedFeaturedCard["visualPreset"] {
  const key = `${id} ${href ?? ""}`.toLowerCase();
  if (key.includes("career-guidance")) return "career";
  if (key.includes("logo-composer") || key.includes("canvas")) return "canvas";
  if (key.includes("training-quiz") || key.includes("quiz")) return "quiz";
  if (key.includes("edupath")) return "edupath";
  if (key.includes("brand-strategy")) return "brand";
  if (key.includes("tra-cuu-dai-hoc") || key.includes("university")) return "university";
  return "default";
}

const SHORT_SHOWCASE_META: Record<
  string,
  { shortTitle: string; shortDescription: string }
> = {
  "career-guidance-v3": {
    shortTitle: "AI Hướng nghiệp",
    shortDescription: "Khám phá thế mạnh, định hướng tương lai.",
  },
  "logo-composer": {
    shortTitle: "Canvas Studio",
    shortDescription: "Biến ý tưởng thành hình ảnh.",
  },
  "training-quiz": {
    shortTitle: "Game Tập huấn",
    shortDescription: "Học hỏi qua trải nghiệm tương tác.",
  },
  "browser-logo-composer": {
    shortTitle: "Canvas Studio",
    shortDescription: "Biến ý tưởng thành hình ảnh.",
  },
  "edupath-2026": {
    shortTitle: "EduPath 2026",
    shortDescription: "Bản đồ định hướng đại học 9 chặng.",
  },
  "edupath-platform": {
    shortTitle: "EduPath 2026",
    shortDescription: "Bản đồ định hướng đại học 9 chặng.",
  },
  "brand-strategy-studio": {
    shortTitle: "Brand Studio",
    shortDescription: "Định vị hình mẫu & giọng điệu thương hiệu.",
  },
  "brand-strategy-analyzer": {
    shortTitle: "Brand Studio",
    shortDescription: "Định vị hình mẫu & giọng điệu thương hiệu.",
  },
  "tra-cuu-dai-hoc-hub": {
    shortTitle: "Tra cứu Đại học",
    shortDescription: "Điểm chuẩn, học phí & ngành đào tạo.",
  },
};

/**
 * Giải quyết danh sách thẻ nổi bật trên Trang chủ từ ID tham chiếu tới bản ghi gốc
 * (`ai_tools` và `projects`). Chỉ lấy các bản ghi đang `published === true`.
 * Khi đổi tên/mô tả/link của bản ghi gốc trong Admin, thẻ ngoài Trang chủ tự cập nhật.
 */
export function resolveFeaturedShowcase(
  tools: AiTool[],
  projects: Project[],
  featuredIds: string[]
): ResolvedFeaturedCard[] {
  const publishedTools = tools.filter((t) => t.published !== false);
  const publishedProjects = projects.filter((p) => p.published !== false);

  const byId = new Map<string, ResolvedFeaturedCard>();

  for (const t of publishedTools) {
    const presetMeta = SHORT_SHOWCASE_META[t.id];
    const isDefaultTitle =
      (t.id === "career-guidance-v3" &&
        t.title === "Trợ lý AI Hướng nghiệp & Ra Quyết định") ||
      (t.id === "logo-composer" && t.title === "Ghép Logo & Chữ lên ảnh") ||
      (t.id === "training-quiz" &&
        t.title === "Live Training Quiz Game (Đoàn - Hội)");

    byId.set(t.id, {
      id: t.id,
      sourceType: "tool",
      title: t.title,
      shortTitle: isDefaultTitle && presetMeta ? presetMeta.shortTitle : t.title,
      description: t.description ?? "",
      shortDescription:
        presetMeta?.shortDescription &&
        (!t.description || t.description.length > 65)
          ? presetMeta.shortDescription
          : t.description ?? "Công cụ hữu ích phục vụ công việc và học tập.",
      href: t.link_url || "/ai-tools",
      image_url: null,
      status: t.status,
      visualPreset: detectVisualPreset(t.id, t.link_url),
    });
  }

  for (const p of publishedProjects) {
    const key = p.slug || p.id;
    const presetMeta = SHORT_SHOWCASE_META[key] || SHORT_SHOWCASE_META[p.id];
    const resolvedHref =
      p.link_url === "/#tra-cuu-dai-hoc"
        ? "/ai-tools/tra-cuu-dai-hoc"
        : p.link_url || "/du-an";

    const card: ResolvedFeaturedCard = {
      id: p.id,
      sourceType: "project",
      title: p.title,
      shortTitle: presetMeta?.shortTitle || p.title,
      description: p.description ?? "",
      shortDescription:
        presetMeta?.shortDescription &&
        (!p.description || p.description.length > 65)
          ? presetMeta.shortDescription
          : p.description ?? "Dự án ứng dụng công nghệ và sáng tạo.",
      href: resolvedHref,
      image_url: p.image_url,
      status: null,
      visualPreset: detectVisualPreset(key, resolvedHref),
    };

    if (!byId.has(p.id)) byId.set(p.id, card);
    if (p.slug && !byId.has(p.slug)) byId.set(p.slug, card);
  }

  const picked: ResolvedFeaturedCard[] = [];
  const seen = new Set<string>();

  for (const rawId of featuredIds) {
    const item = byId.get(rawId);
    if (item && !seen.has(item.id)) {
      picked.push(item);
      seen.add(item.id);
    }
  }

  // Nếu các ID được chọn bị ẩn/chưa đủ 3 thẻ, lấy bổ sung từ bản ghi đã xuất bản
  if (picked.length < 3) {
    for (const candidate of byId.values()) {
      if (picked.length >= 3) break;
      if (!seen.has(candidate.id) && candidate.href) {
        picked.push(candidate);
        seen.add(candidate.id);
      }
    }
  }

  return picked.slice(0, 3);
}
