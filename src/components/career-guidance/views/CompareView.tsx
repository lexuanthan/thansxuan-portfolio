import React, { useState } from "react";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { MAJORS_DATA } from "@/lib/career-guidance/majorsData";
import { CareerMatchResult, MajorMatchResult } from "@/lib/career-guidance/types";

interface CompareViewProps {
  careerMatches: CareerMatchResult[];
  majorMatches: MajorMatchResult[];
  onAskCoachAboutItem: (name: string) => void;
}

export function CompareView({
  careerMatches,
  majorMatches,
  onAskCoachAboutItem
}: CompareViewProps) {
  const [compareType, setCompareType] = useState<"career" | "major">("career");
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

  const activeCareers = CAREERS_DATA.filter((c) => selectedCareerIds.includes(c.id));
  const activeMajors = MAJORS_DATA.filter((m) => selectedMajorIds.includes(m.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            Trung Tâm So Sánh Đa Chiều (Comparison Center)
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Đặt tối đa 3 lựa chọn lên bàn cân để phân tích trực diện điểm khác biệt về đặc thù, mức lương và độ khó.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setCompareType("career")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              compareType === "career"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-surface-soft text-ink-700 hover:bg-brand-50"
            }`}
          >
            💼 So sánh Nghề nghiệp
          </button>
          <button
            onClick={() => setCompareType("major")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              compareType === "major"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-surface-soft text-ink-700 hover:bg-brand-50"
            }`}
          >
            🎓 So sánh Ngành học
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="rounded-2xl border border-line bg-surface-soft p-4">
        <span className="text-xs font-bold text-ink-600 block mb-2">
          Chọn tối đa 3 mục để so sánh:
        </span>
        <div className="flex flex-wrap gap-2">
          {compareType === "career"
            ? CAREERS_DATA.map((c) => {
                const active = selectedCareerIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCareer(c.id)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-surface border border-line text-ink-700 hover:border-brand-300"
                    }`}
                  >
                    {active ? "✓ " : "+ "}
                    {c.name}
                  </button>
                );
              })
            : MAJORS_DATA.map((m) => {
                const active = selectedMajorIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMajor(m.id)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? "bg-brand-600 text-white shadow-xs"
                        : "bg-surface border border-line text-ink-700 hover:border-brand-300"
                    }`}
                  >
                    {active ? "✓ " : "+ "}
                    {m.name}
                  </button>
                );
              })}
        </div>
      </div>

      {/* Career Comparison Matrix */}
      {compareType === "career" && (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-soft">
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
                    {c.salary_range.entry_level_million} - {c.salary_range.senior_level_million} tr/tháng
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
                      className={`font-bold px-2 py-0.5 rounded-md ${
                        c.ai_impact.automation_exposure === "Thấp"
                          ? "bg-emerald-100 text-emerald-800"
                          : c.ai_impact.automation_exposure === "Trung bình"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
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
                      className="rounded-xl border border-line bg-amber-50 px-3 py-1.5 font-bold text-amber-900 hover:bg-amber-100 transition"
                    >
                      💬 Hỏi AI về nghề này
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
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-soft">
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
                    {m.difficulty_level}
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
    </div>
  );
}
