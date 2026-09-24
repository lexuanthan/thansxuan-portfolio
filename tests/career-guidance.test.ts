import { describe, it, expect } from "vitest";
import { createDefaultProfile } from "../src/lib/career-guidance/seedProfile";
import {
  calculateCareerMatch,
  calculateMajorMatch,
  calculateNegativePenalties,
  calculateWorkStyleFit,
  calculateValueFit,
  rankCareers,
  rankMajors,
  deriveCareerArchetype,
  detectProfileContradictions
} from "../src/lib/career-guidance/matchingEngine";
import { CAREERS_DATA } from "../src/lib/career-guidance/careersData";
import { MAJORS_DATA } from "../src/lib/career-guidance/majorsData";
import { analyzeSkillGaps, getCareerExperiments } from "../src/lib/career-guidance/skillGapEngine";
import { generatePersonalRoadmap } from "../src/lib/career-guidance/roadmapEngine";
import { matchUniversities } from "../src/lib/career-guidance/universityMatching";
import { buildCoachSystemPrompt, generateSmartLocalCoachResponse } from "../src/lib/career-guidance/coachService";

describe("Career Guidance Engine - Master Prompt v3.0 Specification", () => {
  it("should generate a valid default profile with confidence score", () => {
    const profile = createDefaultProfile();
    expect(profile.profile_id).toBeDefined();
    expect(profile.profile_confidence).toBeGreaterThan(0.7);
    expect(profile.profile_archetype.title).toBeDefined();
    expect(profile.interests.technology).toBe(90);
    expect(profile.ranked_values.length).toBe(5);
  });

  it("should calculate deterministic career matches consistently", () => {
    const profile = createDefaultProfile();
    const results1 = rankCareers(profile);
    const results2 = rankCareers(profile);

    expect(results1.length).toBe(CAREERS_DATA.length);
    expect(results1[0].score).toBe(results2[0].score);
    expect(results1[0].career.id).toBe(results2[0].career.id);
    expect(results1[0].score).toBeGreaterThanOrEqual(60);
    expect(results1[0].score).toBeLessThanOrEqual(100);
  });

  it("should calculate major matches and order them by score", () => {
    const profile = createDefaultProfile();
    const majorResults = rankMajors(profile);

    expect(majorResults.length).toBe(MAJORS_DATA.length);
    expect(majorResults[0].score).toBeGreaterThanOrEqual(majorResults[1].score);
    expect(majorResults[0].reasons.positive_factors.length).toBeGreaterThan(0);
  });

  it("should apply negative preference penalties correctly", () => {
    const dataAnalyst = CAREERS_DATA.find((c) => c.id === "data_analyst")!;
    
    // Khi né tránh tính toán nặng
    const penaltyWithAvoidMath = calculateNegativePenalties(dataAnalyst, ["avoid_math_heavy"]);
    expect(penaltyWithAvoidMath.penaltyPoints).toBe(16);
    expect(penaltyWithAvoidMath.triggeredPenalties.length).toBe(1);

    // Khi không có né tránh
    const penaltyNone = calculateNegativePenalties(dataAnalyst, []);
    expect(penaltyNone.penaltyPoints).toBe(0);
  });

  it("should calculate work style fit accurately on -100 to +100 scale", () => {
    const userStyle = {
      independent_vs_team: 20,
      stable_vs_dynamic: 20,
      structured_vs_flexible: -20,
      deep_work_vs_multitask: -40,
      people_vs_system: -50,
      theory_vs_practice: 60,
      detail_vs_big_picture: 30
    };

    const targetStyle = {
      independent_vs_team: 20,
      stable_vs_dynamic: 20
    };

    const fit = calculateWorkStyleFit(userStyle, targetStyle);
    expect(fit).toBe(100); // Trùng khớp hoàn toàn 2 thuộc tính chỉ định
  });

  it("should calculate career value fit based on ranked top 5 weights", () => {
    const ranked = ["income", "continuous_learning", "innovation", "autonomy", "job_security"] as any;
    const careerValues = {
      income: 100,
      continuous_learning: 100,
      innovation: 100,
      autonomy: 100,
      job_security: 100
    };

    const fit = calculateValueFit(ranked, careerValues);
    expect(fit).toBe(100);
  });

  it("should detect profile contradictions when conflicting choices exist", () => {
    const profile = createDefaultProfile();
    // Tạo mâu thuẫn: Thích làm việc nhóm cao (+80) nhưng né giao tiếp con người
    profile.work_style.independent_vs_team = 80;
    profile.negative_preferences = ["avoid_people_intensive_work"];

    const contradictions = detectProfileContradictions(profile);
    expect(contradictions.length).toBeGreaterThan(0);
    expect(contradictions[0]).toContain("nhóm");
  });

  it("should analyze skill gaps and produce actionable micro experiments", () => {
    const profile = createDefaultProfile();
    const dataAnalyst = CAREERS_DATA.find((c) => c.id === "data_analyst")!;

    const gaps = analyzeSkillGaps(dataAnalyst, profile);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0].current_level).toBeDefined();
    expect(gaps[0].target_level).toBeDefined();

    const experiments = getCareerExperiments(dataAnalyst.id);
    expect(experiments.length).toBe(3);
    expect(experiments[0].time_commitment).toBeDefined();
    expect(experiments[0].steps.length).toBeGreaterThan(0);
  });

  it("should generate a 5-stage personal roadmap", () => {
    const profile = createDefaultProfile();
    const dataAnalyst = CAREERS_DATA.find((c) => c.id === "data_analyst")!;

    const roadmap = generatePersonalRoadmap(dataAnalyst, profile);
    expect(roadmap.stages.length).toBe(5);
    expect(roadmap.stages[0].stage_id).toBe("7_days");
    expect(roadmap.stages[1].stage_id).toBe("30_days");
    expect(roadmap.stages[2].stage_id).toBe("3_months");
    expect(roadmap.stages[3].stage_id).toBe("6_months");
    expect(roadmap.stages[4].stage_id).toBe("1_year");
    expect(roadmap.stages[0].tasks.length).toBeGreaterThan(0);
  });

  it("should match universities and calculate admission feasibility", () => {
    const profile = createDefaultProfile();
    profile.user_context.expected_exam_score = 27.5;

    const matchedUnis = matchUniversities(profile);
    expect(matchedUnis.length).toBeGreaterThan(0);
    expect(["Safe", "Target", "Reach"]).toContain(matchedUnis[0].overall_feasibility);
  });

  it("should construct coach prompt and provide resilient offline responses", () => {
    const profile = createDefaultProfile();
    const topCareers = rankCareers(profile);
    const topMajors = rankMajors(profile);

    const context = {
      profile,
      topCareers,
      topMajors,
      targetRoadmap: null
    };

    const prompt = buildCoachSystemPrompt(context);
    expect(prompt).toContain("AI Career Coach");
    expect(prompt).toContain(topCareers[0].career.name);

    const reply = generateSmartLocalCoachResponse("Tại sao tôi phù hợp ngành này?", context);
    expect(reply.length).toBeGreaterThan(50);
    expect(reply).toContain("Career DNA");
  });
});
