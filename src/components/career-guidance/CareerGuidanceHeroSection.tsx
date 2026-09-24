"use client";

import Link from "next/link";
import {
  IconArrow,
  IconSparkle,
  IconCheck,
  IconRocket,
  IconBook,
  IconChat,
} from "@/components/ui/icons";

interface PathwayCard {
  id: string;
  icon: string;
  badge: string;
  title: string;
  desc: string;
  highlight: string;
  tab: string;
}

const PATHWAYS: PathwayCard[] = [
  {
    id: "highschool",
    icon: "🎒",
    badge: "Dành cho Học sinh THPT",
    title: "Chọn Ngành & Chọn Trường",
    desc: "Khám phá thế mạnh học thuật, sở thích và tính toán khả năng trúng tuyển Đại học an toàn.",
    highlight: "So khớp điểm chuẩn 100+ trường ĐH",
    tab: "assessment",
  },
  {
    id: "university",
    icon: "🎓",
    badge: "Dành cho Sinh viên",
    title: "Định Vị & Hợp Ngành",
    desc: "Đo lường mức độ phù hợp với ngành học hiện tại, phát hiện kỹ năng thiếu và chuẩn bị thực tập.",
    highlight: "Phân tích Skill Gap & Lộ trình thực tập",
    tab: "skillgap",
  },
  {
    id: "graduate",
    icon: "👔",
    badge: "Dành cho Sắp tốt nghiệp",
    title: "Tìm Việc Khởi Điểm",
    desc: "Chuyển hóa bằng cấp thành cơ hội nghề nghiệp thực tế, nắm bắt mức lương và yêu cầu tuyển dụng.",
    highlight: "80+ Nghề nghiệp & Dự báo rủi ro AI",
    tab: "careers",
  },
  {
    id: "career_changer",
    icon: "🔄",
    badge: "Dành cho Người chuyển nghề",
    title: "Chuyển Nghề An Toàn",
    desc: "Định vị kỹ năng có thể kế thừa (transferable skills) và lập lộ trình tái đào tạo trong 3-6 tháng.",
    highlight: "Thử nghiệm nghề nghiệp (Micro-experiments)",
    tab: "roadmap",
  },
];

export function CareerGuidanceHeroSection() {
  return (
    <div className="relative overflow-hidden rounded-card-lg border border-brand-200 bg-gradient-to-br from-brand-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-soft transition-all duration-300 hover:shadow-lift">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative z-10">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-bold text-brand-300 backdrop-blur-sm border border-brand-400/30">
            <IconSparkle className="h-3.5 w-3.5 text-brand-300" />
            HỆ THỐNG AI HƯỚNG NGHIỆP v3.0
          </span>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-400/30">
            ✓ Chuẩn khoa học & Hoàn toàn miễn phí
          </span>
          <span className="hidden sm:inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
            Không cần đăng nhập vẫn làm được
          </span>
        </div>

        {/* Hero Title & Pitch */}
        <div className="mt-4 grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Trợ Lý AI Tư Vấn Hướng Nghiệp & Chọn Ngành, Chọn Trường
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              Không chỉ là bài kiểm tra tính cách đơn thuần, đây là <strong>hệ thống trợ giúp ra quyết định nghề nghiệp</strong> kết hợp thuật toán so khớp đa chiều, phân tích mức độ phơi nhiễm AI, tính điểm chuẩn trúng tuyển và đồng hành cùng <strong>AI Career Coach</strong> cá nhân hóa.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/ai-tools/career-guidance?tab=assessment"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-600 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
              >
                <IconRocket className="h-4 w-4" />
                Làm trắc nghiệm Career DNA (5 phút)
              </Link>

              <Link
                href="/ai-tools/career-guidance?tab=coach"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                <IconChat className="h-4 w-4 text-brand-300" />
                Trò chuyện với AI Coach
              </Link>

              <Link
                href="/ai-tools/career-guidance?tab=careers"
                className="inline-flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-300 hover:text-white transition-colors py-2 px-3"
              >
                Khám phá 80+ Nghề nghiệp
                <IconArrow className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics Column */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4 backdrop-blur-md">
              <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                <div className="text-xl sm:text-2xl font-black text-brand-300">80+</div>
                <div className="text-xs text-slate-300 font-medium">Nghề nghiệp & Đánh giá rủi ro AI</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                <div className="text-xl sm:text-2xl font-black text-indigo-300">60+</div>
                <div className="text-xs text-slate-300 font-medium">Ngành học Đại học chuẩn hóa</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                <div className="text-xl sm:text-2xl font-black text-emerald-300">100+</div>
                <div className="text-xs text-slate-300 font-medium">Trường ĐH & Điểm chuẩn cập nhật</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 border border-white/5">
                <div className="text-xl sm:text-2xl font-black text-amber-300">5 GĐ</div>
                <div className="text-xs text-slate-300 font-medium">Lộ trình hành động cá nhân hóa</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Target Pathways */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
              Chọn lộ trình phù hợp với giai đoạn của bạn:
            </h3>
            <Link
              href="/ai-tools/career-guidance"
              className="text-xs font-semibold text-brand-300 hover:text-white inline-flex items-center gap-1"
            >
              Mở toàn bộ nền tảng <IconArrow className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PATHWAYS.map((p) => (
              <Link
                key={p.id}
                href={`/ai-tools/career-guidance?tab=${p.tab}`}
                className="group relative flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-brand-400/50 hover:bg-white/10 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-[11px] font-bold text-brand-300 group-hover:text-white transition-colors">
                      Bắt đầu →
                    </span>
                  </div>
                  <div className="mt-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {p.badge}
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-white group-hover:text-brand-200 transition-colors">
                    {p.title}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1.5 text-[11px] font-medium text-emerald-300">
                  <IconCheck className="h-3 w-3 shrink-0" />
                  <span className="truncate">{p.highlight}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
