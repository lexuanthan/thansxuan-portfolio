import {
  PersonalRoadmap,
  RoadmapStage,
  RoadmapTask,
  CareerDNA,
  StudentCareerProfile,
  ProgressionStageId,
  TimeHorizon
} from "./types";

export const PROGRESSION_STAGES: { id: ProgressionStageId; label: string; icon: string }[] = [
  { id: "discover", label: "Discover", icon: "🔍" },
  { id: "learn", label: "Learn", icon: "📚" },
  { id: "build", label: "Build", icon: "🔨" },
  { id: "practice", label: "Practice", icon: "⚙️" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "validate", label: "Validate", icon: "🏆" },
  { id: "apply", label: "Apply", icon: "🚀" }
];

export const TIME_HORIZONS: { id: TimeHorizon; label: string; durationLabel: string }[] = [
  { id: "30_days", label: "30 days", durationLabel: "30 ngày khởi động" },
  { id: "90_days", label: "90 days", durationLabel: "90 ngày tăng tốc" },
  { id: "6_months", label: "6 months", durationLabel: "6 tháng tích lũy đồ án" },
  { id: "12_months", label: "12 months", durationLabel: "12 tháng chứng chỉ & lab" },
  { id: "1_3_years", label: "1–3 years", durationLabel: "1–3 năm hội nhập thị trường" }
];

