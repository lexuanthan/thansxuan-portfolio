import React, { useState, useMemo } from "react";
import { PersonalRoadmap, StudentCareerProfile, CareerDNA } from "@/lib/career-guidance/types";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { generatePersonalRoadmap } from "@/lib/career-guidance/roadmapEngine";

interface RoadmapViewProps {
  profile: StudentCareerProfile;
  currentRoadmap: PersonalRoadmap | null;
  onUpdateRoadmap: (roadmap: PersonalRoadmap) => void;
  onAskCoachAboutItem: (name: string) => void;
}

export function RoadmapView({
  profile,
  currentRoadmap,
  onUpdateRoadmap,
  onAskCoachAboutItem
}: RoadmapViewProps) {
  // Nếu chưa có lộ trình, mặc định lấy nghề đầu tiên
  const initialRoadmap = useMemo(() => {
    if (currentRoadmap) return currentRoadmap;
    return generatePersonalRoadmap(CAREERS_DATA[0], profile);
  }, [currentRoadmap, profile]);

  const [roadmap, setRoadmap] = useState<PersonalRoadmap>(initialRoadmap);
  const [activeStageId, setActiveStageId] = useState<string>("7_days");

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
              return { ...t, completed: !t.completed };
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

  const categoryBadges: Record<string, { label: string; color: string }> = {
    learn: { label: "Học tập", color: "bg-blue-100 text-blue-800" },
    practice: { label: "Thực hành", color: "bg-amber-100 text-amber-800" },
    project: { label: "Dự án", color: "bg-purple-100 text-purple-800" },
    certificate: { label: "Chứng chỉ", color: "bg-emerald-100 text-emerald-800" },
    experience: { label: "Trải nghiệm", color: "bg-indigo-100 text-indigo-800" },
    network: { label: "Kết nối", color: "bg-rose-100 text-rose-800" }
  };

  return (
    <div className="space-y-6">
      {/* Header & Overall Progress */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink-900">
              Lộ Trình Hành Động Cá Nhân Hóa (Personal Action Roadmap)
            </h1>
            <p className="text-xs text-ink-500 mt-0.5">
              Kế hoạch hành động 5 giai đoạn được may đo riêng cho vị trí mục tiêu của bạn.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-ink-600">Đổi mục tiêu:</label>
            <select
              value={roadmap.target_career_id}
              onChange={(e) => handleChangeTargetCareer(e.target.value)}
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

        {/* Progress bar */}
        <div className="rounded-xl bg-surface-soft p-4 border border-line">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-bold text-ink-800">
              Tiến độ hoàn thành: {completedTasks} / {totalTasks} nhiệm vụ
            </span>
            <span className="font-extrabold text-brand-600 text-sm">
              {completionPercent}%
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* 5 Stages Switcher */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-line">
          {roadmap.stages.map((stage) => {
            const active = activeStageId === stage.stage_id;
            const stageCompleted = stage.tasks.filter((t) => t.completed).length;
            return (
              <button
                key={stage.stage_id}
                onClick={() => setActiveStageId(stage.stage_id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-surface-soft text-ink-700 hover:bg-brand-50"
                }`}
              >
                <span>{stage.title}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-line text-ink-500"
                  }`}
                >
                  {stageCompleted}/{stage.tasks.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Tasks */}
      {roadmap.stages
        .filter((stage) => stage.stage_id === activeStageId)
        .map((stage) => (
          <div key={stage.stage_id} className="space-y-4">
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft space-y-4">
              <div className="border-b border-line pb-3">
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Chặng đang chọn
                </span>
                <h2 className="text-lg font-extrabold text-ink-900 mt-0.5">
                  {stage.title}
                </h2>
                <p className="text-xs text-ink-500 mt-0.5">{stage.tagline}</p>
              </div>

              <div className="space-y-3">
                {stage.tasks.map((task) => {
                  const badge = categoryBadges[task.category] || {
                    label: task.category,
                    color: "bg-slate-100 text-slate-800"
                  };
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(stage.stage_id, task.id)}
                      className={`flex items-start gap-3.5 rounded-2xl border p-4 cursor-pointer transition-all ${
                        task.completed
                          ? "border-emerald-300 bg-emerald-50/40 text-ink-500"
                          : "border-line bg-surface hover:border-brand-300 shadow-soft"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}} // Đã xử lý ở thẻ cha
                        className="mt-1 h-5 w-5 rounded-md accent-emerald-600 cursor-pointer"
                      />

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3
                            className={`font-bold text-sm ${
                              task.completed
                                ? "line-through text-ink-400"
                                : "text-ink-900"
                            }`}
                          >
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                            <span className="text-[11px] font-medium text-ink-400">
                              ⏱️ {task.estimated_effort}
                            </span>
                          </div>
                        </div>

                        <p
                          className={`text-xs leading-relaxed ${
                            task.completed ? "text-ink-400" : "text-ink-600"
                          }`}
                        >
                          {task.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
