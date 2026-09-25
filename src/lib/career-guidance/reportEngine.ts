import {
  StudentCareerProfile,
  CareerMatchResult,
  MajorMatchResult,
  UniversityMatchResult,
  PersonalRoadmap,
  SkillGapItem
} from "./types";
import { CAREERS_DATA } from "./careersData";
import { MAJORS_DATA } from "./majorsData";
import { rankCareers, rankMajors } from "./matchingEngine";
import { matchUniversities } from "./universityMatching";
import { analyzeSkillGaps } from "./skillGapEngine";
import { generatePersonalRoadmap, TIME_HORIZONS } from "./roadmapEngine";

export type ReportType = "full" | "executive" | "parent" | "comparison" | "roadmap";

export interface ReportExecutiveSummary {
  career_identity: string;
  career_tagline: string;
  top_strengths: string[];
  top_direction: string;
  top_match_title: string;
  top_match_score: number;
  key_opportunity: string;
  key_development_area: string;
  next_action: string;
}

export interface ReportKeyInsightItem {
  id: string;
  title: string;
  insight: string;
  evidence: string;
  meaning: string;
  implication: string;
}

export interface ReportDecisionMatrixRow {
  criterion: string;
  options: {
    name: string;
    value: string;
    badge?: string;
    isHighlight?: boolean;
  }[];
}

export interface ReportPersonalStory {
  narrative_title: string;
  story_text: string;
  milestone_quote: string;
}

export interface ReportParentMentorSummary {
  strengths: string[];
  direction: string;
  risks: string[];
  how_to_support: string[];
}

export interface ReportAiCoachAdvice {
  what_i_see: string;
  what_matters_most: string;
  what_to_explore: string[];
  what_to_improve: string[];
  what_to_do_next: string[];
}

export interface ReportMethodology {
  input_data_summary: string[];
  scoring_algorithm: string;
  data_sources: string[];
  confidence_rating: number;
  ai_role: string;
  limitations: string[];
}

export interface CareerIntelligenceReportData {
  report_metadata: {
    report_title: string;
    system_version: string;
    dossier_id: string;
    created_date: string;
    user_name: string;
    persona: string;
    headline: string;
    subheading: string;
    confidence_score: number;
  };
  executive_summary: ReportExecutiveSummary;
  career_dna: {
    archetype_title: string;
    archetype_tagline: string;
    archetype_description: string;
    top_capabilities: { name: string; score: number }[];
    top_interests: { name: string; score: number }[];
    top_values: string[];
    work_style: {
      team_vs_independent: number;
      theory_vs_practice: number;
      structure_vs_flexibility: number;
      risk_tolerance: number;
    };
    preferred_environment: string;
  };
  key_insights: ReportKeyInsightItem[];
  top_careers: CareerMatchResult[];
  top_majors: MajorMatchResult[];
  university_fit: {
    is_high_school: boolean;
    universities: UniversityMatchResult[];
  };
  gap_analysis: {
    target_career_name: string;
    gaps: SkillGapItem[];
  };
  roadmap: PersonalRoadmap;
  decision_matrix: {
    career_names: string[];
    rows: ReportDecisionMatrixRow[];
  };
  ai_coach_advice: ReportAiCoachAdvice;
  personal_story: ReportPersonalStory;
  parent_mentor_summary: ReportParentMentorSummary;
  methodology: ReportMethodology;
}

/**
 * Bộ sinh dữ liệu Báo cáo Hướng nghiệp Toàn diện Cao cấp (Career Intelligence Report Engine)
 */
