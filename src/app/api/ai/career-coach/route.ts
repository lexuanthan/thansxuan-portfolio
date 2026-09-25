import { NextRequest, NextResponse } from "next/server";
import {
  buildCoachSystemPrompt,
  generateSmartCoachFullResponse,
  CoachContext
} from "@/lib/career-guidance/coachService";
import defaultConfig from "@/data/career_guidance_config.json";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context, history = [], action_type } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const coachContext = context as CoachContext;
    if (!coachContext || !coachContext.profile) {
      return NextResponse.json({ error: "Missing user profile context" }, { status: 400 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const coachConfig = defaultConfig.coach || {};

    // 1. Phân tích ngữ cảnh & sinh câu trả lời đối soát từ Realtime Knowledge Engine
    const localFull = generateSmartCoachFullResponse(query, coachContext, action_type);

    // Nếu người dùng hỏi câu hỏi tra cứu thực tế (điểm chuẩn, học phí, mức lương...),
    // trả về ngay dữ liệu chuẩn xác 100% đã được kiểm duyệt, tránh ảo giác LLM
    if (localFull.is_realtime_fact) {
      return NextResponse.json({
        reply: localFull.reply,
        reasoning_summary: localFull.reasoning_summary,
        evidence: localFull.evidence,
        suggested_actions: localFull.suggested_actions,
        provider: "realtime-knowledge-engine"
      });
    }

    // 2. Nếu có cấu hình Cloudflare và không ép buộc dùng offline
    if (accountId && apiToken && coachConfig.ai_provider !== "smart_local") {
      try {
        const baseSystemPrompt = buildCoachSystemPrompt(coachContext);
        const systemPrompt = coachConfig.system_prompt
          ? `${baseSystemPrompt}\n\n[ADMIN CHỈ ĐẠO BỔ SUNG]: ${coachConfig.system_prompt}\n[TÔNG GIỌNG]: ${coachConfig.coaching_tone}`
          : baseSystemPrompt;

        const messages = [
          { role: "system", content: systemPrompt },
          ...history.slice(-4).map((h: { sender: string; text: string }) => ({
            role: h.sender === "user" ? "user" : "assistant",
            content: h.text
          })),
          { role: "user", content: query }
        ];

        const cfRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiToken}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messages,
              max_tokens: 650,
              temperature: 0.5
            }),
            signal: AbortSignal.timeout(12000) // Timeout 12s
          }
        );

        if (cfRes.ok) {
          const cfData = await cfRes.json();
          const responseText = cfData?.result?.response;
          if (responseText && responseText.trim().length > 0) {
            return NextResponse.json({
              reply: responseText.trim(),
              reasoning_summary: localFull.reasoning_summary,
              evidence: localFull.evidence,
              uncertainty: localFull.uncertainty,
              suggested_actions: localFull.suggested_actions,
              provider: "cloudflare-workers-ai"
            });
          }
        }
      } catch (err) {
        console.warn("Cloudflare AI request failed or timed out, falling back to local coach engine:", err);
      }
    }

    // 3. Fallback thông minh: Dùng local intelligence engine với đầy đủ dữ liệu Trust
    return NextResponse.json({
      reply: localFull.reply,
      reasoning_summary: localFull.reasoning_summary,
      evidence: localFull.evidence,
      uncertainty: localFull.uncertainty,
      suggested_actions: localFull.suggested_actions,
      provider: "smart-local-intelligence"
    });
  } catch (error) {
    console.error("Career Coach API error:", error);
    return NextResponse.json(
      { error: "Có lỗi khi xử lý câu hỏi. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
