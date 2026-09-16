import SiteShell from "@/components/SiteShell";
import {
  Chip,
  Container,
  EmptyState,
  IconTile,
  PageHeading,
  toneForLabel,
} from "@/components/ui";
import { IconArrow } from "@/components/ui/icons";
import { getResources } from "@/lib/queries";
import { plainText, truncate } from "@/lib/format";
import type { Resource } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Tài nguyên",
  description: "Bộ sưu tập công cụ, mẫu tài liệu và nguồn học hữu ích được chọn lọc.",
};

/** Nhãn hiển thị cho từng loại tài nguyên. */
const KIND_LABELS: Record<string, string> = {
  link: "Liên kết",
  file: "Tệp tải về",
  template: "Mẫu dùng lại",
  course: "Khoá học",
  tool: "Công cụ",
};

function ResourceCard({ resource }: { resource: Resource }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <IconTile tone={toneForLabel(resource.title)} size="lg">
          {resource.icon || "📦"}
        </IconTile>
        <Chip tone="neutral">{KIND_LABELS[resource.kind] ?? resource.kind}</Chip>
      </div>

      <h2 className="mt-4 font-bold leading-snug text-ink-900">{resource.title}</h2>

      {resource.description && (
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          {truncate(plainText(resource.description), 150)}
        </p>
      )}

      {resource.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {resource.tags.slice(0, 4).map((t) => (
            <Chip key={t} tone={toneForLabel(t)}>
              {t}
            </Chip>
          ))}
        </div>
      )}

      {resource.url && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
          Mở tài nguyên <IconArrow className="h-4 w-4" />
        </span>
      )}
    </>
  );

  const cls =
    "block rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-lift";

  if (!resource.url) return <article className={cls}>{body}</article>;

  return (
    <a
      href={resource.url}
      className={cls}
      {...(resource.url.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {body}
    </a>
  );
}

export default async function TaiNguyenPage() {
  const resources = await getResources();

  return (
    <SiteShell>
      <Container className="py-10">
        <PageHeading
          eyebrow="Tài nguyên"
          title="Kho tài nguyên chọn lọc"
          description="Những công cụ, mẫu tài liệu và nguồn học mà tôi thực sự dùng trong công việc, gom lại một chỗ cho đỡ mất công tìm."
        />

        {resources.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📚"
            title="Kho tài nguyên còn trống"
            hint="Vào Quản trị → Tài nguyên để thêm mục đầu tiên."
          />
        )}
      </Container>
    </SiteShell>
  );
}
