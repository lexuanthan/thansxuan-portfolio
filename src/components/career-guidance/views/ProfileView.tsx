"use client";

import React, { useState } from "react";
import { StudentCareerProfile } from "@/lib/career-guidance/types";
import { RadarChart, RadarDataPoint } from "../common/RadarChart";
import { SmartNextAction } from "../common/SmartNextAction";
import {
  IconDna,
  IconBot,
  IconTarget,
  IconMap,
  IconSparkles,
  IconCheck,
  IconAlertCircle,
  IconArrowRight,
  IconAward,
  IconBriefcase,
  IconZap,
  IconBarChart,
  IconScale,
  IconGraduationCap,
  IconUniversity,
  IconCompass,
  IconInfo
} from "../common/CareerIcons";

interface ProfileViewProps {
  profile: StudentCareerProfile;
  onGoToMatches: () => void;
  onGoToRoadmap: () => void;
  onGoToCoach: () => void;
  onRetakeAssessment: () => void;
  onNavigateView?: (view: any) => void;
}

export function ProfileView({
  profile,
  onGoToMatches,
  onGoToRoadmap,
  onGoToCoach,
  onRetakeAssessment,
  onNavigateView
}: ProfileViewProps) {
  const [showAiModal, setShowAiModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"dimensions" | "spectrum">("dimensions");

  const archetype = profile?.profile_archetype || {
    title: "Nhà Kiến Tạo Kỹ Thuật (Practical Engineer)",
    tagline: "Ưu tiên giải pháp thực tiễn, làm chủ công nghệ và tối ưu quy trình",
    description: "Bạn sở hữu tư duy logic vững vàng kết hợp phản xạ thực hành kỹ thuật cao...",
    core_strengths: [
      "Tư duy phân tích số liệu",
      "Làm chủ công nghệ mới",
      "Giải quyết vấn đề phức tạp",
      "Làm việc độc lập tập trung sâu"
    ],
    potential_blindspots: [
      "Có xu hướng cầu toàn kỹ thuật quá mức",
      "Cần rèn luyện thêm kỹ năng thuyết phục phi kỹ thuật"
    ]
  };

  const confidencePercent = Math.round((profile?.profile_confidence ?? 0.92) * 100);

  // 10 Core Dimensions with normalized scores & categorization
  const capabilities = profile?.capabilities || ({} as any);
  const interests = profile?.interests || ({} as any);
  const academic = profile?.academic_profile || ({} as any);

  const coreDimensions = [
    {
      key: "analytical",
      title: "Analytical",
      vn: "Tư duy Phân tích & Logic",
      val: Math.round(((capabilities.analytical_thinking ?? 82) + (capabilities.logical_thinking ?? 85) + (academic.math_score ? academic.math_score * 10 : 80)) / 3),
      category: "technical",
      cluster: "Cụm Kỹ Thuật & Phân Tích",
      desc: "Năng lực bóc tách bài toán phức tạp thành các biến số logic, truy tìm nguyên nhân gốc rễ và đánh giá dữ liệu."
    },
    {
      key: "creative",
      title: "Creative",
      vn: "Sáng tạo & Đổi mới",
      val: Math.round(((capabilities.creativity ?? 70) + (interests.design ?? 65)) / 2),
      category: "creative",
      cluster: "Cụm Sáng Tạo & Tự Chủ",
      desc: "Khả năng phát sinh ý tưởng mới lạ, tư duy mở ngoài khuôn khổ và cảm nhận thẩm mỹ giao diện."
    },
    {
      key: "social",
      title: "Social",
      vn: "Tác động Xã hội & Con người",
      val: Math.round(((capabilities.communication ?? 65) + (interests.social_impact ?? 70)) / 2),
      category: "social",
      cluster: "Cụm Lãnh Đạo & Điều Phối",
      desc: "Động lực phụng sự cộng đồng, thấu hiểu tâm lý người dùng và tạo ra giá trị nhân văn qua sản phẩm."
    },
    {
      key: "structure",
      title: "Structure",
      vn: "Cấu trúc & Tổ chức",
      val: Math.round(((capabilities.organization ?? 75) + (capabilities.attention_to_detail ?? 78)) / 2),
      category: "organizational",
      cluster: "Cụm Lãnh Đạo & Điều Phối",
      desc: "Kỹ năng chuẩn mực hóa quy trình, thiết lập tài liệu bài bản, quản trị rủi ro và chú trọng sự chuẩn xác."
    },
    {
      key: "autonomy",
      title: "Autonomy",
      vn: "Tự chủ & Độc lập",
      val: Math.round(capabilities.independent_work ?? 84),
      category: "creative",
      cluster: "Cụm Sáng Tạo & Tự Chủ",
      desc: "Năng lực tự định hướng, làm việc tập trung sâu không cần giám sát và tự chịu trách nhiệm với mục tiêu."
    },
    {
      key: "technology",
      title: "Technology",
      vn: "Làm chủ Công nghệ & Kỹ thuật",
      val: Math.round(((capabilities.digital_literacy ?? 80) + (interests.technology ?? 88)) / 2),
      category: "technical",
      cluster: "Cụm Kỹ Thuật & Phân Tích",
      desc: "Phản xạ nhanh nhạy với công cụ số, ngôn ngữ lập trình, kiến trúc hệ thống và công nghệ tương lai."
    },
    {
      key: "leadership",
      title: "Leadership",
      vn: "Chiến lược & Lãnh đạo",
      val: Math.round(((capabilities.leadership ?? 68) + (capabilities.strategic_thinking ?? 74)) / 2),
      category: "organizational",
      cluster: "Cụm Lãnh Đạo & Điều Phối",
      desc: "Tầm nhìn quy hoạch dài hạn, khả năng phân bổ nguồn lực và điều hướng đội ngũ đạt mục tiêu chung."
    },
    {
      key: "collaboration",
      title: "Collaboration",
      vn: "Hợp tác & Đồng đội",
      val: Math.round(((capabilities.teamwork ?? 72) + (capabilities.communication ?? 68)) / 2),
      category: "social",
      cluster: "Cụm Lãnh Đạo & Điều Phối",
      desc: "Lắng nghe tích cực, phản hồi mang tính xây dựng và gắn kết hiệu quả trong các dự án liên ngành."
    },
    {
      key: "problem_solving",
      title: "Problem Solving",
      vn: "Giải quyết Vấn đề Thực tiễn",
      val: Math.round(((capabilities.problem_solving ?? 88) + (capabilities.logical_thinking ?? 85)) / 2),
      category: "technical",
      cluster: "Cụm Kỹ Thuật & Phân Tích",
      desc: "Phản ứng bình tĩnh trước sự cố kỹ thuật, đưa ra giải pháp khắc phục tối ưu trong điều kiện hạn chế."
    },
    {
      key: "learning_orientation",
      title: "Learning Orientation",
      vn: "Năng lực Tự học & Thích ứng",
      val: Math.round(((capabilities.learning_agility ?? 82) + (capabilities.adaptability ?? 78)) / 2),
      category: "creative",
      cluster: "Cụm Sáng Tạo & Tự Chủ",
      desc: "Tốc độ hấp thụ tri thức mới, chủ động cập nhật công nghệ và không ngại bước ra khỏi vùng an toàn."
    }
  ];

  // Radar Data (8 Core Axes preserved for clean balanced polygon visualization)
  const radarData: RadarDataPoint[] = [
    { axis: "Phân tích & Logic", value: coreDimensions[0].val },
    { axis: "Sáng tạo & Đổi mới", value: coreDimensions[1].val },
    { axis: "Tác động Xã hội", value: coreDimensions[2].val },
    { axis: "Cấu trúc & Hệ thống", value: coreDimensions[3].val },
    { axis: "Tự chủ & Độc lập", value: coreDimensions[4].val },
    { axis: "Làm chủ Công nghệ", value: coreDimensions[5].val },
    { axis: "Lãnh đạo Chiến lược", value: coreDimensions[6].val },
    { axis: "Giải quyết Vấn đề", value: coreDimensions[8].val }
  ];

  // Trait Clusters Aggregation
  const clusters = [
    {
      name: "Cụm Kỹ Thuật & Phân Tích",
      enName: "Technical & Analytical Cluster",
      score: Math.round(
        (coreDimensions[0].val + coreDimensions[5].val + coreDimensions[8].val) / 3
      ),
      dimensions: ["Analytical (84)", "Technology (84)", "Problem Solving (87)"],
      description: "Tư duy bóc tách vấn đề sắc bén, đam mê làm chủ công nghệ thực nghiệm và thiết kế giải pháp hệ thống bền vững.",
      badgeColor: "border-brand-300 bg-brand-50 text-brand-900 dark:bg-brand-950/40 dark:text-brand-300"
    },
    {
      name: "Cụm Sáng Tạo & Tự Chủ",
      enName: "Creative & Autonomous Cluster",
      score: Math.round(
        (coreDimensions[1].val + coreDimensions[4].val + coreDimensions[9].val) / 3
      ),
      dimensions: ["Creative (68)", "Autonomy (84)", "Learning (80)"],
      description: "Khả năng tự định hướng cao độ, học hỏi tốc độ cao từ sai lầm và luôn tìm tòi cải tiến cách làm việc hiện tại.",
      badgeColor: "border-sky-300 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
    },
    {
      name: "Cụm Lãnh Đạo & Điều Phối",
      enName: "Leadership & Organizational Cluster",
      score: Math.round(
        (coreDimensions[2].val + coreDimensions[3].val + coreDimensions[6].val + coreDimensions[7].val) / 4
      ),
      dimensions: ["Structure (77)", "Leadership (71)", "Collaboration (70)", "Social (68)"],
      description: "Quy chuẩn hóa quy trình chặt chẽ, duy trì tiêu chuẩn kỹ thuật cao và kết nối nhịp nhàng các bên liên quan.",
      badgeColor: "border-slate-300 bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
    }
  ];

  // 3-5 Key Traits for Hero
  const keyTraits = [
    { label: "Tư duy Hệ thống & Kiến trúc", score: 88, category: "Tư duy" },
    { label: "Giải quyết Vấn đề Thực tiễn", score: 87, category: "Năng lực" },
    { label: "Làm việc Độc lập Tự chủ", score: 84, category: "Phong cách" },
    { label: "Làm chủ Công nghệ Kỹ thuật", score: 84, category: "Chuyên môn" },
    { label: "Học hỏi & Thích ứng Nhanh", score: 80, category: "Tiềm năng" }
  ];

  // 4 Deep Structured Insight Cards (Title, Meaning, Evidence, Implication)
  const insightCards = [
    {
      title: "Tư duy xây dựng hệ thống cao",
      category: "Kiến trúc & Phân tích",
      meaning: "Bạn có phản xạ tự nhiên xem xét mọi vấn đề dưới góc nhìn quy trình toàn cảnh và cấu trúc liên kết, thay vì chỉ xử lý hiện tượng bề nổi.",
      evidence: `Điểm Problem Solving (${coreDimensions[8].val}/100) kết hợp với Analytical (${coreDimensions[0].val}/100) vượt trội so với mức trung bình chuẩn hóa.`,
      implication: "Phù hợp vượt trội với các chuyên ngành kỹ thuật công nghệ cao như Kỹ thuật Phần mềm, Robot & Cơ điện tử, Trí tuệ Nhân tạo và Quản trị Hệ thống Công nghiệp."
    },
    {
      title: "Động lực nội tại từ thực hành & chuyển hóa công nghệ",
      category: "Động lực & Sở thích",
      meaning: "Khả năng hấp thu tri thức đạt đỉnh khi bạn được thao tác trực tiếp, xây dựng mô hình thử nghiệm (prototype) và nhìn thấy giải pháp vận hành thực tế.",
      evidence: `Trục Technology (${coreDimensions[5].val}/100) cao và phổ phong cách thiên hẳn về 'Thực hành & Ứng dụng' (+60).`,
      implication: "Sẽ phát huy tối đa tiềm năng trong môi trường đào tạo thực hành xưởng hiện đại, dự án đồ án thực chiến và nghiên cứu ứng dụng đặc thù của HCMUTE."
    },
    {
      title: "Phong cách tự chủ cao và tập trung chuyên sâu (Deep Work)",
      category: "Phong cách làm việc",
      meaning: "Đạt trạng thái thăng hoa cao nhất khi được giao trọn gói bài toán kỹ thuật từ đầu đến cuối và có không gian yên tĩnh để phân tích chi tiết.",
      evidence: `Chỉ số Autonomy đạt ${coreDimensions[4].val}/100, phổ làm việc độc lập thiên về tính tự định hướng cao.`,
      implication: "Nên ưu tiên các vị trí chuyên gia kỹ thuật, kỹ sư phát triển giải pháp R&D hoặc kỹ sư dữ liệu nơi chất lượng giải pháp được ưu tiên hơn tính biểu diễn."
    },
    {
      title: "Tốc độ tự học & khả năng giải mã công cụ mới",
      category: "Năng lực bứt phá",
      meaning: "Không ngại đối mặt với công nghệ hoặc ngôn ngữ chưa từng học; có phương pháp tiếp cận chủ động để làm chủ kiến thức trong thời gian ngắn.",
      evidence: `Trục Learning Orientation đạt ${coreDimensions[9].val}/100 với xu hướng tìm kiếm tài liệu chuẩn hóa độc lập.`,
      implication: "Tạo lợi thế cạnh tranh dài hạn khi thị trường lao động chuyển dịch mạnh mẽ dưới làn sóng AI và tự động hóa toàn cầu."
    }
  ];

  // 5 Spectrum / Polarity Axes
  const workStyle = profile?.work_style || ({} as any);
  const spectrumItems = [
    {
      leftLabel: "Lý thuyết & Nghiên cứu",
      rightLabel: "Thực hành & Ứng dụng",
      val: workStyle.theory_vs_practice ?? 60,
      description: (workStyle.theory_vs_practice ?? 60) >= 0 ? "Ưu tiên thực hành, thí nghiệm xưởng và sản phẩm ứng dụng thực tế." : "Ưu tiên nghiên cứu lý thuyết nền tảng và mô hình hóa trừu tượng."
    },
    {
      leftLabel: "Độc lập Tự chủ",
      rightLabel: "Hợp tác Đội nhóm",
      val: workStyle.independent_vs_team ?? -40,
      description: (workStyle.independent_vs_team ?? -40) <= 0 ? "Thích tự chủ nghiên cứu sâu, làm chủ toàn bộ bài toán kỹ thuật." : "Thích làm việc tương tác cao, thảo luận ý tưởng liên tục cùng đồng đội."
    },
    {
      leftLabel: "Quy chuẩn Chặt chẽ",
      rightLabel: "Linh hoạt Sáng tạo",
      val: workStyle.structured_vs_flexible ?? 25,
      description: (workStyle.structured_vs_flexible ?? 25) >= 0 ? "Thích không gian linh hoạt để tìm cách tiếp cận mới lạ và tối ưu hơn." : "Thích quy trình rõ ràng, tiêu chuẩn kỹ thuật nghiêm ngặt và ít bất định."
    },
    {
      leftLabel: "Tập trung Chuyên sâu",
      rightLabel: "Đa nhiệm Điều phối",
      val: workStyle.deep_work_vs_multitask ?? -55,
      description: (workStyle.deep_work_vs_multitask ?? -55) <= 0 ? "Tập trung một bài toán phức tạp đến khi hoàn thiện tuyệt đối (Deep Work)." : "Nhanh nhẹn chuyển đổi giữa nhiều đầu việc và điều phối các nhánh dự án."
    },
    {
      leftLabel: "Hệ thống & Kỹ thuật",
      rightLabel: "Tương tác Xã hội",
      val: workStyle.people_vs_system ?? -45,
      description: (workStyle.people_vs_system ?? -45) <= 0 ? "Tìm thấy niềm vui khi tối ưu hóa máy móc, dòng dữ liệu và kiến trúc công nghệ." : "Tìm thấy niềm vui khi kết nối con người, tư vấn và tác động xã hội trực tiếp."
    }
  ];

  // Ranked Values
  const rankedValues = profile?.ranked_values || [
    "continuous_learning",
    "income",
    "autonomy",
    "innovation",
    "social_impact"
  ];

  const valueLabels: Record<string, { label: string; desc: string }> = {
    continuous_learning: {
      label: "Học hỏi Liên tục & Nâng cao Chuyên môn",
      desc: "Luôn được thử thách bởi công nghệ mới và mở rộng biên độ năng lực."
    },
    income: {
      label: "Thu nhập & Sự đãi ngộ xứng đáng",
      desc: "Ghi nhận tài chính công bằng với giá trị và chất xám kỹ thuật đóng góp."
    },
    autonomy: {
      label: "Tính Tự chủ & Quyền Quyết định",
      desc: "Tự do lựa chọn phương pháp triển khai và linh hoạt về quy trình."
    },
    innovation: {
      label: "Đổi mới Sáng tạo & Tiên phong",
      desc: "Tạo ra các giải pháp đột phá, không chấp nhận lối mòn lặp lại."
    },
    social_impact: {
      label: "Tạo Giá trị & Tác động Xã hội",
      desc: "Sản phẩm công nghệ giải quyết các vấn đề thiết thực của đời sống."
    },
    job_security: {
      label: "Sự Ổn định & Bền vững Lâu dài",
      desc: "Môi trường có nền tảng vững vàng, ít rủi ro biến động đột ngột."
    },
    work_life_balance: {
      label: "Cân bằng Công việc & Cuộc sống",
      desc: "Đảm bảo thời gian tái tạo năng lượng và chăm sóc bản thân."
    },
    leadership: {
      label: "Tầm ảnh hưởng & Lãnh đạo Đội ngũ",
      desc: "Cơ hội dẫn dắt dự án lớn và đào tạo thế hệ kế thừa."
    }
  };

  // Watch-Out / Areas for Development ("Điểm cần lưu ý" / "Vùng cần phát triển")
  const watchOutPoints = [
    {
      title: "Khuynh hướng cầu toàn kỹ thuật (Analysis Paralysis)",
      meaning: "Xu hướng muốn tối ưu hóa thuật toán và cấu trúc code đến mức hoàn hảo trước khi công bố sản phẩm mẫu.",
      implication: "Trong môi trường công nghiệp nhịp độ nhanh, cần áp dụng tư duy MVP (Minimum Viable Product) để nhận phản hồi sớm từ người dùng."
    },
    {
      title: "Truyền đạt liên ngành & Thuyết phục phi kỹ thuật",
      meaning: "Đôi khi sử dụng quá nhiều thuật ngữ chuyên môn, khiến đồng nghiệp khối kinh doanh hoặc khách hàng khó hình dung giá trị.",
      implication: "Chủ động rèn luyện kỹ năng tóm tắt giải pháp công nghệ thành lợi ích định lượng bằng ngôn ngữ đời thường."
    },
    {
      title: "Thích ứng với bối cảnh dữ kiện chưa hoàn chỉnh",
      meaning: "Có thể cảm thấy do dự khi phải đưa ra quyết định hành động trong giai đoạn đầu dự án khi yêu cầu chưa rõ ràng 100%.",
      implication: "Tập làm quen với việc đưa ra giả định có căn cứ và kiểm chứng dần qua các chu kỳ thử nghiệm ngắn (Iterative Sprint)."
    }
  ];

  return (
    <div className="space-y-8" data-testid="career-dna-view">
      {/* ==================================================
          1. HERO: Personal Career Identity Profile
      ================================================== */}
      <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-850 p-6 sm:p-10 text-white shadow-xl dark:border-brand-800">
        {/* Subtle decorative geometric background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-accent-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-48 bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-sm border border-white/20">
            <IconDna className="w-4 h-4 text-accent-red-400" />
            <span className="tracking-wide">CAREER DNA</span>
            <span className="text-white/40">•</span>
            <span className="text-white/90">Personal Career Identity Profile</span>
            <span className="text-white/40">•</span>
            <span className="text-brand-200 font-bold">Độ tin cậy: {confidencePercent}%</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAiModal(true)}
              className="rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 px-4 py-2 text-xs font-bold text-white transition flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <IconBot className="w-4 h-4 text-sky-300" />
              <span>AI giải thích Career DNA</span>
            </button>
            <button
              onClick={onRetakeAssessment}
              className="rounded-lg bg-black/20 hover:bg-black/30 border border-white/15 px-3.5 py-2 text-xs font-medium text-white/80 transition cursor-pointer"
            >
              Hiệu chỉnh
            </button>
          </div>
        </div>

        {/* Hero Headline & Identity */}
        <div className="relative z-10 mt-6 max-w-3xl space-y-3">
          <span className="text-xs uppercase tracking-widest text-brand-200 font-black block">
            Hình tượng Nghề nghiệp Định danh
          </span>
          <h1 className="text-2xl font-black sm:text-4xl lg:text-5xl tracking-tight text-white">
            &ldquo;{archetype.title}&rdquo;
          </h1>
          <p className="text-sm sm:text-base text-brand-100 font-medium italic leading-relaxed">
            {archetype.tagline}
          </p>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed pt-1 max-w-2xl">
            {archetype.description}
          </p>

          {/* 3–5 Key Traits */}
          <div className="pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-200 block mb-2">
              Các đặc trưng cốt lõi (Core Traits)
            </span>
            <div className="flex flex-wrap gap-2.5">
              {keyTraits.map((tr, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition shadow-sm"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-accent-red-600 text-[10px] font-black text-white">
                    {tr.score}
                  </span>
                  <span className="font-semibold">{tr.label}</span>
                  <span className="text-[10px] text-brand-200 uppercase font-mono">({tr.category})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero CTA Navigation Bar */}
        <div className="relative z-10 mt-8 flex flex-wrap items-center gap-3 border-t border-white/15 pt-6">
          <button
            onClick={onGoToMatches}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs sm:text-sm font-extrabold text-brand-950 hover:bg-brand-50 transition shadow-md active:scale-95 cursor-pointer"
          >
            <IconTarget className="w-4 h-4 text-accent-red-600" />
            <span>Xem nghề phù hợp</span>
            <IconArrowRight className="w-3.5 h-3.5 text-brand-950" />
          </button>

          <button
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-800/80 hover:bg-brand-700/80 border border-white/20 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition cursor-pointer"
          >
            <IconBot className="w-4 h-4 text-sky-300" />
            <span>AI giải thích Career DNA</span>
          </button>

          <button
            onClick={onGoToRoadmap}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2.5 text-xs sm:text-sm font-medium text-white transition cursor-pointer ml-auto"
          >
            <IconMap className="w-4 h-4 text-white/80" />
            <span>Lộ trình hành động</span>
          </button>
        </div>
      </section>

      {/* ==================================================
          2. VISUALS: Radar Chart + Trait Clusters + Horizontal Bars & Spectrum
      ================================================== */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column (5 Cols): 8-Axis Radar Chart & Trait Clusters */}
        <div className="lg:col-span-5 space-y-6">
          {/* Radar Chart Card */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between items-center text-center">
            <div className="w-full text-left mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                  Bản đồ Đa Chiều
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Chuẩn HCMUTE 8-Axis
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">
                8 Trục Năng Lực Career DNA
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Phản ánh phổ năng lực cốt lõi giúp bạn đưa ra quyết định nghề nghiệp có cơ sở dữ liệu.
              </p>
            </div>

            <div className="py-2 w-full flex justify-center">
              <RadarChart data={radarData} size={310} primaryColor="#004098" />
            </div>

            <div className="w-full grid grid-cols-2 gap-3 text-left pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Trục mạnh nhất</span>
                <span className="font-extrabold text-brand-900 dark:text-brand-300 text-sm">
                  {radarData.reduce((prev, curr) => (curr.value > prev.value ? curr : prev)).axis} ({Math.max(...radarData.map(d => d.value))})
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Vùng bứt phá</span>
                <span className="font-extrabold text-accent-red-600 dark:text-accent-red-400 text-sm">
                  Công nghệ & Đổi mới
                </span>
              </div>
            </div>
          </section>

          {/* Trait Clusters */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <IconZap className="w-4 h-4 text-accent-red-600" />
                  <span>Cụm Năng Lực Hội Tụ (Trait Clusters)</span>
                </h3>
                <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  3 Nhóm Hợp Lực
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Các đặc điểm có xu hướng tương hỗ và củng cố lẫn nhau trong thực tế.
              </p>
            </div>

            <div className="space-y-3.5">
              {clusters.map((cl, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-850"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {cl.name}
                    </span>
                    <span className="text-xs font-black text-brand-900 dark:text-brand-300 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      TB: {cl.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                    {cl.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cl.dimensions.map((dim, dIdx) => (
                      <span
                        key={dIdx}
                        className="rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-white border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-750 dark:text-slate-300"
                      >
                        {dim}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (7 Cols): Core Dimensions Horizontal Bars & Spectrum */}
        <div className="lg:col-span-7 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* View Switcher Tabs: 10 Core Dimensions vs Style Spectrum */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
                  Phân Tích Đo Lường
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {activeTab === "dimensions" ? "10 Trục Năng Lực Cốt Lõi (Core Dimensions)" : "Phổ Phong Cách Làm Việc Tự Nhiên (Spectrum)"}
                </h3>
              </div>

              <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-800 dark:bg-slate-800">
                <button
                  onClick={() => setActiveTab("dimensions")}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    activeTab === "dimensions"
                      ? "bg-white text-brand-900 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  10 Năng lực (0–100)
                </button>
                <button
                  onClick={() => setActiveTab("spectrum")}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                    activeTab === "spectrum"
                      ? "bg-white text-brand-900 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Phổ Phong cách
                </button>
              </div>
            </div>

            {/* TAB 1: 10 Core Dimensions Horizontal Bars */}
            {activeTab === "dimensions" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 mb-3">
                  Thang điểm chuẩn hóa được đối chiếu với năng lực sinh viên kỹ thuật HCMUTE. Mức &ge;80 được xem là thế mạnh nổi trội.
                </p>

                <div className="grid gap-3.5 sm:grid-cols-2">
                  {coreDimensions.map((dim) => {
                    const isHigh = dim.val >= 80;
                    const isMid = dim.val >= 68 && dim.val < 80;
                    const tierLabel = isHigh ? "Vượt trội" : isMid ? "Vững vàng" : "Tiềm năng";
                    const tierColor = isHigh
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : isMid
                      ? "text-brand-700 bg-brand-50 border-brand-200 dark:bg-brand-950/40 dark:text-brand-300"
                      : "text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300";

                    return (
                      <div
                        key={dim.key}
                        className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-850"
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-extrabold text-slate-900 dark:text-white">
                            {dim.vn}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tierColor}`}>
                            {tierLabel}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between text-xs text-slate-500 mb-1.5 font-mono">
                          <span className="text-[11px] text-slate-500">{dim.title}</span>
                          <span className="font-black text-brand-900 dark:text-brand-300 text-sm">
                            {dim.val}<span className="text-[10px] text-slate-400">/100</span>
                          </span>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isHigh
                                ? "bg-accent-red-600"
                                : isMid
                                ? "bg-brand-600"
                                : "bg-slate-400"
                            }`}
                            style={{ width: `${dim.val}%` }}
                          />
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-tight">
                          {dim.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: Work Style Spectrum */}
            {activeTab === "spectrum" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 mb-3">
                  Thang đo phân cực (-100 đến +100) mô tả phản xạ tự nhiên của bạn. Vị trí ở điểm nào cũng mang lại lợi thế cho những nhóm nghề nhất định.
                </p>

                <div className="space-y-4">
                  {spectrumItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-850"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          <span>{item.leftLabel}</span>
                        </span>
                        <span className="text-xs font-black text-brand-900 dark:text-brand-300 font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {item.val > 0 ? `+${item.val}` : item.val}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span>{item.rightLabel}</span>
                          <span className="h-2 w-2 rounded-full bg-brand-600" />
                        </span>
                      </div>

                      {/* Continuous Spectrum Slider Track */}
                      <div className="relative h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300 dark:border-slate-650">
                        {/* Center Zero Marker */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400 z-10" />
                        {/* Active Indicator Bar */}
                        <div
                          className="absolute top-0 bottom-0 bg-gradient-to-r from-brand-600 to-accent-red-600 rounded-full"
                          style={{
                            left: item.val >= 0 ? "50%" : `${50 + item.val / 2}%`,
                            width: `${Math.abs(item.val) / 2}%`
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>-100 (Cực trái)</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 italic">
                          {item.description}
                        </span>
                        <span>+100 (Cực phải)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Số chiều đánh giá</span>
              <span className="text-xl font-black text-brand-900 dark:text-brand-300">10 Trục</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Thế mạnh vượt trội</span>
              <span className="text-xl font-black text-emerald-600">
                {coreDimensions.filter(d => d.val >= 80).length} Năng lực
              </span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Giá trị dẫn dắt</span>
              <span className="text-xl font-black text-brand-800 dark:text-brand-300">Top 5</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Độ tương thích HCMUTE</span>
              <span className="text-xl font-black text-accent-red-600">Rất Cao</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          3. INSIGHT CARDS (Title, Meaning, Evidence, Implication)
      ================================================== */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
              Phân Tích Chuyên Sâu
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <IconSparkles className="w-5 h-5 text-accent-red-600" />
              <span>Các Insight Nhận Thức Then Chốt (Key Career Insights)</span>
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Cấu trúc 4 tầng: Tiêu đề • Ý nghĩa • Căn cứ dữ liệu • Ứng dụng thực tiễn
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {insightCards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-800 border border-brand-200 dark:bg-brand-950/40 dark:text-brand-300 dark:border-brand-800">
                    {card.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Insight #{i + 1}</span>
                </div>

                <h3 className="text-base font-black text-brand-950 dark:text-white mb-4">
                  {card.title}
                </h3>

                <div className="space-y-3 text-xs leading-relaxed">
                  {/* Meaning */}
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-3 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                      <span>Ý nghĩa cốt lõi (Meaning):</span>
                    </span>
                    <p className="text-slate-600 dark:text-slate-300">{card.meaning}</p>
                  </div>

                  {/* Evidence */}
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-3 border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-red-600" />
                      <span>Căn cứ dữ liệu (Evidence):</span>
                    </span>
                    <p className="text-slate-600 dark:text-slate-300">{card.evidence}</p>
                  </div>

                  {/* Implication */}
                  <div className="rounded-lg bg-brand-50/60 dark:bg-brand-950/30 p-3 border border-brand-200 dark:border-brand-850">
                    <span className="font-bold text-brand-950 dark:text-brand-200 block mb-1 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Tác động định hướng (Implication):</span>
                    </span>
                    <p className="text-brand-900 dark:text-brand-300">{card.implication}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          4. STRENGTHS & ENVIRONMENT (4 Pillars)
      ================================================== */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
            Hồ Sơ Năng Lực & Hệ Giá Trị
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            4 Trụ Cột Thành Công Nghề Nghiệp
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Điểm mạnh hàng đầu • Phong cách tự nhiên • Môi trường lý tưởng • Giá trị cốt lõi
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Pillar 1: Top Strengths */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-brand-900 dark:text-brand-300">
              <IconAward className="w-5 h-5 text-accent-red-600 shrink-0" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Điểm mạnh hàng đầu (Top Strengths)
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Các năng lực nổi trội tạo ra giá trị khác biệt trong công việc:
            </p>
            <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {archetype.core_strengths.map((str, sIdx) => (
                <li key={sIdx} className="flex items-start gap-2 rounded-md bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
                  <IconCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pillar 2: Natural Work Style */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-brand-900 dark:text-brand-300">
              <IconCompass className="w-5 h-5 text-brand-600 shrink-0" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Phong cách làm việc tự nhiên (Natural Work Style)
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nhịp điệu và thói quen giúp bạn đạt trạng thái thăng hoa:
            </p>
            <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <li className="rounded-md bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Tập trung theo mục tiêu:</span>
                Ưa chuộng bài toán có đích đến rõ ràng, tự tìm con đường tối ưu.
              </li>
              <li className="rounded-md bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Thực nghiệm kiểm chứng:</span>
                Thuyết phục bản thân và người khác bằng dữ liệu và sản phẩm chạy được.
              </li>
              <li className="rounded-md bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Độc lập chủ động:</span>
                Tự chịu trách nhiệm hoàn toàn về tiến độ và chất lượng bàn giao.
              </li>
            </ul>
          </div>

          {/* Pillar 3: Preferred Environment */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-brand-900 dark:text-brand-300">
              <IconUniversity className="w-5 h-5 text-sky-600 shrink-0" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Môi trường làm việc lý tưởng (Preferred Environment)
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Điều kiện cơ sở hạ tầng và văn hóa giúp kích hoạt tối đa năng lực:
            </p>
            <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <li className="rounded-md bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Văn hóa trọng thực lực:</span>
                Tôn trọng giải pháp kỹ thuật ưu việt, ít phân cấp quan liêu.
              </li>
              <li className="rounded-md bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Công cụ & Phòng lab hiện đại:</span>
                Có đầy đủ thiết bị, tài nguyên điện toán để thử nghiệm ý tưởng.
              </li>
              <li className="rounded-md bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Đồng nghiệp tinh hoa:</span>
                Được làm việc cạnh những người sắc bén, chia sẻ cùng tầm nhìn kỹ thuật.
              </li>
            </ul>
          </div>

          {/* Pillar 4: Key Values */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-brand-900 dark:text-brand-300">
              <IconTarget className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Hệ giá trị cốt lõi (Key Values)
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Top 5 kim chỉ nam giúp bạn ra quyết định gắn bó lâu dài:
            </p>
            <div className="space-y-1.5">
              {rankedValues.slice(0, 5).map((valKey, vIdx) => {
                const info = valueLabels[valKey] || { label: valKey.replace(/_/g, " "), desc: "" };
                return (
                  <div
                    key={vIdx}
                    className="flex items-center justify-between rounded-md bg-slate-50 dark:bg-slate-800/60 p-2 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <span className="font-bold text-slate-900 dark:text-white truncate">
                      <span className="text-accent-red-600 mr-1 font-mono">#{vIdx + 1}</span>
                      {info.label}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                      Top {vIdx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. WATCH-OUT: "Điểm cần lưu ý" / "Vùng cần phát triển"
      ================================================== */}
      <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20 space-y-4">
        <div className="flex items-start gap-3">
          <span className="p-2 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
            <IconAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded dark:bg-amber-900/60 dark:text-amber-200">
                Góc Nhìn Cân Bằng
              </span>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                Khuyến nghị mang tính xây dựng
              </span>
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white mt-1">
              Điểm cần lưu ý & Vùng cần phát triển (Watch-Out & Growth Areas)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Mỗi thế mạnh vượt trội luôn có một mặt lật cần điều tiết để tránh biến thành rào cản trên lộ trình thăng tiến.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 pt-1">
          {watchOutPoints.map((pt, pIdx) => (
            <div
              key={pIdx}
              className="rounded-lg border border-amber-200/80 bg-white p-4 text-xs space-y-2 dark:border-amber-900/40 dark:bg-slate-900 shadow-xs"
            >
              <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>{pt.title}</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-slate-700 dark:text-slate-300">Biểu hiện: </strong>
                {pt.meaning}
              </p>
              <p className="text-brand-900 dark:text-brand-300 leading-relaxed bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded border border-amber-200/50 dark:border-amber-900/30">
                <strong className="text-amber-900 dark:text-amber-200">Chiến lược chuyển hóa: </strong>
                {pt.implication}
              </p>
            </div>
          ))}
        </div>

        {/* Cognitive Contradiction Engine Alert (if detected) */}
        {profile?.contradictions && profile.contradictions.length > 0 && (
          <div className="rounded-lg border border-brand-200 bg-white p-4 text-xs space-y-2 dark:border-brand-900 dark:bg-slate-900">
            <span className="font-black text-brand-950 dark:text-brand-200 block flex items-center gap-2">
              <IconInfo className="w-4 h-4 text-accent-red-600" />
              <span>Phát hiện mâu thuẫn nhận thức cần dung hòa (Cognitive Contradiction Analysis)</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Hệ thống phát hiện một số câu trả lời mang tính đối nghịch tích cực (ví dụ: muốn tự do sáng tạo nhưng đồng thời đề cao tính ổn định tuyệt đối).
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
              {profile.contradictions.map((ct, cIdx) => (
                <li key={cIdx}>{ct}</li>
              ))}
            </ul>
            <p className="text-[11px] text-brand-700 dark:text-brand-300 italic pt-1">
              Gợi ý: Sử dụng chức năng &ldquo;AI giải thích Career DNA&rdquo; để tham khảo cách chọn ngành dung hòa được hai yếu tố này.
            </p>
          </div>
        )}
      </section>

      {/* ==================================================
          6. BOTTOM CALL-TO-ACTION & NEXT STEPS
      ================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded">
            Bước Tiếp Theo Trong Hành Trình
          </span>
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Sẵn sàng khám phá Danh sách Ngành & Nghề tương thích với DNA của bạn?
          </h3>
          <p className="text-xs text-slate-500">
            Thuật toán HCMUTE Decision Engine đã chấm điểm độ khớp với 80+ nghề nghiệp và 60+ ngành đại học.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <IconBot className="w-4 h-4 text-brand-600" />
            <span>AI giải thích Career DNA</span>
          </button>

          <button
            onClick={onGoToMatches}
            className="inline-flex items-center gap-2 rounded-lg bg-accent-red-600 px-5 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-accent-red-700 transition shadow-sm active:scale-95 cursor-pointer"
          >
            <IconTarget className="w-4 h-4" />
            <span>Xem nghề phù hợp</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ==================================================
          7. AI EXPLANATION MODAL / DRAWER
      ================================================== */}
      {showAiModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-white">
                  <IconBot className="w-5 h-5 text-sky-300" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    AI Career Coach • Giải Mã Career DNA
                  </h3>
                  <p className="text-xs text-slate-500">
                    Phân tích độc quyền theo chuẩn dữ liệu đào tạo Trường ĐH Sư phạm Kỹ thuật TP.HCM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Đóng modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="rounded-lg bg-brand-50/70 dark:bg-brand-950/40 p-4 border border-brand-200 dark:border-brand-900">
                <span className="font-extrabold text-brand-950 dark:text-brand-200 block mb-1">
                  1. Tại sao bạn được định danh là &ldquo;{archetype.title}&rdquo;?
                </span>
                <p>
                  Bài kiểm tra ghi nhận sự kết hợp nổi trội giữa năng lực bóc tách vấn đề kỹ thuật ({coreDimensions[0].val}/100) và tính tự chủ cao ({coreDimensions[4].val}/100). Bạn là tuýp sinh viên không chờ đợi chỉ dẫn từng bước mà luôn chủ động tìm kiếm giải pháp có cấu trúc, biến bài toán trừu tượng thành sản phẩm hữu hình.
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-slate-900 dark:text-white block mb-1">
                  2. Khối ngành HCMUTE tương thích tự nhiên nhất
                </span>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Khoa Công nghệ Thông tin:</strong> Kỹ thuật Phần mềm, Khoa học Máy tính, Trí tuệ Nhân tạo.</li>
                  <li><strong>Khoa Cơ khí Chế tạo máy / Điện - Điện tử:</strong> Cơ điện tử, Tự động hóa, Kỹ thuật Robot.</li>
                  <li><strong>Khoa Kinh tế:</strong> Hệ thống Thông tin Quản lý, Logistics & Quản lý Chuỗi cung ứng.</li>
                </ul>
              </div>

              <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 p-4 border border-emerald-200 dark:border-emerald-900">
                <span className="font-extrabold text-emerald-950 dark:text-emerald-200 block mb-1">
                  3. Lời khuyên vàng để bứt phá sớm
                </span>
                <p>
                  Ngay từ năm nhất đại học, hãy tham gia các câu lạc bộ học thuật chuyên sâu (như CLB Robot, CLB Lập trình, Lab Nghiên cứu Trẻ). Năng lượng của bạn được giải phóng mạnh nhất khi có bài toán thực tế để giải quyết thay vì chỉ thi cử trên giấy.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <span className="text-[11px] text-slate-400 italic">
                Bạn muốn đặt câu hỏi chuyên sâu hơn về nghề nghiệp tương lai?
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAiModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowAiModal(false);
                    onGoToCoach();
                  }}
                  className="rounded-lg bg-brand-900 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800 transition cursor-pointer flex items-center gap-1.5"
                >
                  <IconBot className="w-3.5 h-3.5 text-sky-300" />
                  <span>Trò chuyện trực tiếp với AI Coach</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Next Action leading to Matches View */}
      <SmartNextAction
        currentView="profile"
        onNavigate={onNavigateView || onGoToMatches}
        onAskCoach={onGoToCoach}
        customTitle="Sẵn sàng khám phá danh sách nghề & ngành tương thích?"
        customDesc="Dựa trên Chân dung Career DNA trên, hệ thống đã so khớp với hơn 80 nghề nghiệp và 60 ngành đào tạo."
      />
    </div>
  );
}
