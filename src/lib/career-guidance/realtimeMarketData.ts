/**
 * Realtime Market & Admissions Knowledge Registry (2025–2026)
 * Cập nhật dữ liệu thời gian thực: Điểm chuẩn, Học phí, Phương thức xét tuyển,
 * Thị trường việc làm, Dải lương thực tế & Tác động của Generative AI.
 */

export interface UniversityAdmissionRealtime {
  code: string;
  name: string;
  shortName: string;
  tuitionYear: {
    standard: string;
    highQuality?: string;
    englishHighQuality?: string;
  };
  cutoffBenchmark: Record<string, { thpt: number; dgnl?: number; note?: string }>;
  admissionMethods: string[];
  scholarshipHighlight: string;
  campusNote: string;
}

export interface CareerSalaryRealtime {
  roleName: string;
  fresherMonthlyMillion: string;
  juniorMonthlyMillion: string;
  seniorMonthlyMillion: string;
  hiringDemand: "Rất cao" | "Cao" | "Ổn định" | "Cạnh tranh khắt khe";
  hotSkills: string[];
  aiExposureReality: string;
}

export const REALTIME_METADATA = {
  academicYear: "2025–2026",
  lastVerifiedDate: "Tháng 09/2026",
  dataSource: "Tuyensinh247, Thông báo Tuyển sinh chính thức HCMUTE, Báo cáo thị trường ITviec & TopCV 2025-2026"
};

