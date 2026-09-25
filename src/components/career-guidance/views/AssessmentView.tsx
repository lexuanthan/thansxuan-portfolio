"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  StudentCareerProfile,
  InterestDimension,
  CapabilityDimension,
  CareerValue,
  NegativePreference,
  FutureAspiration
} from "@/lib/career-guidance/types";
import {
  SCENARIO_QUESTIONS,
  CAREER_VALUES_LIST,
  NEGATIVE_PREFERENCES_LIST,
  FUTURE_ASPIRATIONS_LIST
} from "@/lib/career-guidance/questionsData";
import { deriveCareerArchetype, detectProfileContradictions } from "@/lib/career-guidance/matchingEngine";
import {
  HcmuteBrandMark,
  IconGraduationCap,
  IconSparkles,
  IconTarget,
  IconBriefcase,
  IconAward,
  IconAlertCircle,
  IconCompass,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconZap,
  IconX,
  IconBot,
  IconClock,
  IconCheckCircle,
  IconLightbulb,
  IconShield,
  IconChevronRight
} from "../common/CareerIcons";

/* =========================================================================
   HCMUTE AI CAREER GUIDANCE PLATFORM v6.0
   MODULE PROMPT 02 — ADAPTIVE ASSESSMENT
   Interactive Career Discovery Journey
   ========================================================================= */

export interface AssessmentViewProps {
  initialProfile: StudentCareerProfile;
  onSaveProfile: (profile: StudentCareerProfile) => void;
  onGoToProfile?: () => void;
  onGoToMatches: () => void;
  onNavigateView?: (view: any) => void;
}

export type StageId =
  | "academic"
  | "interests"
  | "scenarios"
  | "workstyle"
  | "values"
  | "negatives"
  | "aspirations";

export interface StageConfig {
  id: StageId;
  stageNumber: number;
  label: string;
  icon: React.ReactNode;
  questionCountLabel: string;
  timeEstimate: string;
  insightTeaser: string;
}

export const ASSESSMENT_STAGES: StageConfig[] = [
  {
    id: "academic",
    stageNumber: 1,
    label: "Học lực",
    icon: <IconGraduationCap className="w-4 h-4" />,
    questionCountLabel: "8 Môn học trọng tâm",
    timeEstimate: "1 phút",
    insightTeaser: "Đo lường năng lực học thuật & tổ hợp xét tuyển HCMUTE"
  },
  {
    id: "interests",
    stageNumber: 2,
    label: "Sở thích",
    icon: <IconSparkles className="w-4 h-4" />,
    questionCountLabel: "15 Chiều cảm hứng",
    timeEstimate: "2 phút",
    insightTeaser: "Giải mã nguồn cảm hứng tự nhiên qua mô hình RIASEC nâng cao"
  },
  {
    id: "scenarios",
    stageNumber: 3,
    label: "Tình huống",
    icon: <IconTarget className="w-4 h-4" />,
    questionCountLabel: "3 Thử thách thực tế",
    timeEstimate: "2 phút",
    insightTeaser: "Quan sát phản xạ tư duy & giải quyết vấn đề dưới áp lực"
  },
  {
    id: "workstyle",
    stageNumber: 4,
    label: "Phong cách",
    icon: <IconBriefcase className="w-4 h-4" />,
    questionCountLabel: "7 Trục đối lập",
    timeEstimate: "1.5 phút",
    insightTeaser: "Xác định môi trường và phương thức làm việc tối ưu"
  },
  {
    id: "values",
    stageNumber: 5,
    label: "Giá trị",
    icon: <IconAward className="w-4 h-4" />,
    questionCountLabel: "Top 5/12 Giá trị",
    timeEstimate: "1.5 phút",
    insightTeaser: "Kim chỉ nam định hình sự gắn kết nghề nghiệp suốt 10-20 năm"
  },
  {
    id: "negatives",
    stageNumber: 6,
    label: "Né tránh",
    icon: <IconAlertCircle className="w-4 h-4" />,
    questionCountLabel: "10 Yếu tố rủi ro",
    timeEstimate: "1 phút",
    insightTeaser: "Lọc bỏ điều kiện bất lợi để phòng ngừa kiệt sức (Deal Breakers)"
  },
  {
    id: "aspirations",
    stageNumber: 7,
    label: "Mục tiêu",
    icon: <IconCompass className="w-4 h-4" />,
    questionCountLabel: "8 Hình mẫu 10 năm",
    timeEstimate: "1 phút",
    insightTeaser: "Định vị vị thế & hình mẫu sự nghiệp bạn muốn tạo dựng"
  }
];

const AUTOSAVE_STORAGE_KEY = "cg_assessment_draft_v6";

