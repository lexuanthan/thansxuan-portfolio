"use client";

import React from "react";
import {
  IconCompass,
  IconDna,
  IconTarget,
  IconBriefcase,
  IconScale,
  IconAward,
  IconZap
} from "./CareerIcons";

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  icon: React.ReactNode;
  badgeBg: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: "Người khám phá", minXp: 0, maxXp: 100, icon: <IconCompass className="w-4 h-4" />, badgeBg: "bg-slate-600 text-white" },
  { level: 2, title: "Người hiểu bản thân", minXp: 100, maxXp: 250, icon: <IconDna className="w-4 h-4" />, badgeBg: "bg-emerald-600 text-white" },
  { level: 3, title: "Người giải mã nghề nghiệp", minXp: 250, maxXp: 450, icon: <IconTarget className="w-4 h-4" />, badgeBg: "bg-brand-600 text-white" },
  { level: 4, title: "Người khám phá cơ hội", minXp: 450, maxXp: 700, icon: <IconBriefcase className="w-4 h-4" />, badgeBg: "bg-brand-700 text-white" },
  { level: 5, title: "Người ra quyết định", minXp: 700, maxXp: 1000, icon: <IconScale className="w-4 h-4" />, badgeBg: "bg-accent-red-600 text-white" },
  { level: 6, title: "Người kiến tạo tương lai", minXp: 1000, maxXp: 1500, icon: <IconAward className="w-4 h-4" />, badgeBg: "bg-gradient-to-r from-brand-700 to-accent-red-600 text-white" }
];

export function getLevelForXp(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

interface LevelBadgeProps {
  xp: number;
  compact?: boolean;
  className?: string;
}

export function LevelBadge({ xp, compact = false, className = "" }: LevelBadgeProps) {
  const current = getLevelForXp(xp);
  const nextLevel = LEVELS.find((l) => l.level === current.level + 1);

  const range = nextLevel ? nextLevel.minXp - current.minXp : 500;
  const progressInLevel = nextLevel ? Math.min(100, Math.max(0, ((xp - current.minXp) / range) * 100)) : 100;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50/80 px-2.5 py-1 text-xs shadow-xs ${className}`}>
        <span className="text-brand-700 shrink-0">{current.icon}</span>
        <span className="font-extrabold text-brand-900 text-[11px]">
          Lv.{current.level} {current.title}
        </span>
        <span className="text-[10px] font-bold text-brand-700 bg-brand-100 rounded-full px-1.5 py-0.2 flex items-center gap-0.5">
          <IconZap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
          {xp} XP
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-[12px] border border-line bg-surface p-4 shadow-soft space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-[10px] ${current.badgeBg} shadow-sm`}>
            {current.icon}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 block">
              Cấp độ nhận thức nghề nghiệp
            </span>
            <h2 className="text-base font-extrabold text-ink-900 leading-tight">
              Cấp {current.level}: {current.title}
            </h2>
          </div>
        </div>

        <div className="text-right">
          <span className="text-lg font-black text-brand-700 block leading-tight">
            {xp} XP
          </span>
          <span className="text-[11px] text-ink-500 font-medium">
            {nextLevel ? `Cần ${nextLevel.minXp - xp} XP lên Cấp ${nextLevel.level}` : "Đạt cấp tối đa"}
          </span>
        </div>
      </div>

      {/* Progress to next level */}
      <div className="space-y-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft border border-line">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${progressInLevel}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-ink-400 font-bold">
          <span>{current.minXp} XP</span>
          <span>{nextLevel ? `${nextLevel.minXp} XP` : "Master"}</span>
        </div>
      </div>
    </div>
  );
}
