export interface MajorRule {
  code: string;
  name: string;
  field: string;
  fieldColor: string;
  riasecCodes: string[];
  miCodes: string[];
  description: string;
  pros: string[];
  searchKeywords: string[]; // Dùng để tìm kiếm trường đào tạo
  relevantSubjects: { subject: string; weight: number }[];
  coreAbilities: string[];
  interestTags: string[];
  valueTags: string[];
  dislikedTags: string[];
  avgCutoff: number;
}

export const MAJORS_DATABASE: MajorRule[] = [
  {
    code: "7480108",
    name: "Khoa học Dữ liệu & Trí tuệ Nhân tạo (AI)",
    field: "Máy tính & CNTT",
    fieldColor: "from-purple-500 to-indigo-600",
    riasecCodes: ["I", "C"],
    miCodes: ["LOGIC", "INTRA"],
    description: "Phân tích dữ liệu lớn, xây dựng mô hình máy học và thuật toán AI thông minh.",
    pros: ["Tư duy toán học", "Phân tích hệ thống", "Tự học chuyên sâu"],
    searchKeywords: ["dữ liệu", "trí tuệ nhân tạo", "khoa học dữ liệu", "ai", "công nghệ thông tin"],
    relevantSubjects: [
      { subject: "math", weight: 3 },
      { subject: "informatics", weight: 3 },
      { subject: "english", weight: 2 },
      { subject: "physics", weight: 1 }
    ],
    coreAbilities: ["logic", "problemSolving", "independent"],
    interestTags: ["Công nghệ", "Dữ liệu", "AI / Trí tuệ nhân tạo", "Toán học", "Nghiên cứu"],
    valueTags: ["Thu nhập tốt", "Công nghệ", "Cơ hội thăng tiến", "Sáng tạo"],
    dislikedTags: ["Y tế / Sức khỏe", "Hành chính sự nghiệp"],
    avgCutoff: 26.5
  },
  {
    code: "7480103",
    name: "Kỹ thuật Phần mềm (Software Engineering)",
    field: "Máy tính & CNTT",
    fieldColor: "from-purple-500 to-indigo-600",
    riasecCodes: ["I", "R"],
    miCodes: ["LOGIC", "SPAT"],
    description: "Thiết kế kiến trúc hệ thống phần mềm, lập trình web/app và bảo mật ứng dụng.",
    pros: ["Tư duy thuật toán", "Cấu trúc không gian", "Giải quyết sự cố"],
    searchKeywords: ["phần mềm", "software", "công nghệ thông tin"],
    relevantSubjects: [
      { subject: "informatics", weight: 3 },
      { subject: "math", weight: 3 },
      { subject: "english", weight: 2 },
      { subject: "physics", weight: 1 }
    ],
    coreAbilities: ["logic", "problemSolving", "teamwork", "independent"],
    interestTags: ["Công nghệ", "Lập trình", "Phần mềm", "Game", "Sáng tạo"],
    valueTags: ["Thu nhập tốt", "Sáng tạo", "Tự do thời gian", "Công nghệ"],
    dislikedTags: ["Y tế / Sức khỏe", "Nghệ thuật truyền thống"],
    avgCutoff: 26.0
  },
  {
    code: "7480201",
    name: "Công nghệ Thông tin (IT)",
    field: "Máy tính & CNTT",
    fieldColor: "from-purple-500 to-indigo-600",
    riasecCodes: ["I", "R"],
    miCodes: ["LOGIC", "INTRA"],
    description: "Quản trị hạ tầng mạng, tích hợp giải pháp phần cứng và dịch vụ điện toán đám mây.",
    pros: ["Thao tác kỹ thuật", "Logic nhân quả", "Bảo trì hệ thống"],
    searchKeywords: ["công nghệ thông tin", "tin học", "cntt", "hệ thống thông tin"],
    relevantSubjects: [
      { subject: "informatics", weight: 3 },
      { subject: "math", weight: 2 },
      { subject: "physics", weight: 2 },
      { subject: "english", weight: 2 }
    ],
    coreAbilities: ["logic", "problemSolving", "independent"],
    interestTags: ["Công nghệ", "Phần cứng", "Mạng máy tính", "Hệ thống", "Internet"],
    valueTags: ["Việc làm ổn định", "Công nghệ", "Thu nhập tốt"],
    dislikedTags: ["Nghệ thuật / Hội họa", "Y tế"],
    avgCutoff: 25.5
  },
  {
    code: "7340101",
    name: "Quản trị Kinh doanh & Khởi nghiệp",
    field: "Kinh doanh & Quản trị",
    fieldColor: "from-blue-500 to-cyan-600",
    riasecCodes: ["E", "S"],
    miCodes: ["INTER", "LOGIC"],
    description: "Hoạch định chiến lược kinh doanh, quản trị dự án và vận hành tổ chức.",
    pros: ["Kỹ năng lãnh đạo", "Giao tiếp đàm phán", "Tư duy chiến lược"],
    searchKeywords: ["quản trị kinh doanh", "kinh doanh", "kinh tế"],
    relevantSubjects: [
      { subject: "math", weight: 2 },
      { subject: "english", weight: 2 },
      { subject: "literature", weight: 2 },
      { subject: "geography", weight: 1 }
    ],
    coreAbilities: ["communication", "teamwork", "problemSolving"],
    interestTags: ["Kinh doanh", "Lãnh đạo", "Khởi nghiệp", "Quản lý", "Giao tiếp"],
    valueTags: ["Cơ hội thăng tiến", "Thu nhập tốt", "Vị thế xã hội", "Thử thách"],
    dislikedTags: ["Lập trình / Code", "Kỹ thuật cơ khí"],
    avgCutoff: 25.0
  },
  {
    code: "7340115",
    name: "Marketing & Truyền thông số",
    field: "Kinh doanh & Quản trị",
    fieldColor: "from-blue-500 to-cyan-600",
    riasecCodes: ["E", "A"],
    miCodes: ["LING", "INTER"],
    description: "Nghiên cứu thị trường, phát triển thương hiệu và sáng tạo chiến dịch nội dung số.",
    pros: ["Thấu hiểu tâm lý", "Biểu đạt ngôn từ", "Bắt nhịp xu hướng"],
    searchKeywords: ["marketing", "tiếp thị", "truyền thông", "thương mại"],
    relevantSubjects: [
      { subject: "literature", weight: 3 },
      { subject: "english", weight: 2 },
      { subject: "informatics", weight: 2 },
      { subject: "math", weight: 1 }
    ],
    coreAbilities: ["creativity", "communication", "teamwork"],
    interestTags: ["Sáng tạo", "Truyền thông", "Marketing", "Nghệ thuật", "Mạng xã hội"],
    valueTags: ["Sáng tạo", "Môi trường năng động", "Tự do thời gian", "Thu nhập tốt"],
    dislikedTags: ["Kỹ thuật cơ khí", "Toán lý thuyết nặng"],
    avgCutoff: 25.2
  },
  {
    code: "7340201",
    name: "Tài chính - Ngân hàng số (Fintech)",
    field: "Kinh tế & Tài chính",
    fieldColor: "from-emerald-500 to-teal-600",
    riasecCodes: ["C", "E"],
    miCodes: ["LOGIC", "INTRA"],
    description: "Quản trị danh mục đầu tư, phân tích rủi ro tài chính và tín dụng công nghệ số.",
    pros: ["Nhạy bén với số", "Kỷ luật tài chính", "Kiểm soát rủi ro"],
    searchKeywords: ["tài chính", "ngân hàng", "kinh tế", "đầu tư"],
    relevantSubjects: [
      { subject: "math", weight: 3 },
      { subject: "english", weight: 2 },
      { subject: "informatics", weight: 2 },
      { subject: "literature", weight: 1 }
    ],
    coreAbilities: ["logic", "problemSolving", "independent"],
    interestTags: ["Tài chính", "Đầu tư", "Kinh tế", "Dữ liệu", "Chứng khoán"],
    valueTags: ["Thu nhập tốt", "Việc làm ổn định", "Cơ hội thăng tiến"],
    dislikedTags: ["Chăm sóc sức khỏe", "Văn hóa nghệ thuật"],
    avgCutoff: 25.5
  },
  {
    code: "7340301",
    name: "Kế toán - Kiểm toán",
    field: "Kinh tế & Tài chính",
    fieldColor: "from-emerald-500 to-teal-600",
    riasecCodes: ["C", "I"],
    miCodes: ["LOGIC", "INTRA"],
    description: "Giám sát tính minh bạch sổ sách, kiểm toán nội bộ và tuân thủ thuế doanh nghiệp.",
    pros: ["Tỉ mỉ cẩn trọng", "Chính trực nguyên tắc", "Rà soát chi tiết"],
    searchKeywords: ["kế toán", "kiểm toán"],
    relevantSubjects: [
      { subject: "math", weight: 3 },
      { subject: "english", weight: 2 },
      { subject: "informatics", weight: 1 },
      { subject: "literature", weight: 1 }
    ],
    coreAbilities: ["logic", "independent", "problemSolving"],
    interestTags: ["Tài chính", "Sổ sách", "Quy trình", "Kinh tế", "Rà soát chi tiết"],
    valueTags: ["Việc làm ổn định", "Kỷ luật", "Rõ ràng minh bạch"],
    dislikedTags: ["Giao tiếp bán hàng liên tục", "Chế tạo máy móc"],
    avgCutoff: 24.8
  },
  {
    code: "7720101",
    name: "Y đa khoa & Khoa học Sức khỏe",
    field: "Khoa học Sức khỏe",
    fieldColor: "from-rose-500 to-red-600",
    riasecCodes: ["I", "S"],
    miCodes: ["LOGIC", "INTER", "NATU"],
    description: "Khám chữa bệnh, bảo vệ tính mạng và nâng cao sức khỏe cộng đồng.",
    pros: ["Lòng trắc ẩn", "Kiên trì học hỏi", "Bình tĩnh áp lực cao"],
    searchKeywords: ["y khoa", "y đa khoa", "y dược", "bác sĩ"],
    relevantSubjects: [
      { subject: "biology", weight: 3 },
      { subject: "chemistry", weight: 3 },
      { subject: "math", weight: 2 },
      { subject: "english", weight: 1 }
    ],
    coreAbilities: ["problemSolving", "independent", "communication"],
    interestTags: ["Y học", "Chăm sóc sức khỏe", "Cứu người", "Sinh học", "Nghiên cứu"],
    valueTags: ["Cống hiến xã hội", "Vị thế xã hội", "Việc làm ổn định"],
    dislikedTags: ["Lập trình / Code", "Kinh doanh / Bán hàng"],
    avgCutoff: 27.5
  },
  {
    code: "7210403",
    name: "Thiết kế Đồ họa & UI/UX",
    field: "Nghệ thuật & Thiết kế",
    fieldColor: "from-pink-500 to-fuchsia-600",
    riasecCodes: ["A", "R"],
    miCodes: ["SPAT", "LING"],
    description: "Sáng tạo bộ nhận diện thương hiệu, thiết kế trải nghiệm người dùng số.",
    pros: ["Gu thẩm mỹ cao", "Tư duy hình ảnh 3D", "Sáng tạo phá cách"],
    searchKeywords: ["thiết kế", "đồ họa", "mỹ thuật", "kiến trúc"],
    relevantSubjects: [
      { subject: "literature", weight: 2 },
      { subject: "informatics", weight: 2 },
      { subject: "english", weight: 2 },
      { subject: "technology", weight: 1 }
    ],
    coreAbilities: ["creativity", "independent", "problemSolving"],
    interestTags: ["Sáng tạo", "Hội họa", "Thiết kế", "Nghệ thuật", "Công nghệ"],
    valueTags: ["Sáng tạo", "Tự do thời gian", "Môi trường năng động"],
    dislikedTags: ["Toán lý thuyết nặng", "Sổ sách kế toán"],
    avgCutoff: 24.2
  },
  {
    code: "7140201",
    name: "Sư phạm & Đào tạo Phát triển",
    field: "Sư phạm & Giáo dục",
    fieldColor: "from-amber-500 to-orange-600",
    riasecCodes: ["S", "I"],
    miCodes: ["INTER", "LING"],
    description: "Giảng dạy, truyền cảm hứng tri thức và đồng hành cùng người học phát triển.",
    pros: ["Kiên nhẫn thấu hiểu", "Diễn đạt khúc chiết", "Tâm huyết phụng sự"],
    searchKeywords: ["sư phạm", "giáo dục"],
    relevantSubjects: [
      { subject: "literature", weight: 3 },
      { subject: "english", weight: 2 },
      { subject: "history", weight: 1 },
      { subject: "geography", weight: 1 }
    ],
    coreAbilities: ["communication", "teamwork", "creativity"],
    interestTags: ["Giáo dục", "Giảng dạy", "Chia sẻ kiến thức", "Đồng hành", "Tâm lý"],
    valueTags: ["Cống hiến xã hội", "Việc làm ổn định", "Môi trường nhân văn"],
    dislikedTags: ["Kinh doanh / Áp lực doanh số", "Kỹ thuật cơ khí"],
    avgCutoff: 24.5
  },
  {
    code: "7380107",
    name: "Luật Kinh tế & Pháp chế Doanh nghiệp",
    field: "Pháp luật",
    fieldColor: "from-amber-500 to-orange-600",
    riasecCodes: ["E", "C"],
    miCodes: ["LING", "LOGIC"],
    description: "Bảo vệ quyền lợi hợp pháp, tư vấn hợp đồng kinh tế và giải quyết tranh chấp.",
    pros: ["Lập luận đanh thép", "Tư duy phản biện", "Tôn trọng pháp luật"],
    searchKeywords: ["luật", "pháp lý", "kinh tế luật"],
    relevantSubjects: [
      { subject: "literature", weight: 3 },
      { subject: "history", weight: 2 },
      { subject: "english", weight: 2 },
      { subject: "math", weight: 1 }
    ],
    coreAbilities: ["logic", "communication", "problemSolving"],
    interestTags: ["Pháp luật", "Lập luận", "Tranh biện", "Chính sách", "Doanh nghiệp"],
    valueTags: ["Công bằng xã hội", "Vị thế xã hội", "Thu nhập tốt"],
    dislikedTags: ["Lập trình / Code", "Phòng thí nghiệm y sinh"],
    avgCutoff: 25.5
  },
  {
    code: "7520130",
    name: "Kỹ thuật Cơ điện tử & Tự động hóa",
    field: "Kỹ thuật & Công nghệ",
    fieldColor: "from-cyan-600 to-blue-700",
    riasecCodes: ["R", "I"],
    miCodes: ["BODI", "LOGIC", "SPAT"],
    description: "Nghiên cứu, lắp ráp và vận hành dây chuyền cánh tay robot thông minh.",
    pros: ["Đam mê máy móc", "Tư duy mạch điện", "Khéo léo kỹ thuật"],
    searchKeywords: ["cơ điện tử", "tự động hóa", "cơ khí", "điện tử"],
    relevantSubjects: [
      { subject: "physics", weight: 3 },
      { subject: "math", weight: 3 },
      { subject: "technology", weight: 2 },
      { subject: "informatics", weight: 1 }
    ],
    coreAbilities: ["problemSolving", "logic", "independent"],
    interestTags: ["Máy móc", "Robot", "Tự động hóa", "Điện tử", "Chế tạo"],
    valueTags: ["Công nghệ", "Thu nhập tốt", "Thách thức kỹ thuật"],
    dislikedTags: ["Chăm sóc khách hàng", "Kế toán / Sổ sách"],
    avgCutoff: 25.0
  }
];

