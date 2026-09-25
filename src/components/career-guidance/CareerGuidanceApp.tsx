"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  StudentCareerProfile,
  SavedItems,
  PersonalRoadmap,
  UserType
} from "@/lib/career-guidance/types";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";
import { rankCareers, rankMajors } from "@/lib/career-guidance/matchingEngine";
import { generatePersonalRoadmap } from "@/lib/career-guidance/roadmapEngine";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { MAJORS_DATA } from "@/lib/career-guidance/majorsData";
import defaultConfig from "@/data/career_guidance_config.json";

// Views
import { LandingView } from "./views/LandingView";
import { OnboardingModal } from "./views/OnboardingModal";
import { AssessmentView } from "./views/AssessmentView";
import { ProfileView } from "./views/ProfileView";
import { MatchesView } from "./views/MatchesView";
import { CareerExplorerView } from "./views/CareerExplorerView";
import { MajorExplorerView } from "./views/MajorExplorerView";
import { UniversityExplorerView } from "./views/UniversityExplorerView";
import { CompareView } from "./views/CompareView";
import { SkillGapView } from "./views/SkillGapView";
import { RoadmapView } from "./views/RoadmapView";
import { AiCoachView } from "./views/AiCoachView";
import { SavedView } from "./views/SavedView";
import { ReportModal } from "./views/ReportModal";
import { ConsultationModal } from "./views/ConsultationModal";

// Reusable Atoms & Gamification
import { JourneyProgressBar } from "./common/JourneyProgressBar";
import { LevelBadge } from "./common/LevelBadge";
import {
  HcmuteBrandMark,
  IconHome,
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
  IconBookmark,
  IconSearch,
  IconBell,
  IconShare,
  IconUser,
  IconFileText,
  IconCheck,
  IconX,
  IconSparkles,
  IconArrowRight
} from "./common/CareerIcons";

export type ActiveView =
  | "landing"
  | "assessment"
  | "profile"
  | "matches"
  | "career_explorer"
  | "major_explorer"
  | "university_explorer"
  | "compare"
  | "skill_gap"
  | "roadmap"
  | "coach"
  | "saved";

export function normalizeTab(raw: string | null): ActiveView | null {
  if (!raw) return null;
  const s = raw.toLowerCase().trim();
  if (s === "assessment" || s === "test" || s === "quiz") return "assessment";
  if (s === "coach" || s === "chat" || s === "ai") return "coach";
  if (s === "careers" || s === "career" || s === "career_explorer") return "career_explorer";
  if (s === "majors" || s === "major" || s === "major_explorer") return "major_explorer";
  if (s === "universities" || s === "university" || s === "university_explorer" || s === "schools") return "university_explorer";
  if (s === "skillgap" || s === "skill_gap" || s === "skills") return "skill_gap";
  if (s === "roadmap" || s === "plan") return "roadmap";
  if (s === "profile" || s === "dna") return "profile";
  if (s === "matches" || s === "results") return "matches";
  if (s === "compare") return "compare";
  if (s === "saved" || s === "bookmarks") return "saved";
  if (s === "landing" || s === "home") return "landing";
  return null;
}

