/* =============================================================
   Bộ icon nét mảnh dùng chung.
   Vẽ tay bằng SVG thay vì nạp thư viện ngoài: nhẹ hơn vài trăm KB,
   không thêm request, và không phụ thuộc CDN nào.
   ============================================================= */

import type { ReactNode } from "react";

type IconProps = {
  className?: string;
  strokeWidth?: number;
};

function Svg({
  children,
  className = "h-[18px] w-[18px]",
  strokeWidth = 1.8,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    <path d="M9.5 21v-6h5v6" />
  </Svg>
);

export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c.9-3.8 3.9-5.8 7.5-5.8s6.6 2 7.5 5.8" />
  </Svg>
);

export const IconFile = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" />
    <path d="M14 3v4h4" />
    <path d="M9 12h6M9 16h4" />
  </Svg>
);

export const IconSparkle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9z" />
    <path d="M18.5 3.5v3M20 5h-3" />
  </Svg>
);

export const IconRocket = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13.5 4.5c3.4-1.6 6-1 6-1s.6 2.6-1 6c-1.4 3-4 5.4-6.6 6.8L8 13.6C9.4 11 11.8 8.4 14.8 7" />
    <path d="M8.2 13.5 6 15.7a2 2 0 0 0 0 2.8l.5.5a2 2 0 0 0 2.8 0l2.2-2.2" />
    <circle cx="15.5" cy="8.5" r="1.4" />
  </Svg>
);

export const IconBook = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
  </Svg>
);

export const IconChat = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12.5c0 3.9-3.6 7-8 7a9 9 0 0 1-2.6-.4L4.5 21l1.2-3.5A6.7 6.7 0 0 1 4 12.5c0-3.9 3.6-7 8-7s8 3.1 8 7Z" />
  </Svg>
);

export const IconMail = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 6.5 8.5 6 8.5-6" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconImage = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
  </Svg>
);

export const IconGrid = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Svg>
);

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
    <circle cx="12" cy="12" r="2.5" />
  </Svg>
);

export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const IconArrow = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const IconSettings = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.5 12a7.5 7.5 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-2-1.2L14.7 3H9.3l-.4 2.6c-.7.3-1.4.7-2 1.2l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2l.4 2.6h5.4l.4-2.6c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
  </Svg>
);

export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19c.7-3.2 3.2-4.9 6-4.9s5.3 1.7 6 4.9" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.5c2 .6 3.4 2.2 3.9 4.5" />
  </Svg>
);

export const IconChart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8 17v-5M12.5 17V8M17 17v-7" />
  </Svg>
);

export const IconFolder = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2.5h8a1.5 1.5 0 0 1 1.5 1.5v7.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z" />
  </Svg>
);

export const IconWrench = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15.5 3.5a5 5 0 0 0-4.6 6.9L3.8 17.5a1.7 1.7 0 0 0 2.4 2.4l7.1-7.1a5 5 0 0 0 6.2-6.4l-2.7 2.7-2.6-.7-.7-2.6z" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

/* -------------------------------------------------------------
   Logo mặt trời — dấu nhận diện của thương hiệu, vẽ đặc thay vì
   dùng nét để nổi bật hơn phần còn lại của giao diện.
   ------------------------------------------------------------- */

export function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="brandmark-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD84A" />
          <stop offset="100%" stopColor="#F59D1F" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="#FFF6DA" />
      <circle cx="20" cy="20.5" r="7" fill="url(#brandmark-sun)" />
      <g stroke="#F5A524" strokeWidth="2.4" strokeLinecap="round">
        <path d="M20 6.5v3" />
        <path d="M20 31.5v3" />
        <path d="M6.5 20.5h3" />
        <path d="M30.5 20.5h3" />
        <path d="m10.8 11.3 2.1 2.1" />
        <path d="m27.1 27.6 2.1 2.1" />
        <path d="m29.2 11.3-2.1 2.1" />
        <path d="m12.9 27.6-2.1 2.1" />
      </g>
    </svg>
  );
}
