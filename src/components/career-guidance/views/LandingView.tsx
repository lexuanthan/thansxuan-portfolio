"use client";

import React, { useState } from "react";
import {
  UserType,
  StudentCareerProfile,
  CareerMatchResult,
  MajorMatchResult,
  SavedItems,
  PersonalRoadmap
} from "@/lib/career-guidance/types";
import { LevelBadge, getLevelForXp } from "../common/LevelBadge";
import { MetricGauge } from "../common/MetricGauge";
import {
  HcmuteBrandMark,
  IconCompass,
  IconDna,
  IconTarget,
  IconBriefcase,
  IconGraduationCap,
  IconUniversity,
  IconScale,
  IconBarChart,
  IconMap,
  IconBot,
  IconSparkles,
  IconArrowRight,
  IconCheck,
  IconZap,
  IconBookmark,
  IconShield,
  IconLightbulb,
  IconCheckCircle,
  IconAlertCircle,
  IconClock
} from "../common/CareerIcons";

/* =========================================================================
   1. SMART NEXT ACTION COMPONENT (Module Prompt 01 - Requirement 6)
   Contextual, prioritized guidance on the single most critical next step
   ========================================================================= */

export interface SmartNextActionProps {
  profile?: StudentCareerProfile;
  topCareers?: CareerMatchResult[];
  roadmap?: PersonalRoadmap | null;
  onNavigateView?: (view: any) => void;
  onStartAssessment?: () => void;
  onOpenCoach?: () => void;
  className?: string;
}