export function generatePersonalRoadmap(
  career: CareerDNA,
  profile: StudentCareerProfile
): PersonalRoadmap {
  const isHighSchool = profile.user_context?.user_type === "high_school";

  const stages: RoadmapStage[] = [
    {
      stage_id: "7_days",
      title: "Chặng 1: 30 Ngày Khởi Động (Discover & Learn)",
      tagline: "Xác thực hứng thú thực tế, làm quen công cụ chuẩn ngành và củng cố kiến thức nền tảng",
      progression_stage: "discover",
      time_horizon: "30_days",
      tasks: [
        {
          id: "task_30d_1",
          title: `Xác thực hứng thú với video 'Day in the Life of a ${career.name}'`,
          description: "Xem các video thực tế và ghi chú 3 hoạt động hấp dẫn nhất cùng 2 rào cản cần vượt qua.",
          category: "learn",
          estimated_effort: "2 giờ",
          duration: "Tuần 1",
          status: "completed",
          dependency: "Không có (Bắt đầu ngay)",
          outcome: "Bản ghi chú so sánh kỳ vọng bản thân và thực tế công việc.",
          completed: true
        },
        {
          id: "task_30d_2",
          title: "Thực hiện Thử nghiệm Nghề nghiệp Vi mô 3 giờ đầu tiên",
          description: "Làm bài tập thực hành nhập môn trực tiếp để đo lường mức độ kiên trì của tư duy.",
          category: "practice",
          estimated_effort: "3 giờ",
          duration: "Tuần 2",
          status: "in_progress",
          dependency: "Hoàn thành video xác thực thực tế",
          outcome: "Sản phẩm thực nghiệm đầu tiên kiểm chứng độ hợp nghề.",
          completed: false
        },
        {
          id: "task_30d_3",
          title: isHighSchool
            ? "Rà soát điểm tổ hợp môn xét tuyển đại học tại HCMUTE và trường trọng điểm"
            : "Cài đặt môi trường làm việc chuẩn công nghiệp và hoàn thành khóa học Foundation",
          description: isHighSchool
            ? `Kiểm tra học bạ và xây dựng mục tiêu điểm thi THPT/ĐGNL cho ngành ${career.industry_name}.`
            : "Cài đặt IDE, Git, Docker hoặc công cụ chuyên dụng và hoàn thành 1 module nhập môn.",
          category: "learn",
          estimated_effort: "10 giờ",
          duration: "Tuần 3 - 4",
          status: "pending",
          dependency: "Thực nghiệm vi mô",
          outcome: isHighSchool ? "Bảng mục tiêu điểm số các môn thi." : "Môi trường máy tính sẵn sàng làm việc.",
          completed: false
        }
      ]
    },
    {
      stage_id: "30_days",
      title: "Chặng 2: 90 Ngày Tăng Tốc (Learn & Build)",
      tagline: "Làm chủ kiến thức cốt lõi và xây dựng sản phẩm cá nhân đầu tay (Personal Project #1)",
      progression_stage: "build",
      time_horizon: "90_days",
      tasks: [
        {
          id: "task_90d_1",
          title: "Hoàn thành 1 Dự án Thực hành Cá nhân (Personal Project #1)",
          description: "Tự tay giải quyết một bài toán cụ thể từ thu thập dữ liệu/thiết kế đến sản phẩm hoàn chỉnh.",
          category: "project",
          estimated_effort: "35 giờ",
          duration: "Tháng 2",
          status: "pending",
          dependency: "Môi trường công cụ chuẩn ngành",
          outcome: "Sản phẩm demo hoạt động được và bài thuyết trình tóm tắt.",
          completed: false
        },
        {
          id: "task_90d_2",
          title: "Bù đắp khoảng trống kỹ năng ưu tiên cao nhất (Top Priority Gap)",
          description: "Dành 20 giờ chuyên sâu giải quyết thiếu hụt năng lực lớn nhất được chỉ ra trong bảng Gap Analysis.",
          category: "practice",
          estimated_effort: "20 giờ",
          duration: "Tháng 2 - 3",
          status: "pending",
          dependency: "Bảng phân tích Gap",
          outcome: "Tăng tối thiểu 15 điểm năng lực trong bài kiểm tra định kỳ.",
          completed: false
        },
        {
          id: "task_90d_3",
          title: "Đóng gói mã nguồn và sản phẩm lên GitHub / Portfolio cá nhân",
          description: "Viết tài liệu README.md chuẩn mực, chụp ảnh màn hình và hướng dẫn cài đặt sản phẩm.",
          category: "portfolio" as any,
          estimated_effort: "6 giờ",
          duration: "Cuối tháng 3",
          status: "locked",
          dependency: "Hoàn thành Personal Project #1",
          outcome: "Đường link GitHub Repo hoặc Portfolio số chuyên nghiệp.",
          completed: false
        }
      ]
    },
    {
      stage_id: "3_months",
      title: "Chặng 3: 6 Tháng Tích Lũy (Practice & Experience)",
      tagline: "Gia nhập đề tài Lab nghiên cứu hoặc tham gia cuộc thi học thuật kỹ thuật",
      progression_stage: "practice",
      time_horizon: "6_months",
      tasks: [
        {
          id: "task_6m_1",
          title: "Tham gia một cuộc thi học thuật (Hackathon, Olympic Kỹ thuật hoặc NCKH)",
          description: "Làm việc nhóm dưới áp lực thời gian để phát triển giải pháp thực tế cạnh tranh với sinh viên khác.",
          category: "project",
          estimated_effort: "40 giờ",
          duration: "Tháng 4 - 5",
          status: "locked",
          dependency: "Personal Project #1",
          outcome: "Kinh nghiệm làm việc nhóm và chứng nhận tham gia cuộc thi.",
          completed: false
        },
        {
          id: "task_6m_2",
          title: "Ứng tuyển vào phòng thí nghiệm (Lab) nghiên cứu hoặc CLB chuyên ngành tại trường",
          description: "Được làm việc với giảng viên và các anh chị khóa trên trên các dự án quy mô lớn hơn.",
          category: "experience",
          estimated_effort: "60 giờ",
          duration: "Tháng 5 - 6",
          status: "locked",
          dependency: "Portfolio sản phẩm cá nhân",
          outcome: "Vị trí thành viên nghiên cứu Lab hoặc dự án thực tế.",
          completed: false
        }
      ]
    },
    {
      stage_id: "6_months",
      title: "Chặng 4: 12 Tháng Chứng Chỉ & Thử Thách (Validate)",
      tagline: "Đạt chứng chỉ chuyên môn quốc tế và chuẩn bị hồ sơ ứng tuyển thực tập doanh nghiệp",
      progression_stage: "validate",
      time_horizon: "12_months",
      tasks: [
        {
          id: "task_12m_1",
          title: "Thi và đạt 1 Chứng chỉ Quốc tế Uy tín (Coursera Specialization, AWS, Google, Cisco)",
          description: "Chứng minh năng lực chuẩn hóa quốc tế với các nhà tuyển dụng công nghệ hàng đầu.",
          category: "certificate",
          estimated_effort: "50 giờ",
          duration: "Tháng 8 - 9",
          status: "locked",
          dependency: "Kiến thức chuyên môn nền tảng",
          outcome: "Huy hiệu số (Digital Badge) chứng chỉ quốc tế trên LinkedIn.",
          completed: false
        },
        {
          id: "task_12m_2",
          title: "Chuẩn bị CV chuẩn công nghiệp và luyện phỏng vấn kỹ thuật Mock Interview",
          description: "Soạn thảo CV 1 trang tập trung vào kết quả định lượng của các dự án đã làm.",
          category: "network",
          estimated_effort: "12 giờ",
          duration: "Tháng 10 - 11",
          status: "locked",
          dependency: "Tối thiểu 2 dự án hoàn chỉnh",
          outcome: "Bộ hồ sơ xin việc (CV, Portfolio, Cover Letter) hoàn thiện.",
          completed: false
        }
      ]
    },
    {
      stage_id: "1_year",
      title: "Chặng 5: 1 - 3 Năm Hội Nhập (Apply & Career)",
      tagline: "Trở thành kỹ sư/chuyên viên chính thức tại tập đoàn công nghệ và định hình thương hiệu",
      progression_stage: "apply",
      time_horizon: "1_3_years",
      tasks: [
        {
          id: "task_3y_1",
          title: "Hoàn thành kỳ thực tập chính thức (Internship / OJT) tại doanh nghiệp đối tác",
          description: "Làm việc trực tiếp trên hệ thống sản xuất của công ty và nhận đánh giá từ Mentor doanh nghiệp.",
          category: "experience",
          estimated_effort: "400 giờ",
          duration: "Học kỳ doanh nghiệp",
          status: "locked",
          dependency: "Vượt qua vòng phỏng vấn thực tập",
          outcome: "Cơ hội nhận offer nhân viên chính thức ngay sau khi tốt nghiệp.",
          completed: false
        },
        {
          id: "task_3y_2",
          title: "Đạt mức lương khởi điểm mục tiêu và xác lập lộ trình thăng tiến Senior",
          description: "Chuyển tiếp thành công vào vị trí Junior/Associate Engineer với mức thu nhập cạnh tranh.",
          category: "network",
          estimated_effort: "Liên tục",
          duration: "Năm 1 - 2 đi làm",
          status: "locked",
          dependency: "Hoàn thành chương trình đào tạo đại học",
          outcome: "Vị trí việc làm chính thức đúng nguyện vọng.",
          completed: false
        }
      ]
    }
  ];

  return {
    target_career_id: career.id,
    target_career_name: career.name,
    created_at: new Date().toISOString(),
    stages
  };
}

