"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactElement } from "react";
import {
  BrandMark,
  IconBook,
  IconChat,
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

const LINKS: NavLink[] = [
  { href: "/", label: "Trang chủ", Icon: IconHome },
  { href: "/gioi-thieu", label: "Giới thiệu", Icon: IconUser },
  { href: "/bai-viet", label: "Bài viết", Icon: IconFile },
  { href: "/ai-tools", label: "AI Tools", Icon: IconSparkle },
  { href: "/du-an", label: "Dự án", Icon: IconRocket },
  { href: "/tai-nguyen", label: "Tài nguyên", Icon: IconBook },
  { href: "/tu-van", label: "Tư vấn", Icon: IconChat },
  { href: "/lien-he", label: "Liên hệ", Icon: IconMail },
];

/**
 * Mục đang xem được tô nổi. Trang chủ phải so khớp tuyệt đối, còn lại so
 * theo tiền tố để trang chi tiết (ví dụ /bai-viet/abc) vẫn sáng mục cha.
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * whitespace-nowrap là bắt buộc: tám mục menu tiếng Việt đều là hai chữ, hễ
 * thiếu vài pixel là "Trang chủ" tụt thành hai dòng và cả thanh cao gấp đôi.
 * Thà để menu tràn ngang rồi thu về nút hamburger còn hơn để chữ gãy dòng.
 */
const NAV_BASE =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] transition-colors";

export default function Navbar({
  brandName = "Lê Xuân Thân",
  tagline = "Content Creator & Tech Builder",
}: {
  brandName?: string;
  tagline?: string;
}) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const q = term.trim();
    router.push(q ? `/bai-viet?q=${encodeURIComponent(q)}` : "/bai-viet");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-3 px-4 sm:px-6">
        {/* Thương hiệu */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <BrandMark className="h-9 w-9" />
          <span className="hidden leading-tight sm:block">
            <span className="block whitespace-nowrap text-[15px] font-extrabold text-ink-900">
              {brandName}
            </span>
            {/* Dòng nghề nghiệp rộng hơn cả tên nên chỉ hiện khi màn hình đủ rộng */}
            <span className="hidden whitespace-nowrap text-[11px] font-medium text-ink-400 2xl:block">
              {tagline}
            </span>
          </span>
        </Link>

        {/* Menu chính */}
        <nav className="hidden flex-1 items-center justify-center xl:flex">
          {LINKS.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? `${NAV_BASE} bg-brand-300 font-semibold text-ink-900`
                    : `${NAV_BASE} font-medium text-ink-500 hover:bg-brand-50 hover:text-brand-700`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Tìm kiếm + đăng nhập */}
        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
          {/* Ô tìm kiếm đầy đủ chỉ đủ chỗ từ 1536px trở lên */}
          <form onSubmit={submitSearch} className="hidden 2xl:block" role="search">
            <label className="sr-only" htmlFor="site-search">
              Tìm bài viết
            </label>
            <div className="flex items-center gap-2 rounded-full border border-line bg-surface-soft px-3 py-2 focus-within:border-brand-300">
              <IconSearch className="h-4 w-4 shrink-0 text-ink-400" />
              <input
                id="site-search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Tìm bài viết, công cụ…"
                className="w-44 bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-400"
              />
            </div>
          </form>

          {/* Hẹp hơn thì thu về một nút, bấm ra bảng có ô tìm kiếm */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Tìm kiếm"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-line text-ink-500 transition-colors hover:border-brand-300 hover:text-brand-700 xl:inline-flex 2xl:hidden"
          >
            <IconSearch className="h-4 w-4" />
          </button>

          <Link
            href="/login"
            className="hidden items-center gap-1.5 whitespace-nowrap rounded-xl bg-brand-400 px-3.5 py-2.5 text-sm font-semibold text-ink-900 shadow-brand transition-colors hover:bg-brand-300 sm:inline-flex"
          >
            <IconUser className="h-4 w-4 shrink-0" />
            Đăng nhập
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Đóng menu" : "Mở menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink-700 xl:hidden"
          >
            {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Bảng thu gọn: dưới 1280px là toàn bộ menu, trên đó chỉ còn ô tìm kiếm */}
      {open && (
        <div className="border-t border-line bg-surface">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6">
            <form onSubmit={submitSearch} className="mb-3 2xl:hidden" role="search">
              <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-soft px-3 py-2.5">
                <IconSearch className="h-4 w-4 shrink-0 text-ink-400" />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Tìm bài viết, công cụ…"
                  aria-label="Tìm bài viết"
                  autoFocus
                  className="w-full bg-transparent text-sm text-ink-700 outline-none placeholder:text-ink-400"
                />
              </div>
            </form>

            <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4 xl:hidden">
              {LINKS.map(({ href, label, Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={
                      active
                        ? "flex items-center gap-2.5 whitespace-nowrap rounded-xl bg-brand-100 px-3 py-2.5 text-sm font-semibold text-brand-800"
                        : "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50"
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-ink-900 sm:hidden"
            >
              <IconUser className="h-4 w-4" />
              Đăng nhập
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
