import {
  StudentCareerProfile,
  CareerDNA,
  SkillGapItem,
  CareerExperiment,
  CapabilityDimension,
  GapCategory
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

  // 1. Phân tích các kỹ năng cốt lõi (Category: skills & academic)
  for (const [dim, targetLevel] of Object.entries(requiredCaps)) {
    const d = dim as CapabilityDimension;
    const current = profile.capabilities[d] ?? 50;
    const target = targetLevel ?? 70;
    const gap = Math.max(0, target - current);

    let priority: SkillGapItem["priority"] = "LOW";
    if (gap >= 25) priority = "HIGH";
    else if (gap >= 12) priority = "MEDIUM";

    let effort = "15 - 20 giờ học tập & thực hành";
    if (gap >= 25) effort = "6 - 8 tuần rèn luyện liên tục";
    else if (gap >= 12) effort = "3 - 4 tuần thực hành dự án";

    const isAcademic = d === "logical_thinking" || d === "analytical_thinking";
    const category: GapCategory = isAcademic ? "academic" : "skills";

    gaps.push({
      skill_name: dimensionLabels[d] || d,
      dimension: d,
      current_level: current,
      target_level: target,
      current_text: `Mức ${current}/100 (${current >= 75 ? "Vững vàng" : current >= 55 ? "Trung bình" : "Cơ bản"})`,
      target_text: `Mức ${target}/100 (Chuẩn tuyển dụng)`,
      gap,
      priority,
      category,
      effort,
      evidence: `Căn cứ từ điểm tự đánh giá ${dimensionLabels[d]} và bài kiểm tra năng lực tư duy.`,
      actionable_recommendation:
        gap > 0
          ? `Cần nâng cấp thêm ${gap} điểm qua các bài tập chuyên sâu và đồ án thực tế.`
          : "Năng lực hiện tại đã đáp ứng tốt ngưỡng kỳ vọng của vị trí này."
    });
  }

  // 2. Thêm các hạng mục Gap còn lại trong 7 nhóm tiêu chuẩn:
  // - Knowledge (Kiến thức chuyên môn)
  gaps.push({
    skill_name: `Kiến thức chuyên ngành ${career.industry_name}`,
    dimension: "technical",
    current_level: 40,
    target_level: 80,
    current_text: "Mức 40/100 (Hiểu khái niệm tổng quan)",
    target_text: "Mức 80/100 (Hiểu sâu nguyên lý & kiến trúc)",
    gap: 40,
    priority: "HIGH",
    category: "knowledge",
    effort: "2 - 3 tháng học các học phần chuyên ngành đại học",
    evidence: "Hồ sơ chưa ghi nhận tích lũy các học phần chuyên sâu thuộc khối ngành này.",
    actionable_recommendation: `Đăng ký môn cơ sở ngành và đọc giáo trình chuyên sâu về ${career.name}.`
  });

  // - Experience (Kinh nghiệm thực hành lab/xưởng)
  gaps.push({
    skill_name: "Kinh nghiệm thực hành xưởng & dự án mô phỏng",
    dimension: "technical",
    current_level: 30,
    target_level: 75,
    current_text: "Mức 30/100 (Chưa có dự án thực tế)",
    target_text: "Mức 75/100 (Tối thiểu 2 đồ án môn học hoàn chỉnh)",
    gap: 45,
    priority: "HIGH",
    category: "experience",
    effort: "40 - 60 giờ làm việc tại phòng thí nghiệm / xưởng",
    evidence: "Chưa tham gia đề tài nghiên cứu hoặc đồ án thực tế tại trường.",
    actionable_recommendation: "Tham gia các kỳ thực tập doanh nghiệp hoặc Lab nghiên cứu từ năm 2 đại học."
  });

  // - Portfolio (Sản phẩm đầu tay & GitHub / Case study)
  gaps.push({
    skill_name: "Portfolio sản phẩm cá nhân (GitHub / Behance / Case Study)",
    dimension: "technical",
    current_level: 25,
    target_level: 80,
    current_text: "Mức 25/100 (Chưa có hồ sơ năng lực số)",
    target_text: "Mức 80/100 (Có tối thiểu 3 sản phẩm demo hoàn chỉnh)",
    gap: 55,
    priority: "HIGH",
    category: "portfolio",
    effort: "4 tuần xây dựng và đóng gói sản phẩm",
    evidence: "Hồ sơ số hiện tại chưa đính kèm đường dẫn sản phẩm minh chứng.",
    actionable_recommendation: "Tự tay làm một sản phẩm từ đầu đến cuối và lưu trữ trên nền tảng trực tuyến công khai."
  });

  // - Certification (Chứng chỉ chuyên môn quốc tế)
  gaps.push({
    skill_name: "Chứng chỉ chuyên môn quốc tế uy tín",
    dimension: "technical",
    current_level: 35,
    target_level: 70,
    current_text: "Mức 35/100 (Chưa có chứng chỉ nghề)",
    target_text: "Mức 70/100 (Tối thiểu 1 chứng chỉ Foundation uy tín)",
    gap: 35,
    priority: "MEDIUM",
    category: "certification",
    effort: "30 - 45 giờ học và thi chứng chỉ",
    evidence: "Hồ sơ chưa có chứng chỉ quốc tế được công nhận trong ngành.",
    actionable_recommendation: "Tham gia các khóa cấp chứng chỉ từ Google, IBM, Coursera hoặc Cisco."
  });

  // - Language (Tiếng Anh chuyên ngành & Giao tiếp)
  const englishScore = profile.academic_profile?.english_score || 7.0;
  const currentLangLevel = Math.round(englishScore * 10);
  const targetLangLevel = 80;
  const langGap = Math.max(0, targetLangLevel - currentLangLevel);
  gaps.push({
    skill_name: "Tiếng Anh chuyên ngành & Giao tiếp học thuật",
    dimension: "communication",
    current_level: currentLangLevel,
    target_level: targetLangLevel,
    current_text: `Mức ${currentLangLevel}/100 (Điểm Anh văn THPT: ${englishScore})`,
    target_text: "Mức 80/100 (Đọc hiểu tài liệu chuyên ngành & IELTS 6.0+)",
    gap: langGap,
    priority: langGap >= 20 ? "HIGH" : "MEDIUM",
    category: "language",
    effort: "3 - 6 tháng luyện kỹ năng đọc tài liệu kỹ thuật",
    evidence: `Căn cứ từ điểm tổng kết môn Tiếng Anh ${englishScore} trong học bạ THPT.`,
    actionable_recommendation: "Luyện đọc tài liệu kỹ thuật tiếng Anh hàng ngày và xem bài giảng quốc tế."
  });

  // Sắp xếp gap lớn nhất lên đầu
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

  if (careerId.includes("software") || careerId.includes("ai_engineer") || careerId.includes("dev")) {
    return [
      {
        id: "exp_dev_1",
        title: "Viết ứng dụng đầu tiên trong 2 giờ với Python hoặc JavaScript",
        time_commitment: "2 giờ",
        objective: "Trải nghiệm cảm giác chuyển hóa logic tư duy thành phần mềm hoạt động được.",
        steps: [
          "Mở Replit hoặc VS Code",
          "Viết một chương trình đố vui hoặc quản lý chi tiêu đơn giản",
          "Tự sửa ít nhất 2 lỗi (debug) phát sinh khi chương trình báo lỗi đỏ"
        ],
        success_criteria: "Bạn cảm thấy kích thích khi tìm ra nguyên nhân gây lỗi và sửa nó thành công."
      },
      {
        id: "exp_dev_2",
        title: "Khám phá 1 Repository mã nguồn mở trên GitHub",
        time_commitment: "2 giờ",
        objective: "Quan sát cách các kỹ sư chuyên nghiệp tổ chức mã nguồn và làm việc nhóm.",
        steps: [
          "Truy cập GitHub và tìm kiếm một dự án nổi tiếng trong ngành",
          "Đọc file README.md và cấu trúc thư mục",
          "Xem phần 'Issues' và 'Pull Requests' để xem cách cộng đồng trao đổi kỹ thuật"
        ],
        success_criteria: "Bạn thấy tò mò muốn hiểu cách các dòng code phối hợp với nhau để tạo ra phần mềm lớn."
      },
      {
        id: "exp_dev_3",
        title: "Thực hành Prompt Engineering giải quyết bài toán phức tạp",
        time_commitment: "1.5 giờ",
        objective: "Hiểu cách kết hợp tư duy giải thuật với các mô hình AI thế hệ mới.",
        steps: [
          "Mở ChatGPT hoặc Claude hoặc Gemini",
          "Yêu cầu AI phân tích một bài toán thực tế và viết code giải thuật",
          "Thử thách AI tối ưu hóa độ phức tạp thời gian từ O(N^2) xuống O(N log N)"
        ],
        success_criteria: "Bạn có khả năng đánh giá kết quả AI đưa ra và nhận diện được điểm chưa tối ưu."
      }
    ];
  }

  // Mặc định cho các ngành kỹ thuật & kinh tế khác
  return [
    {
      id: "exp_gen_1",
      title: "Xem video phân tích một ngày làm việc thực tế (Day in the Life)",
      time_commitment: "1.5 giờ",
      objective: "Nhìn thấy môi trường văn phòng, xưởng thực hành và áp lực thường nhật.",
      steps: [
        `Tìm kiếm từ khóa 'Day in the life of ${careerId}' trên YouTube`,
        "Ghi chú lại 3 điểm bạn thích nhất và 2 điểm bạn lo ngại nhất"
      ],
      success_criteria: "Bạn vẫn cảm thấy hào hứng ngay cả khi nhìn thấy những phần việc lặp đi lặp lại hoặc áp lực."
    },
    {
      id: "exp_gen_2",
      title: "Thực hiện một bài tập nhỏ nhập môn kéo dài 3 giờ",
      time_commitment: "3 giờ",
      objective: "Kiểm tra mức độ thích nghi với các công cụ nền tảng của ngành.",
      steps: [
        "Đăng ký một khóa học miễn phí trên Coursera hoặc edX",
        "Hoàn thành trọn vẹn bài tập thực hành của tuần đầu tiên"
      ],
      success_criteria: "Bạn không bỏ cuộc giữa chừng và hoàn thành bài tập đúng hạn."
    },
    {
      id: "exp_gen_3",
      title: "Trò chuyện hoặc phỏng vấn 1 cựu sinh viên / người đang làm nghề",
      time_commitment: "1 giờ",
      objective: "Lắng nghe bức tranh chân thực về thị trường và mức lương thực tế.",
      steps: [
        "Kết nối với một đàn anh/đàn chị qua LinkedIn hoặc hội sinh viên HCMUTE",
        "Hỏi về những điều họ ước mình biết trước khi chọn ngành này"
      ],
      success_criteria: "Bạn thu thập được thông tin khách quan không có trong sách vở quảng cáo tuyển sinh."
    }
  ];
}
