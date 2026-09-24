import { StudentCareerProfile, CareerMatchResult, MajorMatchResult, PersonalRoadmap } from "./types";

export interface CoachContext {
  profile: StudentCareerProfile;
  topCareers: CareerMatchResult[];
  topMajors: MajorMatchResult[];
  targetRoadmap?: PersonalRoadmap | null;
}

export function buildCoachSystemPrompt(context: CoachContext): string {
  const { profile, topCareers, topMajors, targetRoadmap } = context;

  const topCareerStr = topCareers
    .slice(0, 3)
    .map((c) => `- ${c.career.name} (Khớp: ${c.score}% - ${c.label})`)
    .join("\n");

  const topMajorStr = topMajors
    .slice(0, 3)
    .map((m) => `- ${m.major.name} (Khớp: ${m.score}% - ${m.label})`)
    .join("\n");

  const topInterests = Object.entries(profile.interests)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k} (${v}/100)`)
    .join(", ");

  const topCaps = Object.entries(profile.capabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k} (${v}/100)`)
    .join(", ");

  const rankedValues = profile.ranked_values.slice(0, 3).join(", ");
  const negatives = profile.negative_preferences.join(", ");

  return `Bạn là "AI Career Coach" — Cố vấn Hướng nghiệp và Trí tuệ Quyết định Nghề nghiệp cấp cao (Senior Career Decision Intelligence Coach).
Bạn đang đồng hành cùng một học sinh/sinh viên Việt Nam để giúp họ hiểu rõ bản thân, chọn ngành, chọn nghề và lên lộ trình thực tế.

HỒ SƠ NGƯỜI DÙNG HIỆN TẠI:
- Đối tượng: ${profile.user_context.user_type} (Trình độ: ${profile.user_context.education_level})
- Hình mẫu nghề nghiệp: "${profile.profile_archetype.title}" - ${profile.profile_archetype.tagline}
- Điểm mạnh nổi bật: ${topCaps}
- Hứng thú hàng đầu: ${topInterests}
- Giá trị nghề nghiệp coi trọng nhất: ${rankedValues}
- Tiêu chí muốn tránh né: ${negatives || "Không có"}
- Top nghề nghiệp tương thích nhất:
${topCareerStr}
- Top ngành học tương thích nhất:
${topMajorStr}
- Mục tiêu đang theo đuổi: ${targetRoadmap ? targetRoadmap.target_career_name : "Chưa chọn mục tiêu cụ thể"}

NGUYÊN TẮC HÀNH VI CỐT LÕI (BẮT BUỘC TUÂN THỦ):
1. Giọng điệu: Thấu cảm, truyền cảm hứng, khách quan, dựa trên dữ liệu, mang tính hành động.
2. TUYỆT ĐỐI KHÔNG dùng câu áp đặt như: "Bạn chắc chắn nên học ngành này" hay "Bạn nhất định sẽ thành công".
   Hãy dùng cách diễn đạt định hướng: "Dựa trên hồ sơ năng lực phân tích và sở thích của bạn, đây là một trong những hướng đi có xác suất phù hợp cao đáng để bạn ưu tiên kiểm chứng."
3. Minh bạch & giải thích (Explainable): Khi khen hoặc khuyên điều gì, hãy chỉ ra căn cứ từ hồ sơ (do năng lực nào, sở thích nào).
4. Thực tế thị trường: Trung thực chỉ ra những thách thức (áp lực cạnh tranh, tác động của AI, yêu cầu tự học).
5. Luôn kết thúc câu trả lời bằng 1 câu hỏi gợi mở hoặc 1 hành động vi mô (Micro-action) cụ thể mà người dùng có thể làm ngay hôm nay.
6. Ngôn ngữ: Tiếng Việt tự nhiên, chuẩn mực, hiện đại, gần gũi với giới trẻ nhưng chuyên nghiệp.`;
}

/**
 * Bộ sinh câu trả lời cố vấn cục bộ thông minh (Deterministic Offline Fallback Coach)
 * Đảm bảo hệ thống hoạt động mượt mà 100% kể cả khi không có kết nối internet hoặc API hết quota.
 */
