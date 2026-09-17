import SiteShell from "@/components/SiteShell";
import { Card, Container, PageHeading } from "@/components/ui";
import SurveyWizard from "@/components/huongnghiep/SurveyWizard";

export const metadata = {
  title: "Hướng nghiệp — khảo sát xu hướng học tập và nghề nghiệp",
  description:
    "Bộ khảo sát 62 câu dựng hồ sơ xu hướng học tập, năng lực và giá trị nghề nghiệp, rồi so khớp với đặc trưng của ngành đào tạo.",
};

export default function HuongNghiepPage() {
  return (
    <SiteShell>
      <Container className="py-10">
        <PageHeading
          eyebrow="AI Tools"
          title="Hồ sơ xu hướng học tập & nghề nghiệp"
          description="62 câu hỏi dựng nên hồ sơ của bạn, rồi đối chiếu với đặc trưng của ngành đào tạo. Kết quả là một góc nhìn dựa trên dữ liệu, không phải lời khuyên nên chọn ngành nào."
        />

        {/*
          Nói rõ ngay từ đầu hệ thống này làm gì và KHÔNG làm gì. Một công cụ
          hướng nghiệp rất dễ bị đọc thành lời phán về tương lai; nói trước thì
          người dùng đọc kết quả với đúng mức tin cần có.
        */}
        <Card className="mb-8 bg-surface-soft">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-bold text-ink-900">Công cụ này làm gì</p>
              <ul className="space-y-1.5 text-sm leading-relaxed text-ink-700">
                <li>• Dựng hồ sơ về sở thích, năng lực tự đánh giá, cách học và giá trị nghề nghiệp</li>
                <li>• Đo mức tương thích giữa hồ sơ ấy và đặc trưng của ngành</li>
                <li>• Chỉ ra bạn gần ngành ở điểm nào, còn cách ở điểm nào</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-ink-900">Công cụ này không làm gì</p>
              <ul className="space-y-1.5 text-sm leading-relaxed text-ink-700">
                <li>• Không đoán bạn có đậu hay không</li>
                <li>• Không dự đoán thu nhập hay khả năng thành công</li>
                <li>• Không phải trắc nghiệm tính cách</li>
                <li>• Không quyết định thay bạn</li>
              </ul>
            </div>
          </div>

          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-400">
            Bản dựng thử: mọi phép tính chạy ngay trong trình duyệt và câu trả lời của
            bạn được lưu trên máy bạn, chưa gửi đi đâu. Dữ liệu ngành đang dùng là bộ
            mẫu phát triển, chưa phải số liệu tuyển sinh chính thức.
          </p>
        </Card>

        <SurveyWizard />
      </Container>
    </SiteShell>
  );
}
