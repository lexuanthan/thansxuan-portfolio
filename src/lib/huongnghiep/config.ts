/**
 * CẤU HÌNH SO KHỚP — PART 6.5 → 6.7, 6.12, 6.30, 6.44, 6.46, 6.51.
 *
 * Không hard-code `academic * 0.20` ở bất kỳ đâu trong engine. Mọi con số
 * điều khiển thuật toán nằm ở file này và được đóng dấu phiên bản, để kết quả
 * cũ truy ngược được về đúng bộ số đã sinh ra nó.
 *
 * Các trọng số dưới đây là DEFAULT CONFIGURATION theo tài liệu, không phải
 * trọng số đã được khoa học xác nhận.
 */

import type { RiasecIndex } from "./similarity";
import type {
  FactorDefinition,
  FactorId,
  GroupCode,
  Band,
  Severity,
} from "./types";

export const MATCHING_ENGINE_VERSION = "major_matching_engine 1.0.0";
export const MATCHING_CONFIGURATION_ID = "major_matching_evidence_v2";
export const MATCHING_CONFIGURATION_VERSION = 2;
export const DERIVATION_RULE_VERSION = 1;

/* ------------------------------------------------------------------ */
/* Nhóm và trọng số — PART 6.5                                         */
/* ------------------------------------------------------------------ */

/**
 * Bảy nhóm. Thinking được tích hợp vào Ability (6.4) để tránh đếm trùng:
 * thinking.analytical và ability.analytical đo gần như cùng một thứ, tách
 * nhóm là cho nó hai lần phiếu bầu.
 */

/**
 * v1 — bộ trọng số mặc định của tài liệu (6.5).
 *
 * Chính tài liệu ghi rõ đây là "default configuration, không phải trọng số đã
 * được khoa học xác nhận". Giữ nguyên ở đây để tái lập được mọi kết quả đã
 * tính bằng v1; không xoá, không sửa.
 */
export const WEIGHTS_V1_SPEC: Record<GroupCode, number> = {
  ACADEMIC: 0.2,
  INTEREST: 0.2,
  ABILITY: 0.25,
  WORK_STYLE: 0.1,
  CAREER_VALUE: 0.1,
  RIASEC: 0.1,
  ENVIRONMENT: 0.05,
};

/**
 * v2 — bộ trọng số chỉnh theo mức tin cậy của TỪNG LOẠI DỮ LIỆU.
 *
 * Căn cứ (chi tiết và nguồn ở `references.md`):
 *
 * ABILITY 0.25 → 0.15
 *   Nhóm này gần như hoàn toàn là tự đánh giá (Q23–Q29). Phân tích tổng hợp
 *   trên ~5.000 cách xử lý dữ liệu cho tương quan giữa năng lực tự chấm và
 *   năng lực đo được chỉ r ≈ 0.30. Tức là chừng 9% phương sai chung. Để nó
 *   nặng ký nhất trong bảy nhóm là đặt niềm tin lớn nhất vào dữ liệu yếu nhất.
 *
 * ACADEMIC 0.20 → 0.25
 *   Điểm môn là số học sinh KHAI chứ không phải tự chấm về mình, và trường đã
 *   đo sẵn. Đây là dữ liệu khách quan nhất trong toàn bộ hồ sơ.
 *
 * INTEREST 0.20 → 0.25
 *   Mức hợp về hứng thú là biến duy nhất trong mô hình có bằng chứng định
 *   lượng trực tiếp với kết quả học đại học: ρ ≈ 0.10 với thành tích, 0.12 với
 *   việc học tiếp, 0.18 với sự hài lòng. Nhỏ, nhưng là chân vững nhất ta có.
 *
 * Bốn nhóm còn lại giữ nguyên.
 *
 * ⚠ Đây vẫn là trọng số dựng theo lập luận trên bằng chứng gián tiếp, KHÔNG
 * phải trọng số hiệu chỉnh trên dữ liệu người dùng thật. Khi có dữ liệu thật
 * thì hiệu chỉnh lại và lên v3.
 */
