import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import BrandStrategyStudio from "@/components/brand-strategy/BrandStrategyStudio";
import { Chip, Container, PageHeading } from "@/components/ui";
import { IconArrow } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "AI Brand Voice & Strategy Studio — Kiến tạo bản sắc thương hiệu",
  description:
    "Công cụ chiến lược thương hiệu và xây dựng AI Brand Persona tự hành: xác định 12 hình mẫu Carl Jung, ma trận quy tắc tông giọng và xuất System Prompt chuẩn hóa cho AI.",
};

export default function BrandStrategyPage() {
  return (
    <SiteShell>
      <Container className="py-10">
        <header className="mb-8">
          <Link
            href="/ai-tools"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors hover:text-brand-700"
          >
            <IconArrow className="h-4 w-4 rotate-180" />
            Tất cả AI Tools
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-ink-900 sm:text-4xl">
              Brand Voice &amp; Strategy Studio
            </h1>
            <Chip tone="emerald">Sẵn sàng sử dụng</Chip>
          </div>

          <p className="mt-3 max-w-3xl leading-relaxed text-ink-500">
            Một công cụ chuyên sâu dành cho Brand Marketer, Content Creator và các nhà sáng lập.
            Kết hợp tâm lý học hành vi (12 Jungian Archetypes) với công nghệ Generative AI để tạo nên
            tuyên bố định vị, ma trận giọng điệu chuẩn xác và trích xuất đoạn AI System Prompt hoàn chỉnh
            để nạp vào ChatGPT, Claude hay Gemini.
          </p>
        </header>

        <BrandStrategyStudio />
      </Container>
    </SiteShell>
  );
}
