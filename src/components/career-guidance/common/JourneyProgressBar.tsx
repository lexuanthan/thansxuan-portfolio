"use client";

import React from "react";
import { ActiveView } from "../CareerGuidanceApp";
import {
  IconCompass,
  IconDna,
  IconTarget,
  IconBriefcase,
  IconGraduationCap,
  IconUniversity,
  IconScale,
  IconBarChart,
  IconMap,
  IconBot,
  IconCheck,
  IconLock,
  IconZap
} from "./CareerIcons";

export interface JourneyStepConfig {
  id: ActiveView;
  number: string;
  title: string;
  shortLabel: string;
  icon: React.ReactNode;
  xpReward: number;
}

export const JOURNEY_STEPS: JourneyStepConfig[] = [
  { id: "assessment", number: "01", title: "Khám phá bản thân", shortLabel: "Khám phá", icon: <IconCompass className="w-4 h-4" />, xpReward: 100 },
  { id: "profile", number: "02", title: "Career DNA", shortLabel: "Career DNA", icon: <IconDna className="w-4 h-4" />, xpReward: 50 },
  { id: "matches", number: "03", title: "Kết quả khớp", shortLabel: "So khớp", icon: <IconTarget className="w-4 h-4" />, xpReward: 50 },
  { id: "career_explorer", number: "04", title: "Khám phá nghề", shortLabel: "80+ Nghề", icon: <IconBriefcase className="w-4 h-4" />, xpReward: 30 },
  { id: "major_explorer", number: "05", title: "Khám phá ngành", shortLabel: "60+ Ngành", icon: <IconGraduationCap className="w-4 h-4" />, xpReward: 30 },
  { id: "university_explorer", number: "06", title: "Chọn trường ĐH", shortLabel: "100+ Trường", icon: <IconUniversity className="w-4 h-4" />, xpReward: 30 },
  { id: "compare", number: "07", title: "So sánh lựa chọn", shortLabel: "So sánh", icon: <IconScale className="w-4 h-4" />, xpReward: 40 },
  { id: "skill_gap", number: "08", title: "Khoảng trống", shortLabel: "Khoảng trống", icon: <IconBarChart className="w-4 h-4" />, xpReward: 40 },
  { id: "roadmap", number: "09", title: "Lộ trình 5 chặng", shortLabel: "Lộ trình", icon: <IconMap className="w-4 h-4" />, xpReward: 60 },
  { id: "coach", number: "10", title: "AI Coach", shortLabel: "AI Coach", icon: <IconBot className="w-4 h-4" />, xpReward: 50 }
];

export type StepState = "completed" | "current" | "available" | "recommended" | "locked";

interface JourneyProgressBarProps {
  activeView: ActiveView;
  onSelectStep: (step: ActiveView) => void;
  completedSteps?: string[];
  totalXp?: number;
}

export function JourneyProgressBar({
  activeView,
  onSelectStep,
  completedSteps = [],
  totalXp = 250
}: JourneyProgressBarProps) {
  const currentIndex = JOURNEY_STEPS.findIndex((s) => s.id === activeView);

  return (
    <div className="w-full rounded-[14px] border border-line bg-surface/95 backdrop-blur-xs p-3 sm:p-4 shadow-soft">
      {/* Header bar: Journey title + Progress % + XP */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-brand-600 text-white shadow-xs">
            <IconCompass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-700 block leading-tight">
              Hành trình nghề nghiệp 10 chặng
            </span>
            <span className="text-xs font-bold text-ink-900 hidden sm:inline">
              HCMUTE Career Decision Intelligence Quest
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[11px] font-black text-brand-900">
            <IconZap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{totalXp} XP</span>
          </span>
          <span className="text-xs font-bold text-ink-600">
            {currentIndex >= 0 ? `Chặng ${currentIndex + 1}/10` : "Tổng quan"}
          </span>
        </div>
      </div>

      {/* Steps horizontal tracker */}
      <div className="relative flex items-center justify-between gap-1 overflow-x-auto pb-1 pt-1 scrollbar-none">
        {/* Background track line */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-line -z-0 hidden md:block" />

        {JOURNEY_STEPS.map((step, idx) => {
          const isCurrent = activeView === step.id;
          const isCompleted = completedSteps.includes(step.id) || (currentIndex > idx && currentIndex !== -1);
          const isRecommended = !isCompleted && !isCurrent && (currentIndex + 1 === idx || (idx === 2 && completedSteps.includes("assessment")));

          let state: StepState = "available";
          if (isCurrent) state = "current";
          else if (isCompleted) state = "completed";
          else if (isRecommended) state = "recommended";

          return (
            <button
              key={step.id}
              onClick={() => onSelectStep(step.id)}
              className={`group relative flex flex-col items-center gap-1.5 shrink-0 px-2 py-1.5 rounded-[10px] transition-all cursor-pointer ${
                isCurrent
                  ? "bg-brand-50/90 text-brand-950 ring-2 ring-brand-600 font-black shadow-xs"
                  : isRecommended
                  ? "bg-accent-red-50/50 text-ink-800 hover:bg-surface-soft ring-1 ring-accent-red-300"
                  : "hover:bg-surface-soft text-ink-600"
              }`}
              title={`${step.number}. ${step.title} (+${step.xpReward} XP)`}
            >
              {/* Step indicator node */}
              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-[8px] text-xs font-black transition-all ${
                  isCurrent
                    ? "bg-brand-600 text-white shadow-brand scale-105"
                    : isCompleted
                    ? "bg-emerald-600 text-white shadow-xs"
                    : isRecommended
                    ? "bg-surface border-2 border-accent-red-500 text-accent-red-600 group-hover:bg-accent-red-50"
                    : "bg-surface border border-line text-ink-500 group-hover:border-brand-400 group-hover:text-brand-700"
                }`}
              >
                {isCompleted ? <IconCheck className="w-4 h-4 stroke-[3]" /> : step.icon}
              </div>

              {/* Step Label */}
              <div className="flex flex-col items-center text-center">
                <span className="text-[10px] font-black text-ink-400 leading-none">
                  {step.number}
                </span>
                <span
                  className={`text-[11px] font-bold whitespace-nowrap leading-tight mt-0.5 ${
                    isCurrent
                      ? "text-brand-900"
                      : isCompleted
                      ? "text-emerald-700"
                      : isRecommended
                      ? "text-accent-red-700 font-extrabold"
                      : "text-ink-600"
                  }`}
                >
                  {step.shortLabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
