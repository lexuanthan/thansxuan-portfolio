"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  StudentCareerProfile,
  CareerMatchResult,
  MajorMatchResult,
  PersonalRoadmap,
  ChatMessage,
  AiCoachTrustBlock
} from "@/lib/career-guidance/types";
import { SmartNextAction } from "../common/SmartNextAction";
import {
  IconBot,
  IconUser,
  IconDna,
  IconTarget,
  IconMap,
  IconSparkles,
  IconArrowRight,
  HcmuteBrandMark,
  IconScale,
  IconHelpCircle,
  IconCalendar,
  IconCheckSquare,
  IconTrendingUp,
  IconCheckCircle,
  IconAlertCircle
} from "../common/CareerIcons";

interface AiCoachViewProps {
  profile: StudentCareerProfile;
  topCareers: CareerMatchResult[];
  topMajors: MajorMatchResult[];
  roadmap: PersonalRoadmap | null;
  initialQuery?: string;
  onNavigateView?: (view: any) => void;
}

type ContextualActionType = "explain" | "compare" | "plan" | "improve" | "evaluate";

interface ContextualActionItem {
  id: ContextualActionType;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  promptText: (targetCareer: string, secondCareer: string) => string;
}

export function AiCoachView({
  profile,
  topCareers,
  topMajors,
  roadmap,
  initialQuery,
  onNavigateView
}: AiCoachViewProps) {
  const bestCareerName = topCareers[0]?.career.name || "ngành nghề mục tiêu";
  const secondCareerName = topCareers[1]?.career.name || "lựa chọn thứ hai";
  const targetRoleName = roadmap?.target_career_name || bestCareerName;

  const CONTEXTUAL_ACTIONS: ContextualActionItem[] = [
    {
      id: "explain",
      label: "Giải thích",
      shortDesc: "Lý do hồ sơ phù hợp với ngành",
      icon: IconHelpCircle,
      promptText: (c1) => `Hãy giải thích chi tiết tại sao hồ sơ Career DNA của tôi lại phù hợp với mục tiêu ${c1}, căn cứ vào những dữ liệu nào trong bài đánh giá?`
    },
    {
      id: "compare",
      label: "So sánh",
      shortDesc: "Đối soát 2 lựa chọn hàng đầu",
      icon: IconScale,
      promptText: (c1, c2) => `Hãy so sánh khách quan giữa ${c1} và ${c2} dựa trên điểm mạnh, điểm yếu và triển vọng sự nghiệp của tôi.`
    },
    {
      id: "plan",
      label: "Lập kế hoạch",
      shortDesc: "Lộ trình 30 ngày & 12 tháng",
      icon: IconCalendar,
      promptText: (c1) => `Hãy lập cho tôi một kế hoạch hành động thực tế theo các mốc 30 ngày, 90 ngày và 12 tháng tới để chuẩn bị cho mục tiêu ${c1}.`
    },
    {
      id: "improve",
      label: "Gợi ý cải thiện",
      shortDesc: "Bù đắp khoảng trống kỹ năng (Gap)",
      icon: IconTrendingUp,
      promptText: () => `Dựa trên phân tích Gap Analysis, tôi đang có những khoảng trống năng lực nào lớn nhất và tôi nên bắt đầu cải thiện từ đâu trong tháng này?`
    },
    {
      id: "evaluate",
      label: "Đánh giá lựa chọn",
      shortDesc: "Rủi ro, áp lực & tác động của AI",
      icon: IconCheckSquare,
      promptText: (c1) => `Hãy đánh giá toàn diện các rủi ro, áp lực thực tế và tác động của AI đối với lựa chọn ${c1}. Tôi cần chuẩn bị tâm lý gì?`
    }
  ];

  const initialTrustBlock: AiCoachTrustBlock = {
    reasoning_summary: "Khởi tạo từ hồ sơ định hướng Career DNA và bảng xếp hạng tương thích nghề nghiệp mới nhất.",
    evidence: [
      `Hình mẫu nhận diện: ${profile.profile_archetype.title}`,
      `Ngành mục tiêu hàng đầu: ${targetRoleName} (Độ tương thích: ${topCareers[0]?.score || 88}%)`,
      `Các năng lực cốt lõi: ${Object.keys(profile.capabilities).slice(0, 3).join(", ")}`
    ],
    uncertainty: "Các khuyến nghị ban đầu dựa trên kết quả tự kê khai khảo sát; cần được kiểm chứng qua các thử nghiệm vi mô thực tế."
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "coach",
      text: `Chào bạn! Tôi là **HCMUTE AI Career Coach** — hệ thống cố vấn định hướng nghề nghiệp và trí tuệ quyết định sự nghiệp cá nhân.

Tôi đã đồng bộ toàn bộ dữ liệu **Career DNA** với hình mẫu **"${profile.profile_archetype.title}"** và mục tiêu hiện tại là **"${targetRoleName}"**.

**Nguyên tắc cố vấn của tôi**:
- 🔍 **Khách quan & Dựa trên dữ liệu**: Luôn đối soát với hồ sơ năng lực, điểm số và xu hướng thị trường.
- ⚖️ **Không võ đoán**: Đưa ra nhận định xác suất khoa học, không dùng kết luận áp đặt tuyệt đối.
- 🎯 **Hướng đến hành động**: Mọi giải đáp đều đi kèm bước hành động vi mô cụ thể.

Bạn có thể bấm các **nút hành động cố vấn** phía trên để giải thích, so sánh, lập kế hoạch hoặc đặt câu hỏi tự do bên dưới:`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      action_type: "general",
      trust: initialTrustBlock
    }
  ]);

  const [inputVal, setInputVal] = useState(initialQuery || "");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<ContextualActionType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    `Tại sao tôi hợp với ${bestCareerName}?`,
    `So sánh ${bestCareerName} và ${secondCareerName}`,
    "Điểm mù lớn nhất trong hồ sơ năng lực của tôi là gì?",
    "Lập kế hoạch hành động 30 ngày & 12 tháng",
    "Gợi ý dự án portfolio để thu hẹp khoảng cách kỹ năng",
    "Nghề này trong 5 năm tới có nguy cơ bị AI tự động hóa không?"
  ];

  const handleSendMessage = async (textToSend: string, actionType?: ContextualActionType) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      action_type: actionType
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);
    if (actionType) setActiveAction(actionType);

    try {
      const res = await fetch("/api/ai/career-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmed,
          action_type: actionType,
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
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        action_type: actionType,
        trust: {
          reasoning_summary: data.reasoning_summary || "Phân tích đối soát dữ liệu Career DNA và các tiêu chuẩn vị trí mục tiêu.",
          evidence: data.evidence || [
            `Mục tiêu: ${targetRoleName}`,
            `Hình mẫu: ${profile.profile_archetype.title}`,
            `Mức tương thích: ${topCareers[0]?.score || 88}%`
          ],
          uncertainty: data.uncertainty || "Định hướng dựa trên mô hình xác suất; kết quả thực tế phụ thuộc vào quá trình rèn luyện bền bỉ."
        },
        suggested_actions: data.suggested_actions
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

  const handleTriggerAction = (action: ContextualActionItem) => {
    setActiveAction(action.id);
    const prompt = action.promptText(bestCareerName, secondCareerName);
    handleSendMessage(prompt, action.id);
  };

  return (
    <div className="space-y-6">
      {/* F. AI PANEL — Visual System: HCMUTE blue (#004098), subtle red (#D9232E), light premium, minimal radius, professional */}
      <div className="rounded-[8px] border border-line bg-surface border-t-[3px] border-t-[#D9232E] p-5 sm:p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HcmuteBrandMark className="w-10 h-10 shrink-0 shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#004098] bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-[4px]">
                  HCMUTE CAREER DECISION INTELLIGENCE
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sẵn sàng cố vấn
                </span>
                <span className="hidden sm:inline-block text-[10px] text-ink-500 font-medium border-l border-line pl-2">
                  Nguyên tắc: Khách quan • Định lượng • Minh bạch
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-ink-900 mt-1 tracking-tight">
                Cố Vấn Định Hướng & Quyết Định Nghề Nghiệp
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-line bg-surface-soft px-3 py-1.5 font-bold text-ink-700 shadow-xs">
              <IconDna className="w-3.5 h-3.5 text-[#004098]" />
              <span>DNA: <strong className="text-[#004098]">{profile.profile_archetype.title}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-line bg-surface-soft px-3 py-1.5 font-bold text-ink-700 shadow-xs">
              <IconTarget className="w-3.5 h-3.5 text-[#004098]" />
              <span>Mục tiêu: <strong className="text-[#004098]">{targetRoleName}</strong></span>
            </span>
            {topCareers[0] && (
              <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-line bg-surface-soft px-3 py-1.5 font-bold text-ink-700 shadow-xs">
                <IconSparkles className="w-3.5 h-3.5 text-[#D9232E]" />
                <span>Khớp: <strong className="text-[#D9232E]">{topCareers[0].score}%</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* E. AI COACH: Contextual Actions Bar (Không chatbot đơn giản) */}
        <div className="mt-5 pt-4 border-t border-line">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-1.5">
              <IconSparkles className="w-3.5 h-3.5 text-[#004098]" />
              Hành động cố vấn theo ngữ cảnh (Contextual Actions):
            </span>
            <span className="text-[11px] text-ink-400 italic hidden sm:inline">
              Bấm để kích hoạt kịch bản phân tích chuyên sâu
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CONTEXTUAL_ACTIONS.map((action) => {
              const ActionIcon = action.icon;
              const isActive = activeAction === action.id;
              return (
                <button
                  key={action.id}
                  data-testid={`action-${action.id}`}
                  onClick={() => handleTriggerAction(action)}
                  disabled={loading}
                  className={`flex flex-col items-start p-2.5 rounded-[6px] border text-left transition-all active:scale-[0.98] disabled:opacity-50 ${
                    isActive
                      ? "border-[#004098] bg-[#004098]/5 shadow-xs"
                      : "border-line bg-surface hover:border-[#004098]/40 hover:bg-brand-50/50"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink-900 w-full mb-0.5">
                    <ActionIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#004098]" : "text-ink-600"}`} />
                    <span className={isActive ? "text-[#004098]" : ""}>{action.label}</span>
                  </div>
                  <span className="text-[10px] text-ink-500 line-clamp-1">
                    {action.shortDesc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="rounded-[8px] border border-line bg-surface p-5 sm:p-6 shadow-soft space-y-4 min-h-[460px] max-h-[620px] overflow-y-auto flex flex-col">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-xs shadow-xs ${
                  isUser
                    ? "bg-[#004098] text-white font-bold"
                    : "bg-surface-soft border border-line text-[#004098]"
                }`}
              >
                {isUser ? <IconUser className="w-4 h-4 text-white" /> : <IconBot className="w-4 h-4 text-[#004098]" />}
              </div>

              <div
                className={`rounded-[8px] px-4 py-3.5 text-xs sm:text-sm leading-relaxed shadow-soft ${
                  isUser
                    ? "bg-[#004098] text-white font-medium"
                    : "bg-surface-soft text-ink-800 border border-line"
                }`}
              >
                {/* Action Tag if applicable */}
                {!isUser && m.action_type && m.action_type !== "general" && (
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide text-[#004098] bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-[4px]">
                      <IconSparkles className="w-3 h-3 text-[#004098]" />
                      Chế độ cố vấn: {
                        m.action_type === "explain" ? "Giải thích" :
                        m.action_type === "compare" ? "So sánh" :
                        m.action_type === "plan" ? "Lập kế hoạch" :
                        m.action_type === "improve" ? "Gợi ý cải thiện" : "Đánh giá lựa chọn"
                      }
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{m.text}</div>

                {/* G. TRUST BLOCK: reasoning summary, evidence, uncertainty (Không kết luận quá mạnh) */}
                {!isUser && m.trust && (
                  <div className="mt-3 pt-3 border-t border-line/80 space-y-2 text-xs">
                    {/* Reasoning Summary */}
                    <div className="rounded-[6px] bg-brand-50/70 border border-brand-200/80 p-2.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#004098] mb-1">
                        <IconSparkles className="w-3.5 h-3.5 text-[#004098]" />
                        <span>Tóm tắt suy luận (Reasoning Summary)</span>
                      </div>
                      <p className="text-ink-700 leading-relaxed font-normal text-[11px] sm:text-xs">
                        {m.trust.reasoning_summary}
                      </p>
                    </div>

                    {/* Evidence */}
                    {m.trust.evidence && m.trust.evidence.length > 0 && (
                      <div className="rounded-[6px] bg-surface border border-line p-2.5">
                        <div className="flex items-center gap-1.5 font-bold text-ink-800 mb-1">
                          <IconCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Căn cứ dữ liệu thực chứng (Evidence)</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-ink-600 text-[11px]">
                          {m.trust.evidence.map((ev, idx) => (
                            <li key={idx}><span className="text-ink-800 font-medium">{ev}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Uncertainty */}
                    {m.trust.uncertainty && (
                      <div className="rounded-[6px] bg-amber-50/60 border border-amber-200/80 p-2.5">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                          <IconAlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Giới hạn & Điểm cần kiểm chứng (Uncertainty & Assumptions)</span>
                        </div>
                        <p className="text-amber-900/90 text-[11px] leading-relaxed">
                          {m.trust.uncertainty}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-ink-400 pt-1">
                      <span className="italic">💡 Nguyên tắc HCMUTE AI: Định hướng khách quan, không kết luận tuyệt đối hóa.</span>
                      <span className="text-[#D9232E] font-semibold">HCMUTE Career Decision Intelligence</span>
                    </div>
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-2 ${
                    isUser ? "text-brand-100" : "text-ink-400"
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-surface-soft border border-line text-[#004098]">
              <IconBot className="w-4 h-4 text-[#004098]" />
            </div>
            <div className="rounded-[6px] bg-surface-soft px-4 py-2.5 text-xs text-ink-600 border border-line flex items-center gap-2 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-[#004098] animate-ping" />
              <span>HCMUTE AI Coach đang phân tích đa chiều hồ sơ của bạn...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-ink-500 block px-1">
          Gợi ý câu hỏi đào sâu theo ngữ cảnh hiện tại:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(p)}
              disabled={loading}
              className="rounded-[6px] border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-brand-300 hover:bg-brand-50 hover:text-[#004098] transition shadow-xs active:scale-95 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(inputVal);
            }
          }}
          placeholder="Đặt câu hỏi cho AI Career Coach (VD: Lập kế hoạch 30 ngày cho ngành này?)..."
          disabled={loading}
          className="flex-1 rounded-[6px] border border-line bg-surface px-4 py-2.5 text-xs sm:text-sm text-ink-900 placeholder:text-ink-400 focus:border-[#004098] focus:outline-hidden shadow-xs disabled:opacity-60"
        />
        <button
          onClick={() => handleSendMessage(inputVal)}
          disabled={loading || !inputVal.trim()}
          className="rounded-[6px] bg-[#004098] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#00337a] transition shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>Gửi</span>
          <IconArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Smart Next Action */}
      {onNavigateView && (
        <SmartNextAction
          currentView="coach"
          onNavigate={onNavigateView}
          customTitle="Cập nhật hoặc Xuất Báo cáo Hướng nghiệp Toàn diện"
          customDesc="Bạn đã nắm được các giải đáp trọng yếu. Tiếp theo hãy xem Lộ trình chi tiết hoặc xuất hồ sơ Career Intelligence Dossier."
        />
      )}
    </div>
  );
}
