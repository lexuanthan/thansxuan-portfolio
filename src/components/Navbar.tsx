"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, type FormEvent, type ReactElement } from "react";
import {
  BrandMark,
  IconArrowUpRight,
  IconBook,
  IconChat,
  IconChevronDown,
  IconClose,
  IconFile,
  IconHome,
  IconMail,
  IconMenu,
  IconRocket,
  IconSearch,
  IconSparkle,
  IconUser,
} from "@/components/ui/icons";

type NavLink = {
  href: string;
  label: string;
  Icon: (p: { className?: string }) => ReactElement;
};

const PRIMARY_LINKS: NavLink[] = [
  { href: "/gioi-thieu", label: "Giới thiệu", Icon: IconUser },
  { href: "/du-an", label: "Dự án", Icon: IconRocket },
  { href: "/bai-viet", label: "Bài viết", Icon: IconFile },
  { href: "/ai-tools", label: "Tiện ích", Icon: IconSparkle },
];

const EXPLORE_LINKS: (NavLink & { desc: string })[] = [
  {
    href: "/ai-tools/tra-cuu-dai-hoc",
    label: "Tra cứu đại học",
    desc: "Điểm chuẩn, học phí & ngành đào tạo 200+ trường",
    Icon: IconBook,
  },
  {
    href: "/tai-nguyen",
    label: "Tài nguyên",
    desc: "Bộ sưu tập mẫu tài liệu, liên kết & học liệu",
    Icon: IconBook,
  },
  {
    href: "/tu-van",
    label: "Tư vấn & Hỗ trợ",
    desc: "Đồng hành chiến lược thương hiệu, AI & hệ thống",
    Icon: IconChat,
  },
  {
    href: "/lien-he",
    label: "Liên hệ",
    desc: "Gửi lời nhắn và kết nối trực tiếp",
    Icon: IconMail,
  },
];

