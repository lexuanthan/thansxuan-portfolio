import React, { useState, useMemo } from "react";
import { MajorDNA } from "@/lib/career-guidance/types";
import { MAJORS_DATA } from "@/lib/career-guidance/majorsData";

interface MajorExplorerViewProps {
  onBookmarkItem: (type: "major", id: string) => void;
  isBookmarked: (type: "major", id: string) => boolean;
  onAskCoachAboutItem: (name: string) => void;
}

export function MajorExplorerView({
  onBookmarkItem,
  isBookmarked,
  onAskCoachAboutItem
}: MajorExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedMajor, setSelectedMajor] = useState<MajorDNA | null>(null);

  const filteredMajors = useMemo(() => {
    return MAJORS_DATA.filter((m) => {
      if (selectedIndustry !== "all" && m.industry_id !== selectedIndustry) return false;
      if (selectedDifficulty !== "all" && m.difficulty_level !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = m.name.toLowerCase().includes(q);
        const inCode = m.code.includes(q);
        const inDesc = m.description.toLowerCase().includes(q);
        if (!inName && !inCode && !inDesc) return false;
      }
      return true;
    });
  }, [searchQuery, selectedIndustry, selectedDifficulty]);

  const industries = useMemo(() => {
    const map = new Map<string, string>();
    MAJORS_DATA.forEach((m) => map.set(m.industry_id, m.industry_name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft space-y-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            Khám Phá Ngành Đào Tạo Đại Học (Major Explorer)
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Tìm hiểu giáo trình học, độ khó, môn xét tuyển trọng tâm và danh sách các trường đào tạo hàng đầu.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên ngành, mã ngành (7480108)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-hidden"
          />

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-hidden"
          >
            <option value="all">Tất cả khối ngành ({MAJORS_DATA.length} ngành)</option>
            {industries.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-hidden"
          >
            <option value="all">Tất cả mức độ khó</option>
            <option value="Rất cao">Độ khó Rất cao (Học thuật nặng)</option>
            <option value="Cao">Độ khó Cao</option>
            <option value="Vừa phải">Độ khó Vừa phải</option>
          </select>
        </div>
      </div>

      {/* Grid of Majors */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMajors.map((m) => {
          const bookmarked = isBookmarked("major", m.id);
          return (
            <div
              key={m.id}
              className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:border-brand-300 hover:shadow-lift"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-md px-2 py-0.5">
                    Mã ngành: {m.code}
                  </span>
                  <button
                    onClick={() => onBookmarkItem("major", m.id)}
                    className={`text-sm p-1 rounded-md transition ${
                      bookmarked ? "text-amber-500" : "text-ink-300 hover:text-amber-400"
                    }`}
                  >
                    {bookmarked ? "★" : "☆"}
                  </button>
                </div>

                <h2 className="font-bold text-ink-900 text-base mt-2 leading-snug">
                  {m.name}
                </h2>
                <p className="text-xs text-ink-600 mt-1 line-clamp-2">
                  {m.description}
                </p>

                <div className="mt-4 space-y-1.5 border-t border-line pt-2 text-xs">
                  <div className="flex justify-between text-ink-600">
                    <span>Độ khó học phần:</span>
                    <span className="font-bold text-ink-900">{m.difficulty_level}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Môn trọng tâm:</span>
                    <span className="font-bold text-ink-800">
                      {m.academic_requirements.required_subjects.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Điểm chuẩn TB tham khảo:</span>
                    <span className="font-bold text-brand-700">{m.academic_requirements.avg_cutoff_score} đ</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-line pt-3">
                <button
                  onClick={() => setSelectedMajor(m)}
                  className="w-full rounded-xl bg-surface-soft border border-line px-3 py-2 text-xs font-bold text-ink-800 hover:bg-brand-50 hover:text-brand-700 transition"
                >
                  Xem Chi tiết Chương trình Học →
                </button>
                <button
                  onClick={() => onAskCoachAboutItem(m.name)}
                  className="w-full rounded-xl bg-surface border border-line px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-amber-50 hover:text-amber-900 transition"
                >
                  💬 Hỏi AI Coach về ngành này
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMajors.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-ink-500">
          Không tìm thấy ngành nào phù hợp. Vui lòng thử từ khóa khác.
        </div>
      )}

      {/* Major Detail Modal */}
      {selectedMajor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-line bg-surface p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  Mã ngành {selectedMajor.code} • {selectedMajor.industry_name}
                </span>
                <h3 className="text-xl font-extrabold text-ink-900 mt-0.5">
                  {selectedMajor.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMajor(null)}
                className="rounded-full p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-5 text-xs text-ink-700">
              <div>
                <h4 className="font-bold text-ink-900 text-sm mb-1">Mục tiêu đào tạo</h4>
                <p className="leading-relaxed">{selectedMajor.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-ink-900 text-sm mb-2">Bạn sẽ được học những gì?</h4>
                <ul className="space-y-1.5 bg-surface-soft p-3.5 rounded-xl border border-line">
                  {selectedMajor.learning_content.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-brand-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-ink-900 text-sm mb-2">Ngành này hợp với ai?</h4>
                <ul className="space-y-1.5 bg-surface-soft p-3.5 rounded-xl border border-line">
                  {selectedMajor.suitability_traits.map((trait, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Universities Offering */}
              <div>
                <h4 className="font-bold text-ink-900 text-sm mb-2">Trường đào tạo tiêu biểu & Điểm chuẩn</h4>
                <div className="space-y-2">
                  {selectedMajor.top_universities.map((uni) => (
                    <div
                      key={uni.id}
                      className="flex items-center justify-between rounded-xl border border-line bg-surface-soft p-3 text-xs"
                    >
                      <span className="font-bold text-ink-900">{uni.name}</span>
                      <span className="rounded-md bg-brand-100 text-brand-800 font-extrabold px-2 py-0.5">
                        Điểm chuẩn: {uni.cutoff} đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-4 flex justify-end gap-2">
              <button
                onClick={() => onAskCoachAboutItem(selectedMajor.name)}
                className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink-800 hover:bg-brand-50 transition"
              >
                💬 Hỏi AI Coach về ngành này
              </button>
              <button
                onClick={() => setSelectedMajor(null)}
                className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
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
