"use client";

import React, { useState, useEffect, type ReactNode, type ButtonHTMLAttributes } from "react";
import {
  IconCheck,
  IconBookmark,
  IconStar,
  IconArrowRight,
  IconSparkles,
  IconLock,
  IconAlertCircle,
  IconInfo,
  IconX
} from "../common/CareerIcons";

/* =========================================================================
   HCMUTE AI CAREER DECISION INTELLIGENCE PLATFORM — COMPONENT SYSTEM v6.0
   Unified, accessible, responsive component library adhering to HCMUTE identity:
   Primary: HCMUTE Blue (#004098)
   Accent: HCMUTE Red (#D9232E)
   Support: White, Cool Neutral, Sky Blue
   Radii: Button 8-12px, Card 10-14px, Panel 12-16px, Hero 16-20px
   ========================================================================= */

function cx(...classes: (string | boolean | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------
   1. Button
   ------------------------------------------------------------------------- */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconRight?: ReactNode;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-bold tracking-tight rounded-[10px] transition-all duration-200 select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5 min-h-[36px]",
    md: "px-4 py-2 text-xs sm:text-sm gap-2 min-h-[42px]",
    lg: "px-5 py-3 text-sm sm:text-base gap-2.5 min-h-[48px]"
  };

  const variants = {
    primary:
      "bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-brand active:bg-brand-800",
    accent:
      "bg-accent-red-600 hover:bg-accent-red-700 text-white shadow-sm hover:shadow-accent active:bg-accent-red-800",
    secondary:
      "bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-200/80 active:bg-brand-200",
    outline:
      "bg-surface hover:bg-surface-soft text-ink-700 border border-line hover:border-brand-300 hover:text-brand-900",
    ghost:
      "bg-transparent hover:bg-surface-soft text-ink-600 hover:text-ink-900"
  };

  return (
    <button
      className={cx(base, sizes[size], variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
      {iconRight && !isLoading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}

/* -------------------------------------------------------------------------
   2. IconButton
   ------------------------------------------------------------------------- */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function IconButton({
  label,
  children,
  variant = "ghost",
  size = "md",
  className,
  ...props
}: IconButtonProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs rounded-lg min-w-[36px] min-h-[36px]",
    md: "w-10 h-10 text-sm rounded-[10px] min-w-[40px] min-h-[40px]",
    lg: "w-12 h-12 text-base rounded-[10px] min-w-[44px] min-h-[44px]"
  };

  return (
    <Button
      variant={variant}
      className={cx("p-0 justify-center shrink-0", sizes[size], className)}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </Button>
  );
}

/* -------------------------------------------------------------------------
   3. Card
   ------------------------------------------------------------------------- */
export interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  padded?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  hoverable = false,
  padded = true,
  onClick
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cx(
        "rounded-[12px] border border-line bg-surface shadow-soft transition-all duration-200",
        padded && "p-4 sm:p-5",
        hoverable && "hover:border-brand-300 hover:shadow-lift cursor-pointer",
        onClick && "cursor-pointer active:scale-[0.99]",
        className
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------
   4. MetricCard
   ------------------------------------------------------------------------- */
export function MetricCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  className
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { text: string; positive?: boolean };
  className?: string;
}) {
  return (
    <Card className={cx("flex items-start justify-between gap-3", className)}>
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block">
          {label}
        </span>
        <div className="text-xl sm:text-2xl font-black text-ink-900 leading-none">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-ink-500 font-medium">{subtitle}</p>
        )}
        {trend && (
          <span
            className={cx(
              "inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded",
              trend.positive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-accent-red-50 text-accent-red-700"
            )}
          >
            {trend.text}
          </span>
        )}
      </div>
      {icon && (
        <div className="w-10 h-10 rounded-[10px] bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-brand-100">
          {icon}
        </div>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------------
   5. QuestionCard
   ------------------------------------------------------------------------- */
export function QuestionCard({
  stepNumber,
  totalSteps,
  title,
  description,
  children,
  className
}: {
  stepNumber?: number;
  totalSteps?: number;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cx("space-y-4", className)}>
      <div className="space-y-1.5 border-b border-line pb-3">
        {stepNumber && (
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded">
            Câu hỏi {stepNumber}{totalSteps ? ` / ${totalSteps}` : ""}
          </span>
        )}
        <h3 className="text-base font-extrabold text-ink-900 leading-snug">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-ink-500 leading-relaxed">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </Card>
  );
}

/* -------------------------------------------------------------------------
   6. CareerCard
   ------------------------------------------------------------------------- */
export function CareerCard({
  id,
  name,
  industry,
  matchScore,
  salaryText,
  aiRiskLevel,
  isSaved = false,
  onToggleSave,
  onSelect,
  className
}: {
  id: string;
  name: string;
  industry: string;
  matchScore: number;
  salaryText?: string;
  aiRiskLevel?: "low" | "medium" | "high";
  isSaved?: boolean;
  onToggleSave?: () => void;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <Card hoverable className={cx("flex flex-col justify-between gap-3", className)}>
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
              {industry}
            </span>
            <h4
              onClick={onSelect}
              className="text-base font-extrabold text-ink-900 mt-1.5 hover:text-brand-700 transition cursor-pointer"
            >
              {name}
            </h4>
          </div>
          {onToggleSave && (
            <IconButton
              label={isSaved ? "Bỏ lưu nghề" : "Lưu nghề này"}
              size="sm"
              variant={isSaved ? "accent" : "ghost"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
            >
              <IconBookmark className={isSaved ? "fill-current" : ""} />
            </IconButton>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/80 pt-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-ink-400 font-medium">Độ khớp:</span>
            <span
              className={cx(
                "text-sm font-black",
                matchScore >= 85
                  ? "text-emerald-600"
                  : matchScore >= 70
                  ? "text-brand-600"
                  : "text-ink-600"
              )}
            >
              {matchScore}%
            </span>
          </div>
          {salaryText && (
            <span className="text-xs font-bold text-ink-700">{salaryText}</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-line">
        {aiRiskLevel && (
          <span
            className={cx(
              "text-[10px] font-bold px-2 py-0.5 rounded",
              aiRiskLevel === "low"
                ? "bg-emerald-50 text-emerald-700"
                : aiRiskLevel === "medium"
                ? "bg-amber-50 text-amber-700"
                : "bg-accent-red-50 text-accent-red-700"
            )}
          >
            Rủi ro AI: {aiRiskLevel === "low" ? "Thấp" : aiRiskLevel === "medium" ? "Trung bình" : "Cao"}
          </span>
        )}
        {onSelect && (
          <button
            onClick={onSelect}
            className="text-xs font-extrabold text-brand-700 hover:text-brand-800 ml-auto inline-flex items-center gap-1"
          >
            <span>Chi tiết</span>
            <IconArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------
   7. MajorCard
   ------------------------------------------------------------------------- */
export function MajorCard({
  name,
  category,
  matchScore,
  admissionRange,
  isSaved = false,
  onToggleSave,
  onSelect,
  className
}: {
  name: string;
  category: string;
  matchScore: number;
  admissionRange?: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onSelect?: () => void;
  className?: string;
}) {
  return (
    <Card hoverable className={cx("space-y-3", className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold text-ink-500 bg-surface-soft px-2 py-0.5 rounded">
            {category}
          </span>
          <h4
            onClick={onSelect}
            className="text-sm font-extrabold text-ink-900 mt-1 hover:text-brand-700 transition cursor-pointer"
          >
            {name}
          </h4>
        </div>
        {onToggleSave && (
          <IconButton
            label={isSaved ? "Bỏ lưu ngành" : "Lưu ngành"}
            size="sm"
            variant={isSaved ? "accent" : "ghost"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
          >
            <IconBookmark className={isSaved ? "fill-current" : ""} />
          </IconButton>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-line">
        <span className="font-medium text-ink-500">
          Điểm chuẩn: <strong className="text-ink-800 font-bold">{admissionRange || "21 - 27.5"}</strong>
        </span>
        <span className="text-xs font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
          {matchScore}% Phù hợp
        </span>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------
   8. UniversityCard
   ------------------------------------------------------------------------- */
export function UniversityCard({
  code,
  name,
  city,
  tier = "target",
  tuitionText,
  isSaved = false,
  onToggleSave,
  onSelect,
  className
}: {
  code: string;
  name: string;
  city: string;
  tier?: "safe" | "target" | "reach";
  tuitionText?: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onSelect?: () => void;
  className?: string;
}) {
  const tierBadges = {
    safe: { label: "Vừa sức (Safe)", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    target: { label: "Mục tiêu (Target)", color: "bg-brand-50 text-brand-700 border-brand-200" },
    reach: { label: "Thử thách (Reach)", color: "bg-accent-red-50 text-accent-red-700 border-accent-red-200" }
  };

  return (
    <Card hoverable className={cx("space-y-3", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-white bg-brand-700 px-2 py-1 rounded-[6px]">
            {code}
          </span>
          <span className="text-xs text-ink-500 font-medium">{city}</span>
        </div>
        {onToggleSave && (
          <IconButton
            label={isSaved ? "Bỏ lưu trường" : "Lưu trường"}
            size="sm"
            variant={isSaved ? "accent" : "ghost"}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
          >
            <IconBookmark className={isSaved ? "fill-current" : ""} />
          </IconButton>
        )}
      </div>

      <h4
        onClick={onSelect}
        className="text-sm font-extrabold text-ink-900 leading-snug hover:text-brand-700 transition cursor-pointer"
      >
        {name}
      </h4>

      <div className="flex items-center justify-between text-xs pt-2 border-t border-line">
        <span className={cx("text-[10px] font-bold px-2 py-0.5 rounded border", tierBadges[tier].color)}>
          {tierBadges[tier].label}
        </span>
        {tuitionText && (
          <span className="text-xs text-ink-600 font-semibold">{tuitionText}</span>
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------
   9. JourneyStep
   ------------------------------------------------------------------------- */
export function JourneyStep({
  number,
  title,
  status = "available",
  xpReward = 30,
  icon,
  onClick
}: {
  number: string;
  title: string;
  status: "completed" | "current" | "available" | "recommended" | "locked";
  xpReward?: number;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  const statusStyles = {
    completed: "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300",
    current: "bg-brand-50 text-brand-900 border-brand-500 ring-2 ring-brand-400 font-black",
    recommended: "bg-accent-red-50 text-accent-red-900 border-accent-red-300 ring-1 ring-accent-red-300",
    available: "bg-surface text-ink-700 border-line hover:border-brand-300",
    locked: "bg-surface-soft text-ink-400 border-line cursor-not-allowed opacity-60"
  };

  return (
    <button
      onClick={status !== "locked" ? onClick : undefined}
      disabled={status === "locked"}
      className={cx(
        "flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-[10px] border transition-all text-center select-none shrink-0 min-w-[72px]",
        statusStyles[status]
      )}
      title={`${number}. ${title} (+${xpReward} XP)`}
    >
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-bold opacity-75">{number}</span>
        {status === "completed" ? (
          <IconCheck className="w-3 h-3 text-emerald-600" />
        ) : status === "locked" ? (
          <IconLock className="w-3 h-3 text-ink-400" />
        ) : status === "recommended" ? (
          <span className="w-1.5 h-1.5 rounded-full bg-accent-red-500 animate-pulse" />
        ) : null}
      </div>
      <span className="text-[11px] font-bold leading-tight line-clamp-1">{title}</span>
    </button>
  );
}

/* -------------------------------------------------------------------------
   10. InsightCard
   ------------------------------------------------------------------------- */
export function InsightCard({
  title,
  content,
  evidence,
  type = "strength",
  className
}: {
  title: string;
  content: string;
  evidence?: string;
  type?: "strength" | "caution" | "neutral";
  className?: string;
}) {
  const borderStyles = {
    strength: "border-l-4 border-l-emerald-500",
    caution: "border-l-4 border-l-accent-red-500",
    neutral: "border-l-4 border-l-brand-500"
  };

  return (
    <Card className={cx("space-y-1.5", borderStyles[type], className)}>
      <h4 className="text-sm font-extrabold text-ink-900">{title}</h4>
      <p className="text-xs text-ink-600 leading-relaxed">{content}</p>
      {evidence && (
        <span className="inline-block text-[10px] font-semibold text-ink-400 bg-surface-soft px-2 py-0.5 rounded mt-1">
          Dữ liệu chứng minh: {evidence}
        </span>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------------
   11. AIInsightCard
   ------------------------------------------------------------------------- */
export function AIInsightCard({
  title,
  explanation,
  promptHint,
  onAskCoach,
  className
}: {
  title: string;
  explanation: string;
  promptHint?: string;
  onAskCoach?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "rounded-[12px] border border-brand-200 bg-gradient-to-br from-brand-50/70 via-surface to-surface p-4 shadow-soft space-y-2.5",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-brand-700">
          <IconSparkles className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-black uppercase tracking-wider">
            AI Decision Intelligence
          </span>
        </div>
        <span className="text-[10px] font-bold bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full">
          HCMUTE AI Engine
        </span>
      </div>

      <h4 className="text-sm font-extrabold text-ink-900 leading-snug">{title}</h4>
      <p className="text-xs text-ink-600 leading-relaxed">{explanation}</p>

      {onAskCoach && (
        <div className="pt-1 flex items-center justify-between">
          <span className="text-[11px] text-ink-400 italic">
            {promptHint || "Cần phân tích sâu hơn?"}
          </span>
          <Button size="sm" variant="secondary" onClick={onAskCoach}>
            Hỏi AI Coach →
          </Button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   12. RecommendationCard
   ------------------------------------------------------------------------- */
export function RecommendationCard({
  rank = 1,
  title,
  category,
  fitScore,
  whyItFits,
  actionLabel = "Chọn làm mục tiêu",
  onAction,
  className
}: {
  rank?: number;
  title: string;
  category: string;
  fitScore: number;
  whyItFits: string[];
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <Card className={cx("space-y-3 border-brand-200", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-[6px] bg-brand-600 text-white text-xs font-black flex items-center justify-center shrink-0">
            #{rank}
          </span>
          <div>
            <h4 className="text-base font-extrabold text-ink-900 leading-tight">{title}</h4>
            <span className="text-xs text-ink-500 font-medium">{category}</span>
          </div>
        </div>
        <span className="text-base font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-[8px]">
          {fitScore}%
        </span>
      </div>

      <div className="space-y-1 bg-surface-soft p-3 rounded-[8px] border border-line">
        <span className="text-[11px] font-extrabold text-ink-700 block uppercase tracking-wider">
          Tại sao phù hợp:
        </span>
        <ul className="text-xs text-ink-600 space-y-1">
          {whyItFits.map((point, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold shrink-0">✓</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {onAction && (
        <Button variant="primary" size="sm" className="w-full" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

/* -------------------------------------------------------------------------
   13. ComparisonCard
   ------------------------------------------------------------------------- */
export function ComparisonCard({
  title,
  subtitle,
  metrics,
  onRemove,
  className
}: {
  title: string;
  subtitle?: string;
  metrics: { label: string; value: string | number }[];
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <Card className={cx("space-y-3 min-w-[220px]", className)}>
      <div className="flex items-start justify-between gap-2 border-b border-line pb-2">
        <div>
          <h4 className="text-sm font-extrabold text-ink-900">{title}</h4>
          {subtitle && <span className="text-xs text-ink-400">{subtitle}</span>}
        </div>
        {onRemove && (
          <IconButton label="Xóa khỏi so sánh" size="sm" onClick={onRemove}>
            <IconX className="w-3.5 h-3.5" />
          </IconButton>
        )}
      </div>

      <div className="space-y-2">
        {metrics.map((m, i) => (
          <div key={i} className="flex justify-between items-center text-xs">
            <span className="text-ink-500 font-medium">{m.label}</span>
            <span className="font-extrabold text-ink-800">{m.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------
   14. Progress
   ------------------------------------------------------------------------- */
export function Progress({
  value,
  max = 100,
  variant = "brand",
  showLabel = false,
  className
}: {
  value: number;
  max?: number;
  variant?: "brand" | "accent" | "emerald";
  showLabel?: boolean;
  className?: string;
}) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  const fillColors = {
    brand: "bg-brand-600",
    accent: "bg-accent-red-600",
    emerald: "bg-emerald-600"
  };

  return (
    <div className={cx("w-full space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-[11px] font-bold text-ink-500">
          <span>Tiến độ</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft border border-line">
        <div
          className={cx("h-full transition-all duration-300 rounded-full", fillColors[variant])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   15. Badge
   ------------------------------------------------------------------------- */
export function Badge({
  children,
  variant = "blue",
  size = "md",
  className
}: {
  children: ReactNode;
  variant?: "blue" | "red" | "emerald" | "amber" | "neutral";
  size?: "sm" | "md";
  className?: string;
}) {
  const variants = {
    blue: "bg-brand-50 text-brand-800 border-brand-200",
    red: "bg-accent-red-50 text-accent-red-800 border-accent-red-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    neutral: "bg-surface-soft text-ink-700 border-line"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs"
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 font-bold rounded-full border leading-tight select-none",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------
   16. Tabs
   ------------------------------------------------------------------------- */
export function Tabs<T extends string>({
  items,
  activeId,
  onChange,
  className
}: {
  items: { id: T; label: string; icon?: ReactNode; badge?: string | number }[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cx(
        "flex overflow-x-auto gap-1 p-1 bg-surface-soft border border-line rounded-[10px] scrollbar-none",
        className
      )}
    >
      {items.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cx(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[8px] whitespace-nowrap transition-all select-none cursor-pointer",
              isActive
                ? "bg-surface text-brand-900 shadow-sm border border-line"
                : "text-ink-600 hover:text-ink-900 hover:bg-surface/60"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="text-[10px] font-black bg-brand-100 text-brand-800 px-1.5 py-0.2 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------
   17. Modal
   ------------------------------------------------------------------------- */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
  className
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  className?: string;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx(
          "relative w-full rounded-[14px] bg-surface border border-line shadow-lift p-5 sm:p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200",
          maxWidth,
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h3 className="text-base sm:text-lg font-extrabold text-ink-900">{title}</h3>
          <IconButton label="Đóng" size="sm" onClick={onClose}>
            <IconX className="w-4 h-4" />
          </IconButton>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   18. Drawer
   ------------------------------------------------------------------------- */
export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  className
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={cx(
          "relative w-full max-w-md bg-surface h-full shadow-lift p-5 overflow-y-auto z-10 space-y-4 animate-in slide-in-from-right duration-250 border-l border-line",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h3 className="text-base font-extrabold text-ink-900">{title}</h3>
          <IconButton label="Đóng" size="sm" onClick={onClose}>
            <IconX className="w-4 h-4" />
          </IconButton>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   19. Tooltip
   ------------------------------------------------------------------------- */
export function Tooltip({
  text,
  children
}: {
  text: string;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-40 whitespace-nowrap rounded-[6px] bg-ink-900 text-white text-[11px] font-medium px-2 py-1 shadow-lift animate-in fade-in zoom-in-95 pointer-events-none"
        >
          {text}
        </span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------
   20. Toast
   ------------------------------------------------------------------------- */
export function Toast({
  message,
  type = "success",
  onClose
}: {
  message: string;
  type?: "success" | "info" | "warning";
  onClose?: () => void;
}) {
  const styles = {
    success: "bg-emerald-600 text-white shadow-emerald-900/20",
    info: "bg-brand-600 text-white shadow-brand-900/20",
    warning: "bg-amber-600 text-white shadow-amber-900/20"
  };

  return (
    <div
      role="status"
      className={cx(
        "fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-xs font-bold shadow-lift animate-in slide-in-from-bottom duration-200",
        styles[type]
      )}
    >
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-75 hover:opacity-100 ml-2">
          ✕
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   21. Skeleton
   ------------------------------------------------------------------------- */
export function Skeleton({
  className,
  rounded = "rounded-[8px]"
}: {
  className?: string;
  rounded?: string;
}) {
  return (
    <div className={cx("animate-pulse bg-surface-soft border border-line/60", rounded, className)} />
  );
}

/* -------------------------------------------------------------------------
   22. EmptyState
   ------------------------------------------------------------------------- */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cx("rounded-[12px] border border-dashed border-line p-8 text-center space-y-3", className)}>
      {icon && (
        <div className="w-12 h-12 mx-auto rounded-full bg-brand-50 text-brand-700 flex items-center justify-center text-xl">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-sm mx-auto">
        <h4 className="text-sm font-extrabold text-ink-900">{title}</h4>
        {description && <p className="text-xs text-ink-500 leading-relaxed">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------
   23. MatchGauge
   ------------------------------------------------------------------------- */
export function MatchGauge({
  score,
  label,
  size = 90,
  strokeWidth = 8,
  className
}: {
  score: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (Math.min(100, Math.max(0, score)) / 100) * arcLength;

  const color =
    score >= 85 ? "#059669" : score >= 70 ? "#004098" : score >= 55 ? "#D97706" : "#64748B";

  return (
    <div className={cx("flex flex-col items-center justify-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-135">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-black text-ink-900 leading-none">{Math.round(score)}%</span>
          {label && <span className="text-[10px] font-bold text-ink-500 mt-0.5">{label}</span>}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   24. SkillBar
   ------------------------------------------------------------------------- */
export function SkillBar({
  name,
  current,
  target = 80,
  importance = "Critical",
  onAddRoadmap
}: {
  name: string;
  current: number;
  target?: number;
  importance?: "Critical" | "High" | "Medium";
  onAddRoadmap?: () => void;
}) {
  const gap = Math.max(0, target - current);

  const importanceBadges = {
    Critical: "bg-accent-red-50 text-accent-red-800 border-accent-red-200",
    High: "bg-amber-50 text-amber-800 border-amber-200",
    Medium: "bg-brand-50 text-brand-800 border-brand-200"
  };

  return (
    <div className="space-y-1.5 p-3 rounded-[10px] border border-line bg-surface hover:border-brand-200 transition">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-ink-900">{name}</span>
          <span className={cx("text-[10px] font-bold px-1.5 py-0.2 rounded border", importanceBadges[importance])}>
            {importance}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-500 font-bold">
            {current}% / {target}%
          </span>
          {onAddRoadmap && gap > 0 && (
            <button
              onClick={onAddRoadmap}
              className="text-[11px] font-bold text-brand-700 hover:text-brand-900 underline"
            >
              + Lộ trình
            </button>
          )}
        </div>
      </div>

      <div className="relative h-2 w-full bg-surface-soft rounded-full overflow-hidden border border-line">
        {/* Target marker */}
        <div
          className="absolute top-0 bottom-0 bg-ink-200 w-full"
          style={{ width: `${target}%` }}
        />
        {/* Current progress */}
        <div
          className="absolute top-0 bottom-0 bg-brand-600 rounded-full transition-all duration-300"
          style={{ width: `${current}%` }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   25. RoadmapNode
   ------------------------------------------------------------------------- */
export function RoadmapNode({
  phaseTitle,
  timeframe,
  description,
  tasks,
  isCompleted = false,
  onToggleTask
}: {
  phaseTitle: string;
  timeframe: string;
  description?: string;
  tasks: { id: string; title: string; done: boolean }[];
  isCompleted?: boolean;
  onToggleTask?: (taskId: string) => void;
}) {
  return (
    <Card className={cx("space-y-3", isCompleted && "border-emerald-300 bg-emerald-50/30")}>
      <div className="flex items-start justify-between gap-2 border-b border-line pb-2.5">
        <div>
          <span className="text-[10px] font-black uppercase text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
            {timeframe}
          </span>
          <h4 className="text-base font-extrabold text-ink-900 mt-1">{phaseTitle}</h4>
          {description && <p className="text-xs text-ink-500 mt-0.5">{description}</p>}
        </div>
        <span
          className={cx(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-surface-soft text-ink-600"
          )}
        >
          {isCompleted ? "✓ Hoàn thành" : "Đang thực hiện"}
        </span>
      </div>

      <div className="space-y-1.5">
        {tasks.map((t) => (
          <label
            key={t.id}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-surface-soft cursor-pointer text-xs select-none"
          >
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => onToggleTask && onToggleTask(t.id)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <span className={cx(t.done ? "line-through text-ink-400" : "text-ink-800 font-medium")}>
              {t.title}
            </span>
          </label>
        ))}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------
   26. ReportSection
   ------------------------------------------------------------------------- */
export function ReportSection({
  number,
  title,
  subtitle,
  children,
  pageBreak = false,
  className
}: {
  number: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  pageBreak?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-[14px] border border-line bg-surface p-5 sm:p-7 shadow-soft space-y-4",
        pageBreak && "print:break-after-page",
        className
      )}
    >
      <div className="border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded-[6px] border border-brand-200">
            PHẦN {number}
          </span>
          <h3 className="text-base sm:text-lg font-black text-ink-900">{title}</h3>
        </div>
        {subtitle && <p className="text-xs text-ink-500 mt-1">{subtitle}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}
