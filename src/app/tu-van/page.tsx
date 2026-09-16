import SiteShell from "@/components/SiteShell";
import {
  ButtonLink,
  Card,
  Container,
  EmptyState,
  IconTile,
  PageHeading,
} from "@/components/ui";
import { IconArrow, IconCheck } from "@/components/ui/icons";
import { getServices, getSettings } from "@/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Tư vấn & Hỗ trợ",
  description:
    "Các mảng tôi có thể đồng hành: thương hiệu, nội dung, ứng dụng AI và triển khai website.",
};

export default async function TuVanPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);

  return (
    <SiteShell>
      <Container className="py-10">
        <PageHeading
          eyebrow="Tư vấn"
          title="Tư vấn & Hỗ trợ"
          description="Những mảng tôi làm hằng ngày và có thể đồng hành cùng anh chị. Cứ nhắn trước để trao đổi xem có hợp việc không đã, không cần vội."
        />

        {services.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((s) => (
              <Card key={s.id} className="flex flex-col">
                <IconTile tone="brand" size="lg">
                  {s.icon || "💡"}
                </IconTile>

                <h2 className="mt-4 text-lg font-bold text-ink-900">{s.title}</h2>

                {s.description && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {s.description}
                  </p>
                )}

                {s.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2.5">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-ink-700">
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="💬"
            title="Chưa có hạng mục tư vấn nào"
            hint="Vào Quản trị → Tư vấn để thêm hạng mục đầu tiên."
          />
        )}

        <section className="mt-8 overflow-hidden rounded-card-lg bg-gradient-to-r from-brand-300 to-brand-100 px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-ink-900">
                Có việc muốn bàn? Cứ nhắn nhé.
              </h2>
              <p className="mt-1.5 text-sm font-medium text-ink-700">
                {settings.email
                  ? `Gửi form hoặc email trực tiếp tới ${settings.email}.`
                  : "Gửi lời nhắn qua form, tôi đọc và trả lời sớm nhất có thể."}
              </p>
            </div>
            <ButtonLink href="/lien-he" tone="primary">
              Gửi lời nhắn
              <IconArrow className="h-4 w-4" />
            </ButtonLink>
          </div>
        </section>
      </Container>
    </SiteShell>
  );
}
