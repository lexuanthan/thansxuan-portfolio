import React, { useState, useMemo } from "react";
import { CareerDNA } from "@/lib/career-guidance/types";
import { CAREERS_DATA } from "@/lib/career-guidance/careersData";

interface CareerExplorerViewProps {
  onSelectCareerForRoadmap: (careerId: string) => void;
  onAskCoachAboutItem: (name: string) => void;
  onBookmarkItem: (type: "career", id: string) => void;
  isBookmarked: (type: "career", id: string) => boolean;
}

export function CareerExplorerView({
  onSelectCareerForRoadmap,
  onAskCoachAboutItem,
  onBookmarkItem,
  isBookmarked
}: CareerExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [selectedAiExposure, setSelectedAiExposure] = useState<string>("all");
  const [selectedCareer, setSelectedCareer] = useState<CareerDNA | null>(null);

  const filteredCareers = useMemo(() => {
    return CAREERS_DATA.filter((c) => {
      if (selectedIndustry !== "all" && c.industry_id !== selectedIndustry) {
        return false;
      }
      if (selectedAiExposure !== "all" && c.ai_impact.automation_exposure !== selectedAiExposure) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = c.name.toLowerCase().includes(q);
        const inTagline = c.tagline.toLowerCase().includes(q);
        const inTags = c.tags.some((t) => t.toLowerCase().includes(q));
        if (!inName && !inTagline && !inTags) return false;
      }
      return true;
    });
  }, [searchQuery, selectedIndustry, selectedAiExposure]);

  const industries = useMemo(() => {
    const map = new Map<string, string>();
    CAREERS_DATA.forEach((c) => map.set(c.industry_id, c.industry_name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft space-y-4">
        <div>
          <h1 className="text-xl font-bold text-ink-900">
            Khám Phá Nghề Nghiệp (Career Explorer)
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">
            Tra cứu thông tin chi tiết về nhiệm vụ hằng ngày, mức lương, nấc thang thăng tiến và tác động của AI.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên nghề, kỹ năng (ví dụ: SQL, Python, Thiết kế)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-hidden"
          />

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-hidden"
          >
            <option value="all">Tất cả lĩnh vực ({CAREERS_DATA.length} nghề)</option>
            {industries.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAiExposure}
            onChange={(e) => setSelectedAiExposure(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-hidden"
          >
            <option value="all">Tất cả mức độ tự động hóa AI</option>
            <option value="Thấp">Nguy cơ tự động hóa Thấp (An toàn cao)</option>
            <option value="Trung bình">Nguy cơ tự động hóa Trung bình</option>
            <option value="Cao">Nguy cơ tự động hóa Cao</option>
          </select>
        </div>
      </div>

      {/* Grid of Careers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCareers.map((c) => {
          const bookmarked = isBookmarked("career", c.id);
          return (
            <div
              key={c.id}
              className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:border-brand-300 hover:shadow-lift"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-md px-2 py-0.5">
                    {c.industry_name}
                  </span>
                  <button
                    onClick={() => onBookmarkItem("career", c.id)}
                    className={`text-sm p-1 rounded-md transition ${
                      bookmarked ? "text-amber-500" : "text-ink-300 hover:text-amber-400"
                    }`}
                  >
                    {bookmarked ? "★" : "☆"}
                  </button>
                </div>

                <h2 className="font-bold text-ink-900 text-base mt-2 leading-snug">
                  {c.name}
                </h2>
                <p className="text-xs text-ink-500 mt-1 italic line-clamp-2">
                  "{c.tagline}"
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {c.tags.slice(0, 3).map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-surface-soft px-2 py-0.5 text-[10px] text-ink-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Salary & AI exposure */}
                <div className="mt-4 space-y-1.5 border-t border-line pt-2 text-xs">
                  <div className="flex justify-between text-ink-600">
                    <span>Thu nhập tại VN:</span>
                    <span className="font-bold text-ink-900">
                      {c.salary_range.entry_level_million} - {c.salary_range.senior_level_million} tr/tháng
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Ảnh hưởng của AI:</span>
                    <span
                      className={`font-semibold ${
                        c.ai_impact.automation_exposure === "Thấp"
                          ? "text-emerald-700"
                          : c.ai_impact.automation_exposure === "Trung bình"
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}
                    >
                      {c.ai_impact.automation_exposure}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 space-y-2 border-t border-line pt-3">
                <button
                  onClick={() => setSelectedCareer(c)}
                  className="w-full rounded-xl bg-surface-soft border border-line px-3 py-2 text-xs font-bold text-ink-800 hover:bg-brand-50 hover:text-brand-700 transition"
                >
                  Xem Hồ sơ Chi tiết →
                </button>
                <button
                  onClick={() => onSelectCareerForRoadmap(c.id)}
                  className="w-full rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
                >
                  Lập Lộ trình Nghề này 🚀
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCareers.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-ink-500">
          Không tìm thấy nghề nào phù hợp với bộ lọc hiện tại. Thử thay đổi từ khóa hoặc bộ lọc.
        </div>
      )}

      {/* Detailed Modal */}
      {selectedCareer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-line bg-surface p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                  {selectedCareer.industry_name}
                </span>
                <h3 className="text-xl font-extrabold text-ink-900 mt-0.5">
                  {selectedCareer.name}
                </h3>
                <p className="text-xs text-ink-500 italic mt-0.5">
                  "{selectedCareer.tagline}"
                </p>
              </div>
              <button
                onClick={() => setSelectedCareer(null)}
                className="rounded-full p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-5 text-xs text-ink-700">
              <div>
                <h4 className="font-bold text-ink-900 text-sm mb-1">Mô tả công việc tổng quan</h4>
                <p className="leading-relaxed">{selectedCareer.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-ink-900 text-sm mb-2">Nhiệm vụ thường nhật (Daily Tasks)</h4>
                <ul className="space-y-1.5 bg-surface-soft p-3.5 rounded-xl border border-line">
                  {selectedCareer.daily_tasks.map((task, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-brand-600 font-bold">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Salary & Ladder */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-surface-soft p-3.5">
                  <h4 className="font-bold text-ink-900 mb-2">Thang lương tại Việt Nam</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Mới ra trường (Fresher/Junior):</span>
                      <strong className="text-ink-900">{selectedCareer.salary_range.entry_level_million} tr/tháng</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Có kinh nghiệm (Mid-level):</span>
                      <strong className="text-brand-600">{selectedCareer.salary_range.mid_level_million} tr/tháng</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Chuyên gia cấp cao (Senior/Lead):</span>
                      <strong className="text-emerald-600">{selectedCareer.salary_range.senior_level_million} tr/tháng</strong>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-line bg-surface-soft p-3.5">
                  <h4 className="font-bold text-ink-900 mb-2">Lộ trình thăng tiến (Career Ladder)</h4>
                  <ol className="space-y-1 text-xs list-decimal list-inside text-ink-800">
                    {selectedCareer.career_progression.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* AI Impact */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-2">
                <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                  <span>🤖</span> Tác động & Tương lai với AI
                </h4>
                <p className="leading-relaxed text-indigo-900">
                  {selectedCareer.ai_impact.summary}
                </p>
                <div className="pt-1 text-indigo-900">
                  <strong>Lợi thế độc quyền của con người: </strong>
                  {selectedCareer.ai_impact.human_advantage}
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-4 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => onAskCoachAboutItem(selectedCareer.name)}
                className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink-800 hover:bg-brand-50 transition"
              >
                💬 Hỏi AI Coach về nghề này
              </button>
              <button
                onClick={() => {
                  onSelectCareerForRoadmap(selectedCareer.id);
                  setSelectedCareer(null);
                }}
                className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
              >
                🚀 Tạo Lộ Trình 5 Chặng Cho Nghề Này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
