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

export interface SmartCoachResult {
  reply: string;
  reasoning_summary: string;
  evidence: string[];
  uncertainty?: string;
  suggested_actions?: string[];
}

/**
 * Bộ sinh câu trả lời cố vấn thông minh đầy đủ (với Trust & Explainability)
 * Đảm bảo tính khoa học, khách quan, không khẳng định tuyệt đối hóa, cung cấp căn cứ và cảnh báo giới hạn.
 */
export function generateSmartCoachFullResponse(
  userQuery: string,
  context: CoachContext,
  actionType?: string
): SmartCoachResult {
  const q = userQuery.toLowerCase();
  const { profile, topCareers, topMajors, targetRoadmap } = context;
  const bestCareer = topCareers[0]?.career;
  const secondCareer = topCareers[1]?.career;
  const targetName = targetRoadmap?.target_career_name || bestCareer?.name || "ngành nghề mục tiêu";

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
      reply: `Chào bạn! Dựa trên phân tích Career DNA, bạn đạt độ tương thích khả quan với **${bestCareer?.name || "nhóm ngành Công nghệ / Dữ liệu"}** (khoảng ${topCareers[0]?.score || 88}%) nhờ 3 điểm tựa chính:

1. **Sở trường tư duy**: Năng lực phân tích và giải quyết vấn đề của bạn (${topCaps}) rất ăn khớp với yêu cầu bóc tách logic của nghề.
2. **Hứng thú tự nhiên**: Bạn có mức độ tò mò tự thân cao, giúp bạn vượt qua giai đoạn học kiến thức nền tảng một cách bền bỉ.
3. **Giá trị nghề nghiệp**: Kỳ vọng về sự tự chủ và mức thu nhập tốt của bạn tương đồng với biểu đồ phát triển sự nghiệp của vị trí này.

*Lưu ý quan trọng*: Mức độ tương thích trên mang tính chất định hướng xác suất, thành công thực tế đòi hỏi sự rèn luyện bền bỉ và môi trường thực hành liên tục. Bạn đã thử thực hiện một bài tập tình huống thực tế chưa?`,
      reasoning_summary: "Đối soát ma trận liên kết giữa đặc tính Career DNA, chỉ số năng lực tư duy và yêu cầu năng lực cốt lõi của vị trí.",
      evidence: [
        `Hình mẫu "${profile.profile_archetype.title}" tương thích ${topCareers[0]?.score || 88}% với ${bestCareer?.name || "ngành"}`,
        `Năng lực nổi bật: ${topCaps}`,
        `Giá trị cốt lõi: ${profile.ranked_values.slice(0, 2).join(", ")}`
      ],
      uncertainty: "Kết quả đối soát dựa trên dữ liệu tự kê khai tại thời điểm khảo sát; mức độ thích ứng thực tế cần kiểm chứng qua các dự án thử nghiệm.",
      suggested_actions: [
        "Xem phân tích khoảng trống năng lực (Gap Analysis)",
        "So sánh với lựa chọn thứ hai",
        "Lập kế hoạch hành động 30 ngày"
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
      reply: `Cả hai hướng đi này đều nằm trong top khuyến nghị cho hồ sơ của bạn, nhưng có những khác biệt cốt lõi:

- **${c1}**: Tập trung vào việc *khai phá insight, mô hình hóa dữ liệu và hỗ trợ ra quyết định*. Đòi hỏi tư duy thống kê, khả năng nhìn ra quy luật từ số liệu.
- **${c2}**: Tập trung vào việc *xây dựng kiến trúc hệ thống, độ tin cậy và hiệu năng mã lệnh*. Đòi hỏi sự kiên nhẫn với cấu trúc kỹ thuật và giải quyết lỗi logic.

Đối với cá nhân bạn, phong cách tư duy của bạn có xu hướng nghiêng nhẹ về bên **${c1}**, tuy nhiên bạn hoàn toàn có thể chọn kết hợp cả hai. Bạn ưu tiên trải nghiệm tìm ra giải pháp hay tự tay xây dựng một sản phẩm hoàn chỉnh hơn?`,
      reasoning_summary: "Phân tích ma trận đánh đổi (Trade-off Matrix) giữa 2 hướng đi dựa trên năng lực, triển vọng thị trường và rào cản thích ứng.",
      evidence: [
        `Lựa chọn 1: ${c1} (Tương thích ${topCareers[0]?.score || 88}%)`,
        `Lựa chọn 2: ${c2} (Tương thích ${topCareers[1]?.score || 82}%)`,
        "Đối sánh các chiều năng lực kỹ thuật và giải quyết vấn đề"
      ],
      uncertainty: "Thị trường tuyển dụng và mức độ tự động hóa AI ở hai ngành biến động liên tục; dữ liệu mang tính tham khảo xu hướng dài hạn.",
      suggested_actions: [
        `Xem chi tiết nghề ${c1}`,
        `Xem chi tiết nghề ${c2}`,
        "Đánh giá rủi ro và áp lực của từng lựa chọn"
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
      reply: `Dưới đây là khung kế hoạch phân kỳ thực tế để bạn chuẩn bị cho mục tiêu **${targetName}**:

1. **Chặng 30 ngày (Khám phá & Nền tảng)**:
   - Hoàn thành 1 khóa học nhập môn hoặc đọc 2 cuốn sách chuyên ngành cơ bản.
   - Thử nghiệm 1 bài thực hành vi mô (mini-task) 3 giờ để cảm nhận công việc thực tế.
2. **Chặng 90 ngày (Xây dựng năng lực cốt lõi)**:
   - Nâng cấp kỹ năng chuyên môn trọng yếu nhất theo danh sách Gap Analysis.
   - Bắt đầu xây dựng sản phẩm đầu tiên cho portfolio cá nhân (GitHub/Behance/Notion).
3. **Chặng 12 tháng (Thực hành & Kiểm chứng)**:
   - Đạt chứng chỉ chuyên môn hoặc tham gia cuộc thi học thuật, đề tài nghiên cứu tại HCMUTE.
   - Ứng tuyển thực tập hoặc tham gia dự án cộng đồng để tích lũy kinh nghiệm thực tế.

Bạn có thể dành ra bao nhiêu giờ mỗi tuần cho việc tự học này để tôi điều chỉnh khối lượng công việc phù hợp?`,
      reasoning_summary: "Thiết kế kế hoạch hành động phân kỳ dựa trên khoảng cách năng lực ưu tiên và quỹ thời gian khả dụng.",
      evidence: [
        `Mục tiêu: ${targetName}`,
        "Cột mốc thời gian: 30 ngày, 90 ngày, 12 tháng",
        "Ưu tiên các nhiệm vụ mang lại kết quả cụ thể (Outcome-driven)"
      ],
      uncertainty: "Tiến độ thực tế phụ thuộc vào tính kỷ luật tự học hàng tuần và các cam kết học tập chính quy tại trường.",
      suggested_actions: [
        "Mở tab Lộ trình để xem Career Progression Map",
        "Sử dụng AI Tối ưu lộ trình theo quỹ giờ/tuần",
        "Kiểm tra danh sách Gap Analysis"
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
      reply: `Để thu hẹp khoảng cách nhanh nhất đến mục tiêu **${targetName}**, tôi gợi ý bạn tập trung vào 3 đòn bẩy có tỷ suất sinh lời thời gian (ROI) cao nhất:

1. **Portfolio thực tế (Ưu tiên số 1)**: Nhà tuyển dụng đánh giá năng lực qua sản phẩm thật hơn là điểm số lý thuyết. Hãy hoàn thành ít nhất 2 dự án cá nhân có thể demo được.
2. **Ngoại ngữ chuyên ngành (Ưu tiên số 2)**: Khả năng đọc tài liệu tiếng Anh giúp bạn tiếp cận công nghệ mới nhanh hơn bạn bè 1–2 năm.
3. **Kỹ năng làm việc nhóm & phản biện (Ưu tiên số 3)**: Tham gia các câu lạc bộ học thuật hoặc dự án nhóm tại HCMUTE để rèn luyện kỹ năng phối hợp.

Đừng cố gắng hoàn thiện tất cả cùng lúc. Bạn muốn bắt đầu cải thiện phần kiến thức, dự án thực tế hay ngoại ngữ trước?`,
      reasoning_summary: "Nhận diện khoảng cách lớn nhất trong Gap Analysis và ưu tiên các kỹ năng có ROI cao nhất.",
      evidence: [
        "Dữ liệu khoảng trống kinh nghiệm & portfolio thực chiến",
        "Yêu cầu ngoại ngữ chuyên ngành & kỹ năng công cụ thực tế",
        "Mức nỗ lực ước tính để đạt chuẩn tối thiểu"
      ],
      uncertainty: "Kỹ năng cần thực hành có phản hồi (deliberate practice) chứ không thể chỉ tiếp thu qua tài liệu thụ động.",
      suggested_actions: [
        "Thêm các mục cải thiện vào Lộ trình cá nhân",
        "Xem gợi ý các dự án mẫu cho portfolio",
        "Đánh giá lại quỹ thời gian tự học"
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
      reply: `Nhìn nhận một cách khách quan và tỉnh táo, lựa chọn **${targetName}** có cả cơ hội lẫn những thách thức không nhỏ mà bạn cần chuẩn bị:

- **Cơ hội**: Nhu cầu nhân lực chuyên môn cao vẫn tăng trưởng tốt; biên độ phát triển thu nhập rộng; cơ hội làm việc trong môi trường quốc tế hoặc hybrid.
- **Thách thức thực tế**:
  1. *Tốc độ lỗi thời của công nghệ*: Kiến thức hôm nay học có thể thay đổi sau 2 năm; áp lực tự học suốt đời là bắt buộc.
  2. *Tác động của AI*: Các tác vụ cơ bản (viết mã đơn giản, phân tích số liệu sơ cấp) đang bị AI tự động hóa nhanh. Bạn phải tiến lên các tầng năng lực cao hơn (tư duy phản biện, giải bài toán kinh doanh, kiến trúc).
  3. *Cạnh tranh đầu vào*: Sinh viên mới tốt nghiệp rất đông, người có portfolio thực chiến mới nổi bật.

Đây là một lộ trình đòi hỏi sự bền bỉ. Bạn đã sẵn sàng tâm lý để vượt qua giai đoạn 6 tháng đầu đầy bỡ ngỡ chưa?`,
      reasoning_summary: "Đánh giá đa chiều về rủi ro, áp lực cạnh tranh nghề nghiệp và mức độ phơi nhiễm trước tự động hóa AI.",
      evidence: [
        `Chỉ số AI Exposure của nhóm ngành ${targetName}`,
        "Áp lực tự học và chu kỳ thay đổi công nghệ 2-3 năm",
        "Tiêu chuẩn sàng lọc portfolio của nhà tuyển dụng"
      ],
      uncertainty: "Tác động của AI mang tính hai mặt (vừa tự động hóa vừa tạo việc làm mới); mức độ ảnh hưởng phụ thuộc vào năng lực làm chủ công cụ AI của cá nhân.",
      suggested_actions: [
        "Xem phân tích rủi ro chi tiết trong Career Explorer",
        "Lập kế hoạch giảm thiểu rủi ro qua lộ trình hành động",
        "Trao đổi thêm về các phương án dự phòng (Plan B)"
      ]
    };
  }

  // Default General Response
  return {
    reply: `Chào bạn! Tôi là HCMUTE AI Career Coach — trợ lý cố vấn trí tuệ định hướng nghề nghiệp của bạn.

Dựa trên hồ sơ Career DNA hình mẫu **"${profile.profile_archetype.title}"**, bạn đang có tiềm năng kết hợp giữa tư duy logic và khả năng áp dụng thực tiễn.

Top 3 ngành nghề tương thích cao nhất hiện tại:
${topCareers.slice(0, 3).map((c, i) => `${i + 1}. **${c.career.name}** (Tương thích ${c.score}%)`).join("\n")}

Bạn có thể bấm vào các nút chức năng cố vấn bên trên để cùng tôi:
- **Giải thích**: Phân tích lý do tại sao nghề này phù hợp
- **So sánh**: Đặt hai hướng đi lên bàn cân
- **Lập kế hoạch**: Lên lộ trình 30 ngày, 90 ngày, 12 tháng
- **Gợi ý cải thiện**: Bù đắp các khoảng cách năng lực
- **Đánh giá lựa chọn**: Phân tích rủi ro và tác động của AI`,
    reasoning_summary: "Tổng hợp dữ liệu hồ sơ Career DNA và bảng xếp hạng tương thích nghề nghiệp.",
    evidence: [
      `Hình mẫu: ${profile.profile_archetype.title}`,
      `Top 1: ${bestCareer?.name || "Chưa chọn"} (${topCareers[0]?.score || 88}%)`,
      `Mục tiêu: ${targetName}`
    ],
    uncertainty: "Mọi khuyến nghị ban đầu mang tính định hướng phương pháp luận, cần kiểm chứng qua thực tế trải nghiệm.",
    suggested_actions: [
      "Giải thích lý do phù hợp",
      "So sánh hai ngành hàng đầu",
      "Lập kế hoạch hành động"
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
