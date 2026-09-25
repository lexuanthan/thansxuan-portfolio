/**
 * Core Data Models & Types for AI Career Guidance Platform
 * Master Prompt v3.0 Specification
 */

export type UserType = "high_school" | "university_student" | "graduate" | "career_changer";

export type EducationLevel = "thpt_10" | "thpt_11" | "thpt_12" | "dai_hoc_1_2" | "dai_hoc_3_4" | "da_tot_nghiep" | "dang_di_lam";

export interface UserContext {
  user_type: UserType;
  education_level: EducationLevel;
  grade_level?: string;
  location?: string;
  career_awareness?: "chua_biet_gi" | "co_vai_nganh" | "da_co_muc_tieu" | "dang_phan_van";
  decision_stage?: "kham_pha" | "danh_gia" | "chot_nganh" | "chot_truong" | "chuan_bi_ho_so";
  target_province?: string;
  expected_exam_score?: number;
  tuition_budget_max_million?: number;
  financial_buffer_months?: number; // Cho người chuyển nghề
  weekly_learning_hours?: number;
}

export interface AcademicProfile {
  math_score: number;        // 0 - 10
  physics_score?: number;
  chemistry_score?: number;
  biology_score?: number;
  literature_score: number;
  english_score: number;
  informatics_score?: number;
  social_sciences_score?: number;
  academic_trend?: "tang_dan" | "on_dinh" | "giam_dan";
}

export type InterestDimension =
  | "technology"
  | "engineering"
  | "science"
  | "business"
  | "finance"
  | "data"
  | "design"
  | "arts"
  | "communication"
  | "education"
  | "healthcare"
  | "law"
  | "social_impact"
  | "nature"
  | "entrepreneurship";

export type CapabilityDimension =
  | "logical_thinking"
  | "analytical_thinking"
  | "problem_solving"
  | "creativity"
  | "communication"
  | "leadership"
  | "teamwork"
  | "organization"
  | "independent_work"
  | "adaptability"
  | "learning_agility"
  | "attention_to_detail"
  | "strategic_thinking"
  | "digital_literacy";

export interface WorkStyle {
  independent_vs_team: number;       // -100 (độc lập) -> +100 (đội nhóm)
  stable_vs_dynamic: number;         // -100 (ổn định) -> +100 (thay đổi/linh hoạt)
  structured_vs_flexible: number;    // -100 (quy trình chặt) -> +100 (tự do sáng tạo)
  deep_work_vs_multitask: number;    // -100 (chuyên sâu 1 việc) -> +100 (đa nhiệm)
  people_vs_system: number;          // -100 (làm việc với máy/hệ thống) -> +100 (tương tác người)
  theory_vs_practice: number;        // -100 (lý thuyết/nghiên cứu) -> +100 (thực hành ứng dụng)
  detail_vs_big_picture: number;     // -100 (chi tiết vi mô) -> +100 (chiến lược vĩ mô)
}

export type CareerValue =
  | "income"
  | "job_security"
  | "social_impact"
  | "creativity"
  | "autonomy"
  | "prestige"
  | "leadership"
  | "work_life_balance"
  | "international_opportunity"
  | "continuous_learning"
  | "innovation"
  | "entrepreneurship";

export type NegativePreference =
  | "avoid_sales"
  | "avoid_public_speaking"
  | "avoid_repetitive_work"
  | "avoid_high_pressure"
  | "avoid_math_heavy"
  | "avoid_programming"
  | "avoid_field_work"
  | "avoid_shift_work"
  | "avoid_frequent_travel"
  | "avoid_people_intensive_work";

export type FutureAspiration =
  | "expert"
  | "manager"
  | "entrepreneur"
  | "researcher"
  | "creator"
  | "technology_builder"
  | "consultant"
  | "community_leader"
  | "international_career";

export interface StudentCareerProfile {
  profile_id: string;
  user_context: UserContext;
  academic_profile: AcademicProfile;
  interests: Record<InterestDimension, number>; // 0 - 100
  capabilities: Record<CapabilityDimension, number>; // 0 - 100
  work_style: WorkStyle;
  ranked_values: CareerValue[]; // Top 5
  career_values_weight: Record<CareerValue, number>;
  negative_preferences: NegativePreference[];
  future_aspirations: FutureAspiration[];
  profile_confidence: number; // 0.0 - 1.0
  profile_archetype: {
    title: string;
    tagline: string;
    description: string;
    core_strengths: string[];
    potential_blindspots: string[];
  };
  contradictions: string[];
  created_at: string;
  updated_at: string;
}

export interface CareerDNA {
  id: string;
  name: string;
  slug: string;
  industry_id: string;
  industry_name: string;
  tagline: string;
  description: string;
  daily_tasks: string[];
  required_interests: Partial<Record<InterestDimension, number>>;
  required_capabilities: Partial<Record<CapabilityDimension, number>>;
  work_style: Partial<WorkStyle>;
  career_values: Partial<Record<CareerValue, number>>;
  negative_conditions: NegativePreference[];
  salary_range: {
    entry_level_million: number;
    mid_level_million: number;
    senior_level_million: number;
  };
  career_progression: string[];
  ai_impact: {
    automation_exposure: "Thấp" | "Trung bình" | "Cao";
    ai_augmentation_level: "Rất cao" | "Cao" | "Trung bình" | "Thấp";
    human_advantage: string;
    future_skills: string[];
    summary: string;
  };
  related_major_ids: string[];
  related_career_ids: string[];
  tags: string[];
}

