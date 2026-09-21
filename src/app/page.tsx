import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { PostCard } from "@/components/content/PostCard";
import { UniversityLookup } from "@/components/UniversityLookup";
import {
  ButtonLink,
  Card,
  CardHeader,
  Chip,
  Container,
  EmptyState,
  IconTile,
  toneForLabel,
} from "@/components/ui";
import {
  IconArrow,
  IconBook,
  IconChat,
  IconCheck,
  IconFile,
  IconGrid,
  IconRocket,
  IconSparkle,
  IconUser,
} from "@/components/ui/icons";
import {
  getAbout,
  getAiTools,
  getFeaturedPosts,
  getProjects,
  getServices,
  getSettings,
} from "@/lib/queries";
import { plainText, truncate } from "@/lib/format";
import type { SocialLinks } from "@/lib/types";

export const revalidate = 60;

const QUICK_LINKS = [
  { href: "/bai-viet", label: "Bài viết", Icon: IconFile },
  { href: "/ai-tools", label: "AI Tools", Icon: IconSparkle },
  { href: "/du-an", label: "Dự án", Icon: IconRocket },
  { href: "#tra-cuu-dai-hoc", label: "Điểm chuẩn", Icon: IconBook },
  { href: "/tu-van", label: "Tư vấn", Icon: IconChat },
  { href: "/gioi-thieu", label: "Giới thiệu", Icon: IconUser },
];

const SOCIAL_SHORT: { key: keyof SocialLinks; short: string; label: string }[] = [
  { key: "facebook", short: "Fb", label: "Facebook" },
  { key: "youtube", short: "Yt", label: "YouTube" },
  { key: "linkedin", short: "In", label: "LinkedIn" },
  { key: "tiktok", short: "Tt", label: "TikTok" },
  { key: "github", short: "Gh", label: "GitHub" },
];