export function generateSmartLocalCoachResponse(
  userQuery: string,
  context: CoachContext
): string {
  const q = userQuery.toLowerCase();
  const { profile, topCareers, topMajors, targetRoadmap } = context;
  const bestCareer = topCareers[0]?.career;
  const bestMajor = topMajors[0]?.major;

  if (q.includes("tại sao") || q.includes("phù hợp") || q.includes("vì sao")) {
    return `Chào bạn! Dựa trên phân tích Career DNA, bạn đạt độ tương thích cao với **${bestCareer?.name || "nhóm ngành Công nghệ / Dữ liệu"}** (khoảng ${topCareers[0]?.score || 88}%) nhờ 3 điểm tựa vững chắc sau:

1. **Sở trường tư duy**: Năng lực phân tích và giải quyết vấn đề của bạn ở nhóm dẫn đầu, rất ăn khớp với việc bóc tách số liệu và logic của ngành.
2. **Hứng thú tự nhiên**: Bạn có mức độ tò mò tự thân cao với công nghệ và ứng dụng thực tiễn, giúp bạn vượt qua giai đoạn học kiến thức nền tảng một cách bền bỉ.
3. **Giá trị nghề nghiệp**: Kỳ vọng về sự tự chủ và mức thu nhập tốt của bạn tương đồng với biểu đồ phát triển sự nghiệp của vị trí này trên thị trường Việt Nam.

Tuy nhiên, vị trí này đòi hỏi khả năng kiên trì tự học liên tục vì công cụ cập nhật rất nhanh. Bạn đã thử thực hiện thử nghiệm 3 giờ với bài tập mẫu chưa?`;
  }

  if (q.includes("so sánh") || q.includes("khác nhau") || q.includes("chọn ngành nào")) {
    const c1 = topCareers[0]?.career?.name || "Khoa học Dữ liệu";
    const c2 = topCareers[1]?.career?.name || "Kỹ thuật Phần mềm";
    return `Đây là một câu hỏi rất chất lượng! Cả hai hướng đi này đều nằm trong top khuyến nghị cho hồ sơ của bạn, nhưng có những khác biệt cốt lõi:

- **${c1}**: Tập trung vào câu hỏi *"Dữ liệu này nói lên điều gì và ta nên ra quyết định thế nào?"*. Đòi hỏi tư duy thống kê, phát hiện quy luật và kỹ năng kể chuyện qua số liệu (Data Storytelling).
- **${c2}**: Tập trung vào câu hỏi *"Làm sao để hệ thống này chạy nhanh, bảo mật và chịu tải hàng triệu người dùng?"*. Đòi hỏi tư duy kiến trúc hệ thống, cấu trúc dữ liệu và sự kiên nhẫn sửa lỗi mã lệnh.

Đối với cá nhân bạn, phong cách tư duy của bạn đang hơi nghiêng nhẹ về bên **${c1}**. Bạn thích cảm giác 'tìm ra insight mới' hay thích cảm giác 'tự tay xây xong một app hoàn chỉnh' hơn?`;
  }

  if (q.includes("toán") || q.includes("yếu toán") || q.includes("không giỏi")) {
    return `Nỗi lo này rất phổ biến và hoàn toàn chính đáng! Hãy nhìn thẳng vào sự thật:

Trong công việc thực tế hiện đại, các công cụ máy tính và thư viện AI đã giải quyết phần tính toán chi tiết. Điều một chuyên viên cần không phải là thuộc lòng công thức tích phân phức tạp, mà là **Tư duy Logic Định lượng**:
- Hiểu ý nghĩa của các con số (tại sao chỉ số này tăng, chỉ số kia giảm).
- Nhận biết mối tương quan nhân quả.

Nếu điểm Toán hiện tại của bạn chưa như ý, bạn hoàn toàn có thể chọn các hướng thiên về **Phân tích Nghiệp vụ (BA)**, **Quản trị Sản phẩm (Product)** hoặc **Thiết kế UI/UX** — nơi tư duy người dùng và giao tiếp quan trọng hơn việc giải phương trình vi phân. Bạn cảm thấy mình thích làm việc với con người hay thuần túy với máy móc hơn?`;
  }

  if (q.includes("lớp 12") || q.includes("chuẩn bị") || q.includes("bắt đầu từ đâu") || q.includes("lộ trình")) {
    return `Nếu bạn đang ở giai đoạn nước rút, đây là chiến lược '3 Chân Kiềng' mà tôi đề xuất bạn nên làm ngay trong tháng này:

1. **Giữ vững tổ hợp điểm thi**: Tập trung tối đa vào 3 môn xét tuyển chính (Toán, Anh, Văn/Lý) để mở rộng cánh cửa vào các trường đại học top đầu như ĐHQG, Bách Khoa hay Kinh tế.
2. **Trải nghiệm 1 thử nghiệm vi mô**: Dành 1 buổi chiều cuối tuần làm bài thực hành nhỏ (như xem 1 case study hoặc tự viết 1 trang web đơn giản) để xác nhận cảm xúc thật.
3. **Khám phá Chặng 1 của Lộ trình (Roadmap)**: Tôi đã tạo sẵn lộ trình 7 ngày & 30 ngày trong mục **Lộ trình cá nhân** trên ứng dụng.

Bạn muốn cùng tôi xem qua mục nào đầu tiên trong lộ trình 7 ngày?`;
  }

  // Câu trả lời tổng quan
  return `Chào bạn! Tôi là AI Career Coach được huấn luyện dựa trên mô hình Career Decision Intelligence. 

Qua hồ sơ của bạn với danh hiệu **"${profile.profile_archetype.title}"**, tôi nhận thấy bạn có tiềm năng vượt trội trong việc gắn kết giữa tư duy logic và giải pháp thực tế.

Hiện tại tôi đang theo dõi 3 ưu tiên nghề nghiệp phù hợp nhất với bạn:
${topCareers.slice(0, 3).map((c, i) => `${i + 1}. **${c.career.name}** (${c.score}% match)`).join("\n")}

Bạn đang băn khoăn nhất ở điểm nào: Nên chọn trường nào? Kỹ năng nào cần học trước? Hay muốn so sánh các ngành học cụ thể?`;
}
