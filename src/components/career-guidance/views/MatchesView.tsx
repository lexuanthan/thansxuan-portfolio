import React, { useState } from "react";
import {
  CareerMatchResult,
  MajorMatchResult,
  MatchScoreReason
} from "@/lib/career-guidance/types";
import { INDUSTRIES_DATA } from "@/lib/career-guidance/industriesData";

interface MatchesViewProps {
  careerMatches: CareerMatchResult[];
  majorMatches: MajorMatchResult[];
  onSelectCareerForRoadmap: (careerId: string) => void;
  onBookmarkItem: (type: "career" | "major", id: string) => void;
  isBookmarked: (type: "career" | "major", id: string) => boolean;
  onAskCoachAboutItem: (name: string) => void;
}

export function MatchesView({
  careerMatches,
  majorMatches,
  onSelectCareerForRoadmap,
  onBookmarkItem,
  isBookmarked,
  onAskCoachAboutItem
}: MatchesViewProps) {
  const [activeTab, setActiveTab] = useState<"careers" | "majors" | "industries">("careers");
  const [explainModalData, setExplainModalData] = useState<{
    title: string;
    score: number;
    label: string;
    reasons: MatchScoreReason;
  } | null>(null);

  const scoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score >= 80) return "bg-brand-100 text-brand-800 border-brand-300";
    if (score >= 70) return "bg-sky-100 text-sky-800 border-sky-300";
    if (score >= 60) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-slate-100 text-slate-700 border-slate-300";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            Kết Quả Phù Hợp (Matching Results)
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Xếp hạng dựa trên công thức tất định: Hứng thú (25%), Năng lực (20%), Phong cách (15%), Giá trị (15%), Học thuật (10%), Mục tiêu (10%), Thực tế (5%).
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex gap-1.5 rounded-xl bg-surface-soft p-1 border border-line">
          <button
            onClick={() => setActiveTab("careers")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "careers"
                ? "bg-surface text-brand-700 shadow-xs"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            💼 Nghề nghiệp ({careerMatches.length})
          </button>
          <button
            onClick={() => setActiveTab("majors")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "majors"
                ? "bg-surface text-brand-700 shadow-xs"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            🎓 Ngành đào tạo ({majorMatches.length})
          </button>
          <button
            onClick={() => setActiveTab("industries")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "industries"
                ? "bg-surface text-brand-700 shadow-xs"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            🌐 Lĩnh vực ({INDUSTRIES_DATA.length})
          </button>
        </div>
      </div>

      {/* Careers Match Tab */}
      {activeTab === "careers" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {careerMatches.map((m) => {
            const { career, score, label, reasons } = m;
            const bookmarked = isBookmarked("career", career.id);
            return (
              <div
                key={career.id}
                className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:border-brand-300 hover:shadow-lift"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-md px-2 py-0.5">
                      {career.industry_name}
                    </span>
                    <button
                      onClick={() => onBookmarkItem("career", career.id)}
                      className={`text-sm p-1 rounded-md transition ${
                        bookmarked ? "text-amber-500" : "text-ink-300 hover:text-amber-400"
                      }`}
                      title={bookmarked ? "Đã lưu" : "Lưu vào danh sách"}
                    >
                      {bookmarked ? "★" : "☆"}
                    </button>
                  </div>

                  <h2 className="font-bold text-ink-900 text-base mt-2.5 leading-snug">
                    {career.name}
                  </h2>
                  <p className="text-xs text-ink-500 mt-1 italic">
                    "{career.tagline}"
                  </p>

                  {/* Score pill */}
                  <div className="mt-4 flex items-center justify-between border-y border-line py-2.5">
                    <div>
                      <span className="text-[11px] text-ink-400 block">Độ tương thích</span>
                      <span className="text-xl font-extrabold text-brand-600">{score}%</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreBadgeColor(score)}`}>
                      {label}
                    </span>
                  </div>

                  {/* Why snippet */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      Điểm tựa phù hợp:
                    </span>
                    <ul className="text-xs text-ink-700 space-y-1">
                      {reasons.positive_factors.slice(0, 2).map((pos, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span className="line-clamp-2">{pos}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Salary context */}
                  <div className="mt-3 flex items-center justify-between text-xs text-ink-600 bg-surface-soft p-2 rounded-xl">
                    <span>Mức lương tại VN:</span>
                    <span className="font-bold text-ink-900">
                      {career.salary_range.entry_level_million} - {career.salary_range.senior_level_million} tr/tháng
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 space-y-2 border-t border-line pt-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setExplainModalData({
                          title: career.name,
                          score,
                          label,
                          reasons
                        })
                      }
                      className="flex-1 rounded-xl border border-line bg-surface-soft px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition"
                    >
                      💡 Tại sao khớp?
                    </button>
                    <button
                      onClick={() => onAskCoachAboutItem(career.name)}
                      className="rounded-xl border border-line bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition"
                      title="Hỏi AI Coach về nghề này"
                    >
                      💬 Hỏi AI
                    </button>
                  </div>
                  <button
                    onClick={() => onSelectCareerForRoadmap(career.id)}
                    className="w-full rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 transition shadow-xs"
                  >
                    🚀 Chọn làm mục tiêu lộ trình →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Majors Match Tab */}
      {activeTab === "majors" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {majorMatches.map((m) => {
            const { major, score, label, reasons } = m;
            const bookmarked = isBookmarked("major", major.id);
            return (
              <div
                key={major.id}
                className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:border-brand-300 hover:shadow-lift"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-md px-2 py-0.5">
                      Mã: {major.code}
                    </span>
                    <button
                      onClick={() => onBookmarkItem("major", major.id)}
                      className={`text-sm p-1 rounded-md transition ${
                        bookmarked ? "text-amber-500" : "text-ink-300 hover:text-amber-400"
                      }`}
                    >
                      {bookmarked ? "★" : "☆"}
                    </button>
                  </div>

                  <h2 className="font-bold text-ink-900 text-base mt-2 leading-snug">
                    {major.name}
                  </h2>
                  <p className="text-xs text-ink-600 mt-1 line-clamp-2">
                    {major.description}
                  </p>

                  {/* Score pill */}
                  <div className="mt-4 flex items-center justify-between border-y border-line py-2.5">
                    <div>
                      <span className="text-[11px] text-ink-400 block">Độ phù hợp ngành</span>
                      <span className="text-xl font-extrabold text-brand-600">{score}%</span>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${scoreBadgeColor(score)}`}>
                      {label}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-ink-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Độ khó chương trình:</span>
                      <span className="font-bold text-ink-800">{major.difficulty_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mức độ Toán / Logic:</span>
                      <span className="font-bold text-ink-800">{major.academic_requirements.math_intensity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Điểm chuẩn TB tham khảo:</span>
                      <span className="font-bold text-brand-700">{major.academic_requirements.avg_cutoff_score} đ</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-line pt-3">
                  <button
                    onClick={() =>
                      setExplainModalData({
                        title: major.name,
                        score,
                        label,
                        reasons
                      })
                    }
                    className="w-full rounded-xl border border-line bg-surface-soft px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition"
                  >
                    💡 Xem phân tích tại sao khớp
                  </button>
                  <button
                    onClick={() => onAskCoachAboutItem(major.name)}
                    className="w-full rounded-xl bg-surface border border-line px-3 py-2 text-xs font-semibold text-ink-800 hover:bg-brand-50 transition"
                  >
                    💬 Hỏi AI Coach về ngành này
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Industries Tab */}
      {activeTab === "industries" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES_DATA.map((ind) => (
            <div
              key={ind.id}
              className="rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:border-brand-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{ind.icon}</span>
                <div>
                  <h2 className="font-bold text-ink-900 text-sm">{ind.name}</h2>
                  <p className="text-[11px] text-ink-500">{ind.traits[0]}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-ink-700 leading-relaxed">
                {ind.description}
              </p>
              <div className="mt-3 border-t border-line pt-2 text-[11px] text-ink-500">
                <strong className="text-ink-800 font-semibold">Tác động AI: </strong>
                {ind.ai_impact_overview}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Explainability Modal / Drawer (Section 31 & 73) */}
      {explainModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Báo cáo giải trình độ tương thích (Explainability)
                </span>
                <h3 className="text-lg font-extrabold text-ink-900 mt-0.5">
                  {explainModalData.title}
                </h3>
              </div>
              <button
                onClick={() => setExplainModalData(null)}
                className="rounded-full p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between rounded-xl bg-surface-soft p-3 border border-line">
                <span className="text-xs text-ink-600">Điểm số tính toán:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-brand-600">
                    {explainModalData.score}%
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreBadgeColor(explainModalData.score)}`}>
                    {explainModalData.label}
                  </span>
                </div>
              </div>

              {/* Positives */}
              <div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>✓</span> Điểm tựa phù hợp (Positive Factors)
                </h4>
                <ul className="space-y-1.5 text-xs text-ink-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  {explainModalData.reasons.positive_factors.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Considerations & Penalties */}
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>⚠️</span> Điểm cần cân nhắc & Rủi ro (Considerations)
                </h4>
                <ul className="space-y-1.5 text-xs text-ink-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                  {explainModalData.reasons.considerations.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What to verify */}
              <div>
                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>🔍</span> Điều cần xác minh thêm (What to verify)
                </h4>
                <ul className="space-y-1.5 text-xs text-ink-700 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                  {explainModalData.reasons.what_to_verify.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-line pt-4 flex justify-end">
              <button
                onClick={() => setExplainModalData(null)}
                className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