export interface MajorDNA {
  id: string;
  code: string;
  name: string;
  slug: string;
  industry_id: string;
  industry_name: string;
  description: string;
  learning_content: string[];
  suitability_traits: string[];
  interest_requirements: Partial<Record<InterestDimension, number>>;
  ability_requirements: Partial<Record<CapabilityDimension, number>>;
  academic_requirements: {
    required_subjects: string[];
    math_intensity: "Cao" | "Trung bình" | "Thấp";
    english_intensity: "Cao" | "Trung bình" | "Thấp";
    avg_cutoff_score: number;
  };
  learning_style: {
    theory_vs_practice: number; // -100 to 100
    group_work_intensity: "Cao" | "Trung bình" | "Thấp";
  };
  difficulty_level: "Rất cao" | "Cao" | "Vừa phải" | "Dễ tiếp cận";
  ai_impact: string;
  career_paths: string[];
  top_universities: {
    id: string;
    name: string;
    cutoff: number;
  }[];
}

export interface IndustryDNA {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  tagline: string;
  description: string;
  traits: string[];
  typical_roles: string[];
  emerging_trends: string[];
  ai_impact_overview: string;
}

export interface MatchScoreReason {
  positive_factors: string[];
  penalty_factors: string[];
  considerations: string[];
  what_to_verify: string[];
}

export interface CareerMatchResult {
  career: CareerDNA;
  score: number; // 0 - 100
  label: "Rất phù hợp" | "Phù hợp cao" | "Khá phù hợp" | "Có tiềm năng" | "Nên khám phá thêm";
  interest_fit: number;
  capability_fit: number;
  work_style_fit: number;
  value_fit: number;
  academic_fit: number;
  future_goal_fit: number;
  practical_fit: number;
  penalties: number;
  confidence: number;
  reasons: MatchScoreReason;
}

export interface MajorMatchResult {
  major: MajorDNA;
  score: number;
  label: "Rất phù hợp" | "Phù hợp cao" | "Khá phù hợp" | "Có tiềm năng" | "Nên khám phá thêm";
  interest_fit: number;
  ability_fit: number;
  academic_fit: number;
  learning_style_fit: number;
  confidence: number;
  reasons: MatchScoreReason;
}

export interface UniversityFitBreakdown {
  overall_fit: number; // 0 - 100
  academic_fit: number; // 0 - 100
  admission_fit: number; // 0 - 100
  financial_fit: number; // 0 - 100
  location_fit: number; // 0 - 100
  career_fit: number; // 0 - 100
  environment_fit: number; // 0 - 100
}

export interface UniversityMatchResult {
  university_id: string;
  university_name: string;
  short_name: string;
  city: string;
  region: "BAC" | "TRUNG" | "NAM";
  type: "Công lập" | "Tư thục" | "Quốc tế";
  tuition_million_year: number;
  logo_url?: string;
  matching_majors: {
    major_name: string;
    cutoff_score: number;
    feasibility: "Safe" | "Target" | "Reach" | "Unknown";
    diff_score: number;
  }[];
  overall_feasibility: "Safe" | "Target" | "Reach";
  match_score: number;
  strengths: string[];
  fit_breakdown?: UniversityFitBreakdown;
  scholarship_info?: string;
  admission_methods?: string[];
  campus_environment?: string;
  curriculum_highlight?: string;
  career_opportunities?: string;
  average_cutoff?: number;
}

export type GapCategory =
  | "knowledge"
  | "skills"
  | "experience"
  | "portfolio"
  | "certification"
  | "language"
  | "academic";

export interface SkillGapItem {
  skill_name: string;
  dimension: CapabilityDimension | "technical";
  current_level: number; // 0 - 100
  target_level: number;  // 0 - 100
  gap: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  actionable_recommendation: string;
  category?: GapCategory;
  current_text?: string;
  target_text?: string;
  effort?: string;
  evidence?: string;
}

export interface CareerExperiment {
  id: string;
  title: string;
  time_commitment: string;
  objective: string;
  steps: string[];
  success_criteria: string;
}

export type TaskStatus = "completed" | "in_progress" | "pending" | "locked";

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  category: "learn" | "practice" | "project" | "certificate" | "experience" | "network";
  estimated_effort: string;
  completed: boolean;
  duration?: string;
  status?: TaskStatus;
  dependency?: string;
  outcome?: string;
}

export type ProgressionStageId =
  | "discover"
  | "learn"
  | "build"
  | "practice"
  | "experience"
  | "validate"
  | "apply";

export type TimeHorizon = "30_days" | "90_days" | "6_months" | "12_months" | "1_3_years";

export interface RoadmapStage {
  stage_id: "7_days" | "30_days" | "3_months" | "6_months" | "1_year" | string;
  title: string;
  tagline: string;
  progression_stage?: ProgressionStageId;
  time_horizon?: TimeHorizon;
  tasks: RoadmapTask[];
}

export interface PersonalRoadmap {
  target_career_id: string;
  target_career_name: string;
  created_at: string;
  stages: RoadmapStage[];
}

export interface SavedItems {
  careers: string[];
  majors: string[];
  universities: string[];
}

export interface AiCoachTrustBlock {
  reasoning_summary: string;
  evidence: string[];
  uncertainty?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
  action_type?: "explain" | "compare" | "plan" | "improve" | "evaluate" | "general";
  trust?: AiCoachTrustBlock;
  suggested_actions?: string[];
}

export type ActiveView =
  | "landing"
  | "assessment"
  | "profile"
  | "matches"
  | "career_explorer"
  | "major_explorer"
  | "university_explorer"
  | "compare"
  | "skill_gap"
  | "roadmap"
  | "coach"
  | "saved";
