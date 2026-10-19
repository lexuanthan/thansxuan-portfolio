import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import {
  ButtonLink,
  Card,
  Container,
  IconTile,
  PageHeading,
} from "@/components/ui";
import { IconArrow, IconCheck } from "@/components/ui/icons";
import { getServices, getSettings } from "@/lib/queries";
import type { Service } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Tư vấn & Hỗ trợ",
  description:
    "Đồng hành xây dựng chiến lược truyền thông, thiết kế thương hiệu, ứng dụng AI và phát triển tiện ích số.",
};

const DEFAULT_CONSULTING_SERVICES: Service[] = [
  {
    id: "ai-education-tools",
    title: "Ứng dụng AI & Công cụ số trong Giáo dục",
    description:
      "Tư vấn thiết kế hệ thống hướng nghiệp, trò chơi hóa hoạt động đào tạo và xây dựng tiện ích nội bộ cho trường học, đơn vị Đoàn – Hội.",
    icon: "🧭",
    bullets: [
      "Xây dựng cổng tư vấn hướng nghiệp & tra cứu dữ liệu tuyển sinh",
      "Thiết kế kịch bản Game Tập huấn trực tuyến tương tác cao",
      "Chuẩn hóa quy trình làm việc với trợ lý AI và hệ thống prompt",
    ],
    sort_order: 1,
    published: true,
    created_at: "1970-01-01T00:00:00.000Z",
    updated_at: "1970-01-01T00:00:00.000Z",
  },
  {
    id: "brand-media-system",
    title: "Thiết kế Hệ thống Thương hiệu & Truyền thông",
    description:
      "Đồng hành định vị hình mẫu thương hiệu, chuẩn hóa ngôn ngữ hình ảnh và xây dựng công cụ tự động hóa thiết kế ấn phẩm.",
    icon: "🎨",
    bullets: [
      "Định vị 12 hình mẫu thương hiệu & ma trận giọng điệu truyền thông",
      "Xây dựng bộ khung nhận diện và mẫu thiết kế Canvas đồng bộ",
      "Tối ưu quy trình sản xuất nội dung đa nền tảng",
    ],
    sort_order: 2,
    published: true,
    created_at: "1970-01-01T00:00:00.000Z",
    updated_at: "1970-01-01T00:00:00.000Z",
  },
];

export default async function TuVanPage() {
  const [dbServices, settings] = await Promise.all([getServices(), getSettings()]);
  const services = dbServices.length > 0 ? dbServices : DEFAULT_CONSULTING_SERVICES;

  return (
    <SiteShell>
      <Container className="py-10">
        <PageHeading
          eyebrow="Tư vấn & Đồng hành"
          title="Tư vấn & Hỗ trợ chuyên môn"
          description="Các hạng mục tôi có thể trực tiếp đồng hành cùng đơn vị, nhóm dự án hoặc cá nhân. Chọn chủ đề bên dưới để gửi thông tin trao đổi."
        />

        <div className="grid gap-5 md:grid-cols-2">
          {services.map((s) => (
            <Card key={s.id} className="flex flex-col justify-between">
              <div>
                <IconTile tone="brand" size="lg">
                  {s.icon || "💡"}
                </IconTile>

                <h2 className="mt-4 text-lg font-extrabold text-[#17243A]">{s.title}</h2>

                {s.description && (
                  <p className="mt-2 text-sm leading-relaxed text-[#4F5D73]">
                    {s.description}
                  </p>
                )}

                {s.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2.5">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[#17243A]">
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6 border-t border-[#EEF2F8] pt-4">
                <Link
                  href={`/lien-he?chu-de=${encodeURIComponent(s.title)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2864FF] transition-colors hover:text-[#1E54E6]"
                >
                  <span>Trao đổi về hạng mục này</span>
                  <IconArrow className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <section
          className="mt-8 overflow-hidden rounded-[12px] px-6 py-8 text-white shadow-[0_14px_34px_rgba(40,100,255,0.18)] sm:px-10"
          style={{
            background:
              "linear-gradient(125deg, #1A49C7 0%, #2864FF 54%, #4D84FF 100%)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Cần trao đổi về một bài toán cụ thể?
              </h2>
              <p className="mt-1.5 text-sm font-medium text-white/85">
                {settings.email
                  ? `Gửi thông tin qua biểu mẫu hoặc email trực tiếp tới ${settings.email}.`
                  : "Gửi lời nhắn qua biểu mẫu liên hệ, tôi sẽ phản hồi sớm nhất."}
              </p>
            </div>
            <ButtonLink
              href="/lien-he"
              tone="outline"
              className="border-white bg-white text-[#17243A] hover:bg-[#F5F8FF] hover:text-[#2864FF]"
            >
              Gửi lời nhắn
              <IconArrow className="h-4 w-4 text-[#2864FF]" />
            </ButtonLink>
          </div>
        </section>
      </Container>
    </SiteShell>
  );
}
