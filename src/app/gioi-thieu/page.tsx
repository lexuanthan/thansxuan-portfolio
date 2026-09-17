import SiteShell from "@/components/SiteShell";
import {
  ButtonLink,
  Card,
  CardHeader,
  Chip,
  Container,
  EmptyState,
  IconTile,
  PageHeading,
  toneForLabel,
} from "@/components/ui";
import { IconArrow, IconChart, IconCheck, IconUser } from "@/components/ui/icons";
import HtmlContent from "@/components/HtmlContent";
import RichText from "@/components/RichText";
import { looksLikeHtml } from "@/lib/html";
import { previewText, truncate } from "@/lib/format";
import { getAbout, getSettings } from "@/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Giới thiệu",
  description: "Đôi nét về Lê Xuân Thân — hành trình, kỹ năng và giá trị theo đuổi.",
};

export default async function GioiThieuPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);

  return (
    <SiteShell>
      <Container className="py-10">
        {/*
          Đoạn mô tả dưới tiêu đề chỉ là một dòng tóm tắt. Trước đây nó nhận cả
          bài bio — bio giờ lưu HTML nên đổ thẳng vào đây sẽ lòi ra đống thẻ, mà
          để nguyên cũng quá dài cho một dòng dẫn.
        */}
        <PageHeading
          eyebrow="Giới thiệu"
          title={about.heading || "Đôi nét về tôi"}
          description={
            truncate(previewText(about.bio), 180) ||
            "Người sáng tạo nội dung và xây dựng ứng dụng công nghệ, luôn tìm cách biến ý tưởng thành công cụ dùng được."
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            {/* Bio đầy đủ */}
            {about.bio && (
              <Card>
                <CardHeader
                  icon={<IconUser className="h-4 w-4" />}
                  title="Về tôi"
                />
                {looksLikeHtml(about.bio) ? (
                  <HtmlContent html={about.bio} />
                ) : (
                  <RichText
                    text={about.bio}
                    className="space-y-4"
                    paragraphClassName="text-[15px] leading-[1.9] text-ink-700"
                  />
                )}
              </Card>
            )}

            {/* Hành trình */}
            <Card>
              <CardHeader icon={<IconChart className="h-4 w-4" />} title="Hành trình" />

              {about.journey.length > 0 ? (
                <ol className="relative space-y-6 border-l-2 border-brand-100 pl-6">
                  {about.journey.map((j, i) => (
                    <li key={i} className="relative">
                      {/* Chấm mốc nằm đè lên đường kẻ dọc */}
                      <span
                        aria-hidden="true"
                        className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-brand-400"
                      />
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
                        {j.year}
                      </p>
                      <h3 className="mt-1 font-bold text-ink-900">{j.title}</h3>
                      {j.desc && (
                        <p className="mt-1 text-sm leading-relaxed text-ink-500">{j.desc}</p>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  icon="🗺️"
                  title="Chưa có mốc hành trình nào"
                  hint="Thêm trong Quản trị → Trang giới thiệu."
                />
              )}
            </Card>

            {/* Giá trị theo đuổi */}
            {about.core_values.length > 0 && (
              <Card>
                <CardHeader
                  icon={<IconCheck className="h-4 w-4" />}
                  tone="emerald"
                  title="Giá trị tôi theo đuổi"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  {about.core_values.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-card border border-line bg-surface-soft p-4"
                    >
                      <IconTile tone="brand" size="md">
                        {v.icon || "✦"}
                      </IconTile>
                      <h3 className="mt-3 font-bold text-ink-900">{v.title}</h3>
                      {v.desc && (
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                          {v.desc}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Cột phải */}
          <div className="space-y-6">
            {about.skills.length > 0 && (
              <Card>
                <CardHeader
                  icon={<IconUser className="h-4 w-4" />}
                  tone="violet"
                  title="Kỹ năng"
                />
                <div className="space-y-5">
                  {about.skills.map((g, i) => (
                    <div key={i}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-400">
                        {g.category}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {g.items.map((item) => (
                          <Chip key={item} tone={toneForLabel(item)}>
                            {item}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-brand-200 to-brand-100">
              <h2 className="text-lg font-extrabold text-ink-900">
                Muốn trao đổi thêm?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                Mình luôn sẵn sàng nghe ý tưởng, góp ý hoặc bàn chuyện hợp tác.
              </p>
              <ButtonLink href="/lien-he" tone="primary" className="mt-4 w-full">
                Gửi lời nhắn
                <IconArrow className="h-4 w-4" />
              </ButtonLink>
              {settings.email && (
                <p className="mt-3 text-center text-xs text-ink-700">
                  hoặc email {settings.email}
                </p>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </SiteShell>
  );
}
