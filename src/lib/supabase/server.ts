import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { CookieToSet } from "./cookie-types";

/**
 * Supabase client cho Server Component / Route Handler.
 * Next 15+ : cookies() là async nên hàm này phải await.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Được gọi từ Server Component — middleware đã lo việc refresh session.
        }
      },
    },
  });
}
