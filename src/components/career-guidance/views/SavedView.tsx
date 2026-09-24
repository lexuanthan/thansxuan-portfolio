import React, { useState } from "react";
import { SavedItems } from "@/lib/career-guidance/types";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";
import { MAJORS_DATA } from "@/lib/career-guidance/majorsData";
import rawUniversities from "@/data/universities.json";

interface SavedViewProps {
  savedItems: SavedItems;
  onRemoveBookmark: (type: "career" | "major" | "university", id: string) => void;
  onAskCoachAboutItem: (name: string) => void;
}

export function SavedView({
  savedItems,
  onRemoveBookmark,
  onAskCoachAboutItem
}: SavedViewProps) {
  const [activeTab, setActiveTab] = useState<"career" | "major" | "university">("career");

  const bookmarkedCareers = CAREERS_DATA.filter((c) => savedItems.careers.includes(c.id));
  const bookmarkedMajors = MAJORS_DATA.filter((m) => savedItems.majors.includes(m.id));
  const bookmarkedUnis = (rawUniversities as any[]).filter((u) => savedItems.universities.includes(u.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <div>
          <h1 className="text-xl font-bold text-ink-900">Mục Đã Lưu (Saved Bookmarks)</h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Xem lại các nghề nghiệp, ngành đào tạo và trường đại học bạn quan tâm để dễ dàng so sánh và đưa ra quyết định.
          </p>
        </div>

        <div className="flex gap-1.5 rounded-xl bg-surface-soft p-1 border border-line">
          <button
            onClick={() => setActiveTab("career")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "career" ? "bg-surface text-brand-700 shadow-xs" : "text-ink-600"
            }`}
          >
            💼 Nghề ({bookmarkedCareers.length})
          </button>
          <button
            onClick={() => setActiveTab("major")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "major" ? "bg-surface text-brand-700 shadow-xs" : "text-ink-600"
            }`}
          >
            🎓 Ngành ({bookmarkedMajors.length})
          </button>
          <button
            onClick={() => setActiveTab("university")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "university" ? "bg-surface text-brand-700 shadow-xs" : "text-ink-600"
            }`}
          >
            🏛️ Trường ({bookmarkedUnis.length})
          </button>
        </div>
      </div>

      {activeTab === "career" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarkedCareers.map((c) => (
            <div key={c.id} className="rounded-2xl border border-line bg-surface p-5 shadow-soft space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 rounded-md px-2 py-0.5">
                  {c.industry_name}
                </span>
                <button
                  onClick={() => onRemoveBookmark("career", c.id)}
                  className="text-xs text-ink-400 hover:text-rose-500 transition"
                >
                  ✕ Bỏ lưu
                </button>
              </div>
              <h3 className="font-bold text-ink-900 text-sm">{c.name}</h3>
              <p className="text-xs text-ink-500 italic">"{c.tagline}"</p>
              <div className="pt-2 border-t border-line flex justify-end">
                <button
                  onClick={() => onAskCoachAboutItem(c.name)}
                  className="rounded-xl border border-line bg-surface-soft px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-brand-50"
                >
                  💬 Hỏi AI Coach
                </button>
              </div>
            </div>
          ))}
          {bookmarkedCareers.length === 0 && (
            <div className="col-span-full rounded-2xl border border-line bg-surface p-10 text-center text-ink-400 text-xs">
              Bạn chưa lưu nghề nghiệp nào. Hãy vào mục Khám phá nghề và nhấn biểu tượng ngôi sao để lưu lại.
            </div>
          )}
        </div>
      )}

      {activeTab === "major" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarkedMajors.map((m) => (
            <div key={m.id} className="rounded-2xl border border-line bg-surface p-5 shadow-soft space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 rounded-md px-2 py-0.5">
                  Mã: {m.code}
                </span>
                <button
                  onClick={() => onRemoveBookmark("major", m.id)}
                  className="text-xs text-ink-400 hover:text-rose-500 transition"
                >
                  ✕ Bỏ lưu
                </button>
              </div>
              <h3 className="font-bold text-ink-900 text-sm">{m.name}</h3>
              <p className="text-xs text-ink-500 line-clamp-2">{m.description}</p>
              <div className="pt-2 border-t border-line flex justify-end">
                <button
                  onClick={() => onAskCoachAboutItem(m.name)}
                  className="rounded-xl border border-line bg-surface-soft px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-brand-50"
                >
                  💬 Hỏi AI Coach
                </button>
              </div>
            </div>
          ))}
          {bookmarkedMajors.length === 0 && (
            <div className="col-span-full rounded-2xl border border-line bg-surface p-10 text-center text-ink-400 text-xs">
              Bạn chưa lưu ngành đào tạo nào.
            </div>
          )}
        </div>
      )}

      {activeTab === "university" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarkedUnis.map((u) => (
            <div key={u.id} className="rounded-2xl border border-line bg-surface p-5 shadow-soft space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 rounded-md px-2 py-0.5">
                  {u.city} • {u.type}
                </span>
                <button
                  onClick={() => onRemoveBookmark("university", u.id)}
                  className="text-xs text-ink-400 hover:text-rose-500 transition"
                >
                  ✕ Bỏ lưu
                </button>
              </div>
              <h3 className="font-bold text-ink-900 text-sm">{u.name}</h3>
              <p className="text-xs text-ink-500">Mã: {u.shortName || u.id}</p>
              <div className="pt-2 border-t border-line flex justify-end">
                <button
                  onClick={() => onAskCoachAboutItem(u.name)}
                  className="rounded-xl border border-line bg-surface-soft px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-brand-50"
                >
                  💬 Hỏi AI Coach
                </button>
              </div>
            </div>
          ))}
          {bookmarkedUnis.length === 0 && (
            <div className="col-span-full rounded-2xl border border-line bg-surface p-10 text-center text-ink-400 text-xs">
              Bạn chưa lưu trường đại học nào.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
