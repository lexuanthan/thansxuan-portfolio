import React from "react";
import { StudentCareerProfile } from "@/lib/career-guidance/types";

interface ProfileViewProps {
  profile: StudentCareerProfile;
  onGoToMatches: () => void;
  onGoToRoadmap: () => void;
  onGoToCoach: () => void;
  onRetakeAssessment: () => void;
}

export function ProfileView({
  profile,
  onGoToMatches,
  onGoToRoadmap,
  onGoToCoach,
  onRetakeAssessment
}: ProfileViewProps) {
  const { profile_archetype, profile_confidence, interests, capabilities, work_style, ranked_values, contradictions } = profile;

  // Top 5 Interests
  const topInterests = Object.entries(interests)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top 5 Capabilities
  const topCapabilities = Object.entries(capabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const capabilityLabels: Record<string, string> = {
    logical_thinking: "Tư duy logic",
    analytical_thinking: "Tư duy phân tích số liệu",
    problem_solving: "Giải quyết vấn đề phức tạp",
    creativity: "Tư duy sáng tạo",
    communication: "Giao tiếp & truyền đạt",
    leadership: "Khả năng lãnh đạo",
    teamwork: "Làm việc nhóm",
    organization: "Quản trị & tổ chức",
    independent_work: "Làm việc độc lập",
    adaptability: "Thích ứng linh hoạt",
    learning_agility: "Tốc độ tự học",
    attention_to_detail: "Tỉ mỉ & chính xác",
    strategic_thinking: "Tư duy chiến lược",
    digital_literacy: "Làm chủ công nghệ số"
  };

  const interestLabels: Record<string, string> = {
    technology: "Công nghệ & Máy tính",
    data: "Dữ liệu & Số liệu",
    engineering: "Kỹ thuật & Robot",
    business: "Kinh doanh & Thương mại",
    finance: "Tài chính & Đầu tư",
    design: "Thiết kế & Giao diện số",
    arts: "Nghệ thuật & Sáng tác",
    communication: "Truyền thông & Tiếp thị",
    education: "Giáo dục & Đào tạo",
    healthcare: "Y tế & Chăm sóc sức khỏe",
    law: "Luật pháp & Chính sách",
    social_impact: "Tác động xã hội",
    nature: "Tự nhiên & Môi trường",
    science: "Khoa học lý thuyết",
    entrepreneurship: "Khởi nghiệp kinh doanh"
  };

  return (
    <div className="space-y-8">
      {/* Hero: Career DNA Archetype */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-brand-600 via-indigo-700 to-indigo-900 p-6 sm:p-10 text-white shadow-lift">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-xs border border-white/20">
            <span>🧬 Career DNA Profile</span>
            <span className="text-white/60">•</span>
            <span>Độ tin cậy: {Math.round(profile_confidence * 100)}%</span>
          </div>

          <button
            onClick={onRetakeAssessment}
            className="rounded-xl bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition"
          >
            ✏️ Chỉnh sửa hồ sơ
          </button>
        </div>

        <div className="mt-6 max-w-3xl space-y-3">
          <span className="text-xs uppercase tracking-widest text-brand-200 font-bold">
            Hình tượng nghề nghiệp cá nhân
          </span>
          <h1 className="text-2xl font-extrabold sm:text-4xl tracking-tight">
            "{profile_archetype.title}"
          </h1>
          <p className="text-sm sm:text-base text-brand-100 italic leading-relaxed">
            {profile_archetype.tagline}
          </p>
          <p className="text-sm text-white/90 leading-relaxed pt-2">
            {profile_archetype.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-3">
            {profile_archetype.core_strengths.map((str, i) => (
              <span
                key={i}
                className="rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-medium text-emerald-200"
              >
                ✓ {str}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Action Navigation Bar */}
        <div className="mt-8 flex flex-wrap gap-3 border-t border-white/15 pt-6">
          <button
            onClick={onGoToMatches}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-ink-900 hover:bg-brand-50 transition shadow-sm active:scale-95"
          >
            🎯 Xem Top Ngành & Nghề Khớp →
          </button>
          <button
            onClick={onGoToRoadmap}
            className="inline-flex items-center gap-2 rounded-xl bg-white/20 border border-white/30 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-white/30 transition"
          >
            🗺️ Xem Lộ Trình 5 Chặng
          </button>
          <button
            onClick={onGoToCoach}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-950 hover:bg-amber-300 transition"
          >
            💬 Hỏi Trợ Lý AI Coach
          </button>
        </div>
      </section>

      {/* Contradiction Engine Alert (Section 48) */}
      {contradictions && contradictions.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <h2 className="text-sm font-bold text-amber-900">
                Phát hiện mâu thuẫn nhận thức (Contradiction Alert)
              </h2>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Hệ thống nhận thấy có sự lệch pha nhẹ giữa một số câu trả lời của bạn:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-amber-800">
                {contradictions.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span>•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-600 mt-2 italic">
                Gợi ý: Bạn có thể nhắn tin hỏi AI Career Coach để làm rõ mâu thuẫn này.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Profile Details Matrix */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Interests */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-base font-bold text-ink-900 mb-1 flex items-center justify-between">
            <span>🎨 Hứng Thú Nghề Nghiệp Hàng Đầu</span>
            <span className="text-xs font-normal text-ink-400">Thang 0 - 100</span>
          </h2>
          <p className="text-xs text-ink-500 mb-4">
            Đại diện cho niềm vui nội tại khi bạn tiếp xúc với chủ đề này.
          </p>

          <div className="space-y-3.5">
            {topInterests.map(([dim, val]) => (
              <div key={dim} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-ink-800">
                  <span>{interestLabels[dim] || dim}</span>
                  <span className="text-brand-600 font-extrabold">{val}/100</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Capabilities */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-base font-bold text-ink-900 mb-1 flex items-center justify-between">
            <span>🧠 Năng Lực Nổi Trội</span>
            <span className="text-xs font-normal text-ink-400">Thang 0 - 100</span>
          </h2>
          <p className="text-xs text-ink-500 mb-4">
            Những kỹ năng tư duy và hành vi bạn tự tin làm tốt nhất.
          </p>

          <div className="space-y-3.5">
            {topCapabilities.map(([dim, val]) => (
              <div key={dim} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-ink-800">
                  <span>{capabilityLabels[dim] || dim}</span>
                  <span className="text-indigo-600 font-extrabold">{val}/100</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Work Style Balance */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-base font-bold text-ink-900 mb-1">
            ⚡ Cân Bằng Phong Cách Làm Việc (-100 đến +100)
          </h2>
          <p className="text-xs text-ink-500 mb-4">
            Môi trường giúp bạn thăng hoa hay nhanh chóng cạn kiệt năng lượng.
          </p>

          <div className="space-y-3.5">
            {[
              { label: "Độc lập ↔ Đội nhóm", val: work_style.independent_vs_team },
              { label: "Ổn định ↔ Linh hoạt", val: work_style.stable_vs_dynamic },
              { label: "Quy chuẩn ↔ Sáng tạo", val: work_style.structured_vs_flexible },
              { label: "Tập trung sâu ↔ Đa nhiệm", val: work_style.deep_work_vs_multitask },
              { label: "Hệ thống/Máy ↔ Con người", val: work_style.people_vs_system }
            ].map((ws, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-ink-800">
                  <span>{ws.label}</span>
                  <span className="text-brand-600 font-extrabold">
                    {ws.val > 0 ? `+${ws.val}` : ws.val}
                  </span>
                </div>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-soft">
                  <div
                    className="absolute top-0 bottom-0 bg-brand-500"
                    style={{
                      left: ws.val >= 0 ? "50%" : `${50 + ws.val / 2}%`,
                      width: `${Math.abs(ws.val) / 2}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Career Values */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
          <h2 className="text-base font-bold text-ink-900 mb-1">
            💎 Top 5 Giá Trị Coi Trọng Nhất
          </h2>
          <p className="text-xs text-ink-500 mb-4">
            Kim chỉ nam giúp bạn không hối hận khi chọn nghề dài hạn.
          </p>

          <div className="space-y-2.5">
            {ranked_values.map((v, i) => {
              const weights = [100, 85, 70, 55, 40];
              const score = weights[i] ?? 40;
              return (
                <div
                  key={v}
                  className="flex items-center justify-between rounded-xl border border-line bg-surface-soft p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 text-white font-bold text-xs">
                      #{i + 1}
                    </span>
                    <span className="font-bold text-xs text-ink-900 capitalize">
                      {v.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-brand-700">
                    Trọng số: {score}đ
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