export function AssessmentView({
  initialProfile,
  onSaveProfile,
  onGoToProfile,
  onGoToMatches,
  onNavigateView
}: AssessmentViewProps) {
  const [currentTab, setCurrentTab] = useState<StageId>("academic");
  const [profile, setProfile] = useState<StudentCareerProfile>(initialProfile);
  const [lastSavedTime, setLastSavedTime] = useState<string>("vừa xong");
  const [signalFlash, setSignalFlash] = useState<string | null>(null);
  const [showResultReveal, setShowResultReveal] = useState<boolean>(false);
  const [mobileCoachOpen, setMobileCoachOpen] = useState<boolean>(false);

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile && Object.keys(parsed.profile).length > 0) {
          setProfile(parsed.profile);
        }
        if (parsed.currentTab) {
          setCurrentTab(parsed.currentTab);
        }
        if (parsed.lastSaved) {
          const d = new Date(parsed.lastSaved);
          setLastSavedTime(
            d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
          );
        }
      }
    } catch (e) {
      console.error("Failed to restore assessment draft", e);
    }
  }, []);

  // Autosave when profile or stage changes
  useEffect(() => {
    try {
      const payload = {
        profile,
        currentTab,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(payload));
      const now = new Date();
      setLastSavedTime(
        now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    } catch (e) {
      console.error("Autosave error", e);
    }
  }, [profile, currentTab]);

  const currentStageIndex = ASSESSMENT_STAGES.findIndex((s) => s.id === currentTab);
  const activeStage = ASSESSMENT_STAGES[currentStageIndex] || ASSESSMENT_STAGES[0];

  // Feedback trigger
  const triggerSignalFeedback = (msg = "+1 Tín hiệu Career Signal") => {
    setSignalFlash(msg);
    setTimeout(() => setSignalFlash(null), 1800);
  };

  // Calculate dynamic unlocked insights count
  const unlockedInsightsCount = useMemo(() => {
    let count = 0;
    // Academic count
    count += Object.keys(profile.academic_profile || {}).filter(
      (k) => (profile.academic_profile as any)[k] > 0
    ).length;
    // Interests count
    count += Object.values(profile.interests || {}).filter((v) => v > 50).length;
    // Values
    count += (profile.ranked_values || []).length;
    // Workstyle
    count += Object.values(profile.work_style || {}).filter((v) => v !== 0).length;
    // Negatives
    count += (profile.negative_preferences || []).length;
    // Aspirations
    count += (profile.future_aspirations || []).length;
    return Math.max(1, count);
  }, [profile]);

  // Overall progress percentage
  const progressPercent = useMemo(() => {
    let p = 0;
    if (Object.keys(profile.academic_profile || {}).length >= 4) p += 15;
    if (Object.values(profile.interests || {}).some((v) => v > 50)) p += 20;
    if ((profile.ranked_values || []).length === 5) p += 20;
    else p += (profile.ranked_values || []).length * 3.5;
    if (Object.values(profile.work_style || {}).some((v) => v !== 0)) p += 15;
    if ((profile.negative_preferences || []).length > 0) p += 15;
    if ((profile.future_aspirations || []).length > 0) p += 15;
    return Math.min(100, Math.round(p));
  }, [profile]);

  // Stage completion verification
  const isStageCompleted = (stageId: StageId): boolean => {
    switch (stageId) {
      case "academic":
        return Object.keys(profile.academic_profile || {}).length >= 4;
      case "interests":
        return Object.values(profile.interests || {}).some((v) => v > 50);
      case "scenarios":
        return true;
      case "workstyle":
        return Object.values(profile.work_style || {}).some((v) => v !== 0);
      case "values":
        return (profile.ranked_values || []).length >= 3;
      case "negatives":
        return (profile.negative_preferences || []).length > 0;
      case "aspirations":
        return (profile.future_aspirations || []).length > 0;
      default:
        return false;
    }
  };

  // Handlers for state updates
  const handleUpdateAcademic = (key: keyof StudentCareerProfile["academic_profile"], val: number) => {
    setProfile((prev) => ({
      ...prev,
      academic_profile: {
        ...prev.academic_profile,
        [key]: val
      }
    }));
    triggerSignalFeedback(`Đã lưu điểm môn ${key.replace("_score", "")}`);
  };

  const handleUpdateInterest = (dim: InterestDimension, val: number) => {
    setProfile((prev) => ({
      ...prev,
      interests: {
        ...prev.interests,
        [dim]: val
      }
    }));
    triggerSignalFeedback(`Đã cập nhật hứng thú ${dim}`);
  };

  const handleSelectScenarioOption = (scenarioId: string, optionId: string) => {
    const q = SCENARIO_QUESTIONS.find((item) => item.id === scenarioId);
    if (!q) return;
    const opt = q.options.find((o) => o.id === optionId);
    if (!opt) return;

    setProfile((prev) => {
      const nextInterests = { ...prev.interests };
      const nextCaps = { ...prev.capabilities };

      if (opt.effects.interests) {
        for (const [k, v] of Object.entries(opt.effects.interests)) {
          const dim = k as InterestDimension;
          nextInterests[dim] = Math.min(100, (nextInterests[dim] ?? 50) + (v ?? 0));
        }
      }

      if (opt.effects.capabilities) {
        for (const [k, v] of Object.entries(opt.effects.capabilities)) {
          const dim = k as CapabilityDimension;
          nextCaps[dim] = Math.min(100, (nextCaps[dim] ?? 50) + (v ?? 0));
        }
      }

      return {
        ...prev,
        interests: nextInterests,
        capabilities: nextCaps
      };
    });
    triggerSignalFeedback("Đã phân tích phản xạ tình huống!");
  };

  const handleToggleValue = (val: CareerValue) => {
    setProfile((prev) => {
      let nextRanked = [...prev.ranked_values];
      if (nextRanked.includes(val)) {
        nextRanked = nextRanked.filter((item) => item !== val);
      } else {
        if (nextRanked.length >= 5) {
          nextRanked.shift();
        }
        nextRanked.push(val);
      }

      const weights = [100, 85, 70, 55, 40];
      const nextWeights: Record<CareerValue, number> = { ...prev.career_values_weight };
      nextRanked.forEach((v, idx) => {
        nextWeights[v] = weights[idx] ?? 40;
      });

      return {
        ...prev,
        ranked_values: nextRanked,
        career_values_weight: nextWeights
      };
    });
    triggerSignalFeedback("Đã cập nhật thứ tự ưu tiên giá trị");
  };

  const handleToggleNegative = (neg: NegativePreference) => {
    setProfile((prev) => {
      const exists = prev.negative_preferences.includes(neg);
      return {
        ...prev,
        negative_preferences: exists
          ? prev.negative_preferences.filter((item) => item !== neg)
          : [...prev.negative_preferences, neg]
      };
    });
    triggerSignalFeedback("Đã ghi nhận tiêu chí né tránh");
  };

  const handleToggleAspiration = (asp: FutureAspiration) => {
    setProfile((prev) => {
      const exists = prev.future_aspirations.includes(asp);
      return {
        ...prev,
        future_aspirations: exists
          ? prev.future_aspirations.filter((item) => item !== asp)
          : [...prev.future_aspirations, asp]
      };
    });
    triggerSignalFeedback("Đã ghi nhận mục tiêu 10 năm");
  };

  const handleNextStage = () => {
    if (currentStageIndex < ASSESSMENT_STAGES.length - 1) {
      setCurrentTab(ASSESSMENT_STAGES[currentStageIndex + 1].id);
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (_) {}
    } else {
      handleCompleteAssessment();
    }
  };

  const handlePrevStage = () => {
    if (currentStageIndex > 0) {
      setCurrentTab(ASSESSMENT_STAGES[currentStageIndex - 1].id);
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (_) {}
    }
  };

  const handleCompleteAssessment = () => {
    const finalProfile = { ...profile, updated_at: new Date().toISOString() };
    finalProfile.profile_archetype = deriveCareerArchetype(finalProfile);
    finalProfile.contradictions = detectProfileContradictions(finalProfile);
    onSaveProfile(finalProfile);
    setProfile(finalProfile);
    setShowResultReveal(true);
  };

  // AI Coach Stage-Specific Contextual Content (Early observation without premature judgment)
  const aiCoachObservations = useMemo(() => {
    switch (currentTab) {
      case "academic":
        return {
          hypothesis:
            "Dữ liệu hiện tại cho thấy xu hướng ban đầu: Năng lực học thuật ở các môn tự nhiên (Toán, Lý, Tin) đóng vai trò nòng cốt để đối chiếu với điểm chuẩn các ngành Kỹ thuật - Công nghệ tại HCMUTE.",
          evidenceCount: `${Object.keys(profile.academic_profile || {}).length} môn học đã ghi nhận`,
          suggestedExploration:
            "Bạn có thể nhập điểm trung bình học bạ hoặc điểm thi thử THPT dự kiến để hệ thống dự phóng cơ hội trúng tuyển sát thực tế nhất."
        };
      case "interests":
        return {
          hypothesis:
            "Dữ liệu hiện tại cho thấy xu hướng ban đầu: Các lĩnh vực bạn chấm trên 70 điểm phản ánh nguồn năng lượng học tập tự nhiên, ít bị tác động bởi áp lực từ bên ngoài.",
          evidenceCount: `${Object.values(profile.interests || {}).filter((v) => v >= 60).length} lĩnh vực có tín hiệu mạnh`,
          suggestedExploration:
            "Hãy đánh giá dựa trên mức độ tò mò tự thân khi bạn rảnh rỗi, thay vì chọn theo sự hấp dẫn ngắn hạn của thị trường."
        };
      case "scenarios":
        return {
          hypothesis:
            "Dữ liệu hiện tại cho thấy xu hướng ban đầu: Phản xạ hành vi của bạn trong các tình huống thực tế hé lộ năng lực giải quyết vấn đề lõi và xu hướng đảm nhận vai trò trong đội nhóm.",
          evidenceCount: "3 kịch bản tình huống đa chiều",
          suggestedExploration:
            "Không có phương án nào là hoàn hảo. Mỗi cách tiếp cận đều mở ra một ngách chuyên môn độc bản tương ứng."
        };
      case "workstyle":
        return {
          hypothesis:
            "Dữ liệu hiện tại cho thấy xu hướng ban đầu: Sự phân hóa giữa làm việc độc lập và làm việc nhóm, cũng như giữa môi trường ổn định hay linh hoạt phản ánh văn hóa doanh nghiệp bạn sẽ thăng hoa.",
          evidenceCount: "7 trục xu hướng tư duy",
          suggestedExploration:
            "Một người giỏi chuyên môn nhưng đặt sai môi trường làm việc sẽ rất dễ rơi vào tình trạng quá tải hoặc mất động lực."
        };
      case "values":
        return {
          hypothesis:
            "Dữ liệu hiện tại cho thấy xu hướng ban đầu: 5 giá trị bạn ưu tiên hàng đầu là kim chỉ nam tối thượng để giữ vững sự kiên định trong các bước ngoặt sự nghiệp quan trọng.",
          evidenceCount: `${profile.ranked_values.length}/5 giá trị đã xếp hạng`,
          suggestedExploration:
            "Hãy thử hình dung khi đứng trước lời mời lương cao nhưng phải làm thêm giờ liên tục, giá trị nào của bạn sẽ lên tiếng?"
        };
      case "negatives":
        return {
          hypothesis:
            "Dữ liệu hiện tại cho thấy xu hướng ban đầu: Việc xác lập rõ các 'Deal Breakers' giúp thuật toán bảo vệ bạn khỏi các nghề có nguy cơ gây kiệt sức sớm.",
          evidenceCount: `${profile.negative_preferences.length} tiêu chí né tránh`,
          suggestedExploration:
            "Loại trừ điều mình ghét là cách nhanh nhất và an toàn nhất để thu hẹp phạm vi lựa chọn nghề nghiệp."
        };
      case "aspirations":
        return {
          hypothesis:
            "Dữ liệu hiện tại cho thấy xu hướng ban đầu: Hình mẫu bạn hướng tới sau 10 năm phản ánh vị thế và dấu ấn cá nhân bạn muốn đóng góp cho xã hội.",
          evidenceCount: `${profile.future_aspirations.length} hình mẫu tương lai`,
          suggestedExploration:
            "Mỗi hình mẫu đòi hỏi chiến lược tích lũy kỹ năng và lựa chọn mạng lưới cựu sinh viên HCMUTE tương ứng."
        };
    }
  }, [currentTab, profile]);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* =====================================================================
          1. CONTEXTUAL HERO HEADER (Module Prompt 02 - Requirement 2)
          Compact, non-intrusive, academic branding, continuous autosave state
          ===================================================================== */}
      <section className="rounded-[14px] border border-line bg-surface p-4 sm:p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-brand-600 text-white text-xs font-black shrink-0">
                <IconCompass className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-900 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                Stage {activeStage.stageNumber}/7 • {activeStage.label}
              </span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                <IconCheck className="w-3 h-3 text-emerald-600" />
                <span>Đã lưu tự động ({lastSavedTime})</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-ink-900 tracking-tight">
              Khám phá & Dựng Hồ sơ Career DNA
            </h1>

            <p className="text-xs text-ink-500 leading-relaxed">
              Hành trình giải mã năng lực, phong cách tư duy và giá trị để định hình chân dung nghề nghiệp chuẩn xác tại HCMUTE.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-ink-400 block uppercase">Tiến độ tổng thể</span>
              <span className="text-xl font-black text-brand-700">{progressPercent}%</span>
            </div>

            <div className="rounded-[10px] border border-line bg-surface-soft px-3 py-2 text-center">
              <span className="text-[10px] font-bold text-ink-500 block uppercase">Insight mở khóa</span>
              <span className="text-sm font-black text-ink-900">{unlockedInsightsCount}</span>
            </div>

            <button
              onClick={handleCompleteAssessment}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-[10px] bg-brand-600 px-4 py-2 text-xs font-extrabold text-white shadow-brand hover:bg-brand-700 transition cursor-pointer"
            >
              <span>Xem kết quả</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Journey Progress Bar */}
        <div className="mt-4 space-y-1.5 border-t border-line pt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft border border-line">
            <div
              className="h-full bg-brand-600 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-ink-500 font-medium">
            <span>
              Đang ở Chặng 0{activeStage.stageNumber}: {activeStage.label} ({activeStage.questionCountLabel})
            </span>
            <span className="text-brand-700 font-bold">
              {progressPercent === 100 ? "Sẵn sàng khởi tạo Career DNA" : `${100 - progressPercent}% còn lại`}
            </span>
          </div>
        </div>

        {/* 7 Stage Navigation Tabs (Horizontal Scrollable) */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-2">
          {ASSESSMENT_STAGES.map((st) => {
            const isActive = currentTab === st.id;
            const isCompleted = isStageCompleted(st.id);

            return (
              <button
                key={st.id}
                data-testid={`stage-tab-${st.id}`}
                onClick={() => setCurrentTab(st.id)}
                className={`flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  isActive
                    ? "bg-brand-600 text-white border-brand-600 shadow-xs"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                    : "bg-surface-soft text-ink-600 border-line hover:border-brand-200 hover:text-ink-900"
                }`}
              >
                <span className="shrink-0">{st.icon}</span>
                <span>{st.label}</span>
                {isCompleted && !isActive && (
                  <IconCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Floating Signal Flash Indicator */}
      {signalFlash && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 rounded-[10px] bg-brand-700 text-white px-4 py-2 text-xs font-black shadow-lift">
            <IconZap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{signalFlash}</span>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. MAIN CONTENT AREA WITH 2-COLUMN LAYOUT (Question Form + AI Coach Panel)
          ===================================================================== */}
      <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Stage Questions (8 Cols on Desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-[14px] border border-line bg-surface p-5 sm:p-7 shadow-soft space-y-6">
            {/* Stage Title & Purpose */}
            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 block">
                  Chặng 0{activeStage.stageNumber} • {activeStage.questionCountLabel}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-ink-900 mt-0.5">
                  {activeStage.label}
                </h2>
                <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                  {activeStage.insightTeaser}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-ink-500 bg-surface-soft px-2.5 py-1 rounded-[6px] border border-line shrink-0">
                <IconClock className="w-3.5 h-3.5 text-ink-400" />
                <span>~{activeStage.timeEstimate}</span>
              </div>
            </div>

            {/* STAGE 1: HỌC LỰC (Academic Sliders) */}
            {currentTab === "academic" && (
              <div className="space-y-4">
                <p className="text-xs text-ink-600 leading-relaxed">
                  Điều chỉnh điểm trung bình môn học gần nhất (hoặc dự kiến thi THPT / ĐGNL ĐHQG-HCM). Thang điểm 10.
                </p>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  {[
                    { key: "math_score" as const, label: "Toán học (Math)", min: 4, max: 10, step: 0.1 },
                    { key: "english_score" as const, label: "Tiếng Anh (English)", min: 4, max: 10, step: 0.1 },
                    { key: "literature_score" as const, label: "Ngữ văn (Literature)", min: 4, max: 10, step: 0.1 },
                    { key: "informatics_score" as const, label: "Tin học / Lập trình", min: 4, max: 10, step: 0.1 },
                    { key: "physics_score" as const, label: "Vật lý (Physics)", min: 4, max: 10, step: 0.1 },
                    { key: "chemistry_score" as const, label: "Hóa học (Chemistry)", min: 4, max: 10, step: 0.1 },
                    { key: "biology_score" as const, label: "Sinh học (Biology)", min: 4, max: 10, step: 0.1 },
                    { key: "social_sciences_score" as const, label: "Khoa học Xã hội (Sử/Địa/GDCD)", min: 4, max: 10, step: 0.1 }
                  ].map((subj) => {
                    const currentVal = profile.academic_profile[subj.key] ?? 7.0;
                    const isHigh = currentVal >= 8.0;

                    return (
                      <div
                        key={subj.key}
                        className={`rounded-[12px] border p-4 transition-all ${
                          isHigh
                            ? "border-accent-red-600 bg-accent-red-50/40 shadow-soft ring-1 ring-accent-red-500/20"
                            : "border-line bg-surface hover:border-brand-300"
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-bold text-ink-900 mb-2">
                          <span className="flex items-center gap-1.5">
                            {isHigh && <IconCheck className="w-3.5 h-3.5 text-accent-red-600" />}
                            <span>{subj.label}</span>
                          </span>
                          <span className="text-brand-700 font-black text-base">{currentVal.toFixed(1)}</span>
                        </div>

                        <input
                          type="range"
                          min={subj.min}
                          max={subj.max}
                          step={subj.step}
                          value={currentVal}
                          onChange={(e) => handleUpdateAcademic(subj.key, parseFloat(e.target.value))}
                          className="w-full accent-brand-600 cursor-pointer"
                        />

                        <div className="flex justify-between text-[10px] text-ink-400 mt-1 font-medium">
                          <span>Trung bình (5.0)</span>
                          <span>Giỏi (8.0+)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STAGE 2: SỞ THÍCH (Interests Sliders 0-100) */}
            {currentTab === "interests" && (
              <div className="space-y-4">
                <p className="text-xs text-ink-600 leading-relaxed">
                  Kéo thanh trượt để thể hiện mức độ tò mò, hứng thú tự nhiên của bạn đối với từng mảng nội dung (0 - 100).
                </p>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  {[
                    { dim: "technology" as InterestDimension, label: "Công nghệ & Máy tính" },
                    { dim: "data" as InterestDimension, label: "Dữ liệu & Số liệu" },
                    { dim: "engineering" as InterestDimension, label: "Kỹ thuật, Cơ khí & Robot" },
                    { dim: "business" as InterestDimension, label: "Kinh doanh & Thương mại" },
                    { dim: "finance" as InterestDimension, label: "Tài chính & Đầu tư" },
                    { dim: "design" as InterestDimension, label: "Thiết kế & Giao diện số" },
                    { dim: "arts" as InterestDimension, label: "Nghệ thuật & Sáng tác" },
                    { dim: "communication" as InterestDimension, label: "Truyền thông & Tiếp thị" },
                    { dim: "education" as InterestDimension, label: "Giáo dục & Đào tạo" },
                    { dim: "healthcare" as InterestDimension, label: "Y tế & Chăm sóc sức khỏe" },
                    { dim: "law" as InterestDimension, label: "Luật pháp & Chính sách" },
                    { dim: "social_impact" as InterestDimension, label: "Tác động xã hội & Thiện nguyện" },
                    { dim: "nature" as InterestDimension, label: "Tự nhiên, Môi trường & Sinh thái" },
                    { dim: "science" as InterestDimension, label: "Khoa học & Nghiên cứu lý thuyết" },
                    { dim: "entrepreneurship" as InterestDimension, label: "Khởi nghiệp & Xây dựng mô hình" }
                  ].map((item) => {
                    const val = profile.interests[item.dim] ?? 50;
                    const isPassionate = val >= 75;

                    return (
                      <div
                        key={item.dim}
                        className={`rounded-[12px] border p-4 transition-all ${
                          isPassionate
                            ? "border-accent-red-600 bg-accent-red-50/40 shadow-soft ring-1 ring-accent-red-500/20"
                            : "border-line bg-surface hover:border-brand-300"
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-bold text-ink-900 mb-2">
                          <span className="flex items-center gap-1.5">
                            {isPassionate && <IconCheck className="w-3.5 h-3.5 text-accent-red-600" />}
                            <span>{item.label}</span>
                          </span>
                          <span className="text-brand-700 font-extrabold">{val}/100</span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={val}
                          onChange={(e) => handleUpdateInterest(item.dim, parseInt(e.target.value, 10))}
                          className="w-full accent-brand-600 cursor-pointer"
                        />

                        <div className="flex justify-between text-[10px] text-ink-400 mt-1">
                          <span>Ít hứng thú</span>
                          <span>Đam mê cao</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STAGE 3: TÌNH HUỐNG (Scenario Decision Option Cards) */}
            {currentTab === "scenarios" && (
              <div className="space-y-6">
                <p className="text-xs text-ink-600 leading-relaxed">
                  Chọn phương án phản ánh đúng nhất phản xạ tự nhiên của bạn trong các tình huống thực tiễn.
                </p>

                <div className="space-y-6">
                  {SCENARIO_QUESTIONS.map((sq, idx) => (
                    <div key={sq.id} className="rounded-[12px] border border-line bg-surface-soft p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-brand-100 text-brand-900 font-bold px-2 py-0.5 text-xs">
                          Tình huống 0{idx + 1}
                        </span>
                        <h3 className="font-extrabold text-ink-900 text-sm">{sq.title}</h3>
                      </div>

                      <div className="rounded-[10px] bg-surface p-3.5 border border-line italic text-xs text-ink-700 leading-relaxed">
                        &ldquo;{sq.scenario}&rdquo;
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {sq.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectScenarioOption(sq.id, opt.id)}
                            className="rounded-[12px] border border-line bg-surface p-4 text-left hover:border-brand-400 hover:bg-brand-50/30 transition shadow-xs cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-ink-900 text-xs group-hover:text-brand-900">
                                {opt.text}
                              </h4>
                              <IconChevronRight className="w-4 h-4 text-ink-400 group-hover:text-brand-600 shrink-0" />
                            </div>
                            <p className="text-[11px] text-ink-500 mt-1.5 leading-snug">{opt.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 4: PHONG CÁCH (Workstyle Forced Choice Pairwise Sliders) */}
            {currentTab === "workstyle" && (
              <div className="space-y-4">
                <p className="text-xs text-ink-600 leading-relaxed">
                  Kéo thanh trượt giữa 2 cực đối lập (-100 đến +100) để xác định xu hướng phong cách tư duy của bạn.
                </p>

                <div className="space-y-3.5">
                  {[
                    {
                      key: "independent_vs_team" as const,
                      left: "Độc lập một mình (-100)",
                      right: "Đội nhóm tương tác (+100)",
                      title: "Hình thức làm việc"
                    },
                    {
                      key: "stable_vs_dynamic" as const,
                      left: "Ổn định, an toàn (-100)",
                      right: "Linh hoạt, nhiều biến động (+100)",
                      title: "Mức độ biến đổi môi trường"
                    },
                    {
                      key: "structured_vs_flexible" as const,
                      left: "Quy trình chặt chẽ (-100)",
                      right: "Tự do sáng tạo (+100)",
                      title: "Tính khuôn mẫu quy định"
                    },
                    {
                      key: "deep_work_vs_multitask" as const,
                      left: "Tập trung sâu 1 việc (-100)",
                      right: "Đa nhiệm linh hoạt (+100)",
                      title: "Cách phân bổ sự tập trung"
                    },
                    {
                      key: "people_vs_system" as const,
                      left: "Làm việc với máy / Dữ liệu (-100)",
                      right: "Tương tác với con người (+100)",
                      title: "Đối tượng tương tác chính"
                    },
                    {
                      key: "theory_vs_practice" as const,
                      left: "Lý thuyết & Nghiên cứu (-100)",
                      right: "Thực hành ứng dụng (+100)",
                      title: "Định hướng tiếp cận"
                    },
                    {
                      key: "detail_vs_big_picture" as const,
                      left: "Chi tiết tỉ mỉ (-100)",
                      right: "Bức tranh tổng thể (+100)",
                      title: "Góc nhìn công việc"
                    }
                  ].map((ws) => {
                    const val = profile.work_style[ws.key] ?? 0;
                    return (
                      <div key={ws.key} className="rounded-[12px] border border-line bg-surface-soft p-4">
                        <div className="flex justify-between items-center text-xs font-bold text-ink-900 mb-1">
                          <span>{ws.title}</span>
                          <span className="text-brand-700 font-extrabold">{val > 0 ? `+${val}` : val}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-ink-500 mb-2">
                          <span>{ws.left}</span>
                          <span>{ws.right}</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          step="10"
                          value={val}
                          onChange={(e) => {
                            const newV = parseInt(e.target.value, 10);
                            setProfile((prev) => ({
                              ...prev,
                              work_style: { ...prev.work_style, [ws.key]: newV }
                            }));
                            triggerSignalFeedback(`Đã cập nhật ${ws.title}`);
                          }}
                          className="w-full accent-brand-600 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STAGE 5: GIÁ TRỊ (Values Ranking - HCMUTE Red Accent Selection Cards) */}
            {currentTab === "values" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Chọn đúng 5 giá trị nghề nghiệp bạn coi trọng nhất. Thứ tự click sẽ tương ứng với thứ hạng ưu tiên (Hạng 1 đến Hạng 5).
                  </p>
                  <span className="rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-black text-brand-900 shrink-0">
                    Đã chọn: {profile.ranked_values.length} / 5
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {CAREER_VALUES_LIST.map((valItem) => {
                    const rankIndex = profile.ranked_values.indexOf(valItem.id);
                    const isSelected = rankIndex !== -1;

                    return (
                      <button
                        key={valItem.id}
                        type="button"
                        onClick={() => handleToggleValue(valItem.id)}
                        className={`flex items-start gap-3 rounded-[12px] border p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent-red-600 bg-accent-red-50/50 shadow-soft ring-1 ring-accent-red-500/30"
                            : "border-line bg-surface hover:border-brand-300 hover:bg-surface-soft"
                        }`}
                      >
                        <span className="text-xl shrink-0">{valItem.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-extrabold text-ink-900 text-xs sm:text-sm">
                              {valItem.title}
                            </h3>
                            {isSelected && (
                              <span className="rounded bg-accent-red-600 px-2 py-0.5 text-[10px] font-black text-white shrink-0">
                                Hạng {rankIndex + 1}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">
                            {valItem.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STAGE 6: NÉ TRÁNH (Negative Preferences Warning Cards) */}
            {currentTab === "negatives" && (
              <div className="space-y-4">
                <p className="text-xs text-ink-600 leading-relaxed">
                  Chọn những điều kiện làm việc bạn cảm thấy tuyệt đối không muốn vướng phải (Thuật toán sẽ tự động phạt điểm các nghề có đặc thù này).
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {NEGATIVE_PREFERENCES_LIST.map((item) => {
                    const isSelected = profile.negative_preferences.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleNegative(item.id)}
                        className={`flex items-start justify-between gap-3 rounded-[12px] border p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent-red-600 bg-accent-red-50/50 ring-1 ring-accent-red-500/30"
                            : "border-line bg-surface hover:border-accent-red-300"
                        }`}
                      >
                        <div>
                          <h3 className="font-bold text-ink-900 text-xs sm:text-sm">{item.title}</h3>
                          <p className="text-[11px] text-ink-500 mt-1 leading-snug">{item.desc}</p>
                        </div>
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${
                            isSelected
                              ? "border-accent-red-600 bg-accent-red-600 text-white"
                              : "border-line text-transparent"
                          }`}
                        >
                          <IconX className="w-3.5 h-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STAGE 7: MỤC TIÊU (Future Aspirations Cards) */}
            {currentTab === "aspirations" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">Tầm Nhìn & Mục Tiêu 10 Năm (Aspirations)</h3>
                  <p className="text-xs text-ink-600 leading-relaxed mt-0.5">
                    10 năm tới, bạn muốn mọi người nhìn nhận bạn trong vai trò nào nhất?
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {FUTURE_ASPIRATIONS_LIST.map((item) => {
                    const isSelected = profile.future_aspirations.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleAspiration(item.id)}
                        className={`flex items-start gap-3 rounded-[12px] border p-4 text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent-red-600 bg-accent-red-50/50 shadow-soft ring-1 ring-accent-red-500/30"
                            : "border-line bg-surface hover:border-brand-300"
                        }`}
                      >
                        <span className="text-xl shrink-0">{item.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-extrabold text-ink-900 text-xs sm:text-sm">
                            {item.title}
                          </h3>
                          <span className="mt-2 inline-block text-[11px] font-bold text-brand-700">
                            {isSelected ? "✓ Đã chọn mục này" : "+ Chọn mục tiêu"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Stage Navigation Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
              {currentStageIndex > 0 ? (
                <button
                  onClick={handlePrevStage}
                  className="rounded-[10px] border border-line bg-surface px-4 py-2.5 text-xs font-bold text-ink-700 hover:bg-surface-soft transition cursor-pointer flex items-center gap-1.5"
                >
                  <IconArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại Chặng 0{currentStageIndex}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNextStage}
                className="rounded-[10px] bg-brand-600 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-brand hover:bg-brand-700 transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                {currentStageIndex < ASSESSMENT_STAGES.length - 1 ? (
                  <>
                    <span>Tiếp tục: {ASSESSMENT_STAGES[currentStageIndex + 1].label}</span>
                    <IconArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Hoàn tất & Xem Chân dung Career DNA</span>
                    <IconArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Companion Panel on Desktop (4 Cols on Desktop) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-[14px] border border-brand-200/80 bg-gradient-to-br from-brand-50/80 via-surface to-surface p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-brand-600 text-white shadow-xs">
                  <IconBot className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-ink-900">AI Career Coach Đồng Hành</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-ink-500">Phân tích tín hiệu thời gian thực</span>
                </div>
              </div>
            </div>

            {/* AI Early Hypothesis & Contextual Signal */}
            <div className="space-y-3">
              <div className="rounded-[10px] bg-surface p-3.5 border border-line space-y-2">
                <span className="text-[10px] font-black uppercase text-brand-700 block">
                  Xu Hướng Ban Đầu
                </span>
                <p className="text-xs text-ink-700 leading-relaxed italic">
                  &ldquo;{aiCoachObservations.hypothesis}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-ink-500 px-1">
                <span>Bằng chứng thu thập:</span>
                <span className="font-bold text-brand-900">{aiCoachObservations.evidenceCount}</span>
              </div>

              <div className="rounded-[10px] bg-amber-50/60 border border-amber-200 p-3 space-y-1">
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900">
                  <IconLightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gợi ý tự vấn:</span>
                </div>
                <p className="text-[11px] text-ink-600 leading-relaxed">
                  {aiCoachObservations.suggestedExploration}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigateView && onNavigateView("coach")}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-brand-200 bg-surface py-2 text-xs font-bold text-brand-900 hover:bg-brand-50 transition cursor-pointer"
            >
              <IconBot className="w-3.5 h-3.5 text-brand-600" />
              <span>Mở rộng đối thoại với AI Coach</span>
            </button>
          </div>
        </aside>
      </div>

      {/* =====================================================================
          3. RESULT REVEAL MODAL / VIEW (Module Prompt 02 - Requirement 8 & 9)
          Appears upon completing all 7 stages
          ===================================================================== */}
      {showResultReveal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-[16px] border border-line bg-surface p-6 sm:p-8 shadow-lift space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <HcmuteBrandMark className="w-10 h-10 shrink-0" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-900 bg-brand-100 px-2 py-0.5 rounded">
                    Career Profile Generated • Hoàn Tất Đánh Giá
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-ink-900 mt-1">
                    Chân Dung Career DNA Của Bạn Đã Sẵn Sàng!
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setShowResultReveal(false)}
                className="p-1 rounded-full text-ink-400 hover:text-ink-900 cursor-pointer"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Archetype & Core Signals Hero */}
            <div className="rounded-[14px] bg-gradient-to-br from-brand-50/80 via-surface to-surface border border-brand-200 p-5 space-y-4">
              <div>
                <span className="text-xs font-bold text-brand-700 block">Hình mẫu tư duy chủ đạo:</span>
                <h3 className="text-xl font-black text-brand-950 mt-0.5">
                  {profile.profile_archetype?.title || "Nhà Phân Tích Dữ Liệu & Chiến Lược"}
                </h3>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  {profile.profile_archetype?.description || profile.profile_archetype?.tagline}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 pt-2">
                <div className="rounded-[10px] bg-emerald-50 border border-emerald-200 p-3">
                  <span className="text-[10px] font-black uppercase text-emerald-800 block">
                    Thế mạnh nổi trội
                  </span>
                  <p className="text-xs font-bold text-ink-900 mt-1">
                    {profile.profile_archetype?.core_strengths?.slice(0, 2).join(" • ") ||
                      "Tư duy phân tích • Logic"}
                  </p>
                </div>

                <div className="rounded-[10px] bg-brand-50 border border-brand-200 p-3">
                  <span className="text-[10px] font-black uppercase text-brand-800 block">
                    Động lực cốt lõi
                  </span>
                  <p className="text-xs font-bold text-ink-900 mt-1">
                    {profile.ranked_values?.[0] || "Tri thức & Học hỏi"}
                  </p>
                </div>

                <div className="rounded-[10px] bg-amber-50 border border-amber-200 p-3">
                  <span className="text-[10px] font-black uppercase text-amber-800 block">
                    Điểm mù cần lưu ý
                  </span>
                  <p className="text-xs font-bold text-ink-900 mt-1">
                    {profile.profile_archetype?.potential_blindspots?.[0] || "Dễ sa vào chi tiết lý thuyết"}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Coach Summary Note */}
            <div className="rounded-[12px] border border-line bg-surface-soft p-4 flex items-start gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shrink-0 shadow-xs">
                <IconBot className="w-4 h-4" />
              </span>
              <p className="text-xs text-ink-700 leading-relaxed italic">
                &ldquo;Dữ liệu của bạn đã được đối sánh thành công với 80+ nghề nghiệp và 60+ ngành đào tạo tại HCMUTE. Bạn đã sẵn sàng để khám phá bản đồ 8 trục năng lực Career DNA và ma trận kết quả so khớp.&rdquo;
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowResultReveal(false);
                  if (onGoToMatches) onGoToMatches();
                  else if (onNavigateView) onNavigateView("matches");
                }}
                className="w-full sm:w-auto rounded-[10px] border border-line bg-surface px-5 py-3 text-xs sm:text-sm font-bold text-ink-700 hover:bg-surface-soft transition cursor-pointer"
              >
                Xem kết quả so khớp nghề
              </button>

              <button
                onClick={() => {
                  setShowResultReveal(false);
                  if (onGoToProfile) onGoToProfile();
                  else if (onNavigateView) onNavigateView("profile");
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] bg-brand-600 px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-brand hover:bg-brand-700 transition cursor-pointer"
              >
                <span>Khám phá Career DNA của tôi</span>
                <IconArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          4. MOBILE STICKY BOTTOM ACTION BAR (Module Prompt 02 - Requirement 10)
          ===================================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md p-3 lg:hidden flex items-center justify-between gap-3 shadow-lift">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-ink-400">
            Chặng 0{activeStage.stageNumber}/7 ({progressPercent}%)
          </span>
          <span className="text-xs font-black text-brand-900">{activeStage.label}</span>
        </div>

        <div className="flex items-center gap-2">
          {currentStageIndex > 0 && (
            <button
              onClick={handlePrevStage}
              className="rounded-[10px] border border-line bg-surface px-3 py-2 text-xs font-bold text-ink-700 min-h-[40px] cursor-pointer"
            >
              Trước
            </button>
          )}

          <button
            onClick={handleNextStage}
            className="rounded-[10px] bg-brand-600 px-4 py-2 text-xs font-black text-white shadow-brand min-h-[40px] flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentStageIndex < ASSESSMENT_STAGES.length - 1 ? "Tiếp tục" : "Xem DNA"}</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
