import { UniversityMatchResult, StudentCareerProfile } from "./types";
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

export function matchUniversities(
  profile: StudentCareerProfile,
  filterMajorQuery?: string
): UniversityMatchResult[] {
  const expectedScore = profile.user_context.expected_exam_score || 25.0;
  const userRegion = profile.user_context.target_province || "";
  const tuitionBudget = profile.user_context.tuition_budget_max_million || 40;

  const results: UniversityMatchResult[] = [];

  for (const uni of universitiesList) {
    // Lọc theo ngân sách học phí nếu có
    if (uni.tuition && uni.tuition > tuitionBudget * 1.5) {
      continue;
    }

    const matchingMajors: UniversityMatchResult["matching_majors"] = [];
    const majorsToCheck = uni.majors && uni.majors.length > 0 ? uni.majors : [
      { major_name: "Công nghệ Thông tin", cutoff_score: uni.cutoff || 25.0 },
      { major_name: "Kinh doanh & Quản trị", cutoff_score: (uni.cutoff || 25.0) - 0.8 }
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

    // Đánh giá tổng quan trường
    let overallFeasibility: "Safe" | "Target" | "Reach" = "Target";
    const avgDiff = expectedScore - (uni.cutoff || 24.5);
    if (avgDiff >= 1.5) overallFeasibility = "Safe";
    else if (avgDiff >= -0.75) overallFeasibility = "Target";
    else overallFeasibility = "Reach";

    // Tính điểm match tổng thể (0 - 100)
    let score = 75;
    if (overallFeasibility === "Safe") score += 12;
    if (overallFeasibility === "Target") score += 18;
    if (overallFeasibility === "Reach") score += 5;

    // Ưu tiên khu vực nếu trùng
    if (userRegion && uni.city.includes(userRegion)) {
      score += 10;
    }

    score = Math.min(98, Math.max(50, score));

    results.push({
      university_id: uni.id,
      university_name: uni.name,
      short_name: uni.shortName || uni.id,
      city: uni.city,
      region: uni.region,
      type: (uni.type as "Công lập" | "Tư thục" | "Quốc tế") || "Công lập",
      tuition_million_year: uni.tuition || 25,
      matching_majors: matchingMajors.slice(0, 5),
      overall_feasibility: overallFeasibility,
      match_score: score,
      strengths: [uni.highlight || "Trường đại học uy tín, chất lượng đào tạo chuẩn quốc gia"]
    });
  }

  return results.sort((a, b) => b.match_score - a.match_score);
}
