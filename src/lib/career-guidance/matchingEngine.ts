import {
  StudentCareerProfile,
  CareerDNA,
  MajorDNA,
  CareerMatchResult,
  MajorMatchResult,
  MatchScoreReason,
  InterestDimension,
  CapabilityDimension,
  CareerValue,
  NegativePreference
} from "./types";
import { CAREERS_DATA } from "./careersData";
import { MAJORS_DATA } from "./majorsData";

/**
 * Tính toán độ tương đồng giữa vector người dùng và yêu cầu nghề nghiệp
 */
function calculateVectorFit(
  userScores: Record<string, number>,
  requiredScores: Partial<Record<string, number>>
): number {
  const keys = Object.keys(requiredScores);
  if (keys.length === 0) return 80; // Mặc định nếu không có yêu cầu cụ thể

  let totalDiff = 0;
  let totalWeight = 0;

  for (const key of keys) {
    const targetVal = requiredScores[key] ?? 50;
    const userVal = userScores[key] ?? 50;
    // Độ lệch chuẩn hóa
    const diff = Math.abs(userVal - targetVal);
    totalDiff += diff;
    totalWeight += 100;
  }

  const rawFit = Math.max(0, 100 - (totalDiff / totalWeight) * 100);
  return Math.round(rawFit);
}

/**
 * Tính Work Style Fit trên thang -100 đến +100
 */
export function calculateWorkStyleFit(
  userStyle: StudentCareerProfile["work_style"],
  careerStyle: Partial<StudentCareerProfile["work_style"]>
): number {
  const keys = Object.keys(careerStyle) as (keyof typeof userStyle)[];
  if (keys.length === 0) return 75;

  let totalDiff = 0;
  for (const k of keys) {
    const userVal = userStyle[k] ?? 0;
    const targetVal = careerStyle[k] ?? 0;
    // max diff trên dải [-100, 100] là 200
    const diff = Math.abs(userVal - targetVal);
    totalDiff += diff;
  }

  const avgDiff = totalDiff / keys.length;
  // Quy đổi về thang 0 - 100
  const fit = Math.max(0, 100 - (avgDiff / 200) * 100);
  return Math.round(fit);
}

/**
 * Tính Value Fit dựa trên 5 giá trị nghề nghiệp hàng đầu
 */
export function calculateValueFit(
  userRankedValues: CareerValue[],
  careerValues: Partial<Record<CareerValue, number>>
): number {
  if (userRankedValues.length === 0) return 70;

  let matchPoints = 0;
  const weights = [35, 25, 20, 12, 8];

  userRankedValues.forEach((val, idx) => {
    const careerImportance = careerValues[val] ?? 40;
    const w = weights[idx] ?? 10;
    matchPoints += (careerImportance / 100) * w;
  });

  return Math.min(100, Math.round(matchPoints));
}

/**
 * Tính Academic Fit dựa trên điểm các môn liên quan
 */
export function calculateAcademicFit(
  academic: StudentCareerProfile["academic_profile"],
  careerId: string
): number {
  const math = academic.math_score ?? 7;
  const lit = academic.literature_score ?? 7;
  const eng = academic.english_score ?? 7;

  let score = 70;
  if (careerId.includes("data") || careerId.includes("software") || careerId.includes("engineer")) {
    score = (math * 0.5 + eng * 0.3 + lit * 0.2) * 10;
  } else if (careerId.includes("law") || careerId.includes("marketer") || careerId.includes("designer")) {
    score = (lit * 0.4 + eng * 0.4 + math * 0.2) * 10;
  } else {
    score = (math * 0.35 + eng * 0.35 + lit * 0.3) * 10;
  }

  return Math.min(100, Math.max(30, Math.round(score)));
}

/**
 * Tính hình phạt Negative Preferences (Section 28)
 */
export function calculateNegativePenalties(
  career: CareerDNA,
  negativePrefs: NegativePreference[]
): { penaltyPoints: number; triggeredPenalties: string[] } {
  let penaltyPoints = 0;
  const triggeredPenalties: string[] = [];

  for (const pref of negativePrefs) {
    if (career.negative_conditions.includes(pref)) {
      penaltyPoints += 16;
      switch (pref) {
        case "avoid_math_heavy":
          triggeredPenalties.push("Bạn muốn tránh tính toán nặng (-16đ)");
          break;
        case "avoid_programming":
          triggeredPenalties.push("Bạn muốn tránh viết code chuyên sâu (-16đ)");
          break;
        case "avoid_sales":
          triggeredPenalties.push("Bạn muốn tránh công việc chèo kéo bán hàng (-16đ)");
          break;
        case "avoid_public_speaking":
          triggeredPenalties.push("Bạn muốn tránh nói trước đám đông liên tục (-16đ)");
          break;
        case "avoid_high_pressure":
          triggeredPenalties.push("Bạn ưu tiên tránh môi trường áp lực cao & OT triền miên (-16đ)");
          break;
        case "avoid_field_work":
          triggeredPenalties.push("Bạn muốn tránh công việc thực địa ngoài trời (-16đ)");
          break;
        case "avoid_people_intensive_work":
          triggeredPenalties.push("Bạn muốn tránh tương tác xã hội dày đặc cả ngày (-16đ)");
          break;
        default:
          triggeredPenalties.push(`Trúng tiêu chí không thích: ${pref} (-16đ)`);
      }
    }
  }

  // Giới hạn tổng phạt tối đa 35 điểm
  penaltyPoints = Math.min(35, penaltyPoints);
  return { penaltyPoints, triggeredPenalties };
}

