import React, { useState } from "react";
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

interface AssessmentViewProps {
  initialProfile: StudentCareerProfile;
  onSaveProfile: (profile: StudentCareerProfile) => void;
  onGoToMatches: () => void;
}

export function AssessmentView({
  initialProfile,
  onSaveProfile,
  onGoToMatches
}: AssessmentViewProps) {
  const [currentTab, setCurrentTab] = useState<
    "academic" | "interests" | "scenarios" | "workstyle" | "values" | "negatives" | "aspirations"
  >("academic");

  const [profile, setProfile] = useState<StudentCareerProfile>(initialProfile);

  const tabs = [
    { id: "academic", label: "Học lực", icon: "📐" },
    { id: "interests", label: "Sở thích", icon: "🎨" },
    { id: "scenarios", label: "Tình huống", icon: "🧩" },
    { id: "workstyle", label: "Phong cách", icon: "⚡" },
    { id: "values", label: "Giá trị (Top 5)", icon: "💎" },
    { id: "negatives", label: "Né tránh", icon: "🚫" },
    { id: "aspirations", label: "Mục tiêu", icon: "🚀" }
  ];

  // Tính tiến độ đánh giá
  const progressPercent = Math.min(
    100,
    Math.round(
      (Object.keys(profile.academic_profile).length > 2 ? 15 : 0) +
        (Object.values(profile.interests).some((v) => v > 50) ? 20 : 0) +
        (profile.ranked_values.length === 5 ? 20 : profile.ranked_values.length * 4) +
        (Object.values(profile.work_style).some((v) => v !== 0) ? 15 : 0) +
        (profile.negative_preferences.length > 0 ? 15 : 0) +
        (profile.future_aspirations.length > 0 ? 15 : 0)
    )
  );

  const handleUpdateAcademic = (key: keyof StudentCareerProfile["academic_profile"], val: number) => {
    setProfile((prev) => ({
      ...prev,
      academic_profile: {
        ...prev.academic_profile,
        [key]: val
      }
    }));
  };

  const handleUpdateInterest = (dim: InterestDimension, val: number) => {
    setProfile((prev) => ({
      ...prev,
      interests: {
        ...prev.interests,
        [dim]: val
      }
    }));
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
  };

  const handleToggleValue = (val: CareerValue) => {
    setProfile((prev) => {
      let nextRanked = [...prev.ranked_values];
      if (nextRanked.includes(val)) {
        nextRanked = nextRanked.filter((item) => item !== val);
      } else {
        if (nextRanked.length >= 5) {
          nextRanked.shift(); // Bỏ phần tử đầu nếu đã đủ 5
        }
        nextRanked.push(val);
      }

      // Gán trọng số tương ứng
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
  };

  const handleSaveAndCalculate = () => {
    const finalProfile = { ...profile, updated_at: new Date().toISOString() };
    finalProfile.profile_archetype = deriveCareerArchetype(finalProfile);
    finalProfile.contradictions = detectProfileContradictions(finalProfile);
    onSaveProfile(finalProfile);
    onGoToMatches();
  };

  return (
    <div className="space-y-6">
      {/* Header & Progress Indicator */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-ink-900">
              Khám phá & Dựng Hồ sơ Nghề nghiệp (Adaptive Assessment)
            </h1>
            <p className="text-xs text-ink-500 mt-0.5">
              Hệ thống tổng hợp tín hiệu từ điểm học bạ, sở thích thực chất, phong cách tư duy và giá trị ưu tiên.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-ink-400">Độ hoàn thiện</span>
              <p className="text-sm font-extrabold text-brand-600">{progressPercent}%</p>
            </div>
            <button
              onClick={handleSaveAndCalculate}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-lift hover:bg-brand-700 transition"
            >
              Xem Kết quả Khớp Ngành & Nghề →
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-soft">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dimension Sub-navigation Tabs */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as typeof currentTab)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                currentTab === tab.id
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-surface-soft text-ink-600 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
        {/* 1. Academic Tab */}
        {currentTab === "academic" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink-900">Điểm số & Học lực Thực tế</h2>
              <p className="text-xs text-ink-500">
                Nhập điểm trung bình các môn học gần nhất (thang điểm 10). Dữ liệu này giúp đo lường mức độ tương thích học thuật với các ngành đòi hỏi Toán hoặc Ngôn ngữ cao.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { key: "math_score" as const, label: "Toán học (Math)", min: 4, max: 10, step: 0.1 },
                { key: "literature_score" as const, label: "Ngữ văn (Literature)", min: 4, max: 10, step: 0.1 },
                { key: "english_score" as const, label: "Tiếng Anh (English)", min: 4, max: 10, step: 0.1 },
                { key: "informatics_score" as const, label: "Tin học / Lập trình", min: 4, max: 10, step: 0.1 },
                { key: "physics_score" as const, label: "Vật lý (Physics)", min: 4, max: 10, step: 0.1 },
                { key: "chemistry_score" as const, label: "Hóa học (Chemistry)", min: 4, max: 10, step: 0.1 },
                { key: "biology_score" as const, label: "Sinh học (Biology)", min: 4, max: 10, step: 0.1 },
                { key: "social_sciences_score" as const, label: "Khoa học Xã hội (Sử/Địa/GDCD)", min: 4, max: 10, step: 0.1 }
              ].map((subj) => {
                const currentVal = profile.academic_profile[subj.key] ?? 7.0;
                return (
                  <div key={subj.key} className="rounded-xl border border-line bg-surface-soft p-3.5">
                    <div className="flex justify-between items-center text-xs font-bold text-ink-800 mb-1">
                      <span>{subj.label}</span>
                      <span className="text-brand-600 font-extrabold text-sm">{currentVal.toFixed(1)}</span>
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Interests Tab */}
        {currentTab === "interests" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink-900">15 Chiều Hứng Thú Nghề Nghiệp (0 - 100)</h2>
              <p className="text-xs text-ink-500">
                Kéo thanh trượt để thể hiện mức độ tò mò, hứng thú tự nhiên của bạn đối với từng mảng nội dung.
              </p>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { dim: "technology" as InterestDimension, label: "Công nghệ & Máy tính", icon: "💻" },
                { dim: "data" as InterestDimension, label: "Dữ liệu & Số liệu", icon: "📊" },
                { dim: "engineering" as InterestDimension, label: "Kỹ thuật, Cơ khí & Robot", icon: "⚙️" },
                { dim: "business" as InterestDimension, label: "Kinh doanh & Thương mại", icon: "📈" },
                { dim: "finance" as InterestDimension, label: "Tài chính & Đầu tư", icon: "🏦" },
                { dim: "design" as InterestDimension, label: "Thiết kế & Giao diện số", icon: "🎨" },
                { dim: "arts" as InterestDimension, label: "Nghệ thuật & Sáng tác", icon: "🎭" },
                { dim: "communication" as InterestDimension, label: "Truyền thông & Tiếp thị", icon: "📢" },
                { dim: "education" as InterestDimension, label: "Giáo dục & Đào tạo", icon: "🎓" },
                { dim: "healthcare" as InterestDimension, label: "Y tế & Chăm sóc sức khỏe", icon: "🩺" },
                { dim: "law" as InterestDimension, label: "Luật pháp & Chính sách", icon: "⚖️" },
                { dim: "social_impact" as InterestDimension, label: "Tác động xã hội & Thiện nguyện", icon: "🤝" },
                { dim: "nature" as InterestDimension, label: "Tự nhiên, Môi trường & Sinh thái", icon: "🌱" },
                { dim: "science" as InterestDimension, label: "Khoa học & Nghiên cứu lý thuyết", icon: "🔬" },
                { dim: "entrepreneurship" as InterestDimension, label: "Khởi nghiệp & Xây dựng mô hình", icon: "🚀" }
              ].map((item) => {
                const val = profile.interests[item.dim] ?? 50;
                return (
                  <div key={item.dim} className="rounded-xl border border-line bg-surface-soft p-3">
                    <div className="flex justify-between items-center text-xs font-bold text-ink-800 mb-1">
                      <span className="flex items-center gap-1.5">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className="text-brand-600 font-extrabold">{val}/100</span>
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Scenarios Tab */}
        {currentTab === "scenarios" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink-900">Câu Hỏi Tình Huống Thực Tế</h2>
              <p className="text-xs text-ink-500">
                Chọn phương án phản ánh đúng nhất phản xạ tự nhiên của bạn trong các tình huống thường nhật.
              </p>
            </div>

            <div className="space-y-6">
              {SCENARIO_QUESTIONS.map((sq, idx) => (
                <div key={sq.id} className="rounded-2xl border border-line bg-surface-soft p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-md bg-brand-100 text-brand-700 font-bold px-2 py-0.5 text-xs">
                      Tình huống {idx + 1}
                    </span>
                    <h3 className="font-bold text-ink-900 text-sm">{sq.title}</h3>
                  </div>
                  <p className="text-xs text-ink-700 leading-relaxed mb-4 italic">
                    "{sq.scenario}"
                  </p>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {sq.options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectScenarioOption(sq.id, opt.id)}
                        className="rounded-xl border border-line bg-surface p-3 text-left hover:border-brand-500 hover:bg-brand-50/40 transition active:scale-98"
                      >
                        <h4 className="font-bold text-ink-900 text-xs">{opt.text}</h4>
                        <p className="text-[11px] text-ink-500 mt-1 leading-snug">{opt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Work Style Tab */}
        {currentTab === "workstyle" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink-900">Phong Cách Tư Duy & Môi Trường Làm Việc</h2>
              <p className="text-xs text-ink-500">
                Kéo thanh trượt giữa 2 cực đối lập (-100 đến +100) để xác định xu hướng làm việc tối ưu của bạn.
              </p>
            </div>

            <div className="space-y-4 max-w-2xl">
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
                  <div key={ws.key} className="rounded-xl border border-line bg-surface-soft p-4">
                    <div className="flex justify-between items-center text-xs font-bold text-ink-900 mb-1">
                      <span>{ws.title}</span>
                      <span className="text-brand-600 font-extrabold">{val > 0 ? `+${val}` : val}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-ink-500 mb-1.5">
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
                      }}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Values Tab */}
        {currentTab === "values" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-ink-900">Chọn Đúng 5 Giá Trị Nghề Nghiệp Coi Trọng Nhất</h2>
                <p className="text-xs text-ink-500">
                  Thứ tự chọn tương ứng với mức độ ưu tiên giảm dần: Hạng 1 (100đ), Hạng 2 (85đ), Hạng 3 (70đ), Hạng 4 (55đ), Hạng 5 (40đ).
                </p>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-700">
                Đã chọn: {profile.ranked_values.length} / 5
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CAREER_VALUES_LIST.map((valItem) => {
                const rankIndex = profile.ranked_values.indexOf(valItem.id);
                const isSelected = rankIndex !== -1;
                return (
                  <button
                    key={valItem.id}
                    type="button"
                    onClick={() => handleToggleValue(valItem.id)}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-brand-600 bg-brand-50/70 shadow-sm ring-1 ring-brand-500"
                        : "border-line bg-surface hover:border-brand-200"
                    }`}
                  >
                    <span className="text-2xl mt-0.5">{valItem.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-ink-900 text-xs">{valItem.title}</h3>
                        {isSelected && (
                          <span className="rounded-md bg-brand-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                            Hạng {rankIndex + 1}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-500 mt-1">{valItem.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Negatives Tab */}
        {currentTab === "negatives" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink-900">Điều Muốn Né Tránh (Negative Preferences)</h2>
              <p className="text-xs text-ink-500">
                Dữ liệu sống còn: Chọn những điều kiện làm việc bạn cảm thấy tuyệt đối không muốn vướng phải. Thuật toán sẽ áp dụng hệ số phạt (Penalty -16đ) với các nghề có đặc thù này.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {NEGATIVE_PREFERENCES_LIST.map((item) => {
                const isSelected = profile.negative_preferences.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleNegative(item.id)}
                    className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-rose-500 bg-rose-50/70 ring-1 ring-rose-400"
                        : "border-line bg-surface hover:border-rose-200"
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-ink-900 text-xs">{item.title}</h3>
                      <p className="text-[11px] text-ink-500 mt-1">{item.desc}</p>
                    </div>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                        isSelected
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-line text-transparent"
                      }`}
                    >
                      ✕
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Aspirations Tab */}
        {currentTab === "aspirations" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink-900">Hình Mẫu Tương Lai Mong Muốn (Aspirations)</h2>
              <p className="text-xs text-ink-500">
                10 năm tới, bạn muốn mọi người nhìn nhận bạn trong vai trò nào nhất?
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FUTURE_ASPIRATIONS_LIST.map((item) => {
                const isSelected = profile.future_aspirations.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleAspiration(item.id)}
                    className={`flex flex-col items-center text-center rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-brand-600 bg-brand-50 shadow-sm ring-1 ring-brand-500"
                        : "border-line bg-surface hover:border-brand-200"
                    }`}
                  >
                    <span className="text-3xl mb-2">{item.icon}</span>
                    <h3 className="font-bold text-ink-900 text-xs">{item.title}</h3>
                    <span className="mt-3 text-[11px] font-semibold text-brand-700">
                      {isSelected ? "✓ Đã chọn" : "+ Chọn mục này"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
