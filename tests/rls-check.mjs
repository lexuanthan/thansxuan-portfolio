/**
 * Kiểm tra bảo mật RLS trên database THẬT.
 * Chạy: npm.cmd run test:rls
 *
 * Mục đích: xác nhận rằng với anon key (thứ ai mở DevTools cũng lấy được),
 * người lạ CHỈ đọc được nội dung đã publish và KHÔNG sửa/xoá được gì.
 *
 * Script chỉ ghi đúng 1 dòng vào bảng page_views với path "/__rls-check".
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv(file) {
  const out = {};
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* không có file thì đọc từ biến môi trường */
  }
  return out;
}

const env = { ...loadEnv(".env.local"), ...process.env };
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("✗ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const anon = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let passed = 0;
let failed = 0;

function check(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

console.log(`\nKiểm tra RLS trên ${url}\n`);

console.log("Khách vãng lai ĐỌC được nội dung công khai:");
{
  const { data, error } = await anon.from("projects").select("id, title, published");
  check("đọc được bảng projects", !error && Array.isArray(data), error?.message);
  check(
    "chỉ thấy project đã publish",
    !data || data.every((r) => r.published === true),
    "có bản nháp bị lộ ra ngoài"
  );
}
{
  const { error } = await anon.from("ai_tools").select("id");
  check("đọc được bảng ai_tools", !error, error?.message);
}
{
  const { error } = await anon.from("about_page").select("id");
  check("đọc được bảng about_page", !error, error?.message);
}
{
  const { error } = await anon.from("settings").select("id");
  check("đọc được bảng settings", !error, error?.message);
}

console.log("\nKhách vãng lai KHÔNG ghi được nội dung:");
{
  const { error } = await anon
    .from("projects")
    .insert({ title: "RLS CHECK — phải bị chặn" });
  check("chặn thêm project", Boolean(error), "INSERT đã lọt qua!");
}
{
  const { error } = await anon.from("ai_tools").insert({ title: "RLS CHECK" });
  check("chặn thêm ai_tool", Boolean(error), "INSERT đã lọt qua!");
}
{
  const before = await anon.from("projects").select("id, title").limit(1);
  const target = before.data?.[0];
  if (!target) {
    check("chặn sửa project", false, "không có project nào để thử");
  } else {
    await anon.from("projects").update({ title: "BỊ HACK" }).eq("id", target.id);
    const after = await anon.from("projects").select("title").eq("id", target.id);
    check(
      "chặn sửa project",
      after.data?.[0]?.title === target.title,
      "UPDATE đã đổi được dữ liệu!"
    );
  }
}
{
  const before = await anon.from("projects").select("id");
  const countBefore = before.data?.length ?? 0;
  await anon.from("projects").delete().neq("title", "___khong_bao_gio_trung___");
  const after = await anon.from("projects").select("id");
  check(
    "chặn xoá project",
    (after.data?.length ?? 0) === countBefore,
    `còn ${after.data?.length} / ${countBefore} dòng — DELETE đã lọt qua!`
  );
}
{
  const { error } = await anon.from("settings").update({ email: "hack@evil.com" }).eq("id", 1);
  const after = await anon.from("settings").select("email").eq("id", 1);
  check(
    "chặn sửa settings",
    Boolean(error) || after.data?.[0]?.email !== "hack@evil.com",
    "UPDATE settings đã lọt qua!"
  );
}

console.log("\nThống kê lượt xem:");
{
  const { error } = await anon
    .from("page_views")
    .insert({ path: "/__rls-check", referrer: null });
  check("khách ghi được lượt xem", !error, error?.message);
}
{
  const { data, error } = await anon.from("page_views").select("id").limit(5);
  check(
    "khách KHÔNG đọc được dữ liệu lượt xem",
    Boolean(error) || (data?.length ?? 0) === 0,
    `đọc được ${data?.length} dòng — số liệu analytics bị lộ`
  );
}

console.log(`\n${passed} đạt, ${failed} không đạt\n`);
process.exit(failed > 0 ? 1 : 0);