/**
 * Sinh diễn giải chi tiết Explainability (Section 31 & 73)
 */
export function generateExplainability(
  career: CareerDNA,
  profile: StudentCareerProfile,
  fits: {
    interest_fit: number;
    capability_fit: number;
    work_style_fit: number;
    value_fit: number;
  },
  penalties: string[]
): MatchScoreReason {
  const positive_factors: string[] = [];
  const considerations: string[] = [];
  const what_to_verify: string[] = [];

  // 1. Phân tích điểm cộng
  if (fits.capability_fit >= 80) {
    const topCap = Object.entries(career.required_capabilities)
      .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0];
    positive_factors.push(
      `Năng lực cá nhân khớp mạnh với đòi hỏi cốt lõi của nghề (${topCap ? topCap[0] : "tư duy giải quyết vấn đề"}: ${fits.capability_fit}%)`
    );
  }
  if (fits.interest_fit >= 80) {
    positive_factors.push(`Hứng thú tự nhiên cao với lĩnh vực ${career.industry_name} (${fits.interest_fit}%)`);
  }
  if (fits.value_fit >= 75) {
    positive_factors.push("Thang giá trị nghề nghiệp (thu nhập, sự tự chủ hoặc học hỏi) đồng điệu cao với vị trí này");
  }

  // 2. Điểm cần cân nhắc
  if (penalties.length > 0) {
    considerations.push(...penalties);
  }
  if (fits.work_style_fit < 70) {
    considerations.push("Phong cách làm việc thực tế của bạn có thể cần điều chỉnh để thích nghi với nhịp độ vị trí này");
  }
  considerations.push(
    `Tác động AI: ${career.ai_impact.summary}`
  );

  // 3. Điều cần xác minh thêm
  what_to_verify.push(`Thực hiện 1 thử nghiệm nghề nghiệp ngắn (Career Experiment) trong 3 - 5 giờ.`);
  what_to_verify.push(`Trò chuyện với 1 chuyên gia đang làm vị trí ${career.name} để hiểu ngày làm việc thực tế.`);

  return {
    positive_factors,
    penalty_factors: penalties,
    considerations,
    what_to_verify
  };
}

/**
 * Tính điểm khớp toàn diện cho 1 Career (Section 25)
 */
export function calculateCareerMatch(
  career: CareerDNA,
  profile: StudentCareerProfile
): CareerMatchResult {
  const interest_fit = calculateVectorFit(profile.interests, career.required_interests);
  const capability_fit = calculateVectorFit(profile.capabilities, career.required_capabilities);
  const work_style_fit = calculateWorkStyleFit(profile.work_style, career.work_style);
  const value_fit = calculateValueFit(profile.ranked_values, career.career_values);
  const academic_fit = calculateAcademicFit(profile.academic_profile, career.id);

  // Future goal fit
  let future_goal_fit = 75;
  if (profile.future_aspirations.length > 0) {
    if (career.id.includes("engineer") && profile.future_aspirations.includes("technology_builder")) future_goal_fit = 95;
    if (career.id.includes("analyst") && profile.future_aspirations.includes("expert")) future_goal_fit = 95;
    if (career.id.includes("manager") && profile.future_aspirations.includes("manager")) future_goal_fit = 95;
  }

  const practical_fit = 80;

  // Công thức chuẩn Master Prompt:
  // 25% Interest + 20% Capability + 15% WorkStyle + 15% Value + 10% Academic + 10% FutureGoal + 5% Practical
  const weightedBase =
    interest_fit * 0.25 +
    capability_fit * 0.20 +
    work_style_fit * 0.15 +
    value_fit * 0.15 +
    academic_fit * 0.10 +
    future_goal_fit * 0.10 +
    practical_fit * 0.05;

  const { penaltyPoints, triggeredPenalties } = calculateNegativePenalties(
    career,
    profile.negative_preferences
  );

  const finalScore = Math.max(25, Math.min(100, Math.round(weightedBase - penaltyPoints)));

  let label: CareerMatchResult["label"] = "Nên khám phá thêm";
  if (finalScore >= 90) label = "Rất phù hợp";
  else if (finalScore >= 80) label = "Phù hợp cao";
  else if (finalScore >= 70) label = "Khá phù hợp";
  else if (finalScore >= 60) label = "Có tiềm năng";

  const reasons = generateExplainability(
    career,
    profile,
    { interest_fit, capability_fit, work_style_fit, value_fit },
    triggeredPenalties
  );

  return {
    career,
    score: finalScore,
    label,
    interest_fit,
    capability_fit,
    work_style_fit,
    value_fit,
    academic_fit,
    future_goal_fit,
    practical_fit,
    penalties: penaltyPoints,
    confidence: profile.profile_confidence,
    reasons
  };
}