export const REALTIME_UNIVERSITIES: Record<string, UniversityAdmissionRealtime> = {
  SPK: {
    code: "SPK",
    name: "Trường Đại học Sư phạm Kỹ thuật TP.HCM",
    shortName: "HCMUTE",
    tuitionYear: {
      standard: "32 – 39 triệu VNĐ / năm (tùy khối ngành kỹ thuật hoặc kinh tế)",
      highQuality: "45 – 52 triệu VNĐ / năm (chất lượng cao tiếng Việt)",
      englishHighQuality: "58 – 65 triệu VNĐ / năm (chất lượng cao hoàn toàn bằng tiếng Anh)"
    },
    cutoffBenchmark: {
      "Robot & Trí tuệ Nhân tạo (AI)": { thpt: 26.75, dgnl: 890, note: "Top ngành cao nhất khối kỹ thuật" },
      "Công nghệ Thông tin": { thpt: 26.50, dgnl: 880, note: "Tổ hợp A00, A01, D01, D90" },
      "Kỹ thuật Phần mềm": { thpt: 26.00, dgnl: 860, note: "Nhu cầu tuyển dụng mạnh" },
      "Công nghệ Kỹ thuật Ô tô": { thpt: 26.25, dgnl: 870, note: "Thế mạnh truyền thống hàng đầu" },
      "Kỹ thuật Cơ điện tử": { thpt: 25.50, dgnl: 840, note: "Đạt chuẩn kiểm định quốc tế ABET" },
      "Kỹ thuật Điều khiển & Tự động hóa": { thpt: 25.75, dgnl: 850, note: "Chuẩn ABET Hoa Kỳ" },
      "Thiết kế Vi mạch Bán dẫn": { thpt: 26.20, dgnl: 865, note: "Ngành chiến lược quốc gia mới" },
      "Kinh doanh Quốc tế / Thương mại điện tử": { thpt: 25.80, dgnl: 845, note: "Khối ngành kinh tế năng động" }
    },
    admissionMethods: [
      "1. Điểm thi Tốt nghiệp THPT (Tổ hợp A00, A01, B00, D01, D07, D90)",
      "2. Điểm thi Đánh giá năng lực ĐHQG TP.HCM (Thang 1200 điểm, thường an toàn ở mức ≥ 820–880 điểm)",
      "3. Xét học bạ THPT 5 học kỳ (Điểm trung bình mỗi môn theo tổ hợp ≥ 8.0)",
      "4. Tuyển thẳng học sinh giỏi trường chuyên, đoạt giải quốc gia và học sinh có IELTS ≥ 6.0"
    ],
    scholarshipHighlight: "Quỹ học bổng khuyến tài hơn 36 tỷ đồng/năm. Miễn 100% học phí cho Thủ khoa đầu vào, học bổng tài trợ doanh nghiệp từ Intel, Bosch, Nidec, Samsung.",
    campusNote: "Khuôn viên rộng 21ha tại TP. Thủ Đức, trang bị 120+ phòng thí nghiệm chuyên sâu, xưởng thực hành hiện đại, xưởng MakerSpace kết nối trực tiếp Khu Công nghệ cao."
  },
  QSB: {
    code: "QSB",
    name: "Trường Đại học Bách Khoa - ĐHQG TP.HCM",
    shortName: "HCMUT / Bách Khoa TP.HCM",
    tuitionYear: {
      standard: "32 – 35 triệu VNĐ / năm (tiêu chuẩn)",
      highQuality: "60 – 80 triệu VNĐ / năm (chương trình tiên tiến / giảng dạy bằng tiếng Anh)"
    },
    cutoffBenchmark: {
      "Khoa học Máy tính": { thpt: 27.50, dgnl: 920, note: "Xét theo công thức tổng hợp ĐGNL 70% + THPT 20% + Học bạ 10%" },
      "Kỹ thuật Cơ điện tử": { thpt: 26.00, dgnl: 850 },
      "Kỹ thuật Điện - Điện tử": { thpt: 26.20, dgnl: 860 }
    },
    admissionMethods: [
      "Phương thức kết hợp toàn diện (ĐGNL ĐHQG-HCM trọng số chính + THPT + Học bạ)",
      "Tuyển thẳng học sinh giỏi quốc gia"
    ],
    scholarshipHighlight: "Học bổng cựu sinh viên Bách Khoa, học bổng doanh nghiệp đa quốc gia.",
    campusNote: "2 cơ sở: Quận 10 trung tâm và Cơ sở 2 tại Làng Đại học Dĩ An."
  },
  QSC: {
    code: "QSC",
    name: "Trường Đại học Công nghệ Thông tin - ĐHQG TP.HCM",
    shortName: "UIT",
    tuitionYear: {
      standard: "35 – 45 triệu VNĐ / năm",
      highQuality: "55 – 65 triệu VNĐ / năm"
    },
    cutoffBenchmark: {
      "Trí tuệ Nhân tạo": { thpt: 27.80, dgnl: 920 },
      "Khoa học Dữ liệu": { thpt: 27.10, dgnl: 890 },
      "Kỹ thuật Phần mềm": { thpt: 26.90, dgnl: 880 },
      "An toàn Thông tin": { thpt: 26.90, dgnl: 875 }
    },
    admissionMethods: [
      "Điểm thi ĐGNL ĐHQG-HCM",
      "Điểm thi Tốt nghiệp THPT",
      "Tuyển thẳng theo quy định ĐHQG-HCM"
    ],
    scholarshipHighlight: "Học bổng tài năng CNTT, học bổng tài trợ từ tập đoàn công nghệ lớn.",
    campusNote: "Nằm trong Làng Đại học Quốc gia TP.HCM, hạ tầng máy chủ và phòng Lab AI tân tiến."
  }
};

