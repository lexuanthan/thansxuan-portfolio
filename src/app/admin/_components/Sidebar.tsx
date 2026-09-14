"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/projects", label: "Projects", icon: "📂" },
  { href: "/admin/ai-tools", label: "AI Tools", icon: "🤖" },
  { href: "/admin/about", label: "About page", icon: "👤" },
  { href: "/admin/media", label: "Media library", icon: "🖼️" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const nav = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-bold text-white">
          Admin
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Mở menu"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-slate-200"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="border-b border-white/10 bg-slate-950 px-4 py-4 lg:hidden">
          {nav}
          <SignOut email={email} className="mt-4" />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-white/10 bg-slate-950 p-5 lg:flex">
        <div>
          <Link href="/admin" className="mb-8 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm">
              ⚡
            </span>
            <span className="font-bold text-white">Admin Panel</span>
          </Link>
          {nav}
        </div>

        <div className="space-y-3">
          <Link
            href="/"
            target="_blank"
            className="block rounded-lg border border-white/10 px-3 py-2 text-center text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            ↗ Xem website
          </Link>
          <SignOut email={email} />
        </div>
      </aside>
    </>
  );
}

function SignOut({ email, className = "" }: { email: string; className?: string }) {
  return (
    <div className={`rounded-lg border border-white/10 p-3 ${className}`}>
      <p className="truncate text-xs text-slate-400" title={email}>
        {email}
      </p>
      <form action="/auth/signout" method="post" className="mt-2">
        <button
          type="submit"
          className="w-full rounded-md bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-red-500/20 hover:text-red-300"
        >
          Đăng xuất
        </button>
      </form>
    </div>
  );
}