/**
 * Tính điểm khớp cho Major
 */
export function calculateMajorMatch(
  major: MajorDNA,
  profile: StudentCareerProfile
): MajorMatchResult {
  const interest_fit = calculateVectorFit(profile.interests, major.interest_requirements);
  const ability_fit = calculateVectorFit(profile.capabilities, major.ability_requirements);

  const math = profile.academic_profile.math_score ?? 7;
  const eng = profile.academic_profile.english_score ?? 7;
  const lit = profile.academic_profile.literature_score ?? 7;

  let academic_fit = 75;
  if (major.academic_requirements.math_intensity === "Cao") {
    academic_fit = (math * 0.6 + eng * 0.4) * 10;
  } else {
    academic_fit = (lit * 0.4 + eng * 0.4 + math * 0.2) * 10;
  }
  academic_fit = Math.min(100, Math.max(30, Math.round(academic_fit)));

  const learning_style_fit = 80;

  let penalty = 0;
  const penalties: string[] = [];
  if (major.academic_requirements.math_intensity === "Cao" && profile.negative_preferences.includes("avoid_math_heavy")) {
    penalty += 18;
    penalties.push("Ngành đòi hỏi Toán chuyên sâu trong khi bạn muốn tránh môn Toán nặng (-18đ)");
  }

  const rawScore = interest_fit * 0.35 + ability_fit * 0.35 + academic_fit * 0.20 + learning_style_fit * 0.10;
  const finalScore = Math.max(25, Math.min(100, Math.round(rawScore - penalty)));

  let label: MajorMatchResult["label"] = "Nên khám phá thêm";
  if (finalScore >= 90) label = "Rất phù hợp";
  else if (finalScore >= 80) label = "Phù hợp cao";
  else if (finalScore >= 70) label = "Khá phù hợp";
  else if (finalScore >= 60) label = "Có tiềm năng";

  const positive_factors: string[] = [];
  if (ability_fit >= 80) positive_factors.push(`Năng lực học thuật phù hợp xuất sắc (${ability_fit}%)`);
  if (interest_fit >= 80) positive_factors.push(`Sở thích định hướng trùng khớp với giáo trình ngành (${interest_fit}%)`);

  return {
    major,
    score: finalScore,
    label,
    interest_fit,
    ability_fit,
    academic_fit,
    learning_style_fit,
    confidence: profile.profile_confidence,
    reasons: {
      positive_factors,
      penalty_factors: penalties,
      considerations: penalties,
      what_to_verify: ["Tra cứu điểm chuẩn các trường đào tạo ngành này gần đây", "Tìm hiểu khung chương trình môn học chi tiết năm 1 và năm 2"]
    }
  };
}

/**
 * Xếp hạng tất cả các nghề nghiệp cho người dùng
 */
export function rankCareers(profile: StudentCareerProfile): CareerMatchResult[] {
  return CAREERS_DATA.map((c) => calculateCareerMatch(c, profile)).sort((a, b) => b.score - a.score);
}

/**
 * Xếp hạng tất cả các ngành học cho người dùng
 */
export function rankMajors(profile: StudentCareerProfile): MajorMatchResult[] {
  return MAJORS_DATA.map((m) => calculateMajorMatch(m, profile)).sort((a, b) => b.score - a.score);
}

/**
 * Dò mâu thuẫn (Contradiction Engine - Section 48)
 */
