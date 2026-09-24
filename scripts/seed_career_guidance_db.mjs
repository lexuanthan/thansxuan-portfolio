import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envFile = fs.readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function seedCareerGuidance() {
  console.log("🛠️ Đang cập nhật AI Career Guidance vào Supabase...");

  // 1. Cập nhật hoặc thêm vào bảng ai_tools
  const { data: existingTool } = await supabase
    .from("ai_tools")
    .select("id, title, link_url")
    .or("link_url.eq./ai-tools/career-guidance,title.ilike.%hướng nghiệp%")
    .limit(1)
    .maybeSingle();

  const toolPayload = {
    title: "Trợ lý AI Tư vấn Hướng nghiệp",
    description: "Hệ thống ra quyết định nghề nghiệp v3.0: Trắc nghiệm Career DNA, so khớp 80+ nghề & 60+ ngành, phân tích kỹ năng, lộ trình 5 giai đoạn & AI Coach.",
    icon: "🧭",
    color: "from-blue-100 to-indigo-100",
    status: "Mới ra mắt",
    status_color: "green",
    link_url: "/ai-tools/career-guidance",
    published: true,
    sort_order: 0,
  };

  if (existingTool) {
    console.log(`  Updating existing tool: ${existingTool.id}`);
    await supabase.from("ai_tools").update(toolPayload).eq("id", existingTool.id);
  } else {
    console.log("  Inserting new tool in ai_tools...");
    await supabase.from("ai_tools").insert(toolPayload);
  }

  // 2. Cập nhật hoặc thêm vào bảng projects
  const { data: existingProject } = await supabase
    .from("projects")
    .select("id, slug")
    .or("slug.eq.ai-career-guidance,link_url.eq./ai-tools/career-guidance")
    .limit(1)
    .maybeSingle();

  const projectPayload = {
    title: "AI Career Guidance Platform v3.0",
    slug: "ai-career-guidance",
    description: "Hệ thống trợ lý AI tư vấn hướng nghiệp toàn diện cho học sinh, sinh viên và người chuyển nghề. Kết hợp trắc nghiệm Career DNA, phân tích rủi ro AI và lộ trình hành động.",
    tags: ["AI Guidance", "Career DNA", "Next.js", "Decision Intelligence"],
    color: "from-blue-100 to-indigo-100",
    link_url: "/ai-tools/career-guidance",
    featured: true,
    published: true,
    sort_order: 0,
  };

  if (existingProject) {
    console.log(`  Updating existing project: ${existingProject.slug}`);
    await supabase.from("projects").update(projectPayload).eq("id", existingProject.id);
  } else {
    console.log("  Inserting project in projects...");
    await supabase.from("projects").insert(projectPayload);
  }

  console.log("✅ Cập nhật Supabase AI Career Guidance thành công!");
}

seedCareerGuidance().catch(console.error);
