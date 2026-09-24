import React, { useState } from "react";
import { UserContext, UserType, EducationLevel } from "@/lib/career-guidance/types";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (context: Partial<UserContext>) => void;
  initialUserType?: UserType;
}

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  initialUserType = "high_school"
}: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(initialUserType);
  const [educationLevel, setEducationLevel] = useState<EducationLevel>("thpt_11");
  const [goals, setGoals] = useState<string[]>(["Chọn ngành", "Hiểu bản thân"]);
  const [province, setProvince] = useState("TP. Hồ Chí Minh");
  const [expectedScore, setExpectedScore] = useState(25.5);
  const [tuitionMax, setTuitionMax] = useState(35);

  if (!isOpen) return null;

  const toggleGoal = (g: string) => {
    if (goals.includes(g)) {
      setGoals(goals.filter((item) => item !== g));
    } else {
      setGoals([...goals, g]);
    }
  };

  const handleFinish = () => {
    onComplete({
      user_type: userType,
      education_level: educationLevel,
      target_province: province,
      expected_exam_score: expectedScore,
      tuition_budget_max_million: tuitionMax,
      decision_stage: "kham_pha"
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Khởi động nhanh • Bước {step}/3
            </span>
            <h2 className="text-xl font-extrabold text-ink-900 mt-0.5">
              {step === 1 && "Bạn đang ở giai đoạn nào?"}
              {step === 2 && "Bạn muốn giải quyết điều gì nhất?"}
              {step === 3 && "Thông tin bối cảnh học tập"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-ink-400 hover:bg-surface-soft hover:text-ink-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="py-6">
          {step === 1 && (
            <div className="space-y-3">
              {[
                { type: "high_school" as UserType, edu: "thpt_11" as EducationLevel, label: "Học sinh THPT", desc: "Đang học lớp 10, 11 hoặc 12" },
                { type: "university_student" as UserType, edu: "dai_hoc_1_2" as EducationLevel, label: "Sinh viên Đại học / Cao đẳng", desc: "Đang học năm 1, 2, 3 hoặc chuẩn bị tốt nghiệp" },
                { type: "graduate" as UserType, edu: "da_tot_nghiep" as EducationLevel, label: "Sắp / Vừa tốt nghiệp", desc: "Đang tìm việc đầu tay, Fresher hoặc ứng tuyển công ty" },
                { type: "career_changer" as UserType, edu: "dang_di_lam" as EducationLevel, label: "Đã đi làm / Muốn chuyển nghề", desc: "Muốn tìm hướng đi mới, tối ưu hóa kỹ năng sẵn có" }
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    setUserType(item.type);
                    setEducationLevel(item.edu);
                  }}
                  className={`flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-all ${
                    userType === item.type
                      ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-500"
                      : "border-line bg-surface hover:border-brand-300"
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-ink-900 text-sm">{item.label}</h3>
                    <p className="text-xs text-ink-500 mt-0.5">{item.desc}</p>
                  </div>
                  {userType === item.type && (
                    <span className="text-brand-600 font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              {[
                "Chọn ngành học phù hợp",
                "Chọn trường đại học vừa sức",
                "Hiểu bản thân & khám phá điểm mạnh",
                "Tìm nghề nghiệp tương lai triển vọng",
                "Chuyển đổi nghề nghiệp sang lĩnh vực mới",
                "Lập kế hoạch chuẩn bị hồ sơ & kỹ năng",
                "Khám phá mức độ ảnh hưởng của AI đến nghề"
              ].map((g) => {
                const selected = goals.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGoal(g)}
                    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm transition-all ${
                      selected
                        ? "border-brand-600 bg-brand-50 font-semibold text-brand-900"
                        : "border-line bg-surface text-ink-700 hover:border-brand-300"
                    }`}
                  >
                    <span>{g}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs ${
                        selected
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-line"
                      }`}
                    >
                      {selected ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-700 uppercase mb-1.5">
                  Tỉnh / Thành phố ưu tiên học / làm việc
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-hidden"
                >
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="TP. Hà Nội">TP. Hà Nội</option>
                  <option value="TP. Đà Nẵng">TP. Đà Nẵng</option>
                  <option value="TP. Cần Thơ">TP. Cần Thơ</option>
                  <option value="TP. Hải Phòng">TP. Hải Phòng</option>
                  <option value="Khác">Khu vực khác / Toàn quốc</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-ink-700 mb-1.5">
                  <span>Điểm thi tốt nghiệp THPT dự kiến (3 môn)</span>
                  <span className="text-brand-600 text-sm font-extrabold">{expectedScore.toFixed(1)} điểm</span>
                </div>
                <input
                  type="range"
                  min="18.0"
                  max="30.0"
                  step="0.5"
                  value={expectedScore}
                  onChange={(e) => setExpectedScore(parseFloat(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-[11px] text-ink-400 mt-1">
                  <span>18.0 (Trung bình)</span>
                  <span>24.0 (Khá)</span>
                  <span>27.0+ (Xuất sắc)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-ink-700 mb-1.5">
                  <span>Học phí dự kiến tối đa (Triệu VNĐ / năm)</span>
                  <span className="text-brand-600 text-sm font-extrabold">{tuitionMax} tr/năm</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={tuitionMax}
                  onChange={(e) => setTuitionMax(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-[11px] text-ink-400 mt-1">
                  <span>15 tr (Công lập chuẩn)</span>
                  <span>40 tr (Tự chủ / Chất lượng cao)</span>
                  <span>80+ tr (Tư thục / Quốc tế)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-line pt-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="rounded-xl border border-line px-4 py-2 text-sm font-medium text-ink-600 hover:bg-surface-soft"
            >
              ← Quay lại
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700"
            >
              Tiếp tục →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white hover:bg-emerald-700 shadow-lift"
            >
              Hoàn tất & Khám phá 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
