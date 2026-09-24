import React, { useState, useMemo } from "react";
import { UniversityMatchResult, StudentCareerProfile } from "@/lib/career-guidance/types";
import { matchUniversities } from "@/lib/career-guidance/universityMatching";

interface UniversityExplorerViewProps {
  profile: StudentCareerProfile;
  onBookmarkItem: (type: "university", id: string) => void;
  isBookmarked: (type: "university", id: string) => boolean;
  onAskCoachAboutItem: (name: string) => void;
}

export function UniversityExplorerView({
  profile,
  onBookmarkItem,
  isBookmarked,
  onAskCoachAboutItem
}: UniversityExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<"ALL" | "BAC" | "TRUNG" | "NAM">("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [feasibilityFilter, setFeasibilityFilter] = useState<"ALL" | "Safe" | "Target" | "Reach">("ALL");
  const [expectedScore, setExpectedScore] = useState(profile.user_context.expected_exam_score || 25.5);

  // Cập nhật profile tạm thời với điểm thi kỳ vọng
  const currentProfile = useMemo(() => {
    return {
      ...profile,
      user_context: {
        ...profile.user_context,
        expected_exam_score: expectedScore
      }
    };
  }, [profile, expectedScore]);

  const allUnis = useMemo(() => {
    return matchUniversities(currentProfile, searchQuery.trim() || undefined);
  }, [currentProfile, searchQuery]);

  const filteredUnis = useMemo(() => {
    return allUnis.filter((u) => {
      if (regionFilter !== "ALL" && u.region !== regionFilter) return false;
      if (typeFilter !== "ALL" && u.type !== typeFilter) return false;
      if (feasibilityFilter !== "ALL" && u.overall_feasibility !== feasibilityFilter) return false;
      return true;
    });
  }, [allUnis, regionFilter, typeFilter, feasibilityFilter]);

  const feasibilityBadge = (feas: "Safe" | "Target" | "Reach") => {
    if (feas === "Safe") {
      return (
        <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
          🟢 An toàn (Safe)
        </span>
      );
    }
    if (feas === "Target") {
      return (
        <span className="rounded-full border border-brand-300 bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-800">
          🎯 Vừa sức (Target)
        </span>
      );
    }
    return (
      <span className="rounded-full border border-rose-300 bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
        🔥 Thử thách (Reach)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Feasibility Simulator */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink-900">
              Tra Cứu Trường & Tính Khả Năng Trúng Tuyển
            </h1>
            <p className="text-xs text-ink-500 mt-0.5">
              So khớp điểm thi kỳ vọng với dữ liệu điểm chuẩn thực tế các trường đại học tại Việt Nam.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-surface-soft p-3 border border-line">
            <span className="text-xs font-bold text-ink-700">Điểm thi giả lập:</span>
            <input
              type="number"
              min="15"
              max="30"
              step="0.25"
              value={expectedScore}
              onChange={(e) => setExpectedScore(parseFloat(e.target.value) || 20)}
              className="w-20 rounded-lg border border-line bg-surface px-2.5 py-1 text-center font-extrabold text-brand-600 focus:outline-hidden"
            />
            <span className="text-xs text-ink-400">điểm</span>
          </div>
        </div>

        {/* Disclaimer Alert (Section 30 & 80) */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 leading-relaxed">
          <strong>Lưu ý quan trọng:</strong> Điểm chuẩn các năm trước chỉ mang tính đối sánh xu hướng, không phải là cam kết chắc chắn trúng tuyển cho kỳ thi tuyển sinh năm nay.
        </div>

        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-4">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên trường, ngành học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-hidden"
          />

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value as typeof regionFilter)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-hidden"
          >
            <option value="ALL">Tất cả khu vực</option>
            <option value="BAC">Miền Bắc (Hà Nội, Hải Phòng...)</option>
            <option value="TRUNG">Miền Trung (Đà Nẵng, Huế...)</option>
            <option value="NAM">Miền Nam (TP.HCM, Cần Thơ...)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-hidden"
          >
            <option value="ALL">Tất cả loại hình trường</option>
            <option value="Công lập">Trường Công lập</option>
            <option value="Tư thục">Trường Tư thục</option>
            <option value="Quốc tế">Trường Quốc tế</option>
          </select>

          <select
            value={feasibilityFilter}
            onChange={(e) => setFeasibilityFilter(e.target.value as typeof feasibilityFilter)}
            className="w-full rounded-xl border border-line bg-surface p-2.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-hidden"
          >
            <option value="ALL">Tất cả độ khả thi</option>
            <option value="Safe">🟢 Nhóm An toàn (Safe)</option>
            <option value="Target">🎯 Nhóm Vừa sức (Target)</option>
            <option value="Reach">🔥 Nhóm Thử thách (Reach)</option>
          </select>
        </div>
      </div>

      {/* Grid of Universities */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUnis.slice(0, 30).map((u) => {
          const bookmarked = isBookmarked("university", u.university_id);
          return (
            <div
              key={u.university_id}
              className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:border-brand-300 hover:shadow-lift"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-md px-2 py-0.5">
                    {u.city} • {u.type}
                  </span>
                  <button
                    onClick={() => onBookmarkItem("university", u.university_id)}
                    className={`text-sm p-1 rounded-md transition ${
                      bookmarked ? "text-amber-500" : "text-ink-300 hover:text-amber-400"
                    }`}
                  >
                    {bookmarked ? "★" : "☆"}
                  </button>
                </div>

                <h2 className="font-bold text-ink-900 text-base mt-2.5 leading-snug">
                  {u.university_name}
                </h2>
                <p className="text-xs text-ink-500 mt-1">
                  Mã trường: <strong className="text-ink-800">{u.short_name}</strong>
                </p>

                {/* Feasibility badge */}
                <div className="mt-3 flex items-center justify-between border-y border-line py-2">
                  <span className="text-xs text-ink-500">Khả năng xét tuyển:</span>
                  {feasibilityBadge(u.overall_feasibility)}
                </div>

                {/* Majors list sample */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <span className="text-[11px] font-bold text-ink-400 uppercase">
                    Ngành đào tạo & Điểm chuẩn:
                  </span>
                  <div className="space-y-1">
                    {u.matching_majors.slice(0, 3).map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-surface-soft p-1.5 px-2 text-[11px]"
                      >
                        <span className="truncate pr-2 font-medium text-ink-800">
                          {m.major_name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-extrabold text-brand-700">{m.cutoff_score} đ</span>
                          <span className="text-[10px] text-ink-400">
                            ({m.diff_score > 0 ? `+${m.diff_score}` : m.diff_score})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex justify-between text-xs text-ink-500">
                  <span>Học phí tham khảo:</span>
                  <span className="font-bold text-ink-800">{u.tuition_million_year} tr/năm</span>
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-line pt-3">
                <button
                  onClick={() => onAskCoachAboutItem(u.university_name)}
                  className="w-full rounded-xl bg-surface-soft border border-line px-3 py-2 text-xs font-semibold text-ink-800 hover:bg-brand-50 hover:text-brand-700 transition"
                >
                  💬 Hỏi AI Coach về trường này
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUnis.length === 0 && (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-ink-500">
          Không tìm thấy trường nào phù hợp với bộ lọc hiện tại.
        </div>
      )}
    </div>
  );
}
