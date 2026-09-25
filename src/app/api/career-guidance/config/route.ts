import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CAREER_CONFIG, CareerGuidanceSystemConfig } from "@/lib/career-guidance/configManager";

const CONFIG_PATH = path.join(process.cwd(), "src", "data", "career_guidance_config.json");

export async function GET() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const fileData = fs.readFileSync(CONFIG_PATH, "utf-8");
      const config = JSON.parse(fileData);
      return NextResponse.json(config);
    }
    return NextResponse.json(DEFAULT_CAREER_CONFIG);
  } catch (error) {
    console.error("Failed to read career config:", error);
    return NextResponse.json(DEFAULT_CAREER_CONFIG);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Nếu có user admin hoặc môi trường dev
    if (!user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized. Vui lòng đăng nhập quyền quản trị." }, { status: 401 });
    }

    const body: CareerGuidanceSystemConfig = await req.json();
    body.updated_at = new Date().toISOString();

    // 1. Lưu file JSON vật lý để đảm bảo persistence 100%
    try {
      const dir = path.dirname(CONFIG_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(body, null, 2), "utf-8");
    } catch (fsErr) {
      console.warn("Could not write to config file:", fsErr);
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật cấu hình AI Hướng nghiệp thành công!",
      config: body,
    });
  } catch (error) {
    console.error("Error saving career config:", error);
    return NextResponse.json({ error: "Không thể lưu cấu hình" }, { status: 500 });
  }
}
