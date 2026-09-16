import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/* =============================================================
   Thư viện thành phần dùng chung cho toàn bộ web.
   Mọi trang đều ghép từ đây để giao diện không bị mỗi nơi một kiểu.
   ============================================================= */

function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------
   Thẻ trắng — khối nền tảng của mọi khu vực nội dung
   --------------------------------------------------------------- */

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cx(
        "rounded-card border border-line bg-surface shadow-soft",
        padded && "p-5",
        className
      )}
    >
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------
   Ô icon bo góc — hình vuông nhỏ màu nhạt đứng trước tiêu đề
   --------------------------------------------------------------- */

export type TileTone = "brand" | "sky" | "violet" | "emerald" | "rose" | "orange";

const TILE_TONES: Record<TileTone, string> = {
  brand: "bg-brand-100 text-brand-700",
  sky: "bg-sky-100 text-sky-700",
  violet: "bg-violet-100 text-violet-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
  orange: "bg-orange-100 text-orange-700",
};

export function IconTile({
  children,
  tone = "brand",
  size = "md",
}: {
  children: ReactNode;
  tone?: TileTone;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-7 w-7 text-sm rounded-lg",
    md: "h-9 w-9 text-lg rounded-xl",
    lg: "h-12 w-12 text-2xl rounded-2xl",
  };
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-flex shrink-0 items-center justify-center leading-none",
        sizes[size],
        TILE_TONES[tone]
      )}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------
   Tiêu đề khu vực — icon + chữ, kèm liên kết "Xem tất cả" bên phải
   --------------------------------------------------------------- */

export function CardHeader({
  icon,
  tone = "brand",
  title,
  actionHref,
  actionLabel = "Xem tất cả",
  className,
}: {
  icon?: ReactNode;
  tone?: TileTone;
  title: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={cx("mb-4 flex items-center justify-between gap-2", className)}>
      {/* min-w-0 cho phép tiêu đề co lại thay vì đẩy nút "Xem tất cả" rơi xuống */}
      <h2 className="flex min-w-0 items-center gap-2.5 text-[15px] font-bold text-ink-900">
        {icon && (
          <IconTile tone={tone} size="sm">
            {icon}
          </IconTile>
        )}
        <span className="min-w-0">{title}</span>
      </h2>

      {actionHref && (
        <Link
          href={actionHref}
          className="shrink-0 whitespace-nowrap text-xs font-medium text-ink-500 transition-colors hover:text-brand-600"
        >
          {actionLabel} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   Nút
   --------------------------------------------------------------- */

type ButtonTone = "primary" | "outline" | "soft" | "ghost";

const BUTTON_TONES: Record<ButtonTone, string> = {
  primary:
    "bg-brand-400 text-ink-900 shadow-brand hover:bg-brand-300 active:bg-brand-500",
  outline:
    "border border-line-strong bg-surface text-ink-700 hover:border-brand-300 hover:text-brand-700",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  ghost: "text-ink-500 hover:bg-brand-50 hover:text-brand-700",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-55";

export function Button({
  children,
  tone = "primary",
  className,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: ButtonTone }) {
  return (
    <button
      type={type}
      className={cx(BUTTON_BASE, BUTTON_TONES[tone], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  href,
  tone = "primary",
  className,
  external = false,
}: {
  children: ReactNode;
  href: string;
  tone?: ButtonTone;
  className?: string;
  external?: boolean;
}) {
  const classes = cx(BUTTON_BASE, BUTTON_TONES[tone], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------------
   Nhãn chuyên mục / trạng thái
   --------------------------------------------------------------- */

const CHIP_TONES: Record<string, string> = {
  brand: "bg-brand-100 text-brand-800",
  sky: "bg-sky-100 text-sky-800",
  violet: "bg-violet-100 text-violet-800",
  emerald: "bg-emerald-100 text-emerald-800",
  rose: "bg-rose-100 text-rose-800",
  orange: "bg-orange-100 text-orange-800",
  neutral: "bg-stone-100 text-ink-700",
};

/**
 * Chuyên mục do người dùng tự đặt tên nên không thể gán màu sẵn.
 * Băm tên ra số rồi lấy dư — cùng một tên luôn ra cùng một màu, kể cả
 * sau khi tải lại trang hay đổi máy.
 */
const CHIP_ORDER: TileTone[] = ["sky", "violet", "emerald", "rose", "orange", "brand"];

export function toneForLabel(label: string): TileTone {
  let sum = 0;
  for (let i = 0; i < label.length; i += 1) sum += label.charCodeAt(i);
  return CHIP_ORDER[sum % CHIP_ORDER.length];
}

export function Chip({
  children,
  tone,
  className,
}: {
  children: ReactNode;
  tone?: string;
  className?: string;
}) {
  const key = tone ?? (typeof children === "string" ? toneForLabel(children) : "neutral");
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        CHIP_TONES[key] ?? CHIP_TONES.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------
   Dòng thông tin phụ dưới thẻ (ngày đăng, lượt xem…)
   --------------------------------------------------------------- */

export function MetaRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
      {children}
    </div>
  );
}

export function Meta({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------
   Khi chưa có dữ liệu — nói rõ làm gì tiếp theo thay vì để trống
   --------------------------------------------------------------- */

export function EmptyState({
  icon = "🪴",
  title,
  hint,
  action,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-surface-soft px-6 py-10 text-center">
      <div aria-hidden="true" className="text-3xl">
        {icon}
      </div>
      <p className="mt-3 font-semibold text-ink-700">{title}</p>
      {hint && <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-500">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------
   Tiêu đề đầu trang con
   --------------------------------------------------------------- */

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-600">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">{title}</h1>
      {description && (
        <p className="mt-3 max-w-2xl text-ink-500">{description}</p>
      )}
    </header>
  );
}

/* ---------------------------------------------------------------
   Khung nội dung chuẩn — giữ lề hai bên nhất quán trên mọi trang
   --------------------------------------------------------------- */

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  // 1440px thay vì max-w-7xl (1280): bố cục ba cột cần chỗ, bó ở 1280 thì
  // cột giữa chỉ còn ~590px và ba thẻ bài viết bị ép lại quá hẹp.
  return (
    <div className={cx("mx-auto w-full max-w-[1440px] px-4 sm:px-6", className)}>
      {children}
    </div>
  );
}

export { cx };
