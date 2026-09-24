import {
  StudentCareerProfile,
  CareerDNA,
  SkillGapItem,
  CareerExperiment,
  CapabilityDimension
} from "./types";

export function analyzeSkillGaps(
  career: CareerDNA,
  profile: StudentCareerProfile
): SkillGapItem[] {
  const gaps: SkillGapItem[] = [];
  const requiredCaps = career.required_capabilities;

  const dimensionLabels: Record<CapabilityDimension, string> = {
    logical_thinking: "Tư duy logic & giải thuật",
    analytical_thinking: "Tư duy phân tích dữ liệu & số liệu",
    problem_solving: "Năng lực giải quyết vấn đề phức tạp",
    creativity: "Tư duy sáng tạo & trực giác thẩm mỹ",
    communication: "Giao tiếp, thuyết trình & truyền đạt",
    leadership: "Khả năng lãnh đạo & điều phối đội ngũ",
    teamwork: "Làm việc nhóm & tương tác liên phòng ban",
    organization: "Quản lý tổ chức, lập kế hoạch & sắp xếp",
    independent_work: "Khả năng tự chủ & làm việc độc lập",
    adaptability: "Thích ứng linh hoạt trước biến động",
    learning_agility: "Tốc độ tự học & làm chủ kiến thức mới",
    attention_to_detail: "Độ tỉ mỉ, chuẩn xác & kỷ luật chi tiết",
    strategic_thinking: "Tư duy chiến lược & tầm nhìn vĩ mô",
    digital_literacy: "Làm chủ công cụ số & AI ứng dụng"
  };

  for (const [dim, targetLevel] of Object.entries(requiredCaps)) {
    const d = dim as CapabilityDimension;
    const current = profile.capabilities[d] ?? 50;
    const target = targetLevel ?? 70;
    const gap = Math.max(0, target - current);

    let priority: SkillGapItem["priority"] = "LOW";
    if (gap >= 25) priority = "HIGH";
    else if (gap >= 12) priority = "MEDIUM";

    let recommendation = "";
    if (gap > 0) {
      recommendation = `Cần nâng cấp thêm ${gap} điểm qua các dự án thực tế và tài liệu chuyên sâu.`;
    } else {
      recommendation = "Năng lực hiện tại đã đáp ứng hoặc vượt ngưỡng kỳ vọng của vị trí này.";
    }

    gaps.push({
      skill_name: dimensionLabels[d] || d,
      dimension: d,
      current_level: current,
      target_level: target,
      gap,
      priority,
      actionable_recommendation: recommendation
    });
  }

  // Sắp xếp các kỹ năng có gap lớn nhất lên đầu
  return gaps.sort((a, b) => b.gap - a.gap);
}

/**
 * Sinh 3 thử nghiệm nghề nghiệp vi mô (Career Experiments)
 */
