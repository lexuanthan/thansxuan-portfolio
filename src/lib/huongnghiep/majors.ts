/**
 * KHO NGÀNH — dữ liệu phát triển.
 *
 * ⚠ TOÀN BỘ SỐ LIỆU Ở ĐÂY LÀ `DEVELOPMENT_ASSUMPTION` (nguồn Level 5 theo
 * PART 5.47). Chúng do tôi dựng theo mô tả chương trình đào tạo phổ biến, KHÔNG
 * phải yêu cầu chính thức của bất kỳ trường nào, và không được trình bày ra
 * ngoài như dữ liệu tuyển sinh thật. Khi có bộ dữ liệu thật thì thay vào và
 * đổi `sourceType`.
 *
 * VÌ SAO MỖI NGÀNH CHỈ KHAI MỘT PHẦN TRONG 90 YẾU TỐ:
 * DNA mô tả những gì ĐẶC TRƯNG cho ngành, không phải điền cho kín bảng. Ngành
 * Kế toán không cần khai `interest.agriculture`; khai bừa một con số vào đó là
 * thêm nhiễu vào mẫu số của coverage và làm loãng những yếu tố thật sự quan
 * trọng. Yếu tố không khai = ngành không đòi hỏi, khác hẳn với khai bằng 0.
 */

import type { GroupCode, MajorDna, MajorFactorValue, PartialRiasec } from "./types";
import { GROUP_WEIGHTS, groupOfFactor } from "./config";
import { SEED_PROVENANCE, mf } from "./seed";

/* ------------------------------------------------------------------ */
/* Bộ dựng gọn                                                         */
/* ------------------------------------------------------------------ */

type Sketch = {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  group: string;
  riasec: PartialRiasec;
  riasecConfidence: number;
  /** [mã yếu tố, mức đặc trưng, mức quan trọng, ngưỡng tối thiểu?] */
  factors: [string, number, number, number?][];
  criticals?: { factor: string; min: number; severity: "HIGH" | "MEDIUM" | "LOW" }[];
  challenges?: { code: string; title: string; description: string }[];
  careers: string[];
};

function build(s: Sketch): MajorDna {
  const factors: Record<string, MajorFactorValue> = {};
  for (const [code, expected, importance, minimum] of s.factors) {
    factors[code] = mf(code, expected, importance, {
      minimumScore: minimum ?? null,
      requirementType:
        importance >= 90 ? "CORE" : importance >= 75 ? "IMPORTANT" : importance >= 50 ? "SUPPORTING" : "OPTIONAL",
      confidence: 0.6,
      explanation: "Dữ liệu phát triển, dựng theo mô tả chương trình đào tạo phổ biến.",
    });
  }

  return {
    majorId: s.id,
    majorCode: s.code,
    nameVi: s.nameVi,
    nameEn: s.nameEn,
    groupCode: s.group,
    version: 1,
    status: "PUBLISHED",
    factors,
    riasec: s.riasec,
    riasecConfidence: s.riasecConfidence,
    criticalFactors: (s.criticals ?? []).map((c) => ({
      factorCode: c.factor,
      minimumScore: c.min,
      severity: c.severity,
      // V1.0 ưu tiên SOFT_GATE (5.28). HARD_GATE chỉ dùng khi có điều kiện
      // khách quan rõ ràng của chương trình — dữ liệu phát triển thì không có.
      gateType: "SOFT_GATE" as const,
    })),
    challenges: (s.challenges ?? []).map((c) => ({ ...c, severity: "MEDIUM" as const })),
    academicLoad: {},
    careerCodes: s.careers,
    groupConfidence: {
      ACADEMIC: 0.6, INTEREST: 0.6, ABILITY: 0.55,
      WORK_STYLE: 0.5, CAREER_VALUE: 0.5, RIASEC: s.riasecConfidence, ENVIRONMENT: 0.5,
    },
    // Thấp có chủ ý: đây là dữ liệu Level 5, và `dnaQuality` chiếm 25% trong
    // công thức confidence nên nó phải kéo độ tin cậy kết quả xuống cho đúng.
    dnaQuality: 0.55,
    provenance: SEED_PROVENANCE,
  };
}

