"use client";

import React from "react";
import {
  StudentCareerProfile,
  CareerMatchResult,
  MajorMatchResult,
  PersonalRoadmap
} from "@/lib/career-guidance/types";
import { CareerIntelligenceReport } from "../report/CareerIntelligenceReport";
import { ReportType } from "@/lib/career-guidance/reportEngine";

export type ReportPreset = "full" | "executive" | "parent" | "comparison" | "roadmap";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentCareerProfile;
  topCareers?: CareerMatchResult[];
  topMajors?: MajorMatchResult[];
  roadmap?: PersonalRoadmap | null;
  initialPreset?: ReportPreset;
}

export function ReportModal({
  isOpen,
  onClose,
  profile,
  initialPreset = "full"
}: ReportModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Career Intelligence Report"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex flex-col"
    >
      <div className="relative w-full min-h-screen bg-slate-50">
        <CareerIntelligenceReport
          profile={profile}
          initialReportType={initialPreset as ReportType}
          isEmbedded={true}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
