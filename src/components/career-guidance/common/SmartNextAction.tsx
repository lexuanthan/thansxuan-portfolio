"use client";

import React from "react";
import { ActiveView } from "../CareerGuidanceApp";
import {
  IconCompass,
  IconDna,
  IconTarget,
  IconBriefcase,
  IconGraduationCap,
  IconUniversity,
  IconScale,
  IconBarChart,
  IconMap,
  IconBot,
  IconFileText,
  IconArrowRight,
  IconZap
} from "./CareerIcons";

interface SmartNextActionProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onAskCoach?: () => void;
  customTitle?: string;
  customDesc?: string;
  className?: string;
}

export function SmartNextAction({
  currentView,
  onNavigate,
  onAskCoach,
  customTitle,
  customDesc,
  className = ""
}: SmartNextActionProps) {
  const nextActionConfig: Record<
    ActiveView,
    { nextView: ActiveView; nextLabel: string; title: string; desc: string; icon: React.ReactNode; xp: number }
  > = {
    landing: {
      nextView: "assessment",
      nextLabel: "Bắt đầu khám phá bản thân",
      title: "Chặng tiếp theo: Làm rõ Career DNA của bạn",
      desc: "Chỉ mất khoảng 3-5 phút qua 7 góc nhìn để mở khóa bản đồ năng lực độc bản.",
      icon: <IconCompass className="w-5 h-5" />,
      xp: 100
    },
    assessment: {
      nextView: "profile",
      nextLabel: "Xem Bản đồ Career DNA",
      title: "Đã thu thập đủ tín hiệu nghề nghiệp!",
      desc: "Hệ thống đã tổng hợp hồ sơ Career DNA và phân tích hình mẫu tư duy cá nhân của bạn.",
      icon: <IconDna className="w-5 h-5" />,
      xp: 50
    },
    profile: {
      nextView: "matches",
      nextLabel: "Khám phá Kết quả So khớp",
      title: "Tiếp tục: Xem các ngành và nghề phù hợp nhất",
      desc: "Thuật toán so khớp đa chiều đã tính toán mức độ tương thích với 60+ ngành và 80+ nghề.",
      icon: <IconTarget className="w-5 h-5" />,
      xp: 50
    },
    matches: {
      nextView: "career_explorer",
      nextLabel: "Khám phá chiều sâu nghề nghiệp",
      title: "Đào sâu: Tìm hiểu triển vọng, mức lương & kỹ năng",
      desc: "Kiểm tra mức độ tác động của AI, nhu cầu thị trường và các năng lực cốt lõi cần chuẩn bị.",
      icon: <IconBriefcase className="w-5 h-5" />,
      xp: 30
    },
    career_explorer: {
      nextView: "major_explorer",
      nextLabel: "Xem các ngành đào tạo tương ứng",
      title: "Từ nghề sang ngành: Học gì để làm được nghề này?",
      desc: "Khám phá khung chương trình, độ khó môn học và các trường có thế mạnh đào tạo.",
      icon: <IconGraduationCap className="w-5 h-5" />,
      xp: 30
    },
    major_explorer: {
      nextView: "university_explorer",
      nextLabel: "Chọn trường Đại học & Tính điểm chuẩn",
      title: "Chọn bến đỗ: Trường nào phù hợp với năng lực & học phí?",
      desc: "So khớp khả năng trúng tuyển (Safe / Target / Reach) từ điểm thi và tiêu chí của bạn.",
      icon: <IconUniversity className="w-5 h-5" />,
      xp: 30
    },
    university_explorer: {
      nextView: "compare",
      nextLabel: "Đặt các lựa chọn lên bàn cân",
      title: "So sánh trực diện các lựa chọn đang phân vân",
      desc: "So sánh học phí, cơ hội việc làm, học bổng và mức độ phù hợp trên bảng so sánh trực quan.",
      icon: <IconScale className="w-5 h-5" />,
      xp: 40
    },
    compare: {
      nextView: "skill_gap",
      nextLabel: "Đánh giá Khoảng trống kỹ năng",
      title: "Khoảng cách giữa hiện tại và mục tiêu của bạn là gì?",
      desc: "Phân tích cụ thể các kỹ năng chuyên môn, kinh nghiệm thực tế và chứng chỉ còn thiếu.",
      icon: <IconBarChart className="w-5 h-5" />,
      xp: 40
    },
    skill_gap: {
      nextView: "roadmap",
      nextLabel: "Xây dựng Lộ trình hành động 5 chặng",
      title: "Biến định hướng thành kế hoạch hành động thực tế",
      desc: "Lộ trình chi tiết: 7 ngày thử nghiệm, 30 ngày củng cố, 3 tháng bứt phá, 6 tháng và 1 năm.",
      icon: <IconMap className="w-5 h-5" />,
      xp: 60
    },
    roadmap: {
      nextView: "coach",
      nextLabel: "Tham vấn với AI Coach",
      title: "Cần tinh chỉnh kế hoạch hoặc giải đáp thắc mắc?",
      desc: "Trò chuyện với AI Coach để kiểm tra tính khả thi và nhận lời khuyên thích ứng với thị trường.",
      icon: <IconBot className="w-5 h-5" />,
      xp: 50
    },
    coach: {
      nextView: "landing",
      nextLabel: "Trở về Trang Tổng quan",
      title: "Bạn đã hoàn thành trọn vẹn 10 chặng thám hiểm!",
      desc: "Hồ sơ của bạn đã sẵn sàng để xuất bản thành Báo Cáo Career Intelligence hoàn chỉnh.",
      icon: <IconFileText className="w-5 h-5" />,
      xp: 100
    },
    saved: {
      nextView: "compare",
      nextLabel: "So sánh các mục đã lưu",
      title: "Đưa danh sách đã lưu lên bàn cân đối đầu",
      desc: "Đặt các nghề hoặc trường đại học bạn quan tâm cạnh nhau để tìm ra quyết định tối ưu.",
      icon: <IconScale className="w-5 h-5" />,
      xp: 30
    }
  };

  const action = nextActionConfig[currentView] || nextActionConfig.landing;

  return (
    <div
      className={`rounded-[12px] border border-brand-200 bg-gradient-to-r from-brand-50/70 via-surface to-brand-50/30 p-4 sm:p-5 shadow-soft transition hover:border-brand-300 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-brand-600 text-white shadow-brand shrink-0">
            {action.icon}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-100 px-2 py-0.5 rounded">
                Gợi ý bước kế tiếp
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                <IconZap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                +{action.xp} XP
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-ink-900 leading-snug">
              {customTitle || action.title}
            </h4>
            <p className="text-xs text-ink-600 leading-relaxed max-w-xl">
              {customDesc || action.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center shrink-0">
          {onAskCoach && currentView !== "coach" && (
            <button
              onClick={onAskCoach}
              className="rounded-[10px] border border-brand-200 bg-surface px-3 py-2 text-xs font-bold text-brand-900 hover:bg-brand-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <IconBot className="w-3.5 h-3.5 text-brand-600" />
              <span>Hỏi Coach</span>
            </button>
          )}

          <button
            onClick={() => onNavigate(action.nextView)}
            className="rounded-[10px] bg-brand-600 px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-brand hover:bg-brand-700 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>{action.nextLabel}</span>
            <IconArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
