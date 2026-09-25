import React, { useState } from "react";
import { SavedItems } from "@/lib/career-guidance/types";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { MAJORS_DATA } from "@/lib/career-guidance/majorsData";
import rawUniversities from "@/data/universities.json";
import { SmartNextAction } from "../common/SmartNextAction";
import {
  IconBookmark,
  IconBriefcase,
  IconGraduationCap,
  IconUniversity,
  IconBot,
  IconX,
  IconScale
} from "../common/CareerIcons";

interface SavedViewProps {
  savedItems: SavedItems;
  onRemoveBookmark: (type: "career" | "major" | "university", id: string) => void;
  onAskCoachAboutItem: (name: string) => void;
  onNavigateView?: (view: any) => void;
}

export function SavedView({
  savedItems,
  onRemoveBookmark,
  onAskCoachAboutItem,
  onNavigateView
}: SavedViewProps) {
  const [activeTab, setActiveTab] = useState<"career" | "major" | "university">("career");

  const bookmarkedCareers = CAREERS_DATA.filter((c) => (savedItems?.careers || []).includes(c.id));
  const bookmarkedMajors = MAJORS_DATA.filter((m) => (savedItems?.majors || []).includes(m.id));
  const bookmarkedUnis = (rawUniversities as any[]).filter((u) => (savedItems?.universities || []).includes(u.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-line bg-surface p-5 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-[11px] font-bold text-brand-700 mb-1">
            <IconBookmark className="w-3.5 h-3.5 text-brand-600" />
            <span>Decision Workspace • Mục Đã Lưu</span>
          </div>
          <h1 className="text-xl font-bold text-ink-900 tracking-tight">Mục Đã Lưu (Saved Bookmarks)</h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Xem lại các nghề nghiệp, ngành đào tạo và trường đại học bạn quan tâm để dễ dàng so sánh và đưa ra quyết định.
          </p>
        </div>

        <div className="flex gap-1.5 rounded-[10px] bg-surface-soft p-1 border border-line">
          <button
            onClick={() => setActiveTab("career")}
            className={`inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "career" ? "bg-surface text-brand-700 shadow-xs border border-line" : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <IconBriefcase className="w-3.5 h-3.5" />
            <span>Nghề ({bookmarkedCareers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("major")}
            className={`inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "major" ? "bg-surface text-brand-700 shadow-xs border border-line" : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <IconGraduationCap className="w-3.5 h-3.5" />
            <span>Ngành ({bookmarkedMajors.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("university")}
            className={`inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "university" ? "bg-surface text-brand-700 shadow-xs border border-line" : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <IconUniversity className="w-3.5 h-3.5" />
            <span>Trường ({bookmarkedUnis.length})</span>
          </button>
        </div>
      </div>

      {activeTab === "career" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarkedCareers.map((c) => (
            <div key={c.id} className="rounded-[12px] border border-line bg-surface p-5 shadow-soft space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-[6px] px-2 py-0.5">
                  {c.industry_name}
                </span>
                <button
                  onClick={() => onRemoveBookmark("career", c.id)}
                  aria-label="Bỏ lưu"
                  className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-accent-red-600 transition"
                >
                  <IconX className="w-3.5 h-3.5" />
                  <span>Bỏ lưu</span>
                </button>
              </div>
              <h3 className="font-bold text-ink-900 text-sm">{c.name}</h3>
              <p className="text-xs text-ink-500 italic">"{c.tagline}"</p>
              <div className="pt-2 border-t border-line flex justify-end">
                <button
                  onClick={() => onAskCoachAboutItem(c.name)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface-soft px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition"
                >
                  <IconBot className="w-3.5 h-3.5 text-brand-600" />
                  <span>Hỏi AI Coach</span>
                </button>
              </div>
            </div>
          ))}
          {bookmarkedCareers.length === 0 && (
            <div className="col-span-full rounded-[14px] border border-line bg-surface p-10 text-center text-ink-500 text-xs">
              Bạn chưa lưu nghề nghiệp nào. Hãy vào mục Khám phá nghề và nhấn biểu tượng bookmark để lưu lại.
            </div>
          )}
        </div>
      )}

      {activeTab === "major" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarkedMajors.map((m) => (
            <div key={m.id} className="rounded-[12px] border border-line bg-surface p-5 shadow-soft space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-[6px] px-2 py-0.5">
                  Mã: {m.code}
                </span>
                <button
                  onClick={() => onRemoveBookmark("major", m.id)}
                  aria-label="Bỏ lưu"
                  className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-accent-red-600 transition"
                >
                  <IconX className="w-3.5 h-3.5" />
                  <span>Bỏ lưu</span>
                </button>
              </div>
              <h3 className="font-bold text-ink-900 text-sm">{m.name}</h3>
              <p className="text-xs text-ink-500 line-clamp-2 leading-relaxed">{m.description}</p>
              <div className="pt-2 border-t border-line flex justify-end">
                <button
                  onClick={() => onAskCoachAboutItem(m.name)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface-soft px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition"
                >
                  <IconBot className="w-3.5 h-3.5 text-brand-600" />
                  <span>Hỏi AI Coach</span>
                </button>
              </div>
            </div>
          ))}
          {bookmarkedMajors.length === 0 && (
            <div className="col-span-full rounded-[14px] border border-line bg-surface p-10 text-center text-ink-500 text-xs">
              Bạn chưa lưu ngành đào tạo nào.
            </div>
          )}
        </div>
      )}

      {activeTab === "university" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarkedUnis.map((u) => (
            <div key={u.id} className="rounded-[12px] border border-line bg-surface p-5 shadow-soft space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-[6px] px-2 py-0.5">
                  {u.city} • {u.type}
                </span>
                <button
                  onClick={() => onRemoveBookmark("university", u.id)}
                  aria-label="Bỏ lưu"
                  className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-accent-red-600 transition"
                >
                  <IconX className="w-3.5 h-3.5" />
                  <span>Bỏ lưu</span>
                </button>
              </div>
              <h3 className="font-bold text-ink-900 text-sm">{u.name}</h3>
              <p className="text-xs text-ink-500">Mã: {u.shortName || u.id}</p>
              <div className="pt-2 border-t border-line flex justify-end">
                <button
                  onClick={() => onAskCoachAboutItem(u.name)}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-line bg-surface-soft px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-brand-50 hover:text-brand-700 transition"
                >
                  <IconBot className="w-3.5 h-3.5 text-brand-600" />
                  <span>Hỏi AI Coach</span>
                </button>
              </div>
            </div>
          ))}
          {bookmarkedUnis.length === 0 && (
            <div className="col-span-full rounded-[14px] border border-line bg-surface p-10 text-center text-ink-500 text-xs">
              Bạn chưa lưu trường đại học nào.
            </div>
          )}
        </div>
      )}

      {onNavigateView && (
        <SmartNextAction
          currentView="saved"
          onNavigate={onNavigateView}
          onAskCoach={() => onAskCoachAboutItem(bookmarkedCareers[0]?.name || "nghề nghiệp đã lưu")}
        />
      )}
    </div>
  );
}