export function detectProfileContradictions(profile: StudentCareerProfile): string[] {
  const contradictions: string[] = [];

  // Mâu thuẫn: Thích việc đội nhóm nhưng tránh giao tiếp dày đặc
  if (profile.work_style.independent_vs_team > 50 && profile.negative_preferences.includes("avoid_people_intensive_work")) {
    contradictions.push("Bạn có xu hướng muốn làm việc nhóm cao, nhưng đồng thời lại chọn né tránh môi trường nhiều tương tác xã hội.");
  }

  // Mâu thuẫn: Đam mê công nghệ/dữ liệu nhưng né tránh lập trình & toán
  if (
    (profile.interests.technology > 75 || profile.interests.data > 75) &&
    (profile.negative_preferences.includes("avoid_programming") && profile.negative_preferences.includes("avoid_math_heavy"))
  ) {
    contradictions.push("Bạn có hứng thú mạnh với Công nghệ/Dữ liệu nhưng lại loại trừ cả Lập trình lẫn Toán học. Hãy xem xét các vị trí như Product Manager, UI/UX hoặc Phân tích Nghiệp vụ (BA).");
  }

  // Mâu thuẫn: Mục tiêu lãnh đạo nhưng sợ nói trước đám đông
  if (
    profile.future_aspirations.includes("manager") &&
    profile.negative_preferences.includes("avoid_public_speaking")
  ) {
    contradictions.push("Bạn hướng tới vai trò quản lý điều hành nhưng ngại thuyết trình trước đám đông. Kỹ năng giao tiếp trước công chúng có thể rèn luyện từng bước.");
  }

  return contradictions;
}

/**
 * Dựng Archetype hình tượng nghề nghiệp cá nhân
 */
export function deriveCareerArchetype(profile: StudentCareerProfile): StudentCareerProfile["profile_archetype"] {
  const { interests, capabilities, work_style } = profile;

  if (interests.technology >= 70 && capabilities.analytical_thinking >= 75) {
    return {
      title: "Nhà Kiến tạo Giải pháp Dữ liệu & Công nghệ",
      tagline: "Biến các bài toán phức tạp thành hệ thống vận hành thông minh",
      description: "Bạn sở hữu sự hòa quyện giữa tư duy logic trừu tượng và óc phân tích dữ liệu thực tế. Bạn xuất sắc nhất khi được trao bài toán hóc búa để tự tay tìm quy luật và kiến trúc giải pháp.",
      core_strengths: ["Tư duy hệ thống logic", "Khả năng đào sâu dữ liệu", "Học hỏi công nghệ nhanh"],
      potential_blindspots: ["Đôi khi quá tập trung vào tính hoàn hảo kỹ thuật mà quên mất yếu tố cảm xúc con người"]
    };
  }

  if (interests.business >= 70 && capabilities.strategic_thinking >= 70) {
    return {
      title: "Nhà Chiến lược & Khởi sự Kinh doanh",
      tagline: "Nhìn thấu cơ hội thị trường và kết nối nguồn lực tăng trưởng",
      description: "Bạn nhạy bén trước các chuyển động kinh tế, hiểu cách tối ưu dòng tiền và tạo ra giá trị mới từ các nguồn lực sẵn có. Bạn có tố chất làm chủ và điều phối dự án lớn.",
      core_strengths: ["Nhạy cảm thương mại", "Đàm phán thuyết phục", "Tư duy kết quả thực tế"],
      potential_blindspots: ["Dễ thiếu kiên nhẫn với các quy trình giấy tờ thủ tục tỉ mỉ lặp lại"]
    };
  }

  if (interests.design >= 70 || interests.arts >= 70) {
    return {
      title: "Nhà Thiết kế Trải nghiệm & Thẩm mỹ Số",
      tagline: "Chạm đến cảm xúc con người qua từng chi tiết trực quan",
      description: "Thế giới của bạn được cảm thụ bằng màu sắc, cấu trúc không gian và trải nghiệm tinh tế. Bạn có biệt tài làm cho những điều khô khan trở nên sinh động và quyến rũ.",
      core_strengths: ["Cảm quan thẩm mỹ độc bản", "Đồng cảm sâu sắc với người dùng", "Khả năng trực quan hóa ý tưởng"],
      potential_blindspots: ["Có thể cảm thấy bí bách khi bị ép làm việc trong các quy trình kỷ luật quá khô cứng"]
    };
  }

  return {
    title: "Chuyên viên Khai phóng Tiềm năng Đa lĩnh vực",
    tagline: "Thích nghi linh hoạt và kết nối những mảnh ghép khác biệt",
    description: "Bạn sở hữu bộ năng lực đa diện cân bằng, dễ dàng hòa nhập vào nhiều môi trường khác nhau và đóng vai trò cầu nối ăn ý trong mọi tập thể.",
    core_strengths: ["Khả năng thích ứng cao", "Lắng nghe và thấu hiểu", "Học hỏi đa ngành"],
    potential_blindspots: ["Cần sớm chọn ra một mũi nhọn chuyên sâu để tạo lợi thế cạnh tranh vượt trội"]
  };
}
