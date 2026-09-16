import SiteShell from "@/components/SiteShell";
import { Container, EmptyState, PageHeading } from "@/components/ui";
import { IconArrow } from "@/components/ui/icons";
import { getAiTools } from "@/lib/queries";
import { statusClassName, type AiTool } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "AI Tools",
  description: "Bộ công cụ AI tự phát triển và các công cụ tôi dùng hằng ngày.",
};

function ToolCard({ tool }: { tool: AiTool }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div
          aria-hidden="true"
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${
            tool.color || "from-brand-100 to-brand-200"
          }`}
        >
          {tool.icon || "✨"}
        </div>

        {tool.status && (
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassName(
              tool.status_color
            )}`}
          >
            {tool.status}
          </span>
        )}
      </div>

      <h2 className="mt-4 font-bold leading-snug text-ink-900">{tool.title}</h2>

      {tool.description && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-500">
          {tool.description}
        </p>
      )}

      {tool.link_url && (
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
          Dùng thử ngay <IconArrow className="h-4 w-4" />
        </span>
      )}
    </>
  );

  const cls =
    "flex flex-col rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-lift";

  if (!tool.link_url) return <article className={cls}>{body}</article>;

  return (
    <a
      href={tool.link_url}
      className={cls}
      {...(tool.link_url.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {body}
    </a>
  );
}

export default async function AiToolsPage() {
  const tools = await getAiTools();

  return (
    <SiteShell>
      <Container className="py-10">
        <PageHeading
          eyebrow="AI Tools"
          title="Công cụ AI hữu ích"
          description="Một phần là công cụ tôi tự viết để giải quyết việc của mình, phần còn lại là những nền tảng tôi dùng thật và thấy đáng giới thiệu."
        />

        {tools.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="✨"
            title="Chưa có công cụ nào được đăng"
            hint="Vào Quản trị → Tool AI để thêm mục đầu tiên."
          />
        )}
      </Container>
    </SiteShell>
  );
}
