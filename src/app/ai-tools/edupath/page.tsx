"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import rawUniversities from "@/data/universities.json";
import {
  calculateEduPathRecommendations,
  ScoredMajorRecommendation,
} from "@/data/majorsDatabase";
import { openPrintWindow, downloadHtmlFile } from "@/lib/reportGenerator";

// ============================================================================
// DANH SÁCH CHUẨN 34 TỈNH / THÀNH PHỐ
// ============================================================================
const PROVINCES = [
  "An Giang", "Bắc Ninh", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Điện Biên", "Đồng Nai",
  "Đồng Tháp", "Gia Lai", "Hà Tĩnh", "Hưng Yên", "Khánh Hoà", "Lai Châu", "Lâm Đồng",
  "Lạng Sơn", "Lào Cai", "Nghệ An", "Ninh Bình", "Phú Thọ", "Quảng Ngãi", "Quảng Ninh",
  "Quảng Trị", "Sơn La", "Tây Ninh", "Thái Nguyên", "Thanh Hóa", "TP. Cần Thơ",
  "TP. Đà Nẵng", "TP. Hà Nội", "TP. Hải Phòng", "TP. Hồ Chí Minh", "TP. Huế",
  "Tuyên Quang", "Vĩnh Long",
];

const STAR_LEVELS = Array.of(1, 2, 3, 4, 5);

interface UniversityItem {
  id: string;
  name: string;
  shortName: string;
  city: string;
  region: "BAC" | "TRUNG" | "NAM";
  cutoff: number;      // Điểm chuẩn tham khảo nhóm ngành CNTT/Kỹ thuật
  tuition: number;     // Triệu VNĐ / năm
  employmentRate: number; // % việc làm
  type: "Công lập" | "Tư thục" | "Quốc tế";
  highlight: string;
}

const UNIVERSITIES: UniversityItem[] = [
  // TP. HỒ CHÍ MINH & MIỀN NAM
  { id: "BKA_HCM", name: "ĐH Bách Khoa - ĐHQG TP.HCM", shortName: "HCMUT", city: "TP. Hồ Chí Minh", region: "NAM", cutoff: 27.5, tuition: 35, employmentRate: 98.6, type: "Công lập", highlight: "Top đầu kỹ thuật miền Nam, kiểm định ABET" },
  { id: "UIT", name: "ĐH Công nghệ Thông tin - ĐHQG TP.HCM", shortName: "UIT", city: "TP. Hồ Chí Minh", region: "NAM", cutoff: 27.2, tuition: 33, employmentRate: 98.8, type: "Công lập", highlight: "Chuyên sâu CNTT, AI, mạng máy tính & an toàn thông tin" },
  { id: "HCMUS", name: "ĐH Khoa học Tự nhiên - ĐHQG TP.HCM", shortName: "HCMUS", city: "TP. Hồ Chí Minh", region: "NAM", cutoff: 26.5, tuition: 28, employmentRate: 96.5, type: "Công lập", highlight: "Nền tảng thuật toán, khoa học dữ liệu và phần mềm vững chắc" },
  { id: "HCMUTE", name: "ĐH Sư phạm Kỹ thuật TP.HCM", shortName: "HCMUTE", city: "TP. Hồ Chí Minh", region: "NAM", cutoff: 25.5, tuition: 30, employmentRate: 97.2, type: "Công lập", highlight: "Đào tạo thực hành ứng dụng xuất sắc, cơ sở vật chất hiện đại" },
  { id: "UEH", name: "Đại học Kinh tế TP.HCM", shortName: "UEH", city: "TP. Hồ Chí Minh", region: "NAM", cutoff: 26.8, tuition: 36, employmentRate: 97.5, type: "Công lập", highlight: "Môi trường năng động, kết nối doanh nghiệp và kinh tế số cực mạnh" },
  { id: "SGU", name: "Đại học Sài Gòn", shortName: "SGU", city: "TP. Hồ Chí Minh", region: "NAM", cutoff: 24.8, tuition: 22, employmentRate: 93.0, type: "Công lập", highlight: "Học phí vừa phải, vị trí trung tâm TP.HCM" },
  { id: "IUH", name: "Đại học Công nghiệp TP.HCM", shortName: "IUH", city: "TP. Hồ Chí Minh", region: "NAM", cutoff: 24.2, tuition: 28, employmentRate: 94.5, type: "Công lập", highlight: "Nhiều chương trình đạt chuẩn kiểm định quốc tế AUN-QA" },
  { id: "UTH", name: "ĐH Giao thông Vận tải TP.HCM", shortName: "UTH", city: "TP. Hồ Chí Minh", region: "NAM", cutoff: 23.5, tuition: 20, employmentRate: 92.0, type: "Công lập", highlight: "Học phí rất hợp lý, điểm chuẩn vừa sức đa số học sinh" },
  { id: "OU_HCM", name: "Đại học Mở TP.HCM", shortName: "OU", city: "TP. Hồ Chí Minh", region: "NAM", cutoff: 23.0, tuition: 25, employmentRate: 91.5, type: "Công lập", highlight: "Đào tạo đa ngành, ứng dụng công nghệ linh hoạt" },
  { id: "FPT_HCM", name: "Đại học FPT TP.HCM", shortName: "FPT", city: "TP. Hồ Chí Minh", region: "NAM", cutoff: 22.0, tuition: 88, employmentRate: 98.0, type: "Tư thục", highlight: "100% học bằng tiếng Anh, kỳ thực tập OJT tại doanh nghiệp" },
  { id: "CTU", name: "Đại học Cần Thơ", shortName: "CTU", city: "TP. Cần Thơ", region: "NAM", cutoff: 24.5, tuition: 20, employmentRate: 94.0, type: "Công lập", highlight: "Trường đại học trọng điểm lớn nhất Đồng bằng sông Cửu Long" },

  // HÀ NỘI & MIỀN BẮC
  { id: "HUST", name: "Đại học Bách Khoa Hà Nội", shortName: "HUST", city: "TP. Hà Nội", region: "BAC", cutoff: 27.8, tuition: 32, employmentRate: 98.5, type: "Công lập", highlight: "Biểu tượng đào tạo kỹ thuật và công nghệ hàng đầu Việt Nam" },
  { id: "UET", name: "ĐH Công nghệ - ĐHQG Hà Nội", shortName: "UET", city: "TP. Hà Nội", region: "BAC", cutoff: 27.5, tuition: 28, employmentRate: 98.2, type: "Công lập", highlight: "Chất lượng nghiên cứu và giảng dạy công nghệ chuẩn quốc tế" },
  { id: "NEU", name: "Đại học Kinh tế Quốc dân", shortName: "NEU", city: "TP. Hà Nội", region: "BAC", cutoff: 27.2, tuition: 30, employmentRate: 97.8, type: "Công lập", highlight: "Top 1 kinh tế miền Bắc, mạng lưới cựu sinh viên rộng khắp" },
  { id: "PTIT", name: "Học viện Công nghệ Bưu chính Viễn thông", shortName: "PTIT", city: "TP. Hà Nội", region: "BAC", cutoff: 26.2, tuition: 26, employmentRate: 96.0, type: "Công lập", highlight: "Thế mạnh viễn thông, mạng máy tính và phát triển phần mềm" },
  { id: "UTC", name: "Đại học Giao thông Vận tải Hà Nội", shortName: "UTC", city: "TP. Hà Nội", region: "BAC", cutoff: 24.0, tuition: 20, employmentRate: 93.0, type: "Công lập", highlight: "Truyền thống kỹ thuật lâu đời, học phí công lập ưu đãi" },
  { id: "HAUI", name: "Đại học Công nghiệp Hà Nội", shortName: "HaUI", city: "TP. Hà Nội", region: "BAC", cutoff: 24.5, tuition: 22, employmentRate: 94.0, type: "Công lập", highlight: "Gắn liền thực hành và việc làm với các tập đoàn công nghiệp" },
  { id: "TLU", name: "Đại học Thủy Lợi", shortName: "TLU", city: "TP. Hà Nội", region: "BAC", cutoff: 23.0, tuition: 19, employmentRate: 92.5, type: "Công lập", highlight: "Môi trường học tập khang trang, chi phí sinh hoạt vừa phải" },
  { id: "VMU", name: "Đại học Hàng hải Việt Nam", shortName: "VMU", city: "TP. Hải Phòng", region: "BAC", cutoff: 23.2, tuition: 21, employmentRate: 93.0, type: "Công lập", highlight: "Trường đại học trọng điểm quốc gia tại thành phố cảng" },
  { id: "ICTU", name: "ĐH CNTT & Truyền thông - ĐH Thái Nguyên", shortName: "ICTU", city: "Thái Nguyên", region: "BAC", cutoff: 20.5, tuition: 17, employmentRate: 90.0, type: "Công lập", highlight: "Cửa ngõ đào tạo CNTT cho khu vực trung du miền núi phía Bắc" },

  // ĐÀ NẴNG & MIỀN TRUNG
  { id: "DUT", name: "ĐH Bách Khoa - ĐH Đà Nẵng", shortName: "DUT", city: "TP. Đà Nẵng", region: "TRUNG", cutoff: 25.8, tuition: 26, employmentRate: 96.0, type: "Công lập", highlight: "Trung tâm đào tạo kỹ sư công nghệ hàng đầu miền Trung" },
  { id: "VKU", name: "ĐH CNTT & Truyền thông Việt - Hàn", shortName: "VKU", city: "TP. Đà Nẵng", region: "TRUNG", cutoff: 23.8, tuition: 18, employmentRate: 95.0, type: "Công lập", highlight: "Hợp tác chính phủ Hàn Quốc, cơ sở hiện đại, học phí rất mềm" },
  { id: "DUE", name: "ĐH Kinh tế - ĐH Đà Nẵng", shortName: "DUE", city: "TP. Đà Nẵng", region: "TRUNG", cutoff: 25.0, tuition: 25, employmentRate: 95.5, type: "Công lập", highlight: "Đào tạo kinh doanh và quản trị hàng đầu khu vực miền Trung" },
  { id: "HUSC", name: "ĐH Khoa học - Đại học Huế", shortName: "HUSC", city: "TP. Huế", region: "TRUNG", cutoff: 21.0, tuition: 18, employmentRate: 91.0, type: "Công lập", highlight: "Cái nôi khoa học cơ bản với bề dày lịch sử tại cố đô Huế" },
  { id: "QNU", name: "Đại học Quy Nhơn", shortName: "QNU", city: "Bình Định", region: "TRUNG", cutoff: 21.5, tuition: 18, employmentRate: 90.5, type: "Công lập", highlight: "Trung tâm nghiên cứu toán học và khoa học dữ liệu mới nổi" }
];

