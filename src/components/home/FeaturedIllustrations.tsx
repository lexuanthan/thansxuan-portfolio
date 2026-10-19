import React from "react";
import type { ResolvedFeaturedCard } from "@/lib/home-config";

/**
 * Bộ minh họa 3D Studio sáng, sắc nét theo đúng ngôn ngữ thiết kế LXT:
 * Trắng satin (#FFFFFF), Xanh Cobalt (#2864FF), Kính xanh nhạt (#DCE8FF) và Vàng ấm (#F6C445).
 * Dùng SVG đa lớp kết hợp gradient ánh sáng studio ban ngày: tải tức thì, không nặng bundle,
 * sắc nét ở mọi mật độ điểm ảnh (Retina/4K).
 */
export function FeaturedCardIllustration({
  preset,
  title,
}: {
  preset: ResolvedFeaturedCard["visualPreset"];
  title: string;
}) {
  if (preset === "career") {
    return (
      <svg
        viewBox="0 0 400 230"
        className="h-full w-full object-cover"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="cg-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5F7FB" />
            <stop offset="100%" stopColor="#E9EEF8" />
          </linearGradient>
          <linearGradient id="cg-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4D82FF" />
            <stop offset="100%" stopColor="#2864FF" />
          </linearGradient>
          <linearGradient id="cg-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFD966" />
            <stop offset="100%" stopColor="#F6C445" />
          </linearGradient>
          <filter id="cg-shadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#17243A" floodOpacity="0.1" />
          </filter>
        </defs>

        <rect width="400" height="230" fill="url(#cg-bg)" />
        {/* Bóng nắng studio mềm */}
        <ellipse cx="215" cy="185" rx="145" ry="26" fill="#DCE5F5" opacity="0.65" />

        {/* Nhánh đường 3D (Xanh trái, Xanh giữa, Vàng phải, Xanh tiền cảnh) */}
        <g filter="url(#cg-shadow)">
          {/* Nhánh vàng hướng tới bóng đèn */}
          <path
            d="M170 150 L295 112 L305 122 L185 162 Z"
            fill="url(#cg-gold)"
          />
          <polygon points="285,103 324,108 302,130" fill="url(#cg-gold)" />

          {/* Nhánh xanh chính + mũi tên */}
          <path
            d="M55 198 L245 100 L262 110 L82 208 Z"
            fill="url(#cg-blue)"
          />
          <polygon points="236,92 272,92 258,116" fill="url(#cg-blue)" />

          {/* Nhánh xanh trái */}
          <path
            d="M135 155 L165 105 L182 112 L152 162 Z"
            fill="#3B76FF"
          />
          <polygon points="154,102 186,95 184,118" fill="#3B76FF" />

          {/* Nhánh xanh phải dưới */}
          <path
            d="M180 156 L268 182 L258 196 L168 168 Z"
            fill="url(#cg-blue)"
          />
          <polygon points="268,172 296,195 252,204" fill="url(#cg-blue)" />
        </g>

        {/* Nhân vật 3D trắng đứng trước ngã rẽ */}
        <g filter="url(#cg-shadow)">
          <ellipse cx="78" cy="186" rx="16" ry="6" fill="#1D52E8" opacity="0.3" />
          <rect x="66" y="138" width="24" height="44" rx="11" fill="#FFFFFF" />
          <circle cx="78" cy="120" r="13" fill="#2864FF" />
        </g>

        {/* 3 Biển báo 3D nổi: Mũ cử nhân, Biểu đồ, Bóng đèn */}
        <g filter="url(#cg-shadow)">
          {/* Biển 1: Mũ tốt nghiệp */}
          <line x1="168" y1="74" x2="168" y2="100" stroke="#CBD5E1" strokeWidth="3" />
          <rect x="142" y="32" width="52" height="44" rx="10" fill="#FFFFFF" stroke="#E2E8F0" />
          <polygon points="168,42 186,50 168,58 150,50" fill="#2864FF" />
          <path d="M157 54v8c0 3 5 5 11 5s11-2 11-5v-8" fill="#4D82FF" />

          {/* Biển 2: Biểu đồ tăng trưởng */}
          <line x1="254" y1="68" x2="254" y2="94" stroke="#CBD5E1" strokeWidth="3" />
          <rect x="230" y="26" width="48" height="44" rx="10" fill="#FFFFFF" stroke="#E2E8F0" />
          <rect x="241" y="49" width="6" height="12" rx="1.5" fill="#2864FF" />
          <rect x="251" y="43" width="6" height="18" rx="1.5" fill="#2864FF" />
          <rect x="261" y="36" width="6" height="25" rx="1.5" fill="#1D52E8" />

          {/* Biển 3: Bóng đèn sáng tạo */}
          <line x1="316" y1="88" x2="316" y2="110" stroke="#CBD5E1" strokeWidth="3" />
          <rect x="292" y="46" width="48" height="44" rx="10" fill="#FFFFFF" stroke="#E2E8F0" />
          <circle cx="316" cy="64" r="10" fill="url(#cg-gold)" />
          <rect x="312" y="74" width="8" height="5" rx="2" fill="#D97706" />
        </g>
      </svg>
    );
  }

  if (preset === "canvas") {
    return (
      <svg
        viewBox="0 0 400 230"
        className="h-full w-full object-cover"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="cv-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EEF4FF" />
            <stop offset="100%" stopColor="#FAFAF7" />
          </linearGradient>
          <linearGradient id="cv-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BFD9FF" />
            <stop offset="100%" stopColor="#E6F0FF" />
          </linearGradient>
          <linearGradient id="cv-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4D82FF" />
            <stop offset="100%" stopColor="#2864FF" />
          </linearGradient>
          <filter id="cv-shadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#17243A" floodOpacity="0.1" />
          </filter>
        </defs>

        <rect width="400" height="230" fill="url(#cv-bg)" />
        <ellipse cx="220" cy="195" rx="140" ry="20" fill="#DCE5F5" opacity="0.6" />

        {/* 3 Phím công cụ nổi bên trái: T, Crop (#), Brush */}
        <g filter="url(#cv-shadow)">
          <rect x="52" y="54" width="42" height="42" rx="10" fill="#FFFFFF" />
          <text
            x="73"
            y="83"
            textAnchor="middle"
            fill="#2864FF"
            fontSize="24"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            T
          </text>

          <rect x="52" y="106" width="42" height="42" rx="10" fill="#FFFFFF" />
          <path
            d="M64 118v18h18M60 122h18v18"
            stroke="#2864FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          <rect x="52" y="158" width="42" height="42" rx="10" fill="#FFFFFF" />
          <path
            d="M65 186c2 0 5-1 6-4l10-10-4-4-10 10c-3 1-4 4-4 6 0 1 1 2 2 2Z"
            fill="#2864FF"
          />
        </g>

        {/* Màn hình Studio 3D ở giữa */}
        <g filter="url(#cv-shadow)">
          {/* Chân đế */}
          <ellipse cx="235" cy="192" rx="34" ry="8" fill="#FFFFFF" />
          <rect x="223" y="168" width="24" height="22" rx="4" fill="#E2E8F0" />

          {/* Khung màn hình trắng */}
          <rect
            x="122"
            y="32"
            width="220"
            height="142"
            rx="16"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="2"
          />
          {/* Mặt kính bên trong */}
          <rect x="134" y="44" width="196" height="118" rx="10" fill="url(#cv-screen)" />

          {/* Mặt trời vàng ấm #F6C445 */}
          <circle cx="268" cy="76" r="15" fill="#F6C445" />

          {/* Núi 3D xanh */}
          <polygon points="142,162 198,86 254,162" fill="url(#cv-blue)" />
          <polygon points="208,162 262,102 322,162" fill="#1D52E8" />
        </g>

        {/* Khối lập phương vàng & xanh + Con trỏ chuột 3D */}
        <g filter="url(#cv-shadow)">
          <rect x="122" y="165" width="24" height="24" rx="5" fill="#F6C445" />
          <rect x="148" y="172" width="22" height="22" rx="5" fill="#2864FF" />
          <polygon
            points="296,144 338,162 320,170 328,190 315,195 307,175 294,186"
            fill="#2864FF"
          />
        </g>
      </svg>
    );
  }

  if (preset === "quiz") {
    return (
      <svg
        viewBox="0 0 400 230"
        className="h-full w-full object-cover"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id="qz-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5F7FB" />
            <stop offset="100%" stopColor="#E9EEF8" />
          </linearGradient>
          <linearGradient id="qz-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4D82FF" />
            <stop offset="100%" stopColor="#2864FF" />
          </linearGradient>
          <filter id="qz-shadow" x="-15%" y="-15%" width="130%" height="135%">
            <feDropShadow dx="0" dy="10" stdDeviation="7" floodColor="#17243A" floodOpacity="0.12" />
          </filter>
        </defs>

        <rect width="400" height="230" fill="url(#qz-bg)" />
        <ellipse cx="205" cy="190" rx="135" ry="20" fill="#DCE5F5" opacity="0.65" />

        {/* Các khối hình học 3D bay xung quanh */}
        <g filter="url(#qz-shadow)">
          {/* Tam giác vàng bên trái */}
          <polygon points="82,66 112,110 54,110" fill="#F6C445" />
          {/* Dấu cộng xanh phía trên phải */}
          <path
            d="M292 32h12v14h14v12h-14v14h-12V58h-14V46h14V32Z"
            fill="url(#qz-blue)"
          />
          {/* Khối vuông xanh bên phải */}
          <rect
            x="325"
            y="100"
            width="28"
            height="28"
            rx="6"
            transform="rotate(15 325 100)"
            fill="#4D82FF"
          />
          {/* Khối vuông vàng nhỏ */}
          <rect x="65" y="156" width="24" height="24" rx="5" fill="#FDE68A" />
        </g>

        {/* Tay cầm Gamepad 3D Trắng - Cobalt */}
        <g filter="url(#qz-shadow)">
          {/* Hai báng cầm xanh Cobalt */}
          <path
            d="M116 122 C96 145, 96 184, 122 190 C142 194, 156 168, 166 152 Z"
            fill="url(#qz-blue)"
          />
          <path
            d="M294 122 C314 145, 314 184, 288 190 C268 194, 254 168, 244 152 Z"
            fill="url(#qz-blue)"
          />

          {/* Thân chính trắng satin */}
          <path
            d="M135 76 H275 C302 76, 314 112, 296 146 C282 168, 260 156, 244 148 H166 C150 156, 128 168, 114 146 C96 112, 108 76, 135 76 Z"
            fill="#FFFFFF"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />

          {/* Nút điều hướng D-Pad bên trái */}
          <path
            d="M148 94h12v12h12v12h-12v12h-12v-12h-12v-12h12V94Z"
            fill="#17243A"
          />

          {/* 4 Nút hành động vàng ấm #F6C445 bên phải */}
          <circle cx="262" cy="96" r="6.5" fill="#F6C445" />
          <circle cx="262" cy="124" r="6.5" fill="#F6C445" />
          <circle cx="248" cy="110" r="6.5" fill="#F6C445" />
          <circle cx="276" cy="110" r="6.5" fill="#F6C445" />

          {/* 2 Cần joystick */}
          <circle cx="182" cy="130" r="14" fill="#E2E8F0" />
          <circle cx="182" cy="128" r="10" fill="#17243A" />
          <circle cx="228" cy="130" r="14" fill="#E2E8F0" />
          <circle cx="228" cy="128" r="10" fill="#17243A" />
        </g>
      </svg>
    );
  }

  // Fallback minh họa 3D sạch sẽ cho các dự án/công cụ khác khi được ghim lên trang chủ
  return (
    <svg
      viewBox="0 0 400 230"
      className="h-full w-full object-cover"
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id="df-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EEF4FF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>
        <linearGradient id="df-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4D82FF" />
          <stop offset="100%" stopColor="#2864FF" />
        </linearGradient>
      </defs>
      <rect width="400" height="230" fill="url(#df-bg)" />
      <ellipse cx="200" cy="188" rx="120" ry="18" fill="#DCE5F5" opacity="0.6" />
      <rect x="110" y="42" width="180" height="128" rx="16" fill="#FFFFFF" stroke="#DCE5F5" strokeWidth="2" />
      <rect x="132" y="66" width="84" height="14" rx="5" fill="url(#df-blue)" />
      <rect x="132" y="92" width="136" height="10" rx="4" fill="#CBD5E1" />
      <rect x="132" y="112" width="110" height="10" rx="4" fill="#E2E8F0" />
      <circle cx="262" cy="136" r="16" fill="#F6C445" />
    </svg>
  );
}

