import React, { useState, useMemo } from "react";
import { StudentCareerProfile } from "@/lib/career-guidance/types";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { analyzeSkillGaps, getCareerExperiments } from "@/lib/career-guidance/skillGapEngine";

interface SkillGapViewProps {
  profile: StudentCareerProfile;
  initialTargetCareerId?: string;
  onGoToRoadmap: () => void;
  onAskCoachAboutItem: (name: string) => void;
}

export function SkillGapView({
  profile,
  initialTargetCareerId,
  onGoToRoadmap,
  onAskCoachAboutItem
}: SkillGapViewProps) {
  const [targetCareerId, setTargetCareerId] = useState<string>(
    initialTargetCareerId || CAREERS_DATA[0].id
  );

  const targetCareer = useMemo(() => {
    return CAREERS_DATA.find((c) => c.id === targetCareerId) || CAREERS_DATA[0];
  }, [targetCareerId]);

  const skillGaps = useMemo(() => {
    return analyzeSkillGaps(targetCareer, profile);
  }, [targetCareer, profile]);

  const experiments = useMemo(() => {
    return getCareerExperiments(targetCareer.id);
  }, [targetCareer]);

  return (
    <div className="space-y-6">
      {/* Header & Target Career Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            Phân Tích Khoảng Trống Kỹ Năng & Thử Nghiệm Nghề (Skill Gap & Experiments)
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Đối chiếu năng lực hiện tại của bạn với tiêu chuẩn tuyển dụng và thực hiện 3 bài thử nghiệm vi mô để kiểm chứng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-ink-600">Nghề mục tiêu:</label>
          <select
            value={targetCareerId}
            onChange={(e) => setTargetCareerId(e.target.value)}
            className="rounded-xl border border-line bg-surface p-2 text-xs font-bold text-brand-700 focus:outline-hidden"
          >
            {CAREERS_DATA.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Career Banner */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
            Đang phân tích cho vị trí
          </span>
          <h2 className="text-xl font-extrabold text-ink-900 mt-0.5">{targetCareer.name}</h2>
          <p className="text-xs text-ink-600 mt-1 italic">"{targetCareer.tagline}"</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAskCoachAboutItem(targetCareer.name)}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink-800 hover:bg-brand-50"
          >
            💬 Hỏi AI Coach về kỹ năng này
          </button>
          <button
            onClick={onGoToRoadmap}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-xs"
          >
            Xem Lộ trình khắc phục →
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skill Gap Matrix */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink-900">
              📊 Khoảng Trống Năng Lực (Current vs Target)
            </h2>
            <p className="text-xs text-ink-500">
              Màu đỏ biểu thị khoảng thiếu hụt lớn cần ưu tiên bù đắp trong lộ trình học tập.
            </p>
          </div>

          <div className="space-y-4">
            {skillGaps.map((gapItem, idx) => (
              <div key={idx} className="rounded-xl border border-line bg-surface-soft p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-ink-900">{gapItem.skill_name}</span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      gapItem.priority === "HIGH"
                        ? "bg-rose-100 text-rose-800"
                        : gapItem.priority === "MEDIUM"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    Ưu tiên: {gapItem.priority} (Thiếu: {gapItem.gap}đ)
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-ink-500">
                    <span>Hiện tại: {gapItem.current_level}đ</span>
                    <span>Chuẩn nghề: {gapItem.target_level}đ</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-brand-600 rounded-full"
                      style={{ width: `${gapItem.current_level}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 bg-amber-400 opacity-60"
                      style={{
                        left: `${gapItem.current_level}%`,
                        width: `${gapItem.gap}%`
                      }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-ink-600 italic">
                  💡 {gapItem.actionable_recommendation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3 Career Experiments (Section 41) */}
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
              <span>🧪</span> 3 Thử Nghiệm Nghề Nghiệp Vi Mô (Career Experiments)
            </h2>
            <p className="text-xs text-ink-500">
              Trước khi quyết định dấn thân 4 năm đại học, hãy dành vài giờ thực hiện các bài test thực tế này.
            </p>
          </div>

          <div className="space-y-4">
            {experiments.map((exp, idx) => (
              <div
                key={exp.id}
                className="rounded-2xl border border-line bg-surface-soft p-4 space-y-2 hover:border-brand-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-brand-100 text-brand-700 font-bold px-2 py-0.5 text-xs">
                    Thử nghiệm #{idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-ink-500 bg-surface px-2 py-0.5 rounded-md border border-line">
                    ⏱️ {exp.time_commitment}
                  </span>
                </div>

                <h3 className="font-bold text-ink-900 text-sm">{exp.title}</h3>
                <p className="text-xs text-ink-600 leading-relaxed">
                  <strong className="text-ink-800">Mục đích: </strong>
                  {exp.objective}
                </p>

                <div className="space-y-1 text-xs text-ink-700 pt-1">
                  <strong className="text-ink-900 block text-[11px] uppercase tracking-wider">
                    Các bước thực hiện:
                  </strong>
                  <ul className="space-y-1 list-disc list-inside text-ink-600">
                    {exp.steps.map((st, sIdx) => (
                      <li key={sIdx}>{st}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] text-emerald-900">
                  <strong>Dấu hiệu bạn thực sự hợp nghề: </strong>
                  {exp.success_criteria}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
