import { UniversityMatchResult, StudentCareerProfile, UniversityFitBreakdown } from "./types";
import rawUniversities from "@/data/universities.json";

interface RawUniItem {
  id: string;
  name: string;
  shortName: string;
  city: string;
  region: "BAC" | "TRUNG" | "NAM";
  cutoff: number;
  tuition: number;
  type: string;
  highlight: string;
  majors?: {
    major_name: string;
    cutoff_score: number;
  }[];
}

const universitiesList: RawUniItem[] = rawUniversities as unknown as RawUniItem[];

// Dữ liệu mở rộng chi tiết cho các trường đại học nòng cốt (Đặc biệt là HCMUTE)
interface UniversityExtendedMetadata {
  university_id: string;
  official_name: string;
  short_name: string;
  city: string;
  region: "BAC" | "TRUNG" | "NAM";
  type: "Công lập" | "Tư thục" | "Quốc tế";
  average_cutoff: number;
  tuition_million_year: number;
  scholarship_info: string;
  admission_methods: string[];
  campus_environment: string;
  curriculum_highlight: string;
  career_opportunities: string;
  strengths: string[];
  majors: {
    major_name: string;
    cutoff_score: number;
  }[];
}

const CORE_UNIVERSITIES_METADATA: Record<string, UniversityExtendedMetadata> = {
  SPK: {
    university_id: "SPK",
    official_name: "Trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE)",
    short_name: "HCMUTE",
    city: "TP. Hồ Chí Minh",
    region: "NAM",
    type: "Công lập",
    average_cutoff: 25.8,
    tuition_million_year: 29,
    scholarship_info:
      "Quỹ học bổng 36 tỷ đồng/năm; Học bổng khuyến tài 100% học phí toàn khóa cho thủ khoa; Học bổng doanh nghiệp tài trợ từ Bosch, Intel, Samsung, Nidec.",
    admission_methods: [
      "Xét điểm thi Tốt nghiệp THPT 2026 (Tổ hợp A00, A01, B00, D01, D07, D90)",
      "Xét điểm thi Đánh giá năng lực ĐHQG-HCM 2026 (Thang điểm 1200)",
      "Xét học bạ THPT 5 học kỳ (Điểm TB từng môn theo tổ hợp ≥ 8.0)",
      "Tuyển thẳng theo quy chế Bộ GD&ĐT & Ưu tiên xét tuyển học sinh giỏi trường chuyên"
    ],
    campus_environment:
      "Khuôn viên 21ha tại trung tâm TP. Thủ Đức, 120+ phòng thí nghiệm chuyên sâu, xưởng thực hành hiện đại, Trung tâm Sáng tạo MakerSpace, Ký túc xá tiện nghi 3.000 chỗ.",
    curriculum_highlight:
      "Định hướng ứng dụng kỹ thuật thực chiến (40% Lý thuyết - 60% Thực hành). Đạt chuẩn kiểm định quốc tế AUN-QA và ABET (Hoa Kỳ) cho các chương trình kỹ thuật nòng cốt.",
    career_opportunities:
      "96.5% sinh viên có việc làm sau 6 tháng tốt nghiệp; mạng lưới liên kết hơn 500 tập đoàn đa quốc gia và doanh nghiệp tại Khu Công nghệ cao TP.HCM (SHTP).",
    strengths: [
      "Trường đại học kỹ thuật công nghệ trọng điểm phía Nam",
      "Hệ thống phòng xưởng thực hành quy mô hàng đầu khu vực",
      "Chương trình đào tạo đạt chuẩn kiểm định quốc tế ABET & AUN-QA"
    ],
    majors: [
      { major_name: "Công nghệ Thông tin", cutoff_score: 26.5 },
      { major_name: "Kỹ thuật Robot & Trí tuệ Nhân tạo", cutoff_score: 26.75 },
      { major_name: "Kỹ thuật Cơ điện tử", cutoff_score: 25.5 },
      { major_name: "Công nghệ Kỹ thuật Ô tô", cutoff_score: 26.25 },
      { major_name: "Kỹ thuật Điều khiển & Tự động hóa", cutoff_score: 25.75 },
      { major_name: "Kỹ thuật Phần mềm", cutoff_score: 26.0 },
      { major_name: "Công nghệ Kỹ thuật Điện - Điện tử", cutoff_score: 25.0 },
      { major_name: "Thiết kế Vi mạch bán dẫn", cutoff_score: 26.2 },
      { major_name: "Kinh doanh Quốc tế", cutoff_score: 25.8 }
    ]
  },
  QSB: {
    university_id: "QSB",
    official_name: "Trường Đại học Bách Khoa - ĐHQG TP.HCM",
    short_name: "HCMUT",
    city: "TP. Hồ Chí Minh",
    region: "NAM",
    type: "Công lập",
    average_cutoff: 26.5,
    tuition_million_year: 35,
    scholarship_info:
      "Học bổng khuyến khích học tập ĐHQG-HCM, quỹ học bổng cựu sinh viên Phú Thọ - Bách Khoa, học bổng doanh nghiệp đa quốc gia.",
    admission_methods: [
      "Xét tuyển tổng hợp (kết hợp điểm thi THPT, ĐGNL ĐHQG-HCM và học bạ)",
      "Tuyển thẳng học sinh giỏi theo quy định ĐHQG-HCM"
    ],
    campus_environment:
      "Cơ sở 1 tại Q.10 trung tâm thành phố và Cơ sở 2 tại Khu đô thị ĐHQG Dĩ An quy mô lớn.",
    curriculum_highlight:
      "Đào tạo kỹ sư chuyên sâu theo chuẩn quốc tế ABET, nhấn mạnh tư duy nghiên cứu và thiết kế hệ thống lớn.",
    career_opportunities:
      "95% sinh viên có việc làm đúng chuyên môn; mạng lưới cựu sinh viên kỹ thuật lớn mạnh toàn cầu.",
    strengths: [
      "Trung tâm đào tạo kỹ thuật danh tiếng bậc nhất miền Nam",
      "Chuẩn kiểm định ABET toàn diện nhiều ngành kỹ thuật"
    ],
    majors: [
      { major_name: "Khoa học Máy tính", cutoff_score: 27.5 },
      { major_name: "Kỹ thuật Cơ điện tử", cutoff_score: 26.0 },
      { major_name: "Kỹ thuật Hóa học", cutoff_score: 25.0 },
      { major_name: "Kỹ thuật Điện - Điện tử", cutoff_score: 26.2 }
    ]
  },
  QSC: {
    university_id: "QSC",
    official_name: "Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM",
    short_name: "UIT",
    city: "TP. Hồ Chí Minh",
    region: "NAM",
    type: "Công lập",
    average_cutoff: 26.8,
    tuition_million_year: 33,
    scholarship_info:
      "Học bổng tài năng CNTT, học bổng doanh nghiệp công nghệ (Google, FPT, VinGroup).",
    admission_methods: [
      "Điểm thi Đánh giá năng lực ĐHQG-HCM",
      "Điểm thi Tốt nghiệp THPT",
      "Tuyển thẳng học sinh đoạt giải Tin học/Toán quốc gia"
    ],
    campus_environment:
      "Nằm trong làng đại học ĐHQG-HCM tại TP. Thủ Đức, hệ thống máy chủ và phòng Lab AI chuyên sâu.",
    curriculum_highlight:
      "Chuyên biệt 100% về Khoa học Máy tính, Trí tuệ Nhân tạo, An toàn Thông tin và Mạng máy tính.",
    career_opportunities:
      "97% sinh viên có việc làm sớm tại các tập đoàn phần mềm, kỳ lân công nghệ và công ty bảo mật.",
    strengths: [
      "Đơn vị đào tạo CNTT mũi nhọn trực thuộc ĐHQG-HCM",
      "Môi trường học tập thuần công nghệ cao và bảo mật"
    ],
    majors: [
      { major_name: "Khoa học Dữ liệu", cutoff_score: 27.1 },
      { major_name: "An toàn Thông tin", cutoff_score: 26.9 },
      { major_name: "Trí tuệ Nhân tạo", cutoff_score: 27.8 }
    ]
  },
  UEH: {
    university_id: "UEH",
    official_name: "Đại học Kinh tế TP. Hồ Chí Minh",
    short_name: "UEH",
    city: "TP. Hồ Chí Minh",
    region: "NAM",
    type: "Công lập",
    average_cutoff: 26.0,
    tuition_million_year: 38,
    scholarship_info:
      "Học bổng sinh viên tài năng UEH, học bổng các định chế tài chính, kiểm toán Big4.",
    admission_methods: [
      "Xét tuyển theo tổ hợp điểm thi tốt nghiệp THPT",
      "Xét tuyển kết hợp chứng chỉ tiếng Anh quốc tế và học bạ"
    ],
    campus_environment:
      "Cơ sở thông minh phân bổ tại các quận trung tâm và đại đô thị Nam Sài Gòn (Bình Chánh).",
    curriculum_highlight:
      "Chuẩn kiểm định quốc tế FIBAA, tích hợp công nghệ phân tích dữ liệu kinh doanh và FinTech.",
    career_opportunities:
      "95% việc làm trong ngành tài chính, ngân hàng, quản trị chuỗi cung ứng và thương mại quốc tế.",
    strengths: [
      "Đại học kinh tế hàng đầu cả nước theo xếp hạng QS",
      "Mạng lưới liên kết chặt chẽ với ngân hàng và tập đoàn tài chính"
    ],
    majors: [
      { major_name: "Tài chính - Ngân hàng", cutoff_score: 26.0 },
      { major_name: "Kinh doanh Quốc tế", cutoff_score: 26.8 },
      { major_name: "Công nghệ Tài chính (FinTech)", cutoff_score: 26.5 }
    ]
  },
  BKA: {
    university_id: "BKA",
    official_name: "Đại học Bách Khoa Hà Nội",
    short_name: "HUST",
    city: "Hà Nội",
    region: "BAC",
    type: "Công lập",
    average_cutoff: 26.8,
    tuition_million_year: 30,
    scholarship_info:
      "Học bổng khuyến khích tài năng Bách Khoa, học bổng hỗ trợ nghiên cứu sinh và doanh nghiệp miền Bắc.",
    admission_methods: [
      "Kỳ thi Đánh giá tư duy (TSA)",
      "Điểm thi tốt nghiệp THPT",
      "Xét tuyển tài năng"
    ],
    campus_environment:
      "Khuôn viên 26ha trung tâm thủ đô Hà Nội, thư viện Tạ Quang Bửu hiện đại bậc nhất.",
    curriculum_highlight:
      "Khối lượng học thuật chuyên sâu, đào tạo kỹ sư tinh hoa theo chuẩn CTI châu Âu.",
    career_opportunities:
      "96% việc làm, cung cấp đội ngũ kỹ sư nòng cốt cho các trung tâm nghiên cứu và công nghiệp phía Bắc.",
    strengths: [
      "Ngọn cờ đầu về đào tạo kỹ thuật công nghệ tại miền Bắc",
      "Kỳ thi Đánh giá tư duy chuẩn mực và uy tín"
    ],
    majors: [
      { major_name: "Khoa học Máy tính", cutoff_score: 28.0 },
      { major_name: "Kỹ thuật Điều khiển & Tự động hóa", cutoff_score: 26.8 },
      { major_name: "Kỹ thuật Điện tử - Viễn thông", cutoff_score: 26.2 }
    ]
  },
  QSQ: {
    university_id: "QSQ",
    official_name: "Trường Đại học Quốc Tế - ĐHQG TP.HCM",
    short_name: "IU",
    city: "TP. Hồ Chí Minh",
    region: "NAM",
    type: "Công lập",
    average_cutoff: 23.5,
    tuition_million_year: 56,
    scholarship_info:
      "Học bổng toàn phần và bán phần tuyển sinh danh dự, học bổng trao đổi sinh viên quốc tế.",
    admission_methods: [
      "Điểm thi THPT",
      "Đánh giá năng lực ĐHQG-HCM",
      "Xét tuyển chứng chỉ quốc tế SAT / ACT / IELTS"
    ],
    campus_environment:
      "Khuôn viên hiện đại tại Làng Đại học ĐHQG Thủ Đức, 100% môi trường học thuật tiếng Anh.",
    curriculum_highlight:
      "Giảng dạy hoàn toàn bằng tiếng Anh theo chương trình chuẩn mực của các đại học đối tác Hoa Kỳ/Anh Quốc.",
    career_opportunities:
      "Lợi thế vượt trội về ngoại ngữ và kỹ năng toàn cầu, dễ dàng làm việc tại các công ty đa quốc gia hoặc du học thạc sĩ.",
    strengths: [
      "Đại học công lập đa ngành đầu tiên tại Việt Nam đào tạo 100% bằng tiếng Anh",
      "Chương trình chuyển tiếp 2+2, 3+1 linh hoạt với các trường ĐH danh tiếng thế giới"
    ],
    majors: [
      { major_name: "Quản trị Kinh doanh", cutoff_score: 23.5 },
      { major_name: "Kỹ thuật Hệ thống Công nghiệp", cutoff_score: 22.0 },
      { major_name: "Khoa học Dữ liệu", cutoff_score: 24.0 }
    ]
  },
  DSK: {
    university_id: "DSK",
    official_name: "Trường Đại học Sư phạm Kỹ thuật - Đại học Đà Nẵng",
    short_name: "UTE-ĐN",
    city: "Đà Nẵng",
    region: "TRUNG",
    type: "Công lập",
    average_cutoff: 22.8,
    tuition_million_year: 23,
    scholarship_info:
      "Học bổng khuyến khích học tập ĐH Đà Nẵng, học bổng doanh nghiệp công nghệ miền Trung.",
    admission_methods: [
      "Điểm thi tốt nghiệp THPT",
      "Đánh giá năng lực ĐHQG-HCM / ĐHQG Hà Nội",
      "Xét học bạ THPT"
    ],
    campus_environment:
      "Cơ sở tại trung tâm TP. Đà Nẵng, hệ thống xưởng kỹ thuật và không gian đổi mới sáng tạo.",
    curriculum_highlight:
      "Đào tạo kỹ sư ứng dụng phục vụ trực tiếp cho các khu công nghiệp và đô thị thông minh miền Trung.",
    career_opportunities:
      "93% sinh viên có việc làm tại Đà Nẵng, Quảng Nam, Dung Quất và các tỉnh lân cận.",
    strengths: [
      "Đơn vị đào tạo kỹ thuật ứng dụng chủ lực tại miền Trung",
      "Học phí công lập hợp lý, chi phí sinh hoạt tại Đà Nẵng tối ưu"
    ],
    majors: [
      { major_name: "Công nghệ Kỹ thuật Ô tô", cutoff_score: 23.5 },
      { major_name: "Công nghệ Thông tin", cutoff_score: 24.0 },
      { major_name: "Kỹ thuật Điều khiển & Tự động hóa", cutoff_score: 22.5 }
    ]
  }
};

