import React from "react";
import { UserType } from "@/lib/career-guidance/types";

interface LandingViewProps {
  onStartAssessment: () => void;
  onExploreDemo: () => void;
  onOpenCoach: () => void;
  onSelectUserType: (type: UserType) => void;
  currentUserType: UserType;
}

export function LandingView({
  onStartAssessment,
  onExploreDemo,
  onOpenCoach,
  onSelectUserType,
  currentUserType
}: LandingViewProps) {
  const userTypes: { type: UserType; label: string; desc: string; icon: string }[] = [
    {
      type: "high_school",
      label: "Học sinh THPT",
      desc: "Chọn ngành, so sánh trường đại học, tính khả năng xét tuyển và lộ trình lớp 12.",
      icon: "🎒"
    },
    {
      type: "university_student",
      label: "Sinh viên Đại học",
      desc: "Đánh giá mức độ hợp ngành hiện tại, xác định ngách chuyên môn và tìm kỹ năng còn thiếu.",
      icon: "🎓"
    },
    {
      type: "graduate",
      label: "Sắp / Vừa tốt nghiệp",
      desc: "Chuyển hóa bằng cấp thành cơ hội nghề nghiệp, tìm vị trí Fresher và xây CV ấn tượng.",
      icon: "💼"
    },
    {
      type: "career_changer",
      label: "Người chuyển nghề",
      desc: "Đánh giá kỹ năng có thể tái sử dụng (transferable), tìm nghề lân cận và lập lộ trình học lại.",
      icon: "🔄"
    }
  ];

  const coreQuestions = [
    { q: "Tôi là ai?", a: "Phân tích Career DNA độc bản qua 14 năng lực và 7 phong cách tư duy." },
    { q: "Tôi có điểm mạnh gì?", a: "Đo lường năng lực định lượng, tư duy phản biện và khả năng thích ứng." },
    { q: "Tôi phù hợp ngành nào?", a: "So khớp tất định với 60+ ngành đào tạo và 80+ nghề nghiệp thực tế." },
    { q: "Tôi nên chọn trường nào?", a: "Tính toán khả năng xét tuyển (Safe / Target / Reach) từ điểm chuẩn thực tế." },
    { q: "Tôi đang thiếu kỹ năng gì?", a: "Phân tích Skill Gap chi tiết và đề xuất 3 thử nghiệm nghề nghiệp vi mô." },
    { q: "Tôi cần làm gì tiếp theo?", a: "Lộ trình hành động 5 chặng (7 ngày, 30 ngày, 3 tháng, 6 tháng, 1 năm)." }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-brand-50/60 via-surface to-surface p-6 sm:p-12 text-center shadow-soft">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">
            <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
            AI Career Decision Intelligence Platform v3.0
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 sm:text-5xl sm:leading-tight">
            Nền tảng Trí tuệ Hướng nghiệp & Ra Quyết định Nghề nghiệp
          </h1>

          <p className="text-base text-ink-600 sm:text-lg leading-relaxed">
            Không phải bài trắc nghiệm tính cách thông thường. Đây là hệ thống hỗ trợ ra quyết định kết hợp 
            <strong className="text-ink-900 font-semibold"> dữ liệu thực tế</strong>, 
            <strong className="text-ink-900 font-semibold"> thuật toán so khớp tất định</strong> và 
            <strong className="text-ink-900 font-semibold"> Trợ lý AI Khai vấn đồng hành</strong>.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onStartAssessment}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-base font-bold text-white shadow-lift transition hover:bg-brand-700 active:scale-95"
            >
              🚀 Bắt đầu Khám phá Bản thân
            </button>
            <button
              onClick={onExploreDemo}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 py-3 text-base font-semibold text-ink-700 transition hover:bg-surface-soft hover:text-ink-900"
            >
              🔍 Xem Hồ sơ Phân tích Mẫu
            </button>
            <button
              onClick={onOpenCoach}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-5 py-3 text-base font-semibold text-brand-700 transition hover:bg-brand-100"
            >
              💬 Trò chuyện với AI Coach
            </button>
          </div>
        </div>

        {/* 4 User Types Selector */}
        <div className="mt-12 text-left">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-ink-400">
            Hệ thống được thiết kế chuyên biệt cho 4 nhóm người dùng
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {userTypes.map((t) => {
              const active = currentUserType === t.type;
              return (
                <button
                  key={t.type}
                  onClick={() => onSelectUserType(t.type)}
                  className={`flex flex-col text-left rounded-2xl border p-4.5 transition-all ${
                    active
                      ? "border-brand-600 bg-brand-50/70 shadow-sm ring-1 ring-brand-500"
                      : "border-line bg-surface hover:border-brand-200 hover:shadow-soft"
                  }`}
                >
                  <span className="text-3xl mb-2">{t.icon}</span>
                  <h2 className="font-bold text-ink-900 text-base">{t.label}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-ink-600">{t.desc}</p>
                  <span className="mt-3 text-xs font-semibold text-brand-700">
                    {active ? "✓ Đang chọn" : "Chọn nhóm này →"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* The 9 Core Questions Answered */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-ink-900">
            6 Câu hỏi cốt lõi mà nền tảng sẽ giúp bạn trả lời
          </h2>
          <p className="text-sm text-ink-500">
            Dựa trên mô hình quy nạp: Thấu hiểu bản thân → Khớp ngành nghề → Phân tích thiếu hụt → Hành động cụ thể.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coreQuestions.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:border-brand-300"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 font-bold text-xs text-brand-700">
                  0{i + 1}
                </span>
                <h3 className="font-bold text-ink-900 text-base">{item.q}</h3>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Logic Flow */}
      <section className="rounded-2xl border border-line bg-surface-soft p-6 sm:p-8">
        <h2 className="text-lg font-bold text-ink-900 mb-4 text-center">
          Quy trình Ra Quyết định Khoa học (Decision Pipeline)
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-ink-700">
          <span className="rounded-lg bg-surface border border-line px-3 py-1.5 shadow-xs">1. Khám phá Bản thân</span>
          <span>→</span>
          <span className="rounded-lg bg-surface border border-line px-3 py-1.5 shadow-xs">2. Phân tích Hồ sơ</span>
          <span>→</span>
          <span className="rounded-lg bg-surface border border-line px-3 py-1.5 shadow-xs">3. Khớp Lĩnh vực</span>
          <span>→</span>
          <span className="rounded-lg bg-surface border border-line px-3 py-1.5 shadow-xs">4. Khớp Ngành học</span>
          <span>→</span>
          <span className="rounded-lg bg-surface border border-line px-3 py-1.5 shadow-xs">5. Khớp Nghề nghiệp</span>
          <span>→</span>
          <span className="rounded-lg bg-surface border border-line px-3 py-1.5 shadow-xs">6. Khớp Trường ĐH</span>
          <span>→</span>
          <span className="rounded-lg bg-surface border border-line px-3 py-1.5 shadow-xs">7. Phân tích Khoảng trống</span>
          <span>→</span>
          <span className="rounded-lg bg-brand-600 text-white px-3 py-1.5 shadow-xs">8. Lập Lộ trình Hành động</span>
        </div>
      </section>
    </div>
  );
}
