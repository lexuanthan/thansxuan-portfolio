import React, { useState, useMemo } from "react";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { MAJORS_DATA } from "@/lib/career-guidance/majorsData";
import { CareerMatchResult, MajorMatchResult, StudentCareerProfile, UniversityMatchResult } from "@/lib/career-guidance/types";
import { matchUniversities } from "@/lib/career-guidance/universityMatching";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";
import { SmartNextAction } from "../common/SmartNextAction";
import {
  IconScale,
  IconBriefcase,
  IconGraduationCap,
  IconUniversity,
  IconBot,
  IconCheck,
  IconTrendingUp,
  IconAlertCircle,
  IconSparkles,
  IconAward,
  HcmuteBrandMark
} from "../common/CareerIcons";

interface CompareViewProps {
  careerMatches: CareerMatchResult[];
  majorMatches: MajorMatchResult[];
  profile?: StudentCareerProfile;
  onAskCoachAboutItem: (name: string) => void;
  onNavigateView?: (view: any) => void;
}

function UniLogoBadge({ shortName, isHcmute }: { shortName: string; isHcmute?: boolean }) {
  if (isHcmute) {
    return (
      <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center p-1 shrink-0">
        <HcmuteBrandMark className="w-full h-full text-brand-600" />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-surface-soft to-brand-50 border border-line flex items-center justify-center font-extrabold text-[11px] text-brand-800 shrink-0">
      {shortName.slice(0, 4)}
    </div>
  );
}

export function CompareView({
  careerMatches = [],
  majorMatches = [],
  profile,
  onAskCoachAboutItem,
  onNavigateView
}: CompareViewProps) {
  const currentProfile = useMemo(() => profile || createDefaultProfile(), [profile]);

  const [compareType, setCompareType] = useState<"career" | "major" | "university">("university");

  const [selectedCareerIds, setSelectedCareerIds] = useState<string[]>([
    CAREERS_DATA[0].id,
    CAREERS_DATA[1].id,
    CAREERS_DATA[2].id
  ]);
  const [selectedMajorIds, setSelectedMajorIds] = useState<string[]>([
    MAJORS_DATA[0].id,
    MAJORS_DATA[1].id,
    MAJORS_DATA[3].id
  ]);
  const [selectedUniIds, setSelectedUniIds] = useState<string[]>(["SPK", "QSB", "UEH"]);

  const [highlightDifference, setHighlightDifference] = useState(true);
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);

  const allMatchedUnis = useMemo(() => {
    return matchUniversities(currentProfile);
  }, [currentProfile]);

  const activeCareers = CAREERS_DATA.filter((c) => selectedCareerIds.includes(c.id));
  const activeMajors = MAJORS_DATA.filter((m) => selectedMajorIds.includes(m.id));
  const activeUnis = useMemo(() => {
    return selectedUniIds
      .map((id) => allMatchedUnis.find((u) => u.university_id === id || u.short_name === id))
      .filter((u): u is UniversityMatchResult => Boolean(u));
  }, [allMatchedUnis, selectedUniIds]);

  const toggleCareer = (id: string) => {
    if (selectedCareerIds.includes(id)) {
      if (selectedCareerIds.length > 1) {
        setSelectedCareerIds(selectedCareerIds.filter((item) => item !== id));
      }
    } else {
      if (selectedCareerIds.length >= 3) {
        setSelectedCareerIds([selectedCareerIds[1], selectedCareerIds[2], id]);
      } else {
        setSelectedCareerIds([...selectedCareerIds, id]);
      }
    }
  };

  const toggleMajor = (id: string) => {
    if (selectedMajorIds.includes(id)) {
      if (selectedMajorIds.length > 1) {
        setSelectedMajorIds(selectedMajorIds.filter((item) => item !== id));
      }
    } else {
      if (selectedMajorIds.length >= 3) {
        setSelectedMajorIds([selectedMajorIds[1], selectedMajorIds[2], id]);
      } else {
        setSelectedMajorIds([...selectedMajorIds, id]);
      }
    }
  };

  const toggleUni = (id: string) => {
    if (selectedUniIds.includes(id)) {
      if (selectedUniIds.length > 1) {
        setSelectedUniIds(selectedUniIds.filter((item) => item !== id));
      }
    } else {
      if (selectedUniIds.length >= 3) {
        setSelectedUniIds([selectedUniIds[1], selectedUniIds[2], id]);
      } else {
        setSelectedUniIds([...selectedUniIds, id]);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line bg-surface p-5 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-[11px] font-bold text-brand-700 mb-1">
            <IconScale className="w-3.5 h-3.5 text-brand-600" />
            <span>Chặng 07 • Multi-Dimensional Decision Workspace</span>
          </div>
          <h1 className="text-xl font-bold text-ink-900 tracking-tight">
            Trung Tâm So Sánh Đa Chiều (Comparison Center)
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Đặt tối đa 3 phương án lên bàn cân để phân tích trực diện điểm khác biệt về đặc thù, mức lương, học phí và độ khó.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCompareType("university")}
            className={`inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-xs font-bold transition ${
              compareType === "university"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-surface-soft border border-line text-ink-700 hover:bg-brand-50"
            }`}
          >
            <IconUniversity className="w-3.5 h-3.5" />
            <span>So sánh Trường ĐH</span>
          </button>
          <button
            onClick={() => setCompareType("career")}
            className={`inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-xs font-bold transition ${
              compareType === "career"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-surface-soft border border-line text-ink-700 hover:bg-brand-50"
            }`}
          >
            <IconBriefcase className="w-3.5 h-3.5" />
            <span>So sánh Nghề nghiệp</span>
          </button>
          <button
            onClick={() => setCompareType("major")}
            className={`inline-flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-xs font-bold transition ${
              compareType === "major"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-surface-soft border border-line text-ink-700 hover:bg-brand-50"
            }`}
          >
            <IconGraduationCap className="w-3.5 h-3.5" />
            <span>So sánh Ngành học</span>
          </button>
        </div>
      </div>

      {/* Selectors Tray */}
      <div className="rounded-[12px] border border-line bg-surface-soft p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-ink-700 block">
            Chọn tối đa 3 phương án đối sánh trực tiếp:
          </span>
          {compareType === "university" && (
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink-700">
                <input
                  type="checkbox"
                  checked={highlightDifference}
                  onChange={(e) => setHighlightDifference(e.target.checked)}
                  className="rounded border-line text-brand-600 focus:ring-0"
                />
                <span>Làm nổi bật điểm khác biệt</span>
              </label>

              <button
                onClick={() => setIsAiAnalysisOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-[8px] bg-gradient-to-r from-brand-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-95 transition"
              >
                <IconSparkles className="w-3.5 h-3.5" />
                <span>AI phân tích điểm khác biệt quan trọng</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {compareType === "university" &&
            allMatchedUnis.slice(0, 10).map((u) => {
              const active = selectedUniIds.includes(u.university_id) || selectedUniIds.includes(u.short_name);
              return (
                <button
                  key={u.university_id}
                  onClick={() => toggleUni(u.university_id)}
                  className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-surface border border-line text-ink-700 hover:border-brand-300"
                  }`}
                >
                  {active ? <IconCheck className="w-3 h-3 text-white" /> : <span className="text-ink-400">+</span>}
                  <span>{u.short_name} ({u.match_score}%)</span>
                </button>
              );
            })}

          {compareType === "career" &&
            CAREERS_DATA.map((c) => {
              const active = selectedCareerIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCareer(c.id)}
                  className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-surface border border-line text-ink-700 hover:border-brand-300"
                  }`}
                >
                  {active ? <IconCheck className="w-3 h-3 text-white" /> : <span className="text-ink-400">+</span>}
                  <span>{c.name}</span>
                </button>
              );
            })}

          {compareType === "major" &&
            MAJORS_DATA.map((m) => {
              const active = selectedMajorIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMajor(m.id)}
                  className={`inline-flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-surface border border-line text-ink-700 hover:border-brand-300"
                  }`}
                >
                  {active ? <IconCheck className="w-3 h-3 text-white" /> : <span className="text-ink-400">+</span>}
                  <span>{m.name}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* UNIVERSITY COMPARISON WORKSPACE (8 Rows with Sticky Header & Responsive Stacked Compare) */}
      {compareType === "university" && (
        <div className="space-y-4">
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto rounded-[12px] border border-line bg-surface shadow-soft">
            <table className="w-full text-left text-xs text-ink-800">
              {/* STICKY HEADER */}
              <thead className="sticky top-0 z-20 bg-surface-soft/95 backdrop-blur-md border-b border-line text-ink-900 font-bold">
                <tr>
                  <th className="p-4 w-1/4">Tiêu chí so sánh (8 Trục)</th>
                  {activeUnis.map((u) => {
                    const isHcmute = u.short_name === "HCMUTE" || u.university_name.includes("Sư phạm Kỹ thuật");
                    return (
                      <th key={u.university_id} className="p-4 w-1/4">
                        <div className="flex items-center gap-2">
                          <UniLogoBadge shortName={u.short_name} isHcmute={isHcmute} />
                          <div>
                            <span className="text-sm font-extrabold text-brand-700 block">
                              {u.short_name}
                            </span>
                            <span className="text-[11px] font-normal text-ink-500 block truncate max-w-[180px]">
                              {u.university_name}
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {/* 1. Fit Breakdown */}
                <tr className={highlightDifference ? "bg-brand-50/20" : ""}>
                  <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">
                    1. Độ phù hợp 7 chiều (Fit Breakdown)
                  </td>
                  {activeUnis.map((u) => {
                    const fits = u.fit_breakdown || {
                      overall_fit: u.match_score,
                      academic_fit: 85,
                      admission_fit: 80,
                      financial_fit: 85,
                      location_fit: 85,
                      career_fit: 90,
                      environment_fit: 85
                    };
                    return (
                      <td key={u.university_id} className="p-4 space-y-1">
                        <span className="text-base font-extrabold text-brand-600 block">
                          {fits.overall_fit}% Overall Fit
                        </span>
                        <div className="text-[11px] text-ink-600 space-y-0.5">
                          <div>• Học thuật (Academic): <strong>{fits.academic_fit}%</strong></div>
                          <div>• Xét tuyển (Admission): <strong>{fits.admission_fit}%</strong></div>
                          <div>• Tài chính (Financial): <strong>{fits.financial_fit}%</strong></div>
                          <div>• Địa điểm (Location): <strong>{fits.location_fit}%</strong></div>
                          <div>• Nghề nghiệp (Career): <strong>{fits.career_fit}%</strong></div>
                          <div>• Môi trường (Environment): <strong>{fits.environment_fit}%</strong></div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Admission */}
                <tr className={highlightDifference ? "bg-amber-50/20" : ""}>
                  <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">
                    2. Xét tuyển & Điểm chuẩn (Admission)
                  </td>
                  {activeUnis.map((u) => (
                    <td key={u.university_id} className="p-4 space-y-1">
                      <strong className="text-sm font-extrabold text-brand-700 block">
                        {u.average_cutoff || 25.5} điểm
                      </strong>
                      <span className="text-[11px] font-bold text-ink-700 block">
                        Khả năng: {u.overall_feasibility === "Safe" ? "An toàn" : u.overall_feasibility === "Target" ? "Vừa sức" : "Thử thách"}
                      </span>
                      <span className="text-[10px] text-ink-500 block">
                        {u.admission_methods?.slice(0, 2).join("; ")}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 3. Tuition */}
                <tr className={highlightDifference ? "bg-blue-50/20" : ""}>
                  <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">
                    3. Học phí tham khảo (Tuition)
                  </td>
                  {activeUnis.map((u) => (
                    <td key={u.university_id} className="p-4">
                      <span className="text-sm font-extrabold text-ink-900 block">
                        {u.tuition_million_year} triệu VNĐ / năm
                      </span>
                      <span className="text-[11px] text-ink-500">
                        {u.tuition_million_year <= (currentProfile.user_context?.tuition_budget_max_million || 40)
                          ? "✓ Phù hợp ngân sách dự kiến"
                          : "⚠️ Vượt ngân sách - Cần tính học bổng"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 4. Location */}
                <tr>
                  <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">
                    4. Địa điểm & Cơ sở (Location)
                  </td>
                  {activeUnis.map((u) => (
                    <td key={u.university_id} className="p-4 text-xs text-ink-700">
                      <strong className="block text-ink-900">{u.city}</strong>
                      <span className="text-ink-500 text-[11px]">
                        {u.region === "NAM" ? "Khu vực Miền Nam" : u.region === "TRUNG" ? "Khu vực Miền Trung" : "Khu vực Miền Bắc"}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 5. Scholarship */}
                <tr className={highlightDifference ? "bg-emerald-50/20" : ""}>
                  <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">
                    5. Chính sách học bổng (Scholarship)
                  </td>
                  {activeUnis.map((u) => (
                    <td key={u.university_id} className="p-4 text-xs leading-relaxed text-ink-700">
                      {u.scholarship_info || "Học bổng khuyến khích và tài trợ doanh nghiệp."}
                    </td>
                  ))}
                </tr>

                {/* 6. Curriculum */}
                <tr>
                  <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">
                    6. Chương trình đào tạo (Curriculum)
                  </td>
                  {activeUnis.map((u) => (
                    <td key={u.university_id} className="p-4 text-xs leading-relaxed text-ink-700">
                      {u.curriculum_highlight || "Chuẩn kiểm định quốc gia và quốc tế."}
                    </td>
                  ))}
                </tr>

                {/* 7. Environment */}
                <tr>
                  <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">
                    7. Môi trường & Cơ sở vật chất (Environment)
                  </td>
                  {activeUnis.map((u) => (
                    <td key={u.university_id} className="p-4 text-xs leading-relaxed text-ink-700">
                      {u.campus_environment || "Giảng đường hiện đại, phòng thí nghiệm đầy đủ."}
                    </td>
                  ))}
                </tr>

                {/* 8. Career */}
                <tr className={highlightDifference ? "bg-indigo-50/20" : ""}>
                  <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">
                    8. Cơ hội nghề nghiệp (Career)
                  </td>
                  {activeUnis.map((u) => (
                    <td key={u.university_id} className="p-4 text-xs leading-relaxed text-ink-700">
                      {u.career_opportunities || "Tỷ lệ việc làm cao với mạng lưới đối tác doanh nghiệp."}
                    </td>
                  ))}
                </tr>

                {/* Action CTA Row */}
                <tr>
                  <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">
                    Khai vấn với AI Coach
                  </td>
                  {activeUnis.map((u) => (
                    <td key={u.university_id} className="p-4">
                      <button
                        onClick={() => onAskCoachAboutItem(u.university_name)}
                        className="inline-flex items-center gap-1.5 rounded-[8px] border border-brand-200 bg-brand-50 px-3 py-1.5 font-bold text-brand-900 hover:bg-brand-100 transition text-xs"
                      >
                        <IconBot className="w-3.5 h-3.5 text-brand-600" />
                        <span>Hỏi AI về cơ hội trường này</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* MOBILE STACKED COMPARE VIEW (Tránh tràn ngang) */}
          <div className="block md:hidden space-y-4">
            <div className="rounded-[10px] bg-brand-50 p-2.5 text-[11px] text-brand-900 font-medium border border-brand-200">
              📱 <strong>Chế độ so sánh xếp chồng (Stacked Compare):</strong> Tối ưu cho thiết bị di động.
            </div>

            {activeUnis.map((u) => {
              const isHcmute = u.short_name === "HCMUTE" || u.university_name.includes("Sư phạm Kỹ thuật");
              const fits = u.fit_breakdown || {
                overall_fit: u.match_score,
                academic_fit: 85,
                admission_fit: 80,
                financial_fit: 85,
                location_fit: 85,
                career_fit: 90,
                environment_fit: 85
              };

              return (
                <div
                  key={u.university_id}
                  className={`rounded-[12px] border p-4 shadow-soft space-y-3 ${
                    isHcmute
                      ? "border-brand-500 bg-brand-50/15"
                      : "border-line bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-line pb-2">
                    <div className="flex items-center gap-2">
                      <UniLogoBadge shortName={u.short_name} isHcmute={isHcmute} />
                      <div>
                        <strong className="text-xs font-bold text-ink-900 block">{u.short_name}</strong>
                        <span className="text-[10px] text-ink-500">{u.city} • {u.type}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {fits.overall_fit}% Fit
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-ink-400 uppercase block">1. 7 Chiều Fit:</span>
                      <span className="text-ink-700">
                        Học thuật: {fits.academic_fit}% • Xét tuyển: {fits.admission_fit}% • Tài chính: {fits.financial_fit}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-ink-400 uppercase block">2. Xét tuyển & Điểm chuẩn:</span>
                      <span className="font-bold text-brand-700">{u.average_cutoff || 25.5} đ</span> ({u.overall_feasibility})
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-ink-400 uppercase block">3. Học phí:</span>
                      <span className="font-extrabold text-ink-900">{u.tuition_million_year} tr/năm</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-ink-400 uppercase block">4. Địa điểm:</span>
                      <span>{u.city} ({u.region})</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-ink-400 uppercase block">5. Học bổng:</span>
                      <span className="text-emerald-900 line-clamp-2">{u.scholarship_info}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-ink-400 uppercase block">6. Chương trình:</span>
                      <span className="line-clamp-2">{u.curriculum_highlight}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-ink-400 uppercase block">7. Môi trường:</span>
                      <span className="line-clamp-2">{u.campus_environment}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-ink-400 uppercase block">8. Cơ hội việc làm:</span>
                      <span className="line-clamp-2">{u.career_opportunities}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI ANALYSIS MODAL FOR UNIVERSITY COMPARE */}
      {isAiAnalysisOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-2xl rounded-[16px] border border-line bg-surface p-6 shadow-lift space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <IconSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-900">
                    AI Phân Tích Điểm Khác Biệt Quan Trọng
                  </h3>
                  <p className="text-xs text-ink-500">
                    So sánh đối chứng dựa trên hồ sơ cá nhân hiện tại
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiAnalysisOpen(false)}
                aria-label="Đóng phân tích AI"
                className="rounded-[8px] p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-ink-800 leading-relaxed">
              <div className="rounded-[10px] bg-brand-50/80 p-3.5 border border-brand-200">
                <strong className="text-brand-900 font-bold block mb-1">
                  1. Khuyến nghị độ phù hợp cá nhân hóa:
                </strong>
                <p>
                  Hệ thống không xếp hạng đâu là trường tốt nhất nói chung, mà xác định{" "}
                  <strong>trường phù hợp hơn với hồ sơ hiện tại</strong> của bạn là{" "}
                  <strong>{activeUnis[0]?.short_name || "HCMUTE"}</strong> dựa trên sự cân bằng giữa điểm thi dự kiến, chi phí đào tạo trong tầm kiểm soát và tỷ lệ học phần thực hành xưởng/lab phù hợp với phong cách tư duy của bạn.
                </p>
              </div>

              <div className="rounded-[10px] bg-surface-soft p-3.5 border border-line space-y-2">
                <strong className="text-ink-900 font-bold block">
                  2. Phân tích điểm khác biệt & đánh đổi (Trade-offs):
                </strong>
                <ul className="space-y-1.5 list-disc pl-4 text-ink-700">
                  {activeUnis.map((u) => (
                    <li key={u.university_id}>
                      <strong className="text-ink-900">{u.short_name}:</strong>{" "}
                      {u.short_name === "HCMUTE"
                        ? "Lợi thế vượt trội về kỹ năng thực nghiệm và việc làm nhanh tại Khu Công nghệ cao SHTP; khối lượng đồ án kỹ thuật đòi hỏi tính kiên trì cao."
                        : u.type === "Quốc tế"
                        ? "Lợi thế môi trường giao tiếp 100% tiếng Anh; thách thức về chi phí học phí cần cân nhắc kỹ."
                        : "Thế mạnh nghiên cứu lý thuyết nền tảng vững chắc; đòi hỏi sinh viên chủ động tự tìm kiếm cơ hội thực tập bên ngoài."}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <button
                onClick={() => {
                  setIsAiAnalysisOpen(false);
                  onAskCoachAboutItem(activeUnis.map((u) => u.short_name).join(" và "));
                }}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition"
              >
                <IconBot className="w-3.5 h-3.5" />
                <span>Thảo luận chi tiết cùng AI Coach</span>
              </button>
              <button
                onClick={() => setIsAiAnalysisOpen(false)}
                className="rounded-[10px] border border-line bg-surface px-4 py-2 text-xs font-bold text-ink-700 hover:bg-surface-soft"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Career Comparison Matrix */}
      {compareType === "career" && (
        <div className="overflow-x-auto rounded-[12px] border border-line bg-surface shadow-soft">
          <table className="w-full text-left text-xs text-ink-800">
            <thead className="bg-surface-soft border-b border-line text-ink-900 font-bold">
              <tr>
                <th className="p-4 w-1/4">Tiêu chí so sánh</th>
                {activeCareers.map((c) => (
                  <th key={c.id} className="p-4 w-1/4">
                    <span className="text-sm font-extrabold text-brand-700 block">{c.name}</span>
                    <span className="text-[11px] font-normal text-ink-500">{c.industry_name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Độ tương thích hồ sơ</td>
                {activeCareers.map((c) => {
                  const match = careerMatches.find((m) => m.career.id === c.id);
                  return (
                    <td key={c.id} className="p-4">
                      <span className="text-base font-extrabold text-brand-600">
                        {match ? `${match.score}%` : "Chưa tính"}
                      </span>
                      <span className="text-xs text-ink-500 block">
                        {match ? match.label : ""}
                      </span>
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Thang lương tại VN</td>
                {activeCareers.map((c) => (
                  <td key={c.id} className="p-4 font-semibold">
                    <span className="text-ink-900 font-bold">{c.salary_range.entry_level_million} - {c.salary_range.senior_level_million}</span> tr/tháng
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Mức độ tương tác con người</td>
                {activeCareers.map((c) => {
                  const styleVal = c.work_style.people_vs_system ?? 0;
                  return (
                    <td key={c.id} className="p-4">
                      <span className="font-semibold text-ink-800">
                        {styleVal > 30 ? "Cao (Giao tiếp dày đặc)" : styleVal < -30 ? "Thấp (Tập trung máy/số liệu)" : "Trung bình"}
                      </span>
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Tác động tự động hóa AI</td>
                {activeCareers.map((c) => (
                  <td key={c.id} className="p-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-[6px] text-xs ${
                        c.ai_impact.automation_exposure === "Thấp"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : c.ai_impact.automation_exposure === "Trung bình"
                          ? "bg-brand-50 text-brand-800 border border-brand-200"
                          : "bg-accent-red-50 text-accent-red-800 border border-accent-red-200"
                      }`}
                    >
                      {c.ai_impact.automation_exposure}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Lợi thế độc quyền con người</td>
                {activeCareers.map((c) => (
                  <td key={c.id} className="p-4 text-xs leading-relaxed text-ink-700">
                    {c.ai_impact.human_advantage}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Hỏi Trợ lý AI Coach</td>
                {activeCareers.map((c) => (
                  <td key={c.id} className="p-4">
                    <button
                      onClick={() => onAskCoachAboutItem(c.name)}
                      className="inline-flex items-center gap-1.5 rounded-[8px] border border-brand-200 bg-brand-50 px-3 py-1.5 font-bold text-brand-900 hover:bg-brand-100 transition text-xs"
                    >
                      <IconBot className="w-3.5 h-3.5 text-brand-600" />
                      <span>Hỏi AI về nghề này</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Major Comparison Matrix */}
      {compareType === "major" && (
        <div className="overflow-x-auto rounded-[12px] border border-line bg-surface shadow-soft">
          <table className="w-full text-left text-xs text-ink-800">
            <thead className="bg-surface-soft border-b border-line text-ink-900 font-bold">
              <tr>
                <th className="p-4 w-1/4">Tiêu chí so sánh</th>
                {activeMajors.map((m) => (
                  <th key={m.id} className="p-4 w-1/4">
                    <span className="text-sm font-extrabold text-brand-700 block">{m.name}</span>
                    <span className="text-[11px] font-normal text-ink-500">Mã: {m.code}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Độ phù hợp hồ sơ</td>
                {activeMajors.map((m) => {
                  const match = majorMatches.find((matchItem) => matchItem.major.id === m.id);
                  return (
                    <td key={m.id} className="p-4">
                      <span className="text-base font-extrabold text-brand-600">
                        {match ? `${match.score}%` : "Chưa tính"}
                      </span>
                      <span className="text-xs text-ink-500 block">
                        {match ? match.label : ""}
                      </span>
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Độ khó học phần</td>
                {activeMajors.map((m) => (
                  <td key={m.id} className="p-4 font-semibold text-ink-900">
                    <span className="px-2 py-0.5 rounded-[6px] bg-surface-soft border border-line font-bold">
                      {m.difficulty_level}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Môn học trọng tâm</td>
                {activeMajors.map((m) => (
                  <td key={m.id} className="p-4 font-semibold text-ink-800">
                    {m.academic_requirements.required_subjects.join(", ")}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Cường độ môn Toán</td>
                {activeMajors.map((m) => (
                  <td key={m.id} className="p-4">
                    <span className="font-bold text-brand-700">
                      {m.academic_requirements.math_intensity}
                    </span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold text-ink-900 bg-surface-soft/40">Điểm chuẩn tham khảo</td>
                {activeMajors.map((m) => (
                  <td key={m.id} className="p-4 font-bold text-brand-700 text-sm">
                    {m.academic_requirements.avg_cutoff_score} đ
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {onNavigateView && (
        <SmartNextAction
          currentView="compare"
          onNavigate={(view) => {
            if (onNavigateView) onNavigateView(view || "university_explorer");
          }}
          onAskCoach={() => onAskCoachAboutItem(activeUnis[0]?.university_name || "trường đại học")}
        />
      )}
    </div>
  );
}