export default function CareerGuidanceApp() {
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get("tab") : null;

  const [profile, setProfile] = useState<StudentCareerProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cg_user_profile_v3");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return createDefaultProfile();
  });

  const [savedItems, setSavedItems] = useState<SavedItems>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cg_saved_items_v3");
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            careers: Array.isArray(parsed?.careers) ? parsed.careers : ["data_analyst"],
            majors: Array.isArray(parsed?.majors) ? parsed.majors : ["data_science"],
            universities: Array.isArray(parsed?.universities) ? parsed.universities : ["BKA_HCM"]
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return { careers: ["data_analyst"], majors: ["data_science"], universities: ["BKA_HCM"] };
  });

  const [roadmap, setRoadmap] = useState<PersonalRoadmap | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("cg_roadmap_v3");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  });

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    return normalizeTab(tabParam) || "landing";
  });
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(() => tabParam === "report");
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [coachInitialQuery, setCoachInitialQuery] = useState<string>("");

  // Global search & notification states (Section 9 Header requirement)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (tabParam === "report") {
      setReportOpen(true);
      return;
    }
    const matched = normalizeTab(tabParam);
    if (matched) {
      setActiveView(matched);
    }
  }, [tabParam]);

  // Support browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined") {
        const currentTab = new URL(window.location.href).searchParams.get("tab");
        if (currentTab === "report") {
          setReportOpen(true);
          return;
        }
        const matched = normalizeTab(currentTab);
        if (matched) {
          setActiveView(matched);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSwitchView = (view: ActiveView) => {
    setActiveView(view);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const url = new URL(window.location.href);
      url.searchParams.set("tab", view);
      window.history.pushState({}, "", url.toString());
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Persist Profile
  useEffect(() => {
    try {
      localStorage.setItem("cg_user_profile_v3", JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  // Persist Saved Items
  useEffect(() => {
    try {
      localStorage.setItem("cg_saved_items_v3", JSON.stringify(savedItems));
    } catch (e) {
      console.error(e);
    }
  }, [savedItems]);

  // Persist Roadmap
  useEffect(() => {
    if (roadmap) {
      try {
        localStorage.setItem("cg_roadmap_v3", JSON.stringify(roadmap));
      } catch (e) {
        console.error(e);
      }
    }
  }, [roadmap]);

  // Ranked Matches Calculation
  const careerMatches = useMemo(() => rankCareers(profile), [profile]);
  const majorMatches = useMemo(() => rankMajors(profile), [profile]);

  // Global search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { careers: [], majors: [] };
    const q = searchQuery.toLowerCase().trim();
    const matchedCareers = CAREERS_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry_name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedMajors = MAJORS_DATA.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.industry_name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        (m.academic_requirements.required_subjects || []).some((s: string) => s.toLowerCase().includes(q))
    ).slice(0, 5);

    return { careers: matchedCareers, majors: matchedMajors };
  }, [searchQuery]);

  // Gamification XP calculation
  const userXp = useMemo(() => {
    let xp = 120;
    const hasAcademic = Object.keys(profile?.academic_profile || {}).length > 2;
    const hasInterests = Object.values(profile?.interests || {}).some((v) => v > 50);
    const hasValues = (profile?.ranked_values || []).length >= 3;
    const hasWorkStyle = Object.values(profile?.work_style || {}).some((v) => v !== 0);
    const hasNegatives = (profile?.negative_preferences || []).length > 0;
    const hasAspirations = (profile?.future_aspirations || []).length > 0;
    const hasRoadmap = !!roadmap;
    const hasBookmarks = ((savedItems?.careers || []).length + (savedItems?.majors || []).length) > 0;

    if (hasAcademic) xp += 80;
    if (hasInterests) xp += 100;
    if (hasValues) xp += 120;
    if (hasWorkStyle) xp += 80;
    if (hasNegatives) xp += 50;
    if (hasAspirations) xp += 60;
    if (hasBookmarks) xp += 70;
    if (hasRoadmap) xp += 160;
    return xp;
  }, [profile, roadmap, savedItems]);

  const completedSteps = useMemo(() => {
    const steps: ActiveView[] = [];
    if ((profile?.ranked_values || []).length >= 3 || Object.keys(profile?.academic_profile || {}).length > 2) {
      steps.push("assessment");
      steps.push("profile");
    }
    if ((careerMatches || []).length > 0) {
      steps.push("matches");
    }
    if ((savedItems?.careers || []).length > 0) {
      steps.push("career_explorer");
    }
    if ((savedItems?.majors || []).length > 0) {
      steps.push("major_explorer");
    }
    if ((savedItems?.universities || []).length > 0) {
      steps.push("university_explorer");
    }
    if (roadmap) {
      steps.push("skill_gap");
      steps.push("roadmap");
    }
    return steps;
  }, [profile, careerMatches, savedItems, roadmap]);

  // Handlers
  const handleToggleBookmark = (type: "career" | "major" | "university", id: string) => {
    setSavedItems((prev) => {
      const key = type === "career" ? "careers" : type === "major" ? "majors" : "universities";
      const currentList = Array.isArray(prev?.[key]) ? prev[key] : [];
      const exists = currentList.includes(id);
      return {
        careers: Array.isArray(prev?.careers) ? prev.careers : [],
        majors: Array.isArray(prev?.majors) ? prev.majors : [],
        universities: Array.isArray(prev?.universities) ? prev.universities : [],
        [key]: exists ? currentList.filter((item) => item !== id) : [...currentList, id]
      };
    });
  };

  const isBookmarked = (type: "career" | "major" | "university", id: string) => {
    const key = type === "career" ? "careers" : type === "major" ? "majors" : "universities";
    const currentList = Array.isArray(savedItems?.[key]) ? savedItems[key] : [];
    return currentList.includes(id);
  };

  const handleSelectCareerForRoadmap = (careerId: string) => {
    const target = CAREERS_DATA.find((c) => c.id === careerId) || CAREERS_DATA[0];
    const newRoadmap = generatePersonalRoadmap(target, profile);
    setRoadmap(newRoadmap);
    handleSwitchView("roadmap");
  };

  const handleAskCoachAboutItem = (itemName: string) => {
    setCoachInitialQuery(`Hãy phân tích chi tiết mức độ phù hợp và triển vọng tương lai của ${itemName} cho tôi.`);
    handleSwitchView("coach");
  };

  // Nav Items with Lucide-style SVG Icons (No emojis!)
  const navItems: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
    { id: "landing", label: "Tổng quan", icon: <IconHome className="w-4 h-4" /> },
    { id: "assessment", label: "Đánh giá", icon: <IconCompass className="w-4 h-4" /> },
    { id: "profile", label: "Career DNA", icon: <IconDna className="w-4 h-4" /> },
    { id: "matches", label: "Kết quả Khớp", icon: <IconTarget className="w-4 h-4" /> },
    { id: "career_explorer", label: "Khám phá Nghề", icon: <IconBriefcase className="w-4 h-4" /> },
    { id: "major_explorer", label: "Khám phá Ngành", icon: <IconGraduationCap className="w-4 h-4" /> },
    { id: "university_explorer", label: "Chọn Trường ĐH", icon: <IconUniversity className="w-4 h-4" /> },
    { id: "compare", label: "So sánh", icon: <IconScale className="w-4 h-4" /> },
    { id: "skill_gap", label: "Khoảng trống", icon: <IconBarChart className="w-4 h-4" /> },
    { id: "roadmap", label: "Lộ trình", icon: <IconMap className="w-4 h-4" /> },
    { id: "coach", label: "AI Coach", icon: <IconBot className="w-4 h-4" /> },
    {
      id: "saved",
      label: `Đã lưu (${(savedItems?.careers || []).length + (savedItems?.majors || []).length})`,
      icon: <IconBookmark className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen space-y-6 pb-20 sm:pb-12 text-ink-900">
      {/* Admin Admissions Notification Banner */}
      {defaultConfig.platform?.banner_active && defaultConfig.platform?.banner_message && (
        <div className="flex items-center justify-between gap-3 rounded-[12px] bg-gradient-to-r from-brand-50 to-sky-50 border border-brand-200 px-4 py-2.5 text-xs text-brand-950 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-red-600 animate-pulse shrink-0" />
            <span className="font-bold">{defaultConfig.platform.banner_message}</span>
          </div>
          <span className="rounded-full bg-brand-200/80 px-2 py-0.5 text-[10px] font-black text-brand-900 shrink-0">
            Tuyển sinh HCMUTE 2026
          </span>
        </div>
      )}

      {/* Top App Shell Header (Section 9 Requirement) */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line bg-surface p-4 sm:px-6 shadow-soft">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSwitchView("landing")}
            className="flex items-center justify-center transition hover:scale-105 cursor-pointer"
            title="Về Trang tổng quan HCMUTE AI Career Intelligence"
          >
            <HcmuteBrandMark className="w-10 h-10" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-brand-900 text-sm sm:text-base leading-tight">
                HCMUTE AI Career Intelligence
              </span>
              <span className="rounded-full bg-accent-red-50 border border-accent-red-200 px-2 py-0.5 text-[10px] font-black text-accent-red-700">
                v6.0
              </span>
              <LevelBadge xp={userXp} compact />
            </div>
            <p className="text-xs text-ink-500 font-medium mt-0.5">
              Hình mẫu: <strong className="text-brand-700 font-bold">{profile.profile_archetype.title}</strong>
            </p>
          </div>
        </div>

        {/* Center: Global Search Trigger Button */}
        <div className="order-last sm:order-none w-full sm:w-auto flex-1 max-w-xs">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center justify-between gap-2 rounded-[10px] border border-line bg-surface-soft px-3 py-1.5 text-xs text-ink-500 hover:border-brand-300 hover:text-ink-800 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <IconSearch className="w-3.5 h-3.5 text-brand-600" />
              <span>Tìm nghề, ngành, trường...</span>
            </div>
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-surface border border-line px-1.5 py-0.5 rounded text-ink-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Notifications, User Profile & Export Report */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative p-2 rounded-[10px] border border-line bg-surface hover:bg-surface-soft text-ink-700 transition cursor-pointer"
              title="Thông báo mới"
            >
              <IconBell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-red-600" />
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-[12px] bg-surface border border-line shadow-lift p-4 z-50 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <h4 className="text-xs font-black uppercase text-brand-900 tracking-wider">
                    Thông báo & Tuyển sinh
                  </h4>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-ink-400 hover:text-ink-700"
                  >
                    Đóng
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-[8px] bg-brand-50 border border-brand-100">
                    <span className="font-extrabold text-brand-900 block">Tuyển sinh HCMUTE 2026</span>
                    <p className="text-ink-600 text-[11px] mt-0.5">
                      Cổng xét tuyển sớm Trường Đại học Sư phạm Kỹ thuật TP.HCM mở từ 15/04/2026.
                    </p>
                  </div>
                  <div className="p-2 rounded-[8px] bg-surface-soft border border-line">
                    <span className="font-extrabold text-ink-800 block">Nâng cấp AI Engine v6.0</span>
                    <p className="text-ink-600 text-[11px] mt-0.5">
                      Đã bổ sung phân tích 5 chiều chọn trường và đánh giá rủi ro tự động hóa AI.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleCopyShareLink}
            className="rounded-[10px] border border-line bg-surface-soft px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-900 transition flex items-center gap-1.5 cursor-pointer"
            title="Sao chép liên kết tab hiện tại để chia sẻ"
          >
            {copiedLink ? (
              <>
                <IconCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Đã chép!</span>
              </>
            ) : (
              <>
                <IconShare className="w-3.5 h-3.5 text-ink-600" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>

          <button
            onClick={() => setConsultationOpen(true)}
            className="rounded-[10px] border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-900 hover:bg-brand-100 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <IconUser className="w-3.5 h-3.5 text-brand-700" />
            <span>Tư vấn 1-1</span>
          </button>

          <button
            onClick={() => setOnboardingOpen(true)}
            className="rounded-[10px] border border-line bg-surface-soft px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-900 transition cursor-pointer"
            title="Đổi bối cảnh người dùng"
          >
            Đổi thông tin
          </button>

          <button
            onClick={() => setReportOpen(true)}
            className="rounded-[10px] bg-accent-red-600 hover:bg-accent-red-700 active:scale-95 px-4 py-2 text-xs font-black text-white shadow-sm hover:shadow-accent transition flex items-center gap-1.5 cursor-pointer"
          >
            <IconFileText className="w-3.5 h-3.5" />
            <span>Xuất Báo Cáo</span>
          </button>
        </div>
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="fixed inset-0 bg-ink-900/40 backdrop-blur-xs"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl rounded-[14px] bg-surface border border-line shadow-lift p-4 z-10 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center gap-2 border-b border-line pb-2.5">
              <IconSearch className="w-4 h-4 text-brand-600" />
              <input
                type="text"
                autoFocus
                placeholder="Tìm nhanh nghề nghiệp, ngành học, kỹ năng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-medium bg-transparent focus:outline-hidden text-ink-900"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs text-ink-400 hover:text-ink-700 p-1"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {searchQuery.trim() === "" ? (
                <p className="text-xs text-ink-400 text-center py-6">
                  Nhập từ khóa để tra cứu trong 80+ nghề nghiệp, 60+ ngành học và các tiêu chí tuyển sinh.
                </p>
              ) : (
                <>
                  {searchResults.careers.length > 0 && (
                    <div>
                      <span className="text-[10px] font-black uppercase text-brand-700 tracking-wider block mb-1">
                        Nghề nghiệp
                      </span>
                      {searchResults.careers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setSearchOpen(false);
                            handleSwitchView("career_explorer");
                          }}
                          className="flex items-center justify-between p-2 rounded-[8px] hover:bg-brand-50 cursor-pointer text-xs"
                        >
                          <div>
                            <span className="font-extrabold text-ink-900 block">{c.name}</span>
                            <span className="text-[11px] text-ink-500">{c.industry_name}</span>
                          </div>
                          <IconArrowRight className="w-3.5 h-3.5 text-brand-600" />
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.majors.length > 0 && (
                    <div className="pt-2 border-t border-line">
                      <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block mb-1">
                        Ngành học
                      </span>
                      {searchResults.majors.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => {
                            setSearchOpen(false);
                            handleSwitchView("major_explorer");
                          }}
                          className="flex items-center justify-between p-2 rounded-[8px] hover:bg-emerald-50 cursor-pointer text-xs"
                        >
                          <div>
                            <span className="font-extrabold text-ink-900 block">{m.name}</span>
                            <span className="text-[11px] text-ink-500">{m.industry_name}</span>
                          </div>
                          <IconArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.careers.length === 0 && searchResults.majors.length === 0 && (
                    <p className="text-xs text-ink-500 text-center py-4">
                      Không tìm thấy kết quả phù hợp cho &quot;{searchQuery}&quot;.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10-Step Career Journey Tracker */}
      <JourneyProgressBar
        activeView={activeView}
        onSelectStep={handleSwitchView}
        completedSteps={completedSteps}
        totalXp={userXp}
      />

      {/* Main Navigation Tabs (Desktop & Tablet) */}
      <nav aria-label="Điều hướng tính năng" className="hidden lg:flex overflow-x-auto rounded-[12px] border border-line bg-surface p-1.5 shadow-soft gap-1 scrollbar-none">
        {navItems.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSwitchView(item.id)}
              className={`flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-ink-600 hover:bg-surface-soft hover:text-ink-900"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Secondary Mobile Navigation */}
      <nav aria-label="Điều hướng nhanh" className="flex lg:hidden overflow-x-auto gap-1.5 pb-1 scrollbar-none">
        {navItems.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSwitchView(item.id)}
              className={`flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-xs font-bold whitespace-nowrap border shrink-0 transition-all cursor-pointer ${
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-xs"
                  : "border-line bg-surface text-ink-700"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* View Container */}
      <main key={activeView} className="transition-all animate-in fade-in-50 duration-200">
        {activeView === "landing" && (
          <LandingView
            onStartAssessment={() => handleSwitchView("assessment")}
            onExploreDemo={() => handleSwitchView("profile")}
            onOpenCoach={() => handleSwitchView("coach")}
            onSelectUserType={(t: UserType) => {
              setProfile((prev) => ({
                ...prev,
                user_context: { ...prev.user_context, user_type: t }
              }));
              setOnboardingOpen(true);
            }}
            currentUserType={profile.user_context.user_type}
            profile={profile}
            topCareers={careerMatches}
            topMajors={majorMatches}
            savedItems={savedItems}
            roadmap={roadmap}
            userXp={userXp}
            completedSteps={completedSteps}
            onNavigateView={handleSwitchView}
            onOpenConsultation={() => setConsultationOpen(true)}
          />
        )}

        {activeView === "assessment" && (
          <AssessmentView
            initialProfile={profile}
            onSaveProfile={(newProf) => setProfile(newProf)}
            onGoToProfile={() => handleSwitchView("profile")}
            onGoToMatches={() => handleSwitchView("matches")}
            onNavigateView={handleSwitchView}
          />
        )}

        {activeView === "profile" && (
          <ProfileView
            profile={profile}
            onGoToMatches={() => handleSwitchView("matches")}
            onGoToRoadmap={() => handleSwitchView("roadmap")}
            onGoToCoach={() => handleSwitchView("coach")}
            onRetakeAssessment={() => handleSwitchView("assessment")}
            onNavigateView={handleSwitchView}
          />
        )}

        {activeView === "matches" && (
          <MatchesView
            careerMatches={careerMatches}
            majorMatches={majorMatches}
            onSelectCareerForRoadmap={handleSelectCareerForRoadmap}
            onBookmarkItem={handleToggleBookmark}
            isBookmarked={isBookmarked}
            onAskCoachAboutItem={handleAskCoachAboutItem}
            onNavigateView={handleSwitchView}
          />
        )}

        {activeView === "career_explorer" && (
          <CareerExplorerView
            careerMatches={careerMatches}
            profile={profile}
            onSelectCareerForRoadmap={handleSelectCareerForRoadmap}
            onAskCoachAboutItem={handleAskCoachAboutItem}
            onBookmarkItem={handleToggleBookmark}
            isBookmarked={isBookmarked}
            onNavigateView={handleSwitchView}
          />
        )}

        {activeView === "major_explorer" && (
          <MajorExplorerView
            majorMatches={majorMatches}
            profile={profile}
            onBookmarkItem={handleToggleBookmark}
            isBookmarked={isBookmarked}
            onAskCoachAboutItem={handleAskCoachAboutItem}
            onNavigateView={handleSwitchView}
          />
        )}

        {activeView === "university_explorer" && (
          <UniversityExplorerView
            profile={profile}
            onBookmarkItem={handleToggleBookmark}
            isBookmarked={isBookmarked}
            onAskCoachAboutItem={handleAskCoachAboutItem}
            onNavigateView={handleSwitchView}
          />
        )}

        {activeView === "compare" && (
          <CompareView
            careerMatches={careerMatches}
            majorMatches={majorMatches}
            profile={profile}
            onAskCoachAboutItem={handleAskCoachAboutItem}
            onNavigateView={handleSwitchView}
          />
        )}

        {activeView === "skill_gap" && (
          <SkillGapView
            profile={profile}
            initialTargetCareerId={roadmap?.target_career_id}
            onGoToRoadmap={() => handleSwitchView("roadmap")}
            onAskCoachAboutItem={handleAskCoachAboutItem}
            onNavigateView={handleSwitchView}
          />
        )}

        {activeView === "roadmap" && (
          <RoadmapView
            key={roadmap?.target_career_id || "roadmap-view"}
            profile={profile}
            currentRoadmap={roadmap}
            onUpdateRoadmap={(r) => setRoadmap(r)}
            onAskCoachAboutItem={handleAskCoachAboutItem}
            onNavigateView={handleSwitchView}
          />
        )}

        {activeView === "coach" && (
          <AiCoachView
            profile={profile}
            topCareers={careerMatches}
            topMajors={majorMatches}
            roadmap={roadmap}
            initialQuery={coachInitialQuery}
            onNavigateView={handleSwitchView}
          />
        )}

        {activeView === "saved" && (
          <SavedView
            savedItems={savedItems}
            onRemoveBookmark={handleToggleBookmark}
            onAskCoachAboutItem={handleAskCoachAboutItem}
            onNavigateView={handleSwitchView}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation with Clean SVG Icons */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="grid grid-cols-5 text-center py-2 px-1">
          {[
            { id: "landing" as ActiveView, label: "Trang chủ", icon: <IconHome className="w-5 h-5 mx-auto" /> },
            { id: "matches" as ActiveView, label: "Khám phá", icon: <IconTarget className="w-5 h-5 mx-auto" /> },
            { id: "coach" as ActiveView, label: "AI Coach", icon: <IconBot className="w-5 h-5 mx-auto" /> },
            { id: "roadmap" as ActiveView, label: "Lộ trình", icon: <IconMap className="w-5 h-5 mx-auto" /> },
            { id: "profile" as ActiveView, label: "Career DNA", icon: <IconDna className="w-5 h-5 mx-auto" /> }
          ].map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSwitchView(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition py-1 cursor-pointer ${
                  active ? "text-brand-600" : "text-ink-400 hover:text-ink-700"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={(newContext) => {
          setProfile((prev) => ({
            ...prev,
            user_context: { ...prev.user_context, ...newContext }
          }));
          handleSwitchView("assessment");
        }}
        initialUserType={profile.user_context.user_type}
      />

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        profile={profile}
        topCareers={careerMatches}
        topMajors={majorMatches}
        roadmap={roadmap}
      />

      <ConsultationModal
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        profile={profile}
        topCareers={careerMatches}
      />
    </div>
  );
}