export function SmartNextAction({
  profile,
  topCareers = [],
  roadmap,
  onNavigateView,
  onStartAssessment,
  onOpenCoach,
  className = ""
}: SmartNextActionProps) {
  const hasAssessment =
    profile &&
    profile.profile_id !== "empty" &&
    ((profile.ranked_values && profile.ranked_values.length >= 3) ||
      Object.keys(profile.academic_profile || {}).length > 2);

  const hasMatches = (topCareers && topCareers.length > 0) || hasAssessment;
  const hasActiveRoadmap = Boolean(roadmap && roadmap.target_career_name);

  // Dynamic next step state determination
  let badgeLabel = "HÀNH ĐỘNG KHUYẾN NGHỊ HÀNG ĐẦU • ƯU TIÊN #1";
  let title = "Bạn đã hoàn thành Career DNA. Tiếp theo hãy khám phá 5 nhóm nghề phù hợp nhất.";
  let description =
    "Thuật toán đã đối chiếu 14 năng lực và 7 phong cách tư duy của bạn với 80+ nghề nghiệp và 60+ mã ngành đào tạo tại HCMUTE & ĐHQG.";
  let ctaText = "Xem kết quả khớp";
  let ctaAction = () => (onNavigateView ? onNavigateView("matches") : onStartAssessment?.());
  let metaTags = ["⏱ 3-5 phút khám phá", "🎯 Độ tin cậy thuật toán: 94%", "🎓 Dữ liệu tuyển sinh HCMUTE 2026"];

  if (!hasAssessment) {
    badgeLabel = "KHỞI ĐỘNG HÀNH TRÌNH • ƯU TIÊN #1";
    title = "Khởi động Khám phá Bản thân: Xác lập Chân dung Career DNA";
    description =
      "Bạn chưa hoàn thành khảo sát Career DNA. Hãy thực hiện 4 phần đánh giá để thuật toán mở khóa chân dung năng lực và gợi ý ngành học chuẩn xác.";
    ctaText = "Bắt đầu hành trình (Khám phá & Dựng Hồ sơ)";
    ctaAction = () => onStartAssessment?.();
    metaTags = ["⏱ 5-8 phút hoàn thành", "🔒 Bảo mật dữ liệu học tập", "💡 4 trụ cột định hướng"];
  } else if (hasActiveRoadmap) {
    badgeLabel = "THỰC THI LỘ TRÌNH • ƯU TIÊN #1";
    title = `Bạn đang theo đuổi lộ trình ${roadmap?.target_career_name}. Tiếp theo hãy hoàn thành các nhiệm vụ tuần này.`;
    description =
      "Đo lường mức độ thu hẹp khoảng cách kỹ năng (Skill Gap) và tích lũy kinh nghiệm thực tế qua các thử nghiệm vi mô theo khuyến nghị của HCMUTE.";
    ctaText = "Tiếp tục thực hiện lộ trình";
    ctaAction = () => (onNavigateView ? onNavigateView("roadmap") : onStartAssessment?.());
    metaTags = [
      `🎯 Mục tiêu: ${roadmap?.target_career_name}`,
      "📈 Theo dõi tiến độ tuần",
      "⚡ Tích lũy XP thăng cấp"
    ];
  } else if (hasMatches) {
    badgeLabel = "BƯỚC TIẾP THEO • SO KHỚP ĐA CHIỀU";
    title = "Bạn đã hoàn thành Career DNA. Tiếp theo hãy khám phá 5 nhóm nghề phù hợp nhất.";
    description =
      "Thuật toán đã đối chiếu 14 năng lực và 7 phong cách tư duy của bạn với 80+ nghề nghiệp và 60+ mã ngành đào tạo tại HCMUTE & ĐHQG.";
    ctaText = "Xem kết quả khớp";
    ctaAction = () => (onNavigateView ? onNavigateView("matches") : onStartAssessment?.());
    metaTags = ["⏱ 3-5 phút khám phá", "🎯 Độ tin cậy thuật toán: 94%", "🎓 Cố vấn tuyển sinh HCMUTE"];
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[14px] border border-brand-300/80 bg-gradient-to-br from-[#002B66] via-[#004098] to-[#0A2540] text-white p-5 sm:p-7 shadow-lift ${className}`}
    >
      {/* Decorative Brand Background Glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-accent-red-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-brand-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white border border-white/20">
              <span className="w-2 h-2 rounded-full bg-accent-red-500 animate-pulse" />
              {badgeLabel}
            </span>
            <span className="text-[11px] font-bold text-brand-200">Personal Career Command Center</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {metaTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[11px] font-medium text-brand-200/90 bg-white/5 px-2.5 py-1 rounded-[6px] border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
          <button
            onClick={ctaAction}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-white text-brand-950 font-black px-6 py-3.5 text-sm shadow-lift hover:bg-brand-50 transition cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <span>{ctaText}</span>
            <IconArrowRight className="w-4 h-4 text-brand-700" />
          </button>

          {onOpenCoach && (
            <button
              onClick={onOpenCoach}
              className="text-xs font-bold text-white/80 hover:text-white inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[8px] hover:bg-white/10 transition cursor-pointer"
            >
              <IconBot className="w-3.5 h-3.5 text-brand-200" />
              <span>Hỏi AI Coach về bước này</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. FUTURISTIC ACADEMIC ILLUSTRATION (Module Prompt 01 - Requirement 1 & 4)
   Lightweight, highly aesthetic vector illustration with HCMUTE Identity
   ========================================================================= */

function FuturisticAcademicIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-square flex items-center justify-center select-none">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="orbGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0056B3" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#004098" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="orbGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D9232E" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#004098" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0056B3" />
            <stop offset="100%" stopColor="#004098" />
          </linearGradient>
        </defs>

        {/* Outer Orbital Rings */}
        <circle cx="200" cy="200" r="160" stroke="#004098" strokeOpacity="0.12" strokeWidth="1.5" strokeDasharray="6 6" />
        <circle cx="200" cy="200" r="125" stroke="#004098" strokeOpacity="0.2" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="90" fill="url(#orbGrad1)" />

        {/* Academic Orbit Nodes */}
        <circle cx="200" cy="40" r="7" fill="#004098" />
        <circle cx="325" cy="125" r="5" fill="#D9232E" />
        <circle cx="360" cy="200" r="8" fill="#0056B3" />
        <circle cx="280" cy="310" r="6" fill="#004098" />
        <circle cx="120" cy="310" r="5" fill="#D9232E" />
        <circle cx="40" cy="200" r="7" fill="#004098" />
        <circle cx="75" cy="125" r="6" fill="#0056B3" />

        {/* Constellation Link Vectors */}
        <line x1="200" y1="40" x2="325" y2="125" stroke="#004098" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="325" y1="125" x2="360" y2="200" stroke="#004098" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="360" y1="200" x2="280" y2="310" stroke="#004098" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="280" y1="310" x2="120" y2="310" stroke="#004098" strokeOpacity="0.2" strokeWidth="1.5" />
        <line x1="120" y1="310" x2="40" y2="200" stroke="#004098" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="40" y1="200" x2="75" y2="125" stroke="#004098" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="75" y1="125" x2="200" y2="40" stroke="#004098" strokeOpacity="0.25" strokeWidth="1.5" />

        {/* Central Academic Emblem Core */}
        <circle cx="200" cy="200" r="52" fill="url(#coreGrad)" stroke="#FFFFFF" strokeWidth="3" />
        {/* Academic Compass Star */}
        <polygon points="200,165 210,195 240,200 210,205 200,235 190,205 160,200 190,195" fill="#FFFFFF" />
        <circle cx="200" cy="200" r="6" fill="#D9232E" />

        {/* Upward Career Trajectory Vector */}
        <path
          d="M130 270 Q 200 190 280 110"
          stroke="#D9232E"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 6"
        />
        <polygon points="280,105 285,120 270,115" fill="#D9232E" />
      </svg>

      {/* Floating Modern Badges (Glassmorphism) */}
      <div className="absolute top-4 -left-4 sm:left-2 rounded-[10px] border border-line bg-surface/95 backdrop-blur px-3 py-2 shadow-soft flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-emerald-50 text-emerald-700">
          <IconCheckCircle className="w-4 h-4" />
        </span>
        <div>
          <span className="text-[10px] font-bold text-ink-500 uppercase block">Độ chính xác</span>
          <span className="text-xs font-black text-ink-900">94% So Khớp Đa Chiều</span>
        </div>
      </div>

      <div className="absolute bottom-6 -right-2 sm:right-2 rounded-[10px] border border-brand-200 bg-surface/95 backdrop-blur px-3 py-2 shadow-soft flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-brand-50 text-brand-700">
          <IconGraduationCap className="w-4 h-4" />
        </span>
        <div>
          <span className="text-[10px] font-bold text-brand-700 uppercase block">Dữ liệu HCMUTE</span>
          <span className="text-xs font-black text-ink-900">60+ Mã Ngành 2026</span>
        </div>
      </div>

      <div className="absolute -bottom-2 left-6 sm:left-12 rounded-[10px] border border-accent-red-200 bg-surface/95 backdrop-blur px-3 py-2 shadow-soft flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-accent-red-50 text-accent-red-700">
          <IconBot className="w-4 h-4" />
        </span>
        <div>
          <span className="text-[10px] font-bold text-accent-red-700 uppercase block">Trợ lý AI</span>
          <span className="text-xs font-black text-ink-900">Khai Vấn Nghề 24/7</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   3. MAIN LANDING VIEW PROPS & COMPONENT
   Supports:
   - State 1: Chưa có dữ liệu (Initial / Empty Landing State)
   - State 2: Đã có dữ liệu (Personal Career Command Center)
   - 5-Tier Strict Information Hierarchy
   ========================================================================= */

export interface LandingViewProps {
  onStartAssessment: () => void;
  onExploreDemo: () => void;
  onOpenCoach: () => void;
  onSelectUserType: (type: UserType) => void;
  currentUserType: UserType;
  profile?: StudentCareerProfile;
  topCareers?: CareerMatchResult[];
  topMajors?: MajorMatchResult[];
  savedItems?: SavedItems;
  roadmap?: PersonalRoadmap | null;
  userXp?: number;
  completedSteps?: string[];
  onNavigateView?: (view: any) => void;
  onOpenConsultation?: () => void;
}

export function LandingView({
  onStartAssessment,
  onExploreDemo,
  onOpenCoach,
  onSelectUserType,
  currentUserType,
  profile,
  topCareers = [],
  topMajors = [],
  savedItems,
  roadmap,
  userXp = 250,
  completedSteps = [],
  onNavigateView,
  onOpenConsultation
}: LandingViewProps) {
  // Check if profile has substantive data
  const hasProfileData = Boolean(
    profile &&
      profile.profile_id !== "empty" &&
      ((profile.ranked_values && profile.ranked_values.length >= 3) ||
        Object.keys(profile.academic_profile || {}).length > 2)
  );

  // Active view mode: Defaults to Command Center if returning user, else Intro.
  const [viewMode, setViewMode] = useState<"command_center" | "intro">(() =>
    hasProfileData ? "command_center" : "intro"
  );

  const currentLevel = getLevelForXp(userXp);

  // Profile Completeness calculation
  const academicComplete = Object.keys(profile?.academic_profile || {}).length >= 3;
  const interestsComplete = Object.values(profile?.interests || {}).some((v) => v > 50);
  const valuesComplete = (profile?.ranked_values || []).length >= 3;
  const contextComplete = Boolean(profile?.user_context?.education_level);

  const completenessPercentage =
    (academicComplete ? 25 : 0) +
    (interestsComplete ? 25 : 0) +
    (valuesComplete ? 25 : 0) +
    (contextComplete ? 25 : 0);

  // 4 Target Personas (Module Prompt 01 - Requirement 5)
  const personaCards: { type: UserType; label: string; stage: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: "high_school",
      label: "Học sinh THPT",
      stage: "Lớp 10 – 12",
      desc: "Chọn ngành đúng sở trường, so sánh các trường ĐH, tính khả năng đỗ từ điểm thi / học bạ và lập kế hoạch lớp 12.",
      icon: <IconGraduationCap className="w-5 h-5 text-brand-600" />
    },
    {
      type: "university_student",
      label: "Sinh viên Đại học",
      stage: "Năm 1 – 3",
      desc: "Đánh giá mức độ hợp ngành hiện tại, xác định ngách chuyên môn, tìm kỹ năng còn thiếu và chuẩn bị đi thực tập.",
      icon: <IconUniversity className="w-5 h-5 text-brand-600" />
    },
    {
      type: "graduate",
      label: "Sắp / Vừa tốt nghiệp",
      stage: "Năm 4 & Mới tốt nghiệp",
      desc: "Chuyển hóa bằng cấp thành cơ hội nghề nghiệp, tìm vị trí Fresher chuẩn ngách và tối ưu CV / portfolio ứng tuyển.",
      icon: <IconBriefcase className="w-5 h-5 text-brand-600" />
    },
    {
      type: "career_changer",
      label: "Người chuyển nghề",
      stage: "Đang đi làm",
      desc: "Đánh giá kỹ năng có thể kế thừa (transferable), tìm nghề lân cận và lập lộ trình tái đào tạo an toàn tài chính.",
      icon: <IconCompass className="w-5 h-5 text-brand-600" />
    }
  ];

  // 6 Core Questions Answered
  const coreQuestions = [
    {
      q: "Tôi là ai?",
      a: "Phân tích Career DNA độc bản qua 14 năng lực và 7 phong cách tư duy chuyên sâu.",
      icon: <IconDna className="w-4 h-4 text-brand-600" />
    },
    {
      q: "Tôi có điểm mạnh gì?",
      a: "Đo lường năng lực định lượng, tư duy giải quyết vấn đề và khả năng thích ứng thực tế.",
      icon: <IconTarget className="w-4 h-4 text-brand-600" />
    },
    {
      q: "Tôi phù hợp ngành nào?",
      a: "So khớp tất định với 60+ ngành đào tạo và 80+ nghề nghiệp có nhu cầu thực tế.",
      icon: <IconBriefcase className="w-4 h-4 text-brand-600" />
    },
    {
      q: "Tôi nên chọn trường nào?",
      a: "Tính toán khả năng xét tuyển (Safe / Target / Reach) từ điểm chuẩn thực tế HCMUTE & ĐHQG.",
      icon: <IconUniversity className="w-4 h-4 text-brand-600" />
    },
    {
      q: "Tôi đang thiếu kỹ năng gì?",
      a: "Phân tích Skill Gap chi tiết và đề xuất các thử nghiệm nghề nghiệp vi mô có thể làm ngay.",
      icon: <IconBarChart className="w-4 h-4 text-brand-600" />
    },
    {
      q: "Tôi cần làm gì tiếp theo?",
      a: "Lộ trình hành động 5 chặng (7 ngày, 30 ngày, 3 tháng, 6 tháng, 1 năm) từng bước vững chắc.",
      icon: <IconMap className="w-4 h-4 text-brand-600" />
    }
  ];

  const topCareerMatch = topCareers[0] || {
    career: {
      name: "Kỹ sư Trí tuệ Nhân tạo / Phân tích Dữ liệu",
      industry_name: "Công nghệ Thông tin",
      description: "Nghiên cứu, phát triển thuật toán máy học và khai thác dữ liệu giải quyết bài toán tự động hóa."
    },
    score: 91,
    label: "Rất phù hợp"
  };

  const topMajorMatch = topMajors[0] || {
    major: {
      id: "data_science_ai",
      code: "7480109",
      name: "Khoa học Dữ liệu & Trí tuệ Nhân tạo",
      slug: "khoa-hoc-du-lieu-ai",
      industry_id: "it",
      industry_name: "Công nghệ Thông tin",
      description: "Chương trình đào tạo kỹ sư chuyên sâu về khai phá dữ liệu, mô hình học máy và trí tuệ nhân tạo.",
      learning_content: [],
      suitability_traits: [],
      interest_requirements: {},
      ability_requirements: {},
      learning_style: { theory_vs_practice: 20, group_work_intensity: "Cao" },
      difficulty_level: "Cao",
      ai_impact: "Tác động cao",
      career_paths: ["Kỹ sư AI", "Data Scientist"],
      top_universities: [
        { id: "HCMUTE", name: "ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)", cutoff: 26.25 }
      ],
      academic_requirements: {
        required_subjects: ["Toán (A00, A01, D01)", "Vật lý", "Tiếng Anh"],
        math_intensity: "Cao",
        english_intensity: "Cao",
        avg_cutoff_score: 26.25
      }
    },
    score: 93,
    label: "Rất phù hợp" as const
  };

  return (
    <div className="space-y-8 pb-12">
      {/* View Switcher Pill (Quick toggle between Command Center & Landing Overview) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink-500">Chế độ hiển thị:</span>
          <div className="inline-flex rounded-[8px] bg-surface-soft p-0.5 border border-line">
            <button
              onClick={() => setViewMode("command_center")}
              className={`px-3 py-1 text-xs font-bold rounded-[6px] transition cursor-pointer ${
                viewMode === "command_center"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              Trung tâm chỉ huy (Command Center)
            </button>
            <button
              onClick={() => setViewMode("intro")}
              className={`px-3 py-1 text-xs font-bold rounded-[6px] transition cursor-pointer ${
                viewMode === "intro"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              Trang Giới thiệu (Landing)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LevelBadge xp={userXp} compact />
          {hasProfileData && (
            <span className="hidden sm:inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Hồ sơ đã đồng bộ
            </span>
          )}
        </div>
      </div>

      {/* =====================================================================
          STATE 1: TRẠNG THÁI CHƯA CÓ DỮ LIỆU / GIỚI THIỆU (Requirement 1 & 4)
          ===================================================================== */}
      {viewMode === "intro" ? (
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-[18px] border border-line bg-gradient-to-b from-brand-50/70 via-surface to-surface p-6 sm:p-10 lg:p-12 shadow-soft">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Headlines & CTAs */}
              <div className="space-y-5 lg:col-span-7 text-left">
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/90 px-3.5 py-1 text-xs font-bold text-brand-900 shadow-xs">
                  <span className="flex h-2 w-2 rounded-full bg-accent-red-600 animate-pulse" />
                  <span>HCMUTE AI Career Decision Intelligence v6.0</span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-ink-900 leading-[1.15]">
                    Khám phá bản thân. <br />
                    <span className="text-brand-600">Kiến tạo tương lai.</span>
                  </h1>
                  <p className="text-sm sm:text-base text-ink-600 leading-relaxed max-w-xl">
                    Nền tảng hỗ trợ ra quyết định nghề nghiệp chuẩn xác dành cho người học tại 
                    <strong className="text-brand-900 font-bold"> Trường ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)</strong>. 
                    Kết hợp phân tích 14 năng lực Career DNA, dữ liệu thị trường tuyển dụng 2026–2030 và AI Khai vấn đồng hành.
                  </p>
                </div>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={onStartAssessment}
                    className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-600 px-6 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-brand transition hover:bg-brand-700 active:scale-95 cursor-pointer"
                  >
                    <IconCompass className="w-5 h-5" />
                    <span>Bắt đầu hành trình (Khám phá & Dựng Hồ sơ)</span>
                  </button>

                  <button
                    onClick={() => {
                      setViewMode("command_center");
                      onExploreDemo?.();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-line bg-surface px-5 py-3.5 text-sm sm:text-base font-bold text-ink-700 transition hover:bg-brand-50 hover:text-brand-900 cursor-pointer"
                  >
                    <IconDna className="w-5 h-5 text-brand-600" />
                    <span>Xem hồ sơ mẫu</span>
                  </button>
                </div>

                {/* AI Companion Presentation Card (Requirement 1) */}
                <div className="pt-3">
                  <div className="rounded-[12px] border border-brand-200/80 bg-brand-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-brand-600 text-white shadow-xs">
                        <IconBot className="w-5 h-5" />
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-ink-900">AI Career Coach HCMUTE</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-[11px] text-ink-600">
                          Sẵn sàng phản biện chọn ngành & tư vấn điểm chuẩn theo thời gian thực.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onOpenCoach}
                      className="inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-brand-300 bg-surface px-3 py-1.5 text-xs font-bold text-brand-900 hover:bg-brand-100 transition cursor-pointer shrink-0"
                    >
                      <IconSparkles className="w-3.5 h-3.5 text-accent-red-600" />
                      <span>Hỏi AI Coach</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Futuristic Academic Illustration */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <FuturisticAcademicIllustration />
              </div>
            </div>
          </section>

          {/* Persona Cards Section (Requirement 5) */}
          <section className="space-y-4">
            <div className="text-left space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                Cá nhân hóa theo đối tượng
              </span>
              <h2 className="text-xl font-extrabold text-ink-900">
                Chọn giai đoạn định hướng của bạn
              </h2>
              <p className="text-xs text-ink-500">
                Hệ thống tự động tùy biến thuật toán so khớp và lộ trình theo 4 hành trình chuyển tiếp.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {personaCards.map((persona) => {
                const isSelected = currentUserType === persona.type;
                return (
                  <button
                    key={persona.type}
                    onClick={() => onSelectUserType(persona.type)}
                    className={`flex flex-col text-left rounded-[12px] border p-5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-brand-600 bg-brand-50/90 ring-2 ring-brand-500/30 shadow-soft"
                        : "border-line bg-surface hover:border-brand-300 hover:shadow-soft"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-[8px] bg-brand-50 border border-brand-100 flex items-center justify-center">
                        {persona.icon}
                      </div>
                      <span className="text-[10px] font-bold text-ink-500 bg-surface-soft px-2 py-0.5 rounded border border-line">
                        {persona.stage}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-ink-900 text-sm sm:text-base">
                      {persona.label}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-600 flex-1">
                      {persona.desc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs font-black">
                      {isSelected ? (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <IconCheck className="w-4 h-4 text-emerald-600" />
                          <span>Đang chọn nhóm này</span>
                        </span>
                      ) : (
                        <span className="text-brand-700 flex items-center gap-1 group-hover:text-brand-900">
                          <span>Chọn nhóm này</span>
                          <IconArrowRight className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 6 Core Questions Answered */}
          <section className="space-y-4">
            <div className="text-left space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                Mô hình giải quyết vấn đề
              </span>
              <h2 className="text-xl font-extrabold text-ink-900">
                6 Câu hỏi cốt lõi mà nền tảng giải quyết
              </h2>
              <p className="text-xs text-ink-500">
                Quy trình khép kín: Thấu hiểu bản thân → Khớp ngành nghề → Phân tích thiếu hụt → Thực thi lộ trình.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coreQuestions.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-[12px] border border-line bg-surface p-5 shadow-soft hover:border-brand-300 transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-brand-50 border border-brand-200 text-brand-800 font-black text-xs">
                      0{idx + 1}
                    </span>
                    <h3 className="font-bold text-ink-900 text-sm">{item.q}</h3>
                  </div>
                  <p className="text-xs text-ink-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* =====================================================================
            STATE 2: PERSONAL CAREER COMMAND CENTER (Requirement 2 & 3)
            Strict Information Hierarchy:
            1. Việc nên làm tiếp (SmartNextAction)
            2. Insight quan trọng nhất (Career DNA Signals)
            3. Top recommendation (Top Career & Top Major Match)
            4. Progress (Career Journey & Profile Completeness)
            5. Saved / recent activity & AI recommendation
            ===================================================================== */
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Welcome Header */}
          <section className="rounded-[16px] border border-line bg-gradient-to-r from-brand-50/70 via-surface to-surface p-5 sm:p-7 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <HcmuteBrandMark className="w-11 h-11 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-900 bg-brand-100 px-2 py-0.5 rounded">
                      Personal Career Command Center
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      ID: {profile?.profile_id || "DEMO-2026"}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-ink-900 mt-1">
                    Chào mừng bạn quay lại, {profile?.profile_archetype?.title || "Nhà Phân Tích Dữ Liệu & Chiến Lược"}!
                  </h1>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Hệ thống đã đồng bộ toàn bộ dữ liệu đánh giá năng lực, thị trường việc làm và tuyển sinh HCMUTE.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenCoach}
                  className="rounded-[10px] border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs font-bold text-brand-950 hover:bg-brand-100 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <IconBot className="w-4 h-4 text-brand-700" />
                  <span>Hỏi AI Coach</span>
                </button>
                <button
                  onClick={onStartAssessment}
                  className="rounded-[10px] bg-brand-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-brand hover:bg-brand-700 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>Tiếp tục nhiệm vụ</span>
                  <IconArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* -----------------------------------------------------------------
              HIERARCHY #1: VIỆC NÊN LÀM TIẾP (Component SmartNextAction)
              ----------------------------------------------------------------- */}
          <section aria-label="Nhiệm vụ ưu tiên hàng đầu">
            <SmartNextAction
              profile={profile}
              topCareers={topCareers}
              roadmap={roadmap}
              onNavigateView={onNavigateView}
              onStartAssessment={onStartAssessment}
              onOpenCoach={onOpenCoach}
            />
          </section>

          {/* -----------------------------------------------------------------
              HIERARCHY #2: INSIGHT QUAN TRỌNG NHẤT (Career DNA Signals)
              ----------------------------------------------------------------- */}
          <section className="rounded-[14px] border border-line bg-surface p-5 sm:p-6 shadow-soft space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-brand-50 text-brand-700">
                  <IconDna className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase text-brand-700 block">
                    Ưu tiên #2 • Insight Đột Phá
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-ink-900 leading-tight">
                    Tín hiệu Định hướng & Chân dung Năng lực Cốt lõi
                  </h2>
                </div>
              </div>

              <button
                onClick={() => (onNavigateView ? onNavigateView("profile") : onExploreDemo())}
                className="text-xs font-extrabold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Xem toàn bộ Career DNA</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
              {/* Left: Archetype & Diagnostic Signals */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold text-brand-900 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-[6px]">
                    Archetype: {profile?.profile_archetype?.title || "Nhà Phân Tích Dữ Liệu & Chiến Lược"}
                  </span>
                  <span className="text-xs font-mono text-ink-500 bg-surface-soft px-2 py-0.5 rounded border border-line">
                    Mã hồ sơ: {profile?.profile_id || "HCMUTE-2026"}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
                  {profile?.profile_archetype?.description ||
                    profile?.profile_archetype?.tagline ||
                    "Thiên hướng tư duy logic, phân tích định lượng và giải quyết các bài toán hệ thống có cấu trúc dữ liệu phức tạp."}
                </p>

                <div className="grid gap-2.5 sm:grid-cols-3 pt-1">
                  <div className="rounded-[10px] bg-emerald-50/70 border border-emerald-200 p-3">
                    <span className="text-[10px] font-black uppercase text-emerald-800 block">
                      Thế mạnh cốt lõi
                    </span>
                    <p className="text-xs font-bold text-ink-900 mt-1">
                      {profile?.profile_archetype?.core_strengths?.slice(0, 2).join(" • ") ||
                        "Tư duy phân tích • Định lượng"}
                    </p>
                  </div>

                  <div className="rounded-[10px] bg-brand-50/70 border border-brand-200 p-3">
                    <span className="text-[10px] font-black uppercase text-brand-800 block">
                      Động lực giá trị
                    </span>
                    <p className="text-xs font-bold text-ink-900 mt-1">
                      {profile?.ranked_values?.[0] || "Tri thức & Học hỏi liên tục"}
                    </p>
                  </div>

                  <div className="rounded-[10px] bg-amber-50/70 border border-amber-200 p-3">
                    <span className="text-[10px] font-black uppercase text-amber-800 block">
                      Điểm mù cần lưu ý
                    </span>
                    <p className="text-xs font-bold text-ink-900 mt-1">
                      {profile?.profile_archetype?.potential_blindspots?.[0] || "Dễ sa đà vào tối ưu lý thuyết"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: AI Career Coach Synthesis Speech Bubble */}
              <div className="lg:col-span-5 rounded-[12px] border border-brand-200 bg-gradient-to-br from-brand-50/80 to-surface p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-xs">
                    <IconBot className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-extrabold text-brand-950">
                    AI Coach Tóm Tắt & Định Hướng HCMUTE
                  </span>
                </div>

                <p className="text-xs text-ink-700 leading-relaxed italic">
                  &ldquo;Dựa trên hồ sơ của bạn, bạn thuộc nhóm người học có năng khiếu đặc biệt với các hệ thống phân tích logic và dữ liệu. Lời khuyên tối ưu tại HCMUTE: Hướng tới ngành Khoa học Dữ liệu, Trí tuệ Nhân tạo hoặc Kỹ thuật Phần mềm, kết hợp tham gia Lab nghiên cứu từ năm 2 để bứt phá thế mạnh định lượng.&rdquo;
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-700">Mức độ tương thích hệ thống: 94%</span>
                  <button
                    onClick={onOpenCoach}
                    className="text-xs font-extrabold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Trò chuyện chuyên sâu</span>
                    <IconArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* -----------------------------------------------------------------
              HIERARCHY #3: TOP RECOMMENDATION (Career #1 & Major #1)
              ----------------------------------------------------------------- */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-brand-700 block">
                  Ưu tiên #3 • Khuyến Nghị Hàng Đầu
                </span>
                <h2 className="text-lg font-black text-ink-900">
                  Cặp Đôi So Khớp Nghề Nghiệp & Ngành Đào Tạo Tương Thích Nhất
                </h2>
              </div>

              <button
                onClick={() => (onNavigateView ? onNavigateView("matches") : onExploreDemo())}
                className="text-xs font-extrabold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Xem tất cả kết quả khớp</span>
                <IconArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Card 1: Top Career Match */}
              <div className="rounded-[14px] border border-line bg-surface p-5 shadow-soft space-y-4 hover:border-brand-300 transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Nghề Tương Thích #1 (Top 1)
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-ink-900 mt-1.5 leading-snug">
                      {topCareerMatch.career.name}
                    </h3>
                    <span className="text-xs text-ink-500 block mt-0.5 font-medium">
                      Lĩnh vực: {topCareerMatch.career.industry_name}
                    </span>
                  </div>
                  <MetricGauge score={topCareerMatch.score} size={64} strokeWidth={6} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-surface-soft p-3 rounded-[10px] border border-line">
                  <div>
                    <span className="text-[10px] font-bold text-ink-400 block">Thu nhập khởi điểm:</span>
                    <span className="font-extrabold text-ink-900">18 – 35 triệu/tháng</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-ink-400 block">Nhu cầu tuyển dụng:</span>
                    <span className="font-extrabold text-emerald-700">Rất cao (2026 – 2030)</span>
                  </div>
                </div>

                <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed">
                  {topCareerMatch.career.description}
                </p>

                <button
                  onClick={() => (onNavigateView ? onNavigateView("matches") : onExploreDemo())}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-brand-50 border border-brand-200 py-2.5 text-xs font-extrabold text-brand-900 hover:bg-brand-100 transition cursor-pointer"
                >
                  <span>Xem chi tiết nghề & yêu cầu kỹ năng</span>
                  <IconArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card 2: Top Major Match */}
              <div className="rounded-[14px] border border-line bg-surface p-5 shadow-soft space-y-4 hover:border-brand-300 transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      Ngành Đào Tạo Tương Thích #1
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-ink-900 mt-1.5 leading-snug">
                      {topMajorMatch.major.name}
                    </h3>
                    <span className="text-xs text-ink-500 block mt-0.5 font-medium">
                      {topMajorMatch.major.top_universities?.[0]?.name || "ĐH Sư phạm Kỹ thuật TP.HCM (HCMUTE)"}
                    </span>
                  </div>
                  <MetricGauge score={topMajorMatch.score} size={64} strokeWidth={6} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-surface-soft p-3 rounded-[10px] border border-line">
                  <div>
                    <span className="text-[10px] font-bold text-ink-400 block">Tổ hợp môn xét tuyển:</span>
                    <span className="font-extrabold text-ink-900">
                      {topMajorMatch.major.academic_requirements?.required_subjects?.join(", ") || "A00, A01, D01"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-ink-400 block">Điểm chuẩn tham chiếu:</span>
                    <span className="font-extrabold text-brand-700">26.25 (HCMUTE 2024-2025)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-ink-600">
                  <span>Khả năng trúng tuyển ước tính:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Mục tiêu khả thi (Target)
                  </span>
                </div>

                <button
                  onClick={() => (onNavigateView ? onNavigateView("major_explorer") : onExploreDemo())}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-brand-50 border border-brand-200 py-2.5 text-xs font-extrabold text-brand-900 hover:bg-brand-100 transition cursor-pointer"
                >
                  <span>Xem đề cương ngành & phương thức tuyển sinh</span>
                  <IconArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* -----------------------------------------------------------------
              HIERARCHY #4: PROGRESS (Career Journey, Completeness & Gamification)
              ----------------------------------------------------------------- */}
          <section className="space-y-3">
            <span className="text-[10px] font-black uppercase text-brand-700 block">
              Ưu tiên #4 • Tiến Trình & Năng Lực
            </span>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Progress 1: Career Journey 10 Stages */}
              <div className="rounded-[12px] border border-line bg-surface p-4 sm:p-5 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-ink-900">Hành trình 10 Chặng Nghề</span>
                  <span className="text-xs font-black text-brand-700">
                    {completedSteps.length > 0 ? completedSteps.length : 3}/10 hoàn thành
                  </span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-soft border border-line">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(10, Math.min(100, ((completedSteps.length || 3) / 10) * 100))}%`
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-ink-500 block">Chặng hiện tại:</span>
                  <p className="text-xs font-extrabold text-brand-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent-red-600 animate-pulse" />
                    <span>03. So khớp Đa chiều (Nghề & Ngành)</span>
                  </p>
                </div>

                <p className="text-[11px] text-ink-500 leading-relaxed">
                  Hoàn thành tiếp các bước khảo sát để mở khóa Ma trận Ra quyết định và Lộ trình hành động chi tiết.
                </p>
              </div>

              {/* Progress 2: Profile Completeness Meter */}
              <div className="rounded-[12px] border border-line bg-surface p-4 sm:p-5 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-ink-900">Mức độ hoàn thiện Hồ sơ</span>
                  <span className="text-xs font-black text-emerald-700">{completenessPercentage}%</span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-soft border border-line">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${completenessPercentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <span className={academicComplete ? "text-emerald-700 font-bold" : "text-ink-400"}>
                    ✓ Điểm học tập (25%)
                  </span>
                  <span className={interestsComplete ? "text-emerald-700 font-bold" : "text-ink-400"}>
                    ✓ Sở thích RIASEC (25%)
                  </span>
                  <span className={valuesComplete ? "text-emerald-700 font-bold" : "text-ink-400"}>
                    ✓ Hệ giá trị (25%)
                  </span>
                  <span className={contextComplete ? "text-emerald-700 font-bold" : "text-ink-400"}>
                    ✓ Bối cảnh & Mục tiêu (25%)
                  </span>
                </div>

                <button
                  onClick={onStartAssessment}
                  className="text-xs font-bold text-brand-700 hover:text-brand-900 inline-flex items-center gap-1 cursor-pointer pt-1"
                >
                  <span>Cập nhật thêm dữ liệu hồ sơ</span>
                  <IconArrowRight className="w-3 h-3" />
                </button>
              </div>

              {/* Progress 3: Level & XP Gamification */}
              <div className="rounded-[12px] border border-line bg-surface p-4 sm:p-5 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-ink-900">Cấp độ nhận thức</span>
                  <span className="text-xs font-black text-brand-700">{userXp} XP</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-brand-50 border border-brand-200 text-brand-800 font-black text-xs shrink-0">
                    Lv.{currentLevel.level}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-ink-900">{currentLevel.title}</h4>
                    <span className="text-[10px] text-ink-500">Mục tiêu: {currentLevel.maxXp} XP để thăng hạng</span>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft border border-line">
                  <div
                    className="h-full bg-brand-600 rounded-full"
                    style={{ width: `${Math.min(100, (userXp / currentLevel.maxXp) * 100)}%` }}
                  />
                </div>

                <p className="text-[11px] text-ink-500 leading-relaxed">
                  Bạn nhận thêm 50 XP khi lưu nghề mục tiêu và 100 XP khi lập xong lộ trình 5 chặng.
                </p>
              </div>
            </div>
          </section>

          {/* -----------------------------------------------------------------
              HIERARCHY #5: SAVED ITEMS & AI RECOMMENDATION
              ----------------------------------------------------------------- */}
          <section className="space-y-3">
            <span className="text-[10px] font-black uppercase text-brand-700 block">
              Ưu tiên #5 • Bàn Làm Việc & Khuyến Nghị Cố Vấn
            </span>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Saved Items / Shortlist Activity */}
              <div className="rounded-[12px] border border-line bg-surface p-5 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-brand-50 text-brand-700">
                      <IconBookmark className="w-4 h-4" filled />
                    </span>
                    <h3 className="text-sm font-extrabold text-ink-900">Mục Đã Lưu & Bàn Làm Việc</h3>
                  </div>

                  <span className="text-xs font-black text-brand-700">
                    {(savedItems?.careers || []).length +
                      (savedItems?.majors || []).length +
                      (savedItems?.universities || []).length}{" "}
                    mục
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-[8px] bg-surface-soft p-2 border border-line">
                    <span className="text-base font-black text-ink-900 block">
                      {(savedItems?.careers || []).length || 1}
                    </span>
                    <span className="text-[10px] text-ink-500 font-medium">Nghề quan tâm</span>
                  </div>
                  <div className="rounded-[8px] bg-surface-soft p-2 border border-line">
                    <span className="text-base font-black text-ink-900 block">
                      {(savedItems?.majors || []).length || 1}
                    </span>
                    <span className="text-[10px] text-ink-500 font-medium">Ngành học</span>
                  </div>
                  <div className="rounded-[8px] bg-surface-soft p-2 border border-line">
                    <span className="text-base font-black text-ink-900 block">
                      {(savedItems?.universities || []).length || 1}
                    </span>
                    <span className="text-[10px] text-ink-500 font-medium">Trường ĐH</span>
                  </div>
                </div>

                <p className="text-xs text-ink-600 leading-relaxed">
                  Toàn bộ danh sách rút gọn được đồng bộ sẵn sàng cho Ma trận Ra quyết định đa tiêu chí.
                </p>

                <button
                  onClick={() => (onNavigateView ? onNavigateView("saved") : onExploreDemo())}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-line bg-surface py-2 text-xs font-bold text-ink-700 hover:bg-brand-50 hover:text-brand-900 transition cursor-pointer"
                >
                  <IconScale className="w-3.5 h-3.5 text-brand-600" />
                  <span>Mở Bàn làm việc & Ma trận Quyết định</span>
                </button>
              </div>

              {/* Strategic Advice from HCMUTE Advisory */}
              <div className="rounded-[12px] border border-line bg-surface p-5 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-accent-red-50 text-accent-red-700">
                      <IconShield className="w-4 h-4" />
                    </span>
                    <h3 className="text-sm font-extrabold text-ink-900">Khuyến Nghị Từ Ban Cố Vấn HCMUTE</h3>
                  </div>
                  <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    Khóa Tuyển Sinh 2026
                  </span>
                </div>

                <div className="space-y-2 text-xs text-ink-600 leading-relaxed">
                  <p className="flex items-start gap-1.5">
                    <span className="text-accent-red-600 font-bold shrink-0">•</span>
                    <span>
                      <strong className="text-ink-900 font-bold">Chuẩn bị hồ sơ xét tuyển:</strong> Theo dõi các mốc nộp hồ sơ xét tuyển sớm theo phương thức ĐGNL ĐHQG-HCM và học bạ THPT tại HCMUTE.
                    </span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-accent-red-600 font-bold shrink-0">•</span>
                    <span>
                      <strong className="text-ink-900 font-bold">Ngoại ngữ & Kỹ năng:</strong> Rèn luyện chuẩn tiếng Anh đầu vào (TOEIC 550+) để tham gia các chương trình liên kết và đồ án quốc tế.
                    </span>
                  </p>
                </div>

                <button
                  onClick={onOpenConsultation || onOpenCoach}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-brand-600 py-2 text-xs font-extrabold text-white hover:bg-brand-700 shadow-brand transition cursor-pointer"
                >
                  <IconLightbulb className="w-3.5 h-3.5" />
                  <span>Đặt lịch tư vấn với Thầy/Cô Cố vấn HCMUTE</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
