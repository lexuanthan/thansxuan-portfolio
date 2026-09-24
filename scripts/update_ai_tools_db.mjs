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

async function updateDb() {
  console.log("🛠️ Đang cập nhật AI Tools & Projects trong Supabase...");

  // 1. Cập nhật hoặc thêm Brand Voice Studio vào bảng ai_tools
  const { data: existingTool } = await supabase
    .from("ai_tools")
    .select("id, title, link_url")
    .or("link_url.eq./ai-tools/brand-strategy,title.ilike.%brand%")
    .limit(1)
    .maybeSingle();

  const toolPayload = {
    title: "Brand Voice & Strategy Studio",
    description: "Bộ công cụ định vị 12 hình mẫu Carl Jung, ma trận quy tắc tông giọng phát ngôn và xuất System Prompt chuẩn cho ChatGPT, Claude & Gemini.",
    icon: "🎯",
    color: "from-purple-100 to-indigo-100",
    status: "Sẵn sàng",
    status_color: "green",
    link_url: "/ai-tools/brand-strategy",
    published: true,
    sort_order: 1,
  };

  if (existingTool) {
    console.log(`  Updating existing tool: ${existingTool.id}`);
    await supabase.from("ai_tools").update(toolPayload).eq("id", existingTool.id);
  } else {
    console.log("  Inserting new tool in ai_tools...");
    await supabase.from("ai_tools").insert(toolPayload);
  }

  // 2. Cập nhật hoặc thêm vào projects
  const { data: existingProject } = await supabase
    .from("projects")
    .select("id, slug")
    .or("slug.eq.brand-strategy-analyzer,link_url.eq./ai-tools/brand-strategy")
    .limit(1)
    .maybeSingle();

  const projectPayload = {
    title: "Brand Voice & Strategy Studio",
    slug: "brand-strategy-analyzer",
    description: "Ứng dụng web tương tác phân tích 12 hình mẫu thương hiệu Carl Jung, thiết lập ma trận tông giọng và tạo AI System Prompt tự hành.",
    tags: ["Branding", "AI System Prompt", "Archetypes", "Strategy"],
    color: "from-purple-100 to-indigo-100",
    link_url: "/ai-tools/brand-strategy",
    featured: true,
    published: true,
    sort_order: 1,
  };

  if (existingProject) {
    console.log(`  Updating existing project: ${existingProject.slug}`);
    await supabase.from("projects").update(projectPayload).eq("id", existingProject.id);
  } else {
    console.log("  Inserting project in projects...");
    await supabase.from("projects").insert(projectPayload);
  }

  console.log("✅ Cập nhật cơ sở dữ liệu thành công!");
}

updateDb().catch(console.error);
