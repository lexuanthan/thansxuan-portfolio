import Link from "next/link";
import { BrandMark, IconMail } from "@/components/ui/icons";
import { Container } from "@/components/ui";
import type { Settings, SocialLinks } from "@/lib/types";

const SOCIAL: { key: keyof SocialLinks; short: string; label: string }[] = [
  { key: "linkedin", short: "in", label: "LinkedIn" },
  { key: "youtube", short: "▶", label: "YouTube" },
  { key: "github", short: "gh", label: "GitHub" },
  { key: "facebook", short: "fb", label: "Facebook" },
  { key: "tiktok", short: "tt", label: "TikTok" },
  { key: "twitter", short: "x", label: "X" },
  { key: "website", short: "web", label: "Website" },
];

const FOOTER_LINKS = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/du-an", label: "Dự án" },
  { href: "/bai-viet", label: "Bài viết" },
  { href: "/ai-tools", label: "Tiện ích" },
  { href: "/ai-tools/tra-cuu-dai-hoc", label: "Tra cứu đại học" },
  { href: "/tai-nguyen", label: "Tài nguyên" },
  { href: "/tu-van", label: "Tư vấn" },
  { href: "/lien-he", label: "Liên hệ" },
];

export default function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const social = settings.social ?? {};
  const links = SOCIAL.filter((s) => {
    const val = social[s.key];
    return typeof val === "string" && val.trim().length > 0 && !s.key.startsWith("_");
  });
  const name = settings.brand_name || "Lê Xuân Thân";
  const email = settings.email?.trim() || "";
  const phone = settings.phone?.trim() || "";
  const location = settings.location?.trim() || "";

  return (
    <footer className="mt-14 border-t border-line bg-surface">
      <Container className="py-8 sm:py-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          {/* Thương hiệu & Mô tả ngắn */}
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <BrandMark className="h-6 w-auto" />
              <span className="text-sm font-extrabold text-ink-900">{name}</span>
            </Link>
            {settings.footer_text && (
              <p className="max-w-md text-xs leading-relaxed text-ink-500">
                {settings.footer_text}
              </p>
            )}
          </div>

          {/* Liên kết tất cả chuyên mục công khai (Bảo toàn lối vào Tài nguyên/Tư vấn/Tra cứu) */}
          <nav aria-label="Liên kết chân trang">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-ink-500">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="transition-colors hover:text-brand-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Dòng bản quyền động & các kênh liên hệ hợp lệ */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-line/70 pt-6 text-xs text-ink-500 sm:flex-row">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>© {year} {name}</span>
            {location && <span>· {location}</span>}
            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="transition-colors hover:text-brand-600"
              >
                · {phone}
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {links.map((s) => (
              <a
                key={s.key}
                href={social[s.key]}
                target="_blank"
                rel="noopener noreferrer"
                title={s.label}
                aria-label={s.label}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-btn border border-line bg-surface-soft px-2.5 text-xs font-bold text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
              >
                <span aria-hidden="true">{s.short}</span>
              </a>
            ))}

            {email && (
              <a
                href={`mailto:${email}`}
                title={`Email: ${email}`}
                aria-label={`Gửi email tới ${email}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-line bg-surface-soft text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
              >
                <IconMail className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
