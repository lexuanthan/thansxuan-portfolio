import React, { useState, useMemo } from "react";
import { UniversityMatchResult, StudentCareerProfile, ActiveView } from "@/lib/career-guidance/types";
import { matchUniversities } from "@/lib/career-guidance/universityMatching";
import { SmartNextAction } from "../common/SmartNextAction";
import { MetricGauge } from "../common/MetricGauge";
import {
  IconUniversity,
  IconBookmark,
  IconBot,
  IconSearch,
  IconAlertCircle,
  IconAward,
  IconScale,
  IconSparkles,
  HcmuteBrandMark
} from "../common/CareerIcons";

interface UniversityExplorerViewProps {
  profile: StudentCareerProfile;
  onBookmarkItem: (type: "university", id: string) => void;
  isBookmarked: (type: "university", id: string) => boolean;
  onAskCoachAboutItem: (name: string) => void;
  onNavigateView?: (view: ActiveView) => void;
}

// Logo đại học: HCMUTE Brand Mark cho HCMUTE, Monogram học thuật trang trọng cho các trường khác
function UniversityLogo({
  shortName,
  isHcmute,
  size = "md"
}: {
  shortName: string;
  isHcmute?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses =
    size === "lg"
      ? "w-12 h-12 text-sm"
      : size === "sm"
      ? "w-7 h-7 text-[10px]"
      : "w-10 h-10 text-xs";

  if (isHcmute) {
    return (
      <div
        className={`rounded-xl border border-brand-200 bg-brand-50 flex items-center justify-center shrink-0 ${sizeClasses} shadow-xs p-1.5`}
      >
        <HcmuteBrandMark className="w-full h-full text-brand-600" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-line bg-gradient-to-br from-surface-soft via-surface to-brand-50/30 flex items-center justify-center shrink-0 font-extrabold text-brand-800 ${sizeClasses} shadow-xs tracking-tight`}
    >
      {shortName.slice(0, 4)}
    </div>
  );
}

export function UniversityExplorerView({
  profile,
  onBookmarkItem,
  isBookmarked,
  onAskCoachAboutItem,
  onNavigateView
}: UniversityExplorerViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState<"ALL" | "BAC" | "TRUNG" | "NAM">("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [feasibilityFilter, setFeasibilityFilter] = useState<"ALL" | "Safe" | "Target" | "Reach">("ALL");
  const [expectedScore, setExpectedScore] = useState(profile.user_context?.expected_exam_score || 25.5);

  // So sánh & Workspace
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>(["SPK", "QSB"]);
  const [isCompareWorkspaceOpen, setIsCompareWorkspaceOpen] = useState(false);
  const [highlightDifference, setHighlightDifference] = useState(true);
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);

  // Chi tiết trường (Modal)
  const [selectedUniDetail, setSelectedUniDetail] = useState<UniversityMatchResult | null>(null);

  // Cập nhật profile giả lập với điểm thi
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

  // Danh sách các trường đang được chọn so sánh
  const compareUnis = useMemo(() => {
    return selectedForCompare
      .map((id) => allUnis.find((u) => u.university_id === id || u.short_name === id))
      .filter((u): u is UniversityMatchResult => Boolean(u));
  }, [allUnis, selectedForCompare]);

  const toggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 3) {
        // Thay thế trường cuối nếu đã chọn 3
        setSelectedForCompare([selectedForCompare[0], selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const feasibilityBadge = (feas: "Safe" | "Target" | "Reach") => {
    if (feas === "Safe") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>An toàn (Safe)</span>
        </span>
      );
    }
    if (feas === "Target") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-800">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
          <span>Vừa sức (Target)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-accent-red-200 bg-accent-red-50 px-2 py-0.5 text-[11px] font-bold text-accent-red-800">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-red-600"></span>
        <span>Thử thách (Reach)</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Feasibility Simulator */}
      <div className="rounded-[14px] border border-line bg-surface p-5 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-[11px] font-bold text-brand-700 mb-1">
              <IconUniversity className="w-3.5 h-3.5 text-brand-600" />
              <span>Chặng 06 • University Matching & Decision Support</span>
            </div>
            <h1 className="text-xl font-bold text-ink-900 tracking-tight">
              Hệ Thống Khám Phá & So Khớp Trường Đại Học
            </h1>
            <p className="text-xs text-ink-500 mt-0.5">
              Hệ thống hỗ trợ ra quyết định (Decision-Support System) đo lường 7 chiều tương thích: Học thuật, Tuyển sinh, Tài chính, Địa điểm, Nghề nghiệp, Môi trường và Độ phù hợp tổng quan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-[12px] bg-surface-soft p-2.5 border border-line">
              <span className="text-xs font-bold text-ink-700">Điểm thi giả lập:</span>
              <input
                type="number"
                min="15"
                max="30"
                step="0.25"
                value={expectedScore}
                onChange={(e) => setExpectedScore(parseFloat(e.target.value) || 20)}
                className="w-20 rounded-[8px] border border-line bg-surface px-2 py-1 text-center font-extrabold text-brand-600 focus:outline-hidden text-sm"
              />
              <span className="text-xs text-ink-400">điểm</span>
            </div>

            {selectedForCompare.length > 0 && (
              <button
                onClick={() => setIsCompareWorkspaceOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-brand-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition"
              >
                <IconScale className="w-3.5 h-3.5" />
                <span>Mở Workspace So Sánh ({selectedForCompare.length}/3)</span>
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer Alert: Ngôn ngữ chuẩn mực */}
        <div className="rounded-[10px] border border-brand-200 bg-brand-50/70 p-3 text-xs text-brand-900 leading-relaxed flex items-start gap-2.5">
          <IconAlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-brand-800">Nguyên tắc định hướng:</strong> Hệ thống không xếp hạng đâu là <em>&ldquo;trường tốt nhất&rdquo;</em>, mà phân tích và đề xuất <strong>&ldquo;trường phù hợp hơn với hồ sơ hiện tại&rdquo;</strong> của bạn dựa trên 7 trục năng lực, tài chính và định hướng nghề nghiệp dài hạn.
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              placeholder="Tìm theo tên trường, mã trường..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-[10px] border border-line bg-surface text-ink-900 focus:border-brand-500 focus:outline-hidden"
            />
          </div>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value as typeof regionFilter)}
            className="w-full px-3 py-2 text-xs rounded-[10px] border border-line bg-surface text-ink-900 focus:border-brand-500 focus:outline-hidden"
          >
            <option value="ALL">Tất cả khu vực địa lý</option>
            <option value="BAC">Miền Bắc (Hà Nội, Hải Phòng...)</option>
            <option value="TRUNG">Miền Trung (Đà Nẵng, Huế...)</option>
            <option value="NAM">Miền Nam (TP.HCM, Cần Thơ...)</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-[10px] border border-line bg-surface text-ink-900 focus:border-brand-500 focus:outline-hidden"
          >
            <option value="ALL">Tất cả loại hình trường</option>
            <option value="Công lập">Trường Công lập</option>
            <option value="Tư thục">Trường Tư thục</option>
            <option value="Quốc tế">Trường Quốc tế</option>
          </select>

          <select
            value={feasibilityFilter}
            onChange={(e) => setFeasibilityFilter(e.target.value as typeof feasibilityFilter)}
            className="w-full px-3 py-2 text-xs rounded-[10px] border border-line bg-surface text-ink-900 focus:border-brand-500 focus:outline-hidden"
          >
            <option value="ALL">Tất cả độ khả thi xét tuyển</option>
            <option value="Safe">Nhóm An toàn (Safe)</option>
            <option value="Target">Nhóm Vừa sức (Target)</option>
            <option value="Reach">Nhóm Thử thách (Reach)</option>
          </select>
        </div>
      </div>

      {/* Grid of Universities (Cards với 8 tiêu chuẩn) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUnis.slice(0, 30).map((u) => {
          const bookmarked = isBookmarked("university", u.university_id);
          const isHcmute = u.short_name === "HCMUTE" || u.university_name.includes("Sư phạm Kỹ thuật");
          const isCompared = selectedForCompare.includes(u.university_id) || selectedForCompare.includes(u.short_name);
          const fits = u.fit_breakdown || {
            overall_fit: u.match_score,
            academic_fit: 85,
            admission_fit: 82,
            financial_fit: 88,
            location_fit: 90,
            career_fit: 92,
            environment_fit: 85
          };

          return (
            <div
              key={u.university_id}
              className={`flex flex-col justify-between rounded-[14px] border p-5 shadow-soft transition hover:shadow-lift relative ${
                isHcmute
                  ? "border-brand-500 bg-brand-50/15 ring-1 ring-brand-500/30"
                  : "border-line bg-surface hover:border-brand-300"
              }`}
            >
              <div>
                {/* 1. Logo & Top badges & Bookmark */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UniversityLogo shortName={u.short_name} isHcmute={isHcmute} size="md" />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-ink-500 bg-surface-soft border border-line rounded px-1.5 py-0.5">
                          {u.short_name}
                        </span>
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded px-1.5 py-0.5">
                          {u.type}
                        </span>
                        {isHcmute && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-accent-red-700 bg-accent-red-50 border border-accent-red-200 rounded px-1.5 py-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-red-600"></span>
                            <span>Trọng điểm HCMUTE</span>
                          </span>
                        )}
                      </div>
                      {/* 2. University Name */}
                      <h2 className="font-extrabold text-ink-900 text-sm mt-1 leading-snug line-clamp-2">
                        {u.university_name}
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={() => onBookmarkItem("university", u.university_id)}
                    aria-label={bookmarked ? "Bỏ lưu trường" : "Lưu trường"}
                    className={`p-1.5 rounded-[8px] transition shrink-0 ${
                      bookmarked
                        ? "text-accent-red-600 bg-accent-red-50 border border-accent-red-200"
                        : "text-ink-400 hover:text-accent-red-600 hover:bg-surface-soft border border-transparent"
                    }`}
                  >
                    <IconBookmark className="w-4 h-4" filled={bookmarked} />
                  </button>
                </div>

                {/* 3. Location */}
                <div className="mt-2.5 flex items-center justify-between text-xs text-ink-500 border-b border-line pb-2.5">
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-ink-700">📍 {u.city}</span>
                    <span>• {u.region === "NAM" ? "Miền Nam" : u.region === "TRUNG" ? "Miền Trung" : "Miền Bắc"}</span>
                  </span>
                  <span className="text-[11px] font-medium text-ink-400">
                    Mã tuyển sinh: <strong className="text-ink-800">{u.short_name}</strong>
                  </span>
                </div>

                {/* 4. Match (Overall Fit) with 7-Fit Preview */}
                <div className="mt-3 rounded-[10px] bg-surface-soft p-3 border border-line">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MetricGauge score={fits.overall_fit} size={44} strokeWidth={4.5} />
                      <div>
                        <span className="text-xs font-bold text-ink-900 block">
                          {fits.overall_fit}% Phù hợp hồ sơ
                        </span>
                        <span className="text-[10px] text-ink-500">
                          Overall University Fit
                        </span>
                      </div>
                    </div>
                    {feasibilityBadge(u.overall_feasibility)}
                  </div>

                  {/* 7-Fit Dimension preview mini bars */}
                  <div className="mt-2.5 grid grid-cols-3 gap-1.5 pt-2 border-t border-line/60 text-[10px]">
                    <div className="rounded bg-surface px-1.5 py-1 text-center border border-line/50">
                      <span className="text-ink-400 block text-[9px]">Học thuật</span>
                      <strong className="text-brand-700 font-bold">{fits.academic_fit}%</strong>
                    </div>
                    <div className="rounded bg-surface px-1.5 py-1 text-center border border-line/50">
                      <span className="text-ink-400 block text-[9px]">Xét tuyển</span>
                      <strong className="text-brand-700 font-bold">{fits.admission_fit}%</strong>
                    </div>
                    <div className="rounded bg-surface px-1.5 py-1 text-center border border-line/50">
                      <span className="text-ink-400 block text-[9px]">Tài chính</span>
                      <strong className="text-brand-700 font-bold">{fits.financial_fit}%</strong>
                    </div>
                  </div>
                </div>

                {/* 5. Tuition & 6. Admission (Độ khả thi & Điểm chuẩn) */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-[8px] bg-surface p-2 border border-line">
                    <span className="text-[10px] text-ink-400 block">Học phí trung bình:</span>
                    <span className="font-extrabold text-ink-900">{u.tuition_million_year} tr/năm</span>
                  </div>
                  <div className="rounded-[8px] bg-surface p-2 border border-line">
                    <span className="text-[10px] text-ink-400 block">Điểm chuẩn tham khảo:</span>
                    <span className="font-extrabold text-brand-700">
                      {u.average_cutoff ? `${u.average_cutoff} đ` : "24.5 - 26.5 đ"}
                    </span>
                  </div>
                </div>

                {/* 7. Program (Ngành trọng điểm & Điểm chuẩn) */}
                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider block">
                    Ngành đào tạo trọng điểm:
                  </span>
                  <div className="space-y-1">
                    {u.matching_majors.slice(0, 2).map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-[8px] bg-surface-soft p-1.5 text-[11px] border border-line"
                      >
                        <span className="truncate pr-2 font-medium text-ink-800">
                          {m.major_name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0 font-bold text-brand-700">
                          <span>{m.cutoff_score} đ</span>
                          <span className="text-[10px] text-ink-400 font-normal">
                            ({m.diff_score > 0 ? `+${m.diff_score}` : m.diff_score})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 8. Scholarship (Chính sách học bổng) */}
                <div className="mt-3 rounded-[8px] bg-emerald-50/60 border border-emerald-200/80 p-2 text-[11px] text-emerald-950 flex items-start gap-1.5">
                  <IconAward className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="line-clamp-2 leading-relaxed">
                    <strong className="font-bold text-emerald-900">Học bổng:</strong>{" "}
                    {u.scholarship_info || "Học bổng khuyến khích học tập và quỹ hỗ trợ sinh viên tài năng."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-line space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedUniDetail(u)}
                    className="inline-flex items-center justify-center gap-1 rounded-[8px] bg-brand-50 border border-brand-200 px-3 py-1.5 text-xs font-bold text-brand-800 hover:bg-brand-100 transition"
                  >
                    <span>Xem chi tiết 7 trục</span>
                  </button>

                  <button
                    onClick={() => toggleCompare(u.university_id)}
                    className={`inline-flex items-center justify-center gap-1 rounded-[8px] px-3 py-1.5 text-xs font-bold transition border ${
                      isCompared
                        ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                        : "bg-surface border-line text-ink-700 hover:border-brand-300 hover:bg-surface-soft"
                    }`}
                  >
                    <IconScale className="w-3 h-3" />
                    <span>{isCompared ? "Đã chọn so sánh" : "+ So sánh"}</span>
                  </button>
                </div>

                <button
                  onClick={() => onAskCoachAboutItem(u.university_name)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-[8px] bg-surface-soft border border-line px-3 py-1.5 text-xs font-bold text-ink-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition"
                >
                  <IconBot className="w-3.5 h-3.5 text-brand-600" />
                  <span>Hỏi AI Coach về cơ hội xét tuyển</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUnis.length === 0 && (
        <div className="rounded-[14px] border border-line bg-surface p-10 text-center text-ink-500">
          <p className="text-sm font-semibold text-ink-700">Không tìm thấy trường nào phù hợp với bộ lọc hiện tại.</p>
          <p className="text-xs text-ink-500 mt-1">Hãy điều chỉnh điểm thi giả lập hoặc lựa chọn khu vực địa lý khác.</p>
        </div>
      )}

      {/* Sticky Bottom Compare Bar */}
      {selectedForCompare.length > 0 && !isCompareWorkspaceOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl rounded-[14px] border border-brand-300 bg-surface/95 backdrop-blur-md p-3.5 shadow-lift flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xs font-bold text-ink-800 whitespace-nowrap">
              Đang chọn ({selectedForCompare.length}/3):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {compareUnis.map((cu) => (
                <span
                  key={cu.university_id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-brand-50 border border-brand-200 text-xs font-bold text-brand-900 shrink-0"
                >
                  {cu.short_name}
                  <button
                    onClick={() => toggleCompare(cu.university_id)}
                    aria-label={`Bỏ chọn ${cu.short_name}`}
                    className="text-ink-400 hover:text-accent-red-600 ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedForCompare([])}
              className="text-xs text-ink-500 hover:text-ink-800 font-medium px-2 py-1"
            >
              Xóa tất cả
            </button>
            <button
              onClick={() => setIsCompareWorkspaceOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition"
            >
              <IconScale className="w-3.5 h-3.5" />
              <span>So sánh trực diện ({selectedForCompare.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (University Detail với 7 tiêu chuẩn) */}
      {selectedUniDetail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[16px] border border-line bg-surface p-6 shadow-lift space-y-6">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-center gap-3.5">
                <UniversityLogo
                  shortName={selectedUniDetail.short_name}
                  isHcmute={selectedUniDetail.short_name === "HCMUTE"}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded px-2 py-0.5">
                      {selectedUniDetail.short_name} • {selectedUniDetail.type}
                    </span>
                    {feasibilityBadge(selectedUniDetail.overall_feasibility)}
                  </div>
                  <h2 className="text-lg font-extrabold text-ink-900 mt-1">
                    {selectedUniDetail.university_name}
                  </h2>
                  <p className="text-xs text-ink-500">
                    📍 {selectedUniDetail.city} • Điểm chuẩn trung bình:{" "}
                    <strong>{selectedUniDetail.average_cutoff || 25.5} điểm</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUniDetail(null)}
                aria-label="Đóng"
                className="rounded-[8px] p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-700"
              >
                ✕
              </button>
            </div>

            {/* 1. Fit Breakdown (7 Chiều Fit) */}
            <div className="rounded-[12px] border border-line bg-surface-soft p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider flex items-center gap-1.5">
                  <IconSparkles className="w-4 h-4 text-brand-600" />
                  <span>Fit Breakdown • 7 Chiều Tương Thích Khoa Học</span>
                </h3>
                <span className="text-xs font-bold text-brand-700">
                  Overall Fit: {selectedUniDetail.fit_breakdown?.overall_fit || selectedUniDetail.match_score}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { label: "Overall Fit (Tổng thể)", val: selectedUniDetail.fit_breakdown?.overall_fit ?? selectedUniDetail.match_score, desc: "Trọng số đa tiêu chí" },
                  { label: "Academic Fit (Học thuật)", val: selectedUniDetail.fit_breakdown?.academic_fit ?? 88, desc: "Năng lực tư duy vs Độ khó" },
                  { label: "Admission Fit (Xét tuyển)", val: selectedUniDetail.fit_breakdown?.admission_fit ?? 82, desc: "Điểm kỳ vọng vs Điểm chuẩn" },
                  { label: "Financial Fit (Tài chính)", val: selectedUniDetail.fit_breakdown?.financial_fit ?? 90, desc: "Học phí vs Ngân sách" },
                  { label: "Location Fit (Địa điểm)", val: selectedUniDetail.fit_breakdown?.location_fit ?? 85, desc: "Vị trí & Cơ sở học tập" },
                  { label: "Career Fit (Nghề nghiệp)", val: selectedUniDetail.fit_breakdown?.career_fit ?? 94, desc: "Tỷ lệ việc làm & Đối tác" },
                  { label: "Environment Fit (Môi trường)", val: selectedUniDetail.fit_breakdown?.environment_fit ?? 92, desc: "Văn hóa thực hành & Lab" }
                ].map((item, idx) => (
                  <div key={idx} className="rounded-[8px] bg-surface p-2.5 border border-line">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-ink-600 font-medium">{item.label}</span>
                      <strong className="text-brand-700 font-bold">{item.val}%</strong>
                    </div>
                    <div className="h-1.5 w-full bg-surface-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 rounded-full"
                        style={{ width: `${item.val}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-ink-400 block mt-1">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Admission Compatibility (Điểm chuẩn & Phương thức) */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-ink-900 uppercase tracking-wider">
                Khả năng trúng tuyển & Phương thức xét tuyển:
              </h3>
              <div className="rounded-[10px] border border-line bg-surface p-3 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {(selectedUniDetail.admission_methods || [
                    "Xét điểm thi Tốt nghiệp THPT 2026",
                    "Xét điểm thi Đánh giá năng lực ĐHQG-HCM",
                    "Xét học bạ THPT"
                  ]).map((method, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-[6px] bg-brand-50 border border-brand-200 text-xs text-brand-900 font-medium"
                    >
                      ✓ {method}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-line">
                  <span className="text-xs text-ink-500 font-medium block mb-1.5">
                    Các ngành đào tạo đối sánh với điểm thi {expectedScore} điểm:
                  </span>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {selectedUniDetail.matching_majors.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-[8px] bg-surface-soft p-2 text-xs border border-line"
                      >
                        <span className="truncate pr-2 font-medium text-ink-800">{m.major_name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-extrabold text-brand-700">{m.cutoff_score} đ</span>
                          <span className="text-[10px] text-ink-400">
                            ({m.diff_score > 0 ? `+${m.diff_score}` : m.diff_score})
                          </span>
                          {feasibilityBadge(m.feasibility === "Unknown" ? "Target" : m.feasibility)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Tuition & 4. Scholarship */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[10px] border border-line bg-surface p-3.5 space-y-1.5">
                <span className="text-xs font-bold text-ink-900 uppercase tracking-wider block">
                  Học phí & Chi phí đào tạo:
                </span>
                <p className="text-sm font-extrabold text-brand-700">
                  {selectedUniDetail.tuition_million_year} triệu VNĐ / năm
                </p>
                <p className="text-xs text-ink-500 leading-relaxed">
                  Lộ trình học phí theo cơ chế tự chủ đại học, cam kết tăng không quá 10-15%/năm theo quy định của Chính phủ.
                </p>
              </div>

              <div className="rounded-[10px] border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-1.5">
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block flex items-center gap-1">
                  <IconAward className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Chính sách học bổng:</span>
                </span>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {selectedUniDetail.scholarship_info ||
                    "Học bổng khuyến khích học tập xuất sắc và hỗ trợ sinh viên khó khăn."}
                </p>
              </div>
            </div>

            {/* 5. Campus & 6. Program & 7. Career Opportunity */}
            <div className="space-y-3">
              <div className="rounded-[10px] border border-line bg-surface p-3.5 space-y-1">
                <strong className="text-xs font-bold text-ink-900 block">
                  Khuôn viên & Cơ sở vật chất (Campus):
                </strong>
                <p className="text-xs text-ink-600 leading-relaxed">
                  {selectedUniDetail.campus_environment ||
                    `Hệ thống giảng đường, phòng thí nghiệm và ký túc xá tại ${selectedUniDetail.city}.`}
                </p>
              </div>

              <div className="rounded-[10px] border border-line bg-surface p-3.5 space-y-1">
                <strong className="text-xs font-bold text-ink-900 block">
                  Chương trình đào tạo & Kiểm định quốc tế (Program):
                </strong>
                <p className="text-xs text-ink-600 leading-relaxed">
                  {selectedUniDetail.curriculum_highlight ||
                    "Chương trình đào tạo chuẩn quốc gia, tích hợp kiến thức chuyên môn và kỹ năng thực tế."}
                </p>
              </div>

              <div className="rounded-[10px] border border-line bg-surface p-3.5 space-y-1">
                <strong className="text-xs font-bold text-ink-900 block">
                  Cơ hội việc làm & Đối tác doanh nghiệp (Career Opportunity):
                </strong>
                <p className="text-xs text-ink-600 leading-relaxed">
                  {selectedUniDetail.career_opportunities ||
                    "Tỷ lệ việc làm cao với mạng lưới liên kết doanh nghiệp đa dạng trong khu vực."}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-line">
              <button
                onClick={() => {
                  toggleCompare(selectedUniDetail.university_id);
                }}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-brand-200 bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-900 hover:bg-brand-100 transition"
              >
                <IconScale className="w-3.5 h-3.5" />
                <span>
                  {selectedForCompare.includes(selectedUniDetail.university_id)
                    ? "Đã có trong danh sách so sánh"
                    : "+ Thêm vào bảng so sánh"}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAskCoachAboutItem(selectedUniDetail.university_name)}
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition"
                >
                  <IconBot className="w-3.5 h-3.5" />
                  <span>Hỏi AI Coach về cơ hội trúng tuyển</span>
                </button>
                <button
                  onClick={() => setSelectedUniDetail(null)}
                  className="rounded-[10px] border border-line bg-surface px-4 py-2 text-xs font-bold text-ink-700 hover:bg-surface-soft"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMPARISON WORKSPACE (Modal Workspace) */}
      {isCompareWorkspaceOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-ink-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-[16px] border border-line bg-surface shadow-lift flex flex-col">
            {/* STICKY HEADER */}
            <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-line p-4 sm:p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-[11px] font-bold text-brand-700 mb-1">
                    <IconScale className="w-3.5 h-3.5" />
                    <span>Comparison Decision Workspace</span>
                  </div>
                  <h2 className="text-lg font-bold text-ink-900">
                    Bàn Cân So Sánh Các Trường Đại Học
                  </h2>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Highlight differences toggle */}
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink-700 bg-surface-soft px-3 py-1.5 rounded-[8px] border border-line">
                    <input
                      type="checkbox"
                      checked={highlightDifference}
                      onChange={(e) => setHighlightDifference(e.target.checked)}
                      className="rounded border-line text-brand-600 focus:ring-0"
                    />
                    <span>Làm nổi bật điểm khác biệt</span>
                  </label>

                  {/* AI Analysis CTA Button */}
                  <button
                    onClick={() => setIsAiAnalysisOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-[10px] bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition"
                  >
                    <IconSparkles className="w-3.5 h-3.5" />
                    <span>AI phân tích điểm khác biệt quan trọng</span>
                  </button>

                  <button
                    onClick={() => setIsCompareWorkspaceOpen(false)}
                    aria-label="Đóng bảng so sánh"
                    className="rounded-[8px] p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Sticky comparison header cards preview */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {compareUnis.map((u) => {
                  const isHcmute = u.short_name === "HCMUTE" || u.university_name.includes("Sư phạm Kỹ thuật");
                  return (
                    <div
                      key={u.university_id}
                      className={`p-3 rounded-[10px] border flex items-center justify-between gap-2.5 ${
                        isHcmute
                          ? "border-brand-500 bg-brand-50/30"
                          : "border-line bg-surface-soft"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UniversityLogo shortName={u.short_name} isHcmute={isHcmute} size="sm" />
                        <div className="min-w-0">
                          <span className="font-extrabold text-ink-900 text-xs truncate block">
                            {u.short_name}
                          </span>
                          <span className="text-[10px] text-ink-500 truncate block">
                            {u.university_name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-brand-700 text-xs bg-surface px-2 py-0.5 rounded border border-line">
                          {u.match_score}%
                        </span>
                        {compareUnis.length > 1 && (
                          <button
                            onClick={() => toggleCompare(u.university_id)}
                            aria-label={`Bỏ so sánh ${u.short_name}`}
                            className="text-ink-400 hover:text-accent-red-600 p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COMPARISON CONTENT */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* DESKTOP TABLE VIEW (with 8 rows) */}
              <div className="hidden md:block overflow-x-auto rounded-[12px] border border-line bg-surface">
                <table className="w-full text-left text-xs text-ink-800">
                  <thead className="bg-surface-soft border-b border-line text-ink-900 font-bold">
                    <tr>
                      <th className="p-3.5 w-1/4">Tiêu chí so sánh</th>
                      {compareUnis.map((u) => (
                        <th key={u.university_id} className="p-3.5 w-1/4">
                          <span className="text-sm font-extrabold text-brand-700 block">
                            {u.short_name}
                          </span>
                          <span className="text-[11px] font-normal text-ink-500">
                            {u.city} • {u.type}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {/* Row 1: Fit Breakdown */}
                    <tr className={highlightDifference ? "bg-brand-50/20" : ""}>
                      <td className="p-3.5 font-bold text-ink-900 bg-surface-soft/40">
                        1. University Fit (7 Chiều)
                      </td>
                      {compareUnis.map((u) => {
                        const fits = u.fit_breakdown || {
                          overall_fit: u.match_score,
                          academic_fit: 85,
                          admission_fit: 80,
                          financial_fit: 85,
                          location_fit: 85,
                          career_fit: 90,
                          environment_fit: 85
                        };
                        return (
                          <td key={u.university_id} className="p-3.5 space-y-1">
                            <span className="text-base font-extrabold text-brand-600 block">
                              {fits.overall_fit}% Overall Fit
                            </span>
                            <div className="text-[11px] text-ink-600 space-y-0.5">
                              <div>• Học thuật (Academic): <strong>{fits.academic_fit}%</strong></div>
                              <div>• Xét tuyển (Admission): <strong>{fits.admission_fit}%</strong></div>
                              <div>• Tài chính (Financial): <strong>{fits.financial_fit}%</strong></div>
                              <div>• Địa điểm (Location): <strong>{fits.location_fit}%</strong></div>
                              <div>• Nghề nghiệp (Career): <strong>{fits.career_fit}%</strong></div>
                              <div>• Môi trường (Environment): <strong>{fits.environment_fit}%</strong></div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 2: Admission */}
                    <tr className={highlightDifference ? "bg-amber-50/20" : ""}>
                      <td className="p-3.5 font-bold text-ink-900 bg-surface-soft/40">
                        2. Xét tuyển & Điểm chuẩn (Admission)
                      </td>
                      {compareUnis.map((u) => (
                        <td key={u.university_id} className="p-3.5 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <strong className="text-sm font-extrabold text-brand-700">
                              {u.average_cutoff || 25.5} đ
                            </strong>
                            {feasibilityBadge(u.overall_feasibility)}
                          </div>
                          <span className="text-[11px] text-ink-500 block">
                            Điểm kỳ vọng: {expectedScore} đ
                          </span>
                          <span className="text-[10px] text-ink-400 block line-clamp-2">
                            {u.admission_methods?.slice(0, 2).join("; ")}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Row 3: Tuition */}
                    <tr className={highlightDifference ? "bg-blue-50/20" : ""}>
                      <td className="p-3.5 font-bold text-ink-900 bg-surface-soft/40">
                        3. Học phí tham khảo (Tuition)
                      </td>
                      {compareUnis.map((u) => (
                        <td key={u.university_id} className="p-3.5">
                          <span className="text-sm font-extrabold text-ink-900 block">
                            {u.tuition_million_year} triệu VNĐ / năm
                          </span>
                          <span className="text-[11px] text-ink-500">
                            {u.tuition_million_year <= (profile.user_context?.tuition_budget_max_million || 40)
                              ? "✓ Phù hợp ngân sách dự kiến"
                              : "⚠️ Cần cân đối ngân sách hoặc săn học bổng"}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Row 4: Location */}
                    <tr>
                      <td className="p-3.5 font-bold text-ink-900 bg-surface-soft/40">
                        4. Vị trí & Khu vực (Location)
                      </td>
                      {compareUnis.map((u) => (
                        <td key={u.university_id} className="p-3.5 text-xs text-ink-700">
                          <strong className="block text-ink-900">{u.city}</strong>
                          <span className="text-ink-500 text-[11px]">
                            {u.region === "NAM" ? "Khu vực Miền Nam" : u.region === "TRUNG" ? "Khu vực Miền Trung" : "Khu vực Miền Bắc"}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Row 5: Scholarship */}
                    <tr className={highlightDifference ? "bg-emerald-50/20" : ""}>
                      <td className="p-3.5 font-bold text-ink-900 bg-surface-soft/40">
                        5. Chính sách học bổng (Scholarship)
                      </td>
                      {compareUnis.map((u) => (
                        <td key={u.university_id} className="p-3.5 text-xs leading-relaxed text-ink-700">
                          {u.scholarship_info || "Học bổng khuyến khích và tài trợ doanh nghiệp."}
                        </td>
                      ))}
                    </tr>

                    {/* Row 6: Curriculum */}
                    <tr>
                      <td className="p-3.5 font-bold text-ink-900 bg-surface-soft/40">
                        6. Chương trình & Kiểm định (Curriculum)
                      </td>
                      {compareUnis.map((u) => (
                        <td key={u.university_id} className="p-3.5 text-xs leading-relaxed text-ink-700">
                          {u.curriculum_highlight || "Chuẩn kiểm định quốc gia và quốc tế."}
                        </td>
                      ))}
                    </tr>

                    {/* Row 7: Environment */}
                    <tr>
                      <td className="p-3.5 font-bold text-ink-900 bg-surface-soft/40">
                        7. Môi trường & Cơ sở vật chất (Environment)
                      </td>
                      {compareUnis.map((u) => (
                        <td key={u.university_id} className="p-3.5 text-xs leading-relaxed text-ink-700">
                          {u.campus_environment || "Giảng đường hiện đại, phòng thí nghiệm đầy đủ."}
                        </td>
                      ))}
                    </tr>

                    {/* Row 8: Career */}
                    <tr className={highlightDifference ? "bg-indigo-50/20" : ""}>
                      <td className="p-3.5 font-bold text-ink-900 bg-surface-soft/40">
                        8. Cơ hội việc làm & Đối tác (Career)
                      </td>
                      {compareUnis.map((u) => (
                        <td key={u.university_id} className="p-3.5 text-xs leading-relaxed text-ink-700">
                          {u.career_opportunities || "Tỷ lệ việc làm cao với mạng lưới doanh nghiệp đối tác."}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* RESPONSIVE MOBILE VIEW: Stacked Compare (Không ép table ngang quá rộng) */}
              <div className="block md:hidden space-y-4">
                <div className="rounded-[10px] bg-brand-50 p-2.5 text-[11px] text-brand-900 font-medium border border-brand-200">
                  📱 <strong>Chế độ đối sánh di động:</strong> Hiển thị xếp chồng (Stacked Compare) trực quan theo từng trường để tránh tràn bảng ngang.
                </div>

                {compareUnis.map((u) => {
                  const isHcmute = u.short_name === "HCMUTE" || u.university_name.includes("Sư phạm Kỹ thuật");
                  const fits = u.fit_breakdown || {
                    overall_fit: u.match_score,
                    academic_fit: 85,
                    admission_fit: 80,
                    financial_fit: 85,
                    location_fit: 85,
                    career_fit: 90,
                    environment_fit: 85
                  };

                  return (
                    <div
                      key={u.university_id}
                      className={`rounded-[12px] border p-4 shadow-soft space-y-3 ${
                        isHcmute
                          ? "border-brand-500 bg-brand-50/15"
                          : "border-line bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-line pb-2">
                        <div className="flex items-center gap-2">
                          <UniversityLogo shortName={u.short_name} isHcmute={isHcmute} size="sm" />
                          <div>
                            <strong className="text-xs font-bold text-ink-900 block">{u.short_name}</strong>
                            <span className="text-[10px] text-ink-500">{u.city} • {u.type}</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          {fits.overall_fit}% Match
                        </span>
                      </div>

                      {/* 8 Rows Stacked for this uni */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-ink-400 uppercase block">1. 7 Chiều Fit:</span>
                          <span className="text-ink-700">
                            Học thuật: {fits.academic_fit}% • Xét tuyển: {fits.admission_fit}% • Tài chính: {fits.financial_fit}%
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-ink-400 uppercase block">2. Điểm chuẩn & Xét tuyển:</span>
                          <span className="font-bold text-brand-700">{u.average_cutoff || 25.5} đ</span> ({u.overall_feasibility})
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-ink-400 uppercase block">3. Học phí:</span>
                          <span className="font-extrabold text-ink-900">{u.tuition_million_year} tr/năm</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-ink-400 uppercase block">4. Địa điểm:</span>
                          <span>{u.city} ({u.region})</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-ink-400 uppercase block">5. Học bổng:</span>
                          <span className="text-emerald-900 line-clamp-2">{u.scholarship_info}</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-ink-400 uppercase block">6. Chương trình:</span>
                          <span className="line-clamp-2">{u.curriculum_highlight}</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-ink-400 uppercase block">7. Môi trường:</span>
                          <span className="line-clamp-2">{u.campus_environment}</span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-ink-400 uppercase block">8. Cơ hội nghề nghiệp:</span>
                          <span className="line-clamp-2">{u.career_opportunities}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workspace Footer */}
            <div className="border-t border-line p-4 bg-surface-soft flex items-center justify-between">
              <span className="text-xs text-ink-500">
                Lựa chọn tối đa 3 trường để phân tích đối sánh sâu.
              </span>
              <button
                onClick={() => setIsCompareWorkspaceOpen(false)}
                className="rounded-[10px] bg-ink-900 text-white px-4 py-2 text-xs font-bold hover:bg-ink-800 transition"
              >
                Đóng Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI ANALYSIS MODAL (AI phân tích điểm khác biệt quan trọng) */}
      {isAiAnalysisOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-2xl rounded-[16px] border border-line bg-surface p-6 shadow-lift space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <IconSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-ink-900">
                    AI Phân Tích Điểm Khác Biệt Quan Trọng
                  </h3>
                  <p className="text-xs text-ink-500">
                    Đánh giá khách quan dựa trên hồ sơ năng lực & định hướng cá nhân
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiAnalysisOpen(false)}
                aria-label="Đóng phân tích AI"
                className="rounded-[8px] p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-700"
              >
                ✕
              </button>
            </div>

            {/* AI Insights & Trade-offs */}
            <div className="space-y-3.5 text-xs text-ink-800 leading-relaxed">
              <div className="rounded-[10px] bg-brand-50/80 p-3.5 border border-brand-200">
                <strong className="text-brand-900 font-bold block mb-1">
                  1. Đánh giá tính phù hợp theo hồ sơ hiện tại:
                </strong>
                <p>
                  Dựa trên hồ sơ của bạn với điểm thi kỳ vọng <strong>{expectedScore} điểm</strong> và thiên hướng kỹ thuật thực chiến, hệ thống xác định{" "}
                  <strong>trường phù hợp hơn với hồ sơ hiện tại</strong> là{" "}
                  <strong>{compareUnis[0]?.short_name || "HCMUTE"}</strong> nhờ tỷ lệ thời lượng thực hành xưởng/lab cao (60%), liên kết trực tiếp với doanh nghiệp công nghệ cao và mức học phí tối ưu trong ngân sách.
                </p>
              </div>

              <div className="rounded-[10px] bg-surface-soft p-3.5 border border-line space-y-2">
                <strong className="text-ink-900 font-bold block">
                  2. Ma trận đánh đổi (Trade-off Analysis):
                </strong>
                <ul className="space-y-1.5 list-disc pl-4 text-ink-700">
                  {compareUnis.map((u) => (
                    <li key={u.university_id}>
                      <strong className="text-ink-900">{u.short_name}:</strong>{" "}
                      {u.short_name === "HCMUTE"
                        ? "Thế mạnh thực hành xưởng và cơ hội việc làm kỹ thuật tại SHTP, nhưng áp lực đồ án kỹ thuật cao."
                        : u.type === "Quốc tế"
                        ? "Môi trường tiếng Anh và mạng lưới toàn cầu vượt trội, nhưng mức học phí là rào cản lớn cần cân nhắc."
                        : "Thế mạnh nghiên cứu hàn lâm và lý thuyết nền tảng, phù hợp nếu hướng tới học cao học hoặc viện nghiên cứu."}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[10px] bg-emerald-50/80 p-3.5 border border-emerald-200">
                <strong className="text-emerald-950 font-bold block mb-1">
                  3. Lời khuyên hành động tiếp theo:
                </strong>
                <p className="text-emerald-900">
                  Đăng ký cả hai nhóm nguyện vọng: Đặt <strong>{compareUnis[0]?.short_name || "HCMUTE"}</strong> ở nhóm nguyện vọng trọng tâm (Target) và chuẩn bị hồ sơ xét tuyển sớm theo phương thức ĐGNL ĐHQG-HCM để tối đa hóa cơ hội trúng tuyển.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <button
                onClick={() => {
                  setIsAiAnalysisOpen(false);
                  onAskCoachAboutItem(compareUnis.map((u) => u.short_name).join(" và "));
                }}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition"
              >
                <IconBot className="w-3.5 h-3.5" />
                <span>Tiếp tục thảo luận sâu với AI Coach</span>
              </button>
              <button
                onClick={() => setIsAiAnalysisOpen(false)}
                className="rounded-[10px] border border-line bg-surface px-4 py-2 text-xs font-bold text-ink-700 hover:bg-surface-soft"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {onNavigateView && (
        <SmartNextAction
          currentView="university_explorer"
          onNavigate={(view) => {
            if (onNavigateView) onNavigateView(view || "compare");
          }}
          onAskCoach={() => onAskCoachAboutItem(filteredUnis[0]?.university_name || "trường đại học")}
        />
      )}
    </div>
  );
}
