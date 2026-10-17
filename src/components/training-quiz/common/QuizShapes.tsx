import React from 'react';

/**
 * 4 Kahoot-style colorful geometric shapes:
 * - A: Red Triangle (Đỏ - Tam giác)
 * - B: Blue Diamond (Xanh dương - Hình thoi)
 * - C: Yellow Circle (Vàng - Hình tròn)
 * - D: Green Square (Xanh lá - Hình vuông)
 */

export interface ShapeIconProps {
  className?: string;
  size?: number;
  fill?: string;
}

export const ShapeTriangle: React.FC<ShapeIconProps> = ({
  className = 'w-6 h-6',
  size = 24,
  fill = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    data-testid="shape-triangle"
  >
    <path d="M12 2.5L22.5 20.5H1.5L12 2.5Z" />
  </svg>
);

export const ShapeDiamond: React.FC<ShapeIconProps> = ({
  className = 'w-6 h-6',
  size = 24,
  fill = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    data-testid="shape-diamond"
  >
    <path d="M12 1.5L22.5 12L12 22.5L1.5 12L12 1.5Z" />
  </svg>
);

export const ShapeCircle: React.FC<ShapeIconProps> = ({
  className = 'w-6 h-6',
  size = 24,
  fill = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    data-testid="shape-circle"
  >
    <circle cx="12" cy="12" r="10.5" />
  </svg>
);

export const ShapeSquare: React.FC<ShapeIconProps> = ({
  className = 'w-6 h-6',
  size = 24,
  fill = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    data-testid="shape-square"
  >
    <rect x="2.5" y="2.5" width="19" height="19" rx="3" />
  </svg>
);

export interface ShapeTheme {
  index: number;
  letter: 'A' | 'B' | 'C' | 'D';
  name: string;
  colorHex: string;
  bgClass: string;
  hoverBgClass: string;
  activeBgClass: string;
  borderClass: string;
  ringClass: string;
  textClass: string;
  badgeBgClass: string;
  Icon: React.FC<ShapeIconProps>;
}

export const SHAPE_THEMES: ShapeTheme[] = [
  {
    index: 0,
    letter: 'A',
    name: 'Tam giác Đỏ',
    colorHex: '#E21B3C',
    bgClass: 'bg-[#E21B3C]',
    hoverBgClass: 'hover:bg-[#cb1432]',
    activeBgClass: 'active:bg-[#b0102a]',
    borderClass: 'border-[#b0102a]',
    ringClass: 'ring-[#E21B3C]',
    textClass: 'text-white',
    badgeBgClass: 'bg-red-900/40 text-red-100',
    Icon: ShapeTriangle,
  },
  {
    index: 1,
    letter: 'B',
    name: 'Hình thoi Xanh dương',
    colorHex: '#1368CE',
    bgClass: 'bg-[#1368CE]',
    hoverBgClass: 'hover:bg-[#0f57ae]',
    activeBgClass: 'active:bg-[#0d478e]',
    borderClass: 'border-[#0d478e]',
    ringClass: 'ring-[#1368CE]',
    textClass: 'text-white',
    badgeBgClass: 'bg-blue-900/40 text-blue-100',
    Icon: ShapeDiamond,
  },
  {
    index: 2,
    letter: 'C',
    name: 'Hình tròn Vàng',
    colorHex: '#D89E00',
    bgClass: 'bg-[#D89E00]',
    hoverBgClass: 'hover:bg-[#bd8a00]',
    activeBgClass: 'active:bg-[#9e7400]',
    borderClass: 'border-[#9e7400]',
    ringClass: 'ring-[#D89E00]',
    textClass: 'text-white',
    badgeBgClass: 'bg-amber-900/40 text-amber-100',
    Icon: ShapeCircle,
  },
  {
    index: 3,
    letter: 'D',
    name: 'Hình vuông Xanh lá',
    colorHex: '#26890C',
    bgClass: 'bg-[#26890C]',
    hoverBgClass: 'hover:bg-[#1f7309]',
    activeBgClass: 'active:bg-[#1a6007]',
    borderClass: 'border-[#1a6007]',
    ringClass: 'ring-[#26890C]',
    textClass: 'text-white',
    badgeBgClass: 'bg-emerald-900/40 text-emerald-100',
    Icon: ShapeSquare,
  },
];

export interface QuizShapeIconProps extends ShapeIconProps {
  index: number | string;
}

export const QuizShapeIcon: React.FC<QuizShapeIconProps> = ({
  index,
  className,
  size = 24,
  fill = 'currentColor',
}) => {
  const numIndex =
    typeof index === 'number'
      ? index
      : ['A', 'B', 'C', 'D'].indexOf(index.toUpperCase());

  const theme = SHAPE_THEMES[numIndex] || SHAPE_THEMES[0];
  const IconComponent = theme.Icon;
  return <IconComponent className={className} size={size} fill={fill} />;
};
