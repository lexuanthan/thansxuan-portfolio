"use client";

import React from "react";

export interface RadarDataPoint {
  axis: string;
  value: number; // 0 - 100
  label?: string;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  className?: string;
  primaryColor?: string;
}

export function RadarChart({
  data,
  size = 320,
  className = "",
  primaryColor = "#004098"
}: RadarChartProps) {
  if (!data || data.length < 3) return null;

  const center = size / 2;
  const radius = (size / 2) - 45; // Leave room for axis text
  const totalAxes = data.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Calculate coordinates for a given axis and value (0-100)
  const getCoordinates = (value: number, index: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Generate web background rings (20%, 40%, 60%, 80%, 100%)
  const rings = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Polygon points for user's data
  const dataPoints = data.map((d, i) => getCoordinates(Math.max(10, Math.min(100, d.value)), i));
  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ") + " Z";

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none"
      >
        <defs>
          {/* HCMUTE Blue + Sky + Energetic Red gradient for radar fill */}
          <linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#004098" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#0284C7" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#D9232E" stopOpacity="0.25" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#004098" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Concentric Web Polygons */}
        {rings.map((ringFactor, ringIdx) => {
          const ringPoints = data.map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const r = ringFactor * radius;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          }).join(" ");

          return (
            <polygon
              key={ringIdx}
              points={ringPoints}
              fill={ringIdx % 2 === 0 ? "rgba(0, 64, 152, 0.02)" : "transparent"}
              stroke="#E2E8F0"
              strokeWidth={ringIdx === rings.length - 1 ? "1.5" : "0.75"}
              strokeDasharray={ringIdx === rings.length - 1 ? undefined : "2 2"}
            />
          );
        })}

        {/* Radiating Axis Lines */}
        {data.map((_, i) => {
          const edge = getCoordinates(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={edge.x}
              y2={edge.y}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled polygon shape */}
        <path
          d={polygonPath}
          fill="url(#radarFillGradient)"
          stroke={primaryColor}
          strokeWidth="2.5"
          filter="url(#radarGlow)"
          className="transition-all duration-700 ease-out"
        />

        {/* Vertices (Data Points) */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4.5"
            fill="#FFFFFF"
            stroke={i % 2 === 0 ? primaryColor : "#D9232E"}
            strokeWidth="2"
            className="transition-all duration-700 ease-out hover:r-6 cursor-pointer"
          >
            <title>{`${data[i].axis}: ${data[i].value}/100`}</title>
          </circle>
        ))}

        {/* Axis Labels */}
        {data.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const labelDistance = radius + 22;
          const x = center + labelDistance * Math.cos(angle);
          const y = center + labelDistance * Math.sin(angle);

          const textAnchor =
            Math.abs(Math.cos(angle)) < 0.2
              ? "middle"
              : Math.cos(angle) > 0
              ? "start"
              : "end";

          return (
            <g key={i}>
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                fontSize="11"
                fontWeight="700"
                fill="#334155"
                dominantBaseline="central"
                className="font-sans"
              >
                {d.axis}
              </text>
              <text
                x={x}
                y={y + 12}
                textAnchor={textAnchor}
                fontSize="10"
                fontWeight="800"
                fill={primaryColor}
                dominantBaseline="central"
              >
                {d.value}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