/**
 * Minh họa chồng sách & chậu cây xanh bên cửa sổ nắng cho khu vực
 * "Luôn học hỏi. Luôn kiến tạo." (Section D trên Trang chủ).
 */
export function StudioBooksAndPlantArt() {
  return (
    <svg
      viewBox="0 0 340 210"
      className="h-full w-full object-contain"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bp-blue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1D52E8" />
          <stop offset="100%" stopColor="#3B76FF" />
        </linearGradient>
        <linearGradient id="bp-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F6C445" />
          <stop offset="100%" stopColor="#FDE08D" />
        </linearGradient>
        <filter id="bp-shadow" x="-15%" y="-15%" width="130%" height="135%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#17243A" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Mặt bàn studio ánh nắng nhẹ */}
      <ellipse cx="195" cy="182" rx="125" ry="14" fill="#E2E8F0" opacity="0.7" />

      {/* Chồng 3 cuốn sách: Xanh Cobalt (dưới), Trắng (giữa), Vàng ấm (trên) */}
      <g filter="url(#bp-shadow)">
        {/* Cuốn dưới: Xanh Cobalt */}
        <rect x="76" y="148" width="144" height="28" rx="6" fill="url(#bp-blue)" />
        <rect x="196" y="152" width="20" height="20" rx="2" fill="#F8FAFC" />

        {/* Cuốn giữa: Trắng kem */}
        <rect
          x="86"
          y="122"
          width="128"
          height="26"
          rx="5"
          fill="#FFFFFF"
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />
        <rect x="94" y="127" width="96" height="16" rx="2" fill="#F1F5F9" />

        {/* Cuốn trên: Vàng ấm #F6C445 */}
        <rect x="96" y="98" width="112" height="24" rx="5" fill="url(#bp-gold)" />
        <rect x="184" y="102" width="20" height="16" rx="2" fill="#FFFBEB" />
      </g>

      {/* Chậu cây xanh bên phải */}
      <g filter="url(#bp-shadow)">
        {/* Lá cây */}
        <path
          d="M255 112 C232 95, 224 68, 240 52 C252 68, 256 90, 255 112 Z"
          fill="#15803D"
        />
        <path
          d="M262 112 C278 90, 298 74, 306 54 C284 62, 268 84, 262 112 Z"
          fill="#16A34A"
        />
        <path
          d="M258 112 C250 82, 258 46, 268 34 C274 56, 268 86, 258 112 Z"
          fill="#22C55E"
        />
        <path
          d="M252 114 C228 110, 212 96, 216 82 C232 88, 244 100, 252 114 Z"
          fill="#4ADE80"
        />
        <path
          d="M265 114 C286 108, 304 98, 304 82 C288 86, 274 100, 265 114 Z"
          fill="#15803D"
        />

        {/* Chậu sứ trắng */}
        <path
          d="M234 110 H284 L278 168 C277 173, 273 176, 268 176 H250 C245 176, 241 173, 240 168 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}