/**
 * Tính toán 7 chiều tương thích khoa học của trường đại học dựa trên hồ sơ người dùng
 */
export function computeUniversityFit(
  profile: StudentCareerProfile,
  uni: {
    cutoff: number;
    tuition: number;
    city: string;
    region: string;
    type: string;
    name: string;
    isHcmute?: boolean;
  }
): UniversityFitBreakdown {
  const expectedScore = profile.user_context?.expected_exam_score || 25.0;
  const targetProvince = (profile.user_context?.target_province || profile.user_context?.location || "").toLowerCase();
  const budgetMax = profile.user_context?.tuition_budget_max_million || 40;
  const acad = profile.academic_profile;
  const gpa = acad ? (acad.math_score + acad.literature_score + acad.english_score) / 3 : 8.0;

  // 1. Admission Fit (0 - 100): Chênh lệch điểm kỳ vọng với điểm chuẩn
  const scoreDiff = expectedScore - uni.cutoff;
  let admissionFit = 80;
  if (scoreDiff >= 2.0) admissionFit = 96;
  else if (scoreDiff >= 1.0) admissionFit = 92;
  else if (scoreDiff >= 0) admissionFit = 86;
  else if (scoreDiff >= -0.75) admissionFit = 78;
  else if (scoreDiff >= -1.5) admissionFit = 66;
  else admissionFit = 50;

  // 2. Academic Fit (0 - 100): Đánh giá năng lực tự nhiên/logic/phân tích so với độ khó học thuật
  const analyticalCap = profile.capabilities?.analytical_thinking ?? 75;
  const logicalCap = profile.capabilities?.logical_thinking ?? 75;
  const digitalCap = profile.capabilities?.digital_literacy ?? 70;
  const avgAcademicSkill = (analyticalCap + logicalCap + digitalCap) / 3;
  let academicFit = Math.round(avgAcademicSkill * 0.6 + (gpa / 10) * 100 * 0.4);
  if (uni.isHcmute) {
    academicFit = Math.min(98, Math.max(78, Math.round(academicFit * 1.05)));
  }

  // 3. Financial Fit (0 - 100): So khớp học phí với ngân sách
  let financialFit = 85;
  if (uni.tuition <= budgetMax * 0.8) financialFit = 98;
  else if (uni.tuition <= budgetMax) financialFit = 92;
  else if (uni.tuition <= budgetMax * 1.25) financialFit = 80;
  else if (uni.tuition <= budgetMax * 1.6) financialFit = 65;
  else financialFit = 45;

  // 4. Location Fit (0 - 100): Phù hợp địa lý & cơ sở
  let locationFit = 72;
  const uniCity = (uni.city || "").toLowerCase();
  if (targetProvince && (uniCity.includes(targetProvince) || targetProvince.includes(uniCity))) {
    locationFit = 98;
  } else if (uni.region === "NAM" || targetProvince.includes("hồ chí minh") || targetProvince.includes("tphcm")) {
    locationFit = 90;
  } else {
    locationFit = 68;
  }

  // 5. Career Fit (0 - 100): Cơ hội việc làm và mạng lưới đối tác
  let careerFit = 82;
  if (uni.isHcmute) {
    careerFit = 96; // 96.5% tỷ lệ việc làm, đối tác SHTP và tập đoàn đa quốc gia
  } else if (uni.type === "Công lập" && uni.cutoff >= 25) {
    careerFit = 91;
  } else if (uni.tuition > 70) {
    careerFit = 86;
  } else {
    careerFit = 78;
  }

  // 6. Environment Fit (0 - 100): Phong cách học tập thực hành/nghiên cứu
  let environmentFit = 80;
  const practicalStyle = profile.work_style?.theory_vs_practice ?? 20; // > 0 nghĩa là thiên về thực hành
  if (uni.isHcmute) {
    // HCMUTE đặc trưng 60% thời lượng thực hành xưởng/lab
    environmentFit = practicalStyle >= 0 ? 95 : 84;
  } else if (uni.name.includes("Bách Khoa")) {
    environmentFit = 88;
  } else {
    environmentFit = 80;
  }

  // 7. Overall Fit (0 - 100): Trọng số đa chiều
  const overallFit = Math.round(
    admissionFit * 0.25 +
    academicFit * 0.20 +
    careerFit * 0.20 +
    financialFit * 0.15 +
    environmentFit * 0.10 +
    locationFit * 0.10
  );

  return {
    overall_fit: Math.min(99, Math.max(45, overallFit)),
    academic_fit: Math.min(99, Math.max(45, academicFit)),
    admission_fit: Math.min(99, Math.max(45, admissionFit)),
    financial_fit: Math.min(99, Math.max(40, financialFit)),
    location_fit: Math.min(99, Math.max(50, locationFit)),
    career_fit: Math.min(99, Math.max(50, careerFit)),
    environment_fit: Math.min(99, Math.max(50, environmentFit))
  };
}

