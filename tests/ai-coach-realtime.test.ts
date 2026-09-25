import { describe, it, expect } from "vitest";
import {
  extractRealtimeFact,
  REALTIME_METADATA,
  REALTIME_UNIVERSITIES,
  REALTIME_CAREER_SALARIES
} from "../src/lib/career-guidance/realtimeMarketData";
import {
  buildCoachSystemPrompt,
  generateSmartCoachFullResponse,
  generateSmartLocalCoachResponse,
  CoachContext
} from "../src/lib/career-guidance/coachService";
import { createDefaultProfile } from "../src/lib/career-guidance/seedProfile";
import { rankCareers, rankMajors } from "../src/lib/career-guidance/matchingEngine";

describe("AI COACH — REALTIME DATA & NATURAL CONVERSATIONAL TONE AUDIT", () => {
  const profile = createDefaultProfile();
  const topCareers = rankCareers(profile);
  const topMajors = rankMajors(profile);

  const context: CoachContext = {
    profile,
    topCareers,
    topMajors,
    targetRoadmap: null
  };

  it("1. REALTIME METADATA: verifies verified academic year 2025-2026 and official data sources", () => {
    expect(REALTIME_METADATA.academicYear).toBe("2025–2026");
    expect(REALTIME_METADATA.lastVerifiedDate).toContain("2026");
    expect(REALTIME_UNIVERSITIES.SPK.shortName).toBe("HCMUTE");
    expect(REALTIME_UNIVERSITIES.SPK.tuitionYear.standard).toContain("32 – 39 triệu");
    expect(REALTIME_UNIVERSITIES.SPK.cutoffBenchmark["Công nghệ Thông tin"].thpt).toBe(26.5);
  });

  it("2. REALTIME FACT EXTRACTION: accurately responds to tuition queries without hallucination", () => {
    const tuitionFact = extractRealtimeFact("Học phí HCMUTE bao nhiêu tiền một năm?");
    expect(tuitionFact).not.toBeNull();
    expect(tuitionFact).toContain("32 – 39 triệu VNĐ / năm");
    expect(tuitionFact).toContain("36 tỷ đồng");
  });

  it("3. REALTIME FACT EXTRACTION: accurately responds to benchmark cutoff queries", () => {
    const cutoffFact = extractRealtimeFact("Điểm chuẩn ngành Công nghệ thông tin và AI lấy bao nhiêu điểm?");
    expect(cutoffFact).not.toBeNull();
    expect(cutoffFact).toContain("Robot & AI");
    expect(cutoffFact).toContain("Công nghệ Thông tin");
    expect(cutoffFact).toContain("26.50");
  });

  it("4. REALTIME FACT EXTRACTION: accurately responds to market salary queries", () => {
    const salaryFact = extractRealtimeFact("Mức lương và thu nhập ra trường thế nào?");
    expect(salaryFact).not.toBeNull();
    expect(salaryFact).toContain("Fresher 0–1 năm");
    expect(salaryFact).toContain("10 – 16 triệu");
  });

  it("5. REALTIME FACT EXTRACTION: accurately responds to AI displacement concerns", () => {
    const aiFact = extractRealtimeFact("Liệu AI có làm mất việc hoặc thay thế lập trình viên không?");
    expect(aiFact).not.toBeNull();
    expect(aiFact).toContain("AI không lấy đi việc làm của bạn");
    expect(aiFact).toContain("người biết ứng dụng AI thuần thục");
  });

  it("6. NATURAL FRIENDLY TONE: uses warm, approachable pronouns (mình, bạn) and concise bullet points", () => {
    const result = generateSmartCoachFullResponse("Tại sao tôi phù hợp với nghề này?", context, "explain");
    expect(result.reply).toContain("mình");
    expect(result.reply).toContain("bạn");
    expect(result.reply).toContain("Career DNA");
    expect(result.reply).toContain("Hành động nhỏ hôm nay");

    // Concise, not excessively bloated
    expect(result.reply.length).toBeLessThan(1400);
    expect(result.evidence.length).toBeGreaterThanOrEqual(2);
    expect(result.suggested_actions?.length).toBeGreaterThanOrEqual(2);
  });

  it("7. REALTIME QUERY INTEGRATION: intercepts factual queries and returns verified real-time data", () => {
    const result = generateSmartCoachFullResponse("Học phí trường mình bao nhiêu?", context);
    expect(result.is_realtime_fact).toBe(true);
    expect(result.reply).toContain("32 – 39 triệu");
    expect(result.evidence[0]).toContain(REALTIME_METADATA.dataSource);
  });

  it("8. BACKWARD COMPATIBILITY: generateSmartLocalCoachResponse returns concise valid text", () => {
    const reply = generateSmartLocalCoachResponse("So sánh 2 ngành hàng đầu", context, "compare");
    expect(typeof reply).toBe("string");
    expect(reply.length).toBeGreaterThan(100);
    expect(reply).toContain("Chào bạn!");
  });

  it("9. SYSTEM PROMPT: embeds real-time admission and salary guidance", () => {
    const prompt = buildCoachSystemPrompt(context);
    expect(prompt).toContain("AI Career Coach");
    expect(prompt).toContain(REALTIME_METADATA.academicYear);
    expect(prompt).toContain(REALTIME_UNIVERSITIES.SPK.shortName);
  });

  it("10. REALTIME SALARIES: verifies verified salary data across key tech careers", () => {
    expect(REALTIME_CAREER_SALARIES.software_engineer.fresherMonthlyMillion).toContain("12 – 18 triệu");
    expect(REALTIME_CAREER_SALARIES.ai_engineer.seniorMonthlyMillion).toContain("60 – 100+ triệu");
  });
});
