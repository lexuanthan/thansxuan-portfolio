/**
 * BỘ CÂU HỎI KHẢO SÁT — PART 2.
 *
 * 62 câu, 9 màn hình. File này chỉ KHAI BÁO, không tính toán gì:
 * mọi việc quy đổi và suy diễn nằm ở derivation.ts và profile.ts.
 *
 * Quy ước quan trọng (Rule S01): đây KHÔNG phải trắc nghiệm tính cách. Không
 * chỗ nào được dùng chữ MBTI, "kiểu tính cách của bạn", hay "bạn thuộc nhóm
 * X". Cái ta dựng là *hồ sơ xu hướng học tập và nghề nghiệp*, đo tại một thời
 * điểm, do chính học sinh khai.
 */

/* ------------------------------------------------------------------ */
/* Kiểu câu hỏi — PART 2.3                                             */
/* ------------------------------------------------------------------ */

export const QUESTION_TYPES = [
  "single_choice",
  "multiple_choice",
  "single_choice_with_other",
  "searchable_select",
  "multi_select",
  "rank_5",
  "likert_1_5",
  "matrix_likert_1_5",
  "slider",
  "slider_matrix",
  "numeric",
  "numeric_range",
  "subject_score_matrix",
  "certificate_input",
  "textarea",
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const SCREENS = [
  { code: "S01", title: "Bạn là ai?" },
  { code: "S02", title: "Bạn học như thế nào?" },
  { code: "S03", title: "Bạn thích gì?" },
  { code: "S04", title: "Bạn làm tốt điều gì?" },
  { code: "S05", title: "Bạn suy nghĩ & làm việc thế nào?" },
  { code: "S06", title: "Điều gì quan trọng với bạn?" },
  { code: "S07", title: "Bạn hình dung tương lai thế nào?" },
  { code: "S08", title: "Bạn muốn môi trường đại học ra sao?" },
  { code: "S09", title: "Điều kiện thực tế" },
] as const;
export type ScreenCode = (typeof SCREENS)[number]["code"];

export type Question = {
  code: string;
  screen: ScreenCode;
  /** Khoá biến thô. Mọi biến suy diễn phải truy ngược được về đây (BR-S06). */
  variableKey: string;
  type: QuestionType;
  text: string;
  /** Nhãn lựa chọn. Mã lựa chọn sinh từ chỉ số, xem `optionCode`. */
  options?: readonly string[];
  /** Chiều của câu ma trận: mỗi chiều là một biến thô riêng. */
  dimensions?: readonly string[];
  /** Số lựa chọn tối đa. */
  max?: number;
  /** Khoảng hợp lệ cho câu numeric. */
  range?: { min: number; max: number };
  /** Câu này có cần cho Matching Engine không (PART 2.11). */
  requiredForMatching: boolean;
  /** Nhóm hồ sơ chính — PART 2.9. */
  profileGroup: string;
};

/** Mã lựa chọn ổn định, không đổi khi sửa nhãn tiếng Việt. */
export function optionCode(questionCode: string, index: number): string {
  return `${questionCode}_O${String(index + 1).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Danh sách dùng lại nhiều lần                                        */
/* ------------------------------------------------------------------ */

export const SUBJECTS = [
  "math",
  "literature",
  "english",
  "physics",
  "chemistry",
  "biology",
  "history",
  "geography",
  "informatics",
  "technology",
] as const;
export type SubjectKey = (typeof SUBJECTS)[number];

export const SUBJECT_LABEL: Record<SubjectKey, string> = {
  math: "Toán",
  literature: "Ngữ văn",
  english: "Tiếng Anh",
  physics: "Vật lý",
  chemistry: "Hoá học",
  biology: "Sinh học",
  history: "Lịch sử",
  geography: "Địa lý",
  informatics: "Tin học",
  technology: "Công nghệ",
};

/** 22 lĩnh vực quan tâm — PART 2.5 Q15, trùng taxonomy Interest ở PART 5.11. */
export const INTEREST_DOMAINS = [
  "technology",
  "machines",
  "electronics",
  "programming",
  "data",
  "ai",
  "design",
  "architecture",
  "business",
  "finance",
  "marketing",
  "communication",
  "language",
  "education",
  "healthcare",
  "research",
  "science",
  "people",
  "environment",
  "agriculture",
  "arts",
  "construction",
] as const;

export const INTEREST_LABEL: Record<string, string> = {
  technology: "Công nghệ",
  machines: "Máy móc",
  electronics: "Điện – điện tử",
  programming: "Lập trình",
  data: "Dữ liệu",
  ai: "Trí tuệ nhân tạo",
  design: "Thiết kế",
  architecture: "Kiến trúc",
  business: "Kinh doanh",
  finance: "Tài chính",
  marketing: "Marketing",
  communication: "Truyền thông",
  language: "Ngôn ngữ",
  education: "Giáo dục",
  healthcare: "Y tế",
  research: "Nghiên cứu",
  science: "Khoa học",
  people: "Con người – xã hội",
  environment: "Môi trường",
  agriculture: "Nông nghiệp",
  arts: "Nghệ thuật",
  construction: "Xây dựng",
};

export const CAREER_ENVIRONMENTS = [
  "office",
  "lab",
  "factory",
  "studio",
  "school",
  "hospital",
  "construction_site",
  "outdoor",
  "remote",
  "hybrid",
  "startup",
  "research_center",
] as const;

export const CAREER_VALUES = [
  "income",
  "stability",
  "promotion",
  "creativity",
  "freedom",
  "international",
  "technology",
  "social_impact",
  "people",
  "achievement",
  "work_life_balance",
  "autonomy",
  "entrepreneurship",
  "research",
] as const;


/* ------------------------------------------------------------------ */
/* Nhãn tiếng Việt cho từng dòng của câu ma trận                       */
/* ------------------------------------------------------------------ */

/**
 * Các câu ma trận dùng khoá tiếng Anh làm mã biến cho gọn và ổn định, nhưng
 * học sinh phải đọc được bằng tiếng Việt. Tách bảng nhãn ra đây để đổi cách
 * diễn đạt không phải đụng vào mã biến — đổi mã biến là mất dữ liệu cũ.
 */
export const DIMENSION_LABELS: Record<string, Record<string, string>> = {
  Q11: {
    resource_seeking: "Tôi thường tự tìm tài liệu khi chưa hiểu.",
    self_learning: "Tôi có thể tự học mà không cần người khác nhắc.",
    persistence: "Tôi kiên trì với một vấn đề khó.",
    problem_solving_learning: "Tôi thường tìm nhiều cách khác nhau để giải quyết một bài toán.",
    help_seeking: "Khi không hiểu, tôi chủ động hỏi người khác.",
    deep_focus: "Tôi có thể tập trung trong thời gian dài.",
    study_discipline: "Tôi thường hoàn thành việc học đúng kế hoạch.",
  },
  Q15: INTEREST_LABEL,
  Q20: {
    change_orientation: "Làm việc ổn định  ←→  Thích thay đổi",
    social_interaction: "Làm việc một mình  ←→  Làm việc với nhiều người",
    practice_orientation: "Lý thuyết  ←→  Thực hành",
    autonomy_orientation: "Làm theo quy trình  ←→  Tự do tìm cách làm",
    specialization_orientation: "Làm nhiều loại việc  ←→  Chuyên sâu một lĩnh vực",
    challenge_orientation: "An toàn, ổn định  ←→  Thử thách, rủi ro",
  },
  Q37: {
    challenge_orientation: "Ổn định  ←→  Thử thách",
    multitasking_orientation: "Chuyên môn sâu  ←→  Đa nhiệm",
    autonomy_orientation: "Quy trình  ←→  Tự chủ",
    change_orientation: "Ít thay đổi  ←→  Nhiều thay đổi",
  },
  Q42: {
    creativity: "Được sáng tạo",
    autonomy: "Được tự chủ",
    freedom: "Được tự do",
    entrepreneurship: "Được khởi nghiệp",
  },
  Q43: {
    international: "Môi trường quốc tế",
    technology: "Được làm với công nghệ",
    career_growth: "Cơ hội phát triển nghề nghiệp",
  },
};

/** Nhãn của một dòng trong câu ma trận; không có thì trả lại chính mã đó. */
export function dimensionLabel(questionCode: string, dimension: string): string {
  return DIMENSION_LABELS[questionCode]?.[dimension] ?? dimension;
}

/** Nhãn hai đầu của thanh trượt đơn. */
export const SLIDER_ENDS: Record<string, [string, string]> = {
  Q35: ["Rất linh hoạt", "Rất có quy trình"],
  Q36: ["Chủ yếu làm một mình", "Thường xuyên với người khác"],
  Q52: ["Thiên về lý thuyết", "Thiên về thực hành"],
};

/** Năm mức của thang Likert — PART 2.4. */
export const LIKERT_LABELS = [
  "Hoàn toàn không đúng với tôi",
  "Ít đúng với tôi",
  "Khá đúng với tôi",
  "Đúng với tôi",
  "Rất đúng với tôi",
] as const;

/* ------------------------------------------------------------------ */
/* 62 câu hỏi                                                          */
/* ------------------------------------------------------------------ */

function q(
  code: string,
  screen: ScreenCode,
  variableKey: string,
  type: QuestionType,
  text: string,
  profileGroup: string,
  extra: Partial<Question> = {}
): Question {
  return { code, screen, variableKey, type, text, profileGroup, requiredForMatching: false, ...extra };
}

export const QUESTIONS: Question[] = [
  /* ---------- S01 — Bạn là ai? ---------- */
  q("Q01", "S01", "grade_level", "single_choice", "Bạn đang học lớp nào?", "Personal", {
    options: ["10", "11", "12", "Đã tốt nghiệp THPT", "Khác"],
  }),
  q("Q02", "S01", "graduation_year", "numeric", "Bạn dự kiến tốt nghiệp THPT vào năm nào?", "Personal", {
    range: { min: 2020, max: 2040 },
  }),
  q("Q03", "S01", "current_province", "single_choice", "Bạn đang học tập tại tỉnh/thành phố nào?", "Location"),
  q("Q04", "S01", "high_school", "searchable_select", "Bạn đang học tại trường THPT nào?", "Personal"),
  q("Q05", "S01", "career_awareness_level", "single_choice", "Hiện tại bạn đã hình dung khá rõ mình muốn theo hướng nào chưa?", "Career Awareness", {
    options: [
      "Chưa biết mình thích gì",
      "Có một vài lĩnh vực quan tâm",
      "Đã có một số ngành đang cân nhắc",
      "Khá rõ ngành mình muốn học",
      "Đã có định hướng ngành/nghề tương đối rõ",
    ],
  }),
  q("Q06", "S01", "decision_influencers", "multiple_choice", "Những ai hoặc điều gì ảnh hưởng nhiều nhất đến quyết định chọn ngành của bạn?", "Decision Context", {
    options: [
      "Bản thân tôi", "Cha/mẹ", "Anh/chị/người thân", "Thầy cô", "Bạn bè",
      "Người đang làm trong nghề", "Thông tin trên Internet", "Mạng xã hội",
      "Kết quả học tập", "Điểm chuẩn tuyển sinh", "Thu nhập nghề nghiệp",
      "Cơ hội việc làm", "Khác",
    ],
  }),

  /* ---------- S02 — Bạn học như thế nào? ---------- */
  q("Q07", "S02", "subject_scores", "subject_score_matrix", "Điểm hiện tại của bạn ở các môn sau là bao nhiêu?", "Academic", {
    dimensions: SUBJECTS,
    range: { min: 0, max: 10 },
    requiredForMatching: true,
  }),
  q("Q08", "S02", "improving_subjects", "multiple_choice", "Những môn nào bạn muốn cải thiện trong thời gian tới?", "Development", {
    options: SUBJECTS.map((s) => SUBJECT_LABEL[s]),
    max: 5,
  }),
  q("Q09", "S02", "weak_subjects", "multiple_choice", "Những môn nào hiện tại bạn cảm thấy mình gặp nhiều khó khăn nhất?", "Academic Gap", {
    options: SUBJECTS.map((s) => SUBJECT_LABEL[s]),
    max: 3,
  }),
  q("Q10", "S02", "learning_preference", "single_choice", "Khi học một kiến thức mới, cách nào thường phù hợp với bạn nhất?", "Learning", {
    options: [
      "Học qua ví dụ thực tế", "Học qua video/hình ảnh", "Đọc tài liệu", "Nghe giảng",
      "Tự tìm hiểu", "Thực hành trực tiếp", "Làm bài tập", "Thảo luận với người khác",
      "Kết hợp nhiều cách",
    ],
  }),
  q("Q11", "S02", "learning_behavior_profile", "matrix_likert_1_5", "Hãy đánh giá mức độ đúng với bạn", "Learning", {
    dimensions: [
      "resource_seeking", "self_learning", "persistence", "problem_solving_learning",
      "help_seeking", "deep_focus", "study_discipline",
    ],
    requiredForMatching: true,
  }),
  q("Q12", "S02", "self_learning_confidence", "likert_1_5", "Bạn tự tin đến mức nào về khả năng tự học?", "Learning"),

  /* ---------- S03 — Bạn thích gì? ---------- */
  q("Q13", "S03", "perceived_strengths", "multiple_choice", "Những điều bạn cảm thấy mình có thế mạnh nhất là gì?", "Ability", {
    options: [
      "Tư duy logic", "Tính toán", "Phân tích dữ liệu", "Lập trình", "Máy móc/kỹ thuật",
      "Thiết kế", "Vẽ", "Viết", "Ngôn ngữ", "Giao tiếp", "Thuyết trình", "Làm việc nhóm",
      "Lãnh đạo", "Tổ chức", "Nghiên cứu", "Sáng tạo", "Kinh doanh", "Giải quyết vấn đề",
      "Giúp đỡ người khác",
    ],
    max: 3,
  }),
  q("Q14", "S03", "interest_domains", "multi_select", "Bạn quan tâm đến những lĩnh vực nào?", "Interest", {
    options: INTEREST_DOMAINS.map((d) => INTEREST_LABEL[d]),
  }),
  q("Q15", "S03", "interest_ratings", "matrix_likert_1_5", "Mức độ bạn hứng thú với các lĩnh vực sau?", "Interest", {
    dimensions: INTEREST_DOMAINS,
    requiredForMatching: true,
  }),
  q("Q16", "S03", "preferred_activities", "multiple_choice", "Những hoạt động nào bạn cảm thấy muốn làm hoặc thường thích làm?", "Interest", {
    options: [
      "Lập trình", "Thiết kế", "Vẽ", "Viết", "Làm video", "Chụp ảnh", "Nghiên cứu",
      "Làm thí nghiệm", "Lắp ráp/sửa chữa máy móc", "Kinh doanh", "Bán hàng",
      "Thuyết trình", "Tổ chức sự kiện", "Giúp đỡ người khác", "Dạy/hướng dẫn",
      "Phân tích dữ liệu", "Làm dự án", "Hoạt động ngoài trời", "Chơi game",
      "Sáng tạo nội dung", "Làm việc với thiết bị công nghệ",
    ],
  }),
  q("Q17", "S03", "preferred_project", "single_choice", "Nếu được chọn một dự án kéo dài khoảng một tháng, bạn muốn làm dự án nào nhất?", "Interest", {
    options: [
      "Xây dựng một ứng dụng", "Lập trình robot", "Thiết kế sản phẩm", "Thiết kế không gian",
      "Làm một chiến dịch truyền thông", "Xây dựng một mô hình kinh doanh",
      "Phân tích một bộ dữ liệu", "Thực hiện một nghiên cứu/thí nghiệm",
      "Tổ chức một hoạt động cộng đồng", "Tạo nội dung/video",
      "Xây dựng một sản phẩm thủ công", "Khám phá một vấn đề về môi trường",
    ],
  }),
  q("Q18", "S03", "preferred_creation", "single_choice", "Nếu được tự tạo ra một sản phẩm, bạn muốn tạo gì?", "Interest", {
    options: [
      "Phần mềm/app", "AI/data product", "Thiết bị điện tử", "Robot", "Máy móc",
      "Sản phẩm công nghiệp", "Sản phẩm thiết kế", "Không gian/kiến trúc",
      "Nội dung truyền thông", "Thương hiệu/sản phẩm kinh doanh", "Sản phẩm giáo dục",
      "Giải pháp y tế", "Giải pháp môi trường", "Nghiên cứu khoa học", "Khác",
    ],
  }),
  q("Q19", "S03", "preferred_problem_type", "single_choice", "Bạn thích giải quyết loại vấn đề nào nhất?", "Thinking", {
    options: [
      "Vấn đề logic", "Vấn đề số liệu", "Vấn đề kỹ thuật", "Vấn đề sáng tạo",
      "Vấn đề về con người", "Vấn đề kinh doanh", "Vấn đề tổ chức", "Vấn đề xã hội",
      "Vấn đề khoa học", "Vấn đề ngôn ngữ", "Vấn đề thiết kế",
      "Vấn đề thực tế cần giải pháp nhanh",
    ],
  }),

  /* ---------- S04 — Bạn làm tốt điều gì? ---------- */
  q("Q20", "S04", "work_preference_sliders", "slider_matrix", "Bạn nghiêng về cách làm việc nào hơn?", "Work Style", {
    dimensions: [
      "change_orientation", "social_interaction", "practice_orientation",
      "autonomy_orientation", "specialization_orientation", "challenge_orientation",
    ],
    requiredForMatching: true,
  }),
  q("Q21", "S04", "negative_preferences", "multiple_choice", "Những điều nào bạn không thích trong học tập hoặc công việc?", "Preference", {
    options: [
      "Lặp lại một việc quá lâu", "Ngồi trước máy tính quá nhiều", "Làm việc với số liệu",
      "Làm việc với máy móc", "Giao tiếp với quá nhiều người", "Thuyết trình",
      "Làm việc nhóm", "Làm việc một mình", "Áp lực doanh số", "Cạnh tranh cao",
      "Môi trường quá cứng nhắc", "Môi trường quá thiếu ổn định", "Công việc ít sáng tạo",
      "Công việc ít giao tiếp", "Công việc đòi hỏi di chuyển nhiều", "Làm việc ngoài trời",
      "Làm việc trong phòng thí nghiệm", "Làm việc với bệnh nhân", "Làm việc với trẻ em",
    ],
  }),
  q("Q22", "S04", "problem_solving_behavior", "single_choice", "Khi gặp một vấn đề khó, bạn thường làm gì trước?", "Problem Solving", {
    options: [
      "Tự phân tích vấn đề", "Tìm ví dụ tương tự", "Tìm thông tin trên Internet",
      "Hỏi người có kinh nghiệm", "Thử nhiều cách", "Chia vấn đề thành các phần nhỏ",
      "Chờ hướng dẫn", "Tạm bỏ qua rồi quay lại sau",
    ],
  }),
  q("Q23", "S04", "logical_reasoning", "likert_1_5", "Bạn đánh giá khả năng tư duy logic của mình như thế nào?", "Ability", { requiredForMatching: true }),
  q("Q24", "S04", "analytical_ability", "likert_1_5", "Bạn đánh giá khả năng phân tích và xử lý thông tin của mình như thế nào?", "Ability", { requiredForMatching: true }),
  q("Q25", "S04", "creativity", "likert_1_5", "Bạn đánh giá khả năng sáng tạo và tạo ra ý tưởng mới?", "Ability", { requiredForMatching: true }),
  q("Q26", "S04", "communication", "likert_1_5", "Bạn đánh giá khả năng giao tiếp và diễn đạt ý tưởng?", "Ability", { requiredForMatching: true }),
  q("Q27", "S04", "teamwork", "likert_1_5", "Bạn đánh giá khả năng làm việc nhóm?", "Ability", { requiredForMatching: true }),
  q("Q28", "S04", "organization", "likert_1_5", "Bạn đánh giá khả năng tổ chức và quản lý công việc?", "Ability", { requiredForMatching: true }),
  q("Q29", "S04", "independent_work", "likert_1_5", "Bạn đánh giá khả năng làm việc độc lập?", "Work Style", { requiredForMatching: true }),

  /* ---------- S05 — Bạn suy nghĩ & làm việc thế nào? ---------- */
  q("Q30", "S05", "ambiguity_response", "single_choice", "Khi được giao một nhiệm vụ chưa có hướng dẫn rõ ràng, bạn thường...", "Work Style", {
    options: ["Tự tìm cách làm", "Tìm ví dụ để tham khảo", "Hỏi người khác", "Chờ hướng dẫn rõ hơn", "Thử một cách rồi điều chỉnh"],
  }),
  q("Q31", "S05", "long_project_behavior", "single_choice", "Khi làm một dự án dài, bạn thường...", "Work Style", {
    options: ["Lập kế hoạch chi tiết từ đầu", "Chia thành từng giai đoạn", "Làm đến đâu điều chỉnh đến đó", "Tập trung hoàn thành từng phần", "Thường dễ mất động lực giữa chừng"],
  }),
  q("Q32", "S05", "team_role", "single_choice", "Khi làm việc nhóm, vai trò bạn thường đảm nhận là...", "Work Style", {
    options: ["Người đưa ý tưởng", "Người phân tích", "Người thực hiện", "Người tổ chức", "Người điều phối", "Người thuyết trình", "Người hỗ trợ", "Tùy dự án"],
  }),
  q("Q33", "S05", "multi_task_behavior", "single_choice", "Khi có nhiều nhiệm vụ cùng lúc, bạn thường...", "Work Style", {
    options: ["Ưu tiên việc quan trọng nhất", "Lập danh sách", "Làm từng việc một", "Làm nhiều việc song song", "Chọn việc dễ làm trước", "Thường cảm thấy quá tải"],
  }),
  q("Q34", "S05", "failure_response", "single_choice", "Khi kết quả không đạt như mong muốn, bạn thường...", "Work Style", {
    options: ["Phân tích nguyên nhân", "Thử lại bằng cách khác", "Tìm người góp ý", "Điều chỉnh mục tiêu", "Tiếp tục làm theo cách cũ", "Dễ mất động lực"],
  }),
  q("Q35", "S05", "structure_preference", "slider", "Bạn thích môi trường làm việc có mức độ quy định như thế nào?", "Work Style", {
    range: { min: 0, max: 100 },
    requiredForMatching: true,
  }),
  q("Q36", "S05", "social_interaction_preference", "slider", "Bạn thích mức độ tương tác với người khác trong công việc như thế nào?", "Work Style", {
    range: { min: 0, max: 100 },
    requiredForMatching: true,
  }),
  q("Q37", "S05", "work_mode_preference", "slider_matrix", "Bạn thích công việc theo hướng nào?", "Work Style", {
    dimensions: ["challenge_orientation", "multitasking_orientation", "autonomy_orientation", "change_orientation"],
    requiredForMatching: true,
  }),

  /* ---------- S06 — Điều gì quan trọng với bạn? ---------- */
  q("Q38", "S06", "career_values_candidates", "multiple_choice", "Trong công việc tương lai, điều gì quan trọng đối với bạn?", "Career Values", {
    options: [
      "Thu nhập cao", "Ổn định", "Cơ hội thăng tiến", "Sáng tạo", "Tự do",
      "Môi trường quốc tế", "Công nghệ", "Tạo tác động xã hội", "Làm việc với con người",
      "Thành tựu cá nhân", "Cân bằng cuộc sống", "Tự chủ", "Khởi nghiệp", "Nghiên cứu",
    ],
    max: 5,
  }),
  q("Q39", "S06", "career_values_ranked", "rank_5", "Hãy xếp hạng 5 giá trị quan trọng nhất", "Career Values"),
  q("Q40", "S06", "value_income", "likert_1_5", "Thu nhập trong công việc tương lai quan trọng với bạn ở mức nào?", "Career Values", { requiredForMatching: true }),
  q("Q41", "S06", "value_stability", "likert_1_5", "Sự ổn định trong công việc quan trọng với bạn ở mức nào?", "Career Values", { requiredForMatching: true }),
  q("Q42", "S06", "value_creativity_autonomy", "matrix_likert_1_5", "Cơ hội sáng tạo và tự chủ quan trọng với bạn ở mức nào?", "Career Values", {
    dimensions: ["creativity", "autonomy", "freedom", "entrepreneurship"],
    requiredForMatching: true,
  }),
  q("Q43", "S06", "value_global_technology", "matrix_likert_1_5", "Cơ hội phát triển quốc tế/công nghệ quan trọng với bạn ở mức nào?", "Career Values", {
    dimensions: ["international", "technology", "career_growth"],
    requiredForMatching: true,
  }),
  q("Q44", "S06", "value_social_impact", "likert_1_5", "Mức độ bạn muốn công việc tạo ra tác động tích cực cho xã hội?", "Career Values", { requiredForMatching: true }),

  /* ---------- S07 — Bạn hình dung tương lai thế nào? ---------- */
  q("Q45", "S07", "preferred_career_environment", "multiple_choice", "Bạn hình dung công việc tương lai của mình chủ yếu ở môi trường nào?", "Environment", {
    options: [
      "Văn phòng", "Phòng thí nghiệm", "Nhà máy", "Studio", "Trường học", "Bệnh viện",
      "Công trường", "Ngoài trời", "Làm việc từ xa", "Mô hình hybrid",
      "Doanh nghiệp/startup", "Trung tâm nghiên cứu",
    ],
    requiredForMatching: true,
  }),
  q("Q46", "S07", "future_work_orientation", "multi_select", "Bạn muốn công việc tương lai thiên về điều gì?", "Career Goals", {
    options: [
      "Công nghệ", "Nghiên cứu", "Kỹ thuật", "Sáng tạo", "Kinh doanh", "Quản lý",
      "Giao tiếp", "Giúp đỡ người khác", "Phân tích", "Thiết kế", "Giảng dạy", "Lãnh đạo",
    ],
  }),
  q("Q47", "S07", "preferred_work_subject", "single_choice", "Bạn muốn làm việc với đối tượng nào nhiều nhất?", "Career Environment", {
    options: [
      "Máy móc", "Máy tính", "Dữ liệu", "Sản phẩm", "Khách hàng", "Đồng nghiệp",
      "Học sinh/sinh viên", "Bệnh nhân", "Cộng đồng", "Thiên nhiên", "Công trình",
      "Nội dung/thông tin",
    ],
  }),
  q("Q48", "S07", "future_work_style", "single_choice", "Bạn hình dung cách làm việc tương lai như thế nào?", "Career Goals", {
    options: [
      "Làm việc tại một tổ chức ổn định", "Làm việc trong doanh nghiệp tư nhân",
      "Làm việc cho công ty quốc tế", "Làm startup", "Tự kinh doanh", "Làm nghiên cứu",
      "Làm việc tự do/freelance", "Kết hợp nhiều hình thức", "Chưa biết",
    ],
  }),
  q("Q49", "S07", "international_orientation", "likert_1_5", "Bạn có mong muốn làm việc ở môi trường quốc tế không?", "International"),
  q("Q50", "S07", "future_priority", "single_choice", "Nếu phải chọn, bạn ưu tiên điều nào hơn?", "Career Values", {
    options: [
      "Thu nhập cao", "Ổn định", "Tự do", "Cơ hội phát triển", "Được làm điều mình thích",
      "Tạo ảnh hưởng", "Cân bằng cuộc sống", "Chưa xác định",
    ],
  }),

  /* ---------- S08 — Môi trường đại học ---------- */
  q("Q51", "S08", "university_selection_priorities", "rank_5", "Điều gì quan trọng nhất đối với bạn khi chọn trường đại học?", "University", {
    options: [
      "Ngành đào tạo", "Học phí", "Học bổng", "Khoảng cách", "Chất lượng chương trình",
      "Cơ hội việc làm", "Quan hệ doanh nghiệp", "Môi trường học tập", "Hoạt động sinh viên",
      "Quốc tế hóa", "Nghiên cứu", "Cơ sở vật chất", "Danh tiếng",
    ],
  }),
  q("Q52", "S08", "university_practice_orientation", "slider", "Bạn mong muốn mức độ thực hành trong chương trình học như thế nào?", "University", {
    range: { min: 0, max: 100 },
  }),
  q("Q53", "S08", "university_research_interest", "likert_1_5", "Bạn quan tâm đến nghiên cứu khoa học ở mức nào?", "University"),
  q("Q54", "S08", "university_industry_interest", "likert_1_5", "Bạn quan tâm đến cơ hội làm việc với doanh nghiệp trong quá trình học ở mức nào?", "University"),
  q("Q55", "S08", "university_international_interest", "likert_1_5", "Bạn quan tâm đến môi trường quốc tế tại trường ở mức nào?", "University"),
  q("Q56", "S08", "university_activity_preferences", "multiple_choice", "Bạn mong muốn trường đại học có những hoạt động nào?", "University", {
    options: [
      "Câu lạc bộ", "Thể thao", "Văn nghệ", "Tình nguyện", "Khởi nghiệp",
      "Nghiên cứu khoa học", "Cuộc thi học thuật", "Trao đổi quốc tế",
      "Thực tập doanh nghiệp", "Dự án thực tế", "Hoạt động cộng đồng",
    ],
  }),

  /* ---------- S09 — Điều kiện thực tế ---------- */
  q("Q57", "S09", "annual_tuition_budget", "numeric_range", "Ngân sách học phí bạn có thể dự kiến cho một năm là bao nhiêu?", "Financial", {
    options: [
      "< 10 triệu", "10–20 triệu", "20–30 triệu", "30–50 triệu", "50–80 triệu",
      "80–120 triệu", "> 120 triệu", "Chưa xác định",
    ],
  }),
  q("Q58", "S09", "financial_aid_need", "single_choice", "Bạn có cần hỗ trợ tài chính/học bổng để theo học đại học không?", "Financial", {
    options: ["Không cần", "Có thể cần", "Rất cần", "Chưa xác định"],
  }),
  q("Q59", "S09", "expected_thpt_score", "numeric", "Bạn dự kiến đạt khoảng bao nhiêu điểm thi tốt nghiệp THPT?", "Admission", {
    range: { min: 0, max: 30 },
  }),
  q("Q60", "S09", "expected_admission_methods", "multiple_choice", "Bạn dự kiến hoặc muốn sử dụng những phương thức tuyển sinh nào?", "Admission", {
    options: [
      "Điểm thi tốt nghiệp THPT", "Học bạ", "ĐGNL ĐHQG-HCM", "ĐGNL ĐHQG-HN", "SAT",
      "ACT", "IELTS/TOEFL kết hợp", "Chứng chỉ quốc tế", "Tuyển thẳng",
      "Phương thức kết hợp", "Chưa xác định",
    ],
  }),
  q("Q61", "S09", "certificates", "certificate_input", "Bạn hiện có những chứng chỉ nào?", "Admission"),
  q("Q62", "S09", "special_constraints", "multiple_choice", "Bạn có điều kiện hoặc ưu tiên đặc biệt nào cần hệ thống lưu ý?", "Constraints", {
    options: [
      "Cần học gần nhà", "Không muốn đi quá xa", "Cần ký túc xá", "Cần học phí thấp",
      "Cần học bổng", "Muốn học tại TP.HCM", "Muốn học tại Hà Nội",
      "Muốn học tại miền Trung", "Muốn học tại địa phương khác",
      "Muốn chương trình quốc tế", "Muốn chương trình dạy bằng tiếng Anh",
      "Muốn vừa học vừa làm", "Có giới hạn về thời gian di chuyển",
      "Có điều kiện gia đình đặc biệt", "Khác",
    ],
  }),
];

export const SURVEY_VERSION = "survey-1.0.0";

export const QUESTION_BY_CODE: ReadonlyMap<string, Question> = new Map(
  QUESTIONS.map((x) => [x.code, x])
);

export function questionsOfScreen(screen: ScreenCode): Question[] {
  return QUESTIONS.filter((x) => x.screen === screen);
}

/** Những câu Matching Engine cần — PART 2.11. */
export function requiredQuestionCodes(): string[] {
  return QUESTIONS.filter((x) => x.requiredForMatching).map((x) => x.code);
}

/* ------------------------------------------------------------------ */
/* Câu trả lời                                                         */
/* ------------------------------------------------------------------ */

export type MatrixAnswer = Record<string, number | null>;
export type CertificateAnswer = {
  certificateType: string;
  score: number;
  issueDate?: string;
  expiryDate?: string;
  status: "valid" | "expired" | "unknown";
};

export type Answer =
  | number
  | string
  | string[]
  | MatrixAnswer
  | CertificateAnswer[]
  | null;

export const SURVEY_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "ABANDONED",
  "EXPIRED",
] as const;
export type SurveyStatus = (typeof SURVEY_STATUSES)[number];

export type SurveyResponse = {
  responseId: string;
  studentId: string;
  surveyVersion: string;
  status: SurveyStatus;
  /** Khoá là mã câu (Q07), không phải variableKey — để đổi tên biến không mất dữ liệu. */
  answers: Record<string, Answer>;
  startedAt: string;
  completedAt?: string;
};

/* ------------------------------------------------------------------ */
/* Kiểm tra chất lượng trả lời — PART 2.13                             */
/* ------------------------------------------------------------------ */

export type QualityFlag =
  | "STRAIGHT_LINING"
  | "BROAD_INTEREST_PROFILE"
  | "MIXED_PREFERENCES"
  | "SPARSE_RESPONSE";

/**
 * Gắn cờ những kiểu trả lời đáng lưu ý.
 *
 * KHÔNG loại bỏ dữ liệu, không kết luận là lỗi. Một em chọn 3 cho cả bảy dòng
 * có thể là bấm cho xong, cũng có thể là thật sự thấy mình ở giữa. Việc của
 * hàm này là báo để phần diễn giải nói nhẹ tay hơn, không phải để xoá.
 */
export function qualityFlags(response: SurveyResponse): QualityFlag[] {
  const flags: QualityFlag[] = [];

  // Straight-lining: một bảng ma trận mà mọi dòng cùng một giá trị.
  for (const question of QUESTIONS) {
    if (question.type !== "matrix_likert_1_5") continue;
    const ans = response.answers[question.code];
    if (!ans || typeof ans !== "object" || Array.isArray(ans)) continue;
    const values = Object.values(ans as MatrixAnswer).filter((v) => v !== null);
    if (values.length >= 5 && new Set(values).size === 1) {
      flags.push("STRAIGHT_LINING");
      break;
    }
  }

  // Chọn hết mọi lĩnh vực quan tâm: hồ sơ rộng, không phải hồ sơ sai.
  const domains = response.answers.Q14;
  if (Array.isArray(domains) && domains.length >= INTEREST_DOMAINS.length) {
    flags.push("BROAD_INTEREST_PROFILE");
  }

  // Tự nhận làm việc độc lập rất tốt nhưng lại muốn tương tác rất nhiều.
  // Đây là sở thích hỗn hợp, hoàn toàn có thật — chỉ ghi nhận, không sửa.
  const indep = response.answers.Q29;
  const social = response.answers.Q36;
  if (typeof indep === "number" && typeof social === "number") {
    if (indep >= 5 && social >= 85) flags.push("MIXED_PREFERENCES");
  }

  const answered = Object.values(response.answers).filter(
    (v) => v !== null && v !== undefined
  ).length;
  if (answered < QUESTIONS.length * 0.4) flags.push("SPARSE_RESPONSE");

  return flags;
}
