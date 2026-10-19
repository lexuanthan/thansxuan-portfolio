import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { PostCard } from "@/components/content/PostCard";
import { HeroLxt3D } from "@/components/home/HeroLxt3D";
import {
  FeaturedCardIllustration,
  StudioBooksAndPlantArt,
} from "@/components/home/FeaturedIllustrations";
import HashRedirectListener from "@/components/home/HashRedirectListener";
import { Container } from "@/components/ui";
import { IconArrow, IconArrowUpRight } from "@/components/ui/icons";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  resolveFeaturedShowcase,
  resolveHomeConfig,
  type HomeSectionConfig,
} from "@/lib/home-config";
import {
  getAbout,
  getAiTools,
  getFeaturedPosts,
  getProjects,
  getSettings,
} from "@/lib/queries";

export const revalidate = 60;

interface HomePageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const wantsPreview = resolvedParams?.preview === "1";
  let adminAuthenticated = false;
  if (wantsPreview && isSupabaseConfigured) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      adminAuthenticated = Boolean(user);
    } catch {
      adminAuthenticated = false;
    }
  }
  const useDraft = Boolean(wantsPreview && adminAuthenticated);

  const [settings, about, posts, projects, tools] = await Promise.all([
    getSettings(),
    getAbout(),
    getFeaturedPosts(3),
    getProjects(),
    getAiTools(),
  ]);

  const homeConfig = resolveHomeConfig(settings, { useDraft });
  const featuredItems = resolveFeaturedShowcase(
    tools,
    projects,
    homeConfig.featured_ids
  );

  const renderDynamicSection = (section: HomeSectionConfig) => {
    if (!section.enabled) {
      return null;
    }

    switch (section.id) {
      case "featured":
        if (featuredItems.length === 0) return null;
        return (
          <section
            key="featured"
            data-testid="home-featured-section"
            className="py-8 sm:py-10"
          >
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-[#17243A] sm:text-[26px]">
                Dự án &amp; tiện ích nổi bật
              </h2>
              <Link
                href="/du-an"
                className="hidden items-center gap-1.5 text-[13.5px] font-semibold text-[#2864FF] transition-colors hover:text-[#1E54E6] sm:inline-flex"
              >
                <span>Xem tất cả</span>
                <IconArrow className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {featuredItems.map((item) => {
                const isExternal = item.href.startsWith("http");
                return (
                  <article
                    key={item.id}
                    className="group flex flex-col overflow-hidden rounded-[10px] border border-[#E5EAF2] bg-white p-3.5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CBD7EE] hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <Link
                      href={item.href}
                      {...(isExternal
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="block aspect-[400/230] overflow-hidden rounded-[8px] border border-[#EEF2F8]"
                    >
                      <FeaturedCardIllustration
                        preset={item.visualPreset}
                        title={item.shortTitle}
                      />
                    </Link>

                    <div className="flex flex-1 flex-col px-1.5 pt-4 pb-1">
                      <h3 className="text-[18px] font-extrabold leading-snug text-[#17243A] group-hover:text-[#2864FF]">
                        <Link
                          href={item.href}
                          {...(isExternal
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {item.shortTitle}
                        </Link>
                      </h3>

                      <p className="mt-1.5 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-[#4F5D73]">
                        {item.shortDescription}
                      </p>

                      <div className="mt-3.5 pt-1">
                        <Link
                          href={item.href}
                          {...(isExternal
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2864FF] transition-colors group-hover:text-[#1E54E6]"
                        >
                          <span>
                            {item.sourceType === "tool" ? "Mở công cụ" : "Xem dự án"}
                          </span>
                          {isExternal ? (
                            <IconArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          )}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );

      case "utility_banner":
        return (
          <section
            key="utility_banner"
            data-testid="home-utility-banner"
            className="py-4 sm:py-6"
          >
            <div
              className="relative overflow-hidden rounded-[10px] px-6 py-7 text-white shadow-[0_14px_34px_rgba(40,100,255,0.20)] sm:px-9 sm:py-8"
              style={{
                background:
                  "linear-gradient(125deg, #1A49C7 0%, #2864FF 54%, #4D84FF 100%)",
              }}
            >
              {/* Subtle translucent glass planes in right background */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rotate-12 rounded-[20px] bg-white/10 backdrop-blur-[2px]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-24 -bottom-12 h-36 w-36 -rotate-12 rounded-[18px] bg-white/10"
              />

              <div className="relative flex flex-wrap items-center justify-between gap-5">
                <div className="max-w-xl">
                  <h2 className="text-[20px] font-extrabold tracking-[-0.015em] text-white sm:text-[23px]">
                    {homeConfig.utility_banner_title}
                  </h2>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-white/85 sm:text-[14.5px]">
                    {homeConfig.utility_banner_subtitle}
                  </p>
                </div>

                <Link
                  href="/ai-tools"
                  className="inline-flex shrink-0 items-center gap-2 rounded-[8px] bg-white px-5 py-2.5 text-[13.5px] font-bold text-[#17243A] shadow-sm transition-all hover:bg-[#F5F8FF] hover:text-[#2864FF]"
                >
                  <span>{homeConfig.utility_banner_cta_label}</span>
                  <IconArrow className="h-4 w-4 text-[#2864FF]" />
                </Link>
              </div>
            </div>
          </section>
        );

      case "perspective":
        return (
          <section
            key="perspective"
            data-testid="home-about-section"
            className="py-6 sm:py-8"
          >
            <div className="overflow-hidden rounded-[12px] border border-[#E5EAF2] bg-gradient-to-br from-white via-[#F8FAFF] to-[#F3EFE6] p-6 shadow-[var(--shadow-card)] sm:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                <div className="max-w-lg">
                  <h2 className="text-[26px] font-extrabold leading-[1.18] tracking-[-0.02em] text-[#17243A] sm:text-[32px]">
                    <span className="block">{homeConfig.perspective_line1}</span>
                    <span className="mt-0.5 block text-[#2864FF]">
                      {homeConfig.perspective_line2}
                    </span>
                  </h2>

                  <blockquote className="mt-4 text-[14.5px] leading-[1.7] text-[#4F5D73] sm:text-[15.5px]">
                    “{homeConfig.perspective_text || settings.quote}”
                  </blockquote>

                  <div className="mt-5">
                    <Link
                      href="/gioi-thieu"
                      className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#2864FF] transition-colors hover:text-[#1E54E6]"
                    >
                      <span>Tìm hiểu thêm</span>
                      <IconArrow className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="mx-auto w-full max-w-[400px]">
                  <StudioBooksAndPlantArt />
                </div>
              </div>
            </div>
          </section>
        );

      case "posts":
        // Rule: Automatically hide Posts section on Homepage when there are 0 published posts
        if (posts.length === 0) {
          return null;
        }
        return (
          <section
            key="posts"
            data-testid="home-posts-section"
            className="py-6 sm:py-8"
          >
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2864FF]">
                  Góc nhìn &amp; Chia sẻ
                </p>
                <h2 className="mt-1 text-[22px] font-extrabold tracking-[-0.02em] text-[#17243A] sm:text-[26px]">
                  Bài viết mới nhất
                </h2>
              </div>
              <Link
                href="/bai-viet"
                className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#2864FF] transition-colors hover:text-[#1E54E6]"
              >
                <span>Xem tất cả bài viết</span>
                <IconArrow className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        );

      case "connect":
        return (
          <section
            key="connect"
            data-testid="home-connect-section"
            className="py-10 text-center sm:py-14"
          >
            <div className="mx-auto max-w-xl">
              <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#17243A] sm:text-[30px]">
                {homeConfig.connect_title}
              </h2>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#4F5D73] sm:text-[15.5px]">
                {homeConfig.connect_subtitle}
              </p>
              <div className="mt-6">
                <Link
                  href="/lien-he"
                  className="inline-flex items-center gap-2 rounded-[8px] bg-[#2864FF] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_6px_18px_rgba(40,100,255,0.22)] transition-all hover:bg-[#1E54E6]"
                >
                  <span>{homeConfig.connect_cta_label}</span>
                  <IconArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <SiteShell>
      <HashRedirectListener />

      {useDraft && (
        <div className="border-b border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-900">
          <span>
            Đang hiển thị <strong>Bản nháp (Draft Preview)</strong> từ Quản trị.
          </span>{" "}
          <Link
            href="/admin/settings"
            className="ml-2 font-bold text-[#2864FF] underline"
          >
            Quay lại Cài đặt
          </Link>{" "}
          ·{" "}
          <Link href="/" className="ml-1 font-semibold text-amber-800 underline">
            Xem bản chính thức
          </Link>
        </div>
      )}

      <Container className="py-4 sm:py-6">
        {/* SECTION A: HERO & 3D LXT MONOGRAM */}
        <section
          data-testid="home-hero-section"
          className="pt-4 pb-10 sm:pt-8 sm:pb-14"
        >
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-10">
            {/* Left Column: Typography & Actions */}
            <div className="max-w-[540px]">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#2864FF] sm:text-[13px]">
                {homeConfig.eyebrow}
              </p>

              <h1 className="mt-3.5 text-[34px] font-extrabold leading-[1.12] tracking-[-0.025em] text-[#17243A] sm:text-[46px] lg:text-[50px]">
                <span className="block">{homeConfig.headline_line1}</span>
                <span className="mt-1 block text-[#2864FF]">
                  {homeConfig.headline_line2}
                </span>
              </h1>

              <p className="mt-4 text-[15px] leading-[1.68] text-[#4F5D73] sm:text-[16.5px]">
                {homeConfig.lead}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={homeConfig.cta_primary_href || "/du-an"}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-[#2864FF] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_6px_18px_rgba(40,100,255,0.24)] transition-all hover:bg-[#1E54E6] hover:shadow-[0_8px_22px_rgba(40,100,255,0.32)]"
                >
                  <span>{homeConfig.cta_primary_label}</span>
                  <IconArrowUpRight className="h-4 w-4" />
                </Link>

                <Link
                  href={homeConfig.cta_secondary_href || "/gioi-thieu"}
                  className="inline-flex items-center gap-2 rounded-[8px] border border-[#DCE3EE] bg-white px-5 py-3 text-[14px] font-semibold text-[#17243A] shadow-[0_1px_2px_rgba(23,36,58,0.04)] transition-colors hover:border-[#2864FF] hover:text-[#2864FF]"
                >
                  <span>{homeConfig.cta_secondary_label}</span>
                  <IconArrow className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: LXT 3D Studio Sculpture / Fallback */}
            <div className="w-full">
              <HeroLxt3D
                mode={homeConfig.hero_mode}
                motionPreset={homeConfig.motion_preset}
                posterUrl={settings.hero_image_url ?? undefined}
                portraitUrl={settings.hero_image_url ?? undefined}
                authorName={settings.hero_title || "Lê Xuân Thân"}
              />
            </div>
          </div>
        </section>

        {/* SECTIONS B - F (Dynamic Order & Visibility) */}
        {homeConfig.sections.map((section) => renderDynamicSection(section))}
      </Container>
    </SiteShell>
  );
}