export const WEIGHTS_V2_EVIDENCE: Record<GroupCode, number> = {
  ACADEMIC: 0.25,
  INTEREST: 0.25,
  ABILITY: 0.15,
  WORK_STYLE: 0.1,
  CAREER_VALUE: 0.1,
  RIASEC: 0.1,
  ENVIRONMENT: 0.05,
};

/** Bộ đang dùng. Đổi ở đây rồi tăng MATCHING_CONFIGURATION_VERSION. */
export const GROUP_WEIGHTS: Record<GroupCode, number> = WEIGHTS_V2_EVIDENCE;

export const GROUP_ORDER: GroupCode[] = [
  "ACADEMIC",
  "INTEREST",
  "ABILITY",
  "WORK_STYLE",
  "CAREER_VALUE",
  "RIASEC",
  "ENVIRONMENT",
];

export const GROUP_LABEL: Record<GroupCode, string> = {
  ACADEMIC: "Nền tảng học thuật",
  INTEREST: "Lĩnh vực quan tâm",
  ABILITY: "Năng lực và lối tư duy",
  WORK_STYLE: "Cách học và cách làm việc",
  CAREER_VALUE: "Giá trị nghề nghiệp",
  RIASEC: "Xu hướng nghề nghiệp RIASEC",
  ENVIRONMENT: "Môi trường làm việc",
};

/** PART 6.12. Dưới ngưỡng thì nhóm mang trạng thái INSUFFICIENT. */
export const MIN_GROUP_COMPLETENESS: Record<GroupCode, number> = {
  ACADEMIC: 0.7,
  INTEREST: 0.7,
  ABILITY: 0.7,
  WORK_STYLE: 0.5,
  CAREER_VALUE: 0.5,
  RIASEC: 0.6,
  ENVIRONMENT: 0.5,
};

/**
 * PART 6.27. Nhóm nào có trọng số thực = trọng số gốc × confidence.
 *
 * Tài liệu nêu quy tắc này cho RIASEC, nên mặc định chỉ RIASEC. Muốn áp cho
 * nhóm khác thì thêm mã vào mảng này — sửa cấu hình, không sửa thuật toán.
 */
export const CONFIDENCE_WEIGHTED_GROUPS: GroupCode[] = ["RIASEC"];

/* ------------------------------------------------------------------ */
/* Cách đo RIASEC                                                      */
/* ------------------------------------------------------------------ */

/**
 * Tài liệu (6.25) chọn COSINE. Đo thực nghiệm cho thấy cosine gần như không
 * phân biệt được gì — hồ sơ "đều tay" khớp ~92 với MỌI ngành — nên mặc định
 * đổi sang CORRELATION, cách được tài liệu học thuật đánh giá cao nhất trong
 * nhóm dùng đủ sáu chiều. Chi tiết số liệu ở `similarity.ts` và `references.md`.
 *
 * Đặt lại thành "COSINE" là tái lập đúng hành vi theo tài liệu gốc.
 */
export const RIASEC_INDEX: RiasecIndex = "CORRELATION";

/**
 * Ngưỡng phân hoá tối thiểu của hồ sơ RIASEC (độ lệch chuẩn sáu chiều).
 *
 * Dưới ngưỡng này thì hồ sơ không có kiểu nghề nghiệp nổi trội — "differentiation"
 * trong lý thuyết Holland — và mọi phép so khớp trên nó đều là nhiễu. Khi đó
 * nhóm RIASEC bị bỏ khỏi phép tính thay vì cho ra một con số bịa.
 *
 * Đo trên hồ sơ điển hình: có kiểu rõ 18–22, hơi nghiêng 6.4, phẳng 1.3.
 */
export const MIN_RIASEC_DIFFERENTIATION = 10;

