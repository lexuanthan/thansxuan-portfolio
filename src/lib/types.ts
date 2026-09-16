export type Project = {
  id: string;
  title: string;
  slug: string | null;
  description: string | null;
  content: string | null;
  image_url: string | null;
  tags: string[];
  color: string;
  link_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AiTool = {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  status: string;
  status_color: string;
  link_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Chuyên mục dùng chung cho bài viết và tài nguyên. */
export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_url: string | null;
  category_id: string | null;
  /** Tên chuyên mục kèm theo khi join, để khỏi phải truy vấn lần hai. */
  category_name: string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Tài nguyên chia sẻ: liên kết, tệp mẫu, bộ sưu tập… */
export type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  kind: string;
  icon: string;
  tags: string[];
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Một hạng mục tư vấn / hỗ trợ. */
export type Service = {
  id: string;
  title: string;
  description: string | null;
  bullets: string[];
  icon: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Lời nhắn gửi từ form liên hệ. */
export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  content: string;
  handled: boolean;
  created_at: string;
};

export type SkillGroup = { category: string; items: string[] };
export type JourneyItem = { year: string; title: string; desc: string };
export type CoreValue = { icon: string; title: string; desc: string };

export type AboutPage = {
  id: number;
  heading: string | null;
  bio: string | null;
  skills: SkillGroup[];
  journey: JourneyItem[];
  core_values: CoreValue[];
  updated_at: string;
};

export type SocialLinks = {
  twitter?: string;
  linkedin?: string;
  github?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
};

export type Settings = {
  id: number;
  site_title: string | null;
  site_description: string | null;
  brand_name: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  /** Câu tâm đắc hiện ở thẻ "Về tôi" ngoài trang chủ. */
  quote: string | null;
  /** Ảnh bìa lớn ở đầu trang chủ. Bỏ trống thì dùng khối trang trí vẽ sẵn. */
  hero_image_url: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  footer_text: string | null;
  social: SocialLinks;
  updated_at: string;
};

export type MediaItem = {
  id: string;
  name: string;
  path: string;
  url: string;
  size: number;
  mime_type: string;
  is_logo: boolean;
  created_at: string;
};

export type PageView = {
  id: number;
  path: string;
  referrer: string | null;
  created_at: string;
};

/** Các preset gradient dùng cho card project / tool. */
export const COLOR_PRESETS: { label: string; value: string }[] = [
  { label: "Xanh dương", value: "from-blue-100 to-cyan-100" },
  { label: "Tím hồng", value: "from-purple-100 to-pink-100" },
  { label: "Cam đỏ", value: "from-orange-100 to-red-100" },
  { label: "Xanh lá", value: "from-green-100 to-emerald-100" },
  { label: "Vàng hổ phách", value: "from-yellow-100 to-amber-100" },
  { label: "Chàm", value: "from-indigo-100 to-blue-100" },
  { label: "Xám trung tính", value: "from-gray-100 to-slate-100" },
  { label: "Hồng đào", value: "from-rose-100 to-orange-100" },
];

export const STATUS_COLORS: { label: string; value: string; className: string }[] = [
  { label: "Vàng", value: "yellow", className: "bg-yellow-100 border-yellow-400 text-yellow-800" },
  { label: "Xanh lá", value: "green", className: "bg-green-100 border-green-400 text-green-800" },
  { label: "Xanh dương", value: "blue", className: "bg-blue-100 border-blue-400 text-blue-800" },
  { label: "Tím", value: "purple", className: "bg-purple-100 border-purple-400 text-purple-800" },
  { label: "Đỏ", value: "red", className: "bg-red-100 border-red-400 text-red-800" },
  { label: "Xám", value: "gray", className: "bg-gray-100 border-gray-400 text-gray-800" },
];

export function statusClassName(value: string): string {
  return (
    STATUS_COLORS.find((s) => s.value === value)?.className ??
    "bg-gray-100 border-gray-400 text-gray-800"
  );
}