export default async function Home() {
  const [settings, about, posts, projects, tools, services] = await Promise.all([
    getSettings(),
    getAbout(),
    getFeaturedPosts(3),
    getProjects(),
    getAiTools(),
    getServices(),
  ]);

  const showcase = (() => {
    const featured = projects.filter((p) => p.featured);
    return (featured.length > 0 ? featured : projects).slice(0, 4);
  })();

  const social = settings.social ?? {};
  const socialLinks = SOCIAL_SHORT.filter((s) => social[s.key]);

  // Ưu tiên lấy ảnh từ Supabase settings, nếu chưa có thì lấy file tĩnh banner.png trong thư mục public
  const heroImageSrc = settings.hero_image_url || "/banner.png";

  return (
    <SiteShell>
      <Container className="py-6 sm:py-8">
        {/* ============ ẢNH BÌA NGUYÊN MẢNG LỚN (TỰ CO GIÃN THEO TỶ LỆ ẢNH) ============ */}
        <section className="relative w-full overflow-hidden rounded-card-lg border border-line bg-surface shadow-soft transition-all duration-300 hover:shadow-lift">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageSrc}
            alt={settings.hero_title || "Ảnh bìa trang chủ Lê Xuân Thân"}
            className="w-full h-auto block object-contain"
            loading="eager"
          />
        </section>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_19rem] 2xl:grid-cols-[17rem_minmax(0,1fr)_20rem] 2xl:gap-6">
          {/* ============ CỘT TRÁI ============ */}
          <div className="space-y-6">
            <Card>
              <CardHeader icon={<IconUser className="h-4 w-4" />} title="Về tôi" />

              <p className="text-sm leading-relaxed text-ink-500">
                {truncate(plainText(about.bio), 260) ||
                  "Mình là người yêu công nghệ, thích sáng tạo nội dung và luôn tìm kiếm những giải pháp mới để làm việc hiệu quả hơn."}
              </p>

              {about.core_values.length > 0 && (
                <ul className="mt-4 space-y-2.5">
                  {about.core_values.slice(0, 4).map((v, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-ink-700">
                      <IconTile tone="brand" size="sm">
                        <span className="text-xs">{v.icon || "✦"}</span>
                      </IconTile>
                      <span className="font-medium">{v.title}</span>
                    </li>
                  ))}
                </ul>
              )}

              <ButtonLink href="/gioi-thieu" tone="primary" className="mt-5 w-full">
                Tìm hiểu thêm
                <IconArrow className="h-4 w-4" />
              </ButtonLink>

              {settings.quote && (
                <blockquote className="mt-5 rounded-xl bg-brand-50 p-4">
                  <p className="text-sm font-semibold italic leading-relaxed text-ink-700">
                    “{settings.quote}”
                  </p>
                  <footer className="mt-2 text-right text-xs text-ink-400">
                    — {settings.hero_title || "Lê Xuân Thân"}
                  </footer>
                </blockquote>
              )}
            </Card>

            <Card>
              <CardHeader icon={<IconGrid className="h-4 w-4" />} title="Danh mục nhanh" />
              <div className="grid grid-cols-2 gap-2">
                {QUICK_LINKS.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 rounded-xl border border-line bg-surface-soft px-3 py-2.5 text-[13px] font-medium text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-700"
                  >
                    <Icon className="h-4 w-4 text-brand-600" />
                    {label}
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          {/* ============ CỘT GIỮA ============ */}
          <div className="space-y-6">
            <Card>
              <CardHeader
                icon={<IconFile className="h-4 w-4" />}
                title="Bài viết nổi bật"
                actionHref="/bai-viet"
              />

              {posts.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {posts.map((p) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="✍️"
                  title="Chưa có bài viết nào"
                  hint="Vào Quản trị → Bài viết để đăng bài đầu tiên. Bài đánh dấu nổi bật sẽ hiện ngay tại đây."
                />
              )}
            </Card>

            <Card>
              <CardHeader
                icon={<IconRocket className="h-4 w-4" />}
                tone="violet"
                title="Ứng dụng & Dự án của tôi"
                actionHref="/du-an"
              />

              {showcase.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  {showcase.map((p) => {
                    const inner = (
                      <>
                        <div
                          aria-hidden="true"
                          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-extrabold text-ink-700 ${
                            p.color || "from-brand-100 to-brand-200"
                          }`}
                        >
                          {p.title.trim().charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-bold leading-snug text-ink-900">{p.title}</h3>
                        {p.description && (
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-500">
                            {truncate(plainText(p.description), 90)}
                          </p>
                        )}
                        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
                          Truy cập ngay <IconArrow className="h-3.5 w-3.5" />
                        </span>
                      </>
                    );

                    const cls =
                      "block rounded-card border border-line bg-surface p-4 transition-shadow hover:shadow-lift";

                    return p.link_url ? (
                      <a
                        key={p.id}
                        href={p.link_url}
                        className={cls}
                        {...(p.link_url.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div key={p.id} className={cls}>
                        {inner}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  icon="🚀"
                  title="Chưa có ứng dụng nào được đăng"
                  hint="Thêm trong Quản trị → Ứng dụng & Dự án."
                />
              )}
            </Card>

            {/* Dải mời theo dõi */}
            <section className="overflow-hidden rounded-card bg-gradient-to-r from-brand-300 to-brand-200 px-6 py-7 sm:px-8">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <h2 className="text-xl font-extrabold text-ink-900">
                    Cùng nhau khám phá những điều thú vị!
                  </h2>
                  <p className="mt-1.5 text-sm font-medium text-ink-700">
                    Công nghệ · Sáng tạo · Kết nối · Phát triển
                  </p>
                </div>
                <ButtonLink href="/gioi-thieu" tone="outline">
                  Theo dõi hành trình của tôi
                  <IconArrow className="h-4 w-4" />
                </ButtonLink>
              </div>
            </section>
          </div>

          {/* ============ CỘT PHẢI ============ */}
          <div className="space-y-6 lg:col-span-2 xl:col-span-1">
            <Card>
              <CardHeader
                icon={<IconSparkle className="h-4 w-4" />}
                tone="orange"
                title="Công cụ AI hữu ích"
                actionHref="/ai-tools"
              />

              {tools.length > 0 ? (
                <ul className="space-y-1">
                  {tools.slice(0, 5).map((t) => {
                    const body = (
                      <>
                        <div
                          aria-hidden="true"
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg ${
                            t.color || "from-brand-100 to-brand-200"
                          }`}
                        >
                          {t.icon || "✨"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink-900">
                            {t.title}
                          </p>
                          {t.description && (
                            <p className="truncate text-xs text-ink-500">
                              {t.description.split("\n")[0]}
                            </p>
                          )}
                        </div>
                        <IconArrow className="h-4 w-4 shrink-0 text-ink-400" />
                      </>
                    );

                    const cls =
                      "flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-brand-50";

                    return (
                      <li key={t.id}>
                        {t.link_url ? (
                          <a
                            href={t.link_url}
                            className={cls}
                            {...(t.link_url.startsWith("http")
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                          >
                            {body}
                          </a>
                        ) : (
                          <div className={cls}>{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState icon="✨" title="Chưa có công cụ nào" />
              )}

              <ButtonLink href="/ai-tools" tone="primary" className="mt-4 w-full">
                Khám phá tất cả công cụ
                <IconArrow className="h-4 w-4" />
              </ButtonLink>
            </Card>

            {services.length > 0 && (
              <Card>
                <CardHeader
                  icon={<IconChat className="h-4 w-4" />}
                  tone="emerald"
                  title="Tư vấn & Hỗ trợ"
                  actionHref="/tu-van"
                  actionLabel="Chi tiết"
                />
                <ul className="space-y-2.5">
                  {services.slice(0, 4).map((s) => (
                    <li key={s.id} className="flex items-start gap-2.5 text-sm text-ink-700">
                      <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{s.title}</span>
                    </li>
                  ))}
                </ul>
                <ButtonLink href="/lien-he" tone="primary" className="mt-4 w-full">
                  Liên hệ với tôi
                  <IconArrow className="h-4 w-4" />
                </ButtonLink>
              </Card>
            )}

            {(socialLinks.length > 0 || settings.email) && (
              <Card>
                <CardHeader
                  icon={<IconUser className="h-4 w-4" />}
                  tone="sky"
                  title="Kết nối với tôi"
                />

                {socialLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((s) => (
                      <a
                        key={s.key}
                        href={social[s.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.label}
                        className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-brand-50 px-3 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-100"
                      >
                        <span aria-hidden="true">{s.short}</span>
                        <span className="sr-only">{s.label}</span>
                      </a>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs leading-relaxed text-ink-500">
                  Đừng ngần ngại kết nối, mình luôn sẵn sàng trao đổi và chia sẻ!
                </p>

                {about.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {about.skills
                      .flatMap((g) => g.items)
                      .slice(0, 8)
                      .map((item) => (
                        <Chip key={item} tone={toneForLabel(item)}>
                          {item}
                        </Chip>
                      ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* ============ KHU VỰC TRA CỨU ĐIỂM CHUẨN ĐẠI HỌC ============ */}
        <section id="tra-cuu-dai-hoc" className="mt-10 scroll-mt-6">
          <Card className="p-4 sm:p-6 shadow-soft">
            <UniversityLookup />
          </Card>
        </section>
      </Container>
    </SiteShell>
  );
}