/* ------------------------------------------------------------------ */
/* Phạt — PART 6.30, 6.44, 6.45                                        */
/* ------------------------------------------------------------------ */

/**
 * Phạt là phép NHÂN chứ không phải phép trừ:
 *   FinalScore = RawScore × (1 − min(Σphạt, trần))
 * Trừ thẳng điểm sẽ phạt một hồ sơ yếu nặng hơn một hồ sơ mạnh dù cùng một
 * lỗ hổng; nhân theo tỉ lệ giữ cho mức phạt tương đương nhau.
 */
export const SOFT_GATE_PENALTY: Record<Severity, number> = {
  HIGH: 0.15,
  MEDIUM: 0.08,
  LOW: 0.03,
};

/**
 * PART 6.44. Trần phạt tổng.
 *
 * Không có trần thì năm yếu tố dưới ngưỡng sẽ cộng lại thành 51% và bảng kết
 * quả biến thành bảng xếp hạng của đúng vài câu hỏi. Trần giữ cho điểm vẫn
 * còn nói lên điều gì đó sau khi đã cảnh báo.
 */
export const MAXIMUM_TOTAL_PENALTY = 0.3;

/**
 * Khoảng coi là "sát ngưỡng" — dùng cho trạng thái NEAR_THRESHOLD.
 * Trong khoảng này vẫn tính là đạt, chỉ hiện cảnh báo nhẹ.
 */
export const NEAR_THRESHOLD_MARGIN = 5;

/* ------------------------------------------------------------------ */
/* Dải kết quả — PART 6.46, 6.47                                       */
/* ------------------------------------------------------------------ */

/**
 * Ranh giới lấy số thực, không làm tròn trước khi so (6.47, 6.48).
 * 79.99 KHÔNG phải STRONG_MATCH dù hiển thị ra là 80.
 */
export const BAND_THRESHOLDS: { band: Band; min: number }[] = [
  { band: "STRONG_MATCH", min: 80 },
  { band: "GOOD_MATCH", min: 65 },
  { band: "EXPLORE", min: 50 },
  { band: "LOW_MATCH", min: Number.NEGATIVE_INFINITY },
];

/** Nhãn diễn giải nội bộ, không phải đánh giá giá trị của ngành. */
export const BAND_LABEL: Record<Band, string> = {
  STRONG_MATCH: "Tương thích nổi bật",
  GOOD_MATCH: "Tương thích khá",
  EXPLORE: "Nên khám phá thêm",
  LOW_MATCH: "Mức tương thích thấp hơn",
};

export function bandOf(finalScore: number): Band {
  for (const b of BAND_THRESHOLDS) if (finalScore >= b.min) return b.band;
  return "LOW_MATCH";
}

/* ------------------------------------------------------------------ */
/* Độ tin cậy — PART 6.51, 6.52                                        */
/* ------------------------------------------------------------------ */

export const CONFIDENCE_WEIGHTS = {
  profileCompleteness: 0.35,
  groupCoverage: 0.25,
  majorDnaQuality: 0.25,
  criticalFactorCoverage: 0.15,
} as const;

/** Dưới ngưỡng này thì giao diện phải nói rõ dữ liệu còn thiếu (6.52). */
export const LOW_CONFIDENCE_THRESHOLD = 0.6;

/** PART 6.13. Dưới ngưỡng này hồ sơ chỉ chạy được LIMITED_MATCHING. */
export const MIN_PROFILE_COMPLETENESS = 0.6;

