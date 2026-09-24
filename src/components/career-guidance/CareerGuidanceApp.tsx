"use client";

import React, { useState, useEffect, useMemo } from "react";
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

type ActiveView =
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

export default function CareerGuidanceApp() {
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
        if (saved) return JSON.parse(saved);
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

  const [activeView, setActiveView] = useState<ActiveView>("landing");
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [coachInitialQuery, setCoachInitialQuery] = useState<string>("");

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

  // Handlers
  const handleToggleBookmark = (type: "career" | "major" | "university", id: string) => {
    setSavedItems((prev) => {
      const key = type === "career" ? "careers" : type === "major" ? "majors" : "universities";
      const exists = prev[key].includes(id);
      return {
        ...prev,
        [key]: exists ? prev[key].filter((item) => item !== id) : [...prev[key], id]
      };
    });
  };

  const isBookmarked = (type: "career" | "major" | "university", id: string) => {
    const key = type === "career" ? "careers" : type === "major" ? "majors" : "universities";
    return savedItems[key].includes(id);
  };

  const handleSelectCareerForRoadmap = (careerId: string) => {
    const target = CAREERS_DATA.find((c) => c.id === careerId) || CAREERS_DATA[0];
    const newRoadmap = generatePersonalRoadmap(target, profile);
    setRoadmap(newRoadmap);
    setActiveView("roadmap");
  };

  const handleAskCoachAboutItem = (itemName: string) => {
    setCoachInitialQuery(`Hãy phân tích chi tiết mức độ phù hợp và triển vọng tương lai của ${itemName} cho tôi.`);
    setActiveView("coach");
  };

  const navItems: { id: ActiveView; label: string; icon: string }[] = [
    { id: "landing", label: "Tổng quan", icon: "🏠" },
    { id: "assessment", label: "Đánh giá", icon: "📝" },
    { id: "profile", label: "Career DNA", icon: "🧬" },
    { id: "matches", label: "Kết quả Khớp", icon: "🎯" },
    { id: "career_explorer", label: "Khám phá Nghề", icon: "💼" },
    { id: "major_explorer", label: "Khám phá Ngành", icon: "🎓" },
    { id: "university_explorer", label: "Chọn Trường ĐH", icon: "🏛️" },
    { id: "compare", label: "So sánh", icon: "⚖️" },
    { id: "skill_gap", label: "Khoảng trống", icon: "📊" },
    { id: "roadmap", label: "Lộ trình", icon: "🗺️" },
    { id: "coach", label: "AI Coach", icon: "🤖" },
    { id: "saved", label: `Đã lưu (${savedItems.careers.length + savedItems.majors.length})`, icon: "⭐" }
  ];

  return (
    <div className="min-h-screen space-y-6 pb-20 sm:pb-12">
      {/* Top Bar with Profile Archetype & Report Trigger */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-surface p-4 sm:px-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-2xl text-white shadow-lift">
            🧭
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-ink-900 text-sm sm:text-base">
                AI Career Guidance Platform
              </span>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-extrabold text-brand-700">
                v3.0
              </span>
            </div>
            <p className="text-xs text-ink-500">
              Hình mẫu: <strong className="text-brand-700">{profile.profile_archetype.title}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnboardingOpen(true)}
            className="rounded-xl border border-line bg-surface-soft px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition"
          >
            ⚙️ Đổi thông tin
          </button>
          <button
            onClick={() => setReportOpen(true)}
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 shadow-lift transition flex items-center gap-1.5"
          >
            📑 Xuất Báo Cáo
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs (Desktop & Tablet) */}
      <nav aria-label="Điều hướng tính năng" className="hidden lg:flex overflow-x-auto rounded-2xl border border-line bg-surface p-1.5 shadow-soft gap-1 scrollbar-none">
        {navItems.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-ink-600 hover:bg-surface-soft hover:text-ink-900"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Secondary Mobile Pill Navigation */}
      <nav aria-label="Điều hướng nhanh" className="flex lg:hidden overflow-x-auto gap-1.5 pb-1 scrollbar-none">
        {navItems.map((item) => {
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap border shrink-0 transition-all ${
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-xs"
                  : "border-line bg-surface text-ink-700"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* View Container */}
      <main className="transition-all animate-in fade-in duration-200">
        {activeView === "landing" && (
          <LandingView
            onStartAssessment={() => setActiveView("assessment")}
            onExploreDemo={() => setActiveView("profile")}
            onOpenCoach={() => setActiveView("coach")}
            onSelectUserType={(t: UserType) => {
              setProfile((prev) => ({
                ...prev,
                user_context: { ...prev.user_context, user_type: t }
              }));
              setOnboardingOpen(true);
            }}
            currentUserType={profile.user_context.user_type}
          />
        )}

        {activeView === "assessment" && (
          <AssessmentView
            initialProfile={profile}
            onSaveProfile={(newProf) => setProfile(newProf)}
            onGoToMatches={() => setActiveView("matches")}
          />
        )}

        {activeView === "profile" && (
          <ProfileView
            profile={profile}
            onGoToMatches={() => setActiveView("matches")}
            onGoToRoadmap={() => setActiveView("roadmap")}
            onGoToCoach={() => setActiveView("coach")}
            onRetakeAssessment={() => setActiveView("assessment")}
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
          />
        )}

        {activeView === "career_explorer" && (
          <CareerExplorerView
            onSelectCareerForRoadmap={handleSelectCareerForRoadmap}
            onAskCoachAboutItem={handleAskCoachAboutItem}
            onBookmarkItem={handleToggleBookmark}
            isBookmarked={isBookmarked}
          />
        )}

        {activeView === "major_explorer" && (
          <MajorExplorerView
            onBookmarkItem={handleToggleBookmark}
            isBookmarked={isBookmarked}
            onAskCoachAboutItem={handleAskCoachAboutItem}
          />
        )}

        {activeView === "university_explorer" && (
          <UniversityExplorerView
            profile={profile}
            onBookmarkItem={handleToggleBookmark}
            isBookmarked={isBookmarked}
            onAskCoachAboutItem={handleAskCoachAboutItem}
          />
        )}

        {activeView === "compare" && (
          <CompareView
            careerMatches={careerMatches}
            majorMatches={majorMatches}
            onAskCoachAboutItem={handleAskCoachAboutItem}
          />
        )}

        {activeView === "skill_gap" && (
          <SkillGapView
            profile={profile}
            initialTargetCareerId={roadmap?.target_career_id}
            onGoToRoadmap={() => setActiveView("roadmap")}
            onAskCoachAboutItem={handleAskCoachAboutItem}
          />
        )}

        {activeView === "roadmap" && (
          <RoadmapView
            profile={profile}
            currentRoadmap={roadmap}
            onUpdateRoadmap={(r) => setRoadmap(r)}
            onAskCoachAboutItem={handleAskCoachAboutItem}
          />
        )}

        {activeView === "coach" && (
          <AiCoachView
            profile={profile}
            topCareers={careerMatches}
            topMajors={majorMatches}
            roadmap={roadmap}
            initialQuery={coachInitialQuery}
          />
        )}

        {activeView === "saved" && (
          <SavedView
            savedItems={savedItems}
            onRemoveBookmark={handleToggleBookmark}
            onAskCoachAboutItem={handleAskCoachAboutItem}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation (Section 6: Trang chủ, Khám phá, AI Coach, Lộ trình, Hồ sơ) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-5 text-center py-2 px-1">
          {[
            { id: "landing" as ActiveView, label: "Trang chủ", icon: "🏠" },
            { id: "matches" as ActiveView, label: "Khám phá", icon: "🔍" },
            { id: "coach" as ActiveView, label: "AI Coach", icon: "💬" },
            { id: "roadmap" as ActiveView, label: "Lộ trình", icon: "🗺️" },
            { id: "profile" as ActiveView, label: "Hồ sơ", icon: "🧬" }
          ].map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition ${
                  active ? "text-brand-600" : "text-ink-400 hover:text-ink-700"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
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
          setActiveView("assessment");
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
    </div>
  );
}
