import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Client chỉ-đọc, không gắn cookie/session — dùng cho các trang public.
 * Nhờ vậy trang public vẫn được render tĩnh + ISR thay vì dynamic.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured) return null;
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