const CHAPTERS = [
  { id: 1, name: "Khởi tạo Nhân vật", subtitle: "Bối cảnh & Xuất phát điểm", icon: "👤" },
  { id: 2, name: "Cây Kỹ năng Học thuật", subtitle: "Thực lực & Điểm tựa 10 môn", icon: "📐" },
  { id: 3, name: "Rương Báu Sở thích", subtitle: "Chất liệu đam mê cốt lõi", icon: "🎨" },
  { id: 4, name: "Năng lực Hành vi", subtitle: "Giải quyết vấn đề thực tế", icon: "🧠" },
  { id: 5, name: "Phong cách Tư duy", subtitle: "Cách bạn làm việc & hợp tác", icon: "⚡" },
  { id: 6, name: "Ngọc bổ trợ Giá trị", subtitle: "Điều bạn coi trọng nhất", icon: "💎" },
  { id: 7, name: "Du hành 10 Năm Tới", subtitle: "Hình dung bức tranh tương lai", icon: "🚀" },
  { id: 8, name: "Cánh cổng Đại học", subtitle: "Địa lý, môi trường & tiêu chí", icon: "🏛️" },
  { id: 9, name: "Đấu trường Quyết định", subtitle: "Bản đồ ngành & Giả lập What-If", icon: "🏆" }
];

