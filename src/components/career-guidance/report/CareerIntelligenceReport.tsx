"use client";

import React, { useState, useId } from "react";
import { StudentCareerProfile } from "@/lib/career-guidance/types";
import {
  CareerIntelligenceReportData,
  ReportType,
  buildCareerIntelligenceReport
} from "@/lib/career-guidance/reportEngine";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";
import { RadarChart, RadarDataPoint } from "../common/RadarChart";
import { MetricGauge } from "../common/MetricGauge";
import {
  HcmuteBrandMark,
  IconBriefcase,
  IconGraduationCap,
  IconUniversity,
  IconScale,
  IconMap,
  IconBot,
  IconDna,
  IconTarget,
  IconBarChart,
  IconPrinter,
  IconFileText,
  IconShare,
  IconCheck,
  IconSparkles,
  IconAward,
  IconAlertCircle,
  IconBookmark,
  IconChevronDown,
  IconChevronRight,
  IconX,
  IconTrendingUp,
  IconLayers,
  IconShield,
  IconUserCheck
} from "../common/CareerIcons";

export interface CareerIntelligenceReportProps {
  profile?: StudentCareerProfile;
  reportData?: CareerIntelligenceReportData;
  initialReportType?: ReportType;
  isEmbedded?: boolean;
  onClose?: () => void;
  targetCareerId?: string;
  customUserName?: string;
}

