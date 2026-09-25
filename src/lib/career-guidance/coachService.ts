import { StudentCareerProfile, CareerMatchResult, MajorMatchResult, PersonalRoadmap } from "./types";
import {
  extractRealtimeFact,
  REALTIME_METADATA,
  REALTIME_UNIVERSITIES
} from "./realtimeMarketData";

export interface CoachContext {
  profile: StudentCareerProfile;
  topCareers: CareerMatchResult[];
  topMajors?: MajorMatchResult[];
  targetRoadmap?: PersonalRoadmap | null;
}

export function buildCoachSystemPrompt(context: CoachContext): string {
  const { profile, topCareers, topMajors = [], targetRoadmap } = context;

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
  const spk = REALTIME_UNIVERSITIES.SPK;

  return `Bạn là "AI Career Coach" — người cố vấn hướng nghiệp và người bạn đồng hành tin cậy của học sinh, sinh viên tại Trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE) và các trường đại học hàng đầu Việt Nam.

PHONG CÁCH VÀ NGUYÊN TẮC GIAO TIẾP:
1. Xưng hô: Dùng "mình" và "bạn", hoặc "Coach" và "bạn". Giọng văn ấm áp, gần gũi, truyền cảm hứng như một người anh/chị khóa trên hoặc mentor tận tâm.
2. Trả lời GỌN VÀ ĐI THẲNG VÀO TRỌNG TÂM:
   - Câu đầu tiên: Trả lời trực diện băn khoăn của bạn.
   - Thân bài: 2 - 3 gạch đầu dòng đắt giá, súc tích (có dẫn chứng năng lực và số liệu thực tế).
   - Câu kết: 1 gợi ý hành động cụ thể (Micro-action) bạn có thể làm ngay hôm nay.
3. Độ chính xác & Dữ liệu Realtime (${REALTIME_METADATA.academicYear}):
   - Dẫn chiếu số liệu điểm chuẩn, học phí và dải lương thị trường mới nhất đã được kiểm chứng.
   - Điểm chuẩn ${spk.shortName}: Robot & AI (~26.75đ), CNTT (~26.5đ), Kỹ thuật Phần mềm (~26.0đ), Ô tô (~26.25đ), Vi mạch (~26.2đ). ĐGNL an toàn từ 850+ điểm.
   - Học phí ${spk.shortName}: ${spk.tuitionYear.standard}. CLC tiếng Việt ~45–52 triệu/năm; CLC tiếng Anh ~58–65 triệu/năm.
   - Lương thị trường: Fresher (10–16 triệu/tháng), 2-3 năm KN (20–35 triệu/tháng), Senior/Lead (45–75+ triệu/tháng).
   - Tác động của AI: Thẳng thắn, khách quan. AI tự động hóa việc lặp lại; người làm chủ AI và có tư duy logic giải quyết vấn đề sẽ phát triển vượt bậc.

HỒ SƠ NGƯỜI DÙNG HIỆN TẠI (DỮ LIỆU ĐÃ XÁC THỰC):
- Đối tượng: ${profile.user_context.user_type} (Trình độ: ${profile.user_context.education_level})
- Hình mẫu nghề nghiệp: "${profile.profile_archetype.title}" - ${profile.profile_archetype.tagline}
- Năng lực nổi bật: ${topCaps}
- Hứng thú hàng đầu: ${topInterests}
- Giá trị nghề nghiệp coi trọng nhất: ${rankedValues}
- Tiêu chí muốn tránh né: ${negatives || "Không có"}
- Top nghề nghiệp tương thích:
${topCareerStr}
- Top ngành học tương thích:
${topMajorStr}
- Mục tiêu đang hướng tới: ${targetRoadmap ? targetRoadmap.target_career_name : (topCareers[0]?.career.name || "Chưa chọn cụ thể")}`;
}

export interface SmartCoachResult {
  reply: string;
  reasoning_summary: string;
  evidence: string[];
  uncertainty?: string;
  suggested_actions?: string[];
  is_realtime_fact?: boolean;
}

/**
 * Bộ sinh câu trả lời cố vấn thông minh tự nhiên, gọn gàng, cập nhật dữ liệu realtime
 */
