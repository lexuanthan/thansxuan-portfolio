import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { UniversityLookup } from "@/components/UniversityLookup";
import { Card, Chip, Container } from "@/components/ui";
import { IconArrow } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Tra cứu Điểm chuẩn & Trường Đại học Toàn quốc",
  description:
    "Công cụ tra cứu điểm chuẩn, học phí, ngành đào tạo và ngữ cảnh thang điểm của hơn 200 trường đại học trên toàn quốc.",
};

export default function UniversityLookupPage() {
  return (
    <SiteShell>
      <Container className="py-8 sm:py-10">
        {/* Thanh điều hướng gọn về Kho tiện ích & Trang chủ */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
            <Link
              href="/"
              className="font-medium transition-colors hover:text-brand-600"
            >
              Trang chủ
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href="/ai-tools"
              className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-brand-600"
            >
              Kho tiện ích
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-ink-900">Tra cứu đại học</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-ink-900 sm:text-3xl">
                  Tra cứu Điểm chuẩn &amp; Trường Đại học
                </h1>
                <Chip tone="emerald">Sẵn sàng</Chip>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm text-ink-500">
                Tra cứu nhanh theo tên trường, mã trường, khu vực và loại hình đào tạo kèm đối chiếu thang điểm xét tuyển.
              </p>
            </div>

            <Link
              href="/ai-tools/career-guidance?tab=assessment"
              className="inline-flex items-center gap-1.5 rounded-btn bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-brand transition-colors hover:bg-brand-600"
            >
              <span>Làm trắc nghiệm Career DNA</span>
              <IconArrow className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        <Card className="p-4 sm:p-6">
          <UniversityLookup />
        </Card>
      </Container>
    </SiteShell>
  );
}
