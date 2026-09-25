import React, { useState, useMemo } from "react";
import { StudentCareerProfile, SkillGapItem, GapCategory } from "@/lib/career-guidance/types";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { analyzeSkillGaps, getCareerExperiments } from "@/lib/career-guidance/skillGapEngine";
import { SmartNextAction } from "../common/SmartNextAction";
import {
  IconBarChart,
  IconBot,
  IconArrowRight,
  IconSparkles,
  IconCheck,
  IconAlertCircle,
  IconClock,
  IconTarget,
  IconBookOpen,
  IconAward,
  HcmuteBrandMark
} from "../common/CareerIcons";

interface SkillGapViewProps {
  profile: StudentCareerProfile;
  initialTargetCareerId?: string;
  onGoToRoadmap: () => void;
  onAskCoachAboutItem: (name: string) => void;
  onNavigateView?: (view: any) => void;
}

export function SkillGapView({
  profile,
  initialTargetCareerId,
  onGoToRoadmap,
  onAskCoachAboutItem,
  onNavigateView
}: SkillGapViewProps) {
  const [targetCareerId, setTargetCareerId] = useState<string>(
    initialTargetCareerId || CAREERS_DATA[0].id
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [addedRoadmapTasks, setAddedRoadmapTasks] = useState<string[]>([]);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const targetCareer = useMemo(() => {
    return CAREERS_DATA.find((c) => c.id === targetCareerId) || CAREERS_DATA[0];
  }, [targetCareerId]);

  const allSkillGaps = useMemo(() => {
    return analyzeSkillGaps(targetCareer, profile);
  }, [targetCareer, profile]);

  const filteredGaps = useMemo(() => {
    if (selectedCategory === "ALL") return allSkillGaps;
    return allSkillGaps.filter((g) => g.category === selectedCategory);
  }, [allSkillGaps, selectedCategory]);

  const experiments = useMemo(() => {
    return getCareerExperiments(targetCareer.id);
  }, [targetCareer]);

  const handleAddToRoadmap = (gap: SkillGapItem) => {
    if (!addedRoadmapTasks.includes(gap.skill_name)) {
      setAddedRoadmapTasks((prev) => [...prev, gap.skill_name]);
      setFeedbackToast(`Đã thêm nhiệm vụ bồi dưỡng "${gap.skill_name}" vào Lộ trình cá nhân!`);
      setTimeout(() => setFeedbackToast(null), 3500);
    }
  };

  const categoriesList: { id: string; label: string }[] = [
    { id: "ALL", label: "Tất cả khoảng trống" },
    { id: "knowledge", label: "Kiến thức chuyên môn" },
    { id: "skills", label: "Kỹ năng kỹ thuật" },
    { id: "experience", label: "Kinh nghiệm thực hành" },
    { id: "portfolio", label: "Portfolio sản phẩm" },
    { id: "certification", label: "Chứng chỉ quốc tế" },
    { id: "language", label: "Ngoại ngữ chuyên ngành" },
    { id: "academic", label: "Học vấn & Toán/Logic" }
  ];

  const categoryBadge = (cat?: GapCategory) => {
    switch (cat) {
      case "knowledge":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Kiến thức (Knowledge)</span>;
      case "skills":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-800 border border-brand-200">Kỹ năng (Skills)</span>;
      case "experience":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">Kinh nghiệm (Experience)</span>;
      case "portfolio":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">Portfolio (Dự án)</span>;
      case "certification":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Chứng chỉ (Certification)</span>;
      case "language":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">Ngoại ngữ (Language)</span>;
      case "academic":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">Học vấn (Academic)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-soft text-ink-700 border border-line">Năng lực</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-20 right-6 z-50 rounded-[12px] bg-emerald-600 text-white px-4 py-2.5 shadow-lift text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <IconCheck className="w-4 h-4 text-white" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Header & Target Career Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line bg-surface p-5 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-[11px] font-bold text-brand-700 mb-1">
            <IconBarChart className="w-3.5 h-3.5 text-brand-600" />
            <span>Chặng 08 • Gap Analysis & Career Experiments</span>
          </div>
          <h1 className="text-xl font-bold text-ink-900 tracking-tight">
            Phân Tích Khoảng Trống Năng Lực (Skill Gap Analysis)
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Đối chiếu chi tiết giữa Hồ sơ năng lực hiện tại với chuẩn mực tuyển dụng của vị trí mục tiêu theo 7 nhóm tiêu chuẩn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-ink-600">Nghề mục tiêu:</label>
          <select
            value={targetCareerId}
            onChange={(e) => setTargetCareerId(e.target.value)}
            className="rounded-[10px] border border-line bg-surface p-2 text-xs font-bold text-brand-700 focus:outline-hidden"
          >
            {CAREERS_DATA.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CURRENT PROFILE vs TARGET ROLE Banner */}
      <div className="rounded-[14px] border border-brand-300 bg-gradient-to-r from-brand-50/70 via-surface to-brand-50/40 p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase text-brand-700">
              <span className="bg-surface px-2.5 py-0.5 rounded border border-brand-200">
                CURRENT PROFILE
              </span>
              <span>vs</span>
              <span className="bg-brand-600 text-white px-2.5 py-0.5 rounded shadow-xs">
                TARGET ROLE
              </span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <h2 className="text-xl font-extrabold text-ink-900">
                {profile.profile_archetype.title}
              </h2>
              <span className="text-sm text-ink-400 font-medium">hướng tới</span>
              <h3 className="text-xl font-extrabold text-brand-700">
                {targetCareer.name}
              </h3>
            </div>
            <p className="text-xs text-ink-600 italic">
              &ldquo;{targetCareer.tagline}&rdquo;
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAskCoachAboutItem(targetCareer.name)}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink-800 hover:bg-brand-50 hover:text-brand-700 transition"
            >
              <IconBot className="w-3.5 h-3.5 text-brand-600" />
              <span>Hỏi AI Coach về bộ kỹ năng này</span>
            </button>
            <button
              onClick={onGoToRoadmap}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-xs transition"
            >
              <span>Xem Lộ trình khắc phục</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 7 Categories Filter Tabs */}
        <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-line/70">
          {categoriesList.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-[8px] px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-surface border border-line text-ink-700 hover:bg-brand-50"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gap Matrix Cards */}
        <section className="rounded-[14px] border border-line bg-surface p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
                <IconBarChart className="w-4 h-4 text-brand-600" />
                <span>Khoảng Trống Năng Lực (Gap Breakdown)</span>
              </h2>
              <p className="text-xs text-ink-500">
                Hiển thị {filteredGaps.length} khoảng trống cần bồi dưỡng để tiệm cận chuẩn tuyển dụng.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-[6px] border border-brand-200">
              {allSkillGaps.filter((g) => g.priority === "HIGH").length} Ưu tiên Cao
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredGaps.map((gapItem, idx) => {
              const isAdded = addedRoadmapTasks.includes(gapItem.skill_name);
              return (
                <div
                  key={idx}
                  className="rounded-[12px] border border-line bg-surface-soft p-4 space-y-2.5 hover:border-brand-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {categoryBadge(gapItem.category)}
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-[6px] ${
                            gapItem.priority === "HIGH"
                              ? "bg-accent-red-50 text-accent-red-800 border border-accent-red-200"
                              : gapItem.priority === "MEDIUM"
                              ? "bg-brand-50 text-brand-800 border border-brand-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          Ưu tiên: {gapItem.priority} (Thiếu: {gapItem.gap}đ)
                        </span>
                      </div>
                      <h3 className="font-extrabold text-xs sm:text-sm text-ink-900 mt-1">
                        {gapItem.skill_name}
                      </h3>
                    </div>

                    {/* CTA: Thêm vào lộ trình */}
                    <button
                      onClick={() => handleAddToRoadmap(gapItem)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-xs font-bold transition shrink-0 ${
                        isAdded
                          ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                          : "bg-brand-600 text-white hover:bg-brand-700 shadow-xs"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <IconCheck className="w-3.5 h-3.5" />
                          <span>Đã thêm</span>
                        </>
                      ) : (
                        <span>+ Thêm vào lộ trình</span>
                      )}
                    </button>
                  </div>

                  {/* CURRENT vs TARGET comparison */}
                  <div className="space-y-1 rounded-[8px] bg-surface p-2.5 border border-line">
                    <div className="flex justify-between text-[11px] text-ink-600">
                      <span>
                        Hiện tại (Current):{" "}
                        <strong className="text-ink-900 font-bold">
                          {gapItem.current_text || `${gapItem.current_level}đ`}
                        </strong>
                      </span>
                      <span>
                        Mục tiêu (Target):{" "}
                        <strong className="text-brand-700 font-bold">
                          {gapItem.target_text || `${gapItem.target_level}đ`}
                        </strong>
                      </span>
                    </div>

                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-soft border border-line/60">
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-brand-600 rounded-full"
                        style={{ width: `${gapItem.current_level}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 bg-accent-red-500 opacity-60"
                        style={{
                          left: `${gapItem.current_level}%`,
                          width: `${gapItem.gap}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Effort & Evidence */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-ink-600">
                      <IconClock className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                      <span>
                        Thời lượng ước tính (Effort):{" "}
                        <strong className="text-ink-800">{gapItem.effort || "20 giờ"}</strong>
                      </span>
                    </div>
                    <div className="text-ink-500 italic">
                      <span>Căn cứ (Evidence): {gapItem.evidence}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-ink-700 pt-1 border-t border-line/60 flex items-start gap-1.5">
                    <IconSparkles className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                    <span>{gapItem.actionable_recommendation}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3 Career Experiments (Thử nghiệm vi mô) */}
        <section className="rounded-[14px] border border-line bg-surface p-6 shadow-soft space-y-4">
          <div>
            <h2 className="text-base font-bold text-ink-900 flex items-center gap-2">
              <IconTarget className="w-4 h-4 text-brand-600" />
              <span>3 Thử Nghiệm Nghề Nghiệp Vi Mô (Career Experiments)</span>
            </h2>
            <p className="text-xs text-ink-500">
              Trước khi quyết định dấn thân 4 năm đại học, hãy dành 2 – 4 giờ thực hiện các thử nghiệm vi mô để kiểm chứng sở thích thực tế.
            </p>
          </div>

          <div className="space-y-3.5">
            {experiments.map((exp, idx) => (
              <div
                key={exp.id}
                className="rounded-[12px] border border-line bg-surface-soft p-4 space-y-2 hover:border-brand-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-[6px] bg-brand-50 border border-brand-200 text-brand-700 font-bold px-2.5 py-0.5 text-xs">
                    Thử nghiệm #{idx + 1}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-600 bg-surface px-2.5 py-0.5 rounded-[6px] border border-line">
                    <IconClock className="w-3 h-3 text-ink-500" />
                    <span>{exp.time_commitment}</span>
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

                <div className="rounded-[8px] bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] text-emerald-900 flex items-start gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Dấu hiệu bạn thực sự hợp nghề: </strong>
                    <span>{exp.success_criteria}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <SmartNextAction
        currentView="skill_gap"
        onNavigate={onNavigateView || onGoToRoadmap}
        onAskCoach={() => onAskCoachAboutItem(targetCareer.name)}
        customTitle="Chuyển khoảng trống thành Lộ trình 5 chặng hành động?"
        customDesc="Hệ thống đã chuẩn bị sẵn các bài học, chứng chỉ và đồ án tương ứng cho từng thiếu hụt của bạn."
      />
    </div>
  );
}