export function generateSmartCoachFullResponse(
  userQuery: string,
  context: CoachContext,
  actionType?: string
): SmartCoachResult {
  const q = userQuery.toLowerCase().trim();
  const { profile, topCareers, topMajors = [], targetRoadmap } = context;
  const bestCareer = topCareers[0]?.career;
  const secondCareer = topCareers[1]?.career;
  const targetName = targetRoadmap?.target_career_name || bestCareer?.name || "ngành nghề mục tiêu";

  // 0. ƯU TIÊN KIỂM TRA TRUY VẤN DỮ LIỆU REALTIME CỤ THỂ (Học phí, Điểm chuẩn, Mức lương, AI)
  const realtimeFact = extractRealtimeFact(userQuery);
  if (realtimeFact && !actionType) {
    return {
      reply: `Chào bạn! Về thông tin thực tế bạn đang tìm hiểu, mình gửi bạn số liệu chính xác được cập nhật mới nhất cho năm học **${REALTIME_METADATA.academicYear}** nhé:\n\n${realtimeFact}\n\nBạn có muốn mình tư vấn thêm về phương án xét tuyển hay cách nâng cao cơ hội trúng tuyển vào các ngành này không?`,
      reasoning_summary: "Trích xuất trực tiếp từ cổng dữ liệu Tuyển sinh & Thị trường lao động Realtime 2025-2026.",
      evidence: [
        `Nguồn dữ liệu: ${REALTIME_METADATA.dataSource}`,
        `Kỳ tuyển sinh: ${REALTIME_METADATA.academicYear} (Kiểm duyệt: ${REALTIME_METADATA.lastVerifiedDate})`,
        "Dữ liệu chính thức từ HCMUTE và khảo sát việc làm thực tế"
      ],
      suggested_actions: [
        "Xem điểm chuẩn chi tiết trong University Explorer",
        "Hỏi về cơ hội học bổng và hỗ trợ học phí",
        "Đối chiếu phương thức thi ĐGNL và THPT"
      ],
      is_realtime_fact: true
    };
  }

  // 1. CONTEXTUAL ACTION: GIẢI THÍCH (Explain)
  if (
    actionType === "explain" ||
    q.includes("tại sao") ||
    q.includes("phù hợp") ||
    q.includes("vì sao") ||
    q.includes("giải thích")
  ) {
    const topCaps = Object.entries(profile.capabilities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k, v]) => `${k} (${v}/100)`)
      .join(", ");

    return {
      reply: `Chào bạn! Nhìn vào phân tích **Career DNA**, mình thấy bạn và vị trí **${bestCareer?.name || "ngành này"}** (độ tương thích **${topCareers[0]?.score || 88}%**) có 3 điểm tựa rất ăn khớp:\n\n- **Tư duy ăn ý**: Điểm nổi bật về ${topCaps} giúp bạn giải mã các bài toán phức tạp một cách mạch lạc, không bị nản khi đối mặt vấn đề khó.\n- **Động lực tự thân**: Sự tò mò tự nhiên giúp bạn chủ động tìm tòi kiến thức mới, rất phù hợp với tính chất vận động liên tục của ngành.\n- **Kỳ vọng nghề nghiệp**: Giá trị về *${profile.ranked_values.slice(0, 2).join(", ")}* mà bạn xem trọng hoàn toàn tương thích với văn hóa làm việc và tiềm năng thu nhập của lĩnh vực này.\n\n💡 *Hành động nhỏ hôm nay*: Bạn hãy thử tìm xem 1 video "A day in the life of ${bestCareer?.name}" để cảm nhận nhịp làm việc thực tế trước nhé!`,
      reasoning_summary: "Đối soát tương thích giữa năng lực tư duy Career DNA và yêu cầu công việc thực tế.",
      evidence: [
        `Hình mẫu "${profile.profile_archetype.title}" tương thích ${topCareers[0]?.score || 88}% với ${bestCareer?.name || "ngành"}`,
        `Năng lực cốt lõi: ${topCaps}`,
        `Giá trị nghề nghiệp ưu tiên: ${profile.ranked_values.slice(0, 2).join(", ")}`
      ],
      uncertainty: "Điểm số là chỉ dẫn định hướng xác suất cao; việc trải nghiệm thực tế qua dự án sẽ giúp bạn khẳng định lựa chọn chắc chắn nhất.",
      suggested_actions: [
        "Xem khoảng cách kỹ năng (Skill Gap) cần bù đắp",
        "So sánh với lựa chọn thứ hai",
        "Lập kế hoạch hành động 30 ngày tới"
      ]
    };
  }

  // 2. CONTEXTUAL ACTION: SO SÁNH (Compare)
  if (
    actionType === "compare" ||
    q.includes("so sánh") ||
    q.includes("khác nhau") ||
    q.includes("chọn ngành nào") ||
    q.includes("lựa chọn 1")
  ) {
    const c1 = bestCareer?.name || "Khoa học Dữ liệu";
    const c2 = secondCareer?.name || "Kỹ thuật Phần mềm";
    return {
      reply: `Chào bạn! Cả hai hướng đi này đều rất sáng trong hồ sơ của bạn, nhưng khác nhau rõ rệt ở tính chất trải nghiệm hàng ngày:\n\n- **${c1}**: Tập trung vào *khai phá insight, mô hình hóa số liệu và trả lời câu hỏi "Tại sao?"*. Cần tư duy thống kê và sự nhạy bén kinh doanh.\n- **${c2}**: Tập trung vào *xây dựng kiến trúc hệ thống, viết code bền bỉ và tạo ra sản phẩm chạy được*. Cần tính tỉ mỉ và kiên trì khi debug.\n\nVề hồ sơ của bạn, bạn đang nghiêng nhẹ về **${c1}** nhờ thế mạnh phân tích dữ liệu. Bạn thích cảm giác tìm ra lời giải từ số liệu hay tự tay dựng nên một ứng dụng hoàn chỉnh hơn?`,
      reasoning_summary: "So sánh trực diện 2 lựa chọn hàng đầu dựa trên phong cách làm việc và thế mạnh nổi trội.",
      evidence: [
        `Lựa chọn 1: ${c1} (Tương thích ${topCareers[0]?.score || 88}%)`,
        `Lựa chọn 2: ${c2} (Tương thích ${topCareers[1]?.score || 82}%)`,
        "Khảo sát thị trường tuyển dụng và mức độ cạnh tranh thực tế"
      ],
      uncertainty: "Cả hai ngành đều có thể giao thoa (ví dụ Data Engineer hoặc MLOps); bạn có thể bắt đầu với 1 hướng và mở rộng sau.",
      suggested_actions: [
        `Xem chi tiết nghề ${c1}`,
        `Xem chi tiết nghề ${c2}`,
        "Mở Bàn làm việc So sánh chuyên sâu 8 tiêu chí"
      ]
    };
  }

  // 3. CONTEXTUAL ACTION: LẬP KẾ HOẠCH (Plan)
  if (
    actionType === "plan" ||
    q.includes("kế hoạch") ||
    q.includes("lộ trình") ||
    q.includes("30 ngày") ||
    q.includes("90 ngày") ||
    q.includes("12 tháng") ||
    q.includes("chuẩn bị")
  ) {
    return {
      reply: `Mình chia nhỏ kế hoạch chuẩn bị cho mục tiêu **${targetName}** thành 3 chặng gọn gàng, thực tế để bạn bắt tay làm ngay nhé:\n\n1. **30 ngày đầu (Khởi động & Thử cảm giác)**:\n   - Hoàn thành 1 khóa học nhập môn hoặc đọc 1 cuốn sách chuyên ngành cơ bản.\n   - Dành 2 tiếng làm thử 1 bài tập thực hành nhỏ để xem mình có thực sự hào hứng không.\n2. **90 ngày tiếp theo (Xây móng kỹ năng)**:\n   - Tập trung bù đắp kỹ năng cốt lõi theo bảng Gap Analysis.\n   - Tự tay làm và hoàn thiện sản phẩm đầu tiên cho portfolio cá nhân.\n3. **12 tháng tới (Tạo đòn bẩy thực tế)**:\n   - Tham gia cuộc thi học thuật hoặc đề tài NCKH tại HCMUTE.\n   - Chuẩn bị hồ sơ ứng tuyển vị trí thực tập sinh (Intern/Fresher).\n\nMỗi tuần bạn có thể dành ra bao nhiêu giờ tự học để mình cân đối khối lượng bài tập vừa sức nhất với bạn?`,
      reasoning_summary: "Thiết kế kế hoạch hành động phân kỳ dựa trên mục tiêu thực tế và kết quả đo lường cụ thể.",
      evidence: [
        `Mục tiêu: ${targetName}`,
        "Phân bổ thời gian: 30 ngày (Khám phá) -> 90 ngày (Xây nền) -> 12 tháng (Kiểm chứng)",
        "Định hướng sản phẩm đầu ra (Outcome-driven) cho hồ sơ xin việc"
      ],
      uncertainty: "Lộ trình linh hoạt tùy theo lịch học chính khóa tại trường THPT/Đại học của bạn.",
      suggested_actions: [
        "Mở tab Lộ trình để xem Career Progression Map",
        "Dùng tính năng AI Tối ưu lộ trình theo giờ rảnh",
        "Xem danh sách kỹ năng cần bù đắp trong Gap Analysis"
      ]
    };
  }

  // 4. CONTEXTUAL ACTION: GỢI Ý CẢI THIỆN (Improve)
  if (
    actionType === "improve" ||
    q.includes("cải thiện") ||
    q.includes("nâng cao") ||
    q.includes("khắc phục") ||
    q.includes("điểm yếu") ||
    q.includes("gap")
  ) {
    return {
      reply: `Để rút ngắn khoảng cách đến mục tiêu **${targetName}**, bạn chỉ cần tập trung vào 3 đòn bẩy thực tế này trước:\n\n1. **Xây dựng Portfolio thực chiến (Ưu tiên số 1)**: Đừng chỉ học lý thuyết. Hoàn thành 1–2 sản phẩm thật có thể demo chạy được sẽ giúp bạn vượt trội hơn 80% ứng viên chỉ có bằng cấp lý thuyết.\n2. **Ngoại ngữ chuyên ngành (Ưu tiên số 2)**: Khả năng đọc tài liệu tiếng Anh chuẩn xác giúp bạn tiếp cận công cụ và công nghệ mới trước thị trường 1–2 năm.\n3. **Kỹ năng phối hợp & phản biện (Ưu tiên số 3)**: Tham gia các câu lạc bộ học thuật tại trường để rèn kỹ năng giao tiếp và làm việc nhóm.\n\nBạn muốn chúng mình bắt đầu từ việc lên ý tưởng cho dự án thực hành hay chọn tài liệu ngoại ngữ trước?`,
      reasoning_summary: "Nhận diện khoảng cách lớn nhất trong Gap Analysis và ưu tiên hành động có hiệu quả cao nhất.",
      evidence: [
        "Dữ liệu khoảng trống kinh nghiệm và kỹ năng thực hành dự án",
        "Tiêu chuẩn tuyển dụng thực tế của doanh nghiệp đối tác HCMUTE",
        "Yêu cầu về khả năng tự học tài liệu tiếng Anh chuyên ngành"
      ],
      suggested_actions: [
        "Thêm các nhiệm vụ này vào Lộ trình cá nhân",
        "Xem các dự án mẫu phù hợp cho portfolio",
        "Đánh giá lại quỹ thời gian rảnh mỗi tuần"
      ]
    };
  }

  // 5. CONTEXTUAL ACTION: ĐÁNH GIÁ LỰA CHỌN (Evaluate)
  if (
    actionType === "evaluate" ||
    q.includes("đánh giá") ||
    q.includes("rủi ro") ||
    q.includes("thách thức") ||
    q.includes("áp lực") ||
    q.includes("ai thay thế")
  ) {
    return {
      reply: `Đánh giá một cách khách quan và tỉnh táo về **${targetName}**, mình chia sẻ thẳng thắn 2 mặt thực tế thế này nhé:\n\n- **Điểm sáng**: Nhu cầu tuyển dụng người có năng lực thật vẫn rất cao; mức thu nhập tăng trưởng tốt (Fresher từ 10–16 triệu, sau 2–3 năm có thể đạt 20–35 triệu/tháng).\n- **Thách thức cần chuẩn bị trước**:\n  1. *Áp lực đổi mới công nghệ*: Kiến thức có chu kỳ thay đổi nhanh, bắt buộc bạn phải có tinh thần tự học suốt đời.\n  2. *Tác động của AI*: Các tác vụ cơ bản (viết code đơn giản, tổng hợp số liệu thô) đang bị AI làm thay. Bạn cần tiến lên tầng năng lực cao hơn: tư duy bài toán, kiến trúc hệ thống và giao tiếp nghiệp vụ.\n  3. *Cạnh tranh đầu vào*: Doanh nghiệp ngày càng khắt khe hơn với bằng cấp suông, ưu tiên người đã có sản phẩm thực tế.\n\nHiểu rõ thách thức giúp bạn chuẩn bị tâm thế vững vàng hơn rất nhiều. Bạn cảm thấy mình sẵn sàng dành thời gian rèn luyện cho hướng đi này chưa?`,
      reasoning_summary: "Đánh giá đa chiều về rủi ro, áp lực cạnh tranh nghề nghiệp và tác động thực tế của AI.",
      evidence: [
        `Khảo sát dải lương và thị trường tuyển dụng 2025–2026 cho ${targetName}`,
        "Tác động tự động hóa của Generative AI và AI Coding Assistants",
        "Tiêu chí tuyển chọn thực tập sinh của các tập đoàn công nghệ"
      ],
      uncertainty: "AI không làm mất việc làm của người có tư duy tốt; người biết làm chủ AI sẽ có lợi thế vượt bậc.",
      suggested_actions: [
        "Xem phân tích AI Exposure trong Career Explorer",
        "Lập kế hoạch giảm thiểu rủi ro qua lộ trình thực hành",
        "Tham khảo ý kiến chuyên gia tư vấn 1-1"
      ]
    };
  }

  // Default General Response (Chào mừng & Điều hướng thân thiện)
  return {
    reply: `Chào bạn nhé! Mình là **AI Career Coach** đồng hành cùng bạn tại HCMUTE.\n\nHồ sơ **Career DNA** của bạn cho thấy bạn mang hình mẫu **"${profile.profile_archetype.title}"** — rất mạnh về tư duy phân tích và khả năng giải quyết vấn đề thực tiễn.\n\nHiện tại, Top 3 ngành nghề tương thích nhất với bạn gồm:\n${topCareers.slice(0, 3).map((c, i) => `${i + 1}. **${c.career.name}** (${c.score}% tương thích)`).join("\n")}\n\nBạn có thể hỏi mình bất cứ điều gì về **điểm chuẩn, học phí HCMUTE, mức lương thực tế, tác động của AI** hoặc bấm các nút hành động phía trên để cùng mình bóc tách nhé!`,
    reasoning_summary: "Tổng hợp dữ liệu hồ sơ Career DNA và bảng xếp hạng tương thích nghề nghiệp.",
    evidence: [
      `Hình mẫu nhận diện: ${profile.profile_archetype.title}`,
      `Nghề hàng đầu: ${bestCareer?.name || "Chưa chọn"} (${topCareers[0]?.score || 88}%)`,
      `Ngành học mục tiêu: ${topMajors[0]?.major.name || "Kỹ thuật / Công nghệ"}`
    ],
    uncertainty: "Các gợi ý ban đầu dựa trên bài khảo sát tự đánh giá; chúng mình sẽ cùng tinh chỉnh qua các câu hỏi cụ thể tiếp theo.",
    suggested_actions: [
      "Giải thích lý do phù hợp với nghề top 1",
      "So sánh hai ngành nghề hàng đầu",
      "Hỏi về điểm chuẩn và học phí HCMUTE 2025–2026"
    ]
  };
}

/**
 * Hàm sinh chuỗi câu trả lời nhanh (backward-compatible)
 */
export function generateSmartLocalCoachResponse(
  userQuery: string,
  context: CoachContext,
  actionType?: string
): string {
  const result = generateSmartCoachFullResponse(userQuery, context, actionType);
  return result.reply;
}