/**
 * Sàn cho TỔNG trọng số của các nhóm còn đủ dữ liệu.
 *
 * Tài liệu đặt ngưỡng cho từng nhóm (6.12) và cho hồ sơ (6.13), nhưng không
 * đặt sàn cho phần trọng số còn sống sót sau bước chuẩn hoá lại (6.41). Chỗ
 * hở đó cho ra kết quả nguy hiểm nhất mà hệ thống này có thể sinh ra:
 *
 *   một em trả lời đúng 7 câu tự chấm năng lực, mọi nhóm khác đều thiếu dữ
 *   liệu, nhóm Ability là nhóm duy nhất hợp lệ nên trọng số của nó được chuẩn
 *   hoá thành 1.000 — và em ấy nhận "Tương thích nổi bật 89/100" cho một
 *   ngành, dựng hoàn toàn từ bảy câu em tự đánh giá về mình.
 *
 * Con số ấy không sai về mặt số học, nó chỉ không có nghĩa. Mà một con số vô
 * nghĩa trông y hệt một con số có nghĩa, nên nó thuyết phục y như thật.
 *
 * Vì vậy: phải còn ít nhất một nửa mô hình thì mới được chấm điểm.
 */
export const MIN_USABLE_GROUP_WEIGHT = 0.5;

/** PART 5.59. DNA dưới ngưỡng này không được dùng trong production. */
export const MIN_DNA_COMPLETENESS = 0.6;

/* ------------------------------------------------------------------ */
/* Ngưỡng phân loại điểm mạnh / điểm cần củng cố — PART 6.55, 6.56      */
/* ------------------------------------------------------------------ */

export const ALIGNMENT_BANDS = [
  { min: 90, code: "HIGH_ALIGNMENT" },
  { min: 75, code: "GOOD_ALIGNMENT" },
  { min: 55, code: "MODERATE_ALIGNMENT" },
  { min: Number.NEGATIVE_INFINITY, code: "LOW_ALIGNMENT" },
] as const;

/** Chênh âm từ mức này trở đi, ở yếu tố importance cao, là điểm cần củng cố. */
export const DEVELOPMENT_GAP_THRESHOLD = -10;
/** Từ mức importance này trở lên mới coi là yếu tố nặng ký. */
export const HIGH_IMPORTANCE_THRESHOLD = 75;
/** Số điểm mạnh / điểm cần củng cố tối đa đưa ra (6.56, 6.57). */
export const MAX_EXPLANATION_ITEMS = 5;

/* ------------------------------------------------------------------ */
/* Danh mục yếu tố — PART 5.8, 5.11, 5.14, 5.17, 5.18, 5.20, 5.24      */
/* ------------------------------------------------------------------ */

function def(
  id: FactorId,
  group: GroupCode,
  label: string,
  description: string
): FactorDefinition {
  return { id, group, label, description };
}