export function CareerIntelligenceReport({
  profile,
  reportData: propReportData,
  initialReportType = "full",
  isEmbedded = false,
  onClose,
  targetCareerId,
  customUserName
}: CareerIntelligenceReportProps) {
  // Resolve data
  const reportData = React.useMemo(() => {
    if (propReportData) return propReportData;
    const baseProfile = profile || createDefaultProfile();
    return buildCareerIntelligenceReport(baseProfile, {
      targetCareerId,
      customUserName
    });
  }, [propReportData, profile, targetCareerId, customUserName]);

  const [activeReportType, setActiveReportType] = useState<ReportType>(initialReportType);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareMode, setShareMode] = useState<"private" | "summary" | "full">("private");
  const [copiedLink, setCopiedLink] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Radar points for Career DNA
  const radarPoints: RadarDataPoint[] = React.useMemo(() => {
    const caps = reportData.career_dna.top_capabilities.slice(0, 3);
    const ints = reportData.career_dna.top_interests.slice(0, 3);
    return [
      ...caps.map((c) => ({ axis: c.name.slice(0, 14), value: c.score, label: c.name.slice(0, 14) })),
      ...ints.map((i) => ({ axis: i.name.slice(0, 14), value: i.score, label: i.name.slice(0, 14) }))
    ];
  }, [reportData]);

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCollapseAll = () => {
    const nextState = !allCollapsed;
    setAllCollapsed(nextState);
    const sections = [
      "executive-summary",
      "career-dna",
      "key-insights",
      "top-careers",
      "top-majors",
      "university-fit",
      "gap-analysis",
      "roadmap",
      "decision-matrix",
      "ai-coach",
      "personal-story",
      "parent-mentor",
      "methodology"
    ];
    const map: Record<string, boolean> = {};
    sections.forEach((s) => {
      map[s] = nextState;
    });
    setCollapsedSections(map);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportHtml = () => {
    const reportElement = document.getElementById("career-intelligence-dossier");
    if (!reportElement) return;

    const fileName = `HCMUTE-Career-Intelligence-Report-${reportData.report_metadata.dossier_id}.html`;
    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportData.report_metadata.report_title} — ${reportData.report_metadata.user_name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      .no-print { display: none !important; }
      .page-break-before { break-before: page !important; }
      .avoid-break { break-inside: avoid !important; }
      @page { size: A4 portrait; margin: 12mm 10mm; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 p-4 md:p-8">
  <div class="max-w-5xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-slate-200">
    ${reportElement.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCopyShareLink = () => {
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/career/report?type=${activeReportType}&mode=${shareMode}`
      : "https://hcmute-career.edu.vn/career/report";
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Section visibility based on ReportType preset
  const isSectionVisible = (sectionId: string): boolean => {
    if (activeReportType === "full") return true;
    if (activeReportType === "executive") {
      return ["executive-summary", "key-insights", "ai-coach", "personal-story"].includes(sectionId);
    }
    if (activeReportType === "parent") {
      return ["parent-mentor", "executive-summary", "top-careers", "university-fit", "ai-coach"].includes(sectionId);
    }
    if (activeReportType === "comparison") {
      return ["decision-matrix", "top-careers", "top-majors", "gap-analysis"].includes(sectionId);
    }
    if (activeReportType === "roadmap") {
      return ["gap-analysis", "roadmap", "executive-summary", "ai-coach"].includes(sectionId);
    }
    return true;
  };

  const tocItems = [
    { id: "cover-page", label: "Trang bìa Hồ sơ" },
    { id: "executive-summary", label: "Tóm tắt Điều hành", count: "3 Phút" },
    { id: "career-dna", label: "Bản đồ Career DNA", count: "Archetype" },
    { id: "key-insights", label: "Phân tích Chuyên sâu (4 Trụ cột)" },
    { id: "top-careers", label: "Top Nghề nghiệp Phù hợp", count: reportData.top_careers.length },
    { id: "top-majors", label: "Top Ngành học Khuyến nghị", count: reportData.top_majors.length },
    { id: "university-fit", label: "Độ tương thích Đại học (5 Chiều)" },
    { id: "gap-analysis", label: "Khoảng trống Năng lực", count: reportData.gap_analysis.gaps.length },
    { id: "roadmap", label: "Lộ trình Thực thi (5 Thời kỳ)" },
    { id: "decision-matrix", label: "Ma trận Khác biệt Quyết định" },
    { id: "ai-coach", label: "Khuyến nghị AI Coach (5 Trụ cột)" },
    { id: "personal-story", label: "Câu chuyện Nghề nghiệp Cá nhân" },
    { id: "parent-mentor", label: "Bản tóm tắt Phụ huynh & Cố vấn" },
    { id: "methodology", label: "Phương pháp luận & Giới hạn" }
  ].filter((item) => item.id === "cover-page" || isSectionVisible(item.id));

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#004098] selection:text-white">
      {/* Print Specific Inline Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-size: 11pt !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .page-break-after {
            break-after: page !important;
            page-break-after: always !important;
          }
          .page-break-before {
            break-before: page !important;
            page-break-before: always !important;
          }
          .avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 14mm 12mm 14mm 12mm;
          }
        }
      `}} />

      {/* WEB STICKY TOP CONTROLS (NO PRINT) */}
      <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Brand & Title */}
          <div className="flex items-center gap-3">
            <HcmuteBrandMark className="w-8 h-8" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#004098] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {reportData.report_metadata.system_version}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  #{reportData.report_metadata.dossier_id}
                </span>
              </div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                {reportData.report_metadata.report_title}
              </h1>
            </div>
          </div>

          {/* Center: Report Preset Tabs */}
          <nav aria-label="Bộ lọc loại báo cáo" className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto max-w-full">
            {[
              { id: "full", label: "Toàn diện" },
              { id: "executive", label: "Executive" },
              { id: "parent", label: "Phụ huynh" },
              { id: "comparison", label: "So sánh" },
              { id: "roadmap", label: "Lộ trình" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReportType(tab.id as ReportType)}
                className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeReportType === tab.id
                    ? "bg-[#004098] text-white shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCollapseAll}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Thu gọn hoặc mở rộng tất cả các mục"
            >
              {allCollapsed ? "Mở rộng tất cả" : "Thu gọn tất cả"}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#004098] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
            >
              <IconPrinter className="w-4 h-4" />
              <span>In / PDF A4</span>
            </button>

            <button
              onClick={handleExportHtml}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <IconFileText className="w-4 h-4" />
              <span>{savedSuccess ? "Đã tải xuống" : "Tải HTML"}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#004098] hover:bg-[#00337a] rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <IconShare className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
                title="Đóng"
              >
                <IconX className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER: TWO COLUMN LAYOUT (STICKY TOC + DOSSIER CONTENT) */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex gap-8 items-start">
        {/* LEFT COLUMN: STICKY TOC NAVIGATION (WEB ONLY) */}
        <aside className="no-print hidden lg:block w-72 shrink-0 sticky top-24 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <IconLayers className="w-4 h-4 text-[#004098]" />
              Mục lục Hồ sơ
            </span>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {tocItems.length} Phần
            </span>
          </div>

          <nav className="space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 text-xs">
            {tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-600 hover:text-[#004098] hover:bg-blue-50/70 transition-colors group"
              >
                <span className="truncate group-hover:translate-x-0.5 transition-transform">
                  {item.label}
                </span>
                {item.count && (
                  <span className="text-[10px] text-slate-400 font-mono group-hover:text-blue-600">
                    {item.count}
                  </span>
                )}
              </a>
            ))}
          </nav>

          <div className="mt-5 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
            <div className="flex items-center justify-between">
              <span>Độ tin cậy:</span>
              <span className="font-bold text-emerald-600">
                {reportData.report_metadata.confidence_score}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Ngày cập nhật:</span>
              <span className="font-medium text-slate-700">
                {reportData.report_metadata.created_date}
              </span>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: MAIN DOSSIER DOCUMENT */}
        <main
          id="career-intelligence-dossier"
          className="print-full-width flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* ========================================================================= */}
          {/* SECTION 1: COVER PAGE (A4 PAGE 1) */}
          {/* ========================================================================= */}
          <section
            id="cover-page"
            className="page-break-after relative bg-[#004098] text-white p-8 sm:p-12 lg:p-16 overflow-hidden min-h-[580px] flex flex-col justify-between"
          >
            {/* Background Geometric Tech Motif */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-600/30 to-blue-400/20 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20" />
            
            {/* Top Brand Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-lg">
                  <div className="text-center font-black text-[#004098] leading-tight text-xs tracking-tighter">
                    HCM<br />UTE
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                    Trường Đại học Sư phạm Kỹ thuật TP.HCM
                  </div>
                  <div className="text-sm font-bold tracking-tight text-white">
                    AI Career Decision Intelligence System
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-blue-200 font-mono">HỒ SƠ TƯ VẤN SỐ</div>
                <div className="text-sm font-bold font-mono tracking-wider text-white">
                  #{reportData.report_metadata.dossier_id}
                </div>
              </div>
            </div>

            {/* Central Typography & Motif */}
            <div className="relative z-10 my-12 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-[#D9232E]" />
                {reportData.report_metadata.system_version}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {reportData.report_metadata.headline}
              </h1>

              <p className="text-base sm:text-lg text-blue-100 max-w-2xl font-normal leading-relaxed">
                {reportData.report_metadata.subheading}
              </p>

              {/* Decorative Red Accent Line */}
              <div className="w-24 h-1.5 bg-[#D9232E] rounded-full" />
            </div>

            {/* Bottom Metadata Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/15 text-xs">
              <div>
                <span className="text-blue-200 block text-[11px]">Người nhận hồ sơ</span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {reportData.report_metadata.user_name}
                </span>
              </div>
              <div>
                <span className="text-blue-200 block text-[11px]">Đối tượng định danh</span>
                <span className="text-sm font-semibold text-white block mt-0.5">
                  {reportData.report_metadata.persona}
                </span>
              </div>
              <div>
                <span className="text-blue-200 block text-[11px]">Ngày khởi tạo</span>
                <span className="text-sm font-medium text-white block mt-0.5">
                  {reportData.report_metadata.created_date}
                </span>
              </div>
              <div>
                <span className="text-blue-200 block text-[11px]">Chỉ số tin cậy</span>
                <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                  {reportData.report_metadata.confidence_score}% (Validated)
                </span>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* SECTION 2: EXECUTIVE SUMMARY (A4 PAGE 2) */}
          {/* ========================================================================= */}
          {isSectionVisible("executive-summary") && (
            <section
              id="executive-summary"
              className="page-break-before p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    01
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Tóm tắt Điều hành (Executive Summary)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Nắm bắt toàn diện bản sắc và hướng đi chiến lược chỉ trong 3 phút
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("executive-summary")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["executive-summary"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["executive-summary"] && (
                <div className="space-y-6">
                  {/* Identity Hero Banner */}
                  <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-red-50/30 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#004098]">
                        Bản sắc Nghề nghiệp Cốt lõi
                      </span>
                      <h3 className="text-2xl font-black text-slate-900">
                        {reportData.executive_summary.career_identity}
                      </h3>
                      <p className="text-sm text-slate-600 italic">
                        &ldquo;{reportData.executive_summary.career_tagline}&rdquo;
                      </p>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 text-center shadow-xs shrink-0">
                      <span className="text-[11px] text-slate-500 block uppercase font-bold tracking-wider">
                        Khuyến nghị số 1
                      </span>
                      <span className="text-lg font-black text-[#004098] block">
                        {reportData.executive_summary.top_match_title}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        {reportData.executive_summary.top_match_score}% Phù hợp
                      </span>
                    </div>
                  </div>

                  {/* 3x2 High Impact Insight Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <IconAward className="w-4 h-4 text-[#004098]" />
                        Thế mạnh Cạnh tranh Hàng đầu
                      </span>
                      <ul className="space-y-1 text-slate-600">
                        {reportData.executive_summary.top_strengths.map((str, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <IconCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Direction */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <IconTarget className="w-4 h-4 text-[#D9232E]" />
                        Hướng phát triển Ưu tiên
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {reportData.executive_summary.top_direction}
                      </p>
                    </div>

                    {/* Opportunity */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <IconSparkles className="w-4 h-4 text-amber-500" />
                        Cơ hội Bứt phá Đón đầu
                      </span>
                      <p className="text-slate-700 leading-relaxed">
                        {reportData.executive_summary.key_opportunity}
                      </p>
                    </div>

                    {/* Key Development Area */}
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <IconAlertCircle className="w-4 h-4 text-amber-600" />
                        Điểm nghẽn cần Bù đắp
                      </span>
                      <p className="text-amber-800 leading-relaxed">
                        {reportData.executive_summary.key_development_area}
                      </p>
                    </div>

                    {/* Next Action */}
                    <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 sm:col-span-2">
                      <span className="font-bold text-[#004098] flex items-center gap-1.5">
                        <IconMap className="w-4 h-4 text-[#004098]" />
                        Hành động Trọng tâm Tiếp theo (Next Action)
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {reportData.executive_summary.next_action}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: CAREER DNA (A4 PAGE 2-3) */}
          {/* ========================================================================= */}
          {isSectionVisible("career-dna") && (
            <section
              id="career-dna"
              className="p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    02
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Bản đồ Năng lực & Career DNA
                    </h2>
                    <p className="text-xs text-slate-500">
                      Cấu trúc tố chất, giá trị cá nhân và môi trường làm việc lý tưởng
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("career-dna")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["career-dna"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["career-dna"] && (
                <div className="space-y-6">
                  {/* Archetype Description */}
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs font-bold text-[#004098] uppercase tracking-wider block mb-1">
                      Mô hình Nhân cách Nghề nghiệp (Career Archetype)
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">
                      {reportData.career_dna.archetype_title}
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {reportData.career_dna.archetype_description}
                    </p>
                  </div>

                  {/* Two Column Grid: Radar Chart + Traits Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Visual Radar */}
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-slate-700 mb-2">
                        Biểu đồ Đa giác Năng lực & Sở thích
                      </span>
                      <div className="w-full max-w-[280px] h-[260px] flex items-center justify-center">
                        <RadarChart data={radarPoints} size={250} />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-2">
                        Dựa trên đánh giá hồ sơ chuẩn hóa thang điểm 100
                      </span>
                    </div>

                    {/* Strengths & Values */}
                    <div className="space-y-4 text-xs">
                      {/* Top Capabilities */}
                      <div>
                        <span className="font-bold text-slate-900 block mb-2">
                          Năng lực Nổi trội (Top Capabilities)
                        </span>
                        <div className="space-y-2">
                          {reportData.career_dna.top_capabilities.map((cap, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between font-medium text-slate-700">
                                <span>{cap.name}</span>
                                <span className="font-bold text-[#004098]">{cap.score}/100</span>
                              </div>
                              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-[#004098] h-full rounded-full transition-all"
                                  style={{ width: `${cap.score}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Values */}
                      <div>
                        <span className="font-bold text-slate-900 block mb-1.5">
                          Giá trị Cốt lõi Theo đuổi (Core Values)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {reportData.career_dna.top_values.map((val, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 font-medium"
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Preferred Environment */}
                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                        <span className="font-bold text-[#004098] block mb-0.5">
                          Môi trường Làm việc Lý tưởng:
                        </span>
                        <span className="text-slate-700 leading-snug">
                          {reportData.career_dna.preferred_environment}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: KEY INSIGHTS (4 PILLARS) */}
          {/* ========================================================================= */}
          {isSectionVisible("key-insights") && (
            <section
              id="key-insights"
              className="page-break-before p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    03
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Phân tích Chuyên sâu (Key Insights)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Đúc kết 4 trụ cột: INSIGHT &bull; EVIDENCE &bull; MEANING &bull; IMPLICATION
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("key-insights")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["key-insights"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["key-insights"] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportData.key_insights.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#004098]" />
                        <h4 className="font-bold text-slate-900 text-sm">
                          {item.title}
                        </h4>
                      </div>

                      {/* 4 Pillars Structured Grid */}
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                          <span className="font-bold text-[#004098] block uppercase text-[10px] tracking-wider mb-0.5">
                            INSIGHT (Phát hiện)
                          </span>
                          <p className="text-slate-800 leading-snug">{item.insight}</p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-600 block uppercase text-[10px] tracking-wider mb-0.5">
                            EVIDENCE (Bằng chứng thực tế)
                          </span>
                          <p className="text-slate-700 leading-snug font-mono text-[11px]">
                            {item.evidence}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-600 block uppercase text-[10px] tracking-wider mb-0.5">
                            MEANING (Bản chất tâm lý & tố chất)
                          </span>
                          <p className="text-slate-700 leading-snug">{item.meaning}</p>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                          <span className="font-bold text-emerald-800 block uppercase text-[10px] tracking-wider mb-0.5">
                            IMPLICATION (Hàm ý lựa chọn ngành/nghề)
                          </span>
                          <p className="text-emerald-950 font-medium leading-snug">
                            {item.implication}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: TOP CAREER MATCH */}
          {/* ========================================================================= */}
          {isSectionVisible("top-careers") && (
            <section
              id="top-careers"
              className="page-break-before p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    04
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Top Nghề nghiệp Khuyến nghị Hàng đầu
                    </h2>
                    <p className="text-xs text-slate-500">
                      Phân tích độ tương thích, điểm mạnh, thách thức và triển vọng thị trường
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("top-careers")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["top-careers"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["top-careers"] && (
                <div className="space-y-4">
                  {reportData.top_careers.map((match, idx) => (
                    <div
                      key={match.career.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#004098]/40 transition-colors shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#004098] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="text-base font-bold text-slate-900">
                              {match.career.name}
                            </h4>
                            <span className="text-xs text-slate-500">
                              Nhóm ngành: {match.career.industry_name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#004098] block">
                              {match.score}% Phù hợp
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Độ tin cậy: {Math.round((match.confidence || 0.92) * 100)}%
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#004098] border border-blue-200">
                            {match.label}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800 block">Lý do phù hợp (Why it fits):</span>
                          <p className="text-slate-600 leading-snug">
                            {match.reasons?.positive_factors?.[0] || match.career.tagline}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800 block">Thách thức cần vượt qua:</span>
                          <p className="text-slate-600 leading-snug">
                            {match.reasons?.penalty_factors?.[0] || match.career.ai_impact?.summary || "Yêu cầu rèn luyện tư duy thực tế và cập nhật công nghệ nhanh."}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800 block">Triển vọng & Mức lương:</span>
                          <p className="text-slate-700 leading-snug">
                            Thu nhập: <span className="font-semibold text-emerald-600">{match.career.salary_range.entry_level_million} - {match.career.salary_range.senior_level_million} triệu/tháng</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Hành động đề xuất: {match.reasons?.what_to_verify?.[0] || "Rèn luyện dự án thực chiến và trao đổi với mentor ngành."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 6: TOP MAJOR MATCH */}
          {/* ========================================================================= */}
          {isSectionVisible("top-majors") && (
            <section
              id="top-majors"
              className="p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    05
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Top Ngành học Khuyến nghị (Major Match)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Độ nặng chương trình đào tạo, yêu cầu Toán/Code và rủi ro học thuật
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("top-majors")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["top-majors"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["top-majors"] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportData.top_majors.map((m, idx) => (
                    <div
                      key={m.major.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 font-mono">
                              #{idx + 1} Mã ngành: {m.major.code || "7480101"}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900">
                            {m.major.name}
                          </h4>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 shrink-0">
                          {m.score}% Phù hợp
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <p className="text-slate-700 leading-snug">
                          {m.reasons?.positive_factors?.[0] || m.major.description}
                        </p>
                        
                        {/* Metrics Bar */}
                        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                          <div className="p-2 bg-slate-50 rounded-lg text-center">
                            <span className="text-slate-500 block">Độ nặng Toán</span>
                            <span className="font-bold text-slate-900">
                              {m.major.academic_requirements?.math_intensity || "Nâng cao"}
                            </span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg text-center">
                            <span className="text-slate-500 block">Lập trình/Công nghệ</span>
                            <span className="font-bold text-slate-900">
                              {m.major.academic_requirements?.english_intensity || "Chuyên sâu"}
                            </span>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-lg text-center">
                            <span className="text-slate-500 block">Thực hành Xưởng</span>
                            <span className="font-bold text-slate-900">
                              {m.major.learning_style?.theory_vs_practice > 0 ? "Thực hành ứng dụng cao" : "Cân bằng học thuật"}
                            </span>
                          </div>
                        </div>

                        {/* Pathway & Risk */}
                        <div className="pt-1 space-y-1">
                          <span className="font-bold text-slate-800 block text-[11px]">
                            Lộ trình nghề nghiệp:
                          </span>
                          <p className="text-slate-600 text-[11px]">
                            {m.major.career_paths?.slice(0, 3).join(" • ") || "Kỹ sư hệ thống, Chuyên viên phân tích"}
                          </p>
                          <span className="font-bold text-amber-800 block text-[11px] pt-1">
                            Lưu ý học thuật:
                          </span>
                          <p className="text-amber-900 text-[11px]">
                            {m.reasons?.penalty_factors?.[0] || m.major.ai_impact || "Yêu cầu khả năng tự học công nghệ mới liên tục và tư duy giải thuật chặt chẽ."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 7: UNIVERSITY FIT (5 DIMENSIONS) */}
          {/* ========================================================================= */}
          {isSectionVisible("university-fit") && (
            <section
              id="university-fit"
              className="page-break-before p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    06
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Độ Tương thích Cơ sở Đại học (University Fit)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Đánh giá 5 chiều: Học thuật &bull; Điểm chuẩn xét tuyển &bull; Tài chính &bull; Địa lý &bull; Cơ hội Việc làm
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("university-fit")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["university-fit"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["university-fit"] && (
                <div className="space-y-4">
                  {reportData.university_fit.universities.map((u, idx) => (
                    <div
                      key={u.university_id || idx}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#004098] uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {u.short_name}
                            </span>
                            <span className="text-xs text-slate-500">
                              {u.city} &bull; {u.type}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 mt-1">
                            {u.university_name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-xs font-bold text-slate-600">Độ phù hợp tổng:</span>
                          <span className="px-3 py-1 bg-[#004098] text-white font-bold text-sm rounded-xl">
                            {u.match_score || u.fit_breakdown?.overall_fit || 88}%
                          </span>
                        </div>
                      </div>

                      {/* 5 Dimensions Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        <div className="p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                          <span className="text-slate-500 block text-[11px]">Học thuật</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {u.fit_breakdown?.academic_fit || 90}%
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                          <span className="text-slate-500 block text-[11px]">Trúng tuyển</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {u.fit_breakdown?.admission_fit || 86}%
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                          <span className="text-slate-500 block text-[11px]">Học phí/Tài chính</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {u.fit_breakdown?.financial_fit || 85}%
                          </span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl text-center border border-slate-100">
                          <span className="text-slate-500 block text-[11px]">Vị trí</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {u.fit_breakdown?.location_fit || 95}%
                          </span>
                        </div>
                        <div className="p-2.5 bg-blue-50/60 rounded-xl text-center border border-blue-100 col-span-2 sm:col-span-1">
                          <span className="text-[#004098] block text-[11px]">Cơ hội nghề</span>
                          <span className="font-bold text-[#004098] text-sm">
                            {u.fit_breakdown?.career_fit || 92}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-600 border-t border-slate-50">
                        <span>Học phí ước tính: <strong className="text-slate-900">{u.tuition_million_year ? `${u.tuition_million_year} triệu VNĐ/năm` : "32 - 40 triệu VNĐ/năm"}</strong></span>
                        <span>Điểm chuẩn tham khảo: <strong className="text-slate-900">{u.average_cutoff ? `${u.average_cutoff} điểm` : "25.5 - 27.0 điểm"}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 8: GAP ANALYSIS */}
          {/* ========================================================================= */}
          {isSectionVisible("gap-analysis") && (
            <section
              id="gap-analysis"
              className="p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    07
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Phân tích Khoảng trống Năng lực (Gap Analysis)
                    </h2>
                    <p className="text-xs text-slate-500">
                      So sánh Hồ sơ Hiện tại vs Vị trí Mục tiêu: &ldquo;{reportData.gap_analysis.target_career_name}&rdquo;
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("gap-analysis")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["gap-analysis"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["gap-analysis"] && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-3">Kỹ năng / Năng lực</th>
                          <th className="py-3 px-3">Hiện tại</th>
                          <th className="py-3 px-3">Mục tiêu</th>
                          <th className="py-3 px-3">Khoảng trống (Gap)</th>
                          <th className="py-3 px-3">Mức ưu tiên</th>
                          <th className="py-3 px-3">Thời gian nỗ lực</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData.gap_analysis.gaps.map((gap, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3 font-bold text-slate-900">
                              {gap.skill_name}
                              <span className="block font-normal text-[11px] text-slate-500">
                                {gap.category || "Chuyên môn cốt lõi"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-700 font-mono">
                              {gap.current_level}/100
                            </td>
                            <td className="py-3 px-3 text-slate-900 font-mono font-bold">
                              {gap.target_level}/100
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-[#D9232E] font-mono">
                                -{gap.gap}đ
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                gap.priority === "HIGH"
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}>
                                {gap.priority === "HIGH" ? "Cần ưu tiên ngay" : "Trung hạn"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              {gap.effort || gap.actionable_recommendation || "2 - 3 tháng rèn luyện"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 9: ROADMAP (5 HORIZONS) */}
          {/* ========================================================================= */}
          {isSectionVisible("roadmap") && (
            <section
              id="roadmap"
              className="page-break-before p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    08
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Lộ trình Hành động Cá nhân hóa (5 Thời kỳ)
                    </h2>
                    <p className="text-xs text-slate-500">
                      0–30 ngày &bull; 30–90 ngày &bull; 3–6 tháng &bull; 6–12 tháng &bull; 1–3 năm
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("roadmap")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["roadmap"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["roadmap"] && (
                <div className="space-y-6">
                  <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6 text-xs">
                    {(reportData.roadmap.stages || []).map((stage, sIdx) => (
                      <div key={stage.stage_id || sIdx} className="relative">
                        {/* Milestone dot */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#004098] border-2 border-white shadow-xs" />
                        
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#004098] uppercase tracking-wider">
                              {stage.title}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-100/60 text-blue-900 font-semibold text-[10px]">
                              {stage.tagline}
                            </span>
                          </div>

                          {/* Task List */}
                          <div className="space-y-1.5 pt-1">
                            {(stage.tasks || []).map((task, tIdx) => (
                              <div
                                key={task.id || tIdx}
                                className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200"
                              >
                                <IconCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                <div>
                                  <span className="font-bold text-slate-900 block">
                                    {task.title}
                                  </span>
                                  <p className="text-[11px] text-slate-600">
                                    {task.description}
                                  </p>
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Nỗ lực: {task.estimated_effort} &bull; Kết quả: {task.outcome || "Hoàn thành kiểm chứng kỹ năng"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 10: DECISION MATRIX */}
          {/* ========================================================================= */}
          {isSectionVisible("decision-matrix") && (
            <section
              id="decision-matrix"
              className="page-break-before p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    09
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Ma trận Khác biệt Quyết định (Decision Matrix)
                    </h2>
                    <p className="text-xs text-slate-500">
                      So sánh khách quan giữa các lựa chọn hàng đầu — Không áp đặt &ldquo;Người chiến thắng&rdquo;
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("decision-matrix")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["decision-matrix"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["decision-matrix"] && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-y border-slate-200">
                          <th className="py-3 px-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider w-1/3">
                            Tiêu chí So sánh Độc lập
                          </th>
                          {reportData.decision_matrix.career_names.map((name, i) => (
                            <th
                              key={i}
                              className="py-3 px-4 font-black text-slate-900 text-xs text-center border-l border-slate-200"
                            >
                              {name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData.decision_matrix.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-bold text-slate-800 align-top">
                              {row.criterion}
                            </td>
                            {row.options.map((opt, oIdx) => (
                              <td
                                key={oIdx}
                                className={`py-3 px-4 text-slate-700 align-top border-l border-slate-200 ${
                                  opt.isHighlight ? "bg-blue-50/40" : ""
                                }`}
                              >
                                <div className="space-y-1">
                                  <span>{opt.value}</span>
                                  {opt.badge && (
                                    <span className="block mt-1">
                                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                                        {opt.badge}
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[11px] text-slate-500 italic text-center pt-2">
                    * Báo cáo cung cấp ma trận khác biệt khách quan để bạn và cố vấn cùng thảo luận các đánh đổi (trade-offs), không gán nhãn lựa chọn nào là duy nhất.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 11: AI COACH RECOMMENDATION (5 PILLARS) */}
          {/* ========================================================================= */}
          {isSectionVisible("ai-coach") && (
            <section
              id="ai-coach"
              className="page-break-before p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    10
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Khuyến nghị từ AI Coach (5 Trụ cột Cố vấn)
                    </h2>
                    <p className="text-xs text-slate-500">
                      What I see &bull; What matters most &bull; What to explore &bull; What to improve &bull; What to do next
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("ai-coach")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["ai-coach"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["ai-coach"] && (
                <div className="space-y-4 text-xs">
                  {/* Pillar 1 & 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1.5">
                      <span className="font-bold text-[#004098] uppercase text-[10px] tracking-wider block">
                        WHAT I SEE (Góc nhìn Cố vấn)
                      </span>
                      <p className="text-slate-800 leading-relaxed">
                        {reportData.ai_coach_advice.what_i_see}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                      <span className="font-bold text-amber-900 uppercase text-[10px] tracking-wider block">
                        WHAT MATTERS MOST (Điều quan trọng nhất)
                      </span>
                      <p className="text-amber-950 leading-relaxed font-medium">
                        {reportData.ai_coach_advice.what_matters_most}
                      </p>
                    </div>
                  </div>

                  {/* Pillar 3 & 4 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                        WHAT TO EXPLORE (Hướng nên khám phá)
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {reportData.ai_coach_advice.what_to_explore.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#004098] font-bold">&bull;</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block">
                        WHAT TO IMPROVE (Năng lực cần trau dồi)
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {reportData.ai_coach_advice.what_to_improve.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#D9232E] font-bold">&bull;</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Pillar 5: Next Steps */}
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                    <span className="font-bold text-blue-300 uppercase text-[10px] tracking-wider block">
                      WHAT TO DO NEXT (Hành động Cụ thể Ngay tuần này)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-300">
                      {reportData.ai_coach_advice.what_to_do_next.map((act, idx) => (
                        <div key={idx} className="bg-white/10 p-2.5 rounded-lg border border-white/10">
                          <span className="font-bold text-white block mb-0.5">Bước {idx + 1}</span>
                          <span className="text-[11px] leading-snug block">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 12: PERSONAL STORY */}
          {/* ========================================================================= */}
          {isSectionVisible("personal-story") && (
            <section
              id="personal-story"
              className="p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    11
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Câu chuyện Nghề nghiệp của Bạn (Personal Story)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Tổng hợp tự nhiên, súc tích và có chiều sâu dựa trên dữ liệu thật của hồ sơ
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("personal-story")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["personal-story"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["personal-story"] && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 space-y-4">
                  <h4 className="text-base font-bold text-slate-900">
                    {reportData.personal_story.narrative_title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-serif">
                    {reportData.personal_story.story_text}
                  </p>
                  <blockquote className="p-3 bg-white rounded-xl border-l-4 border-[#004098] text-xs italic text-slate-800 font-medium">
                    &ldquo;{reportData.personal_story.milestone_quote}&rdquo;
                  </blockquote>
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 13: PARENT / MENTOR PAGE */}
          {/* ========================================================================= */}
          {isSectionVisible("parent-mentor") && (
            <section
              id="parent-mentor"
              className="page-break-before p-6 sm:p-10 border-b border-slate-200 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    12
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Bản Tóm tắt Dành cho Phụ huynh & Cố vấn (Parent / Mentor Page)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Góc nhìn khách quan giúp gia đình và thầy cô đồng hành hiệu quả nhất
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("parent-mentor")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["parent-mentor"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["parent-mentor"] && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <IconUserCheck className="w-4 h-4 text-[#004098]" />
                        Điểm mạnh Thật của Học sinh
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {reportData.parent_mentor_summary.strengths.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <IconCheck className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Direction */}
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2">
                      <span className="font-bold text-[#004098] flex items-center gap-1.5">
                        <IconTarget className="w-4 h-4 text-[#004098]" />
                        Định hướng Phù hợp Tự nhiên
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {reportData.parent_mentor_summary.direction}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Risks */}
                    <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 space-y-2">
                      <span className="font-bold text-red-900 flex items-center gap-1.5">
                        <IconAlertCircle className="w-4 h-4 text-[#D9232E]" />
                        Rủi ro & Áp lực Cần lưu ý
                      </span>
                      <ul className="space-y-1 text-red-950">
                        {reportData.parent_mentor_summary.risks.map((r, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#D9232E] font-bold">&bull;</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* How to support */}
                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                      <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <IconShield className="w-4 h-4 text-emerald-700" />
                        Cách Đồng hành Hiệu quả Nhất
                      </span>
                      <ul className="space-y-1 text-emerald-950">
                        {reportData.parent_mentor_summary.how_to_support.map((h, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <IconCheck className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 14: METHODOLOGY & LIMITATIONS */}
          {/* ========================================================================= */}
          {isSectionVisible("methodology") && (
            <section
              id="methodology"
              className="page-break-before p-6 sm:p-10 avoid-break"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#004098] flex items-center justify-center font-bold text-sm">
                    13
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                      Phương pháp luận & Giới hạn Báo cáo (Methodology)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Tính minh bạch dữ liệu, thuật toán tính điểm và tuyên bố trách nhiệm
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSection("methodology")}
                  className="no-print text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {collapsedSections["methodology"] ? (
                    <IconChevronRight className="w-5 h-5" />
                  ) : (
                    <IconChevronDown className="w-5 h-5" />
                  )}
                </button>
              </div>

              {!collapsedSections["methodology"] && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-900 block">Dữ liệu Đầu vào Hồ sơ:</span>
                      <ul className="space-y-1 text-slate-600">
                        {reportData.methodology.input_data_summary.map((inp, idx) => (
                          <li key={idx}>&bull; {inp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <span className="font-bold text-slate-900 block">Nguồn Dữ liệu Đối chiếu:</span>
                      <ul className="space-y-1 text-slate-600">
                        {reportData.methodology.data_sources.map((src, idx) => (
                          <li key={idx}>&bull; {src}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5">
                    <span className="font-bold text-[#004098] block">Thuật toán & Vai trò AI:</span>
                    <p className="text-slate-700 leading-relaxed">
                      {reportData.methodology.scoring_algorithm}. {reportData.methodology.ai_role}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-100/80 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                    <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider">
                      Lưu ý Giới hạn Báo cáo:
                    </span>
                    <ul className="space-y-1 text-[11px]">
                      {reportData.methodology.limitations.map((lim, idx) => (
                        <li key={idx}>- {lim}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Running Footer for print / document */}
              <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <span>Trường Đại học Sư phạm Kỹ thuật TP.HCM — AI Career Intelligence Platform</span>
                <span>Hồ sơ #{reportData.report_metadata.dossier_id} &bull; {reportData.report_metadata.created_date}</span>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* SHARE MODAL DIALOG (REQUIREMENT 19: PRIVATE / SUMMARY / FULL SHARE) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <IconShare className="w-5 h-5 text-[#004098]" />
                <h3 className="font-bold text-slate-900 text-base">Chia sẻ Hồ sơ Báo cáo</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Chế độ Quyền riêng tư (Không mặc định công khai):
              </span>

              {/* Share Mode 1: Private */}
              <label
                onClick={() => setShareMode("private")}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  shareMode === "private"
                    ? "border-[#004098] bg-blue-50/50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="share-mode"
                  checked={shareMode === "private"}
                  onChange={() => setShareMode("private")}
                  className="mt-1 text-[#004098] focus:ring-[#004098]"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Riêng tư (Chỉ mình bạn xem)
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-snug">
                    Hồ sơ được mã hóa và chỉ lưu trên trình duyệt của bạn, không ai có thể truy cập qua liên kết ngoài.
                  </span>
                </div>
              </label>

              {/* Share Mode 2: Summary Share */}
              <label
                onClick={() => setShareMode("summary")}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  shareMode === "summary"
                    ? "border-[#004098] bg-blue-50/50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="share-mode"
                  checked={shareMode === "summary"}
                  onChange={() => setShareMode("summary")}
                  className="mt-1 text-[#004098] focus:ring-[#004098]"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Chia sẻ Bản Tóm tắt (Summary Share)
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-snug">
                    Chỉ hiển thị Executive Summary và Top Khuyến nghị, ẩn các chi tiết cá nhân nhạy cảm.
                  </span>
                </div>
              </label>

              {/* Share Mode 3: Full Share */}
              <label
                onClick={() => setShareMode("full")}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  shareMode === "full"
                    ? "border-[#004098] bg-blue-50/50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="share-mode"
                  checked={shareMode === "full"}
                  onChange={() => setShareMode("full")}
                  className="mt-1 text-[#004098] focus:ring-[#004098]"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">
                    Chia sẻ Toàn diện (Full Share với Cố vấn / Gia đình)
                  </span>
                  <span className="text-[11px] text-slate-500 block leading-snug">
                    Cung cấp liên kết bảo mật có thời hạn kèm đầy đủ 14 phần phân tích chuyên sâu.
                  </span>
                </div>
              </label>
            </div>

            {/* Link Copy Box */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/career/report?type=${activeReportType}&mode=${shareMode}`
                      : "https://hcmute-career.edu.vn/career/report"
                  }
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyShareLink}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#004098] hover:bg-[#00337a] rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  {copiedLink ? "Đã chép!" : "Sao chép"}
                </button>
              </div>
              {copiedLink && (
                <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <IconCheck className="w-3.5 h-3.5" />
                  Đã sao chép liên kết vào bộ nhớ tạm!
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
