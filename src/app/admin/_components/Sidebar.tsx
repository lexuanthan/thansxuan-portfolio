"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactElement } from "react";
import {
  BrandMark,
  IconArrow,
  IconBook,
  IconChart,
  IconChat,
  IconClose,
  IconFile,
  IconFolder,
  IconGrid,
  IconHome,
  IconImage,
  IconMail,
  IconMenu,
  IconRocket,
  IconSettings,
  IconSparkle,
  IconUser,
} from "@/components/ui/icons";

type Item = {
  href: string;
  label: string;
  Icon: (p: { className?: string }) => ReactElement;
  exact?: boolean;
};

/**
 * Chia nhóm thay vì một danh sách dài mười mấy mục: mắt tìm theo nhóm nhanh
 * hơn nhiều so với đọc lần lượt từ trên xuống.
 */
const GROUPS: { title: string | null; items: Item[] }[] = [
  {
    title: null,
    items: [{ href: "/admin", label: "Tổng quan", Icon: IconHome, exact: true }],
  },
  {
    title: "Nội dung",
    items: [
      { href: "/admin/posts", label: "Bài viết", Icon: IconFile },
      { href: "/admin/categories", label: "Chuyên mục", Icon: IconFolder },
      { href: "/admin/projects", label: "Ứng dụng & Dự án", Icon: IconRocket },
      { href: "/admin/ai-tools", label: "Tool AI", Icon: IconSparkle },
      { href: "/admin/career-guidance", label: "AI Hướng nghiệp", Icon: IconRocket },
      { href: "/admin/resources", label: "Tài nguyên", Icon: IconBook },
      { href: "/admin/services", label: "Tư vấn", Icon: IconChat },
    ],
  },
  {
    title: "Thư viện",
    items: [
      { href: "/admin/media", label: "Hình ảnh & Media", Icon: IconImage },
      { href: "/admin/logos", label: "Logo có sẵn", Icon: IconGrid },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { href: "/admin/messages", label: "Lời nhắn", Icon: IconMail },
      { href: "/admin/stats", label: "Thống kê", Icon: IconChart },
      { href: "/admin/about", label: "Trang giới thiệu", Icon: IconUser },
      { href: "/admin/settings", label: "Cài đặt chung", Icon: IconSettings },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="space-y-5">
      {GROUPS.map((group, gi) => (
        <div key={gi}>
          {group.title && (
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-ink-400">
              {group.title}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map(({ href, label, Icon, exact }) => {
              const active = isActive(pathname, href, exact);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "flex items-center gap-3 rounded-xl bg-brand-300 px-3 py-2.5 text-sm font-semibold text-ink-900"
                        : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                    }
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Thanh trên cùng khi màn hình hẹp */}
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="font-extrabold text-ink-900">Quản trị</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Đóng menu" : "Mở menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink-700"
        >
          {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-b border-line bg-surface px-4 py-4 lg:hidden">
          {nav}
          <Account email={email} className="mt-5" />
        </div>
      )}

      {/* Cột bên cố định trên màn hình rộng */}
      <aside className="hidden w-[17rem] shrink-0 flex-col justify-between border-r border-line bg-surface p-5 lg:flex">
        <div>
          <Link href="/admin" className="mb-7 flex items-center gap-2.5">
            <BrandMark className="h-10 w-10" />
            <span className="leading-tight">
              <span className="block font-extrabold text-ink-900">Lê Xuân Thân</span>
              <span className="block text-[11px] font-medium text-ink-400">
                Khu vực quản trị
              </span>
            </span>
          </Link>
          {nav}
        </div>

        <div className="space-y-3 pt-6">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 text-xs font-semibold text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            Xem website
            <IconArrow className="h-3.5 w-3.5" />
          </Link>
          <Account email={email} />
        </div>
      </aside>
    </>
  );
}

function Account({ email, className = "" }: { email: string; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-surface-soft p-3 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-200 text-sm font-bold text-brand-800"
        >
          {email.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-ink-900" title={email}>
            {email}
          </p>
          <p className="text-[11px] text-ink-400">Quản trị viên</p>
        </div>
      </div>

      <form action="/auth/signout" method="post" className="mt-3">
        <button
          type="submit"
          className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink-700 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
        >
          Đăng xuất
        </button>
      </form>
    </div>
  );
}