export const FACTORS: FactorDefinition[] = [
  // ---- Academic (5.8) ----
  def("academic.math", "ACADEMIC", "Toán", "Nền tảng toán học của chương trình."),
  def("academic.literature", "ACADEMIC", "Ngữ văn", "Đọc hiểu và diễn đạt bằng tiếng Việt."),
  def("academic.english", "ACADEMIC", "Tiếng Anh", "Năng lực tiếng Anh học thuật và chuyên ngành."),
  def("academic.physics", "ACADEMIC", "Vật lý", "Nền tảng vật lý."),
  def("academic.chemistry", "ACADEMIC", "Hoá học", "Nền tảng hoá học."),
  def("academic.biology", "ACADEMIC", "Sinh học", "Nền tảng sinh học."),
  def("academic.history", "ACADEMIC", "Lịch sử", "Nền tảng lịch sử."),
  def("academic.geography", "ACADEMIC", "Địa lý", "Nền tảng địa lý."),
  def("academic.informatics", "ACADEMIC", "Tin học", "Nền tảng tin học và lập trình phổ thông."),
  def("academic.technology", "ACADEMIC", "Công nghệ", "Nền tảng công nghệ, kỹ thuật phổ thông."),

  // ---- Interest (5.11) ----
  def("interest.technology", "INTEREST", "Công nghệ", "Quan tâm tới công nghệ nói chung."),
  def("interest.machines", "INTEREST", "Máy móc", "Quan tâm tới máy móc, cơ khí."),
  def("interest.electronics", "INTEREST", "Điện tử", "Quan tâm tới mạch, thiết bị điện tử."),
  def("interest.programming", "INTEREST", "Lập trình", "Quan tâm tới viết phần mềm."),
  def("interest.data", "INTEREST", "Dữ liệu", "Quan tâm tới số liệu, thống kê, phân tích."),
  def("interest.ai", "INTEREST", "Trí tuệ nhân tạo", "Quan tâm tới AI và học máy."),
  def("interest.design", "INTEREST", "Thiết kế", "Quan tâm tới thiết kế, mỹ thuật ứng dụng."),
  def("interest.architecture", "INTEREST", "Kiến trúc", "Quan tâm tới kiến trúc, quy hoạch."),
  def("interest.business", "INTEREST", "Kinh doanh", "Quan tâm tới kinh doanh, quản trị."),
  def("interest.finance", "INTEREST", "Tài chính", "Quan tâm tới tài chính, ngân hàng, kế toán."),
  def("interest.marketing", "INTEREST", "Marketing", "Quan tâm tới tiếp thị, thương hiệu."),
  def("interest.communication", "INTEREST", "Truyền thông", "Quan tâm tới truyền thông, báo chí."),
  def("interest.language", "INTEREST", "Ngôn ngữ", "Quan tâm tới ngoại ngữ, ngôn ngữ học."),
  def("interest.education", "INTEREST", "Giáo dục", "Quan tâm tới dạy học, đào tạo."),
  def("interest.healthcare", "INTEREST", "Chăm sóc sức khoẻ", "Quan tâm tới y tế, chăm sóc con người."),
  def("interest.research", "INTEREST", "Nghiên cứu", "Quan tâm tới tìm tòi, khảo cứu."),
  def("interest.science", "INTEREST", "Khoa học", "Quan tâm tới khoa học tự nhiên."),
  def("interest.people", "INTEREST", "Con người", "Quan tâm tới làm việc trực tiếp với con người."),
  def("interest.environment", "INTEREST", "Môi trường", "Quan tâm tới môi trường, sinh thái."),
  def("interest.agriculture", "INTEREST", "Nông nghiệp", "Quan tâm tới nông – lâm – ngư nghiệp."),
  def("interest.arts", "INTEREST", "Nghệ thuật", "Quan tâm tới nghệ thuật, biểu diễn."),
  def("interest.construction", "INTEREST", "Xây dựng", "Quan tâm tới xây dựng, công trình."),

  // ---- Ability (5.14) ----
  def("ability.analytical", "ABILITY", "Phân tích", "Tách vấn đề thành phần và nhìn ra quan hệ."),
  def("ability.logical", "ABILITY", "Suy luận logic", "Lần theo chuỗi lập luận, phát hiện mâu thuẫn."),
  def("ability.numerical", "ABILITY", "Làm việc với con số", "Tính toán, ước lượng, đọc số liệu."),
  def("ability.verbal", "ABILITY", "Ngôn ngữ", "Đọc hiểu, viết, trình bày bằng lời."),
  def("ability.spatial", "ABILITY", "Tư duy không gian", "Hình dung hình khối, bố cục, bản vẽ."),
  def("ability.technical", "ABILITY", "Kỹ thuật", "Thao tác với công cụ, thiết bị, hệ thống."),
  def("ability.creativity", "ABILITY", "Sáng tạo", "Tạo ra phương án mới thay vì lặp lại phương án cũ."),
  def("ability.communication", "ABILITY", "Giao tiếp", "Truyền đạt và tiếp nhận thông tin với người khác."),
  def("ability.teamwork", "ABILITY", "Làm việc nhóm", "Phối hợp với người khác để hoàn thành việc chung."),
  def("ability.problem_solving", "ABILITY", "Giải quyết vấn đề", "Đi từ tình huống rối tới phương án dùng được."),
  def("ability.research", "ABILITY", "Nghiên cứu", "Đặt câu hỏi, tìm dữ liệu, kiểm chứng."),
  def("ability.organization", "ABILITY", "Tổ chức", "Sắp xếp công việc, thời gian, tài liệu."),
  def("ability.leadership", "ABILITY", "Dẫn dắt", "Định hướng và điều phối người khác."),
  def("ability.independent_work", "ABILITY", "Làm việc độc lập", "Tự đặt việc và tự hoàn thành mà không cần ai giao."),

  // ---- Thinking, nhập vào nhóm Ability theo 6.4 (5.17) ----
  def("thinking.analytical", "ABILITY", "Lối nghĩ phân tích", "Thiên về mổ xẻ và hệ thống hoá."),
  def("thinking.logical", "ABILITY", "Lối nghĩ logic", "Thiên về quy tắc và suy diễn."),
  def("thinking.creative", "ABILITY", "Lối nghĩ sáng tạo", "Thiên về liên tưởng và phương án mới."),
  def("thinking.experimental", "ABILITY", "Lối nghĩ thực nghiệm", "Thiên về thử nghiệm và quan sát kết quả."),
  def("thinking.research", "ABILITY", "Lối nghĩ nghiên cứu", "Thiên về truy nguyên và kiểm chứng."),
  def("thinking.practical", "ABILITY", "Lối nghĩ thực tế", "Thiên về cái dùng được ngay."),

  // ---- Work Style (5.18) ----
  def("work_style.independent", "WORK_STYLE", "Làm việc độc lập", "Đặc trưng công việc tự chủ, ít phụ thuộc."),
  def("work_style.teamwork", "WORK_STYLE", "Làm việc nhóm", "Đặc trưng công việc phối hợp thường xuyên."),
  def("work_style.leadership", "WORK_STYLE", "Dẫn dắt", "Đặc trưng công việc điều phối người khác."),
  def("work_style.flexibility", "WORK_STYLE", "Linh hoạt", "Đặc trưng công việc thay đổi cách làm theo tình huống."),
  def("work_style.structure", "WORK_STYLE", "Quy trình", "Đặc trưng công việc theo quy trình rõ ràng."),
  def("work_style.autonomy", "WORK_STYLE", "Tự quyết", "Đặc trưng công việc được tự chọn cách làm."),
  def("work_style.deep_work", "WORK_STYLE", "Tập trung sâu", "Đặc trưng công việc cần khối thời gian liền mạch."),
  def("work_style.social_interaction", "WORK_STYLE", "Tương tác xã hội", "Đặc trưng công việc tiếp xúc nhiều người."),
  def("work_style.specialization", "WORK_STYLE", "Chuyên sâu", "Đặc trưng công việc đào sâu một mảng hẹp."),
  def("work_style.multitasking", "WORK_STYLE", "Đa nhiệm", "Đặc trưng công việc xử lý nhiều việc song song."),
  def("work_style.change_orientation", "WORK_STYLE", "Thích ứng thay đổi", "Đặc trưng công việc biến động thường xuyên."),
  def("work_style.challenge_orientation", "WORK_STYLE", "Hướng thử thách", "Đặc trưng công việc nhiều thử thách mới."),

  // ---- Career Value (5.20) ----
  def("career_value.income", "CAREER_VALUE", "Thu nhập", "Mức coi trọng thu nhập."),
  def("career_value.stability", "CAREER_VALUE", "Ổn định", "Mức coi trọng sự ổn định lâu dài."),
  def("career_value.promotion", "CAREER_VALUE", "Thăng tiến", "Mức coi trọng lộ trình thăng tiến."),
  def("career_value.creativity", "CAREER_VALUE", "Sáng tạo", "Mức coi trọng được tạo ra cái mới."),
  def("career_value.freedom", "CAREER_VALUE", "Tự do", "Mức coi trọng sự tự do trong công việc."),
  def("career_value.international", "CAREER_VALUE", "Môi trường quốc tế", "Mức coi trọng cơ hội làm việc quốc tế."),
  def("career_value.technology", "CAREER_VALUE", "Công nghệ", "Mức coi trọng được làm với công nghệ."),
  def("career_value.social_impact", "CAREER_VALUE", "Đóng góp xã hội", "Mức coi trọng ích lợi cho cộng đồng."),
  def("career_value.people", "CAREER_VALUE", "Làm việc với con người", "Mức coi trọng tiếp xúc con người."),
  def("career_value.achievement", "CAREER_VALUE", "Thành tựu", "Mức coi trọng kết quả và thành tích."),
  def("career_value.work_life_balance", "CAREER_VALUE", "Cân bằng cuộc sống", "Mức coi trọng cân bằng công việc – đời sống."),
  def("career_value.autonomy", "CAREER_VALUE", "Tự chủ", "Mức coi trọng được tự quyết."),
  def("career_value.entrepreneurship", "CAREER_VALUE", "Khởi nghiệp", "Mức coi trọng tự gây dựng sự nghiệp riêng."),
  def("career_value.research", "CAREER_VALUE", "Nghiên cứu", "Mức coi trọng công việc nghiên cứu."),

  // ---- Environment (5.24) ----
  def("environment.office", "ENVIRONMENT", "Văn phòng", "Làm việc trong văn phòng."),
  def("environment.lab", "ENVIRONMENT", "Phòng thí nghiệm", "Làm việc trong phòng thí nghiệm."),
  def("environment.factory", "ENVIRONMENT", "Nhà máy", "Làm việc trong nhà máy, xưởng sản xuất."),
  def("environment.studio", "ENVIRONMENT", "Studio", "Làm việc trong studio sáng tạo."),
  def("environment.school", "ENVIRONMENT", "Trường học", "Làm việc trong môi trường giáo dục."),
  def("environment.hospital", "ENVIRONMENT", "Bệnh viện", "Làm việc trong cơ sở y tế."),
  def("environment.construction_site", "ENVIRONMENT", "Công trường", "Làm việc tại công trường."),
  def("environment.outdoor", "ENVIRONMENT", "Ngoài trời", "Làm việc ngoài trời."),
  def("environment.remote", "ENVIRONMENT", "Từ xa", "Làm việc từ xa."),
  def("environment.hybrid", "ENVIRONMENT", "Kết hợp", "Làm việc kết hợp tại chỗ và từ xa."),
  def("environment.startup", "ENVIRONMENT", "Khởi nghiệp", "Làm việc trong môi trường startup."),
  def("environment.research_center", "ENVIRONMENT", "Trung tâm nghiên cứu", "Làm việc tại viện, trung tâm nghiên cứu."),
];

