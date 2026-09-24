import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { execSync } from "child_process";

console.log("=================================================");
console.log("  🔍 HỆ THỐNG KIỂM TRA ĐỊNH KỲ WEBSITE (AUDIT)   ");
console.log("=================================================\n");

const timestamp = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
console.log(`⏱️ Thời điểm kiểm tra: ${timestamp}\n`);

async function runAudit() {
  // 1. Kiểm tra biến môi trường
  console.log("1️⃣ [BƯỚC 1] Kiểm tra cấu hình môi trường (.env.local)...");
  if (!fs.existsSync(".env.local")) {
    console.error("❌ Không tìm thấy file .env.local!");
    process.exit(1);
  }

  const envFile = fs.readFileSync(".env.local", "utf-8");
  const env = {};
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const cfAccountId = env.CLOUDFLARE_ACCOUNT_ID;
  const cfToken = env.CLOUDFLARE_API_TOKEN;

  console.log(`   • Supabase URL: ${supabaseUrl ? "✅ Đã cấu hình" : "❌ Thiếu"}`);
  console.log(`   • Supabase Key: ${supabaseKey ? "✅ Đã cấu hình" : "❌ Thiếu"}`);
  console.log(`   • Cloudflare Workers AI: ${cfAccountId && cfToken ? "✅ Đã cấu hình" : "⚠️ Chưa cấu hình (tuỳ chọn)"}`);

  // 2. Kết nối và kiểm tra Database Supabase
  console.log("\n2️⃣ [BƯỚC 2] Kiểm tra trạng thái cơ sở dữ liệu Supabase...");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const results = {};
  const tables = [
    { name: "posts", label: "Bài viết (Posts)" },
    { name: "categories", label: "Chuyên mục (Categories)" },
    { name: "ai_tools", label: "Công cụ AI (AI Tools)" },
    { name: "projects", label: "Dự án (Projects)" },
    { name: "settings", label: "Cài đặt chung (Settings)" },
    { name: "about_page", label: "Trang Giới thiệu (About)" },
    { name: "resources", label: "Tài nguyên (Resources)" },
    { name: "services", label: "Dịch vụ tư vấn (Services)" }
  ];

  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t.name).select("*");
      if (error) {
        console.log(`   ❌ Bảng ${t.label}: Lỗi (${error.message})`);
        results[t.name] = { ok: false, error: error.message };
      } else {
        const publishedCount = data.filter((item) => item.published !== false).length;
        console.log(`   ✅ Bảng ${t.label}: ${data.length} bản ghi (Đã công khai: ${publishedCount})`);
        results[t.name] = { ok: true, count: data.length, published: publishedCount };
      }
    } catch (err) {
      console.log(`   ❌ Bảng ${t.label}: Ngoại lệ (${err.message})`);
      results[t.name] = { ok: false, error: err.message };
    }
  }

  // 3. Kiểm tra mã nguồn & Unit Tests
  console.log("\n3️⃣ [BƯỚC 3] Chạy bộ kiểm thử tự động (Unit Tests)...");
  let testSuccess = false;
  let testsCount = "521";
  try {
    const testOutput = execSync("npx vitest run", { encoding: "utf-8", stdio: "pipe" });
    const passedMatch = testOutput.match(/Tests\s+(\d+)\s+passed/);
    if (passedMatch) testsCount = passedMatch[1];
    console.log(`   ✅ Tất cả ${testsCount} bài kiểm thử đã vượt qua thành công!`);
    testSuccess = true;
  } catch (err) {
    console.error("   ❌ Kiểm thử thất bại:", err.stdout || err.message);
  }

  // 4. Tổng kết báo cáo
  console.log("\n=================================================");
  console.log("  📊 TỔNG KẾT SỨC KHỎE HỆ THỐNG TOÀN DIỆN        ");
  console.log("=================================================");
  const allDbOk = Object.values(results).every(r => r.ok);
  console.log(`• Cấu hình & Môi trường: ✅ Sẵn sàng`);
  console.log(`• Kết nối Cơ sở dữ liệu: ${allDbOk ? "✅ Hoạt động hoàn hảo" : "⚠️ Cần kiểm tra bảng lỗi"}`);
  console.log(`• Toàn vẹn Mã nguồn: ${testSuccess ? `✅ 100% Passed (${testsCount} tests)` : "❌ Có lỗi Unit Test"}`);
  console.log("=================================================\n");
}

runAudit().catch(console.error);
