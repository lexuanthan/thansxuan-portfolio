import { createPublicClient } from "@/lib/supabase/public";
import {
  FALLBACK_ABOUT,
  FALLBACK_AI_TOOLS,
  FALLBACK_PROJECTS,
  FALLBACK_SETTINGS,
} from "@/lib/fallback";
import type { AboutPage, AiTool, Project, Settings } from "@/lib/types";

/**
 * Data cho các trang public.
 * Mọi hàm đều có fallback: nếu Supabase chưa cấu hình, bảng chưa tạo,
 * hoặc mạng lỗi thì website vẫn render bình thường thay vì vỡ trang.
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

    if (error || !data || data.length === 0) return FALLBACK_PROJECTS;
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

    if (error || !data || data.length === 0) return FALLBACK_AI_TOOLS;
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