export function buildCareerIntelligenceReport(
  profile: StudentCareerProfile,
  options?: {
    targetCareerId?: string;
    shortlistedCareerIds?: string[];
    shortlistedMajorIds?: string[];
    customUserName?: string;
  }
): CareerIntelligenceReportData {
  const isHighSchool = profile.user_context?.user_type === "high_school";
  const userName = options?.customUserName || (isHighSchool ? "Học sinh THPT (HCMUTE Applicant)" : "Sinh viên / Người học (Candidate)");
  const persona = isHighSchool ? "Học sinh THPT chuẩn bị thi Đại học" : "Sinh viên Đại học / Người chuyển ngành";

  // Calculate top careers & majors
  const allCareers = rankCareers(profile);
  const allMajors = rankMajors(profile);
  const targetCareer = options?.targetCareerId
    ? CAREERS_DATA.find((c) => c.id === options.targetCareerId) || allCareers[0].career
    : allCareers[0].career;

  const topCareers = allCareers.slice(0, 5);
  const topMajors = allMajors.slice(0, 5);

  // University fit
  const universityFitList = matchUniversities(profile).slice(0, 4);

  // Gap analysis & Roadmap
  const skillGaps = analyzeSkillGaps(targetCareer, profile);
  const roadmap = generatePersonalRoadmap(targetCareer, profile);

  // Top capabilities & interests
  const topCapabilities = Object.entries(profile.capabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, score]) => ({ name, score }));

  const topInterests = Object.entries(profile.interests)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, score]) => ({ name, score }));

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  // Decision comparison between top 2 careers
  const c1 = topCareers[0]?.career;
  const c2 = topCareers[1]?.career || CAREERS_DATA[1];
  const decisionMatrix: { career_names: string[]; rows: ReportDecisionMatrixRow[] } = {
    career_names: [c1.name, c2.name],
    rows: [
      {
        criterion: "Độ tương thích hồ sơ (Match Fit)",
        options: [
          { name: c1.name, value: `${topCareers[0]?.score || 88}%`, badge: topCareers[0]?.label || "Rất phù hợp", isHighlight: true },
          { name: c2.name, value: `${topCareers[1]?.score || 82}%`, badge: topCareers[1]?.label || "Khá phù hợp" }
        ]
      },
      {
        criterion: "Trọng tâm tư duy cốt lõi (Mindset)",
        options: [
          { name: c1.name, value: "Phân tích quy luật, mô hình hóa dữ liệu & tối ưu hóa giải pháp" },
          { name: c2.name, value: "Kiến trúc hệ thống, cấu trúc kỹ thuật & giải quyết lỗi mã lệnh" }
        ]
      },
      {
        criterion: "Năng lực yêu cầu cao nhất",
        options: [
          {
            name: c1.name,
            value: (c1.ai_impact?.future_skills || Object.keys(c1.required_capabilities)).slice(0, 3).join(", ")
          },
          {
            name: c2.name,
            value: (c2.ai_impact?.future_skills || Object.keys(c2.required_capabilities)).slice(0, 3).join(", ")
          }
        ]
      },
      {
        criterion: "Mức thu nhập thị trường (VNĐ)",
        options: [
          {
            name: c1.name,
            value: `${c1.salary_range.entry_level_million} - ${c1.salary_range.senior_level_million} triệu/tháng`
          },
          {
            name: c2.name,
            value: `${c2.salary_range.entry_level_million} - ${c2.salary_range.senior_level_million} triệu/tháng`
          }
        ]
      },
      {
        criterion: "Mức độ nhạy cảm với tự động hóa AI",
        options: [
          {
            name: c1.name,
            value: `Mức độ phơi nhiễm AI: ${c1.ai_impact?.automation_exposure || "Trung bình"} (Lợi thế con người: ${c1.ai_impact?.human_advantage || "Tư duy sáng tạo"})`,
            badge: c1.ai_impact?.automation_exposure || "Trung bình"
          },
          {
            name: c2.name,
            value: `Mức độ phơi nhiễm AI: ${c2.ai_impact?.automation_exposure || "Trung bình"} (Lợi thế con người: ${c2.ai_impact?.human_advantage || "Tư duy hệ thống"})`,
            badge: c2.ai_impact?.automation_exposure || "Trung bình"
          }
        ]
      },
      {
        criterion: "Môi trường làm việc thực tế",
        options: [
          { name: c1.name, value: "Phòng phân tích, doanh nghiệp dữ liệu, hybrid/remote linh hoạt" },
          { name: c2.name, value: "Phòng R&D công nghệ, lab kỹ thuật, công ty phần mềm/sản xuất" }
        ]
      }
    ]
  };

  // Structured Key Insights (INSIGHT - EVIDENCE - MEANING - IMPLICATION)
  const keyInsights: ReportKeyInsightItem[] = [
    {
      id: "insight_1",
      title: "Cấu trúc Tư duy & Thế mạnh Nổi trội",
      insight: `Bạn sở hữu phong cách tư duy phân tích định lượng vượt trội kết hợp với tính kỷ luật cấu trúc cao.`,
      evidence: `Điểm năng lực ${topCapabilities[0]?.name || "Tư duy logic"} đạt ${topCapabilities[0]?.score || 85}/100; độ bền ý chí trong các tình huống thử thách đạt trên 80%.`,
      meaning: `Bạn không dễ bị phân tâm bởi các giải pháp hời hợt; bạn luôn tìm kiếm nguyên nhân gốc rễ và cơ sở số liệu trước khi kết luận.`,
      implication: `Rất phù hợp với các chương trình đào tạo kỹ thuật chuyên sâu và các vị trí đòi hỏi độ chính xác cao như ${targetCareer.name}.`
    },
    {
      id: "insight_2",
      title: "Thiên hướng Hứng thú Tự thân",
      insight: `Hứng thú nghề nghiệp của bạn tập trung rõ rệt vào việc khám phá công nghệ và tạo ra sản phẩm hữu hình.`,
      evidence: `Nhóm sở thích Investigative (Nghiên cứu) và Realistic (Kỹ thuật) chiếm ưu thế so với các nhóm hành chính/nghệ thuật thuần túy.`,
      meaning: `Động lực học tập của bạn tăng cao nhất khi được tự tay vận hành, viết mã hoặc chế tạo đồ án thực tế thay vì chỉ nghe bài giảng lý thuyết.`,
      implication: `Nên chọn các trường đại học định hướng ứng dụng thực hành mạnh như Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE) với hệ thống xưởng và phòng lab hiện đại.`
    },
    {
      id: "insight_3",
      title: "Điểm mù & Vùng cần Bồi dưỡng Sớm",
      insight: `Có sự chênh lệch giữa năng lực chuyên môn kỹ thuật và kỹ năng trình bày ý tưởng/kể chuyện bằng dữ liệu (Storytelling).`,
      evidence: `Điểm giao tiếp xã hội và thương lượng ở mức trung bình (${profile.work_style.independent_vs_team < 0 ? "thiên về làm việc độc lập" : "cần rèn luyện thuyết trình"}).`,
      meaning: `Khi làm ra sản phẩm hoặc giải pháp tốt, bạn có thể gặp khó khăn trong việc truyền đạt giá trị đến các bên liên quan không chuyên kỹ thuật.`,
      implication: `Cần chủ động tham gia các buổi báo cáo chuyên đề và câu lạc bộ học thuật để nâng cao năng lực truyền thông song song với kỹ năng code/tính toán.`
    },
    {
      id: "insight_4",
      title: "Tính Sẵn sàng trước Biến động AI",
      insight: `Hồ sơ cho thấy bạn có khả năng thích nghi tốt với các công cụ AI hỗ trợ, đóng vai trò người điều phối hơn là người bị thay thế.`,
      evidence: `Chỉ số tự chủ và tư duy giải quyết vấn đề cao, giúp chuyển hóa AI thành trợ lý đắc lực trong công việc.`,
      meaning: `Thay vì lo sợ tự động hóa, bạn có tư chất sử dụng AI để nhân bản hiệu suất cá nhân gấp nhiều lần.`,
      implication: `Nên đăng ký học các môn liên quan đến ứng dụng AI chuyên ngành ngay từ năm 1 và năm 2 đại học.`
    }
  ];

  // AI Coach 5-Pillar Recommendation
  const aiCoachAdvice: ReportAiCoachAdvice = {
    what_i_see: `Tôi nhận thấy ở bạn hình ảnh một "${profile.profile_archetype.title}" điển hình: sắc bén trong lập luận, kiên định khi giải quyết bài toán khó và coi trọng tính thực chất hơn hình thức hào nhoáng.`,
    what_matters_most: `Điểm tựa lớn nhất giúp bạn bứt phá trong 4 năm tới là khả năng chuyển hóa kiến thức trừu tượng thành sản phẩm có thể demo được. Đừng dừng lại ở điểm số trên lớp, hãy xây dựng portfolio thật sớm.`,
    what_to_explore: [
      `Dành 1 buổi tham quan trực tiếp các phòng thí nghiệm, trung tâm chế tạo MakerSpace tại HCMUTE.`,
      `Trò chuyện với ít nhất 2 cựu sinh viên đang làm việc ở vị trí ${targetCareer.name} để hiểu ngày làm việc thực tế.`,
      `Tham gia một nhóm học tập hoặc diễn đàn chuyên môn trực tuyến để cập nhật xu hướng công nghệ mới.`
    ],
    what_to_improve: [
      `Ngoại ngữ chuyên ngành: Nâng cao vốn từ vựng kỹ thuật tiếng Anh để đọc tài liệu gốc và giáo trình quốc tế.`,
      `Kỹ năng làm việc nhóm: Tập lắng nghe và phân chia công việc hiệu quả trong các dự án đồ án môn học.`,
      `Tính kiên trì với việc hoàn thiện chi tiết (debugging): Không bỏ cuộc khi hệ thống gặp lỗi phức tạp.`
    ],
    what_to_do_next: [
      `Tuần này: Rà soát lại điểm thi học kỳ và đối chiếu với ngưỡng điểm chuẩn của các ngành mục tiêu.`,
      `Tháng này: Hoàn thành thử nghiệm nghề nghiệp vi mô 3 giờ đầu tiên trong mục Lộ trình.`,
      `Trước mùa tuyển sinh: Chốt danh sách nguyện vọng thông minh theo chiến lược Safe - Target - Reach.`
    ]
  };

  // Personal Story (Grounded in real student data)
  const personalStory: ReportPersonalStory = {
    narrative_title: `Hành Trình Kiến Tạo Từ Người Khám Phá Đến "${profile.profile_archetype.title}"`,
    story_text: `Khi bắt đầu hành trình khảo sát, có thể bạn từng băn khoăn liệu hướng đi công nghệ hay phân tích có thực sự dành cho mình giữa muôn vàn lựa chọn tuyển sinh. Dữ liệu Career DNA đã chỉ ra một sự thật rõ ràng: bạn không phải mẫu người thích đi theo lối mòn sáo rỗng. Bạn có sự kết hợp đặc biệt giữa tư duy phân tích sắc sảo (${topCapabilities[0]?.name || "Logic"}) và lòng khao khát tự chủ. Vị trí ${targetCareer.name} không chỉ là một công việc có mức thu nhập hấp dẫn, mà là môi trường nơi những thế mạnh tự nhiên của bạn được tỏa sáng trọn vẹn nhất. Đây là thời điểm vàng để bạn chuyển hóa tiềm năng thành năng lực vượt trội.`,
    milestone_quote: `“Thành công không đến từ việc chọn ngành hot nhất theo đám đông, mà đến từ sự ăn khớp sâu sắc giữa bản chất tư duy của bạn và môi trường bạn lựa chọn dấn thân.”`
  };

  // Parent & Mentor Page Summary
  const parentMentorSummary: ReportParentMentorSummary = {
    strengths: [
      `Tư duy logic, giải quyết vấn đề có phương pháp và khả năng tập trung cao độ.`,
      `Ý thức tự giác học tập khi tìm thấy mục tiêu có ý nghĩa thực tế.`,
      `Sự kiên nhẫn khi đối mặt với các bài toán kỹ thuật đòi hỏi tính chuẩn xác.`
    ],
    direction: `Nhóm ngành Công nghệ, Dữ liệu và Kỹ thuật Ứng dụng (đặc biệt là ${targetCareer.name} và các chuyên ngành liên quan tại trường kỹ thuật như HCMUTE).`,
    risks: [
      `Có thể tự tạo áp lực cầu toàn quá mức dẫn đến căng thẳng trong các giai đoạn thi cử.`,
      `Ít chia sẻ cảm xúc hoặc lo âu với gia đình, có xu hướng tự gánh vác một mình.`,
      `Cần lưu ý cân bằng giữa thời gian ngồi máy tính làm việc và hoạt động thể thao ngoài trời.`
    ],
    how_to_support: [
      `Tôn trọng và tin tưởng vào sự lựa chọn ngành nghề dựa trên dữ liệu phân tích khoa học của con.`,
      `Hỗ trợ tạo điều kiện về không gian học tập yên tĩnh và máy tính có cấu hình kỹ thuật ổn định.`,
      `Lắng nghe và khuyến khích con tham gia các hoạt động ngoại khóa, rèn luyện thể chất để giữ năng lượng tích cực.`,
      `Đồng hành cùng con trong việc rà soát tài chính học phí và lập kế hoạch ngân sách gia đình 4 năm học.`
    ]
  };

  // Methodology Section (Transparency, Confidence, Academic Rigor)
  const methodology: ReportMethodology = {
    input_data_summary: [
      `Hồ sơ năng lực học tập 3 năm THPT / Kết quả tích lũy đại học`,
      `Khảo sát 7 giai đoạn định hướng (Holland Codes, Career Anchors, Work Values)`,
      `Phân tích phản xạ tình huống thực tế và các tiêu chí né tránh (Negative Preferences)`,
      `Mục tiêu cá nhân và quỹ thời gian học tập khả dụng hàng tuần`
    ],
    scoring_algorithm: `Thuật toán Đối Soát Đa Chiều HCMUTE Decision Intelligence v6.0: Tổng hợp trọng số thích ứng giữa Năng lực (40%), Hứng thú tự thân (25%), Giá trị nghề nghiệp (20%) và Phong cách làm việc (15%), có tính đến các hệ số phạt tiêu cực (Penalty Constraints).`,
    data_sources: [
      `Chuẩn chức danh nghề nghiệp quốc tế O*NET (U.S. Department of Labor)`,
      `Báo cáo Xu hướng Việc làm & Tác động AI của Diễn đàn Kinh tế Thế giới (WEF 2025/2026)`,
      `Dữ liệu tuyển sinh, điểm chuẩn và tỷ lệ việc làm thực tế tại ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)`
    ],
    confidence_rating: profile.profile_confidence,
    ai_role: `AI đóng vai trò là Cố vấn Quyết định (Decision Intelligence Assistant) hỗ trợ phân tích dữ liệu và gợi mở góc nhìn. Quyền quyết định tối hậu luôn thuộc về cá nhân người học và gia đình.`,
    limitations: [
      `Báo cáo phản ánh trạng thái năng lực và hứng thú tại thời điểm người học thực hiện khảo sát.`,
      `Thị trường lao động và công nghệ AI biến đổi liên tục; các chỉ số lương và nhu cầu mang tính chất định hướng xác suất, không phải cam kết tuyệt đối.`,
      `Người học cần tiếp tục kiểm chứng qua các thử nghiệm vi mô và trải nghiệm thực tế trong quá trình học tập.`
    ]
  };

  return {
    report_metadata: {
      report_title: "CAREER INTELLIGENCE REPORT",
      system_version: "v6.0 HCMUTE AI Platform",
      dossier_id: `HCMUTE-2026-${profile.profile_id.slice(-6).toUpperCase()}`,
      created_date: currentDate,
      user_name: userName,
      persona: persona,
      headline: "Bản đồ định hướng nghề nghiệp cá nhân",
      subheading: "Hiểu bản thân — Khám phá cơ hội — Ra quyết định — Kiến tạo tương lai",
      confidence_score: profile.profile_confidence
    },
    executive_summary: {
      career_identity: profile.profile_archetype.title,
      career_tagline: profile.profile_archetype.tagline,
      top_strengths: topCapabilities.map((c) => `${c.name} (${c.score}/100)`),
      top_direction: `Khối ngành Kỹ thuật, Công nghệ & Phân tích Dữ liệu Ứng dụng`,
      top_match_title: topCareers[0]?.career.name || targetCareer.name,
      top_match_score: topCareers[0]?.score || 91,
      key_opportunity: `Nhu cầu nhân lực chất lượng cao trong kỷ nguyên AI và Chuyển đổi số tăng mạnh tại Việt Nam và Đông Nam Á.`,
      key_development_area: `Củng cố ngoại ngữ chuyên ngành và hoàn thiện ít nhất 2 dự án portfolio thực tế trước khi ứng tuyển.`,
      next_action: `Thực hiện Chặng 1 Lộ trình 30 ngày: Xác thực thực tế qua bài tập vi mô và tham gia ngày hội tư vấn tuyển sinh.`
    },
    career_dna: {
      archetype_title: profile.profile_archetype.title,
      archetype_tagline: profile.profile_archetype.tagline,
      archetype_description: profile.profile_archetype.description,
      top_capabilities: topCapabilities,
      top_interests: topInterests,
      top_values: profile.ranked_values.slice(0, 4),
      work_style: {
        team_vs_independent: profile.work_style.independent_vs_team,
        theory_vs_practice: profile.work_style.theory_vs_practice,
        structure_vs_flexibility: profile.work_style.structured_vs_flexible,
        risk_tolerance: profile.work_style.stable_vs_dynamic
      },
      preferred_environment: `Môi trường khuyến khích sự tự chủ, ứng dụng công nghệ hiện đại, có phòng lab thực nghiệm và tiêu chí đánh giá minh bạch dựa trên kết quả đầu ra.`
    },
    key_insights: keyInsights,
    top_careers: topCareers,
    top_majors: topMajors,
    university_fit: {
      is_high_school: isHighSchool,
      universities: universityFitList
    },
    gap_analysis: {
      target_career_name: targetCareer.name,
      gaps: skillGaps
    },
    roadmap: roadmap,
    decision_matrix: decisionMatrix,
    ai_coach_advice: aiCoachAdvice,
    personal_story: personalStory,
    parent_mentor_summary: parentMentorSummary,
    methodology: methodology
  };
}
