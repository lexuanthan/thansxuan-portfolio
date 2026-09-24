import { NextRequest, NextResponse } from "next/server";
import { buildCoachSystemPrompt, generateSmartLocalCoachResponse, CoachContext } from "@/lib/career-guidance/coachService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, context, history = [] } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const coachContext = context as CoachContext;
    if (!coachContext || !coachContext.profile) {
      return NextResponse.json({ error: "Missing user profile context" }, { status: 400 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    // Nếu có khóa Cloudflare Workers AI thì gọi LLM
    if (accountId && apiToken) {
      try {
        const systemPrompt = buildCoachSystemPrompt(coachContext);
        
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
              max_tokens: 800,
              temperature: 0.6
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
              provider: "cloudflare-workers-ai"
            });
          }
        }
      } catch (err) {
        console.warn("Cloudflare AI request failed or timed out, falling back to local coach engine:", err);
      }
    }

    // Fallback thông minh: Dùng local intelligence engine
    const localReply = generateSmartLocalCoachResponse(query, coachContext);
    return NextResponse.json({
      reply: localReply,
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
