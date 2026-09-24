import {
  InterestDimension,
  CapabilityDimension,
  CareerValue,
  NegativePreference,
  FutureAspiration
} from "./types";

export interface ScenarioQuestion {
  id: string;
  category: "interest" | "capability" | "scenario" | "tradeoff";
  title: string;
  scenario: string;
  options: {
    id: string;
    text: string;
    description: string;
    effects: {
      interests?: Partial<Record<InterestDimension, number>>;
      capabilities?: Partial<Record<CapabilityDimension, number>>;
    };
  }[];
}

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  {
    id: "sq_1_free_weekend",
    category: "scenario",
    title: "Ngày cuối tuần tự do",
    scenario: "Bạn có trọn vẹn 2 ngày cuối tuần không vướng bận việc học/công việc, bạn sẽ chọn hoạt động nào sau đây khiến bạn thấy tràn đầy năng lượng nhất?",
    options: [
      {
        id: "sq1_a",
        text: "Tự mày mò công nghệ / Dữ liệu",
        description: "Thử viết 1 đoạn code, tìm hiểu công cụ AI mới hoặc dựng bảng tính giải quyết 1 vấn đề cá nhân",
        effects: {
          interests: { technology: 25, data: 20 },
          capabilities: { logical_thinking: 15, independent_work: 15 }
        }
      },
      {
        id: "sq1_b",
        text: "Sáng tạo nghệ thuật / Thiết kế / Viết lách",
        description: "Vẽ, dựng một video ngắn, viết bài phân tích cảm xúc hoặc trang trí lại góc làm việc",
        effects: {
          interests: { arts: 25, design: 20, communication: 15 },
          capabilities: { creativity: 20 }
        }
      },
      {
        id: "sq1_c",
        text: "Kết nối bạn bè / Hoạt động xã hội",
        description: "Tổ chức một buổi gặp mặt nhóm, tham gia workshop thiện nguyện hoặc dẫn dắt 1 buổi thảo luận",
        effects: {
          interests: { social_impact: 25, communication: 20, education: 15 },
          capabilities: { communication: 20, teamwork: 15, leadership: 15 }
        }
      },
      {
        id: "sq1_d",
        text: "Đọc sách kinh doanh / Thị trường",
        description: "Đọc tin tức tài chính, tìm hiểu xem startup nào đang gọi vốn hoặc lên ý tưởng kinh doanh nhỏ",
        effects: {
          interests: { business: 25, finance: 20, entrepreneurship: 20 },
          capabilities: { strategic_thinking: 20, analytical_thinking: 15 }
        }
      }
    ]
  },
  {
    id: "sq_2_team_project_role",
    category: "scenario",
    title: "Vai trò trong dự án nhóm",
    scenario: "Khi tham gia một dự án nhóm 5 người để giải quyết một bài toán khó, bạn tự nhiên nhận thấy mình làm tốt nhất ở vị trí nào?",
    options: [
      {
        id: "sq2_a",
        text: "Trưởng nhóm định hướng & Kết nối",
        description: "Phân chia công việc, theo dõi tiến độ, động viên các thành viên và đại diện thuyết trình",
        effects: {
          interests: { business: 15, communication: 15 },
          capabilities: { leadership: 25, communication: 20, organization: 20 }
        }
      },
      {
        id: "sq2_b",
        text: "Bộ não phân tích & Tìm giải pháp lõi",
        description: "Đào sâu vào số liệu, tìm lỗ hổng trong lập luận và xây dựng mô hình giải quyết mấu chốt",
        effects: {
          interests: { data: 20, science: 15 },
          capabilities: { analytical_thinking: 25, problem_solving: 20, logical_thinking: 20 }
        }
      },
      {
        id: "sq2_c",
        text: "Người biến ý tưởng thành sản phẩm thị giác",
        description: "Thiết kế slide thuyết trình, vẽ sơ đồ trực quan và chăm chút từng chi tiết thẩm mỹ",
        effects: {
          interests: { design: 25, arts: 15 },
          capabilities: { creativity: 25, attention_to_detail: 20 }
        }
      },
      {
        id: "sq2_d",
        text: "Chuyên gia kỹ thuật thực thi độc lập",
        description: "Nhận phần kỹ thuật khó nhất, tự tìm tài liệu và hoàn thành xuất sắc mà không cần ai nhắc",
        effects: {
          interests: { technology: 20, engineering: 20 },
          capabilities: { independent_work: 25, learning_agility: 20, problem_solving: 15 }
        }
      }
    ]
  },
  {
    id: "sq_3_problem_solving_approach",
    category: "tradeoff",
    title: "Cách tiếp cận trước một bài toán lạ",
    scenario: "Khi đối mặt với một vấn đề hoàn toàn mới mà bạn chưa từng được học trước đây, trực giác đầu tiên của bạn là gì?",
    options: [
      {
        id: "sq3_a",
        text: "Phân rã thành các phần nhỏ & Tìm nguyên lý gốc",
        description: "Đi tìm nguyên nhân gốc rễ (Root Cause), đọc tài liệu nền tảng và dùng logic để suy diễn",
        effects: {
          interests: { science: 20, technology: 15 },
          capabilities: { logical_thinking: 25, analytical_thinking: 20 }
        }
      },
      {
        id: "sq3_b",
        text: "Thử nghiệm ngay & Học qua sai lầm (Trial & Error)",
        description: "Bắt tay vào làm thử một bản mẫu (prototype) ngay lập tức, sai đâu sửa đó",
        effects: {
          interests: { engineering: 20, entrepreneurship: 15 },
          capabilities: { adaptability: 25, problem_solving: 20 }
        }
      },
      {
        id: "sq3_c",
        text: "Hỏi chuyên gia & Thảo luận với người có kinh nghiệm",
        description: "Tìm người đi trước để lắng nghe góc nhìn, đặt câu hỏi để tránh mất thời gian đi đường vòng",
        effects: {
          interests: { education: 15, communication: 15 },
          capabilities: { communication: 20, learning_agility: 20 }
        }
      },
      {
        id: "sq3_d",
        text: "Tìm cách nhìn khác biệt phá vỡ khuôn mẫu",
        description: "Tự hỏi: 'Có cách nào hoàn toàn ngược lại với cách truyền thống mà vẫn đạt kết quả không?'",
        effects: {
          interests: { design: 15, entrepreneurship: 20 },
          capabilities: { creativity: 25, strategic_thinking: 20 }
        }
      }
    ]
  }
];

