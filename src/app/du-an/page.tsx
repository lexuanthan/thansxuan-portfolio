import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import {
  Chip,
  Container,
  EmptyState,
  PageHeading,
  toneForLabel,
} from "@/components/ui";
import { IconArrow, IconArrowUpRight } from "@/components/ui/icons";
import { getProjects } from "@/lib/queries";
import { plainText, truncate } from "@/lib/format";
import type { Project } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Ứng dụng & Dự án",
  description: "Các ứng dụng web, công cụ AI và dự án do Lê Xuân Thân tự phát triển.",
};

function ProjectCard({ project }: { project: Project }) {
  const linkUrl = (project.link_url || "").trim();
  const hasLink = Boolean(linkUrl);
  const isToolLink = linkUrl.startsWith("/ai-tools");
  const isExternal = linkUrl.startsWith("http");

  const ctaLabel = !hasLink
    ? "Đang phát triển"
    : isToolLink
      ? "Mở công cụ"
      : "Xem dự án";

  const body = (
    <>
      <div className="relative mb-4">
        {project.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image_url}
            alt={project.title}
            loading="lazy"
            className="h-40 w-full rounded-[8px] object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className={`flex h-40 w-full items-center justify-center rounded-[8px] bg-gradient-to-br text-4xl font-extrabold text-[#17243A]/65 ${
              project.color || "from-brand-100 to-brand-200"
            }`}
          >
            {project.title.trim().charAt(0).toUpperCase()}
          </div>
        )}

        <span
          className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${
            hasLink
              ? isToolLink
                ? "bg-[#2864FF] text-white"
                : "bg-white/95 text-[#17243A]"
              : "bg-amber-100 text-amber-900 border border-amber-300"
          }`}
        >
          {!hasLink ? "Đang phát triển" : isToolLink ? "Công cụ trực tuyến" : "Dự án"}
        </span>
      </div>

      <h2 className="text-[18px] font-extrabold leading-snug text-[#17243A] group-hover:text-[#2864FF]">
        {project.title}
      </h2>

      {project.description && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4F5D73]">
          {truncate(plainText(project.description), 160)}
        </p>
      )}

      {project.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((t) => (
            <Chip key={t} tone={toneForLabel(t)}>
              {t}
            </Chip>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-[#EEF2F8] pt-3.5">
        {hasLink ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2864FF]">
            <span>{ctaLabel}</span>
            {isExternal ? (
              <IconArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A879B]">
            <span>Đang phát triển — Sắp ra mắt</span>
          </span>
        )}
      </div>
    </>
  );

  const cls =
    "group flex flex-col rounded-[10px] border border-[#E5EAF2] bg-white p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#CBD7EE] hover:shadow-[var(--shadow-card-hover)]";

  if (!hasLink) {
    return (
      <article className="flex flex-col rounded-[10px] border border-[#E5EAF2] bg-[#FAFBFD] p-5">
        {body}
      </article>
    );
  }

  if (isExternal) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={linkUrl} className={cls}>
      {body}
    </Link>
  );
}

export default async function DuAnPage() {
  const allProjects = await getProjects();
  const projects = allProjects.filter((p) => p.published !== false);

  return (
    <SiteShell>
      <Container className="py-10">
        <PageHeading
          eyebrow="Dự án & Sản phẩm"
          title="Ứng dụng & Dự án của tôi"
          description="Các hệ thống sản phẩm số, công cụ AI và giải pháp thiết kế được xây dựng từ bài toán thực tế trong giáo dục, truyền thông và công việc."
        />

        {projects.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🚀"
            title="Danh mục dự án đang được cập nhật"
            hint="Các dự án và sản phẩm số mới đang được biên tập hồ sơ chi tiết."
          />
        )}
      </Container>
    </SiteShell>
  );
}