export default function EduPathGamePage() {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [xp, setXp] = useState(100);
  const [uniTab, setUniTab] = useState<"ALL" | "SAFE" | "TARGET" | "REACH">("ALL");
  const [selectedMajorCode, setSelectedMajorCode] = useState<string>("");

  const [formData, setFormData] = useState({
    grade: "Lớp 11",
    gradYear: "2027",
    currentProvince: "TP. Hồ Chí Minh",
    highSchool: "",
    awarenessLevel: "Có một vài ngành đang quan tâm",
    influencers: ["Bản thân"],

    subjects: {
      math: { score: 8.5, trend: "up", interest: 5 },
      literature: { score: 7.0, trend: "stable", interest: 3 },
      english: { score: 8.0, trend: "up", interest: 4 },
      physics: { score: 7.5, trend: "stable", interest: 4 },
      chemistry: { score: 6.5, trend: "down", interest: 2 },
      biology: { score: 6.0, trend: "stable", interest: 2 },
      history: { score: 7.0, trend: "stable", interest: 3 },
      geography: { score: 7.5, trend: "stable", interest: 3 },
      informatics: { score: 9.0, trend: "up", interest: 5 },
      technology: { score: 8.0, trend: "stable", interest: 4 },
    },
    learningStyle: "Thực hành & Làm thử",
    difficultProblemAction: "Tự giải trước rồi tìm tài liệu",
    selfLearningRating: 4,

    interests: ["Công nghệ", "Dữ liệu", "Sáng tạo"],
    preferredActivities: ["Lập trình", "Phân tích dữ liệu", "Thiết kế"],
    dreamProject: "Xây dựng website / ứng dụng AI",
    dislikedFields: [] as string[],

    abilities: {
      problemSolving: 4,
      logic: 5,
      creativity: 4,
      communication: 3,
      teamwork: 4,
      independent: 5,
    },

    groupStuckAction: "Phân tích nguyên nhân & tìm thông tin",
    workEnvironmentType: "Có khung định hướng nhưng được tự do sáng tạo",
    adaptabilityWhenChanged: "Bình thường và thích nghi dần",
    teamSizePreference: "Nhóm nhỏ (2-4 người)",

    values: ["Thu nhập tốt", "Sáng tạo", "Tự do thời gian", "Công nghệ", "Cơ hội thăng tiến"],

    role10y: "Chuyên gia công nghệ cấp cao",
    workspace10y: "Kết hợp linh hoạt (Hybrid / Remote)",
    theoryVsPractice: 80,

    targetCities: ["TP. Hồ Chí Minh"],
    distanceTolerance: "Trong cùng thành phố hoặc dưới 50km",
    universityType: "Trường Công lập tự chủ hoặc Quốc tế",

    tuitionBudget: 40,
    estimatedScore: 25.5,
  });

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setXp((prev) => prev + 120);
    setCurrentChapter((prev) => Math.min(prev + 1, 9));
  };

  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentChapter((prev) => Math.max(prev - 1, 1));
  };

  const liveStats = useMemo(() => {
    const techScore = formData.subjects.informatics.score * 6 + formData.subjects.math.score * 4;
    const creativeScore = formData.subjects.literature.score * 5 + formData.abilities.creativity * 10;
    const analyticalScore = formData.subjects.math.score * 5 + formData.abilities.logic * 10;
    const socialScore = formData.abilities.communication * 12 + formData.abilities.teamwork * 8;

    return {
      tech: Math.min(100, Math.round(techScore)),
      creative: Math.min(100, Math.round(creativeScore)),
      analytical: Math.min(100, Math.round(analyticalScore)),
      social: Math.min(100, Math.round(socialScore)),
    };
  }, [formData]);

  // Tính toán bảng xếp hạng 12 ngành theo hồ sơ thực tế của học sinh
  const rankedMajors = useMemo(() => {
    return calculateEduPathRecommendations(formData);
  }, [formData]);

  // Ngành đang được chọn để xem chi tiết và mô phỏng trường đại học
  const activeMajor: ScoredMajorRecommendation = useMemo(() => {
    if (selectedMajorCode) {
      const found = rankedMajors.find((m) => m.code === selectedMajorCode);
      if (found) return found;
    }
    return rankedMajors[0] || ({} as ScoredMajorRecommendation);
  }, [rankedMajors, selectedMajorCode]);

  const matchedUniversities = useMemo(() => {
    const targetCity = formData.targetCities[0] || "Toàn quốc";
    const keywords = activeMajor?.searchKeywords || ["công nghệ thông tin", "phần mềm"];

    return UNIVERSITIES.map((u) => {
      let effectiveCutoff = u.cutoff;
      const rawList = (rawUniversities as unknown) as Array<{
        name: string;
        shortName?: string;
        code?: string;
        majors?: Array<{ major_name: string; cutoff_score: number }>;
      }>;

      const rawUni = rawList.find(
        (r) =>
          r.name.toLowerCase().includes(u.shortName.toLowerCase()) ||
          (r.shortName && r.shortName.toLowerCase() === u.shortName.toLowerCase()) ||
          r.name.toLowerCase().includes(u.name.toLowerCase())
      );

      if (rawUni?.majors && rawUni.majors.length > 0) {
        const foundMajor = rawUni.majors.find((m) =>
          keywords.some((kw) => m.major_name.toLowerCase().includes(kw.toLowerCase()))
        );
        if (foundMajor && foundMajor.cutoff_score > 12) {
          effectiveCutoff = foundMajor.cutoff_score;
        } else if (activeMajor?.avgCutoff) {
          effectiveCutoff = Number((activeMajor.avgCutoff + (u.cutoff - 25.5) * 0.5).toFixed(2));
        }
      } else if (activeMajor?.avgCutoff) {
        effectiveCutoff = Number((activeMajor.avgCutoff + (u.cutoff - 25.5) * 0.5).toFixed(2));
      }

      const delta = formData.estimatedScore - effectiveCutoff;
      let tier: "SAFE" | "TARGET" | "REACH" = "TARGET";
      let tierLabel = "Vừa sức";
      let tierColor = "bg-amber-50 text-amber-800 border-amber-200";

      if (delta >= 1.0) {
        tier = "SAFE";
        tierLabel = "An toàn (Đỗ cao)";
        tierColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
      } else if (delta < -1.0) {
        tier = "REACH";
        tierLabel = "Thử thách (Reach)";
        tierColor = "bg-rose-50 text-rose-800 border-rose-200";
      }

      const isCityMatched =
        targetCity === "Toàn quốc" ||
        u.city === targetCity ||
        (targetCity === "TP. Hồ Chí Minh" && u.region === "NAM") ||
        (targetCity === "TP. Hà Nội" && u.region === "BAC") ||
        (targetCity === "TP. Đà Nẵng" && u.region === "TRUNG");

      const isAffordable = u.tuition <= formData.tuitionBudget * 1.25;

      return {
        ...u,
        cutoff: effectiveCutoff,
        delta,
        tier,
        tierLabel,
        tierColor,
        isCityMatched,
        isAffordable,
      };
    })
      .filter((u) => u.isCityMatched)
      .filter((u) => (uniTab === "ALL" ? true : u.tier === uniTab))
      .sort((a, b) => b.cutoff - a.cutoff);
  }, [formData.estimatedScore, formData.targetCities, formData.tuitionBudget, uniTab, activeMajor]);

  const generateEduPathReportHtml = () => {
    return `
      <div class="header">
        <div>
          <h1 class="brand-title">BÁO CÁO ĐỊNH HƯỚNG NGHỀ NGHIỆP & CHIẾN LƯỢC NGUYỆN VỌNG EDUPATH 2026</h1>
          <div class="brand-sub">Hệ thống phân tích năng lực đa chiều & bản đồ ngành đại học — Lê Xuân Thân</div>
        </div>
        <div class="report-badge">EDUPATH REPORT</div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <span>HỌC SINH / NĂM TN</span>
          <strong>${formData.grade} · TN ${formData.gradYear}</strong>
        </div>
        <div class="info-item">
          <span>ĐỊA BÀN MỤC TIÊU</span>
          <strong>${formData.targetCities[0]}</strong>
        </div>
        <div class="info-item">
          <span>ĐIỂM DỰ KIẾN / NGÂN SÁCH</span>
          <strong>${formData.estimatedScore}đ · ~${formData.tuitionBudget}tr/năm</strong>
        </div>
      </div>

      <h2 class="section-title">1. CHỈ SỐ NĂNG LỰC & THIÊN HƯỚNG HỌC THUẬT</h2>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px;">
        <div style="background: #fdfaf3; border: 1px solid #f0e7d5; padding: 8px; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; color: #78716c;">Công nghệ / Kỹ thuật</div>
          <strong style="font-size: 16px; color: #0284c7;">${liveStats.tech}%</strong>
        </div>
        <div style="background: #fdfaf3; border: 1px solid #f0e7d5; padding: 8px; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; color: #78716c;">Sáng tạo & Đổi mới</div>
          <strong style="font-size: 16px; color: #db2777;">${liveStats.creative}%</strong>
        </div>
        <div style="background: #fdfaf3; border: 1px solid #f0e7d5; padding: 8px; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; color: #78716c;">Tư duy Phân tích</div>
          <strong style="font-size: 16px; color: #7c3aed;">${liveStats.analytical}%</strong>
        </div>
        <div style="background: #fdfaf3; border: 1px solid #f0e7d5; padding: 8px; border-radius: 6px; text-align: center;">
          <div style="font-size: 11px; color: #78716c;">Xã hội & Kết nối</div>
          <strong style="font-size: 16px; color: #059669;">${liveStats.social}%</strong>
        </div>
      </div>

      <h2 class="section-title">2. TOP 5 NGÀNH NGHỀ TƯƠNG THÍCH NHẤT (MA TRẬN 12 NGÀNH)</h2>
      ${rankedMajors.slice(0, 5).map((m, idx) => `
        <div class="major-card">
          <div class="major-header">
            <div class="major-name">#${idx + 1}. ${m.name} (${m.field})</div>
            <div class="match-tag">${m.matchPercentage}% Phù hợp</div>
          </div>
          <p style="margin: 4px 0 6px 0; color: #57534e; font-size: 12px;">${m.description}</p>
          <div style="font-size: 11px; margin-bottom: 4px;">
            <strong style="color: #065f46;">✓ Điểm mạnh tương thích:</strong> ${m.strengthNote}
          </div>
          <div style="font-size: 11px;">
            <strong style="color: #9f1239;">⚠️ Điểm cần lưu ý:</strong> ${m.gapNote}
          </div>
        </div>
      `).join('')}

      <h2 class="section-title">3. CHIẾN LƯỢC TRƯỜNG ĐẠI HỌC CHO NGÀNH: ${activeMajor?.name || 'Mục tiêu'}</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Tên Trường Đại Học</th>
            <th>Địa Điểm</th>
            <th>Điểm Chuẩn</th>
            <th>Học Phí / Năm</th>
            <th>Tỷ Lệ Việc Làm</th>
            <th>Đánh Giá Nguyện Vọng</th>
          </tr>
        </thead>
        <tbody>
          ${matchedUniversities.slice(0, 10).map((u) => `
            <tr>
              <td><strong>${u.name}</strong> (${u.shortName})</td>
              <td>${u.city}</td>
              <td>${u.cutoff}</td>
              <td>~${u.tuition} tr</td>
              <td>${u.employmentRate}%</td>
              <td><span class="badge ${u.tier === 'SAFE' ? 'badge-safe' : u.tier === 'REACH' ? 'badge-reach' : 'badge-target'}">${u.tierLabel}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2 class="section-title">4. LỘ TRÌNH HÀNH ĐỘNG 12 THÁNG ĐỀ XUẤT</h2>
      <div style="background: #fdfaf3; border: 1px solid #f0e7d5; padding: 12px; border-radius: 8px; font-size: 11px; line-height: 1.6;">
        <div><strong>• Giai đoạn 1 (Tháng 1-3):</strong> Tập trung củng cố 3 môn tổ hợp chủ lực; tham gia các câu lạc bộ hoặc dự án thực tế liên quan đến ${activeMajor?.field}.</div>
        <div><strong>• Giai đoạn 2 (Tháng 4-6):</strong> Thi lấy chứng chỉ ngoại ngữ (IELTS/TOEIC) nếu cần; đăng ký thi thử Đánh giá năng lực (ĐGNL ĐHQG).</div>
        <div><strong>• Giai đoạn 3 (Tháng 7-9):</strong> Tận dụng các phương thức xét tuyển sớm (học bạ, giải thưởng); tham gia Ngày hội tư vấn tuyển sinh Open Day.</div>
        <div><strong>• Giai đoạn 4 (Tháng 10-12):</strong> Tối ưu hóa thứ tự nguyện vọng theo tỷ lệ vàng: 2 NV Thử thách, 3 NV Vừa sức, 2 NV An toàn tuyệt đối.</div>
      </div>
    `;
  };

  const handlePrintReport = () => {
    const html = generateEduPathReportHtml();
    openPrintWindow("Bao-Cao-EduPath-2026", html);
  };

  const handleDownloadHtml = () => {
    const html = generateEduPathReportHtml();
    downloadHtmlFile("Bao-Cao-EduPath-2026", html);
  };

  return (
    <main className="min-h-screen bg-[#fdfaf3] py-8 px-4 sm:px-6 lg:px-8 text-stone-900 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <Link
            href="/ai-tools"
            className="text-xs font-bold text-stone-600 hover:text-amber-600 transition flex items-center gap-1.5"
          >
            ← Danh mục AI Tools
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <div>
                <div className="text-xs font-extrabold text-amber-900">
                  Level {Math.floor(xp / 200) + 1} — Nhà Thám Hiểm
                </div>
                <div className="text-[10px] text-stone-400 font-semibold">{xp} XP tích lũy</div>
              </div>
            </div>
            <div className="hidden sm:block h-6 w-[1px] bg-stone-200" />
            <div className="hidden sm:flex gap-2 text-xs font-bold text-stone-600">
              <span className="text-blue-600">Tech: {liveStats.tech}</span> ·
              <span className="text-amber-600">Logic: {liveStats.analytical}</span> ·
              <span className="text-pink-600">Creative: {liveStats.creative}</span>
            </div>
          </div>
        </div>

        {/* TIẾN TRÌNH */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs font-extrabold text-stone-700">
            <span className="flex items-center gap-2">
              <span className="text-base">{CHAPTERS[currentChapter - 1].icon}</span>
              <span>ẢI {currentChapter} / 9: {CHAPTERS[currentChapter - 1].name}</span>
            </span>
            <span className="text-amber-600 font-bold">
              {Math.round((currentChapter / 9) * 100)}% Hoàn thành
            </span>
          </div>

          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500 rounded-full"
              style={{ width: `${(currentChapter / 9) * 100}%` }}
            />
          </div>

          <div className="hidden md:grid grid-cols-9 gap-1 pt-1 text-[11px] font-semibold text-stone-400 text-center">
            {CHAPTERS.map((c) => (
              <div
                key={c.id}
                className={`truncate px-1 py-1 rounded-md transition ${
                  c.id === currentChapter
                    ? "bg-amber-100 text-amber-900 font-bold"
                    : c.id < currentChapter
                    ? "text-stone-700"
                    : "opacity-50"
                }`}
              >
                Màn {c.id}
              </div>
            ))}
          </div>
        </div>

        {/* KHUNG NỘI DUNG CHÍNH */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm space-y-8 min-h-[500px] flex flex-col justify-between">
          
          {/* MÀN 1: BẠN LÀ AI? */}
          {currentChapter === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Phần 01 · Bối cảnh</span>
                <h2 className="text-2xl font-extrabold text-stone-900 mt-1">Khởi tạo danh tính của bạn</h2>
                <p className="text-sm text-stone-500">Xác định lớp học và khu vực địa lý xuất phát điểm của bạn.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">Q01. Em đang học lớp mấy?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Lớp 10", "Lớp 11", "Lớp 12", "Đã tốt nghiệp"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData({ ...formData, grade: g })}
                        className={`p-3 rounded-xl border text-sm font-semibold transition ${
                          formData.grade === g
                            ? "border-amber-500 bg-amber-50 text-amber-900"
                            : "border-stone-200 hover:border-stone-300 text-stone-700"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">
                    Q02. Tỉnh / Thành phố em đang theo học THPT?
                  </label>
                  <select
                    value={formData.currentProvince}
                    onChange={(e) => setFormData({ ...formData, currentProvince: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">Q03. Trường THPT của em?</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: THPT Chuyên, THPT Marie Curie..."
                    value={formData.highSchool}
                    onChange={(e) => setFormData({ ...formData, highSchool: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-700">Q04. Dự kiến năm tốt nghiệp THPT?</label>
                  <select
                    value={formData.gradYear}
                    onChange={(e) => setFormData({ ...formData, gradYear: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm font-medium focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    {["2026", "2027", "2028", "2029", "2030"].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* MÀN 2: CÂY KỸ NĂNG HỌC THUẬT */}
          {currentChapter === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Phần 02 · Học thuật</span>
                <h2 className="text-2xl font-extrabold text-stone-900 mt-1">Cây năng lực học thuật</h2>
                <p className="text-sm text-stone-500">Đánh giá điểm số thực tế kết hợp mức độ yêu thích và xu hướng phát triển.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase">
                      <th className="pb-3">Môn học</th>
                      <th className="pb-3 text-center">Điểm gần nhất (TB)</th>
                      <th className="pb-3 text-center">Yêu thích (1-5★)</th>
                      <th className="pb-3 text-center">Xu hướng 1-2 năm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {[
                      { key: "math", name: "Toán học", icon: "📐" },
                      { key: "informatics", name: "Tin học / Công nghệ", icon: "💻" },
                      { key: "english", name: "Tiếng Anh", icon: "🇬🇧" },
                      { key: "physics", name: "Vật lý", icon: "⚡" },
                      { key: "chemistry", name: "Hóa học", icon: "🧪" },
                      { key: "biology", name: "Sinh học", icon: "🌱" },
                      { key: "literature", name: "Ngữ văn", icon: "✍️" },
                      { key: "history", name: "Lịch sử", icon: "📜" },
                    ].map((item) => {
                      const subject = formData.subjects[item.key as keyof typeof formData.subjects];
                      return (
                        <tr key={item.key} className="hover:bg-stone-50/50">
                          <td className="py-3 font-bold text-stone-800 flex items-center gap-2">
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                          </td>
                          <td className="py-3 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="10"
                              value={subject.score}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                setFormData({
                                  ...formData,
                                  subjects: {
                                    ...formData.subjects,
                                    [item.key]: { ...subject, score: val },
                                  },
                                });
                              }}
                              className="w-16 p-1.5 text-center border rounded-lg font-bold text-stone-900 border-stone-200"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex justify-center gap-1">
                              {STAR_LEVELS.map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    setFormData({
                                      ...formData,
                                      subjects: {
                                        ...formData.subjects,
                                        [item.key]: { ...subject, interest: star },
                                      },
                                    })
                                  }
                                  className={`text-sm ${star <= subject.interest ? "text-amber-500" : "text-stone-300"}`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <select
                              value={subject.trend}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  subjects: {
                                    ...formData.subjects,
                                    [item.key]: { ...subject, trend: e.target.value },
                                  },
                                })
                              }
                              className="p-1 rounded-md border text-[11px] font-semibold border-stone-200 bg-white"
                            >
                              <option value="up">Tăng liên tục ↗</option>
                              <option value="stable">Ổn định →</option>
                              <option value="down">Có chiều giảm ↘</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-stone-800">
                  <span>Khả năng tự học & tự tra cứu tài liệu mới:</span>
                  <span className="text-amber-700 font-extrabold">{formData.selfLearningRating}/5 sao</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.selfLearningRating}
                  onChange={(e) => setFormData({ ...formData, selfLearningRating: parseInt(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* MÀN 3: RƯƠNG BÁU SỞ THÍCH */}
          {currentChapter === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Phần 03 · Sở thích</span>
                <h2 className="text-2xl font-extrabold text-stone-900 mt-1">Rương báu sở thích cốt lõi</h2>
                <p className="text-sm text-stone-500">Chọn những chất liệu khiến em đam mê và những thứ chắc chắn KHÔNG thích.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Công nghệ", icon: "💻" },
                  { name: "Máy móc / Kỹ thuật", icon: "🔧" },
                  { name: "Dữ liệu & Con số", icon: "📊" },
                  { name: "Hình ảnh / Đồ họa", icon: "🎨" },
                  { name: "Ngôn ngữ / Viết lách", icon: "✍️" },
                  { name: "Con người / Tâm lý", icon: "👥" },
                  { name: "Kinh doanh & Bán lẻ", icon: "💰" },
                  { name: "Nghiên cứu / Thí nghiệm", icon: "🔬" },
                ].map((it) => {
                  const isSelected = formData.interests.includes(it.name);
                  return (
                    <button
                      key={it.name}
                      type="button"
                      onClick={() => {
                        const updated = isSelected
                          ? formData.interests.filter((i) => i !== it.name)
                          : [...formData.interests, it.name];
                        setFormData({ ...formData, interests: updated });
                      }}
                      className={`p-3.5 rounded-2xl border text-center transition ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-sm"
                          : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      <div className="text-2xl mb-1">{it.icon}</div>
                      <div className="text-xs">{it.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MÀN 4: NĂNG LỰC HÀNH VI */}
          {currentChapter === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Phần 04 · Năng lực</span>
                <h2 className="text-2xl font-extrabold text-stone-900 mt-1">Năng lực thực chiến</h2>
                <p className="text-sm text-stone-500">Tự đánh giá các nhóm kỹ năng nền tảng trên thang điểm 1 đến 5.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: "problemSolving", label: "Giải quyết vấn đề khó" },
                  { key: "logic", label: "Tư duy logic & Phân tích" },
                  { key: "creativity", label: "Sáng tạo & Đổi mới" },
                  { key: "communication", label: "Giao tiếp & Thuyết phục" },
                ].map((item) => (
                  <div key={item.key} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-stone-800">
                      <span>{item.label}</span>
                      <span className="text-amber-700 font-extrabold text-sm">
                        {formData.abilities[item.key as keyof typeof formData.abilities]}/5 ★
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData.abilities[item.key as keyof typeof formData.abilities]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          abilities: {
                            ...formData.abilities,
                            [item.key]: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MÀN 5: PHONG CÁCH TƯ DUY */}
          {currentChapter === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Phần 05 · Tình huống</span>
                <h2 className="text-2xl font-extrabold text-stone-900 mt-1">Phong cách tư duy & Làm việc</h2>
                <p className="text-sm text-stone-500">Phản ứng của bạn khi đối mặt với các tình huống thực tế.</p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-stone-800">Khi nhóm gặp bài toán khó, em thường:</label>
                <div className="grid sm:grid-cols-2 gap-2 text-xs font-semibold">
                  {[
                    "Tự tìm tài liệu, phân tích nguyên nhân",
                    "Nhanh chóng đưa ra nhiều ý tưởng mới",
                    "Tập hợp mọi người bàn bạc và phân công",
                    "Thử nghiệm ngay một giải pháp cụ thể",
                  ].map((act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => setFormData({ ...formData, groupStuckAction: act })}
                      className={`p-3 rounded-xl border text-left transition ${
                        formData.groupStuckAction === act
                          ? "border-amber-500 bg-amber-50 text-amber-900 font-bold"
                          : "border-stone-200 text-stone-700"
                      }`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MÀN 6: GIÁ TRỊ CỐT LÕI */}
          {currentChapter === 6 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Phần 06 · Giá trị</span>
                <h2 className="text-2xl font-extrabold text-stone-900 mt-1">Ngọc bổ trợ: Giá trị nghề nghiệp</h2>
                <p className="text-sm text-stone-500">Chọn các giá trị quyết định sự hạnh phúc lâu dài của bạn.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: "Thu nhập tốt", icon: "💰" },
                  { name: "Ổn định & An toàn", icon: "🛡️" },
                  { name: "Cơ hội thăng tiến", icon: "🚀" },
                  { name: "Sáng tạo tự do", icon: "🎨" },
                  { name: "Tự do thời gian", icon: "🕐" },
                  { name: "Công nghệ tiên phong", icon: "💻" },
                ].map((val) => {
                  const isChecked = formData.values.includes(val.name);
                  return (
                    <button
                      key={val.name}
                      type="button"
                      onClick={() => {
                        const updated = isChecked
                          ? formData.values.filter((v) => v !== val.name)
                          : [...formData.values, val.name];
                        setFormData({ ...formData, values: updated });
                      }}
                      className={`p-4 rounded-2xl border flex items-center gap-3 transition text-left ${
                        isChecked
                          ? "border-amber-500 bg-amber-50 text-amber-950 font-bold"
                          : "border-stone-200 bg-white text-stone-700"
                      }`}
                    >
                      <span className="text-2xl">{val.icon}</span>
                      <span className="text-xs font-bold">{val.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MÀN 7: TƯƠNG LAI 10 NĂM */}
          {currentChapter === 7 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Phần 07 · Tầm nhìn</span>
                <h2 className="text-2xl font-extrabold text-stone-900 mt-1">Cỗ máy du hành 10 năm tới</h2>
                <p className="text-sm text-stone-500">Hình dung vị trí và không gian làm việc lý tưởng của bạn.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800">10 năm nữa, em muốn mình là:</label>
                  <select
                    value={formData.role10y}
                    onChange={(e) => setFormData({ ...formData, role10y: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm font-medium bg-white"
                  >
                    <option value="Chuyên gia công nghệ cấp cao">Chuyên gia kỹ thuật / Công nghệ cấp cao</option>
                    <option value="Chủ doanh nghiệp / Khởi nghiệp">Chủ doanh nghiệp / Nhà khởi nghiệp</option>
                    <option value="Nhà sáng tạo nội dung / Nghệ thuật">Nhà sáng tạo nội dung / Nghệ sĩ tự do</option>
                    <option value="Giám đốc quản lý điều hành">Giám đốc quản lý điều hành</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800">Không gian làm việc mơ ước:</label>
                  <select
                    value={formData.workspace10y}
                    onChange={(e) => setFormData({ ...formData, workspace10y: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm font-medium bg-white"
                  >
                    <option value="Văn phòng hiện đại / Tòa nhà cao ốc">Văn phòng hiện đại / Cao ốc</option>
                    <option value="Studio sáng tạo / Phòng thí nghiệm">Studio sáng tạo / Lab nghiên cứu</option>
                    <option value="Linh hoạt từ xa (Remote / Hybrid)">Làm việc từ xa linh hoạt (Remote)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* MÀN 8: CÁNH CỔNG ĐẠI HỌC */}
          {currentChapter === 8 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Phần 08 · Môi trường</span>
                <h2 className="text-2xl font-extrabold text-stone-900 mt-1">Cánh cổng Đại học</h2>
                <p className="text-sm text-stone-500">Thiết lập khu vực và tiêu chí thực tế để tìm trường đào tạo.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800">Khu vực muốn theo học:</label>
                  <select
                    value={formData.targetCities[0]}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm font-medium bg-white"
                    onChange={(e) => setFormData({ ...formData, targetCities: [e.target.value] })}
                  >
                    <option value="Toàn quốc">Toàn quốc / Không quan trọng địa lý</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800">Độ sẵn sàng sống xa nhà:</label>
                  <select
                    value={formData.distanceTolerance}
                    onChange={(e) => setFormData({ ...formData, distanceTolerance: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-200 text-sm font-medium bg-white"
                  >
                    <option value="Dưới 30km (đi về trong ngày)">Dưới 30km (đi về trong ngày)</option>
                    <option value="Dưới 100km (về vào cuối tuần)">Dưới 100km (về vào cuối tuần)</option>
                    <option value="Sẵn sàng tự lập ở thành phố khác">Hoàn toàn sẵn sàng tự lập xa nhà</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* MÀN 9: BẢN ĐỒ KẾT QUẢ & WHAT-IF ENGINE */}
          {currentChapter === 9 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 font-mono">
                    ★ HỒ SƠ ĐỊNH HƯỚNG ĐÃ MỞ KHÓA
                  </span>
                  <h2 className="text-2xl font-extrabold text-stone-900 mt-1">Kết quả khớp nối Ngành & Trường</h2>
                  <p className="text-sm text-stone-500">
                    Phân tích đa chiều từ 10 môn học, năng lực hành vi, đam mê và ma trận 12 nhóm ngành đại học 2026.
                  </p>
                </div>

                {/* Thanh nút xuất báo cáo */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintReport}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>🖨️</span> In / Tải Báo Cáo (PDF)
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadHtml}
                    className="px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>💾</span> Tải file HTML
                  </button>
                </div>
              </div>

              {/* BẢNG TOP 5 NGÀNH NGHỀ PHÙ HỢP NHẤT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-stone-800 uppercase tracking-wide flex items-center gap-2">
                    <span>🏆</span> Top 5 Ngành Phù Hợp Nhất (Chọn ngành để xem mô phỏng trường)
                  </h3>
                  <span className="text-xs text-stone-400 font-medium">Bấm vào ngành để chuyển đổi</span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {rankedMajors.slice(0, 5).map((major, idx) => {
                    const isSelected = activeMajor?.code === major.code;
                    const rankLabels = [
                      "Top 1 · Lựa chọn hàng đầu",
                      "Top 2 · Dự phòng chiến lược",
                      "Top 3 · Tiềm năng mở rộng",
                      "Top 4 · Thích ứng tốt",
                      "Top 5 · Thử sức mới"
                    ];

                    return (
                      <button
                        key={major.code}
                        type="button"
                        onClick={() => setSelectedMajorCode(major.code)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "bg-gradient-to-br from-amber-50 to-orange-50/80 border-amber-400 shadow-md ring-2 ring-amber-300/60"
                            : "bg-white border-stone-200 hover:border-amber-300 hover:bg-stone-50/50 shadow-xs"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                              {rankLabels[idx]}
                            </span>
                            <span className="text-lg font-black text-amber-600">
                              {major.matchPercentage}%
                            </span>
                          </div>

                          <h4 className="font-extrabold text-sm text-stone-900 leading-snug">
                            {major.name}
                          </h4>

                          <div className="text-[11px] font-bold text-stone-500">
                            {major.field}
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 font-medium">
                            {isSelected ? "🟢 Đang phân tích" : "👉 Bấm chọn ngành này"}
                          </span>
                          <span className="font-bold text-stone-700">
                            Điểm sàn ~{major.avgCutoff}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CHI TIẾT ĐÁNH GIÁ CHUYÊN SÂU CỦA NGÀNH ĐANG CHỌN */}
              {activeMajor && (
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/40 to-yellow-50 border border-amber-200 shadow-sm space-y-4 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                          🎯 NGÀNH ĐANG PHÂN TÍCH CHI TIẾT
                        </span>
                        <span className="text-xs font-semibold text-stone-500">
                          Mã ngành: {activeMajor.code}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-stone-900 mt-1">
                        {activeMajor.name}
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5">{activeMajor.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-stone-500 font-bold uppercase">Mức độ tương thích</div>
                      <div className="text-4xl font-black text-amber-600">{activeMajor.matchPercentage}%</div>
                    </div>
                  </div>

                  {/* 4 THANH THÀNH PHẦN PHÙ HỢP */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80">
                      <div className="text-[10px] font-bold text-stone-500 uppercase">1. Học thuật (35%)</div>
                      <div className="text-base font-extrabold text-stone-900 mt-0.5">{activeMajor.academicScore}%</div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${activeMajor.academicScore}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80">
                      <div className="text-[10px] font-bold text-stone-500 uppercase">2. Năng lực (30%)</div>
                      <div className="text-base font-extrabold text-stone-900 mt-0.5">{activeMajor.abilityScore}%</div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${activeMajor.abilityScore}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80">
                      <div className="text-[10px] font-bold text-stone-500 uppercase">3. Đam mê (20%)</div>
                      <div className="text-base font-extrabold text-stone-900 mt-0.5">{activeMajor.interestScore}%</div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: `${activeMajor.interestScore}%` }} />
                      </div>
                    </div>

                    <div className="p-3 bg-white/90 rounded-xl border border-amber-200/80">
                      <div className="text-[10px] font-bold text-stone-500 uppercase">4. Giá trị (15%)</div>
                      <div className="text-base font-extrabold text-stone-900 mt-0.5">{activeMajor.valueScore}%</div>
                      <div className="h-1.5 w-full bg-stone-100 rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeMajor.valueScore}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* ĐIỂM MẠNH & LƯU Ý CÁ NHÂN HÓA */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-white/90 rounded-xl border border-emerald-200 shadow-2xs">
                      <span className="font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <span>✓</span> Điểm mạnh tương thích thực tế:
                      </span>
                      <p className="text-stone-700 mt-1 leading-relaxed">
                        {activeMajor.strengthNote}
                      </p>
                    </div>

                    <div className="p-3.5 bg-white/90 rounded-xl border border-rose-200 shadow-2xs">
                      <span className="font-extrabold text-rose-800 flex items-center gap-1.5">
                        <span>⚠️</span> Điểm cần lưu ý & chuẩn bị:
                      </span>
                      <p className="text-stone-700 mt-1 leading-relaxed">
                        {activeMajor.gapNote}
                      </p>
                    </div>
                  </div>

                  {/* TỐ CHẤT & KỸ NĂNG */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="font-bold text-stone-700">Đặc trưng thế mạnh của ngành:</span>
                    {activeMajor.pros.map((pro) => (
                      <span
                        key={pro}
                        className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 font-semibold text-[11px]"
                      >
                        ★ {pro}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* BỘ MÔ PHỎNG WHAT-IF */}
              <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-extrabold text-stone-900 flex items-center gap-2">
                    <span>🎛️</span>
                    <span>BỘ MÔ PHỎNG WHAT-IF: TÙY BIẾN ĐIỀU KIỆN TRƯỜNG</span>
                  </h4>
                  <span className="text-xs text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold">
                    Cập nhật danh sách trường tức thì
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 bg-white p-4 rounded-2xl border border-stone-200">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-stone-700">
                      <span>Điểm thi THPT dự kiến:</span>
                      <span className="text-amber-700 font-extrabold text-sm">
                        {formData.estimatedScore} điểm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="29.5"
                      step="0.25"
                      value={formData.estimatedScore}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedScore: parseFloat(e.target.value) })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>20.0 đ</span>
                      <span>25.0 đ</span>
                      <span>29.5 đ</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-stone-700">
                      <span>Học phí tối đa / năm:</span>
                      <span className="text-amber-700 font-extrabold text-sm">
                        {formData.tuitionBudget} triệu VNĐ
                      </span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="120"
                      step="5"
                      value={formData.tuitionBudget}
                      onChange={(e) =>
                        setFormData({ ...formData, tuitionBudget: parseInt(e.target.value) })
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400">
                      <span>15 tr</span>
                      <span>50 tr</span>
                      <span>120 tr</span>
                    </div>
                  </div>
                </div>

                {/* TAB BỘ LỌC */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-2">
                    <span className="text-xs font-bold text-stone-700 uppercase">
                      Tìm thấy {matchedUniversities.length} trường phù hợp:
                    </span>
                    <div className="flex gap-1.5 text-xs font-bold">
                      {(
                        [
                          { key: "ALL", label: "Tất cả" },
                          { key: "SAFE", label: "🟢 An toàn" },
                          { key: "TARGET", label: "🟡 Vừa sức" },
                          { key: "REACH", label: "🔴 Thử thách" },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          onClick={() => setUniTab(t.key)}
                          className={`px-3 py-1 rounded-lg border transition ${
                            uniTab === t.key
                              ? "bg-amber-500 text-white border-amber-500"
                              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DANH SÁCH CÁC TRƯỜNG ĐẠI HỌC DYNAMIC */}
                  <div className="grid gap-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {matchedUniversities.length === 0 ? (
                      <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500 space-y-1">
                        <p className="font-bold text-stone-700">Không tìm thấy trường nào trong khoảng lọc này.</p>
                        <p>Hãy thử tăng ngân sách học phí hoặc chọn khu vực &ldquo;Toàn quốc&rdquo;.</p>
                      </div>
                    ) : (
                      matchedUniversities.map((u) => (
                        <div
                          key={u.id}
                          className="p-4 bg-white rounded-2xl border border-stone-200 hover:border-amber-300 transition shadow-xs flex flex-wrap items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-[240px]">
                            <div className="flex items-center gap-2">
                              <h5 className="font-extrabold text-sm text-stone-900">{u.name}</h5>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                                {u.shortName}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500">
                              📍 {u.city} · Học phí: <strong className="text-stone-800">~{u.tuition} tr/năm</strong> · Việc làm: <strong className="text-emerald-700">{u.employmentRate}%</strong>
                            </p>
                            <p className="text-[11px] text-amber-900/80 italic">{u.highlight}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className={`text-xs font-bold px-3 py-1 rounded-lg border inline-block ${u.tierColor}`}>
                              {u.tierLabel} (Điểm chuẩn ~{u.cutoff})
                            </div>
                            <div className="text-[11px] text-stone-400 mt-1">
                              {u.delta >= 0 ? `Dư +${u.delta.toFixed(2)} đ` : `Thiếu ${Math.abs(u.delta).toFixed(2)} đ`}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NÚT ĐIỀU HƯỚNG */}
          <div className="flex justify-between items-center pt-6 border-t border-stone-100">
            <button
              type="button"
              disabled={currentChapter === 1}
              onClick={handlePrev}
              className="px-6 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-sm hover:bg-stone-50 disabled:opacity-30 transition"
            >
              ← Quay lại
            </button>

            {currentChapter < 9 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-extrabold text-sm shadow-sm transition transform active:scale-95 flex items-center gap-2"
              >
                <span>Màn tiếp theo</span>
                <span className="text-xs bg-amber-900/10 px-2 py-0.5 rounded-md">+120 XP</span>
                <span>→</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm shadow-sm transition flex items-center gap-2"
                >
                  <span>🖨️</span>
                  <span>In / Tải Báo Cáo (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-sm transition flex items-center gap-2"
                >
                  <span>💾</span>
                  <span>Lưu File Báo Cáo (HTML)</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}