export const CAREER_VALUES_LIST: { id: CareerValue; title: string; desc: string; icon: string }[] = [
  { id: "income", title: "Thu nhập cao & Tài chính dồi dào", desc: "Mức lương thưởng vượt trội và tiềm năng tài chính đột phá", icon: "💰" },
  { id: "job_security", title: "Ổn định & An toàn nghề nghiệp", desc: "Ít nguy cơ sa thải, lộ trình rõ ràng, công việc bền bỉ lâu dài", icon: "🛡️" },
  { id: "social_impact", title: "Tạo tác động xã hội & Phụng sự", desc: "Giúp đỡ người khác, bảo vệ môi trường, mang lại giá trị nhân văn", icon: "🌱" },
  { id: "creativity", title: "Được sáng tạo & Đổi mới tự do", desc: "Không bị rập khuôn, được thể hiện dấu ấn cá nhân độc bản", icon: "🎨" },
  { id: "autonomy", title: "Quyền tự chủ & Độc lập cao", desc: "Tự quyết định cách làm, thời gian và không gian làm việc", icon: "🕊️" },
  { id: "prestige", title: "Danh tiếng & Được xã hội công nhận", desc: "Địa vị xã hội, được bạn bè và gia đình nể trọng, tự hào", icon: "👑" },
  { id: "leadership", title: "Nắm quyền lãnh đạo & Ra quyết định", desc: "Dẫn dắt tổ chức, quản lý con người và định hình chiến lược", icon: "🎯" },
  { id: "work_life_balance", title: "Cân bằng công việc & Đời sống cá nhân", desc: "Thời gian cho gia đình, sở thích, không phải tăng ca liên tục", icon: "⚖️" },
  { id: "international_opportunity", title: "Cơ hội toàn cầu & Làm việc nước ngoài", desc: "Môi trường đa văn hóa, du lịch, công tác hoặc định cư quốc tế", icon: "🌏" },
  { id: "continuous_learning", title: "Học tập liên tục & Phát triển chuyên môn", desc: "Luôn được nâng cấp não bộ với kiến thức tiên tiến mỗi ngày", icon: "📚" },
  { id: "innovation", title: "Khám phá công nghệ & Đổi mới sáng tạo", desc: "Được làm việc với những công cụ hiện đại nhất của nhân loại", icon: "⚡" },
  { id: "entrepreneurship", title: "Khởi nghiệp & Xây dựng sự nghiệp riêng", desc: "Tự làm chủ, tạo ra công ty hoặc sản phẩm mang tên mình", icon: "🚀" }
];

