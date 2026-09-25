import React, { useState, useMemo } from "react";
import { PersonalRoadmap, StudentCareerProfile, TimeHorizon, TaskStatus, ActiveView } from "@/lib/career-guidance/types";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import {
  generatePersonalRoadmap,
  PROGRESSION_STAGES,
  TIME_HORIZONS,
  optimizeRoadmapWithAI
} from "@/lib/career-guidance/roadmapEngine";
import { SmartNextAction } from "../common/SmartNextAction";
import {
  IconMap,
  IconCheck,
  IconClock,
  IconBot,
  IconSparkles,
  IconAward
} from "../common/CareerIcons";

interface RoadmapViewProps {
  profile: StudentCareerProfile;
  currentRoadmap: PersonalRoadmap | null;
  onUpdateRoadmap: (roadmap: PersonalRoadmap) => void;
  onAskCoachAboutItem: (name: string) => void;
  onNavigateView?: (view: ActiveView) => void;
}

export function RoadmapView({
  profile,
  currentRoadmap,
  onUpdateRoadmap,
  onAskCoachAboutItem,
  onNavigateView
}: RoadmapViewProps) {
  // Khởi tạo lộ trình nếu chưa có
  const initialRoadmap = useMemo(() => {
    if (currentRoadmap) return currentRoadmap;
    return generatePersonalRoadmap(CAREERS_DATA[0], profile);
  }, [currentRoadmap, profile]);

  const [roadmap, setRoadmap] = useState<PersonalRoadmap>(initialRoadmap);
  const [prevPropRoadmap, setPrevPropRoadmap] = useState(currentRoadmap);
  const [activeHorizon, setActiveHorizon] = useState<TimeHorizon>("30_days");

  // Adjust state during render when currentRoadmap prop updates
  if (currentRoadmap !== prevPropRoadmap) {
    setPrevPropRoadmap(currentRoadmap);
    if (currentRoadmap) {
      setRoadmap(currentRoadmap);
    }
  }

  // AI Roadmap Optimization state
  const [isAiOptimizeModalOpen, setIsAiOptimizeModalOpen] = useState(false);
  const [availableHours, setAvailableHours] = useState(profile.user_context?.weekly_learning_hours || 15);
  const [aiOptimizeSuccessMessage, setAiOptimizeSuccessMessage] = useState<string | null>(null);

  const totalTasks = useMemo(() => {
    return roadmap.stages.reduce((acc, stage) => acc + stage.tasks.length, 0);
  }, [roadmap]);

  const completedTasks = useMemo(() => {
    return roadmap.stages.reduce(
      (acc, stage) => acc + stage.tasks.filter((t) => t.completed).length,
      0
    );
  }, [roadmap]);

  const completionPercent = Math.round((completedTasks / (totalTasks || 1)) * 100);

  const toggleTask = (stageId: string, taskId: string) => {
    const updatedStages = roadmap.stages.map((stage) => {
      if (stage.stage_id === stageId) {
        return {
          ...stage,
          tasks: stage.tasks.map((t) => {
            if (t.id === taskId) {
              const nextCompleted = !t.completed;
              return {
                ...t,
                completed: nextCompleted,
                status: (nextCompleted ? "completed" : "in_progress") as TaskStatus
              };
            }
            return t;
          })
        };
      }
      return stage;
    });

    const updatedRoadmap = { ...roadmap, stages: updatedStages };
    setRoadmap(updatedRoadmap);
    onUpdateRoadmap(updatedRoadmap);
  };

  const handleChangeTargetCareer = (careerId: string) => {
    const target = CAREERS_DATA.find((c) => c.id === careerId) || CAREERS_DATA[0];
    const newRoadmap = generatePersonalRoadmap(target, profile);
    setRoadmap(newRoadmap);
    onUpdateRoadmap(newRoadmap);
  };

  const handleApplyAiOptimization = () => {
    const { optimizedRoadmap, optimizationSummary } = optimizeRoadmapWithAI(
      roadmap,
      availableHours,
      profile
    );
    setRoadmap(optimizedRoadmap);
    onUpdateRoadmap(optimizedRoadmap);
    setAiOptimizeSuccessMessage(optimizationSummary);
    setTimeout(() => {
      setIsAiOptimizeModalOpen(false);
      setAiOptimizeSuccessMessage(null);
    }, 2000);
  };

  const statusBadge = (status?: TaskStatus, completed?: boolean) => {
    if (completed || status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 rounded-[6px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
          <IconCheck className="w-3 h-3 text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    }
    if (status === "in_progress") {
      return (
        <span className="inline-flex items-center gap-1 rounded-[6px] bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-extrabold text-brand-800">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse"></span>
          <span>In Progress</span>
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 rounded-[6px] bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
          <span>Pending</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-[6px] bg-surface-soft border border-line px-2 py-0.5 text-[10px] font-bold text-ink-400">
        <span>Locked</span>
      </span>
    );
  };

  // Lọc giai đoạn theo Time Horizon được chọn
  const activeStage = useMemo(() => {
    return (
      roadmap.stages.find((s) => s.time_horizon === activeHorizon || s.stage_id === activeHorizon) ||
      roadmap.stages[0]
    );
  }, [roadmap, activeHorizon]);

  return (
    <div className="space-y-6">
      {/* Header & Target Career Selector */}
      <div className="rounded-[14px] border border-line bg-surface p-5 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-[11px] font-bold text-brand-700 mb-1">
              <IconMap className="w-3.5 h-3.5 text-brand-600" />
              <span>Chặng 09 • Career Progression Map</span>
            </div>
            <h1 className="text-xl font-bold text-ink-900 tracking-tight">
              Lộ Trình Hành Động Cá Nhân Hóa (Career Progression Map)
            </h1>
            <p className="text-xs text-ink-500 mt-0.5">
              Lộ trình hành động được thiết kế dưới dạng Progression Map gồm 7 chặng phát triển năng lực và 5 mốc thời gian cụ thể cho vị trí:{" "}
              <strong className="text-brand-700 font-bold">{roadmap.target_career_name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* CTA: AI tối ưu lộ trình */}
            <button
              onClick={() => setIsAiOptimizeModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition"
            >
              <IconSparkles className="w-3.5 h-3.5" />
              <span>AI tối ưu lộ trình</span>
            </button>

            <div className="flex items-center gap-2 rounded-[10px] border border-line bg-surface-soft p-1.5">
              <label className="text-xs font-bold text-ink-600 pl-1">Mục tiêu:</label>
              <select
                value={roadmap.target_career_id}
                onChange={(e) => handleChangeTargetCareer(e.target.value)}
                className="rounded-[8px] border border-line bg-surface p-1.5 text-xs font-bold text-brand-700 focus:outline-hidden"
              >
                {CAREERS_DATA.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Progress Bar & Summary */}
        <div className="rounded-[12px] bg-surface-soft p-4 border border-line space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-ink-800">
              Tổng quan tiến độ thực thi: {completedTasks} / {totalTasks} nhiệm vụ hoàn tất
            </span>
            <span className="font-extrabold text-brand-700 text-sm">
              {completionPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* CAREER PROGRESSION MAP VISUAL (Discover → Learn → Build → Practice → Experience → Validate → Apply) */}
        <div className="pt-2 border-t border-line space-y-2">
          <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider block">
            Chuỗi tiến trình nghề nghiệp (Progression Flow):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {PROGRESSION_STAGES.map((ps, idx) => {
              const isCurrent = activeStage?.progression_stage === ps.id;
              return (
                <div
                  key={ps.id}
                  className={`rounded-[10px] p-2.5 text-center border transition ${
                    isCurrent
                      ? "border-brand-500 bg-brand-50/50 shadow-xs ring-1 ring-brand-500/30"
                      : "border-line bg-surface hover:bg-surface-soft"
                  }`}
                >
                  <span className="text-base block mb-0.5">{ps.icon}</span>
                  <span className="text-[10px] text-ink-400 font-bold block">Bước 0{idx + 1}</span>
                  <strong className="text-xs text-ink-900 block font-extrabold">{ps.label}</strong>
                </div>
              );
            })}
          </div>
        </div>

        {/* TIME HORIZON TABS (30 days, 90 days, 6 months, 12 months, 1–3 years) */}
        <div className="pt-3 border-t border-line flex flex-wrap gap-2">
          {TIME_HORIZONS.map((th) => {
            const active = activeHorizon === th.id;
            return (
              <button
                key={th.id}
                onClick={() => setActiveHorizon(th.id)}
                className={`rounded-[10px] px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                  active
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-surface-soft border border-line text-ink-700 hover:bg-brand-50"
                }`}
              >
                <IconClock className="w-3.5 h-3.5" />
                <span>{th.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${active ? "bg-white/20 text-white" : "bg-line text-ink-500"}`}>
                  {th.durationLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE STAGE TASKS & NODES */}
      <div className="rounded-[14px] border border-line bg-surface p-6 shadow-soft space-y-5">
        <div className="border-b border-line pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                Mốc thời gian: {TIME_HORIZONS.find((t) => t.id === activeHorizon)?.label}
              </span>
              <span className="text-xs text-ink-500">
                Giai đoạn: <strong>{activeStage?.progression_stage?.toUpperCase()}</strong>
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-ink-900 mt-1">
              {activeStage?.title}
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">{activeStage?.tagline}</p>
          </div>

          <button
            onClick={() => onAskCoachAboutItem(activeStage?.title || "lộ trình")}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface-soft px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition"
          >
            <IconBot className="w-3.5 h-3.5 text-brand-600" />
            <span>Hỏi AI Coach về chặng này</span>
          </button>
        </div>

        {/* NODES CONTAINER (Task, Duration, Status, Dependency, Outcome) */}
        <div className="space-y-3.5">
          {activeStage?.tasks.map((task, idx) => {
            return (
              <div
                key={task.id}
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== "INPUT") {
                    toggleTask(activeStage.stage_id, task.id);
                  }
                }}
                className={`rounded-[12px] border p-4 cursor-pointer transition-all ${
                  task.completed
                    ? "border-emerald-300 bg-emerald-50/30"
                    : "border-line bg-surface hover:border-brand-300 shadow-soft"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(activeStage.stage_id, task.id)}
                    className="mt-1 h-4 w-4 rounded-[4px] accent-emerald-600 cursor-pointer shrink-0"
                  />

                  <div className="flex-1 space-y-2">
                    {/* Node Header: Task, Duration, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink-400">Node 0{idx + 1}</span>
                        <h3
                          className={`font-extrabold text-sm ${
                            task.completed ? "line-through text-ink-400" : "text-ink-900"
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-600 bg-surface-soft px-2.5 py-0.5 rounded border border-line">
                          <IconClock className="w-3 h-3 text-ink-400" />
                          <span>Thời lượng: {task.duration || task.estimated_effort}</span>
                        </span>
                        {statusBadge(task.status, task.completed)}
                      </div>
                    </div>

                    <p className={`text-xs leading-relaxed ${task.completed ? "text-ink-400" : "text-ink-600"}`}>
                      {task.description}
                    </p>

                    {/* Dependency & Outcome */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-line/60 text-[11px]">
                      <div className="flex items-start gap-1 text-ink-600">
                        <strong className="text-ink-700 whitespace-nowrap">Tiên quyết (Dependency):</strong>{" "}
                        <span className="text-ink-500">{task.dependency || "Không có (Có thể thực hiện song song)"}</span>
                      </div>
                      <div className="flex items-start gap-1 text-emerald-900">
                        <IconAward className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">Đầu ra cụ thể (Outcome):</strong>{" "}
                          <span>{task.outcome || "Bản sản phẩm hoặc kiến thức đã được kiểm chứng."}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI OPTIMIZATION MODAL (AI tối ưu lộ trình) */}
      {isAiOptimizeModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-xl rounded-[16px] border border-line bg-surface p-6 shadow-lift space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <IconSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-900">
                    AI Tối Ưu Hóa Lộ Trình Cá Nhân
                  </h3>
                  <p className="text-xs text-ink-500">
                    Thuật toán điều phối thời gian dựa trên mục tiêu, khoảng trống kỹ năng và thời gian khả dụng
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAiOptimizeModalOpen(false)}
                aria-label="Đóng"
                className="rounded-[8px] p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-700"
              >
                ✕
              </button>
            </div>

            {/* Inputs & Parameters */}
            <div className="space-y-4 text-xs text-ink-800">
              <div className="rounded-[10px] bg-surface-soft p-3.5 border border-line space-y-2">
                <span className="font-bold text-ink-900 block">
                  Các tham số AI đang tiếp nhận để tối ưu:
                </span>
                <ul className="space-y-1 list-disc pl-4 text-ink-700">
                  <li>
                    <strong>Mục tiêu:</strong> {roadmap.target_career_name}
                  </li>
                  <li>
                    <strong>Khoảng trống năng lực (Gaps):</strong> Ưu tiên bù đắp các kỹ năng thiếu hụt mức HIGH
                  </li>
                  <li>
                    <strong>Hồ sơ người dùng:</strong> Hình mẫu {profile.profile_archetype?.title || "Strategic Builder"}
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-ink-900">
                    Thời gian khả dụng mỗi tuần (Available Time):
                  </label>
                  <span className="font-extrabold text-brand-700 text-sm">
                    {availableHours} giờ / tuần
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="5"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(parseInt(e.target.value) || 15)}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-ink-400">
                  <span>5h (Vừa học THPT)</span>
                  <span>15h (Tiêu chuẩn)</span>
                  <span>35h (Toàn thời gian)</span>
                </div>
              </div>

              {aiOptimizeSuccessMessage && (
                <div className="rounded-[10px] bg-emerald-50 border border-emerald-300 p-3 text-emerald-900 text-xs">
                  <strong className="block font-bold mb-1">✓ Đã tối ưu thành công:</strong>
                  <p className="whitespace-pre-line">{aiOptimizeSuccessMessage}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <button
                onClick={() => setIsAiOptimizeModalOpen(false)}
                className="rounded-[10px] border border-line bg-surface px-4 py-2 text-xs font-bold text-ink-700 hover:bg-surface-soft"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyAiOptimization}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition"
              >
                <IconSparkles className="w-3.5 h-3.5" />
                <span>Áp dụng tối ưu hóa ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {onNavigateView && (
        <SmartNextAction
          currentView="roadmap"
          onNavigate={(view) => {
            if (onNavigateView) onNavigateView(view || "ai_coach");
          }}
          onAskCoach={() => onAskCoachAboutItem(roadmap.target_career_name)}
          customTitle="Trao đổi thêm về lộ trình cùng AI Coach"
          customDesc="AI Coach có thể điều chỉnh tiến độ chi tiết và gợi ý tài liệu học tập chuẩn HCMUTE."
        />
      )}
    </div>
  );
}
