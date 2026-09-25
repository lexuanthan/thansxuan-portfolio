"use client";

import React, { useState, useMemo } from "react";
import { CareerDNA, CareerMatchResult, StudentCareerProfile } from "@/lib/career-guidance/types";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { INDUSTRIES_DATA } from "@/lib/career-guidance/industriesData";
import { SmartNextAction } from "../common/SmartNextAction";
import {
  IconBriefcase,
  IconBookmark,
  IconSearch,
  IconBot,
  IconSparkles,
  IconArrowRight,
  IconX,
  IconTrendingUp,
  IconShield,
  IconCheck,
  IconAlertCircle,
  IconScale,
  IconTarget,
  IconZap,
  IconAward,
  IconInfo
} from "../common/CareerIcons";

interface CareerExplorerViewProps {
  careerMatches?: CareerMatchResult[];
  profile?: StudentCareerProfile;
  onSelectCareerForRoadmap: (careerId: string) => void;
  onAskCoachAboutItem: (name: string) => void;
  onBookmarkItem: (type: "career", id: string) => void;
  isBookmarked: (type: "career", id: string) => boolean;
  onNavigateView?: (view: any) => void;
}

export function CareerExplorerView({
  careerMatches = [],
  profile,
  onSelectCareerForRoadmap,
  onAskCoachAboutItem,
  onBookmarkItem,
  isBookmarked,
  onNavigateView
}: CareerExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedAiExposure, setSelectedAiExposure] = useState<string>("all");
  const [selectedSalary, setSelectedSalary] = useState<string>("all");
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string>("all");
  const [selectedCareer, setSelectedCareer] = useState<CareerDNA | null>(null);

  // Shortlist for Compare
  const [compareCareerIds, setCompareCareerIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Match lookup map
  const matchMap = useMemo(() => {
    const map = new Map<string, CareerMatchResult>();
    careerMatches.forEach((m) => map.set(m.career.id, m));
    return map;
  }, [careerMatches]);

  const hasRecommendations = careerMatches.length > 0;

  // Filtered Careers
  const filteredCareers = useMemo(() => {
    return CAREERS_DATA.filter((c) => {
      if (selectedIndustry !== "all" && c.industry_id !== selectedIndustry) {
        return false;
      }
      if (selectedAiExposure !== "all" && c.ai_impact.automation_exposure !== selectedAiExposure) {
        return false;
      }
      if (selectedSalary !== "all") {
        if (selectedSalary === "high" && c.salary_range.senior_level_million < 50) return false;
        if (selectedSalary === "medium" && (c.salary_range.senior_level_million < 30 || c.salary_range.senior_level_million >= 50)) return false;
      }
      if (selectedWorkStyle !== "all") {
        if (selectedWorkStyle === "practice" && (c.work_style.theory_vs_practice ?? 0) < 20) return false;
        if (selectedWorkStyle === "independent" && (c.work_style.independent_vs_team ?? 0) > 0) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = c.name.toLowerCase().includes(q);
        const inTagline = c.tagline.toLowerCase().includes(q);
        const inTags = c.tags?.some((t) => t.toLowerCase().includes(q));
        if (!inName && !inTagline && !inTags) return false;
      }
      return true;
    });
  }, [searchQuery, selectedIndustry, selectedAiExposure, selectedSalary, selectedWorkStyle]);

  const toggleCompare = (id: string) => {
    setCompareCareerIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        alert("Bạn có thể so sánh tối đa 3 nghề cùng lúc.");
        return prev;
      }
      return [...prev, id];
    });
  };

  const comparedCareers = useMemo(() => {
    return CAREERS_DATA.filter((c) => compareCareerIds.includes(c.id));
  }, [compareCareerIds]);

  return (
    <div className="space-y-8" data-testid="career-explorer-view">
      {/* ==================================================
          EMPTY STATE NOTIFICATION (Nếu chưa làm Assessment)
      ================================================== */}
      {!hasRecommendations && (
        <section
          data-testid="career-explorer-empty-state"
          className="rounded-xl border border-sky-200 bg-sky-50/80 p-5 shadow-sm dark:border-sky-900/50 dark:bg-sky-950/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 shrink-0 mt-0.5">
                <IconInfo className="w-5 h-5 text-sky-600" />
              </span>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Chưa có dữ liệu đánh giá cá nhân (Personal Career DNA)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Bạn cần hoàn thành bài Đánh giá Career Discovery để hệ thống phân tích độ khớp và đưa ra khuyến nghị chuẩn xác cho bạn.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateView?.("assessment")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-900 px-4 py-2 text-xs font-black text-white hover:bg-brand-800 transition shrink-0 cursor-pointer shadow-sm active:scale-95"
            >
              <span>Làm bài đánh giá ngay (7 chặng)</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* ==================================================
          HEADER & SEARCH / FILTER PANEL
      ================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-sky-50 px-3 py-1 text-xs font-bold text-sky-900 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
              <IconBriefcase className="w-3.5 h-3.5 text-sky-600" />
              <span>CAREER EXPLORER • CÔNG NGHỆ & TƯƠNG LAI NGHỀ NGHIỆP</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              Khám Phá Chi Tiết Nghề Nghiệp (Career Explorer)
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Tra cứu thông tin chi tiết về nhiệm vụ hằng ngày, dải thu nhập thực tế, nấc thang thăng tiến và tác động chuyển đổi của AI đối với các ngành nghề trọng điểm.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <span>Hiển thị</span>
            <span className="text-brand-700 dark:text-brand-300 font-black">{filteredCareers.length}</span>
            <span>/ {CAREERS_DATA.length} nghề</span>
          </div>
        </div>

        {/* Search & Filters Grid */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 pt-2">
          {/* Search */}
          <div className="relative">
            <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên nghề, kỹ năng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Industry Filter */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Tất cả lĩnh vực ({CAREERS_DATA.length} nghề)</option>
            {INDUSTRIES_DATA.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>

          {/* AI Exposure Filter */}
          <select
            value={selectedAiExposure}
            onChange={(e) => setSelectedAiExposure(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Tất cả mức độ tự động hóa AI</option>
            <option value="Thấp">Nguy cơ tự động hóa Thấp (An toàn)</option>
            <option value="Trung bình">Nguy cơ tự động hóa Trung bình</option>
            <option value="Cao">Nguy cơ tự động hóa Cao</option>
          </select>

          {/* Salary Filter */}
          <select
            value={selectedSalary}
            onChange={(e) => setSelectedSalary(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-brand-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">Tất cả dải thu nhập</option>
            <option value="high">Thu nhập cấp cao &ge; 50 tr/tháng</option>
            <option value="medium">Thu nhập cấp cao 30 - 50 tr/tháng</option>
          </select>
        </div>
      </section>

      {/* ==================================================
          A. CAREER CARDS GRID
      ================================================== */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCareers.map((c) => {
          const matchResult = matchMap.get(c.id);
          const matchScore = matchResult?.score;
          const bookmarked = isBookmarked("career", c.id);
          const compared = compareCareerIds.includes(c.id);

          return (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Header: Cluster & Match Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 rounded px-2 py-0.5 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
                      {c.industry_name}
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
                      onClick={() => toggleCompare(c.id)}
                      className={`p-1.5 rounded transition cursor-pointer text-xs ${
                        compared ? "text-brand-700 bg-brand-50 font-bold" : "text-slate-400 hover:text-slate-600"
                      }`}
                      title={compared ? "Bỏ chọn so sánh" : "Thêm vào so sánh"}
                    >
                      <IconScale className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onBookmarkItem("career", c.id)}
                      className={`p-1.5 rounded transition cursor-pointer ${
                        bookmarked ? "text-accent-red-600 bg-accent-red-50" : "text-slate-400 hover:text-accent-red-600"
                      }`}
                    >
                      <IconBookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>

                {/* Job Title & Tagline */}
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-2">
                    &ldquo;{c.tagline}&rdquo;
                  </p>
                </div>

                {/* Core Specifications Table */}
                <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-3 space-y-1.5 border border-slate-100 dark:border-slate-800 text-xs">
                  {/* Salary Range */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mức lương VN:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {c.salary_range.entry_level_million} - {c.salary_range.senior_level_million} tr/tháng
                    </span>
                  </div>

                  {/* Demand Trend */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Nhu cầu tuyển dụng:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <IconTrendingUp className="w-3 h-3" />
                      <span>Tăng trưởng mạnh</span>
                    </span>
                  </div>

                  {/* AI Exposure */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tác động AI:</span>
                    <span className="font-bold text-brand-700 dark:text-brand-300">
                      {c.ai_impact.automation_exposure} nguy cơ • {c.ai_impact.ai_augmentation_level} hỗ trợ
                    </span>
                  </div>

                  {/* Work Style */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Phong cách:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {(c.work_style.theory_vs_practice ?? 0) >= 0 ? "Thực hành ứng dụng" : "Nghiên cứu sâu"}
                    </span>
                  </div>

                  {/* Education Requirement */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Học vấn yêu cầu:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Cử nhân / Kỹ sư ĐH
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCareer(c)}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-900 px-3 py-2 text-xs font-bold text-slate-700 transition text-center cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Xem chi tiết nghề
                  </button>

                  <button
                    onClick={() => onAskCoachAboutItem(c.name)}
                    className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100 transition cursor-pointer flex items-center gap-1"
                    title="Hỏi AI Coach về nghề này"
                  >
                    <IconBot className="w-3.5 h-3.5 text-sky-700" />
                    <span>Hỏi AI</span>
                  </button>
                </div>

                <button
                  onClick={() => onSelectCareerForRoadmap(c.id)}
                  className="w-full rounded-lg bg-brand-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-brand-800 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Chọn làm mục tiêu lộ trình</span>
                  <IconArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================
          A. CAREER DETAIL MODAL (8 Tiêu Chí)
      ================================================== */}
      {selectedCareer && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                  {selectedCareer.industry_name}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1.5">
                  {selectedCareer.name}
                </h2>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  &ldquo;{selectedCareer.tagline}&rdquo;
                </p>
              </div>
              <button
                onClick={() => setSelectedCareer(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* 8 Structured Detail Sections */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {/* 1. Role Overview */}
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-850 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1 uppercase tracking-wider text-[11px]">
                  1. Tổng quan vai trò (Role Overview)
                </span>
                <p>{selectedCareer.description}</p>
              </div>

              {/* 2. Daily Work */}
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-850 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1.5 uppercase tracking-wider text-[11px]">
                  2. Công việc hằng ngày (Daily Work)
                </span>
                <ul className="space-y-1.5 pl-4 list-disc">
                  {selectedCareer.daily_tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                  ))}
                </ul>
              </div>

              {/* 3. Skills & Capabilities */}
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-850 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1.5 uppercase tracking-wider text-[11px]">
                  3. Kỹ năng & Năng lực yêu cầu (Skills)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCareer.tags.map((t, i) => (
                    <span
                      key={i}
                      className="rounded px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                    >
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* 4. Environment & Culture */}
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-850 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1 uppercase tracking-wider text-[11px]">
                  4. Môi trường & Phong cách làm việc (Environment)
                </span>
                <p>
                  Môi trường chú trọng tính độc lập và tư duy giải quyết vấn đề có cấu trúc. Phù hợp nhất với người thích làm việc theo kết quả đầu ra thực tế, có nhịp độ linh hoạt và cởi mở với thử nghiệm kỹ thuật mới.
                </p>
              </div>

              {/* 5. Career Progression & Growth */}
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-850 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1.5 uppercase tracking-wider text-[11px]">
                  5. Nấc thang thăng tiến (Growth & Progression)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedCareer.career_progression.map((step, i) => (
                    <React.Fragment key={i}>
                      <span className="rounded bg-sky-100 dark:bg-sky-950/60 px-2.5 py-1 font-bold text-sky-900 dark:text-sky-300">
                        {step}
                      </span>
                      {i < selectedCareer.career_progression.length - 1 && (
                        <span className="text-slate-400 font-bold">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 6. Future Outlook & AI Impact */}
              <div className="rounded-lg bg-sky-50/70 p-4 border border-sky-200 dark:bg-sky-950/30 dark:border-sky-900">
                <span className="font-extrabold text-sky-950 dark:text-sky-200 block mb-1 uppercase tracking-wider text-[11px]">
                  6. Triển vọng tương lai & Lợi thế con người (Future Outlook)
                </span>
                <p className="mb-2">{selectedCareer.ai_impact.summary}</p>
                <p>
                  <strong className="text-sky-900 dark:text-sky-300">Lợi thế nhân bản cốt lõi: </strong>
                  {selectedCareer.ai_impact.human_advantage}
                </p>
              </div>

              {/* 7. WHY THIS FITS YOU */}
              <div className="rounded-lg bg-emerald-50/70 p-4 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
                <span className="font-black text-emerald-950 dark:text-emerald-200 block mb-1 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <IconCheck className="w-4 h-4 text-emerald-600" />
                  <span>7. WHY THIS FITS YOU (Vì sao nghề này phù hợp với bạn)</span>
                </span>
                <p className="text-emerald-900 dark:text-emerald-300">
                  {matchMap.get(selectedCareer.id)?.reasons?.positive_factors?.[0] ||
                    "Hồ sơ Career DNA của bạn phản ánh sự tương thích mạnh mẽ giữa năng lực giải quyết vấn đề kỹ thuật và sở thích công nghệ số thực tiễn."}
                </p>
              </div>

              {/* 8. CHALLENGES */}
              <div className="rounded-lg bg-amber-50/70 p-4 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
                <span className="font-black text-amber-950 dark:text-amber-200 block mb-1 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <IconAlertCircle className="w-4 h-4 text-amber-600" />
                  <span>8. CHALLENGES (Thách thức & Điểm cần lưu ý)</span>
                </span>
                <p className="text-amber-900 dark:text-amber-300">
                  {matchMap.get(selectedCareer.id)?.reasons?.considerations?.[0] ||
                    "Tốc độ thay đổi công nghệ nhanh đòi hỏi tinh thần tự học liên tục; áp lực tối ưu hóa sản phẩm và giải quyết sự cố trong thời gian gấp."}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                onClick={() => setSelectedCareer(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const name = selectedCareer.name;
                    setSelectedCareer(null);
                    onAskCoachAboutItem(name);
                  }}
                  className="rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <IconBot className="w-4 h-4 text-sky-700" />
                  <span>Hỏi AI Coach</span>
                </button>

                <button
                  onClick={() => {
                    const id = selectedCareer.id;
                    setSelectedCareer(null);
                    onSelectCareerForRoadmap(id);
                  }}
                  className="rounded-lg bg-brand-900 px-4 py-2 text-xs font-black text-white hover:bg-brand-800 transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>Chọn làm mục tiêu lộ trình</span>
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
      {showCompareModal && comparedCareers.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                  Bảng So Sánh Nghề Nghiệp
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  Đối Chiếu Đa Tiêu Chí Trực Tiếp
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
              style={{ gridTemplateColumns: `repeat(${comparedCareers.length}, minmax(0, 1fr))` }}
            >
              {comparedCareers.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-850"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                      {c.industry_name}
                    </span>
                    <button
                      onClick={() => toggleCompare(c.id)}
                      className="text-xs text-slate-400 hover:text-accent-red-600"
                    >
                      Bỏ chọn
                    </button>
                  </div>

                  <h4 className="font-black text-slate-900 dark:text-white text-base">
                    {c.name}
                  </h4>

                  <div className="text-xs space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mức lương:</span>
                      <span className="font-bold">{c.salary_range.senior_level_million} tr/tháng</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tự động hóa:</span>
                      <span className="font-bold">{c.ai_impact.automation_exposure}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowCompareModal(false);
                      onSelectCareerForRoadmap(c.id);
                    }}
                    className="w-full rounded-md bg-brand-900 py-1.5 text-xs font-bold text-white hover:bg-brand-800"
                  >
                    Chọn làm lộ trình
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              {onNavigateView && (
                <button
                  onClick={() => {
                    setShowCompareModal(false);
                    onNavigateView("compare");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 transition cursor-pointer"
                >
                  <IconScale className="w-3.5 h-3.5 text-sky-600" />
                  <span>Mở Bàn làm việc So sánh chuyên sâu →</span>
                </button>
              )}
              <button
                onClick={() => setShowCompareModal(false)}
                className="rounded-lg bg-slate-200 dark:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Shortlist Bar */}
      {compareCareerIds.length > 0 && !showCompareModal && (
        <aside
          aria-label="Thanh so sánh nghề nghiệp"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl rounded-xl border border-slate-300 bg-slate-900 text-white p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-600 font-black text-xs text-white">
              {compareCareerIds.length}
            </span>
            <span className="text-xs font-semibold">
              Đã chọn {compareCareerIds.length}/3 nghề để so sánh
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareCareerIds([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Hủy
            </button>
            <button
              onClick={() => setShowCompareModal(true)}
              className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-black text-white hover:bg-sky-500 transition shadow-sm"
            >
              So sánh ngay →
            </button>
          </div>
        </aside>
      )}

      {/* Smart Next Action */}
      <SmartNextAction
        currentView="career_explorer"
        onNavigate={(nextView) => {
          if (onNavigateView) {
            onNavigateView(nextView);
          } else if (filteredCareers.length > 0) {
            onSelectCareerForRoadmap(filteredCareers[0].id);
          }
        }}
        onAskCoach={() => onAskCoachAboutItem(filteredCareers[0]?.name || "nghề nghiệp")}
        customTitle="Tiếp tục khám phá Ngành Đào Tạo hoặc thiết lập Lộ Trình"
        customDesc="Chuyển sang Chặng 05: Khám phá ngành đại học HCMUTE hoặc bấm 'Chọn làm mục tiêu lộ trình' ở thẻ phía trên."
      />
    </div>
  );
}
