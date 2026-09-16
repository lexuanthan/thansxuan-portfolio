import Link from "next/link";
import { BrandMark, IconMail } from "@/components/ui/icons";
import { Container } from "@/components/ui";
import type { Settings, SocialLinks } from "@/lib/types";

/**
 * Dùng chữ viết tắt thay vì vẽ lại logo của từng mạng xã hội — vừa tránh
 * đụng tới nhãn hiệu của họ, vừa khỏi phải nạp thêm bộ icon thứ hai.
 */
const SOCIAL: { key: keyof SocialLinks; short: string; label: string }[] = [
  { key: "facebook", short: "Fb", label: "Facebook" },
  { key: "youtube", short: "Yt", label: "YouTube" },
  { key: "linkedin", short: "In", label: "LinkedIn" },
  { key: "tiktok", short: "Tt", label: "TikTok" },
  { key: "github", short: "Gh", label: "GitHub" },
  { key: "twitter", short: "X", label: "X" },
  { key: "website", short: "Web", label: "Website" },
];

const QUICK_LINKS = [
  { href: "/bai-viet", label: "Bài viết" },
  { href: "/ai-tools", label: "AI Tools" },
  { href: "/du-an", label: "Dự án" },
  { href: "/tai-nguyen", label: "Tài nguyên" },
  { href: "/tu-van", label: "Tư vấn" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
];

export default function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const social = settings.social ?? {};
  const links = SOCIAL.filter((s) => social[s.key]);
  const name = settings.brand_name || "Lê Xuân Thân";

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Thương hiệu */}
          <div>
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-10 w-10" />
              <div className="leading-tight">
                <p className="font-extrabold text-ink-900">{name}</p>
                <p className="text-xs font-medium text-ink-400">
                  Content Creator &amp; Tech Builder
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              {settings.footer_text ||
                "Chia sẻ nội dung về công nghệ, AI và sáng tạo. Đồng thời tự phát triển các công cụ web phục vụ công việc và học tập."}
            </p>

            {links.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {links.map((s) => (
                  <a
                    key={s.key}
                    href={social[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-brand-50 px-3 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    <span aria-hidden="true">{s.short}</span>
                    <span className="sr-only">{s.label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Liên kết nhanh */}
          <nav aria-label="Liên kết nhanh">
            <h2 className="mb-4 text-sm font-bold text-ink-900">Khám phá</h2>
            <ul className="space-y-2.5 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-ink-500 transition-colors hover:text-brand-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Liên hệ */}
          <div>
            <h2 className="mb-4 text-sm font-bold text-ink-900">Liên hệ</h2>
            <ul className="space-y-2.5 text-sm text-ink-500">
              {settings.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="inline-flex items-center gap-2 transition-colors hover:text-brand-600"
                  >
                    <IconMail className="h-4 w-4 shrink-0 text-ink-400" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                    className="transition-colors hover:text-brand-600"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.location && <li>{settings.location}</li>}
            </ul>

            <Link
              href="/lien-he"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-400 px-4 py-2.5 text-sm font-semibold text-ink-900 shadow-brand transition-colors hover:bg-brand-300"
            >
              Gửi lời nhắn
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-center text-xs text-ink-400">
          © {year} {name}. Mọi nội dung thuộc về tác giả.
        </div>
      </Container>
    </footer>
  );
}
