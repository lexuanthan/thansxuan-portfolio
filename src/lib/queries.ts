import { createPublicClient } from "@/lib/supabase/public";
import {
  FALLBACK_ABOUT,
  FALLBACK_AI_TOOLS,
  FALLBACK_PROJECTS,
  FALLBACK_SETTINGS,
} from "@/lib/fallback";
import type {
  AboutPage,
  AiTool,
  Category,
  Post,
  Project,
  Resource,
  Service,
  Settings,
} from "@/lib/types";

/**
 * Data cho các trang public.
 *
 * Quy ước về dữ liệu dự phòng: nó là lưới an toàn khi HỎNG, không phải hàng
 * thay thế khi TRỐNG. Query lỗi, bảng chưa tạo hoặc chưa cấu hình Supabase thì
 * dùng bản dự phòng để trang không vỡ. Còn khi query chạy tốt và trả về 0 dòng
 * thì đó là câu trả lời thật — trả mảng rỗng, để trang hiện lời mời thêm nội
 * dung. Nếu không, nội dung mẫu sẽ mọc lại mỗi lần anh xoá hết dữ liệu.
 *
 * Toàn bộ thân hàm — kể cả việc khởi tạo client — nằm trong try.
 */

export async function getProjects(): Promise<Project[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return FALLBACK_PROJECTS;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return FALLBACK_PROJECTS;
    return data as Project[];
  } catch {
    return FALLBACK_PROJECTS;
  }
}

export async function getAiTools(): Promise<AiTool[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return FALLBACK_AI_TOOLS;

    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return FALLBACK_AI_TOOLS;
    return data as AiTool[];
  } catch {
    return FALLBACK_AI_TOOLS;
  }
}

export async function getAbout(): Promise<AboutPage> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return FALLBACK_ABOUT;

    const { data, error } = await supabase
      .from("about_page")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return FALLBACK_ABOUT;

    const row = data as Partial<AboutPage>;
    return {
      ...FALLBACK_ABOUT,
      ...row,
      skills: Array.isArray(row.skills) ? row.skills : FALLBACK_ABOUT.skills,
      journey: Array.isArray(row.journey) ? row.journey : FALLBACK_ABOUT.journey,
      core_values: Array.isArray(row.core_values)
        ? row.core_values
        : FALLBACK_ABOUT.core_values,
    } as AboutPage;
  } catch {
    return FALLBACK_ABOUT;
  }
}

export async function getSettings(): Promise<Settings> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return FALLBACK_SETTINGS;

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return FALLBACK_SETTINGS;

    const row = data as Partial<Settings>;
    return {
      ...FALLBACK_SETTINGS,
      ...row,
      social:
        row.social && typeof row.social === "object"
          ? row.social
          : FALLBACK_SETTINGS.social,
    } as Settings;
  } catch {
    return FALLBACK_SETTINGS;
  }
}

/* =============================================================
   Bài viết & chuyên mục
   ============================================================= */

/**
 * Supabase trả chuyên mục lồng trong `categories`, và tuỳ quan hệ mà nó là
 * object hay mảng. Gỡ phẳng ngay tại đây để phần giao diện chỉ thấy một
 * trường `category_name` duy nhất.
 */
type JoinedCategory = { name?: unknown } | { name?: unknown }[] | null | undefined;

export function flattenPost(row: Record<string, unknown>): Post {
  const joined = row.categories as JoinedCategory;
  const picked = Array.isArray(joined) ? joined[0] : joined;
  const name = picked && typeof picked.name === "string" ? picked.name : null;

  const { categories: _drop, ...rest } = row;
  void _drop;

  return {
    ...(rest as unknown as Post),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    views: typeof row.views === "number" ? row.views : 0,
    category_name: name,
  };
}

const POST_SELECT = "*, categories(name)";

export async function getPosts(limit?: number): Promise<Post[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return [];

    let query = supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as Record<string, unknown>[]).map(flattenPost);
  } catch {
    return [];
  }
}

export async function getFeaturedPosts(limit = 3): Promise<Post[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("published", true)
      .eq("featured", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error || !data) return [];

    const rows = (data as Record<string, unknown>[]).map(flattenPost);
    // Chưa đánh dấu bài nào nổi bật thì lấy tạm bài mới nhất, đỡ trống khu vực.
    if (rows.length === 0) return getPosts(limit);
    return rows;
  } catch {
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("posts")
      .select(POST_SELECT)
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error || !data) return null;
    return flattenPost(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data) return [];
    return data as Category[];
  } catch {
    return [];
  }
}

/* =============================================================
   Tài nguyên & tư vấn
   ============================================================= */

export async function getResources(limit?: number): Promise<Resource[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return [];

    let query = supabase
      .from("resources")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error || !data) return [];
    return (data as Resource[]).map((r) => ({
      ...r,
      tags: Array.isArray(r.tags) ? r.tags : [],
    }));
  } catch {
    return [];
  }
}

export async function getServices(): Promise<Service[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return (data as Service[]).map((s) => ({
      ...s,
      bullets: Array.isArray(s.bullets) ? s.bullets : [],
    }));
  } catch {
    return [];
  }
}