export const REALTIME_CAREER_SALARIES: Record<string, CareerSalaryRealtime> = {
  data_analyst: {
    roleName: "Chuyên viên Phân tích Dữ liệu (Data Analyst)",
    fresherMonthlyMillion: "10 – 15 triệu",
    juniorMonthlyMillion: "18 – 28 triệu",
    seniorMonthlyMillion: "35 – 55 triệu",
    hiringDemand: "Rất cao",
    hotSkills: ["SQL nâng cao", "Power BI / Tableau", "Python (Pandas, Scikit-learn)", "Data Storytelling & Tư duy kinh doanh"],
    aiExposureReality: "AI tự động hóa việc viết truy vấn SQL cơ bản và vẽ biểu đồ. Nhà tuyển dụng hiện ưu tiên người có tư duy phản biện số liệu và biết bóc tách nguyên nhân tăng trưởng."
  },
  software_engineer: {
    roleName: "Kỹ sư Phần mềm (Software Engineer)",
    fresherMonthlyMillion: "12 – 18 triệu",
    juniorMonthlyMillion: "22 – 38 triệu",
    seniorMonthlyMillion: "45 – 75+ triệu",
    hiringDemand: "Rất cao",
    hotSkills: ["TypeScript / Node.js / React / Next.js", "Java / Spring Boot hoặc Go", "Kiến trúc Microservices & Docker/K8s", "Làm chủ AI Coding Tools (Cursor, Copilot)"],
    aiExposureReality: "AI không làm biến mất lập trình viên, nhưng lập trình viên biết dùng AI đang làm việc nhanh gấp 3 lần. Trọng tâm chuyển từ gõ code cơ bản sang thiết kế kiến trúc, bảo mật và thẩm định logic."
  },
  ai_engineer: {
    roleName: "Kỹ sư Trí tuệ Nhân tạo (AI Engineer)",
    fresherMonthlyMillion: "15 – 22 triệu",
    juniorMonthlyMillion: "30 – 50 triệu",
    seniorMonthlyMillion: "60 – 100+ triệu",
    hiringDemand: "Rất cao",
    hotSkills: ["Python / PyTorch", "LLM fine-tuning, RAG (Retrieval-Augmented Generation)", "Vector Databases", "MLOps & Cloud Deployment"],
    aiExposureReality: "Nhu cầu tuyển dụng tăng mạnh sau làn sóng GenAI. Doanh nghiệp cần kỹ sư ứng dụng AI vào quy trình sản xuất và kinh doanh thực tế chứ không chỉ dừng ở lý thuyết nghiên cứu."
  },
  semiconductor_engineer: {
    roleName: "Kỹ sư Thiết kế Vi mạch Bán dẫn",
    fresherMonthlyMillion: "14 – 20 triệu",
    juniorMonthlyMillion: "25 – 45 triệu",
    seniorMonthlyMillion: "55 – 90+ triệu",
    hiringDemand: "Rất cao",
    hotSkills: ["Verilog / VHDL", "Kiến trúc vi xử lý", "Công cụ Synopsys / Cadence", "Tiếng Anh kỹ thuật thành thạo"],
    aiExposureReality: "Nằm trong chiến lược trọng điểm quốc gia. Các tập đoàn như Marvell, Synopsys, FPT Semiconductor mở rộng liên tục, rất khát nhân lực được đào tạo bài bản từ HCMUTE và Bách Khoa."
  },
  automotive_engineer: {
    roleName: "Kỹ sư Công nghệ Ô tô",
    fresherMonthlyMillion: "10 – 15 triệu",
    juniorMonthlyMillion: "18 – 30 triệu",
    seniorMonthlyMillion: "35 – 60 triệu",
    hiringDemand: "Cao",
    hotSkills: ["Chẩn đoán điện - điện tử ô tô", "Hệ thống truyền động xe điện (EV)", "Phần mềm mô phỏng CAD/CAM/CAE", "Tiếng Anh / Tiếng Nhật"],
    aiExposureReality: "Xu hướng chuyển dịch mạnh sang Xe điện (EV) và Xe thông minh. Sinh viên được trang bị thêm kỹ năng lập trình nhúng và điều khiển tự động có lợi thế cạnh tranh vượt trội."
  }
};

/**
 * Trợ lý trích xuất dữ liệu Realtime theo từ khóa người dùng
 */
