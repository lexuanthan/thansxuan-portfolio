import React from "react";
import {
  StudentCareerProfile,
  CareerMatchResult,
  MajorMatchResult,
  PersonalRoadmap
} from "@/lib/career-guidance/types";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentCareerProfile;
  topCareers: CareerMatchResult[];
  topMajors: MajorMatchResult[];
  roadmap: PersonalRoadmap | null;
}

export function ReportModal({
  isOpen,
  onClose,
  profile,
  topCareers,
  topMajors,
  roadmap
}: ReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-3xl border border-line bg-surface p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header Controls */}
        <div className="flex items-center justify-between border-b border-line pb-4 print:hidden">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Báo cáo Trí tuệ Hướng nghiệp Cá nhân
            </span>
            <h2 className="text-xl font-extrabold text-ink-900 mt-0.5">
              Hồ sơ Phân tích & Lộ trình Ra Quyết định Nghề nghiệp
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 transition shadow-lift flex items-center gap-1.5"
            >
              🖨️ In / Xuất PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-600 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="py-6 space-y-6 text-ink-800 text-xs sm:text-sm">
          {/* Cover Header */}
          <div className="rounded-2xl border border-line bg-gradient-to-r from-brand-50 to-indigo-50 p-6 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-extrabold text-brand-700 uppercase">
                  AI CAREER DECISION INTELLIGENCE DOSSIER
                </span>
                <h1 className="text-2xl font-extrabold text-ink-900 mt-1">
                  "{profile.profile_archetype.title}"
                </h1>
                <p className="text-xs text-ink-600 italic">
                  {profile.profile_archetype.tagline}
                </p>
              </div>
              <div className="text-right text-xs text-ink-500">
                <p>Ngày lập: {new Date().toLocaleDateString("vi-VN")}</p>
                <p>Độ tin cậy: {Math.round(profile.profile_confidence * 100)}%</p>
              </div>
            </div>
            <p className="text-xs text-ink-700 leading-relaxed pt-2">
              {profile.profile_archetype.description}
            </p>
          </div>

          {/* Section 1: Core Strengths */}
          <div className="rounded-xl border border-line p-4 space-y-2">
            <h3 className="font-bold text-ink-900 text-sm uppercase text-brand-700">
              1. Thế mạnh cốt lõi & Điểm cần lưu ý
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <span className="font-bold text-emerald-900 text-xs block mb-1">
                  ✓ Thế mạnh vượt trội:
                </span>
                <ul className="text-xs space-y-1 text-emerald-800">
                  {profile.profile_archetype.core_strengths.map((str, i) => (
                    <li key={i}>• {str}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                <span className="font-bold text-amber-900 text-xs block mb-1">
                  ⚠️ Điểm mù cần lưu ý:
                </span>
                <ul className="text-xs space-y-1 text-amber-800">
                  {profile.profile_archetype.potential_blindspots.map((str, i) => (
                    <li key={i}>• {str}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Top Careers */}
          <div className="rounded-xl border border-line p-4 space-y-3">
            <h3 className="font-bold text-ink-900 text-sm uppercase text-brand-700">
              2. Top Nghề nghiệp Tương thích Cao Nhất
            </h3>
            <div className="space-y-2">
              {topCareers.slice(0, 3).map((c, i) => (
                <div
                  key={c.career.id}
                  className="flex items-center justify-between rounded-lg bg-surface-soft p-3 border border-line"
                >
                  <div>
                    <span className="font-bold text-ink-900">
                      #{i + 1}. {c.career.name}
                    </span>
                    <p className="text-xs text-ink-500 mt-0.5">{c.career.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-brand-600 text-base">
                      {c.score}%
                    </span>
                    <span className="block text-[11px] font-semibold text-emerald-700">
                      {c.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Top Majors */}
          <div className="rounded-xl border border-line p-4 space-y-3">
            <h3 className="font-bold text-ink-900 text-sm uppercase text-brand-700">
              3. Top Ngành Đào Tạo Đại Học Khuyến Nghị
            </h3>
            <div className="space-y-2">
              {topMajors.slice(0, 3).map((m, i) => (
                <div
                  key={m.major.id}
                  className="flex items-center justify-between rounded-lg bg-surface-soft p-3 border border-line"
                >
                  <div>
                    <span className="font-bold text-ink-900">
                      #{i + 1}. {m.major.name} (Mã: {m.major.code})
                    </span>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Độ khó: {m.major.difficulty_level} • Điểm chuẩn TB: {m.major.academic_requirements.avg_cutoff_score}đ
                    </p>
                  </div>
                  <span className="font-extrabold text-brand-600 text-base">
                    {m.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Roadmap Summary */}
          {roadmap && (
            <div className="rounded-xl border border-line p-4 space-y-3">
              <h3 className="font-bold text-ink-900 text-sm uppercase text-brand-700">
                4. Lộ Trình Hành Động 5 Giai Đoạn (Mục tiêu: {roadmap.target_career_name})
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {roadmap.stages.map((stage) => (
                  <div key={stage.stage_id} className="rounded-lg bg-surface-soft p-3 border border-line text-xs">
                    <span className="font-bold text-ink-900 block">{stage.title}</span>
                    <p className="text-[11px] text-ink-500 mb-1.5">{stage.tagline}</p>
                    <ul className="space-y-1 text-ink-700">
                      {stage.tasks.map((t) => (
                        <li key={t.id} className="flex items-start gap-1">
                          <span>{t.completed ? "☑" : "☐"}</span>
                          <span className={t.completed ? "line-through text-ink-400" : ""}>{t.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Disclaimer */}
          <div className="border-t border-line pt-4 text-center text-xs text-ink-400">
            Báo cáo được khởi tạo tự động bởi Hệ Thống Trí Tuệ Hướng Nghiệp AI. Kết quả phản ánh mức độ tương thích logic và không thay thế quyết định độc lập của bạn.
          </div>
        </div>
      </div>
    </div>
  );
}
