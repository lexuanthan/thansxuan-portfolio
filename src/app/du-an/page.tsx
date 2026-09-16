import SiteShell from "@/components/SiteShell";
import {
  Chip,
  Container,
  EmptyState,
  PageHeading,
  toneForLabel,
} from "@/components/ui";
import { IconArrow } from "@/components/ui/icons";
import { getProjects } from "@/lib/queries";
import { plainText, truncate } from "@/lib/format";
import type { Project } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Ứng dụng & Dự án",
  description: "Các ứng dụng web và dự án do Lê Xuân Thân tự phát triển.",
};

function ProjectCard({ project }: { project: Project }) {
  const body = (
    <>
      {project.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.image_url}
          alt=""
          loading="lazy"
          className="mb-4 h-40 w-full rounded-xl object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className={`mb-4 flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br text-4xl font-extrabold text-ink-700/60 ${
            project.color || "from-brand-100 to-brand-200"
          }`}
        >
          {project.title.trim().charAt(0).toUpperCase()}
        </div>
      )}

      <h2 className="font-bold leading-snug text-ink-900">{project.title}</h2>

      {project.description && (
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          {truncate(plainText(project.description), 150)}
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

      {project.link_url && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
          Truy cập ngay <IconArrow className="h-4 w-4" />
        </span>
      )}
    </>
  );

  const cls =
    "block rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-lift";

  if (!project.link_url) {
    return <article className={cls}>{body}</article>;
  }

  return (
    <a
      href={project.link_url}
      className={cls}
      {...(project.link_url.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {body}
    </a>
  );
}

export default async function DuAnPage() {
  const projects = await getProjects();

  return (
    <SiteShell>
      <Container className="py-10">
        <PageHeading
          eyebrow="Dự án"
          title="Ứng dụng & Dự án của tôi"
          description="Những thứ tôi tự xây để giải quyết một việc cụ thể trong công việc hằng ngày, rồi mở ra cho mọi người cùng dùng."
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
            title="Chưa có dự án nào được đăng"
            hint="Vào Quản trị → Ứng dụng & Dự án để thêm mục đầu tiên."
          />
        )}
      </Container>
    </SiteShell>
  );
}
