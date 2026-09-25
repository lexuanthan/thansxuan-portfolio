"use client";

import React, { useState, useMemo } from "react";
import { MajorDNA, MajorMatchResult, StudentCareerProfile } from "@/lib/career-guidance/types";
import { MAJORS_DATA } from "@/lib/career-guidance/majorsData";
import { INDUSTRIES_DATA } from "@/lib/career-guidance/industriesData";
import { SmartNextAction } from "../common/SmartNextAction";
import {
  IconGraduationCap,
  IconSearch,
  IconBookmark,
  IconBot,
  IconArrowRight,
  IconX,
  IconCheck,
  IconBuilding2,
  IconTrendingUp,
  IconSparkles,
  IconAlertCircle,
  IconScale,
  IconInfo,
  IconUniversity,
  IconTarget,
  IconBookOpen
} from "../common/CareerIcons";

interface MajorExplorerViewProps {
  majorMatches?: MajorMatchResult[];
  profile?: StudentCareerProfile;
  onBookmarkItem: (type: "major", id: string) => void;
  isBookmarked: (type: "major", id: string) => boolean;
  onAskCoachAboutItem: (name: string) => void;
  onNavigateView?: (view: any) => void;
}

export function MajorExplorerView({
  majorMatches = [],
  profile,
  onBookmarkItem,
  isBookmarked,
  onAskCoachAboutItem,
  onNavigateView
}: MajorExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedMathIntensity, setSelectedMathIntensity] = useState("all");
  const [selectedMajor, setSelectedMajor] = useState<MajorDNA | null>(null);

  // Shortlist for Compare
  const [compareMajorIds, setCompareMajorIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Match lookup map
  const matchMap = useMemo(() => {
    const map = new Map<string, MajorMatchResult>();
    majorMatches.forEach((m) => map.set(m.major.id, m));
    return map;
  }, [majorMatches]);

  const hasRecommendations = majorMatches.length > 0;

  const filteredMajors = useMemo(() => {
    return MAJORS_DATA.filter((m) => {
      if (selectedIndustry !== "all" && m.industry_id !== selectedIndustry) return false;
      if (selectedDifficulty !== "all" && m.difficulty_level !== selectedDifficulty) return false;
      if (selectedMathIntensity !== "all" && m.academic_requirements.math_intensity !== selectedMathIntensity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = m.name.toLowerCase().includes(q);
        const inCode = m.code.includes(q);
        const inDesc = m.description.toLowerCase().includes(q);
        if (!inName && !inCode && !inDesc) return false;
      }
      return true;
    });
  }, [searchQuery, selectedIndustry, selectedDifficulty, selectedMathIntensity]);

  const toggleCompare = (id: string) => {
    setCompareMajorIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        alert("Bạn có thể so sánh tối đa 3 ngành đào tạo cùng lúc.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const comparedMajors = useMemo(() => {
    return MAJORS_DATA.filter((m) => compareMajorIds.includes(m.id));
  }, [compareMajorIds]);

  return (
    <div className="space-y-8" data-testid="major-explorer-view">
      {/* ==================================================
          EMPTY STATE NOTIFICATION (Nếu chưa làm Assessment)
      ================================================== */}
      {!hasRecommendations && (
        <section
          data-testid="major-explorer-empty-state"
          className="rounded-xl border border-accent-red-200 bg-accent-red-50/70 p-5 shadow-sm dark:border-accent-red-950 dark:bg-accent-red-950/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-lg bg-accent-red-100 text-accent-red-800 dark:bg-accent-red-900/60 dark:text-accent-red-300 shrink-0 mt-0.5">
                <IconInfo className="w-5 h-5 text-accent-red-600" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Chưa có dữ liệu xếp hạng ngành cá nhân hóa
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Bạn cần hoàn thành bài Đánh giá Career Discovery để hệ thống phân tích độ khớp học thuật và đưa ra khuyến nghị chuẩn xác cho bạn.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateView?.("assessment")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-red-600 px-4 py-2 text-xs font-black text-white hover:bg-accent-red-700 transition shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              <span>Làm bài đánh giá ngay</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ==================================================
          HEADER & FILTERS (HCMUTE Blue + Red Accent)
      ================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-accent-red-50 px-3 py-1 text-xs font-bold text-accent-red-700 border border-accent-red-200 dark:bg-accent-red-950/40 dark:text-accent-red-300 dark:border-accent-red-800">
              <IconGraduationCap className="w-3.5 h-3.5 text-accent-red-600" />
              <span>MAJOR EXPLORER • ACADEMIC INTELLIGENCE HCMUTE</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              Khám Phá Ngành Đào Tạo Đại Học (Major Explorer)
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Phân tích giáo trình học, độ khó học phần, cường độ Toán/Lập trình, tổ hợp môn xét tuyển và triển vọng việc làm theo chuẩn Trường ĐH Sư phạm Kỹ thuật TP.HCM.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <span>Hiển thị</span>
            <span className="text-brand-700 dark:text-brand-300 font-black">{filteredMajors.length}</span>
            <span>/ {MAJORS_DATA.length} ngành</span>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 pt-2">
          {/* Search Input */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên ngành, mã ngành (7480108)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Industry Filter */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Tất cả khối ngành ({MAJORS_DATA.length} ngành)</option>
            {INDUSTRIES_DATA.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Tất cả mức độ khó học thuật</option>
            <option value="Rất cao">Độ khó Rất cao (Toán & Nghiên cứu sâu)</option>
            <option value="Cao">Độ khó Cao</option>
            <option value="Vừa phải">Độ khó Vừa phải</option>
          </select>

          {/* Math Intensity Filter */}
          <select
            value={selectedMathIntensity}
            onChange={(e) => setSelectedMathIntensity(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:border-brand-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Tất cả cường độ môn Toán</option>
            <option value="Cao">Yêu cầu Toán Cao</option>
            <option value="Trung bình">Yêu cầu Toán Trung bình</option>
            <option value="Thấp">Yêu cầu Toán Thấp</option>
          </select>
        </div>
      </section>

      {/* ==================================================
          B. MAJOR CARDS GRID
      ================================================== */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMajors.map((m) => {
          const matchResult = matchMap.get(m.id);
          const matchScore = matchResult?.score;
          const bookmarked = isBookmarked("major", m.id);
          const compared = compareMajorIds.includes(m.id);

          return (
            <div
              key={m.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Header: Code & Match Score */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-accent-red-700 bg-accent-red-50 border border-accent-red-200 rounded px-2 py-0.5 dark:bg-accent-red-950/40 dark:text-accent-red-300 dark:border-accent-red-800">
                      Mã: {m.code}
                    </span>
                    {matchScore !== undefined ? (
                      <span className="text-[10px] font-black text-brand-900 bg-brand-50 border border-brand-200 rounded px-2 py-0.5 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800">
                        {matchScore}% Khớp
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded px-2 py-0.5 dark:bg-slate-800">
                        Khám phá mở
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleCompare(m.id)}
                      className={`p-1.5 rounded transition cursor-pointer text-xs ${
                        compared ? "text-brand-700 bg-brand-50 font-bold" : "text-slate-400 hover:text-slate-600"
                      }`}
                      title={compared ? "Bỏ chọn so sánh" : "Thêm vào so sánh"}
                    >
                      <IconScale className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onBookmarkItem("major", m.id)}
                      className={`p-1.5 rounded transition cursor-pointer ${
                        bookmarked ? "text-accent-red-600 bg-accent-red-50" : "text-slate-400 hover:text-accent-red-600"
                      }`}
                    >
                      <IconBookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Major Name & Description */}
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                    {m.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                {/* Major DNA Quick Specs */}
                <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-3 space-y-1.5 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tổ hợp môn:</span>
                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                      {m.academic_requirements.required_subjects.join(", ")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Cường độ Toán:</span>
                    <span className="font-bold text-brand-900 dark:text-brand-300">
                      {m.academic_requirements.math_intensity}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Độ khó CT:</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {m.difficulty_level}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Điểm chuẩn TB:</span>
                    <span className="font-extrabold text-accent-red-700 dark:text-accent-red-400 font-mono">
                      ~{m.academic_requirements.avg_cutoff_score}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedMajor(m)}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-900 px-3 py-2 text-xs font-bold text-slate-700 transition text-center cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Xem Major DNA
                  </button>

                  <button
                    onClick={() => onAskCoachAboutItem(m.name)}
                    className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-900 hover:bg-brand-100 transition cursor-pointer flex items-center gap-1"
                    title="Hỏi AI Coach về ngành này"
                  >
                    <IconBot className="w-3.5 h-3.5 text-brand-700" />
                    <span>Hỏi AI</span>
                  </button>
                </div>

                <button
                  onClick={() => onNavigateView?.("universities")}
                  className="w-full rounded-lg bg-brand-900 px-3 py-2 text-xs font-bold text-white hover:bg-brand-800 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <IconUniversity className="w-3.5 h-3.5 text-sky-300" />
                  <span>Xem trường đào tạo (HCMUTE)</span>
                  <IconArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================
          B. MAJOR DETAIL MODAL: Major DNA + WHY FITS / CHALLENGES
      ================================================== */}
      {selectedMajor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-accent-red-700 bg-accent-red-50 border border-accent-red-200 px-2 py-0.5 rounded">
                  Mã ngành: {selectedMajor.code} • {selectedMajor.industry_name}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                  {selectedMajor.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedMajor.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedMajor(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Major DNA Full Grid */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-850 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-2 uppercase tracking-wider text-[11px]">
                  Bản Đồ Năng Lực Học Thuật (Major DNA)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="rounded-md bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Cường độ Toán</span>
                    <span className="font-black text-brand-900 dark:text-brand-300 text-sm">
                      {selectedMajor.academic_requirements.math_intensity}
                    </span>
                  </div>
                  <div className="rounded-md bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Lập trình / Kỹ thuật</span>
                    <span className="font-black text-brand-900 dark:text-brand-300 text-sm">
                      {selectedMajor.academic_requirements.required_subjects.includes("Tin học") ? "Cao" : "Trung bình"}
                    </span>
                  </div>
                  <div className="rounded-md bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Tỷ lệ Thực hành</span>
                    <span className="font-black text-accent-red-700 dark:text-accent-red-400 text-sm">
                      ~60% Xưởng Lab
                    </span>
                  </div>
                  <div className="rounded-md bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Khối lượng Tải</span>
                    <span className="font-black text-slate-800 dark:text-slate-200 text-sm">
                      {selectedMajor.difficulty_level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Core Subjects & Learning Content */}
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-850 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1.5 uppercase tracking-wider text-[11px]">
                  Tổ hợp môn & Khối kiến thức cốt lõi (Core Subjects)
                </span>
                <p className="mb-2">
                  <strong>Tổ hợp môn xét tuyển: </strong>
                  {selectedMajor.academic_requirements.required_subjects.join(", ")}
                </p>
                <ul className="space-y-1 pl-4 list-disc">
                  {selectedMajor.learning_content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Career Paths */}
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-850 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1.5 uppercase tracking-wider text-[11px]">
                  Cơ hội việc làm sau tốt nghiệp (Career Paths)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMajor.career_paths.map((cp, i) => (
                    <span
                      key={i}
                      className="rounded px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                    >
                      • {cp}
                    </span>
                  ))}
                </div>
              </div>

              {/* REQUIRED: WHY THIS FITS YOU */}
              <div className="rounded-lg bg-emerald-50/70 p-4 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
                <span className="font-black text-emerald-950 dark:text-emerald-200 block mb-1 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <IconCheck className="w-4 h-4 text-emerald-600" />
                  <span>WHY THIS FITS YOU (Vì sao ngành này phù hợp với bạn)</span>
                </span>
                <p className="text-emerald-900 dark:text-emerald-300">
                  {matchMap.get(selectedMajor.id)?.reasons?.positive_factors?.[0] ||
                    "Năng lực tư duy logic và thành tích học tập các môn Tự nhiên của bạn đáp ứng xuất sắc ngưỡng đầu vào và năng lực tiếp thu chương trình đào tạo."}
                </p>
              </div>

              {/* REQUIRED: WHAT MAY CHALLENGE YOU */}
              <div className="rounded-lg bg-accent-red-50/70 p-4 border border-accent-red-200 dark:bg-accent-red-950/30 dark:border-accent-red-900">
                <span className="font-black text-accent-red-950 dark:text-accent-red-200 block mb-1 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <IconAlertCircle className="w-4 h-4 text-accent-red-600" />
                  <span>WHAT MAY CHALLENGE YOU (Những thách thức tiềm ẩn bạn cần lưu ý)</span>
                </span>
                <p className="text-accent-red-900 dark:text-accent-red-300">
                  {matchMap.get(selectedMajor.id)?.reasons?.considerations?.[0] ||
                    "Học phần đồ án chuyên ngành và xưởng thực hành đòi hỏi sự kiên trì cao; cần cân bằng giữa việc nghiên cứu thuật toán và kỹ năng hiện thực hóa sản phẩm."}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                onClick={() => setSelectedMajor(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const name = selectedMajor.name;
                    setSelectedMajor(null);
                    onAskCoachAboutItem(name);
                  }}
                  className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-bold text-brand-900 hover:bg-brand-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <IconBot className="w-4 h-4 text-brand-700" />
                  <span>Hỏi AI Coach</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedMajor(null);
                    onNavigateView?.("universities");
                  }}
                  className="rounded-lg bg-brand-900 px-4 py-2 text-xs font-black text-white hover:bg-brand-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <IconUniversity className="w-4 h-4 text-sky-300" />
                  <span>Xem trường đào tạo (HCMUTE)</span>
                  <IconArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          COMPARE MODAL & STICKY TRAY
      ================================================== */}
      {showCompareModal && comparedMajors.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-accent-red-700 bg-accent-red-50 border border-accent-red-200 px-2 py-0.5 rounded">
                  Bảng So Sánh Ngành Đào Tạo
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Đối Chiếu Đa Tiêu Chí Chương Trình Đại Học
                </h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${comparedMajors.length}, minmax(0, 1fr))` }}
            >
              {comparedMajors.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-850"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-accent-red-700 bg-accent-red-50 px-2 py-0.5 rounded">
                      Mã: {m.code}
                    </span>
                    <button
                      onClick={() => toggleCompare(m.id)}
                      className="text-xs text-slate-400 hover:text-accent-red-600"
                    >
                      Bỏ chọn
                    </button>
                  </div>

                  <h4 className="font-black text-slate-900 dark:text-white text-base">
                    {m.name}
                  </h4>

                  <div className="text-xs space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Độ khó:</span>
                      <span className="font-bold">{m.difficulty_level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cường độ Toán:</span>
                      <span className="font-bold">{m.academic_requirements.math_intensity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Điểm chuẩn TB:</span>
                      <span className="font-bold text-accent-red-600">~{m.academic_requirements.avg_cutoff_score}đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                onClick={() => setShowCompareModal(false)}
                className="rounded-lg bg-slate-200 dark:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-800 dark:text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Shortlist Bar */}
      {compareMajorIds.length > 0 && !showCompareModal && (
        <aside
          aria-label="Thanh so sánh ngành học"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl rounded-xl border border-slate-300 bg-slate-900 text-white p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-red-600 font-black text-xs text-white">
              {compareMajorIds.length}
            </span>
            <span className="text-xs font-semibold">
              Đã chọn {compareMajorIds.length}/3 ngành để so sánh
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareMajorIds([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Hủy
            </button>
            <button
              onClick={() => setShowCompareModal(true)}
              className="rounded-lg bg-accent-red-600 px-4 py-1.5 text-xs font-black text-white hover:bg-accent-red-700 transition shadow-sm"
            >
              So sánh ngay →
            </button>
          </div>
        </aside>
      )}

      {/* Smart Next Action */}
      <SmartNextAction
        currentView="major_explorer"
        onNavigate={(nextView) => {
          if (onNavigateView) {
            onNavigateView(nextView || "universities");
          }
        }}
        onAskCoach={() => onAskCoachAboutItem(filteredMajors[0]?.name || "ngành đào tạo")}
        customTitle="Tiếp tục chọn Trường Đại Học phù hợp hoặc thiết lập Lộ Trình"
        customDesc="Chuyển sang Chặng 06: Khám phá trường đại học và điểm chuẩn tuyển sinh HCMUTE."
      />
    </div>
  );
}
