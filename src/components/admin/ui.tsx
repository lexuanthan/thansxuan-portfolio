import Link from "next/link";
import type { ReactNode } from "react";

/* =============================================================
   Thành phần dùng chung cho khu quản trị — cùng bảng màu với
   trang công khai để hai bên không lệch nhau.
   ============================================================= */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold text-ink-900">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-line bg-surface p-5 shadow-soft sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold text-ink-700">{label}</span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-xs leading-relaxed text-ink-400">{hint}</span>
      )}
    </label>
  );
}

export { inputClass } from "./styles";

/** Dùng chung cho nút thật và cho thẻ liên kết trông như nút. */
export const buttonBase =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-55";

export const buttonTones = {
  primary: "bg-brand-400 text-ink-900 shadow-brand hover:bg-brand-300",
  ghost: "border border-line text-ink-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
  danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
} as const;

export function LinkButton({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonTones;
  external?: boolean;
}) {
  const cls = `${buttonBase} ${buttonTones[variant]}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "green" | "amber" | "blue" | "rose";
}) {
  const tones: Record<string, string> = {
    slate: "bg-stone-100 text-ink-700",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-brand-100 text-brand-800",
    blue: "bg-sky-100 text-sky-800",
    rose: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-line-strong bg-surface-soft px-6 py-14 text-center">
      <div aria-hidden="true" className="mb-3 text-4xl">
        {icon}
      </div>
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-500">
        {description}
      </p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------
   Bảng dữ liệu — dùng chung cho mọi danh sách trong quản trị
   ------------------------------------------------------------- */

export function TableShell({ children }: { children: ReactNode }) {
  // overflow-x-auto để bảng nhiều cột cuộn ngang thay vì kéo giãn cả trang
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-soft">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th
      className={`border-b border-line px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-400 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <td className={`border-b border-line px-4 py-3 align-middle ${className}`}>
      {children}
    </td>
  );
}
