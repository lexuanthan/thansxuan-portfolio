import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";

const LEADS_PATH = path.join(process.cwd(), "src", "data", "career_leads.json");

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Đọc từ local file backup
    let localLeads: any[] = [];
    if (fs.existsSync(LEADS_PATH)) {
      try {
        localLeads = JSON.parse(fs.readFileSync(LEADS_PATH, "utf-8"));
      } catch (e) {
        console.error(e);
      }
    }

    // Đọc từ bảng messages trong Supabase
    let dbLeads: any[] = [];
    try {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .ilike("subject", "%[AI Hướng Nghiệp]%")
        .order("created_at", { ascending: false });
      if (data) dbLeads = data;
    } catch (e) {
      console.warn("Could not fetch messages from DB:", e);
    }

    return NextResponse.json({
      localLeads,
      dbLeads,
    });
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      grade,
      archetype,
      topCareers,
      notes,
    } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp họ tên và số điện thoại để liên hệ." },
        { status: 400 }
      );
    }

    const leadRecord = {
      id: "lead_" + Date.now(),
      fullName,
      email: email || "",
      phone,
      grade: grade || "Học sinh / Sinh viên",
      archetype: archetype || "Chưa xác định",
      topCareers: topCareers || [],
      notes: notes || "",
      createdAt: new Date().toISOString(),
      handled: false,
    };

    // 1. Lưu vào file local leads
    try {
      let leads = [];
      if (fs.existsSync(LEADS_PATH)) {
        leads = JSON.parse(fs.readFileSync(LEADS_PATH, "utf-8"));
      }
      leads.unshift(leadRecord);
      fs.writeFileSync(LEADS_PATH, JSON.stringify(leads.slice(0, 200), null, 2), "utf-8");
    } catch (err) {
      console.warn("Could not save to local leads file:", err);
    }

    // 2. Lưu vào Supabase messages
    try {
      const supabase = await createClient();
      const content = `[ĐĂNG KÝ TƯ VẤN HƯỚNG NGHIỆP 1-1]
Học sinh: ${fullName}
SĐT/Zalo: ${phone}
Email: ${email || "Không cung cấp"}
Trình độ/Lớp: ${grade}
Hình mẫu Career DNA: ${archetype}
Top ngành/nghề quan tâm: ${Array.isArray(topCareers) ? topCareers.join(", ") : topCareers}
Ghi chú nguyện vọng: ${notes || "Không có"}`;

      await supabase.from("messages").insert({
        name: fullName,
        email: email || "student@career.local",
        subject: `[AI Hướng Nghiệp] ${fullName} đăng ký tư vấn (${archetype})`,
        content,
        handled: false,
      });
    } catch (dbErr) {
      console.warn("Could not insert lead into Supabase messages:", dbErr);
    }

    return NextResponse.json({
      success: true,
      message: "Đã gửi thông tin đăng ký tư vấn thành công! Chuyên gia sẽ liên hệ qua Zalo/Điện thoại sớm nhất.",
      leadId: leadRecord.id,
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json(
      { error: "Có lỗi khi gửi thông tin. Vui lòng thử lại hoặc liên hệ trực tiếp hotline." },
      { status: 500 }
    );
  }
}