/* ------------------------------------------------------------------ */
/* Tra cứu                                                             */
/* ------------------------------------------------------------------ */

export const FACTOR_BY_ID: ReadonlyMap<FactorId, FactorDefinition> = new Map(
  FACTORS.map((f) => [f.id, f])
);

export function factorsOfGroup(group: GroupCode): FactorDefinition[] {
  return FACTORS.filter((f) => f.group === group);
}

export function groupOfFactor(id: FactorId): GroupCode | null {
  return FACTOR_BY_ID.get(id)?.group ?? null;
}

export function labelOfFactor(id: FactorId): string {
  return FACTOR_BY_ID.get(id)?.label ?? id;
}

/* ------------------------------------------------------------------ */
/* Tự kiểm tra cấu hình — PART 6.97                                    */
/* ------------------------------------------------------------------ */

/**
 * Soát cấu hình, trả về danh sách lỗi. Rỗng nghĩa là hợp lệ.
 *
 * Có hàm này vì lỗi cấu hình không làm chương trình sập — nó chỉ làm điểm
 * lệch đi trong im lặng. Tổng trọng số 99 thay vì 100 là đủ để mọi kết quả
 * sai mà không có dòng lỗi nào. Tài liệu yêu cầu reject cấu hình như vậy.
 */
export function validateConfig(): string[] {
  const errors: string[] = [];

  // Soát MỌI bộ trọng số đã khai, không chỉ bộ đang dùng — bộ cũ vẫn phải
  // tính lại được đúng cho những kết quả đã sinh ra bằng nó.
  for (const [name, table] of [
    ["đang dùng", GROUP_WEIGHTS],
    ["v1 (tài liệu)", WEIGHTS_V1_SPEC],
    ["v2 (theo bằng chứng)", WEIGHTS_V2_EVIDENCE],
  ] as const) {
    const sum = Object.values(table).reduce((s, w) => s + w, 0);
    if (Math.abs(sum - 1) > 1e-9) {
      errors.push(`Tổng trọng số nhóm bộ ${name} phải bằng 1, hiện là ${sum}`);
    }
  }

  if (MIN_RIASEC_DIFFERENTIATION <= 0 || MIN_RIASEC_DIFFERENTIATION >= 50) {
    errors.push("Ngưỡng phân hoá RIASEC phải nằm trong khoảng (0, 50)");
  }

  for (const g of GROUP_ORDER) {
    if (!(g in GROUP_WEIGHTS)) errors.push(`Thiếu trọng số cho nhóm ${g}`);
    if (GROUP_WEIGHTS[g] <= 0) errors.push(`Nhóm ${g} có trọng số không dương`);
    if (!(g in MIN_GROUP_COMPLETENESS)) {
      errors.push(`Thiếu ngưỡng đầy đủ dữ liệu cho nhóm ${g}`);
    }
  }

  const ids = new Set<string>();
  for (const f of FACTORS) {
    if (ids.has(f.id)) errors.push(`Yếu tố bị trùng mã: ${f.id}`);
    ids.add(f.id);
    if (!GROUP_ORDER.includes(f.group)) {
      errors.push(`Yếu tố ${f.id} thuộc nhóm không tồn tại: ${f.group}`);
    }
  }

  // RIASEC chấm bằng cosine trên vector sáu chiều nên không cần yếu tố nào.
  // Mọi nhóm còn lại mà rỗng thì trọng số của nó rơi vào hư không.
  for (const g of GROUP_ORDER) {
    if (g !== "RIASEC" && factorsOfGroup(g).length === 0) {
      errors.push(`Nhóm ${g} chưa có yếu tố nào`);
    }
  }

  if (MAXIMUM_TOTAL_PENALTY <= 0 || MAXIMUM_TOTAL_PENALTY >= 1) {
    errors.push("Trần phạt phải nằm trong khoảng (0, 1)");
  }
  for (const [sev, p] of Object.entries(SOFT_GATE_PENALTY)) {
    if (p < 0 || p > MAXIMUM_TOTAL_PENALTY) {
      errors.push(`Mức phạt ${sev} = ${p} vượt trần phạt tổng`);
    }
  }

  const cw = Object.values(CONFIDENCE_WEIGHTS).reduce((s, w) => s + w, 0);
  if (Math.abs(cw - 1) > 1e-9) {
    errors.push(`Tổng trọng số của công thức confidence phải bằng 1, hiện là ${cw}`);
  }

  for (const g of CONFIDENCE_WEIGHTED_GROUPS) {
    if (!GROUP_ORDER.includes(g)) errors.push(`Nhóm nhân confidence không tồn tại: ${g}`);
  }

  return errors;
}

/** Mã yếu tố lạ — PART 6.84 INVALID_FACTOR. */
export function unknownFactorIds(ids: Iterable<string>): string[] {
  const out: string[] = [];
  for (const id of ids) if (!FACTOR_BY_ID.has(id)) out.push(id);
  return out;
}