const MOBILE_LINKS: NavLink[] = [
  { href: "/", label: "Trang chủ", Icon: IconHome },
  { href: "/gioi-thieu", label: "Giới thiệu", Icon: IconUser },
  { href: "/du-an", label: "Dự án", Icon: IconRocket },
  { href: "/bai-viet", label: "Bài viết", Icon: IconFile },
  { href: "/ai-tools", label: "Tiện ích", Icon: IconSparkle },
  { href: "/ai-tools/tra-cuu-dai-hoc", label: "Tra cứu đại học", Icon: IconBook },
  { href: "/tai-nguyen", label: "Tài nguyên", Icon: IconBook },
  { href: "/tu-van", label: "Tư vấn", Icon: IconChat },
  { href: "/lien-he", label: "Liên hệ", Icon: IconMail },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar({
  brandName = "Lê Xuân Thân",
}: {
  brandName?: string;
  tagline?: string;
}) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [term, setTerm] = useState("");
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const q = term.trim();
    router.push(q ? `/bai-viet?q=${encodeURIComponent(q)}` : "/bai-viet");
    setOpen(false);
    setSearchOpen(false);
  }

  const exploreActive = EXPLORE_LINKS.some((l) => isActive(pathname, l.href));

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-page/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo LXT + Tên thương hiệu */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 text-ink-900 transition-opacity hover:opacity-90"
        >
          <BrandMark className="h-7 w-auto" />
          <span className="whitespace-nowrap text-base font-extrabold tracking-tight text-ink-900">
            {brandName}
          </span>
        </Link>

        {/* Menu chính Desktop */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden items-center gap-1 lg:flex"
        >
          {PRIMARY_LINKS.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "whitespace-nowrap rounded-btn bg-brand-50 px-3.5 py-2 text-sm font-bold text-brand-600 transition-colors"
                    : "whitespace-nowrap rounded-btn px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-surface hover:text-brand-600"
                }
              >
                {label}
              </Link>
            );
          })}

          {/* Dropdown Khám phá (Tra cứu ĐH, Tài nguyên, Tư vấn, Liên hệ) */}
          <div ref={exploreRef} className="relative">
            <button
              type="button"
              onClick={() => setExploreOpen((v) => !v)}
              aria-expanded={exploreOpen}
              className={
                exploreActive || exploreOpen
                  ? "inline-flex items-center gap-1 whitespace-nowrap rounded-btn bg-brand-50 px-3.5 py-2 text-sm font-bold text-brand-600 transition-colors"
                  : "inline-flex items-center gap-1 whitespace-nowrap rounded-btn px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-surface hover:text-brand-600"
              }
            >
              <span>Khám phá</span>
              <IconChevronDown className="h-3.5 w-3.5" />
            </button>

            {exploreOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-card-lg border border-line bg-surface p-2 shadow-lift">
                {EXPLORE_LINKS.map(({ href, label, desc, Icon }) => {
                  const active = isActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setExploreOpen(false)}
                      className={`flex items-start gap-3 rounded-card p-2.5 transition-colors ${
                        active ? "bg-brand-50 text-brand-700" : "hover:bg-surface-soft"
                      }`}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-ink-900">
                          {label}
                        </span>
                        <span className="block text-xs leading-snug text-ink-500">
                          {desc}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Cụm hành động phải: Tìm kiếm + Quản trị + CTA Kết nối */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Tìm kiếm"
            title="Tìm kiếm bài viết và công cụ"
            className="inline-flex h-9 w-9 items-center justify-center rounded-btn border border-line bg-surface text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600"
          >
            <IconSearch className="h-4 w-4" />
          </button>

          <Link
            href="/login"
            aria-label="Khu vực quản trị"
            title="Khu vực quản trị"
            className="hidden h-9 w-9 items-center justify-center rounded-btn border border-line bg-surface text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600 sm:inline-flex"
          >
            <IconUser className="h-4 w-4" />
          </Link>

          <Link
            href="/lien-he"
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-btn bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-all duration-200 hover:bg-brand-600 sm:inline-flex"
          >
            <span>Kết nối</span>
            <IconArrowUpRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Đóng menu" : "Mở menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-btn border border-line bg-surface text-ink-700 lg:hidden"
          >
            {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm mở rộng */}
      {searchOpen && (
        <div className="border-t border-line bg-surface">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-3 sm:px-6">
            <form onSubmit={submitSearch} className="flex items-center gap-2" role="search">
              <label className="sr-only" htmlFor="site-search-bar">
                Tìm bài viết, công cụ
              </label>
              <div className="flex flex-1 items-center gap-2 rounded-btn border border-line bg-surface-soft px-3.5 py-2 focus-within:border-brand-400">
                <IconSearch className="h-4 w-4 shrink-0 text-ink-400" />
                <input
                  id="site-search-bar"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Nhập từ khoá bài viết, chủ đề…"
                  autoFocus
                  className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
                />
              </div>
              <button
                type="submit"
                className="rounded-btn bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Tìm
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu Mobile đầy đủ mọi đường dẫn */}
      {open && (
        <div className="border-t border-line bg-surface lg:hidden">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6">
            <form onSubmit={submitSearch} className="mb-3" role="search">
              <div className="flex items-center gap-2 rounded-btn border border-line bg-surface-soft px-3 py-2.5">
                <IconSearch className="h-4 w-4 shrink-0 text-ink-400" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Tìm bài viết, công cụ…"
                  aria-label="Tìm bài viết"
                  className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
                />
              </div>
            </form>

            <nav aria-label="Menu di động" className="grid gap-1 sm:grid-cols-2">
              {MOBILE_LINKS.map(({ href, label, Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={
                      active
                        ? "flex items-center gap-2.5 whitespace-nowrap rounded-btn bg-brand-50 px-3 py-2.5 text-sm font-bold text-brand-600"
                        : "flex items-center gap-2.5 whitespace-nowrap rounded-btn px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-soft"
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
              <Link
                href="/lien-he"
                onClick={() => setOpen(false)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-btn bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-brand"
              >
                <span>Kết nối</span>
                <IconArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 rounded-btn border border-line bg-surface-soft px-4 py-2.5 text-sm font-semibold text-ink-700"
              >
                <IconUser className="h-4 w-4" />
                <span>Quản trị</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