export interface EduPathSubjectScore {
  score: number;
  trend: string;
  interest: number;
}

export interface EduPathFormData {
  subjects: Record<string, EduPathSubjectScore>;
  abilities: Record<string, number>;
  interests: string[];
  values: string[];
  dislikedFields: string[];
  selfLearningRating: number;
}

export interface ScoredMajorRecommendation extends MajorRule {
  matchPercentage: number;
  strengthNote: string;
  gapNote: string;
  academicScore: number;
  abilityScore: number;
  interestScore: number;
  valueScore: number;
}

/**
 * Thuật toán tính độ tương thích đa chiều cho EduPath:
 * - 35% Học thuật (Điểm môn liên quan + xu hướng điểm)
 * - 30% Năng lực hành vi (Thang đo 1-5 sao)
 * - 20% Đam mê & Sở thích
 * - 15% Giá trị cốt lõi
 * - Phạt nếu nằm trong ngành không thích (dislikedFields)
 */
export function calculateEduPathRecommendations(formData: EduPathFormData): ScoredMajorRecommendation[] {
  const scored = MAJORS_DATABASE.map((major) => {
    // 1. Học thuật (35%)
    let totalSubjectWeight = 0;
    let weightedSubjectScore = 0;
    const strongSubjectNames: string[] = [];
    const weakSubjectNames: string[] = [];

    major.relevantSubjects.forEach(({ subject, weight }) => {
      const subjData = formData.subjects[subject];
      if (subjData) {
        totalSubjectWeight += weight;
        // Điểm thực tế kết hợp với mức độ thích môn học (interest 1-5)
        const effectiveScore = subjData.score * 0.8 + (subjData.interest * 2) * 0.2;
        weightedSubjectScore += effectiveScore * weight;

        const subjNameVi: Record<string, string> = {
          math: "Toán", literature: "Ngữ văn", english: "Tiếng Anh", physics: "Vật lý",
          chemistry: "Hóa học", biology: "Sinh học", history: "Lịch sử",
          geography: "Địa lý", informatics: "Tin học", technology: "Công nghệ"
        };

        const label = subjNameVi[subject] || subject;
        if (subjData.score >= 8.0) {
          strongSubjectNames.push(`${label} (${subjData.score})`);
        } else if (subjData.score < 6.5) {
          weakSubjectNames.push(`${label} (${subjData.score})`);
        }
      }
    });

    const academicNormalized = totalSubjectWeight > 0
      ? (weightedSubjectScore / totalSubjectWeight) * 10 // 0-100 scale
      : 70;

    // 2. Năng lực hành vi (30%)
    let abilitySum = 0;
    const strongAbilities: string[] = [];
    const weakAbilities: string[] = [];

    const abilityNameVi: Record<string, string> = {
      problemSolving: "Giải quyết vấn đề", logic: "Tư duy logic",
      creativity: "Sáng tạo", communication: "Giao tiếp",
      teamwork: "Làm việc nhóm", independent: "Làm việc độc lập"
    };

    major.coreAbilities.forEach((ab) => {
      const val = formData.abilities[ab] ?? 3;
      abilitySum += val;
      const label = abilityNameVi[ab] || ab;
      if (val >= 4) {
        strongAbilities.push(`${label} (${val}/5★)`);
      } else if (val <= 2) {
        weakAbilities.push(`${label} (${val}/5★)`);
      }
    });

    const abilityNormalized = major.coreAbilities.length > 0
      ? (abilitySum / (major.coreAbilities.length * 5)) * 100 // 0-100 scale
      : 70;

    // 3. Sở thích & Đam mê (20%)
    const userInterests = (formData.interests || []).map((s) => s.toLowerCase());
    const matchedInterests = major.interestTags.filter((tag) =>
      userInterests.some((ui) => ui.includes(tag.toLowerCase()) || tag.toLowerCase().includes(ui))
    );
    const interestRatio = major.interestTags.length > 0
      ? Math.min(1, matchedInterests.length / Math.min(3, major.interestTags.length))
      : 0.5;
    const interestNormalized = interestRatio * 100;

    // 4. Giá trị nghề nghiệp (15%)
    const userValues = (formData.values || []).map((v) => v.toLowerCase());
    const matchedValues = major.valueTags.filter((tag) =>
      userValues.some((uv) => uv.includes(tag.toLowerCase()) || tag.toLowerCase().includes(uv))
    );
    const valueRatio = major.valueTags.length > 0
      ? Math.min(1, matchedValues.length / Math.min(3, major.valueTags.length))
      : 0.5;
    const valueNormalized = valueRatio * 100;

    // 5. Kiểm tra ngành bị học sinh liệt kê vào danh sách không thích (dislikedFields)
    const userDisliked = (formData.dislikedFields || []).map((d) => d.toLowerCase());
    const isDisliked = userDisliked.some((ud) =>
      major.field.toLowerCase().includes(ud) ||
      major.name.toLowerCase().includes(ud) ||
      major.searchKeywords.some((kw) => kw.includes(ud) || ud.includes(kw))
    );

    const dislikePenalty = isDisliked ? 30 : 0;

    // Tổng hợp điểm số
    const rawTotal = (
      academicNormalized * 0.35 +
      abilityNormalized * 0.30 +
      interestNormalized * 0.20 +
      valueNormalized * 0.15
    ) - dislikePenalty;

    // Chuẩn hóa phần trăm trong khoảng 45% -> 98%
    const matchPercentage = Math.max(45, Math.min(98, Math.round(rawTotal)));

    // Tạo ghi chú Điểm mạnh & Điểm cần lưu ý thực tế
    let strengthNote = "";
    if (strongSubjectNames.length > 0 && strongAbilities.length > 0) {
      strengthNote = `Học lực vững vàng ở môn ${strongSubjectNames.slice(0, 2).join(" & ")}, cộng hưởng cùng ${strongAbilities.slice(0, 2).join(" & ")}.`;
    } else if (strongSubjectNames.length > 0) {
      strengthNote = `Điểm số vượt trội ở ${strongSubjectNames.join(", ")} là bệ phóng lớn cho chuyên ngành này.`;
    } else if (strongAbilities.length > 0) {
      strengthNote = `Năng lực cá nhân nổi trội: ${strongAbilities.join(", ")}, rất hợp phong cách đào tạo.`;
    } else {
      strengthNote = `Có nền tảng sở thích và giá trị đồng điệu với nhóm ngành ${major.field}.`;
    }

    let gapNote = "";
    if (isDisliked) {
      gapNote = `Ngành thuộc nhóm bạn từng đánh dấu ít yêu thích. Cần cân nhắc lại định hướng nếu theo đuổi.`;
    } else if (weakSubjectNames.length > 0) {
      gapNote = `Cần bồi dưỡng thêm môn ${weakSubjectNames.join(", ")} để tăng lợi thế điểm chuẩn khi xét tuyển.`;
    } else if (weakAbilities.length > 0) {
      gapNote = `Nên rèn luyện thêm kỹ năng ${weakAbilities.join(", ")} trong quá trình học đại học.`;
    } else if (formData.selfLearningRating < 4) {
      gapNote = `Khả năng tự học (${formData.selfLearningRating}/5★) cần chủ động hơn vì khối lượng kiến thức ngành này khá lớn.`;
    } else {
      gapNote = `Duy trì phong độ học tập hiện tại và tích cực tích lũy chứng chỉ ngoại ngữ (IELTS/TOEIC).`;
    }

    return {
      ...major,
      matchPercentage,
      strengthNote,
      gapNote,
      academicScore: Math.round(academicNormalized),
      abilityScore: Math.round(abilityNormalized),
      interestScore: Math.round(interestNormalized),
      valueScore: Math.round(valueNormalized)
    };
  });

  // Sắp xếp theo độ phù hợp từ cao xuống thấp
  scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return scored;
}