export const NEGATIVE_PREFERENCES_LIST: { id: NegativePreference; title: string; desc: string }[] = [
  { id: "avoid_sales", title: "Tránh bán hàng / Sale áp lực doanh số", desc: "Không thích phải chèo kéo, thuyết phục người khác mua hàng hoặc chịu KPI doanh số gắt gao" },
  { id: "avoid_public_speaking", title: "Tránh nói trước đám đông thường xuyên", desc: "Cảm thấy căng thẳng khi phải đứng trước sân khấu lớn hoặc thuyết trình liên tục" },
  { id: "avoid_repetitive_work", title: "Tránh công việc lặp đi lặp lại đơn điệu", desc: "Dễ chán ngắt khi phải làm đúng một quy trình giấy tờ ngày này qua tháng khác" },
  { id: "avoid_high_pressure", title: "Tránh môi trường áp lực cao & OT triền miên", desc: "Ưu tiên sức khỏe tinh thần, không chịu được cảnh chạy deadline thâu đêm liên tục" },
  { id: "avoid_math_heavy", title: "Tránh các ngành tính toán / Toán học nặng", desc: "Không thấy thoải mái với phương trình vi phân, thống kê phức tạp hoặc đại số cao cấp" },
  { id: "avoid_programming", title: "Tránh việc viết code / Lập trình phần mềm", desc: "Không muốn ngồi cả ngày trước màn hình đen nhìn các dòng mã lệnh kỹ thuật" },
  { id: "avoid_field_work", title: "Tránh làm việc ngoài trời / Công trường / Thực địa", desc: "Ưu tiên môi trường văn phòng máy lạnh, tránh nắng gió bụi bặm hoặc địa hình khắc nghiệt" },
  { id: "avoid_shift_work", title: "Tránh làm ca kíp đêm thất thường", desc: "Muốn giờ giấc sinh hoạt cố định ban ngày, không thức đêm hoặc đổi ca trực" },
  { id: "avoid_frequent_travel", title: "Tránh phải đi công tác xa liên miên", desc: "Thích ở gần gia đình và nơi cư trú cố định, ngại di chuyển tàu xe máy bay liên tục" },
  { id: "avoid_people_intensive_work", title: "Tránh giao tiếp xã hội dày đặc cả ngày", desc: "Cần nhiều không gian tĩnh lặng để tập trung sâu, kiệt sức nếu phải tiếp khách liên tục" }
];

export const FUTURE_ASPIRATIONS_LIST: { id: FutureAspiration; title: string; icon: string }[] = [
  { id: "expert", title: "Chuyên gia hàng đầu trong lĩnh vực chuyên sâu", icon: "🔬" },
  { id: "manager", title: "Nhà quản lý điều hành tổ chức / Tập đoàn lớn", icon: "👔" },
  { id: "entrepreneur", title: "Nhà sáng lập doanh nghiệp / Khởi nghiệp riêng", icon: "🚀" },
  { id: "creator", title: "Người sáng tạo nội dung / Nghệ sĩ có ảnh hưởng", icon: "🎨" },
  { id: "technology_builder", title: "Kiến trúc sư xây dựng công nghệ / Hệ thống số", icon: "💻" },
  { id: "consultant", title: "Chuyên gia tư vấn chiến lược giải quyết vấn đề", icon: "💡" },
  { id: "community_leader", title: "Nhà hoạt động cộng đồng & Tạo tác động xã hội", icon: "🤝" },
  { id: "international_career", title: "Làm việc toàn cầu / Chuyên gia đa quốc gia", icon: "🌏" }
];