/* ------------------------------------------------------------------ */
/* Chín ngành, trải đều sáu kiểu RIASEC                                */
/* ------------------------------------------------------------------ */

const SKETCHES: Sketch[] = [
  {
    id: "SP001", code: "SU_PHAM_TIEU_HOC", nameVi: "Giáo dục Tiểu học", nameEn: "Primary Education",
    group: "G02", riasec: { R: 25, I: 45, A: 60, S: 95, E: 55, C: 60 }, riasecConfidence: 0.7,
    factors: [
      ["academic.literature", 85, 90, 50], ["academic.math", 70, 70], ["academic.english", 60, 45],
      ["academic.history", 65, 50], ["academic.biology", 55, 35],
      ["interest.education", 95, 95], ["interest.people", 90, 90], ["interest.communication", 70, 60],
      ["interest.arts", 65, 45], ["interest.healthcare", 55, 35],
      ["ability.communication", 90, 90, 50], ["ability.verbal", 88, 85], ["ability.teamwork", 80, 70],
      ["ability.organization", 80, 70], ["ability.creativity", 70, 55], ["ability.analytical", 55, 35],
      ["thinking.practical", 80, 65], ["thinking.creative", 70, 50],
      ["work_style.social_interaction", 90, 80], ["work_style.teamwork", 85, 70],
      ["work_style.structure", 75, 60], ["work_style.deep_work", 45, 35],
      ["career_value.social_impact", 90, 85], ["career_value.people", 90, 85],
      ["career_value.stability", 80, 70], ["career_value.income", 50, 40],
      ["environment.school", 95, 85], ["environment.office", 40, 30], ["environment.remote", 25, 25],
    ],
    criticals: [
      { factor: "ability.communication", min: 50, severity: "HIGH" },
      { factor: "academic.literature", min: 50, severity: "MEDIUM" },
    ],
    challenges: [{ code: "EMOTIONAL_LOAD", title: "Cường độ tương tác", description: "Công việc đòi hỏi tiếp xúc và kiên nhẫn với trẻ nhỏ gần như liên tục." }],
    careers: ["GIAO_VIEN_TIEU_HOC", "CHUYEN_VIEN_GIAO_DUC"],
  },
  {
    id: "QT001", code: "QUAN_TRI_KINH_DOANH", nameVi: "Quản trị kinh doanh", nameEn: "Business Administration",
    group: "G03", riasec: { R: 25, I: 45, A: 45, S: 65, E: 92, C: 70 }, riasecConfidence: 0.75,
    factors: [
      ["academic.math", 75, 70], ["academic.literature", 70, 55], ["academic.english", 80, 75],
      ["academic.geography", 55, 30],
      ["interest.business", 95, 95], ["interest.finance", 80, 75], ["interest.marketing", 85, 80],
      ["interest.people", 75, 65], ["interest.communication", 75, 60],
      ["ability.communication", 88, 85], ["ability.leadership", 85, 85], ["ability.organization", 85, 80],
      ["ability.teamwork", 80, 70], ["ability.analytical", 75, 70], ["ability.verbal", 78, 65],
      ["thinking.practical", 80, 70], ["thinking.analytical", 72, 60],
      ["work_style.social_interaction", 85, 75], ["work_style.leadership", 85, 75],
      ["work_style.multitasking", 80, 70], ["work_style.change_orientation", 75, 60],
      ["career_value.income", 85, 80], ["career_value.promotion", 85, 80],
      ["career_value.achievement", 85, 75], ["career_value.entrepreneurship", 75, 60],
      ["environment.office", 90, 80], ["environment.startup", 75, 60], ["environment.hybrid", 70, 50],
    ],
    criticals: [{ factor: "ability.communication", min: 50, severity: "MEDIUM" }],
    challenges: [{ code: "COMPETITION", title: "Mức cạnh tranh", description: "Ngành đông người học; khác biệt thường đến từ trải nghiệm thực tế hơn là bằng cấp." }],
    careers: ["CHUYEN_VIEN_KINH_DOANH", "QUAN_LY_DU_AN", "MARKETING"],
  },
  {
    id: "TK001", code: "THIET_KE_DO_HOA", nameVi: "Thiết kế đồ hoạ", nameEn: "Graphic Design",
    group: "G04", riasec: { R: 40, I: 45, A: 95, S: 45, E: 55, C: 35 }, riasecConfidence: 0.78,
    factors: [
      ["academic.literature", 65, 45], ["academic.english", 65, 50], ["academic.informatics", 70, 60],
      ["academic.technology", 60, 40],
      ["interest.design", 95, 95], ["interest.arts", 90, 90], ["interest.communication", 75, 65],
      ["interest.technology", 65, 50], ["interest.marketing", 60, 45],
      ["ability.creativity", 95, 95, 55], ["ability.spatial", 88, 85], ["ability.technical", 65, 50],
      ["ability.communication", 70, 55], ["ability.independent_work", 75, 60],
      ["thinking.creative", 92, 85], ["thinking.practical", 70, 55], ["thinking.experimental", 70, 50],
      ["work_style.autonomy", 80, 70], ["work_style.deep_work", 80, 65],
      ["work_style.independent", 75, 60], ["work_style.structure", 45, 40],
      ["career_value.creativity", 92, 90], ["career_value.freedom", 80, 70],
      ["career_value.autonomy", 78, 65], ["career_value.stability", 45, 40],
      ["environment.studio", 90, 80], ["environment.remote", 80, 65], ["environment.startup", 70, 50],
    ],
    criticals: [{ factor: "ability.creativity", min: 55, severity: "HIGH" }],
    challenges: [{ code: "PORTFOLIO", title: "Hồ sơ năng lực", description: "Tuyển dụng nhìn vào sản phẩm đã làm nhiều hơn nhìn vào bảng điểm." }],
    careers: ["THIET_KE_DO_HOA", "UI_DESIGNER", "SANG_TAO_NOI_DUNG"],
  },
  {
    id: "CK001", code: "KY_THUAT_CO_KHI", nameVi: "Kỹ thuật cơ khí", nameEn: "Mechanical Engineering",
    group: "G01", riasec: { R: 92, I: 75, A: 30, S: 25, E: 40, C: 60 }, riasecConfidence: 0.8,
    factors: [
      ["academic.math", 90, 92, 55], ["academic.physics", 90, 90, 50], ["academic.technology", 80, 75],
      ["academic.informatics", 65, 50], ["academic.chemistry", 55, 35],
      ["interest.machines", 95, 95], ["interest.technology", 85, 80], ["interest.electronics", 75, 65],
      ["interest.construction", 65, 45], ["interest.science", 70, 55],
      ["ability.technical", 92, 92], ["ability.spatial", 88, 85], ["ability.numerical", 85, 82],
      ["ability.problem_solving", 85, 80], ["ability.logical", 82, 75], ["ability.teamwork", 70, 55],
      ["thinking.practical", 88, 80], ["thinking.analytical", 80, 70], ["thinking.experimental", 75, 60],
      ["work_style.structure", 78, 65], ["work_style.specialization", 78, 65],
      ["work_style.teamwork", 70, 55], ["work_style.social_interaction", 40, 35],
      ["career_value.stability", 78, 65], ["career_value.technology", 82, 70],
      ["career_value.achievement", 72, 55], ["career_value.income", 75, 60],
      ["environment.factory", 88, 80], ["environment.lab", 70, 55], ["environment.office", 60, 45],
      ["environment.construction_site", 65, 45], ["environment.remote", 25, 30],
    ],
    criticals: [
      { factor: "academic.math", min: 55, severity: "HIGH" },
      { factor: "academic.physics", min: 50, severity: "HIGH" },
    ],
    challenges: [{ code: "MATH_PHYSICS", title: "Nền Toán – Lý", description: "Các học phần cơ sở dùng Toán và Vật lý ở mức cao và liên tục." }],
    careers: ["KY_SU_CO_KHI", "KY_SU_THIET_KE", "QUAN_LY_SAN_XUAT"],
  },
  {
    id: "DD001", code: "DIEU_DUONG", nameVi: "Điều dưỡng", nameEn: "Nursing",
    group: "G05", riasec: { R: 55, I: 65, A: 30, S: 92, E: 45, C: 70 }, riasecConfidence: 0.75,
    factors: [
      ["academic.biology", 88, 90, 50], ["academic.chemistry", 78, 75], ["academic.math", 60, 45],
      ["academic.english", 65, 50], ["academic.literature", 60, 40],
      ["interest.healthcare", 95, 95], ["interest.people", 88, 85], ["interest.science", 72, 60],
      ["interest.research", 55, 35],
      ["ability.communication", 85, 82], ["ability.teamwork", 88, 85], ["ability.organization", 85, 80],
      ["ability.technical", 75, 65], ["ability.problem_solving", 75, 65],
      ["thinking.practical", 88, 80], ["thinking.analytical", 70, 55],
      ["work_style.social_interaction", 88, 80], ["work_style.structure", 88, 80],
      ["work_style.teamwork", 88, 78], ["work_style.multitasking", 80, 70],
      ["career_value.social_impact", 92, 88], ["career_value.people", 90, 85],
      ["career_value.stability", 82, 70], ["career_value.work_life_balance", 45, 45],
      ["environment.hospital", 95, 90], ["environment.lab", 55, 40], ["environment.remote", 15, 30],
    ],
    criticals: [
      { factor: "academic.biology", min: 50, severity: "HIGH" },
      { factor: "ability.teamwork", min: 50, severity: "MEDIUM" },
    ],
    challenges: [
      { code: "SHIFT_WORK", title: "Ca kíp", description: "Công việc theo ca, kể cả đêm và ngày lễ." },
      { code: "EMOTIONAL_LOAD", title: "Áp lực cảm xúc", description: "Tiếp xúc thường xuyên với người bệnh và tình huống căng thẳng." },
    ],
    careers: ["DIEU_DUONG_VIEN", "CHUYEN_VIEN_Y_TE_CONG_DONG"],
  },
  {
    id: "KT001", code: "KE_TOAN", nameVi: "Kế toán", nameEn: "Accounting",
    group: "G03", riasec: { R: 35, I: 55, A: 20, S: 40, E: 60, C: 95 }, riasecConfidence: 0.8,
    factors: [
      ["academic.math", 85, 88, 50], ["academic.english", 70, 60], ["academic.informatics", 70, 60],
      ["academic.literature", 60, 35],
      ["interest.finance", 92, 92], ["interest.business", 80, 75], ["interest.data", 70, 60],
      ["interest.technology", 55, 40],
      ["ability.numerical", 90, 90, 50], ["ability.organization", 90, 88], ["ability.analytical", 82, 78],
      ["ability.logical", 80, 72], ["ability.communication", 60, 45],
      ["thinking.analytical", 82, 72], ["thinking.logical", 85, 75], ["thinking.practical", 75, 60],
      ["work_style.structure", 92, 88], ["work_style.specialization", 80, 68],
      ["work_style.deep_work", 78, 65], ["work_style.change_orientation", 35, 40],
      ["career_value.stability", 88, 82], ["career_value.income", 75, 65],
      ["career_value.creativity", 30, 40], ["career_value.promotion", 70, 55],
      ["environment.office", 92, 85], ["environment.remote", 65, 50], ["environment.outdoor", 10, 25],
    ],
    criticals: [
      { factor: "ability.numerical", min: 50, severity: "HIGH" },
      { factor: "work_style.structure", min: 45, severity: "MEDIUM" },
    ],
    challenges: [{ code: "PRECISION", title: "Độ chính xác", description: "Công việc đòi hỏi chính xác tuyệt đối và lặp lại theo chu kỳ." }],
    careers: ["KE_TOAN_VIEN", "KIEM_TOAN_VIEN", "CHUYEN_VIEN_TAI_CHINH"],
  },
  {
    id: "NN001", code: "NGON_NGU_ANH", nameVi: "Ngôn ngữ Anh", nameEn: "English Studies",
    group: "G06", riasec: { R: 20, I: 60, A: 75, S: 80, E: 60, C: 50 }, riasecConfidence: 0.7,
    factors: [
      ["academic.english", 95, 95, 60], ["academic.literature", 85, 85], ["academic.history", 60, 45],
      ["academic.geography", 55, 35],
      ["interest.language", 95, 95], ["interest.communication", 82, 78], ["interest.education", 70, 60],
      ["interest.arts", 62, 45], ["interest.people", 70, 55],
      ["ability.verbal", 95, 95, 55], ["ability.communication", 90, 88], ["ability.creativity", 70, 55],
      ["ability.research", 68, 50], ["ability.teamwork", 70, 50],
      ["thinking.creative", 72, 55], ["thinking.analytical", 70, 55],
      ["work_style.social_interaction", 78, 65], ["work_style.autonomy", 70, 55],
      ["work_style.flexibility", 72, 55],
      ["career_value.international", 88, 85], ["career_value.people", 75, 60],
      ["career_value.freedom", 70, 55], ["career_value.creativity", 68, 50],
      ["environment.office", 78, 60], ["environment.school", 75, 60], ["environment.remote", 75, 60],
    ],
    criticals: [
      { factor: "academic.english", min: 60, severity: "HIGH" },
      { factor: "ability.verbal", min: 55, severity: "MEDIUM" },
    ],
    challenges: [{ code: "DIFFERENTIATION", title: "Tạo khác biệt", description: "Ngoại ngữ ngày càng phổ biến; thường cần ghép thêm một chuyên môn thứ hai." }],
    careers: ["BIEN_PHIEN_DICH", "GIAO_VIEN_TIENG_ANH", "TRUYEN_THONG_QUOC_TE"],
  },
  {
    id: "KTr001", code: "KIEN_TRUC", nameVi: "Kiến trúc", nameEn: "Architecture",
    group: "G04", riasec: { R: 70, I: 65, A: 90, S: 45, E: 55, C: 50 }, riasecConfidence: 0.75,
    factors: [
      ["academic.math", 80, 78], ["academic.physics", 72, 65], ["academic.technology", 70, 58],
      ["academic.informatics", 65, 50],
      ["interest.architecture", 95, 95], ["interest.design", 90, 90], ["interest.construction", 80, 75],
      ["interest.arts", 78, 68], ["interest.environment", 60, 45],
      ["ability.spatial", 95, 95, 55], ["ability.creativity", 90, 88], ["ability.technical", 78, 70],
      ["ability.numerical", 72, 60], ["ability.communication", 70, 55],
      ["thinking.creative", 88, 80], ["thinking.practical", 78, 65], ["thinking.analytical", 72, 58],
      ["work_style.deep_work", 85, 75], ["work_style.autonomy", 75, 60],
      ["work_style.specialization", 72, 55], ["work_style.teamwork", 70, 55],
      ["career_value.creativity", 90, 85], ["career_value.achievement", 78, 65],
      ["career_value.autonomy", 72, 58], ["career_value.work_life_balance", 40, 45],
      ["environment.studio", 88, 78], ["environment.office", 78, 62], ["environment.construction_site", 72, 58],
    ],
    criticals: [{ factor: "ability.spatial", min: 55, severity: "HIGH" }],
    challenges: [
      { code: "STUDY_LENGTH", title: "Thời gian đào tạo", description: "Chương trình thường dài hơn các ngành khác, phổ biến là 5 năm." },
      { code: "STUDIO_HOURS", title: "Giờ đồ án", description: "Khối lượng đồ án lớn, thường phải làm ngoài giờ lên lớp." },
    ],
    careers: ["KIEN_TRUC_SU", "THIET_KE_NOI_THAT", "QUY_HOACH"],
  },
  {
    id: "MT001", code: "CONG_NGHE_MOI_TRUONG", nameVi: "Công nghệ môi trường", nameEn: "Environmental Technology",
    group: "G07", riasec: { R: 75, I: 85, A: 35, S: 60, E: 40, C: 55 }, riasecConfidence: 0.7,
    factors: [
      ["academic.chemistry", 88, 88, 50], ["academic.biology", 85, 85, 45], ["academic.math", 75, 70],
      ["academic.physics", 70, 60], ["academic.geography", 70, 55],
      ["interest.environment", 95, 95], ["interest.science", 85, 82], ["interest.research", 78, 70],
      ["interest.agriculture", 65, 50], ["interest.technology", 65, 50],
      ["ability.analytical", 85, 82], ["ability.research", 82, 78], ["ability.technical", 78, 68],
      ["ability.problem_solving", 80, 70], ["ability.numerical", 75, 62],
      ["thinking.analytical", 82, 72], ["thinking.experimental", 85, 78], ["thinking.research", 82, 72],
      ["work_style.deep_work", 75, 62], ["work_style.teamwork", 72, 58],
      ["work_style.specialization", 72, 55],
      ["career_value.social_impact", 88, 82], ["career_value.research", 75, 62],
      ["career_value.stability", 70, 55], ["career_value.income", 55, 45],
      ["environment.lab", 88, 80], ["environment.outdoor", 75, 62], ["environment.research_center", 75, 60],
      ["environment.factory", 60, 45],
    ],
    criticals: [
      { factor: "academic.chemistry", min: 50, severity: "HIGH" },
      { factor: "academic.biology", min: 45, severity: "MEDIUM" },
    ],
    challenges: [{ code: "FIELD_WORK", title: "Công việc hiện trường", description: "Có phần đi thực địa và làm việc ngoài trời, không chỉ ngồi phòng thí nghiệm." }],
    careers: ["KY_SU_MOI_TRUONG", "CHUYEN_VIEN_QUAN_TRAC", "TU_VAN_MOI_TRUONG"],
  },
];

