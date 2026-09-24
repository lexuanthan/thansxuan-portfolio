import { StudentCareerProfile } from "./types";
import { deriveCareerArchetype, detectProfileContradictions } from "./matchingEngine";

export function createDefaultProfile(): StudentCareerProfile {
  const profile: StudentCareerProfile = {
    profile_id: "demo_profile_2026",
    user_context: {
      user_type: "high_school",
      education_level: "thpt_11",
      grade_level: "Lớp 11",
      location: "TP. Hồ Chí Minh",
      career_awareness: "co_vai_nganh",
      decision_stage: "kham_pha",
      target_province: "TP. Hồ Chí Minh",
      expected_exam_score: 26.5,
      tuition_budget_max_million: 35
    },
    academic_profile: {
      math_score: 8.5,
      physics_score: 8.0,
      chemistry_score: 7.5,
      biology_score: 6.5,
      literature_score: 7.0,
      english_score: 8.5,
      informatics_score: 9.0,
      academic_trend: "tang_dan"
    },
    interests: {
      technology: 90,
      data: 85,
      engineering: 70,
      business: 65,
      design: 60,
      science: 75,
      finance: 60,
      arts: 45,
      communication: 55,
      education: 50,
      healthcare: 40,
      law: 45,
      social_impact: 60,
      nature: 50,
      entrepreneurship: 70
    },
    capabilities: {
      logical_thinking: 90,
      analytical_thinking: 92,
      problem_solving: 88,
      learning_agility: 85,
      independent_work: 82,
      creativity: 75,
      digital_literacy: 88,
      attention_to_detail: 80,
      strategic_thinking: 75,
      teamwork: 70,
      communication: 68,
      leadership: 65,
      organization: 72,
      adaptability: 78
    },
    work_style: {
      independent_vs_team: -10,
      stable_vs_dynamic: 30,
      structured_vs_flexible: -10,
      deep_work_vs_multitask: -50,
      people_vs_system: -60,
      theory_vs_practice: 50,
      detail_vs_big_picture: 40
    },
    ranked_values: [
      "income",
      "continuous_learning",
      "innovation",
      "autonomy",
      "job_security"
    ],
    career_values_weight: {
      income: 100,
      continuous_learning: 85,
      innovation: 70,
      autonomy: 55,
      job_security: 40,
      social_impact: 30,
      creativity: 30,
      prestige: 25,
      leadership: 20,
      work_life_balance: 20,
      international_opportunity: 20,
      entrepreneurship: 20
    },
    negative_preferences: ["avoid_sales", "avoid_repetitive_work"],
    future_aspirations: ["technology_builder", "expert", "entrepreneur"],
    profile_confidence: 0.88,
    profile_archetype: {
      title: "Nhà Kiến tạo Giải pháp Dữ liệu & Công nghệ",
      tagline: "Biến các bài toán phức tạp thành hệ thống vận hành thông minh",
      description: "Bạn sở hữu sự hòa quyện giữa tư duy logic trừu tượng và óc phân tích dữ liệu thực tế. Bạn xuất sắc nhất khi được trao bài toán hóc búa để tự tay tìm quy luật và kiến trúc giải pháp.",
      core_strengths: [
        "Tư duy phân tích số liệu nhạy bén",
        "Khả năng tập trung sâu và giải quyết lỗi kiên trì",
        "Tự học công nghệ và ứng dụng công cụ mới nhanh chóng"
      ],
      potential_blindspots: [
        "Đôi khi quá tập trung vào kỹ thuật mà quên diễn giải bằng ngôn ngữ kinh doanh đơn giản"
      ]
    },
    contradictions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  profile.profile_archetype = deriveCareerArchetype(profile);
  profile.contradictions = detectProfileContradictions(profile);
  return profile;
}
