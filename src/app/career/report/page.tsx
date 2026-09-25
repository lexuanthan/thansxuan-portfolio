"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CareerIntelligenceReport } from "@/components/career-guidance/report/CareerIntelligenceReport";
import { StudentCareerProfile } from "@/lib/career-guidance/types";
import { createDefaultProfile } from "@/lib/career-guidance/seedProfile";
import { ReportType } from "@/lib/career-guidance/reportEngine";
import { HcmuteBrandMark, IconChevronRight, IconHome } from "@/components/career-guidance/common/CareerIcons";

function CareerReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = searchParams.get("type") as ReportType | null;
  const initialType: ReportType =
    typeParam && ["full", "executive", "parent", "comparison", "roadmap"].includes(typeParam)
      ? typeParam
      : "full";

  const targetCareerId = searchParams.get("careerId") || undefined;
  const [profile, setProfile] = useState<StudentCareerProfile | null>(null);

  useEffect(() => {
    // Attempt hydration from localStorage
    try {
      const stored = localStorage.getItem("hcmute_career_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.capabilities && parsed.interests) {
          setProfile(parsed);
          return;
        }
      }
    } catch {
      // Fallback
    }
    // Default seed profile if no storage found
    setProfile(createDefaultProfile());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Breadcrumb Header for Standalone Web Page */}
      <div className="no-print bg-white border-b border-slate-200 px-4 lg:px-8 py-2.5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link
              href="/ai-tools/career-guidance"
              className="flex items-center gap-1 hover:text-[#004098] transition-colors"
            >
              <IconHome className="w-3.5 h-3.5" />
              <span>Nền tảng Hướng nghiệp AI</span>
            </Link>
            <IconChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-800">
              Báo cáo Career Intelligence Cao cấp
            </span>
          </nav>

          <Link
            href="/ai-tools/career-guidance"
            className="text-xs font-semibold text-[#004098] hover:underline"
          >
            &larr; Về Bảng điều khiển chính
          </Link>
        </div>
      </div>

      {/* Render Full Career Intelligence Report System */}
      <CareerIntelligenceReport
        profile={profile || undefined}
        initialReportType={initialType}
        targetCareerId={targetCareerId}
      />
    </div>
  );
}

export default function CareerReportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#004098] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-600">
              Đang tải Hồ sơ Career Intelligence HCMUTE...
            </p>
          </div>
        </div>
      }
    >
      <CareerReportContent />
    </Suspense>
  );
}