export const DEV_MAJORS: MajorDna[] = SKETCHES.map(build);

/* ------------------------------------------------------------------ */
/* Đủ điều kiện dùng trong so khớp — PART 5.59                         */
/* ------------------------------------------------------------------ */

/**
 * Một DNA chỉ dùng được nếu nó khai đủ những nhóm nặng ký.
 *
 * Nếu một ngành chỉ khai vài yếu tố môi trường mà bỏ trống Academic, Interest,
 * Ability thì engine sẽ từ chối chấm (sàn `MIN_USABLE_GROUP_WEIGHT`) — nhưng
 * lúc đó mới phát hiện thì đã muộn, và học sinh chỉ thấy một lỗi khó hiểu.
 * Kiểm ở đây, ngay khi nạp dữ liệu.
 */
export function dnaCoveredWeight(dna: MajorDna): number {
  const groups = new Set<GroupCode>();
  for (const code of Object.keys(dna.factors)) {
    const g = groupOfFactor(code);
    if (g) groups.add(g);
  }
  // RIASEC không có yếu tố nào; nó đủ điều kiện khi có đủ sáu chiều.
  const riasecReady = Object.values(dna.riasec).filter((v) => typeof v === "number").length === 6;
  if (riasecReady) groups.add("RIASEC");

  let sum = 0;
  for (const g of groups) sum += GROUP_WEIGHTS[g];
  return sum;
}

export function unusableMajors(list: MajorDna[] = DEV_MAJORS): string[] {
  return list.filter((d) => dnaCoveredWeight(d) < 0.5).map((d) => d.majorCode);
}
