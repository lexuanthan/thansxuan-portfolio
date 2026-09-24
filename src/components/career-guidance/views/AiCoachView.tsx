import React, { useState, useRef, useEffect } from "react";
import {
  StudentCareerProfile,
  CareerMatchResult,
  MajorMatchResult,
  PersonalRoadmap,
  ChatMessage
} from "@/lib/career-guidance/types";

interface AiCoachViewProps {
  profile: StudentCareerProfile;
  topCareers: CareerMatchResult[];
  topMajors: MajorMatchResult[];
  roadmap: PersonalRoadmap | null;
  initialQuery?: string;
}

export function AiCoachView({
  profile,
  topCareers,
  topMajors,
  roadmap,
  initialQuery
}: AiCoachViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "coach",
      text: `Chào bạn! Tôi là **AI Career Coach** — trợ lý cố vấn nghề nghiệp thông minh của bạn. 

Tôi đã đọc toàn bộ dữ liệu phân tích **Career DNA** của bạn với hình mẫu **"${profile.profile_archetype.title}"**. 

Bạn có thể hỏi tôi bất cứ điều gì:
- *"Tại sao tôi lại phù hợp với ${topCareers[0]?.career.name || "ngành này"}?"*
- *"So sánh ngành này với ngành khác"*
- *"Nếu tôi yếu Toán hoặc không biết lập trình thì có học được không?"*
- *"Tôi nên chuẩn bị những gì trong 30 ngày tới?"*

Hôm nay bạn muốn cùng tôi làm rõ điều gì trước tiên?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [inputVal, setInputVal] = useState(initialQuery || "");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    `Tại sao tôi hợp với ${topCareers[0]?.career.name || "ngành này"}?`,
    `So sánh ${topCareers[0]?.career.name || "ngành 1"} và ${topCareers[1]?.career.name || "ngành 2"}`,
    "Tôi không giỏi Toán thì có nên theo đuổi Data không?",
    "Tôi nên chuẩn bị gì trong năm tới?",
    "Nghề này trong 5 năm tới có bị AI thay thế không?"
  ];

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/career-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          context: {
            profile,
            topCareers,
            topMajors,
            targetRoadmap: roadmap
          },
          history: messages.slice(-4)
        })
      });

      if (!res.ok) {
        throw new Error("Lỗi khi kết nối với máy chủ AI");
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: "coach",
        text: data.reply || "Xin lỗi, tôi chưa nhận được câu trả lời. Bạn vui lòng thử lại nhé.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: "coach",
        text: "Có lỗi khi kết nối với máy chủ AI. Bạn hãy thử lại câu hỏi nhé.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[750px] max-h-[82vh] rounded-3xl border border-line bg-surface shadow-lift overflow-hidden">
      {/* Coach Context Header */}
      <div className="border-b border-line bg-gradient-to-r from-brand-50 to-indigo-50/50 p-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-xl text-white shadow-xs">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-ink-900 text-sm sm:text-base">
                AI Career Coach
              </h2>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700">Đang trực tuyến</span>
            </div>
            <p className="text-[11px] text-ink-500">
              Đồng hành cùng: <strong className="text-ink-800">{profile.profile_archetype.title}</strong>
            </p>
          </div>
        </div>

        <div className="hidden sm:block text-right text-xs">
          <span className="text-ink-400 block text-[10px]">Ưu tiên hàng đầu:</span>
          <span className="font-extrabold text-brand-700">
            {topCareers[0]?.career.name} ({topCareers[0]?.score}%)
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface-soft/30">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold text-xs mt-1">
                  AI
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? "bg-brand-600 text-white rounded-tr-xs"
                    : "bg-surface border border-line text-ink-800 rounded-tl-xs"
                }`}
              >
                <div className="whitespace-pre-line prose prose-sm max-w-none">
                  {m.text}
                </div>
                <span
                  className={`block text-[10px] mt-2 text-right ${
                    isUser ? "text-white/70" : "text-ink-400"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-ink-500 italic p-2">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping" />
            AI Career Coach đang suy nghĩ và đối chiếu với hồ sơ của bạn...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="border-t border-line bg-surface p-2 sm:px-4 overflow-x-auto flex gap-1.5 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="shrink-0 rounded-full border border-line bg-surface-soft px-3 py-1 text-[11px] font-medium text-ink-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition"
          >
            💬 {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputVal);
        }}
        className="border-t border-line bg-surface p-3 sm:p-4 flex gap-2"
      >
        <input
          type="text"
          placeholder="Nhập câu hỏi bạn băn khoăn về ngành nghề, trường học, nỗi sợ..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 rounded-xl border border-line bg-surface p-3 text-xs sm:text-sm text-ink-900 focus:border-brand-500 focus:outline-hidden"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputVal.trim()}
          className="rounded-xl bg-brand-600 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-brand-700 transition shadow-lift disabled:opacity-50"
        >
          Gửi →
        </button>
      </form>
    </div>
  );
}