export function matchUniversities(
  profile: StudentCareerProfile,
  filterMajorQuery?: string
): UniversityMatchResult[] {
  const expectedScore = profile.user_context?.expected_exam_score || 25.0;
  const results: UniversityMatchResult[] = [];

  // Tạo một map các mã trường đã xử lý để tránh trùng lặp
  const processedUniIds = new Set<string>();

  // 1. Luôn đưa các trường nòng cốt (Đặc biệt là HCMUTE) vào danh sách với dữ liệu chuẩn hóa cao cấp
  for (const [key, core] of Object.entries(CORE_UNIVERSITIES_METADATA)) {
    processedUniIds.add(core.university_id);
    const isHcmute = core.university_id === "SPK" || core.short_name === "HCMUTE";

    const matchingMajors: UniversityMatchResult["matching_majors"] = [];
    for (const m of core.majors) {
      if (filterMajorQuery) {
        const q = filterMajorQuery.toLowerCase();
        if (!m.major_name.toLowerCase().includes(q)) {
          continue;
        }
      }

      const diff = expectedScore - m.cutoff_score;
      let feasibility: "Safe" | "Target" | "Reach" = "Target";
      if (diff >= 1.5) feasibility = "Safe";
      else if (diff >= -0.75) feasibility = "Target";
      else feasibility = "Reach";

      matchingMajors.push({
        major_name: m.major_name,
        cutoff_score: m.cutoff_score,
        feasibility,
        diff_score: Math.round(diff * 10) / 10
      });
    }

    if (matchingMajors.length === 0 && filterMajorQuery) {
      continue;
    }

    // Đánh giá tổng quan độ khả thi
    const avgDiff = expectedScore - core.average_cutoff;
    let overallFeasibility: "Safe" | "Target" | "Reach" = "Target";
    if (avgDiff >= 1.5) overallFeasibility = "Safe";
    else if (avgDiff >= -0.75) overallFeasibility = "Target";
    else overallFeasibility = "Reach";

    const fitBreakdown = computeUniversityFit(profile, {
      cutoff: core.average_cutoff,
      tuition: core.tuition_million_year,
      city: core.city,
      region: core.region,
      type: core.type,
      name: core.official_name,
      isHcmute
    });

    results.push({
      university_id: core.university_id,
      university_name: core.official_name,
      short_name: core.short_name,
      city: core.city,
      region: core.region,
      type: core.type,
      tuition_million_year: core.tuition_million_year,
      matching_majors: matchingMajors.slice(0, 6),
      overall_feasibility: overallFeasibility,
      match_score: fitBreakdown.overall_fit,
      strengths: core.strengths,
      fit_breakdown: fitBreakdown,
      scholarship_info: core.scholarship_info,
      admission_methods: core.admission_methods,
      campus_environment: core.campus_environment,
      curriculum_highlight: core.curriculum_highlight,
      career_opportunities: core.career_opportunities,
      average_cutoff: core.average_cutoff
    });
  }

  // 2. Xử lý các trường còn lại trong rawUniversities
  for (const uni of universitiesList) {
    if (processedUniIds.has(uni.id) || processedUniIds.has(uni.shortName)) {
      continue;
    }
    processedUniIds.add(uni.id);

    const matchingMajors: UniversityMatchResult["matching_majors"] = [];
    const majorsToCheck = uni.majors && uni.majors.length > 0 ? uni.majors : [
      { major_name: "Công nghệ Thông tin", cutoff_score: uni.cutoff || 24.5 },
      { major_name: "Quản trị Kinh doanh", cutoff_score: (uni.cutoff || 24.5) - 0.75 }
    ];

    for (const m of majorsToCheck) {
      if (filterMajorQuery) {
        const q = filterMajorQuery.toLowerCase();
        if (!m.major_name.toLowerCase().includes(q)) {
          continue;
        }
      }

      const diff = expectedScore - m.cutoff_score;
      let feasibility: "Safe" | "Target" | "Reach" = "Target";
      if (diff >= 1.5) feasibility = "Safe";
      else if (diff >= -0.75) feasibility = "Target";
      else feasibility = "Reach";

      matchingMajors.push({
        major_name: m.major_name,
        cutoff_score: m.cutoff_score,
        feasibility,
        diff_score: Math.round(diff * 10) / 10
      });
    }

    if (matchingMajors.length === 0 && filterMajorQuery) {
      continue;
    }

    const cutoffAvg = uni.cutoff || 24.0;
    const avgDiff = expectedScore - cutoffAvg;
    let overallFeasibility: "Safe" | "Target" | "Reach" = "Target";
    if (avgDiff >= 1.5) overallFeasibility = "Safe";
    else if (avgDiff >= -0.75) overallFeasibility = "Target";
    else overallFeasibility = "Reach";

    const fitBreakdown = computeUniversityFit(profile, {
      cutoff: cutoffAvg,
      tuition: uni.tuition || 26,
      city: uni.city,
      region: uni.region,
      type: uni.type,
      name: uni.name,
      isHcmute: false
    });

    results.push({
      university_id: uni.id,
      university_name: uni.name,
      short_name: uni.shortName || uni.id,
      city: uni.city,
      region: uni.region,
      type: (uni.type as "Công lập" | "Tư thục" | "Quốc tế") || "Công lập",
      tuition_million_year: uni.tuition || 26,
      matching_majors: matchingMajors.slice(0, 5),
      overall_feasibility: overallFeasibility,
      match_score: fitBreakdown.overall_fit,
      strengths: [uni.highlight || "Trường đại học đào tạo uy tín theo tiêu chuẩn quốc gia"],
      fit_breakdown: fitBreakdown,
      scholarship_info: "Học bổng khuyến khích học tập theo quy định của nhà trường và quỹ hỗ trợ sinh viên.",
      admission_methods: [
        "Xét kết quả thi Tốt nghiệp THPT",
        "Xét học bạ THPT",
        "Xét điểm thi Đánh giá năng lực"
      ],
      campus_environment: `Khuôn viên và cơ sở đào tạo tại ${uni.city}, trang bị đầy đủ giảng đường và phòng học chức năng.`,
      curriculum_highlight: "Chương trình chuẩn hóa theo khung trình độ quốc gia của Bộ GD&ĐT.",
      career_opportunities: "Sinh viên tốt nghiệp được doanh nghiệp tuyển dụng tại khu vực.",
      average_cutoff: cutoffAvg
    });
  }

  return results.sort((a, b) => b.match_score - a.match_score);
}