export function getCareerExperiments(careerId: string): CareerExperiment[] {
  if (careerId.includes("data")) {
    return [
      {
        id: "exp_data_1",
        title: "Thực hành 3 giờ SQL trên Kaggle / LeetCode",
        time_commitment: "3 giờ",
        objective: "Kiểm tra mức độ kiên nhẫn khi đối mặt với dữ liệu bảng và câu lệnh truy vấn lọc dữ liệu.",
        steps: [
          "Mở trình duyệt vào Kaggle hoặc W3Schools SQL Tutorial",
          "Viết các câu lệnh SELECT, WHERE, GROUP BY, JOIN trên tập dữ liệu bán hàng mẫu",
          "Tự đặt ra 3 câu hỏi (Ví dụ: 'Sản phẩm nào bán chạy nhất vào tháng 12?')"
        ],
        success_criteria: "Bạn cảm thấy hứng thú và tò mò khi tìm ra đáp án từ bảng số liệu thay vì thấy đau đầu."
      },
      {
        id: "exp_data_2",
        title: "Tự tạo một Dashboard trực quan trên Power BI hoặc Google Sheets",
        time_commitment: "1 buổi chiều (4 giờ)",
        objective: "Trải nghiệm cảm giác của một nhà phân tích trực quan hóa thông tin.",
        steps: [
          "Tải một tập dữ liệu công khai (dân số, doanh thu quán cà phê hoặc chi tiêu cá nhân)",
          "Vẽ biểu đồ cột, tròn, đường xu hướng và thêm bộ lọc thời gian",
          "Gửi cho một người bạn xem và hỏi họ có hiểu câu chuyện bạn muốn kể không"
        ],
        success_criteria: "Bạn thấy thỏa mãn khi biến một đống số lộn xộn thành một biểu đồ sinh động, rõ ràng."
      },
      {
        id: "exp_data_3",
        title: "Phân tích 1 Case Study thực tế trên YouTube",
        time_commitment: "2 giờ",
        objective: "Hiểu công việc thường nhật của Senior Data Analyst.",
        steps: [
          "Xem video 'Day in the Life of a Data Analyst' và 'End-to-End Data Project'",
          "Ghi chép lại các công cụ và cách họ trao đổi với bộ phận kinh doanh"
        ],
        success_criteria: "Bạn thấy bức tranh công việc thực tế hấp dẫn và phù hợp với lối sống mong muốn."
      }
    ];
  }

  if (careerId.includes("software") || careerId.includes("ai_engineer")) {
    return [
      {
        id: "exp_dev_1",
        title: "Tự viết và chạy chương trình đầu tiên trong 2 giờ",
        time_commitment: "2 giờ",
        objective: "Kiểm tra cảm giác sửa lỗi logic (Debug) khi code báo lỗi đỏ.",
        steps: [
          "Mở Replit hoặc Google Colab, viết một hàm Python đơn giản giải một câu đố",
          "Cố tình để một lỗi sai cú pháp và dùng AI / Google để tìm nguyên nhân sửa lỗi"
        ],
        success_criteria: "Cảm giác sung sướng tột độ khi chương trình chạy đúng sau nhiều lần lỗi."
      },
      {
        id: "exp_dev_2",
        title: "Xây dựng 1 trang Web cá nhân siêu đơn giản",
        time_commitment: "4 giờ",
        objective: "Hiểu cách HTML, CSS và JavaScript phối hợp tạo nên sản phẩm người dùng nhìn thấy.",
        steps: [
          "Dùng template hoặc theo hướng dẫn dựng trang profile giới thiệu bản thân",
          "Deploy miễn phí lên Vercel hoặc GitHub Pages và gửi link cho bạn bè"
        ],
        success_criteria: "Bạn tự hào khi sản phẩm của mình hiện diện trên internet thật."
      },
      {
        id: "exp_dev_3",
        title: "Thử tạo một chatbot AI tùy biến với API",
        time_commitment: "3 giờ",
        objective: "Khám phá thế giới trí tuệ nhân tạo tạo sinh.",
        steps: [
          "Dùng khóa API miễn phí viết một prompt system định vị tính cách cho bot",
          "Thử nghiệm các câu hỏi khó để xem bot phản hồi ra sao"
        ],
        success_criteria: "Bạn đam mê muốn hiểu sâu hơn về kiến trúc bên trong của mô hình."
      }
    ];
  }

  // Thử nghiệm mặc định cho các ngành kinh doanh / thiết kế / chung
  return [
    {
      id: "exp_gen_1",
      title: "Phỏng vấn 1 chuyên gia trong nghề (Informational Interview)",
      time_commitment: "45 phút",
      objective: "Nhận góc nhìn chân thực không tô hồng về những khó khăn thực tế của ngành.",
      steps: [
        "Tìm một anh/chị khóa trên hoặc kết nối qua LinkedIn đang làm đúng vị trí này",
        "Chuẩn bị 3 câu hỏi: 'Điều gì áp lực nhất trong công việc?', 'Kỹ năng nào quan trọng nhất?', 'Nếu chọn lại, anh/chị có làm nghề này không?'"
      ],
      success_criteria: "Bạn có cái nhìn thực tế và vẫn giữ nguyên ngọn lửa muốn thử sức."
    },
    {
      id: "exp_gen_2",
      title: "Thực hiện một dự án mẫu quy mô mini (Micro-Project)",
      time_commitment: "1 ngày cuối tuần",
      objective: "Mô phỏng 1 sản phẩm đầu ra thực tế của vị trí này.",
      steps: [
        "Lên dàn ý một chiến dịch, vẽ một bản mockup hoặc lập kế hoạch kinh doanh 1 trang",
        "Thu thập nhận xét từ 3 người xung quanh"
      ],
      success_criteria: "Bạn tận hưởng quá trình hoàn thành dự án từ con số 0."
    },
    {
      id: "exp_gen_3",
      title: "Học thử khóa nhập môn miễn phí (Audit Course)",
      time_commitment: "3 - 5 giờ",
      objective: "Kiểm tra mức độ hào hứng với thuật ngữ và tư duy chuyên ngành.",
      steps: [
        "Vào Coursera hoặc edX đăng ký học thử (audit) tuần đầu tiên của khóa học nhập môn",
        "Ghi chép lại các khái niệm mới mẻ"
      ],
      success_criteria: "Bạn chủ động muốn xem tiếp video tiếp theo mà không cần ai ép buộc."
    }
  ];
}
