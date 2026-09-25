"use client";

import React, { useState, useMemo } from "react";
import {
  CareerMatchResult,
  MajorMatchResult,
  MatchScoreReason
} from "@/lib/career-guidance/types";
import { INDUSTRIES_DATA } from "@/lib/career-guidance/industriesData";
import { MetricGauge } from "../common/MetricGauge";
import { SmartNextAction } from "../common/SmartNextAction";
import {
  IconTarget,
  IconBriefcase,
  IconGraduationCap,
  IconCompass,
  IconBookmark,
  IconBot,
  IconArrowRight,
  IconCheck,
  IconAlertCircle,
  IconSparkles,
  IconX,
  IconInfo,
  IconScale,
  IconAward,
  IconZap,
  IconSearch,
  IconUniversity
} from "../common/CareerIcons";

interface MatchesViewProps {
  careerMatches?: CareerMatchResult[];
  majorMatches?: MajorMatchResult[];
  onSelectCareerForRoadmap: (careerId: string) => void;
  onBookmarkItem: (type: "career" | "major", id: string) => void;
  isBookmarked: (type: "career" | "major", id: string) => boolean;
  onAskCoachAboutItem: (name: string) => void;
  onNavigateView?: (view: any) => void;
}

export function MatchesView({
  careerMatches = [],
  majorMatches = [],
  onSelectCareerForRoadmap,
  onBookmarkItem,
  isBookmarked,
  onAskCoachAboutItem,
  onNavigateView
}: MatchesViewProps) {
  const [activeTab, setActiveTab] = useState<"careers" | "majors" | "industries">("careers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedMatchTier, setSelectedMatchTier] = useState<string>("all");
  const [selectedAiImpact, setSelectedAiImpact] = useState<string>("all");
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Compare Shortlist Workspace
  const [compareItems, setCompareItems] = useState<{ id: string; type: "career" | "major"; name: string; score: number }[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // XAI Explainability Modal State
  const [explainModalData, setExplainModalData] = useState<{
    title: string;
    score: number;
    label: string;
    confidence: number;
    type: "career" | "major";
    reasons: MatchScoreReason;
    salaryOrCutoff?: string;
    aiOutlook?: string;
    keyStrengths?: string[];
  } | null>(null);

  // Filter Careers
  const filteredCareers = useMemo(() => {
    return (careerMatches || []).filter((m) => {
      const c = m.career;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesTagline = c.tagline.toLowerCase().includes(q);
        const matchesTags = c.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesTagline && !matchesTags) return false;
      }
      if (selectedIndustry !== "all" && c.industry_id !== selectedIndustry) {
        return false;
      }
      if (selectedMatchTier !== "all") {
        if (selectedMatchTier === "high" && m.score < 85) return false;
        if (selectedMatchTier === "medium" && (m.score < 70 || m.score >= 85)) return false;
        if (selectedMatchTier === "potential" && m.score >= 70) return false;
      }
      if (selectedAiImpact !== "all") {
        if (selectedAiImpact === "augmentation" && c.ai_impact.ai_augmentation_level !== "Rất cao" && c.ai_impact.ai_augmentation_level !== "Cao") return false;
        if (selectedAiImpact === "low_exposure" && c.ai_impact.automation_exposure !== "Thấp") return false;
      }
      if (selectedWorkStyle !== "all") {
        if (selectedWorkStyle === "practice" && (c.work_style.theory_vs_practice ?? 0) < 20) return false;
        if (selectedWorkStyle === "independent" && (c.work_style.independent_vs_team ?? 0) > 0) return false;
        if (selectedWorkStyle === "team" && (c.work_style.independent_vs_team ?? 0) <= 0) return false;
      }
      if (selectedSkill !== "all") {
        if (selectedSkill === "analytical" && (c.required_capabilities?.analytical_thinking ?? 0) < 70) return false;
        if (selectedSkill === "logical" && (c.required_capabilities?.logical_thinking ?? 0) < 70) return false;
        if (selectedSkill === "problem_solving" && (c.required_capabilities?.problem_solving ?? 0) < 70) return false;
      }
      return true;
    });
  }, [careerMatches, searchQuery, selectedIndustry, selectedMatchTier, selectedAiImpact, selectedWorkStyle, selectedSkill]);

  // Filter Majors
  const filteredMajors = useMemo(() => {
    return (majorMatches || []).filter((m) => {
      const maj = m.major;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = maj.name.toLowerCase().includes(q);
        const matchesCode = maj.code.toLowerCase().includes(q);
        const matchesDesc = maj.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesDesc) return false;
      }
      if (selectedIndustry !== "all" && maj.industry_id !== selectedIndustry) {
        return false;
      }
      if (selectedMatchTier !== "all") {
        if (selectedMatchTier === "high" && m.score < 85) return false;
        if (selectedMatchTier === "medium" && (m.score < 70 || m.score >= 85)) return false;
        if (selectedMatchTier === "potential" && m.score >= 70) return false;
      }
      return true;
    });
  }, [majorMatches, searchQuery, selectedIndustry, selectedMatchTier]);

  // Toggle Compare Item (Shortlist)
  const toggleCompare = (type: "career" | "major", id: string, name: string, score: number) => {
    setCompareItems((prev) => {
      const exists = prev.find((item) => item.id === id);
      if (exists) {
        return prev.filter((item) => item.id !== id);
      }
      if (prev.length >= 3) {
        alert("Bạn có thể so sánh tối đa 3 mục cùng lúc để đảm bảo tính trực quan.");
        return prev;
      }
      return [...prev, { id, type, name, score }];
    });
  };

  const isCompared = (id: string) => compareItems.some((item) => item.id === id);

  // Jump from Career to Related Major
  const handleJumpToMajor = (majorId: string) => {
    setActiveTab("majors");
    setSelectedIndustry("all");
    const foundMajor = majorMatches.find((m) => m.major.id === majorId);
    if (foundMajor) {
      setSearchQuery(foundMajor.major.name);
    }
  };

  // Jump from Major to University Explorer
  const handleJumpToUniversity = () => {
    if (onNavigateView) {
      onNavigateView("universities");
    }
  };

  // Top 3 Career & Major recommendations
  const top3Careers = (careerMatches || []).slice(0, 3);
  const top3Majors = (majorMatches || []).slice(0, 3);

  return (
    <div className="space-y-8" data-testid="matches-dashboard-view">
      {/* ==================================================
          DASHBOARD HEADER & TABS
      ================================================== */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-brand-50 px-3 py-1 text-xs font-bold text-brand-900 border border-brand-200 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800">
              <IconTarget className="w-3.5 h-3.5 text-accent-red-600" />
              <span>CAREER INTELLIGENCE MATCHING DASHBOARD</span>
              <span className="text-slate-400">•</span>
              <span>HCMUTE Decision Engine</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              Kết Quả So Khớp Nghề & Ngành Đào Tạo
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Thuật toán so khớp tất định phân tích 7 chiều khoa học: Năng lực (20%), Hứng thú (25%), Phong cách (15%), Giá trị (15%), Học thuật (10%), Mục tiêu (10%), Thực tế (5%). Điểm số được bảo đảm tính xác thực từ scoring engine.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab("careers")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                activeTab === "careers"
                  ? "bg-white text-brand-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <IconBriefcase className="w-4 h-4 text-brand-600" />
              <span>Nghề nghiệp ({careerMatches?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab("majors")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                activeTab === "majors"
                  ? "bg-white text-brand-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <IconGraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Ngành đào tạo ({majorMatches?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab("industries")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                activeTab === "industries"
                  ? "bg-white text-brand-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <IconCompass className="w-4 h-4 text-sky-600" />
              <span>Lĩnh vực ({INDUSTRIES_DATA.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Trigger Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "careers"
                  ? "Tìm nghề theo tên, kỹ năng, từ khóa..."
                  : activeTab === "majors"
                  ? "Tìm ngành đào tạo, mã ngành, môn học..."
                  : "Tìm kiếm lĩnh vực..."
              }
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                showFilters || selectedIndustry !== "all" || selectedMatchTier !== "all"
                  ? "border-brand-600 bg-brand-50 text-brand-900 dark:bg-brand-950/40 dark:text-brand-300"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              <span>Bộ lọc đa chiều</span>
              {(selectedIndustry !== "all" || selectedMatchTier !== "all" || selectedAiImpact !== "all") && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-red-600 text-[9px] font-black text-white">
                  !
                </span>
              )}
            </button>

            {compareItems.length > 0 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-900 px-4 py-2 text-xs font-extrabold text-white hover:bg-brand-800 transition cursor-pointer shadow-sm active:scale-95"
              >
                <IconScale className="w-3.5 h-3.5 text-sky-300" />
                <span>So sánh đã chọn ({compareItems.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Multi-dimensional Filter Bar */}
        {showFilters && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-850 animate-in fade-in duration-200">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
              {/* Filter 1: Industry */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nhóm ngành / Lĩnh vực:</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">Tất cả lĩnh vực ({INDUSTRIES_DATA.length})</option>
                  {INDUSTRIES_DATA.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Match Tier */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Mức độ phù hợp:</label>
                <select
                  value={selectedMatchTier}
                  onChange={(e) => setSelectedMatchTier(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">Tất cả mức điểm</option>
                  <option value="high">Rất phù hợp (≥ 85%)</option>
                  <option value="medium">Phù hợp cao (70% - 84%)</option>
                  <option value="potential">Có tiềm năng (&lt; 70%)</option>
                </select>
              </div>

              {/* Filter 3: AI Impact */}
              {activeTab === "careers" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Tác động của AI:</label>
                  <select
                    value={selectedAiImpact}
                    onChange={(e) => setSelectedAiImpact(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="all">Tất cả mức tác động</option>
                    <option value="augmentation">AI hỗ trợ tăng cường (Augmented)</option>
                    <option value="low_exposure">Ít nguy cơ tự động hóa</option>
                  </select>
                </div>
              )}

              {/* Filter 4: Work Style */}
              {activeTab === "careers" && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Phong cách làm việc:</label>
                  <select
                    value={selectedWorkStyle}
                    onChange={(e) => setSelectedWorkStyle(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="all">Tất cả phong cách</option>
                    <option value="practice">Thiên về Thực hành ứng dụng</option>
                    <option value="independent">Thiên về Độc lập tự chủ</option>
                    <option value="team">Thiên về Hợp tác đội nhóm</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelectedIndustry("all");
                  setSelectedMatchTier("all");
                  setSelectedAiImpact("all");
                  setSelectedWorkStyle("all");
                  setSelectedSkill("all");
                  setSearchQuery("");
                }}
                className="text-xs text-slate-500 hover:text-brand-700 underline font-medium cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ==================================================
          1. TOP MATCH SHOWCASE (Top 3 Cần Nổi Bật)
      ================================================== */}
      {activeTab === "careers" && top3Careers.length > 0 && !searchQuery && selectedIndustry === "all" && (
        <section className="space-y-4" data-testid="top-3-careers-showcase">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-accent-red-600 bg-accent-red-50 border border-accent-red-200 px-2 py-0.5 rounded">
                Khuyến Nghị Hàng Đầu
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <IconAward className="w-5 h-5 text-accent-red-600" />
                <span>Top 3 Nghề Nghiệp Khớp Nhất (Top Matches)</span>
              </h2>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Được phân tích sâu với 7 thông số chuẩn xác
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {top3Careers.map((m, idx) => {
              const { career, score, label, confidence } = m;
              const reasons = m?.reasons || { positive_factors: [], considerations: [] };
              const bookmarked = isBookmarked("career", career.id);
              const compared = isCompared(career.id);
              const rankTitles = ["#1 Top Match", "#2 High Match", "#3 Strong Match"];
              const rankBorder = idx === 0 ? "border-brand-600 ring-2 ring-brand-500/20" : "border-slate-200";

              return (
                <div
                  key={career.id}
                  className={`rounded-xl border ${rankBorder} bg-white p-6 shadow-md transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between`}
                >
                  <div className="space-y-4">
                    {/* Top Header: Rank Badge, Industry & Quick Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-brand-900 px-2.5 py-1 text-xs font-black text-white shadow-xs">
                          {rankTitles[idx]}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          {career.industry_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onBookmarkItem("career", career.id)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            bookmarked ? "text-accent-red-600 bg-accent-red-50" : "text-slate-400 hover:text-brand-600"
                          }`}
                          title={bookmarked ? "Đã lưu" : "Lưu nghề"}
                        >
                          <IconBookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Match Gauge */}
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                          {career.name}
                        </h3>
                        <p className="text-xs text-slate-500 italic mt-1 line-clamp-2">
                          &ldquo;{career.tagline}&rdquo;
                        </p>
                      </div>
                      <div className="text-center shrink-0">
                        <MetricGauge score={score} label={label} size={82} strokeWidth={7} />
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          Độ tin cậy: {Math.round(confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* 7 Required Structured Points */}
                    <div className="space-y-2.5 text-xs pt-1">
                      {/* 1. Fit Reason */}
                      <div className="rounded-lg bg-emerald-50/70 p-3 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
                        <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block mb-0.5 flex items-center gap-1.5">
                          <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lý do tương thích cốt lõi (Fit Reason):</span>
                        </span>
                        <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                          {reasons.positive_factors?.[0] || "Độ tương thích cao trên cả 7 trục năng lực và định hướng tương lai."}
                        </p>
                      </div>

                      {/* 2. Key Strengths Activated */}
                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-800">
                        <span className="font-bold text-slate-900 dark:text-white block mb-1">
                          Điểm mạnh kích hoạt:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {career.tags?.slice(0, 3).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="rounded px-2 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                            >
                              ✓ {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 3. Potential Challenge */}
                      {reasons.considerations && reasons.considerations.length > 0 && (
                        <div className="rounded-lg bg-amber-50/70 p-2.5 border border-amber-200 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                          <IconAlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            <strong>Thách thức tiềm ẩn:</strong> {reasons.considerations[0]}
                          </span>
                        </div>
                      )}

                      {/* 4. Outlook & AI Impact */}
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] dark:bg-slate-800/60 dark:border-slate-800">
                        <span className="text-slate-500">Triển vọng & AI:</span>
                        <span className="font-bold text-brand-900 dark:text-brand-300">
                          {career.ai_impact.ai_augmentation_level} AI hỗ trợ • {career.ai_impact.automation_exposure} nguy cơ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Next Step */}
                  <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setExplainModalData({
                            title: career.name,
                            score,
                            label,
                            confidence,
                            type: "career",
                            reasons,
                            salaryOrCutoff: `${career.salary_range.entry_level_million} - ${career.salary_range.senior_level_million} triệu/tháng`,
                            aiOutlook: career.ai_impact.summary,
                            keyStrengths: career.tags
                          })
                        }
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-900 transition text-center cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        AI giải thích vì sao phù hợp
                      </button>

                      <button
                        onClick={() => toggleCompare("career", career.id, career.name, score)}
                        className={`rounded-lg border px-3 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          compared
                            ? "border-brand-600 bg-brand-50 text-brand-900 dark:bg-brand-950 dark:text-brand-300"
                            : "border-slate-200 text-slate-600 hover:border-slate-400"
                        }`}
                        title="Thêm vào bảng so sánh"
                      >
                        <IconScale className="w-3.5 h-3.5" />
                        <span>{compared ? "Đã chọn" : "So sánh"}</span>
                      </button>
                    </div>

                    {/* From Career -> Related Majors */}
                    {career.related_major_ids && career.related_major_ids.length > 0 && (
                      <button
                        onClick={() => handleJumpToMajor(career.related_major_ids[0])}
                        className="w-full text-left rounded-lg bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200 px-3 py-2 text-xs font-semibold text-sky-900 transition flex items-center justify-between cursor-pointer dark:bg-sky-950/40 dark:border-sky-900 dark:text-sky-300"
                      >
                        <span className="truncate">→ Xem ngành đào tạo tại HCMUTE</span>
                        <IconArrowRight className="w-3.5 h-3.5 shrink-0" />
                      </button>
                    )}

                    <button
                      onClick={() => onSelectCareerForRoadmap(career.id)}
                      className="w-full rounded-lg bg-accent-red-600 px-4 py-2.5 text-xs font-black text-white hover:bg-accent-red-700 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <span>Chọn làm mục tiêu lộ trình</span>
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================
          MAJORS TOP 3 SHOWCASE (Nếu xem Tab Ngành)
      ================================================== */}
      {activeTab === "majors" && top3Majors.length > 0 && !searchQuery && selectedIndustry === "all" && (
        <section className="space-y-4" data-testid="top-3-majors-showcase">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Khuyến Nghị Đào Tạo Hàng Đầu
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <IconGraduationCap className="w-5 h-5 text-emerald-600" />
                <span>Top 3 Ngành Đào Tạo Tương Thích Nhất</span>
              </h2>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Chuẩn mã ngành Bộ GD&ĐT & Chương trình HCMUTE
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {top3Majors.map((m, idx) => {
              const { major, score, label, confidence } = m;
              const reasons = m?.reasons || { positive_factors: [], considerations: [] };
              const bookmarked = isBookmarked("major", major.id);
              const compared = isCompared(major.id);

              return (
                <div
                  key={major.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-md transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-emerald-800 px-2.5 py-1 text-xs font-black text-white shadow-xs">
                        #{idx + 1} • Mã: {major.code}
                      </span>
                      <button
                        onClick={() => onBookmarkItem("major", major.id)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          bookmarked ? "text-accent-red-600 bg-accent-red-50" : "text-slate-400 hover:text-brand-600"
                        }`}
                      >
                        <IconBookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                          {major.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {major.description}
                        </p>
                      </div>
                      <div className="text-center shrink-0">
                        <MetricGauge score={score} label={label} size={82} strokeWidth={7} />
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          Độ tin cậy: {Math.round(confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5 text-xs pt-1">
                      <div className="rounded-lg bg-emerald-50/70 p-3 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
                        <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block mb-0.5">
                          Lý do tương thích học thuật:
                        </span>
                        <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                          {reasons.positive_factors?.[0] || "Điểm học lực các môn tự nhiên và năng lực tư duy đạt chuẩn."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded-lg bg-slate-50 p-2 border border-slate-200 dark:bg-slate-800">
                          <span className="text-slate-400 block">Độ khó CT:</span>
                          <span className="font-bold text-slate-800 dark:text-white">{major.difficulty_level}</span>
                        </div>
                        <div className="rounded-lg bg-slate-50 p-2 border border-slate-200 dark:bg-slate-800">
                          <span className="text-slate-400 block">Điểm chuẩn TB:</span>
                          <span className="font-bold text-brand-700">{major.academic_requirements.avg_cutoff_score}đ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setExplainModalData({
                            title: major.name,
                            score,
                            label,
                            confidence,
                            type: "major",
                            reasons,
                            salaryOrCutoff: `Điểm chuẩn tham khảo: ~${major.academic_requirements.avg_cutoff_score}đ`,
                            aiOutlook: major.ai_impact
                          })
                        }
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-brand-900 transition text-center cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      >
                        AI giải thích vì sao phù hợp
                      </button>

                      <button
                        onClick={() => toggleCompare("major", major.id, major.name, score)}
                        className={`rounded-lg border px-3 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          compared
                            ? "border-brand-600 bg-brand-50 text-brand-900 dark:bg-brand-950 dark:text-brand-300"
                            : "border-slate-200 text-slate-600 hover:border-slate-400"
                        }`}
                      >
                        <IconScale className="w-3.5 h-3.5" />
                        <span>{compared ? "Đã chọn" : "So sánh"}</span>
                      </button>
                    </div>

                    <button
                      onClick={handleJumpToUniversity}
                      className="w-full rounded-lg bg-brand-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-800 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <IconUniversity className="w-4 h-4 text-sky-300" />
                      <span>Xem trường đào tạo (HCMUTE)</span>
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================
          SECTION: ALL MATCHES GRID (Clean Rectangular Cards)
      ================================================== */}
      {activeTab === "careers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Tất Cả Nghề Nghiệp Khớp Dữ Liệu ({filteredCareers.length})
            </h3>
            <span className="text-xs text-slate-500">
              Sắp xếp theo thứ tự điểm số giải trình từ cao xuống thấp
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCareers.map((m, idx) => {
              const { career, score, label, confidence } = m;
              const reasons = m?.reasons || { positive_factors: [], considerations: [] };
              const bookmarked = isBookmarked("career", career.id);
              const compared = isCompared(career.id);

              return (
                <div
                  key={career.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-brand-800 bg-brand-50 border border-brand-200 rounded px-2.5 py-0.5 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800">
                        #{idx + 1} • {career.industry_name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleCompare("career", career.id, career.name, score)}
                          className={`p-1.5 rounded transition cursor-pointer text-xs ${
                            compared ? "text-brand-700 font-bold bg-brand-50" : "text-slate-400 hover:text-slate-600"
                          }`}
                          title="So sánh"
                        >
                          <IconScale className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onBookmarkItem("career", career.id)}
                          className={`p-1.5 rounded transition cursor-pointer ${
                            bookmarked ? "text-accent-red-600 bg-accent-red-50" : "text-slate-400 hover:text-brand-600"
                          }`}
                        >
                          <IconBookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                          {career.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 italic line-clamp-2">
                          &ldquo;{career.tagline}&rdquo;
                        </p>
                      </div>
                      <MetricGauge score={score} label={label} size={70} strokeWidth={6} />
                    </div>

                    {/* Short Rationale */}
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-3 space-y-1.5 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-[10px] font-black uppercase text-brand-800 dark:text-brand-300 block">
                        Căn cứ phù hợp:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        ✓ {reasons.positive_factors?.[0] || "Tương thích tốt với năng lực phân tích và giải quyết vấn đề."}
                      </p>
                    </div>

                    {/* Salary & AI info */}
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 bg-slate-50/50 p-2.5 rounded-lg">
                      <span>Thu nhập VN:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {career.salary_range.entry_level_million} - {career.salary_range.senior_level_million} tr/tháng
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setExplainModalData({
                            title: career.name,
                            score,
                            label,
                            confidence,
                            type: "career",
                            reasons,
                            salaryOrCutoff: `${career.salary_range.entry_level_million} - ${career.salary_range.senior_level_million} triệu/tháng`,
                            aiOutlook: career.ai_impact.summary,
                            keyStrengths: career.tags
                          })
                        }
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-900 transition text-center cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Lý do khớp
                      </button>
                      <button
                        onClick={() => onAskCoachAboutItem(career.name)}
                        className="rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-900 hover:bg-brand-100 transition cursor-pointer flex items-center gap-1"
                      >
                        <IconBot className="w-3.5 h-3.5 text-brand-700" />
                        <span>Hỏi AI</span>
                      </button>
                    </div>

                    {/* Related major link */}
                    {career.related_major_ids && career.related_major_ids.length > 0 && (
                      <button
                        onClick={() => handleJumpToMajor(career.related_major_ids[0])}
                        className="w-full text-left text-[11px] text-brand-700 hover:text-brand-900 dark:text-brand-300 font-semibold truncate block cursor-pointer"
                      >
                        → Ngành học HCMUTE tương ứng
                      </button>
                    )}

                    <button
                      onClick={() => onSelectCareerForRoadmap(career.id)}
                      className="w-full rounded-lg bg-brand-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-brand-700 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Chọn làm mục tiêu lộ trình</span>
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================
          ALL MAJORS GRID
      ================================================== */}
      {activeTab === "majors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Tất Cả Ngành Đào Tạo Khớp Dữ Liệu ({filteredMajors.length})
            </h3>
            <span className="text-xs text-slate-500">
              Đối chiếu trực tiếp với khung đào tạo Trường ĐH Sư phạm Kỹ thuật TP.HCM
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMajors.map((m, idx) => {
              const { major, score, label, confidence } = m;
              const reasons = m?.reasons || { positive_factors: [], considerations: [] };
              const bookmarked = isBookmarked("major", major.id);

              return (
                <div
                  key={major.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-0.5 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                        #{idx + 1} • Mã: {major.code}
                      </span>
                      <button
                        onClick={() => onBookmarkItem("major", major.id)}
                        className={`p-1.5 rounded transition cursor-pointer ${
                          bookmarked ? "text-accent-red-600 bg-accent-red-50" : "text-slate-400 hover:text-brand-600"
                        }`}
                      >
                        <IconBookmark className={`w-3.5 h-3.5 ${bookmarked ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
                          {major.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {major.description}
                        </p>
                      </div>
                      <MetricGauge score={score} label={label} size={70} strokeWidth={6} />
                    </div>

                    <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-3 text-xs text-slate-600 dark:text-slate-300 space-y-1 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between">
                        <span>Độ khó chương trình:</span>
                        <span className="font-extrabold text-slate-900 dark:text-white">{major.difficulty_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Điểm chuẩn tham khảo:</span>
                        <span className="font-extrabold text-brand-700">{major.academic_requirements.avg_cutoff_score}đ</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setExplainModalData({
                            title: major.name,
                            score,
                            label,
                            confidence,
                            type: "major",
                            reasons,
                            salaryOrCutoff: `Điểm chuẩn tham khảo: ~${major.academic_requirements.avg_cutoff_score}đ`,
                            aiOutlook: major.ai_impact
                          })
                        }
                        className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-900 transition text-center cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        Lý do khớp
                      </button>
                      <button
                        onClick={() => onAskCoachAboutItem(major.name)}
                        className="rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-bold text-brand-900 hover:bg-brand-100 transition cursor-pointer flex items-center gap-1"
                      >
                        <IconBot className="w-3.5 h-3.5 text-brand-700" />
                        <span>Hỏi AI</span>
                      </button>
                    </div>

                    <button
                      onClick={handleJumpToUniversity}
                      className="w-full text-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <IconUniversity className="w-3.5 h-3.5 text-brand-600" />
                      <span>Xem trường đào tạo (HCMUTE)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================
          INDUSTRIES TAB
      ================================================== */}
      {activeTab === "industries" && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES_DATA.map((ind) => (
            <div
              key={ind.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-extrabold text-brand-800 bg-brand-50 border border-brand-200 rounded px-2.5 py-1 inline-block dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800">
                  {ind.tagline}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">{ind.name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">{ind.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Tác động của AI:</span>
                  <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{ind.ai_impact_overview}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedIndustry(ind.id);
                    setActiveTab("careers");
                  }}
                  className="w-full text-center rounded-lg border border-brand-200 bg-brand-50 py-2 text-xs font-bold text-brand-900 hover:bg-brand-100 transition cursor-pointer"
                >
                  Xem các nghề thuộc lĩnh vực này →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================================================
          2. MATCH EXPLAINABILITY MODAL (XAI 5 Tiêu Chí)
      ================================================== */}
      {explainModalData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                  Hệ Thống Giải Trình Thuật Toán XAI
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {explainModalData.title}
                </h3>
              </div>
              <button
                onClick={() => setExplainModalData(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Score & Confidence Overview */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-500 block">Độ tương thích thuật toán</span>
                <span className="text-2xl font-black text-brand-700">{explainModalData.score}%</span>
                <span className="text-[10px] text-emerald-700 font-bold block">
                  Xếp loại: {explainModalData.label}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Độ tin cậy dữ liệu (Confidence)</span>
                <span className="text-2xl font-black text-slate-800 dark:text-slate-200">
                  {Math.round(explainModalData.confidence * 100)}%
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  Dựa trên 7 chặng đánh giá
                </span>
              </div>
            </div>

            {/* 5 Explicit Explainability Pillars */}
            <div className="space-y-3.5 text-xs leading-relaxed">
              {/* Pillar 1: Why it fits */}
              <div className="rounded-lg bg-emerald-50/70 p-3.5 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900">
                <h4 className="font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <IconCheck className="w-4 h-4 text-emerald-600" />
                  <span>1. Vì sao phù hợp (Why it fits):</span>
                </h4>
                <p className="text-emerald-900 dark:text-emerald-300">
                  {explainModalData.reasons.positive_factors?.[0] || "Hồ sơ của bạn đáp ứng xuất sắc các tiêu chuẩn cốt lõi về phong cách làm việc và hứng thú nội tại."}
                </p>
              </div>

              {/* Pillar 2: Evidence */}
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <IconInfo className="w-4 h-4 text-brand-600" />
                  <span>2. Căn cứ dữ liệu (Evidence):</span>
                </h4>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-4 list-disc">
                  {explainModalData.reasons.positive_factors.slice(0, 3).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Pillar 3: Potential mismatch */}
              {explainModalData.reasons.considerations && explainModalData.reasons.considerations.length > 0 && (
                <div className="rounded-lg bg-amber-50/70 p-3.5 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900">
                  <h4 className="font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <IconAlertCircle className="w-4 h-4 text-amber-600" />
                    <span>3. Thách thức & Điểm vênh tiềm ẩn (Potential Mismatch):</span>
                  </h4>
                  <ul className="space-y-1 text-amber-900 dark:text-amber-300 pl-4 list-disc">
                    {explainModalData.reasons.considerations.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pillar 4: AI & Future Outlook */}
              {explainModalData.aiOutlook && (
                <div className="rounded-lg bg-sky-50/70 p-3.5 border border-sky-200 dark:bg-sky-950/30 dark:border-sky-900">
                  <h4 className="font-black text-sky-950 dark:text-sky-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <IconSparkles className="w-4 h-4 text-sky-600" />
                    <span>4. Triển vọng tương lai & Tác động AI (Outlook):</span>
                  </h4>
                  <p className="text-sky-900 dark:text-sky-300">
                    {explainModalData.aiOutlook}
                  </p>
                </div>
              )}

              {/* Pillar 5: Next Action */}
              <div className="rounded-lg bg-brand-50/80 p-3.5 border border-brand-200 dark:bg-brand-950/40 dark:border-brand-900">
                <h4 className="font-black text-brand-950 dark:text-brand-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <IconArrowRight className="w-4 h-4 text-brand-600" />
                  <span>5. Hành động tiếp theo đề xuất (Next Action):</span>
                </h4>
                <p className="text-brand-900 dark:text-brand-300">
                  Đặt làm mục tiêu trong Lộ trình 5 chặng để nhận danh sách môn học, kỹ năng cần bổ sung và kết nối trao đổi với AI Coach.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                onClick={() => setExplainModalData(null)}
                className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Đóng cửa sổ
              </button>
              <button
                onClick={() => {
                  const title = explainModalData.title;
                  setExplainModalData(null);
                  onAskCoachAboutItem(title);
                }}
                className="flex-1 rounded-lg bg-brand-900 py-2 text-xs font-bold text-white hover:bg-brand-800 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <IconBot className="w-3.5 h-3.5 text-sky-300" />
                <span>Hỏi AI Coach về mục này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          7. WORKSPACE: COMPARE MODAL
      ================================================== */}
      {showCompareModal && compareItems.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                  Bàn Làm Việc Ra Quyết Định
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  So Sánh Trực Tiếp Các Lựa Chọn Đã Chọn
                </h3>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Compare Columns */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compareItems.length}, minmax(0, 1fr))` }}>
              {compareItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-850"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-brand-900 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      {item.type === "career" ? "Nghề" : "Ngành"}
                    </span>
                    <button
                      onClick={() => toggleCompare(item.type, item.id, item.name, item.score)}
                      className="text-slate-400 hover:text-accent-red-600 text-xs font-bold"
                    >
                      Bỏ chọn
                    </button>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                      {item.name}
                    </h4>
                    <span className="text-xl font-black text-brand-700 block mt-1">
                      {item.score}% Khớp
                    </span>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2 space-y-2 text-xs">
                    {item.type === "career" && (
                      <button
                        onClick={() => {
                          setShowCompareModal(false);
                          onSelectCareerForRoadmap(item.id);
                        }}
                        className="w-full rounded-md bg-accent-red-600 py-1.5 text-xs font-bold text-white hover:bg-accent-red-700"
                      >
                        Chọn làm lộ trình
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowCompareModal(false);
                        onAskCoachAboutItem(item.name);
                      }}
                      className="w-full rounded-md border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Hỏi AI so sánh
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                onClick={() => setCompareItems([])}
                className="text-xs text-slate-500 hover:text-accent-red-600 underline"
              >
                Xóa tất cả mục đã chọn
              </button>
              <button
                onClick={() => setShowCompareModal(false)}
                className="rounded-lg bg-brand-900 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800"
              >
                Đóng bảng so sánh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Shortlist Bar */}
      {compareItems.length > 0 && !showCompareModal && (
        <aside
          aria-label="Thanh công cụ so sánh nhanh"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl rounded-xl border border-slate-300 bg-slate-900 text-white p-3.5 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 font-black text-xs text-white">
              {compareItems.length}
            </span>
            <span className="text-xs font-semibold">
              Đã chọn {compareItems.length}/3 mục để so sánh đa tiêu chí
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareItems([])}
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
        currentView="matches"
        onNavigate={(nextView) => {
          if (onNavigateView) {
            onNavigateView(nextView);
          } else if ((careerMatches?.length || 0) > 0 && careerMatches[0]?.career?.id) {
            onSelectCareerForRoadmap(careerMatches[0].career.id);
          }
        }}
        onAskCoach={() => onAskCoachAboutItem(careerMatches[0]?.career?.name || "ngành nghề")}
        customTitle="Khám phá chi tiết các nghề & ngành hoặc thiết lập Lộ trình"
        customDesc="Chuyển tiếp sang Chặng 04: Khám phá chiều sâu nghề nghiệp hoặc bấm trực tiếp 'Chọn làm mục tiêu lộ trình' ở thẻ phía trên."
      />
    </div>
  );
}