/**
 * AI Optimizer: Tự động điều chỉnh lộ trình dựa trên:
 * - Target role
 * - Gaps năng lực
 * - Current profile
 * - Available time (giờ/tuần)
 */
export function optimizeRoadmapWithAI(
  currentRoadmap: PersonalRoadmap,
  availableHoursPerWeek: number,
  profile: StudentCareerProfile
): {
  optimizedRoadmap: PersonalRoadmap;
  optimizationSummary: string;
  pacingPill: string;
} {
  const pacingPill =
    availableHoursPerWeek <= 10
      ? "Lộ trình Bền bỉ (Paced Track - 5-10h/tuần)"
      : availableHoursPerWeek <= 20
      ? "Lộ trình Tiêu chuẩn (Standard Track - 15-20h/tuần)"
      : "Lộ trình Tăng tốc Đột phá (Fast Track - 25h+/tuần)";

  const hoursMultiplier = 15 / Math.max(5, availableHoursPerWeek);

  const optimizedStages = currentRoadmap.stages.map((stage) => {
    return {
      ...stage,
      tasks: stage.tasks.map((task) => {
        // Tối ưu hóa thời lượng dựa trên thời gian rảnh của người học
        const numericEffort = parseInt(task.estimated_effort) || 10;
        const adjustedHours = Math.round(numericEffort * (hoursMultiplier > 1.2 ? 1.2 : 0.85));
        return {
          ...task,
          estimated_effort: `${adjustedHours} giờ`
        };
      })
    };
  });

  const optimizationSummary = `Thuật toán AI đã tái cân bằng lộ trình cho ${currentRoadmap.target_career_name}:
- Phù hợp với quỹ thời gian khả dụng: **${availableHoursPerWeek} giờ/tuần**.
- Điều chỉnh thời lượng nhiệm vụ cho hình mẫu **${profile.profile_archetype?.title || "Strategic Builder"}**.
- Tự động ưu tiên các nhiệm vụ lấp khoảng trống kỹ năng trước khi bước vào giai đoạn đồ án.`;

  return {
    optimizedRoadmap: {
      ...currentRoadmap,
      stages: optimizedStages
    },
    optimizationSummary,
    pacingPill
  };
}