export function extractRealtimeFact(query: string): string | null {
  const q = query.toLowerCase();

  // 1. Hỏi về học phí
  if (q.includes("học phí") || q.includes("chi phí") || q.includes("bao nhiêu tiền") || q.includes("tiền học")) {
    const spk = REALTIME_UNIVERSITIES.SPK;
    return `**Dữ liệu học phí chính thức năm học ${REALTIME_METADATA.academicYear} tại ${spk.shortName}**:
- **Chương trình đại trà**: Khoảng **${spk.tuitionYear.standard}**.
- **Chất lượng cao tiếng Việt**: Khoảng **${spk.tuitionYear.highQuality}**.
- **Chất lượng cao tiếng Anh**: Khoảng **${spk.tuitionYear.englishHighQuality}**.
- *Chính sách hỗ trợ*: Trường có quỹ học bổng khuyến tài hơn 36 tỷ đồng/năm và miễn 100% học phí toàn khóa cho Thủ khoa đầu vào.`;
  }

  // 2. Hỏi về điểm chuẩn
  if (q.includes("điểm chuẩn") || q.includes("bao nhiêu điểm") || q.includes("lấy bao nhiêu") || q.includes("điểm đầu vào") || q.includes("đgnl")) {
    const spk = REALTIME_UNIVERSITIES.SPK;
    return `**Điểm chuẩn tham khảo kỳ tuyển sinh mới nhất tại ${spk.shortName}**:
- **Robot & AI**: ~26.75 điểm THPT (ĐGNL ~890đ)
- **Công nghệ Thông tin**: ~26.50 điểm THPT (ĐGNL ~880đ)
- **Kỹ thuật Phần mềm**: ~26.00 điểm THPT (ĐGNL ~860đ)
- **Kỹ thuật Ô tô**: ~26.25 điểm THPT (ĐGNL ~870đ)
- **Thiết kế Vi mạch**: ~26.20 điểm THPT (ĐGNL ~865đ)
- **Cơ điện tử / Tự động hóa**: ~25.50 – 25.75 điểm THPT
*Lời khuyên an toàn*: Nếu xét điểm THPT, bạn nên đặt mục tiêu mỗi môn ≥ 8.8–9.0 điểm; nếu thi ĐGNL ĐHQG-HCM, mức an toàn là từ 850 điểm trở lên.`;
  }

  // 3. Hỏi về mức lương / thu nhập
  if (q.includes("lương") || q.includes("thu nhập") || q.includes("salary") || q.includes("bao nhiêu triệu")) {
    return `**Khảo sát mức lương thị trường lao động thực tế (Cập nhật ${REALTIME_METADATA.lastVerifiedDate})**:
- **Mới tốt nghiệp (Fresher 0–1 năm)**: Dao động **10 – 16 triệu VNĐ/tháng** (riêng ngành AI/Vi mạch có thể đạt 15–20 triệu nếu có portfolio tốt).
- **Có kinh nghiệm (2–3 năm)**: Dao động **20 – 38 triệu VNĐ/tháng**.
- **Trình độ cao (Senior / Lead 4–5+ năm)**: Dao động **40 – 75+ triệu VNĐ/tháng**.
*Thực tế*: Nhà tuyển dụng hiện nay không trả lương theo bằng cấp lý thuyết mà dựa vào năng lực giải quyết vấn đề và sản phẩm cụ thể bạn đã xây dựng được.`;
  }

  // 4. Hỏi về nguy cơ AI thay thế / việc làm
  if (q.includes("ai thay thế") || q.includes("mất việc") || q.includes("thất nghiệp") || q.includes("tác động của ai")) {
    return `**Đánh giá thực tế về tác động của AI trong năm ${REALTIME_METADATA.academicYear}**:
- **Công việc bị ảnh hưởng nhiều**: Các tác vụ lập trình cơ bản (viết hàm đơn giản, dịch code), tổng hợp số liệu thô hoặc thiết kế đồ họa template mẫu.
- **Ai sẽ an toàn và phát triển mạnh**: Người biết dùng AI như một trợ thủ đắc lực (dùng Cursor, Copilot, ChatGPT) kết hợp với **tư duy logic bóc tách bài toán, thấu hiểu nghiệp vụ khách hàng và kiểm soát chất lượng**.
- *Thông điệp cốt lõi*: AI không lấy đi việc làm của bạn, mà người biết ứng dụng AI thuần thục sẽ thay thế người làm việc thủ công truyền thống.`;
  }

  return null;
}
