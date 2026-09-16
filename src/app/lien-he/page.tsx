import SiteShell from "@/components/SiteShell";
import ContactForm from "./ContactForm";
import { Card, CardHeader, Container, IconTile, PageHeading } from "@/components/ui";
import { IconChat, IconMail } from "@/components/ui/icons";
import { getSettings } from "@/lib/queries";
import type { SocialLinks } from "@/lib/types";

export const revalidate = 300;

export const metadata = {
  title: "Liên hệ",
  description: "Gửi lời nhắn cho Lê Xuân Thân.",
};

const SOCIAL: { key: keyof SocialLinks; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "tiktok", label: "TikTok" },
  { key: "github", label: "GitHub" },
];

export default async function LienHePage() {
  const settings = await getSettings();
  const social = settings.social ?? {};
  const links = SOCIAL.filter((s) => social[s.key]);

  return (
    <SiteShell>
      <Container className="py-10">
        <PageHeading
          eyebrow="Liên hệ"
          title="Gửi lời nhắn cho tôi"
          description="Hợp tác, góp ý, hay chỉ là hỏi han về một công cụ nào đó — cứ viết vào đây."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <Card padded={false} className="p-6 sm:p-8">
            <ContactForm />
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader icon={<IconMail className="h-4 w-4" />} title="Cách khác" />

              <ul className="space-y-4 text-sm">
                {settings.email && (
                  <li>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      Email
                    </p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="font-medium text-ink-900 transition-colors hover:text-brand-700"
                    >
                      {settings.email}
                    </a>
                  </li>
                )}

                {settings.phone && (
                  <li>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      Điện thoại
                    </p>
                    <a
                      href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                      className="font-medium text-ink-900 transition-colors hover:text-brand-700"
                    >
                      {settings.phone}
                    </a>
                  </li>
                )}

                {settings.location && (
                  <li>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                      Khu vực
                    </p>
                    <p className="font-medium text-ink-900">{settings.location}</p>
                  </li>
                )}
              </ul>

              {links.length > 0 && (
                <div className="mt-5 border-t border-line pt-5">
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-400">
                    Mạng xã hội
                  </p>
                  <ul className="space-y-2">
                    {links.map((s) => (
                      <li key={s.key}>
                        <a
                          href={social[s.key]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-ink-700 transition-colors hover:text-brand-700"
                        >
                          {s.label} →
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <Card className="bg-brand-50">
              <IconTile tone="brand" size="lg">
                <IconChat className="h-6 w-6" />
              </IconTile>
              <p className="mt-3 text-sm leading-relaxed text-ink-700">
                Mình đọc hết lời nhắn, nhưng thường trả lời theo đợt trong ngày chứ
                không ngay lập tức. Việc gấp thì gọi điện nhanh hơn.
              </p>
            </Card>
          </div>
        </div>
      </Container>
    </SiteShell>
  );
}
