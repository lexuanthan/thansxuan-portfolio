"use client";

import React from "react";

interface MetricGaugeProps {
  score: number; // 0 - 100
  label?: string;
  size?: number;
  strokeWidth?: number;
  showConfidence?: boolean;
  confidence?: number; // 0 - 1
  className?: string;
}

export function MetricGauge({
  score,
  label,
  size = 110,
  strokeWidth = 9,
  showConfidence = false,
  confidence = 0.85,
  className = ""
}: MetricGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 240-degree arc for a modern speedometer dial look
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (Math.min(100, Math.max(0, score)) / 100) * arcLength;

  // HCMUTE palette colors for metrics
  const getColor = (val: number) => {
    if (val >= 85) return { stroke: "#059669", bg: "#ECFDF5", text: "text-emerald-700" }; // Rất phù hợp
    if (val >= 70) return { stroke: "#004098", bg: "#F0F7FF", text: "text-brand-700" }; // Phù hợp cao (HCMUTE Blue)
    if (val >= 55) return { stroke: "#0284C7", bg: "#E0F2FE", text: "text-sky-700" }; // Tiềm năng
    return { stroke: "#64748B", bg: "#F8FAFC", text: "text-slate-600" }; // Cần cân nhắc
  };

  const theme = getColor(score);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-135">
          {/* Background track arc */}
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
          {/* Progress fill arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl sm:text-2xl font-black text-ink-900 leading-none tracking-tight">
            {Math.round(score)}%
          </span>
          {label && (
            <span className={`text-[10px] font-extrabold mt-1 px-1.5 py-0.2 rounded-full ${theme.text}`}>
              {label}
            </span>
          )}
        </div>
      </div>

      {showConfidence && (
        <span className="text-[10px] font-semibold text-ink-400 mt-1">
          Độ tin cậy: {Math.round(confidence * 100)}%
        </span>
      )}
    </div>
  );
}
