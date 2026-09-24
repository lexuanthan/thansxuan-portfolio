import SiteShell from "@/components/SiteShell";
import { Container } from "@/components/ui";
import CareerGuidanceApp from "@/components/career-guidance/CareerGuidanceApp";

export const metadata = {
  title: "AI Career Guidance Platform — Trí tuệ Hướng nghiệp & Ra Quyết định Nghề nghiệp",
  description:
    "Hệ thống hỗ trợ ra quyết định nghề nghiệp toàn diện kết hợp đánh giá thích ứng, so khớp tất định, phân tích khoảng trống kỹ năng, lộ trình hành động và Trợ lý AI Khai vấn đồng hành.",
};

export default function CareerGuidancePage() {
  return (
    <SiteShell>
      <Container className="py-8 sm:py-10 max-w-7xl">
        <CareerGuidanceApp />
      </Container>
    </SiteShell>
  );
}
