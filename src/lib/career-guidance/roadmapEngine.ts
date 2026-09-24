import { PersonalRoadmap, RoadmapStage, RoadmapTask, CareerDNA, StudentCareerProfile } from "./types";

export function generatePersonalRoadmap(
  career: CareerDNA,
  profile: StudentCareerProfile
): PersonalRoadmap {
  const isHighSchool = profile.user_context.user_type === "high_school";

  const stage7Days: RoadmapStage = {
    stage_id: "7_days",
    title: "Chặng 1: 7 Ngày Đầu Tiên",
    tagline: "Xác thực hứng thú và dọn dẹp các rào cản nhận thức",
    tasks: [
      {
        id: "task_7d_1",
        title: `Xem video mô tả thực tế 1 ngày làm việc của ${career.name}`,
        description: "Tìm kiếm các video 'Day in the Life' trên YouTube để xem môi trường văn phòng, công cụ hằng ngày và nhịp độ làm việc.",
        category: "learn",
        estimated_effort: "1.5 giờ",
        completed: false
      },
      {
        id: "task_7d_2",
        title: "Thực hiện Thử nghiệm Nghề nghiệp Vi mô đầu tiên (Career Experiment)",
        description: "Dành 2 - 3 giờ làm bài tập thực hành nhập môn để kiểm tra xem bạn có thực sự thích bản chất công việc này không.",
        category: "practice",
        estimated_effort: "3 giờ",
        completed: false
      },
      {
        id: "task_7d_3",
        title: "Tạo danh sách 3 câu hỏi lớn muốn giải đáp với AI Career Coach",
        description: "Liệt kê những nỗi sợ hoặc băn khoăn (ví dụ: 'Yếu Toán có theo được không?', 'Mức lương thật sự bao nhiêu?') để thảo luận sâu.",
        category: "learn",
        estimated_effort: "30 phút",
        completed: false
      }
    ]
  };

  const stage30Days: RoadmapStage = {
    stage_id: "30_days",
    title: "Chặng 2: 30 Ngày Tới",
    tagline: "Khởi động nền tảng kỹ năng cốt lõi và định hình lộ trình",
    tasks: [
      {
        id: "task_30d_1",
        title: isHighSchool
          ? "Rà soát điểm các môn tổ hợp xét tuyển đại học cho ngành liên quan"
          : "Đăng ký một khóa học nhập môn chứng chỉ quốc tế (Coursera / edX)",
        description: isHighSchool
          ? `Lập kế hoạch cải thiện điểm số cho các môn then chốt của nhóm ngành ${career.industry_name}.`
          : `Bắt đầu học khóa Foundation của chứng chỉ uy tín (Google / IBM / Meta Professional Certificate).`,
        category: "learn",
        estimated_effort: "15 giờ",
        completed: false
      },
      {
        id: "task_30d_2",
        title: "Tải và cài đặt trọn bộ công cụ làm việc chuẩn ngành",
        description: `Cài đặt và làm quen với các phần mềm tiêu chuẩn (ví dụ: IDE lập trình, phần mềm thiết kế, công cụ dữ liệu).`,
        category: "practice",
        estimated_effort: "4 giờ",
        completed: false
      },
      {
        id: "task_30d_3",
        title: "Kết nối với ít nhất 2 đàn anh/đàn chị trong ngành qua mạng xã hội / LinkedIn",
        description: "Lắng nghe kinh nghiệm chọn trường hoặc bí quyết chuẩn bị CV từ người đi trước.",
        category: "network",
        estimated_effort: "2 giờ",
        completed: false
      }
    ]
  };

  const stage3Months: RoadmapStage = {
    stage_id: "3_months",
    title: "Chặng 3: 3 Tháng Tới",
    tagline: "Thực hành dự án đầu tay và tích lũy sản phẩm cụ thể",
    tasks: [
      {
        id: "task_3m_1",
        title: "Hoàn thành 1 Dự án Thực hành Cá nhân (Personal Project #1)",
        description: "Tự tay làm ra một sản phẩm từ đầu đến cuối (bài phân tích, website nhỏ, bản thiết kế hoàn chỉnh).",
        category: "project",
        estimated_effort: "30 giờ",
        completed: false
      },
      {
        id: "task_3m_2",
        title: "Đọc trọn vẹn 1 cuốn sách kinh điển về tư duy chuyên ngành",
        description: "Nâng cấp thế giới quan và học cách tư duy như một chuyên gia thực thụ trong nghề.",
        category: "learn",
        estimated_effort: "12 giờ",
        completed: false
      },
      {
        id: "task_3m_3",
        title: "Khắc phục khoảng trống kỹ năng lớn nhất (Top Skill Gap)",
        description: "Tập trung rèn luyện kỹ năng mà bài đánh giá chỉ ra bạn còn thiếu hụt nhất so với tiêu chuẩn ngành.",
        category: "practice",
        estimated_effort: "20 giờ",
        completed: false
      }
    ]
  };

  const stage6Months: RoadmapStage = {
    stage_id: "6_months",
    title: "Chặng 4: 6 Tháng Tới",
    tagline: "Xây dựng Hồ sơ Năng lực (Portfolio) và Chứng chỉ uy tín",
    tasks: [
      {
        id: "task_6m_1",
        title: "Đạt một chứng chỉ chuyên môn được công nhận toàn cầu",
        description: "Thi lấy chứng chỉ quốc tế chứng minh năng lực căn bản (ví dụ: AWS Cloud Practitioner, Google Data Analytics, v.v.).",
        category: "certificate",
        estimated_effort: "40 giờ",
        completed: false
      },
      {
        id: "task_6m_2",
        title: "Tạo Portfolio / CV chuyên nghiệp chuẩn quốc tế",
        description: "Trình bày các dự án đã làm với hình ảnh, số liệu tác động và cấu trúc câu chuyện rõ ràng.",
        category: "project",
        estimated_effort: "10 giờ",
        completed: false
      },
      {
        id: "task_6m_3",
        title: "Tham gia một cuộc thi chuyên môn hoặc sự kiện Hackathon / Case Competition",
        description: "Thử sức làm việc nhóm dưới áp lực thời gian thực tế để cọ xát với bạn bè cùng trang lứa.",
        category: "experience",
        estimated_effort: "25 giờ",
        completed: false
      }
    ]
  };

  const stage1Year: RoadmapStage = {
    stage_id: "1_year",
    title: "Chặng 5: 1 Năm Tới",
    tagline: "Sẵn sàng bứt phá: Tuyển sinh, Thực tập hoặc Chuyển nghề thành công",
    tasks: [
      {
        id: "task_1y_1",
        title: isHighSchool
          ? "Chinh phục kỳ thi tốt nghiệp THPT & Đỗ vào trường đại học mục tiêu"
          : "Nộp đơn ứng tuyển vị trí Thực tập sinh (Internship) hoặc Chuyên viên Tập sự (Fresher)",
        description: isHighSchool
          ? "Đạt điểm số kỳ vọng và hoàn tất hồ sơ xét tuyển an toàn vào ngành học mơ ước."
          : "Gửi CV đến các công ty mục tiêu, tự tin bước vào vòng phỏng vấn chuyên môn.",
        category: "experience",
        estimated_effort: "Liên tục",
        completed: false
      },
      {
        id: "task_1y_2",
        title: "Đánh giá lại hồ sơ năng lực và cập nhật mục tiêu mới",
        description: "Quay lại nền tảng AI Career Guidance làm lại bài đánh giá để đo lường mức độ trưởng thành của bản thân.",
        category: "learn",
        estimated_effort: "2 giờ",
        completed: false
      }
    ]
  };

  return {
    target_career_id: career.id,
    target_career_name: career.name,
    created_at: new Date().toISOString(),
    stages: [stage7Days, stage30Days, stage3Months, stage6Months, stage1Year]
  };
}
