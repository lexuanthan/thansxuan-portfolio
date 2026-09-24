import { CareerDNA } from "./types";

export const CAREERS_DATA: CareerDNA[] = [
  // ================= 1. CÔNG NGHỆ & AI =================
  {
    id: "data_analyst",
    name: "Chuyên viên Phân tích Dữ liệu (Data Analyst)",
    slug: "data-analyst",
    industry_id: "tech",
    industry_name: "Công nghệ & Trí tuệ nhân tạo (AI)",
    tagline: "Biến dữ liệu thô thành thông điệp trực quan và quyết định kinh doanh đột phá",
    description: "Thu thập, làm sạch và khai phá các tập dữ liệu lớn; xây dựng bảng điều khiển trực quan (Dashboards) và phối hợp với các phòng ban để tối ưu hiệu quả vận hành.",
    daily_tasks: [
      "Viết truy vấn SQL trích xuất dữ liệu từ Data Warehouse",
      "Thiết kế dashboard trực quan hóa trên Power BI, Tableau hoặc Looker Studio",
      "Phân tích A/B testing và đo lường chỉ số tăng trưởng kinh doanh",
      "Thuyết trình phát hiện từ dữ liệu cho ban quản trị và trưởng bộ phận"
    ],
    required_interests: { data: 95, technology: 75, business: 65, science: 50 },
    required_capabilities: { analytical_thinking: 95, logical_thinking: 85, problem_solving: 85, attention_to_detail: 85, communication: 65 },
    work_style: { independent_vs_team: 0, stable_vs_dynamic: 20, structured_vs_flexible: -20, deep_work_vs_multitask: -40, people_vs_system: -50, theory_vs_practice: 60, detail_vs_big_picture: 30 },
    career_values: { income: 80, continuous_learning: 90, job_security: 70, autonomy: 65 },
    negative_conditions: ["avoid_math_heavy"],
    salary_range: { entry_level_million: 12, mid_level_million: 25, senior_level_million: 45 },
    career_progression: ["Junior Data Analyst", "Senior Data Analyst", "Lead BI / Analytics Lead", "Head of Data / Chief Data Officer"],
    ai_impact: {
      automation_exposure: "Trung bình",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Khả năng thấu hiểu bối cảnh kinh doanh đặc thù, sự nhạy cảm ngữ cảnh văn hóa và kỹ năng thuyết phục đối tác đưa ra hành động dựa trên số liệu.",
      future_skills: ["AI-assisted SQL/Python", "Data Storytelling", "Tư duy phản biện dữ liệu"],
      summary: "AI tự động hóa việc viết code SQL và tổng hợp biểu đồ, giúp Data Analyst nâng tầm thành đối tác chiến lược giải quyết bài toán tăng trưởng."
    },
    related_major_ids: ["data_science", "cs", "is", "business_analytics", "applied_math"],
    related_career_ids: ["data_scientist", "business_analyst", "ai_engineer"],
    tags: ["Dữ liệu", "SQL", "Power BI", "Thống kê", "Kinh doanh"]
  },
  {
    id: "software_engineer",
    name: "Kỹ sư Phần mềm (Software Engineer)",
    slug: "software-engineer",
    industry_id: "tech",
    industry_name: "Công nghệ & Trí tuệ nhân tạo (AI)",
    tagline: "Xây dựng các hệ thống phần mềm quy mô lớn, bền bỉ và bảo mật",
    description: "Phát triển ứng dụng Web, Mobile hoặc Backend; thiết kế cấu trúc dữ liệu, giải thuật và kiến trúc hệ thống phục vụ hàng triệu người dùng.",
    daily_tasks: [
      "Thiết kế kiến trúc hệ thống, API và mô hình cơ sở dữ liệu",
      "Lập trình tính năng mới bằng TypeScript, Go, Java, Python hoặc Rust",
      "Viết unit tests, thực hiện code review và tối ưu hiệu năng",
      "Phối hợp với Product Manager và DevOps trong quy trình CI/CD"
    ],
    required_interests: { technology: 95, engineering: 80, data: 60 },
    required_capabilities: { logical_thinking: 95, problem_solving: 90, learning_agility: 90, independent_work: 80, teamwork: 70 },
    work_style: { independent_vs_team: -20, stable_vs_dynamic: 40, structured_vs_flexible: -10, deep_work_vs_multitask: -60, people_vs_system: -70, theory_vs_practice: 50, detail_vs_big_picture: 10 },
    career_values: { income: 90, continuous_learning: 95, autonomy: 80, innovation: 85 },
    negative_conditions: ["avoid_programming", "avoid_repetitive_work"],
    salary_range: { entry_level_million: 14, mid_level_million: 30, senior_level_million: 65 },
    career_progression: ["Junior Developer", "Senior Software Engineer", "Tech Lead / Software Architect", "Engineering Director / VP of Tech"],
    ai_impact: {
      automation_exposure: "Trung bình",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Tư duy kiến trúc hệ thống phân tán, xử lý ngoại lệ phức tạp, thấu hiểu bảo mật chuyên sâu và giải quyết mâu thuẫn yêu cầu sản phẩm.",
      future_skills: ["AI-Assisted Coding (Copilot/Cursor)", "System Architecture Design", "Code Review & Security Auditing"],
      summary: "AI giúp gõ code nhanh gấp 3 lần, chuyển dịch trọng tâm của lập trình viên sang tư duy kiến trúc, bảo mật và thiết kế giải pháp tổng thể."
    },
    related_major_ids: ["se", "cs", "it", "cybersecurity"],
    related_career_ids: ["devops_engineer", "mobile_developer", "ai_engineer"],
    tags: ["Coding", "Backend", "Frontend", "Cloud", "Kiến trúc"]
  },
  {
    id: "ai_engineer",
    name: "Kỹ sư Trí tuệ Nhân tạo & Machine Learning (AI Engineer)",
    slug: "ai-engineer",
    industry_id: "tech",
    industry_name: "Công nghệ & Trí tuệ nhân tạo (AI)",
    tagline: "Phát triển và triển khai các mô hình máy học, LLM và thị giác máy tính vào thực tế",
    description: "Xây dựng các pipeline huấn luyện dữ liệu, fine-tune mô hình ngôn ngữ lớn (LLM), triển khai hệ thống Agentic AI và tối ưu hóa suy luận mô hình trên hạ tầng đám mây.",
    daily_tasks: [
      "Thu thập, tiền xử lý và gắn nhãn tập dữ liệu huấn luyện",
      "Thiết kế kiến trúc mô hình học sâu (Deep Learning, Transformers)",
      "Triển khai mô hình lên production qua API với độ trễ thấp",
      "Đánh giá rủi ro thiên lệch dữ liệu và an toàn thông tin của AI"
    ],
    required_interests: { technology: 95, data: 95, science: 85, engineering: 75 },
    required_capabilities: { analytical_thinking: 95, logical_thinking: 95, problem_solving: 90, learning_agility: 95, strategic_thinking: 75 },
    work_style: { independent_vs_team: -30, stable_vs_dynamic: 60, structured_vs_flexible: 0, deep_work_vs_multitask: -70, people_vs_system: -80, theory_vs_practice: 20, detail_vs_big_picture: 40 },
    career_values: { innovation: 95, income: 95, continuous_learning: 95, prestige: 85 },
    negative_conditions: ["avoid_programming", "avoid_math_heavy"],
    salary_range: { entry_level_million: 18, mid_level_million: 40, senior_level_million: 85 },
    career_progression: ["Junior AI/ML Engineer", "Senior Machine Learning Engineer", "Staff AI Research Engineer", "Chief AI Officer (CAIO)"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Sáng tạo kiến trúc mô hình mới, đánh giá tính đạo đức của thuật toán và liên kết năng lực AI với giải pháp cho xã hội.",
      future_skills: ["RAG & Agentic Workflows", "LLM Fine-tuning", "AI Safety & Governance"],
      summary: "Đây là vị trí trung tâm kiến tạo tương lai; nhu cầu tuyển dụng toàn cầu và tại Việt Nam tăng trưởng vượt bậc."
    },
    related_major_ids: ["data_science", "cs", "applied_math"],
    related_career_ids: ["data_scientist", "software_engineer", "data_analyst"],
    tags: ["AI", "Machine Learning", "Deep Learning", "LLM", "Python"]
  },
  {
    id: "product_manager",
    name: "Quản trị Sản phẩm Công nghệ (Product Manager)",
    slug: "product-manager",
    industry_id: "tech",
    industry_name: "Công nghệ & Trí tuệ nhân tạo (AI)",
    tagline: "Giao lộ giữa Kinh doanh, Công nghệ và Trải nghiệm người dùng",
    description: "Định hình tầm nhìn sản phẩm, xác định lộ trình tính năng (Roadmap) và làm cầu nối giữa kỹ sư phần mềm, thiết kế UI/UX và ban kinh doanh.",
    daily_tasks: [
      "Nghiên cứu hành vi người dùng và phân tích dữ liệu sản phẩm",
      "Viết tài liệu đặc tả tính năng (PRD) và phân cấp độ ưu tiên",
      "Chủ trì các buổi họp Scrum / Sprint Planning với team lập trình",
      "Theo dõi các chỉ số chuyển đổi, giữ chân (Retention) và doanh thu"
    ],
    required_interests: { business: 90, technology: 80, design: 70, communication: 75, entrepreneurship: 80 },
    required_capabilities: { strategic_thinking: 95, communication: 90, leadership: 85, problem_solving: 90, analytical_thinking: 85 },
    work_style: { independent_vs_team: 60, stable_vs_dynamic: 50, structured_vs_flexible: 20, deep_work_vs_multitask: 60, people_vs_system: 50, theory_vs_practice: 50, detail_vs_big_picture: 70 },
    career_values: { leadership: 90, social_impact: 90, income: 85, innovation: 85 },
    negative_conditions: ["avoid_people_intensive_work", "avoid_high_pressure"],
    salary_range: { entry_level_million: 15, mid_level_million: 35, senior_level_million: 70 },
    career_progression: ["Associate Product Manager", "Product Manager (PM)", "Senior PM / Group PM", "Head of Product / VP of Product / CPO"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Khả năng đồng cảm sâu sắc với cảm xúc con người, trực giác kinh doanh và tài năng lãnh đạo thuyết phục không dùng quyền hành.",
      future_skills: ["AI Product Discovery", "User Persona Research", "Metrics-driven Prioritization"],
      summary: "AI giúp viết PRD và tạo mockup nhanh chóng; PM tập trung thời gian vào định vị chiến lược và đối thoại với khách hàng."
    },
    related_major_ids: ["is", "business_admin", "cs", "marketing"],
    related_career_ids: ["ui_ux_designer", "business_analyst", "marketing_manager"],
    tags: ["Product", "Agile", "Strategy", "User Experience", "Lãnh đạo"]
  },
  {
    id: "cybersecurity_specialist",
    name: "Chuyên gia An toàn Thông tin & An ninh Mạng (Cybersecurity Specialist)",
    slug: "cybersecurity-specialist",
    industry_id: "tech",
    industry_name: "Công nghệ & Trí tuệ nhân tạo (AI)",
    tagline: "Vệ sĩ số bảo vệ hệ thống tài chính, dữ liệu quốc gia và hạ tầng đám mây",
    description: "Thực hiện kiểm thử xâm nhập (Penetration Testing), giám sát trung tâm tác chiến an ninh (SOC), điều tra sự cố số và thiết lập chính sách bảo mật mạng.",
    daily_tasks: [
      "Theo dõi cảnh báo tấn công và phân tích mã độc trên SIEM",
      "Thực hiện kiểm thử an ninh (Pen-test) các ứng dụng trước khi ra mắt",
      "Xây dựng chính sách an toàn thông tin theo chuẩn ISO 27001",
      "Ứng cứu và khắc phục sự cố rò rỉ dữ liệu máy chủ"
    ],
    required_interests: { technology: 90, engineering: 75, law: 60 },
    required_capabilities: { problem_solving: 95, attention_to_detail: 95, logical_thinking: 90, independent_work: 80, adaptability: 85 },
    work_style: { independent_vs_team: -20, stable_vs_dynamic: 40, structured_vs_flexible: -40, deep_work_vs_multitask: -40, people_vs_system: -80, theory_vs_practice: 60, detail_vs_big_picture: 0 },
    career_values: { job_security: 90, income: 85, continuous_learning: 90, autonomy: 75 },
    negative_conditions: ["avoid_programming"],
    salary_range: { entry_level_million: 13, mid_level_million: 28, senior_level_million: 60 },
    career_progression: ["Security Analyst (SOC L1/L2)", "Penetration Tester / Security Consultant", "Security Architect / Incident Responder", "Chief Information Security Officer (CISO)"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Tư duy phản gián, đối phó các cuộc tấn công phi kỹ thuật (Social Engineering) và suy luận mục đích của tội phạm mạng tinh vi.",
      future_skills: ["AI-powered Threat Hunting", "Cloud Security (AWS/Azure)", "Cryptography"],
      summary: "Các cuộc tấn công mạng sử dụng AI gia tăng tạo ra cơn khát nhân lực an ninh mạng trên toàn thế giới với mức đãi ngộ hấp dẫn."
    },
    related_major_ids: ["cybersecurity", "it", "cs"],
    related_career_ids: ["software_engineer", "network_engineer"],
    tags: ["Bảo mật", "Hacker mũ trắng", "SOC", "Mạng máy tính", "ISO 27001"]
  },
  {
    id: "ui_ux_designer",
    name: "Nhà thiết kế Trải nghiệm & Giao diện Số (UI/UX Designer)",
    slug: "ui-ux-designer",
    industry_id: "tech",
    industry_name: "Công nghệ & Trí tuệ nhân tạo (AI)",
    tagline: "Chuyển hóa luồng nghiệp vụ phức tạp thành giao diện trực quan và mê hoặc",
    description: "Phỏng vấn người dùng, vẽ sơ đồ hành trình (User Journey), tạo Wireframe và hoàn thiện giao diện ứng dụng pixel-perfect trên Figma.",
    daily_tasks: [
      "Thực hiện nghiên cứu người dùng và kiểm thử tính khả dụng (Usability Testing)",
      "Thiết kế Design System nhất quán cho Web và Mobile App",
      "Tạo mẫu tương tác (Interactive Prototypes) mô phỏng trải nghiệm thật",
      "Bàn giao thông số thiết kế cho lập trình viên Front-end"
    ],
    required_interests: { design: 95, arts: 80, technology: 75, communication: 70 },
    required_capabilities: { creativity: 95, attention_to_detail: 90, problem_solving: 85, communication: 80, adaptability: 80 },
    work_style: { independent_vs_team: 20, stable_vs_dynamic: 30, structured_vs_flexible: 30, deep_work_vs_multitask: -20, people_vs_system: 10, theory_vs_practice: 60, detail_vs_big_picture: 30 },
    career_values: { creativity: 95, autonomy: 80, income: 80, work_life_balance: 75 },
    negative_conditions: ["avoid_programming"],
    salary_range: { entry_level_million: 11, mid_level_million: 24, senior_level_million: 45 },
    career_progression: ["Junior UI/UX Designer", "Product Designer", "Lead Product Designer", "Head of Design / Design Director"],
    ai_impact: {
      automation_exposure: "Trung bình",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Sự thấu cảm tâm lý người dùng, cảm quan thẩm mỹ văn hóa tinh tế và khả năng định hình phong cách độc bản cho thương hiệu.",
      future_skills: ["Design Systems Management", "Figma AI Automation", "Micro-interaction Design"],
      summary: "AI có thể tạo ra các màn hình mẫu tức thì; nhà thiết kế xuất sắc là người hiểu 'tại sao người dùng lại rời bỏ ứng dụng ở bước này'."
    },
    related_major_ids: ["multimedia", "graphic_design", "it", "psychology"],
    related_career_ids: ["product_manager", "graphic_designer", "software_engineer"],
    tags: ["Figma", "UI", "UX", "Giao diện", "Trải nghiệm"]
  },

  // ================= 2. KỸ THUẬT & TỰ ĐỘNG HÓA =================
  {
    id: "mechatronics_engineer",
    name: "Kỹ sư Cơ điện tử & Robotics (Mechatronics & Robotics Engineer)",
    slug: "mechatronics-robotics-engineer",
    industry_id: "engineering",
    industry_name: "Kỹ thuật, Cơ điện tử & Tự động hoá",
    tagline: "Tạo nên những cánh tay robot thông minh và dây chuyền tự động hóa tương lai",
    description: "Tích hợp cơ khí chính xác, mạch điện tử điều khiển và phần mềm nhúng để thiết kế robot, máy bay không người lái (UAV) và xe tự hành AGV.",
    daily_tasks: [
      "Vẽ và mô phỏng 3D cơ cấu động học trên SolidWorks / Inventor",
      "Thiết kế mạch điều khiển PLC, vi điều khiển STM32/Arduino",
      "Lập trình thuật toán điều khiển PID và thị giác máy tính cho robot",
      "Lắp ráp, kiểm thử và căn chỉnh cánh tay robot trong nhà máy"
    ],
    required_interests: { engineering: 95, technology: 85, science: 75 },
    required_capabilities: { logical_thinking: 90, problem_solving: 90, independent_work: 80, attention_to_detail: 85, creativity: 75 },
    work_style: { independent_vs_team: 10, stable_vs_dynamic: 20, structured_vs_flexible: -40, deep_work_vs_multitask: -50, people_vs_system: -80, theory_vs_practice: 70, detail_vs_big_picture: 0 },
    career_values: { innovation: 90, income: 80, job_security: 85, continuous_learning: 85 },
    negative_conditions: ["avoid_field_work"],
    salary_range: { entry_level_million: 12, mid_level_million: 25, senior_level_million: 50 },
    career_progression: ["Kỹ sư Cơ điện tử tập sự", "Kỹ sư Robotics dự án", "Trưởng nhóm Tự động hóa", "Giám đốc Kỹ thuật Nhà máy (Technical Director)"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Cao",
      human_advantage: "Thao tác cơ khí thực địa, xử lý sai số lắp ghép vật lý và điều chỉnh cảm biến theo điều kiện thực tế.",
      future_skills: ["Robot Operating System (ROS)", "Computer Vision for Automation", "PLC Advanced"],
      summary: "Làn sóng dịch chuyển chuỗi cung ứng công nghệ cao sang Việt Nam khiến kỹ sư cơ điện tử và robotics luôn được săn đón."
    },
    related_major_ids: ["mechatronics", "automation", "mechanical_engineering", "electronics"],
    related_career_ids: ["semiconductor_engineer", "iot_engineer", "embedded_engineer"],
    tags: ["Robotics", "Cơ khí", "Điện tử", "PLC", "Tự động hóa"]
  },
  {
    id: "semiconductor_engineer",
    name: "Kỹ sư Thiết kế Vi mạch & Bán dẫn (IC Design Engineer)",
    slug: "semiconductor-ic-engineer",
    industry_id: "engineering",
    industry_name: "Kỹ thuật, Cơ điện tử & Tự động hoá",
    tagline: "Trái tim của kỷ nguyên bán dẫn: Thiết kế chip siêu nhỏ cho thế giới tương lai",
    description: "Thiết kế mạch logic số (RTL), mạch tương tự (Analog), kiểm thử vi mạch và đóng gói bán dẫn cho các tập đoàn vi mạch toàn cầu.",
    daily_tasks: [
      "Viết mã mô tả phần cứng bằng Verilog / SystemVerilog",
      "Mô phỏng và kiểm thử chức năng vi mạch (Verification)",
      "Thiết kế bố trí vật lý (Physical Layout) trên phần mềm Synopsys / Cadence",
      "Phối hợp với nhà máy đúc chip (Foundry) để kiểm tra chất lượng silicon"
    ],
    required_interests: { engineering: 95, technology: 90, science: 85, data: 60 },
    required_capabilities: { attention_to_detail: 95, analytical_thinking: 95, logical_thinking: 95, independent_work: 85, problem_solving: 90 },
    work_style: { independent_vs_team: -10, stable_vs_dynamic: 10, structured_vs_flexible: -60, deep_work_vs_multitask: -80, people_vs_system: -90, theory_vs_practice: 40, detail_vs_big_picture: -30 },
    career_values: { prestige: 95, income: 95, job_security: 90, continuous_learning: 90 },
    negative_conditions: ["avoid_programming", "avoid_math_heavy"],
    salary_range: { entry_level_million: 16, mid_level_million: 35, senior_level_million: 75 },
    career_progression: ["IC Design / Verification Engineer", "Senior Silicon Engineer", "Principal Chip Architect", "R&D Director Semiconductor"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Cao",
      human_advantage: "Tối ưu hóa diện tích die và điện năng tiêu thụ đến từng nanomet, kiểm chứng các trường hợp biên cực hiếm.",
      future_skills: ["SystemVerilog / UVM", "Cadence EDA Tools", "Advanced Packaging"],
      summary: "Ngành công nghiệp chiến lược cấp quốc gia với chính sách học bổng và mức lương cạnh tranh quốc tế."
    },
    related_major_ids: ["electronics", "semiconductor", "physics_engineering", "cs"],
    related_career_ids: ["mechatronics_engineer", "embedded_engineer", "ai_engineer"],
    tags: ["Vi mạch", "Bán dẫn", "Chip", "Verilog", "Cadence"]
  },

  // ================= 3. KINH DOANH & QUẢN TRỊ =================
  {
    id: "business_analyst",
    name: "Chuyên viên Phân tích Nghiệp vụ (Business Analyst - BA)",
    slug: "business-analyst",
    industry_id: "business",
    industry_name: "Kinh doanh, Thương mại & Quản trị",
    tagline: "Cầu nối thông tuệ giữa yêu cầu kinh doanh và giải pháp chuyển đổi số",
    description: "Khảo sát và phỏng vấn các phòng ban nghiệp vụ, làm rõ quy trình, viết tài liệu yêu cầu phần mềm và đảm bảo hệ thống đáp ứng đúng mục tiêu doanh nghiệp.",
    daily_tasks: [
      "Tổ chức workshop phỏng vấn lấy yêu cầu từ các phòng ban",
      "Vẽ sơ đồ quy trình nghiệp vụ (BPMN, Flowchart)",
      "Soạn thảo tài liệu đặc tả yêu cầu người dùng (BRD, SRS)",
      "Hỗ trợ kiểm thử chấp nhận người dùng (UAT) trước khi golive"
    ],
    required_interests: { business: 90, technology: 70, communication: 80, data: 65 },
    required_capabilities: { analytical_thinking: 90, communication: 90, problem_solving: 85, organization: 85, adaptability: 80 },
    work_style: { independent_vs_team: 40, stable_vs_dynamic: 30, structured_vs_flexible: -10, deep_work_vs_multitask: 20, people_vs_system: 40, theory_vs_practice: 50, detail_vs_big_picture: 40 },
    career_values: { income: 80, job_security: 80, continuous_learning: 80, work_life_balance: 75 },
    negative_conditions: ["avoid_people_intensive_work", "avoid_sales"],
    salary_range: { entry_level_million: 12, mid_level_million: 26, senior_level_million: 50 },
    career_progression: ["Junior BA", "Senior Business Analyst", "Lead BA / Product Owner", "Head of Business Transformation / Consulting Partner"],
    ai_impact: {
      automation_exposure: "Trung bình",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Kỹ năng đặt câu hỏi truy xuất nhu cầu ngầm của khách hàng (Unspoken Needs) và giải quyết xung đột lợi ích giữa các bên.",
      future_skills: ["Prompt Engineering for BRD", "Agile Product Ownership", "Enterprise Architecture (TOGAF)"],
      summary: "AI giúp tạo nhanh tài liệu nghiệp vụ; BA con người đóng vai trò là nhà đàm phán giải pháp then chốt."
    },
    related_major_ids: ["is", "business_admin", "finance", "it"],
    related_career_ids: ["product_manager", "data_analyst", "management_consultant"],
    tags: ["BA", "BPMN", "Yêu cầu phần mềm", "Agile", "Kinh doanh"]
  },
  {
    id: "supply_chain_specialist",
    name: "Chuyên viên Quản trị Chuỗi Cung ứng & Logistics",
    slug: "supply-chain-logistics-specialist",
    industry_id: "business",
    industry_name: "Kinh doanh, Thương mại & Quản trị",
    tagline: "Nhạc trưởng điều phối dòng hàng hóa, kho bãi và vận tải xuyên biên giới",
    description: "Lập kế hoạch nhu cầu hàng hóa (Demand Planning), quản lý tồn kho, đàm phán cước tàu và vận tải đa phương thức tối ưu hóa chi phí.",
    daily_tasks: [
      "Dự báo nhu cầu hàng hóa và lập kế hoạch đặt hàng với nhà cung cấp",
      "Theo dõi tiến độ hải quan và vận chuyển đường biển/hàng không",
      "Tối ưu vòng quay hàng tồn kho trong hệ thống kho phân phối",
      "Xử lý các sự cố đứt gãy nguồn cung hoặc hư hỏng hàng hóa"
    ],
    required_interests: { business: 85, data: 70, technology: 50 },
    required_capabilities: { organization: 90, problem_solving: 90, adaptability: 85, communication: 85, analytical_thinking: 80 },
    work_style: { independent_vs_team: 30, stable_vs_dynamic: 50, structured_vs_flexible: -20, deep_work_vs_multitask: 50, people_vs_system: 20, theory_vs_practice: 70, detail_vs_big_picture: 40 },
    career_values: { job_security: 85, income: 80, international_opportunity: 85, work_life_balance: 65 },
    negative_conditions: ["avoid_high_pressure"],
    salary_range: { entry_level_million: 10, mid_level_million: 22, senior_level_million: 45 },
    career_progression: ["Logistics Coordinator", "Supply Chain Planner", "Supply Chain Manager", "VP of Global Supply Chain"],
    ai_impact: {
      automation_exposure: "Trung bình",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Kỹ năng đàm phán quan hệ nhà cung cấp, xử lý khủng hoảng tắc nghẽn cảng biển và quản trị rủi ro địa chính trị.",
      future_skills: ["AI Demand Forecasting", "Green Logistics & Carbon Footprint", "SAP S/4HANA"],
      summary: "Việt Nam là trung tâm sản xuất và logistics mới của khu vực, mở ra cơ hội việc làm rộng lớn trong các tập đoàn đa quốc gia."
    },
    related_major_ids: ["logistics", "international_business", "business_admin", "industrial_engineering"],
    related_career_ids: ["business_analyst", "procurement_specialist"],
    tags: ["Logistics", "Xuất nhập khẩu", "Kho bãi", "Tồn kho", "Cung ứng"]
  },

  // ================= 4. TÀI CHÍNH & FINTECH =================
  {
    id: "investment_analyst",
    name: "Chuyên viên Phân tích Đầu tư (Investment / Equity Analyst)",
    slug: "investment-analyst",
    industry_id: "finance",
    industry_name: "Tài chính, Ngân hàng & Fintech",
    tagline: "Định giá doanh nghiệp, giải mã báo cáo tài chính và tìm kiếm tài sản tiềm năng",
    description: "Xây dựng mô hình tài chính (DCF, P/E), thẩm định dự án đầu tư cho quỹ mở, quỹ đầu tư mạo hiểm (VC), công ty chứng khoán hoặc bảo hiểm.",
    daily_tasks: [
      "Đọc và phân tích sâu báo cáo tài chính của các công ty niêm yết",
      "Xây dựng mô hình định giá doanh nghiệp trên Excel nâng cao",
      "Gặp gỡ ban điều hành doanh nghiệp để tìm hiểu lợi thế cạnh tranh",
      "Viết báo cáo khuyến nghị đầu tư Mua/Bán cho khách hàng tổ chức"
    ],
    required_interests: { finance: 95, business: 85, data: 80, science: 50 },
    required_capabilities: { analytical_thinking: 95, logical_thinking: 90, strategic_thinking: 90, attention_to_detail: 90, communication: 75 },
    work_style: { independent_vs_team: -30, stable_vs_dynamic: 40, structured_vs_flexible: -30, deep_work_vs_multitask: -60, people_vs_system: -40, theory_vs_practice: 50, detail_vs_big_picture: 60 },
    career_values: { income: 95, prestige: 90, continuous_learning: 90, innovation: 75 },
    negative_conditions: ["avoid_math_heavy", "avoid_high_pressure"],
    salary_range: { entry_level_million: 15, mid_level_million: 35, senior_level_million: 80 },
    career_progression: ["Research Associate", "Senior Equity Analyst", "Portfolio Manager (Quản lý quỹ)", "Chief Investment Officer (CIO)"],
    ai_impact: {
      automation_exposure: "Trung bình",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Đánh giá tính chính trực của ban lãnh đạo doanh nghiệp, thấu hiểu tâm lý đám đông thị trường và tầm nhìn vĩ mô.",
      future_skills: ["Python for Financial Modeling", "CFA Charter", "Alternative Data Analysis"],
      summary: "AI quét báo cáo tài chính trong 10 giây; chuyên gia đầu tư tạo ra giá trị khác biệt ở khả năng phán đoán rủi ro và ra quyết định."
    },
    related_major_ids: ["finance", "banking", "economics", "accounting"],
    related_career_ids: ["financial_risk_manager", "data_analyst", "corporate_finance_manager"],
    tags: ["Chứng khoán", "CFA", "Định giá", "Mô hình tài chính", "Quỹ đầu tư"]
  },
  {
    id: "financial_risk_manager",
    name: "Chuyên viên Quản trị Rủi ro Tài chính (Risk Manager)",
    slug: "financial-risk-manager",
    industry_id: "finance",
    industry_name: "Tài chính, Ngân hàng & Fintech",
    tagline: "Lá chắn bảo vệ hệ thống ngân hàng trước biến động tỷ giá, lãi suất và nợ xấu",
    description: "Đo lường rủi ro tín dụng, rủi ro thị trường và rủi ro hoạt động theo chuẩn Basel; xây dựng kịch bản kiểm tra sức chịu đựng (Stress Testing).",
    daily_tasks: [
      "Tính toán các chỉ số rủi ro danh mục (VaR, Expected Shortfall)",
      "Thẩm định hạn mức tín dụng cho các khoản vay doanh nghiệp lớn",
      "Chạy mô hình giả lập tác động khi lãi suất hoặc tỷ giá biến động",
      "Báo cáo cảnh báo sớm cho Ủy ban Quản lý Rủi ro (ALCO)"
    ],
    required_interests: { finance: 90, data: 85, law: 70 },
    required_capabilities: { analytical_thinking: 95, logical_thinking: 90, attention_to_detail: 95, problem_solving: 85, organization: 85 },
    work_style: { independent_vs_team: -10, stable_vs_dynamic: -20, structured_vs_flexible: -60, deep_work_vs_multitask: -40, people_vs_system: -60, theory_vs_practice: 40, detail_vs_big_picture: 30 },
    career_values: { job_security: 95, income: 85, prestige: 80, work_life_balance: 70 },
    negative_conditions: ["avoid_math_heavy"],
    salary_range: { entry_level_million: 13, mid_level_million: 28, senior_level_million: 60 },
    career_progression: ["Risk Analyst", "Senior Risk Specialist", "Head of Risk Management", "Chief Risk Officer (CRO)"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Hiểu sâu luật ngân hàng, cân bằng giữa tốc độ tăng trưởng kinh doanh và ngưỡng an toàn tài chính.",
      future_skills: ["FRM Certification", "Credit Scoring Machine Learning", "Basel III / IV Compliance"],
      summary: "Ngành ngân hàng và các tổ chức tài chính luôn đặt quản trị rủi ro ở vị trí ưu tiên số 1, đảm bảo sự nghiệp ổn định lâu dài."
    },
    related_major_ids: ["finance", "applied_math", "banking", "economics"],
    related_career_ids: ["investment_analyst", "actuary", "auditor"],
    tags: ["Rủi ro", "Basel", "Ngân hàng", "Stress Test", "Thẩm định"]
  },

  // ================= 5. Y TẾ & DƯỢC PHẨM =================
  {
    id: "clinical_pharmacist",
    name: "Dược sĩ Lâm sàng & Nghiên cứu Dược phẩm (Clinical Pharmacist)",
    slug: "clinical-pharmacist",
    industry_id: "healthcare",
    industry_name: "Y tế, Dược phẩm & Công nghệ Sinh học",
    tagline: "Chuyên gia về an toàn dùng thuốc và phát triển dược chất điều trị",
    description: "Tư vấn phác đồ sử dụng thuốc an toàn cho bác sĩ trong bệnh viện; hoặc tham gia nghiên cứu thử nghiệm lâm sàng tại các tập đoàn dược phẩm đa quốc gia.",
    daily_tasks: [
      "Rà soát tương tác thuốc và liều lượng thuốc cho bệnh nhân nội trú",
      "Theo dõi phản ứng có hại của thuốc (ADR) và báo cáo cơ quan y tế",
      "Thực hiện nghiên cứu dược động học (Pharmacokinetics) và thử nghiệm lâm sàng",
      "Tư vấn thông tin thuốc cho điều dưỡng và nhân viên y tế"
    ],
    required_interests: { healthcare: 95, science: 90, nature: 60 },
    required_capabilities: { attention_to_detail: 95, analytical_thinking: 90, problem_solving: 85, learning_agility: 90, communication: 75 },
    work_style: { independent_vs_team: 20, stable_vs_dynamic: -30, structured_vs_flexible: -70, deep_work_vs_multitask: -50, people_vs_system: 20, theory_vs_practice: 50, detail_vs_big_picture: -40 },
    career_values: { social_impact: 95, job_security: 95, income: 80, prestige: 85 },
    negative_conditions: ["avoid_field_work"],
    salary_range: { entry_level_million: 12, mid_level_million: 25, senior_level_million: 50 },
    career_progression: ["Dược sĩ Bệnh viện / Nghiên cứu viên", "Dược sĩ Lâm sàng Chuyên trách", "Trưởng khoa Dược / Medical Advisor", "Medical Director Pharma"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Trực giác lâm sàng, đạo đức nghề y và trách nhiệm sinh mạng trước từng ca bệnh phức tạp.",
      future_skills: ["Pharma AI Screening", "Pharmacogenomics (Dược lý di truyền)", "Clinical Trial Management"],
      summary: "AI hỗ trợ tìm kiếm cấu trúc phân tử thuốc mới; dược sĩ lâm sàng là người gác cổng an toàn tối thượng cho bệnh nhân."
    },
    related_major_ids: ["pharmacy", "biotechnology", "chemistry", "medicine"],
    related_career_ids: ["medical_doctor", "biomedical_engineer"],
    tags: ["Dược", "Thuốc", "Y tế", "Bệnh viện", "Lâm sàng"]
  },
  {
    id: "biomedical_engineer",
    name: "Kỹ sư Kỹ thuật Y sinh (Biomedical Engineer)",
    slug: "biomedical-engineer",
    industry_id: "healthcare",
    industry_name: "Y tế, Dược phẩm & Công nghệ Sinh học",
    tagline: "Giao thoa công nghệ và y học: Chế tạo thiết bị cứu sống con người",
    description: "Thiết kế, bảo trì và phát triển các thiết bị y tế công nghệ cao: máy chụp MRI, CT, máy thở, thiết bị cấy ghép nhân tạo và cảm biến sinh học.",
    daily_tasks: [
      "Nghiên cứu nguyên lý cảm biến sinh học và truyền tín hiệu y sinh",
      "Lắp đặt, hiệu chuẩn và kiểm định các hệ thống thiết bị phòng mổ",
      "Hợp tác với bác sĩ phẫu thuật để thiết kế công cụ trợ phẫu",
      "Lập hồ sơ đăng ký chất lượng thiết bị y tế theo chuẩn CE/FDA"
    ],
    required_interests: { healthcare: 85, engineering: 90, technology: 85, science: 75 },
    required_capabilities: { problem_solving: 90, attention_to_detail: 95, logical_thinking: 90, independent_work: 80, adaptability: 80 },
    work_style: { independent_vs_team: 10, stable_vs_dynamic: 10, structured_vs_flexible: -40, deep_work_vs_multitask: -40, people_vs_system: -60, theory_vs_practice: 70, detail_vs_big_picture: 10 },
    career_values: { social_impact: 95, innovation: 90, job_security: 85, income: 80 },
    negative_conditions: ["avoid_field_work"],
    salary_range: { entry_level_million: 12, mid_level_million: 26, senior_level_million: 55 },
    career_progression: ["Field Service Engineer", "Biomedical R&D Specialist", "Head of Biomedical Engineering", "Medical Device Director"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Cao",
      human_advantage: "Kết hợp cơ khí, điện tử và sinh học vào cơ thể người, đáp ứng tiêu chuẩn an toàn sinh học ngặt nghèo.",
      future_skills: ["AI-Assisted Diagnostic Hardware", "Bio-MEMS", "Medical Robotics"],
      summary: "Ngành nghề giao thoa liên ngành đầy triển vọng với sự gia tăng đầu tư vào bệnh viện chất lượng cao tại Việt Nam."
    },
    related_major_ids: ["biomedical_engineering", "electronics", "mechatronics", "biotechnology"],
    related_career_ids: ["clinical_pharmacist", "mechatronics_engineer"],
    tags: ["Y sinh", "Thiết bị y tế", "Bệnh viện", "Cảm biến", "Robotics Y khoa"]
  },

  // ================= 6. THIẾT KẾ & SÁNG TẠO SỐ =================
  {
    id: "motion_designer",
    name: "Nghệ sĩ Đồ họa Chuyển động & Kỹ xảo (Motion & 3D Designer)",
    slug: "motion-3d-designer",
    industry_id: "creative",
    industry_name: "Thiết kế, Nghệ thuật & Sáng tạo Số",
    tagline: "Thổi hồn vào chuyển động, tạo nên thế giới ảo 3D và trailer mãn nhãn",
    description: "Sản xuất video hoạt hình quảng cáo, hiệu ứng kỹ xảo visual effects (VFX), thiết kế nhân vật game và đồ họa thương hiệu chuyển động.",
    daily_tasks: [
      "Lên ý tưởng kịch bản phân cảnh (Storyboard) và moodboard phong cách",
      "Tạo hình, dựng khung xương và diễn hoạt nhân vật 3D trên Blender / Cinema4D",
      "Thiết kế hiệu ứng chuyển động chữ và icon trên After Effects",
      "Render, chỉnh màu (Color Grading) và tối ưu hóa file xuất cho các nền tảng"
    ],
    required_interests: { arts: 95, design: 95, technology: 75 },
    required_capabilities: { creativity: 95, attention_to_detail: 90, independent_work: 85, problem_solving: 75, adaptability: 80 },
    work_style: { independent_vs_team: -30, stable_vs_dynamic: 40, structured_vs_flexible: 50, deep_work_vs_multitask: -60, people_vs_system: -40, theory_vs_practice: 80, detail_vs_big_picture: 0 },
    career_values: { creativity: 95, autonomy: 85, innovation: 85, income: 75 },
    negative_conditions: ["avoid_programming"],
    salary_range: { entry_level_million: 10, mid_level_million: 22, senior_level_million: 45 },
    career_progression: ["Junior Motion Designer", "Senior 3D Artist", "Motion Lead / Art Director", "Creative Director"],
    ai_impact: {
      automation_exposure: "Trung bình",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Cảm quan nhịp điệu (Rhythm), cảm xúc kịch bản và sự kết hợp nghệ thuật độc bản mà AI sinh ngẫu nhiên không thể kiểm soát chính xác.",
      future_skills: ["Blender 3D", "Unreal Engine 5 Real-time Render", "Generative AI Video Integration"],
      summary: "AI giúp tạo texture và khung hình phụ nhanh chóng; nghệ sĩ đóng vai trò là tổng đạo diễn thị giác tạo ra phong cách riêng biệt."
    },
    related_major_ids: ["multimedia", "graphic_design", "arts"],
    related_career_ids: ["ui_ux_designer", "game_designer", "content_creator"],
    tags: ["Motion", "Blender", "After Effects", "3D", "Kỹ xảo"]
  },

  // ================= 7. TRUYỀN THÔNG & MARKETING =================
  {
    id: "growth_marketer",
    name: "Chuyên viên Tiếp thị Tăng trưởng Số (Growth / Digital Marketer)",
    slug: "growth-digital-marketer",
    industry_id: "communication",
    industry_name: "Truyền thông, Marketing & Nội dung số",
    tagline: "Phát triển tệp khách hàng, tối ưu phễu chuyển đổi và viral thương hiệu",
    description: "Triển khai các chiến dịch quảng cáo đa kênh (Meta, Google, TikTok), tối ưu tỷ lệ chuyển đổi (CRO), email marketing tự động và phân tích dữ liệu hiệu quả tiếp thị.",
    daily_tasks: [
      "Thiết lập và theo dõi chiến dịch quảng cáo tối ưu ngân sách",
      "Phối hợp với team Content/Design để thử nghiệm hàng chục mẫu quảng cáo (A/B Test)",
      "Thiết lập luồng tự động hóa nuôi dưỡng khách hàng (Marketing Automation)",
      "Báo cáo chỉ số chi phí thu hút khách hàng (CAC) và giá trị vòng đời (LTV)"
    ],
    required_interests: { communication: 90, business: 85, data: 75, technology: 70 },
    required_capabilities: { adaptability: 95, analytical_thinking: 85, creativity: 85, communication: 80, strategic_thinking: 80 },
    work_style: { independent_vs_team: 30, stable_vs_dynamic: 70, structured_vs_flexible: 20, deep_work_vs_multitask: 50, people_vs_system: 0, theory_vs_practice: 70, detail_vs_big_picture: 40 },
    career_values: { income: 85, innovation: 90, autonomy: 80, entrepreneurship: 80 },
    negative_conditions: ["avoid_high_pressure"],
    salary_range: { entry_level_million: 11, mid_level_million: 25, senior_level_million: 55 },
    career_progression: ["Digital Marketing Executive", "Growth Marketing Specialist", "Growth Lead / Performance Lead", "Chief Marketing Officer (CMO)"],
    ai_impact: {
      automation_exposure: "Trung bình",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Thấu hiểu văn hóa và tâm lý tiêu dùng địa phương, xây dựng chiến lược định vị thương hiệu dài hạn tránh lệ thuộc quảng cáo trả tiền.",
      future_skills: ["MarTech Stacks", "AI Copywriting & Personalization", "Omnichannel Funnel Optimization"],
      summary: "AI tự động phân bổ ngân sách quảng cáo; chuyên gia tiếp thị tạo ra sự bùng nổ nhờ thông điệp chạm đúng nỗi đau khách hàng."
    },
    related_major_ids: ["marketing", "communication", "business_admin", "e_commerce"],
    related_career_ids: ["product_manager", "business_analyst", "content_creator"],
    tags: ["Marketing", "Performance", "TikTok Ads", "Chuyển đổi", "Tăng trưởng"]
  },

  // ================= 8. GIÁO DỤC & KHAI VẤN =================
  {
    id: "instructional_designer",
    name: "Chuyên gia Thiết kế Trải nghiệm Học tập (Instructional Designer / L&D)",
    slug: "instructional-designer-ld",
    industry_id: "education",
    industry_name: "Giáo dục, Đào tạo & Khai vấn",
    tagline: "Biến tri thức phức tạp thành lộ trình học tập cuốn hút, tương tác và hiệu quả",
    description: "Phát triển khung năng lực, thiết kế bài giảng E-learning cho các tập đoàn hoặc nền tảng EdTech; ứng dụng tâm lý học nhận thức để tối đa hóa tiếp thu.",
    daily_tasks: [
      "Phân tích nhu cầu đào tạo (TNA) của nhân viên hoặc học viên mục tiêu",
      "Thiết kế cấu trúc kịch bản bài học (Storyline, Gamification)",
      "Sử dụng công cụ Articulate 360 / Canva tạo học liệu tương tác",
      "Đo lường mức độ chuyển hóa kiến thức vào công việc thực tế (Kirkpatrick model)"
    ],
    required_interests: { education: 95, communication: 85, design: 70, technology: 65 },
    required_capabilities: { organization: 90, communication: 90, creativity: 85, learning_agility: 85, attention_to_detail: 80 },
    work_style: { independent_vs_team: 20, stable_vs_dynamic: 10, structured_vs_flexible: 0, deep_work_vs_multitask: 0, people_vs_system: 30, theory_vs_practice: 50, detail_vs_big_picture: 30 },
    career_values: { social_impact: 95, work_life_balance: 85, continuous_learning: 90, job_security: 80 },
    negative_conditions: ["avoid_repetitive_work"],
    salary_range: { entry_level_million: 11, mid_level_million: 22, senior_level_million: 40 },
    career_progression: ["L&D Specialist", "Senior Instructional Designer", "Head of Learning & Development", "Chief Learning Officer (CLO)"],
    ai_impact: {
      automation_exposure: "Trung bình",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Thiết kế các hoạt động trải nghiệm thực hành nhóm, lắng nghe khó khăn của người học và khơi dậy động lực nội tại.",
      future_skills: ["Microlearning Design", "AI-assisted Course Authoring", "Competency Framework Mapping"],
      summary: "Các tập đoàn lớn coi đào tạo liên tục là vũ khí cạnh tranh; vai trò thiết kế đào tạo ngày càng được trả lương cao."
    },
    related_major_ids: ["education", "psychology", "communication", "business_admin"],
    related_career_ids: ["hr_manager", "career_coach", "product_manager"],
    tags: ["E-learning", "L&D", "Đào tạo", "Giáo dục", "EdTech"]
  },

  // ================= 9. LUẬT & CHÍNH SÁCH =================
  {
    id: "corporate_lawyer",
    name: "Luật sư Doanh nghiệp & Mua bán Sáp nhập (Corporate / M&A Lawyer)",
    slug: "corporate-lawyer",
    industry_id: "law",
    industry_name: "Luật, Chính sách & Quan hệ Quốc tế",
    tagline: "Kiến trúc sư pháp lý bảo vệ thương vụ đầu tư và quản trị rủi ro doanh nghiệp",
    description: "Soạn thảo và đàm phán các hợp đồng thương mại quốc tế, thẩm định pháp lý (Legal Due Diligence) trong các thương vụ M&A, tư vấn tuân thủ và sở hữu trí tuệ.",
    daily_tasks: [
      "Soạn thảo hợp đồng hợp tác, điều lệ công ty và thỏa thuận cổ đông",
      "Thực hiện rà soát pháp lý toàn diện trong các thương vụ mua bán sáp nhập",
      "Tư vấn giải quyết tranh chấp thương mại và đại diện khách hàng đàm phán",
      "Cập nhật các chính sách thuế, đầu tư nước ngoài và luật sở hữu trí tuệ"
    ],
    required_interests: { law: 95, business: 85, communication: 80 },
    required_capabilities: { logical_thinking: 95, analytical_thinking: 95, attention_to_detail: 95, communication: 90, strategic_thinking: 85 },
    work_style: { independent_vs_team: 0, stable_vs_dynamic: 20, structured_vs_flexible: -60, deep_work_vs_multitask: -40, people_vs_system: 30, theory_vs_practice: 50, detail_vs_big_picture: 20 },
    career_values: { prestige: 95, income: 95, job_security: 85, continuous_learning: 85 },
    negative_conditions: ["avoid_public_speaking", "avoid_high_pressure"],
    salary_range: { entry_level_million: 12, mid_level_million: 30, senior_level_million: 75 },
    career_progression: ["Legal Associate", "Senior Corporate Lawyer", "Partner (Thành viên góp vốn hãng luật)", "Managing Partner / General Counsel"],
    ai_impact: {
      automation_exposure: "Trung bình",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Nghệ thuật đàm phán chiến lược, bảo vệ quyền lợi thân chủ trước bàn đàm phán và đạo đức nghề luật.",
      future_skills: ["Legal AI Contract Analysis", "Tech & IP Law", "Cross-border M&A"],
      summary: "AI giúp tra cứu tiền lệ án và điều khoản nhanh gấp 10 lần; luật sư tập trung vào chiến lược đàm phán đỉnh cao."
    },
    related_major_ids: ["law", "international_law", "international_business", "economics"],
    related_career_ids: ["compliance_officer", "investment_analyst"],
    tags: ["Luật", "Hợp đồng", "M&A", "Pháp chế", "Đàm phán"]
  },

  // ================= 10. KHOA HỌC TỰ NHIÊN & NGHIÊN CỨU =================
  {
    id: "data_scientist",
    name: "Nhà Khoa học Dữ liệu (Data Scientist)",
    slug: "data-scientist",
    industry_id: "science",
    industry_name: "Khoa học Tự nhiên & Nghiên cứu Cơ bản",
    tagline: "Khai phá tri thức ẩn giấu, mô hình hóa các quy luật phức tạp từ dữ liệu lớn",
    description: "Ứng dụng xác suất thống kê nâng cao, machine learning và thuật toán tối ưu để giải quyết các bài toán dự báo, cá nhân hóa và tự động hóa quyết định.",
    daily_tasks: [
      "Khám phá và xây dựng đặc trưng dữ liệu (Feature Engineering)",
      "Xây dựng và so sánh hiệu năng các mô hình dự báo thống kê / ML",
      "Thiết kế thuật toán tối ưu hóa bài toán định giá động hoặc gợi ý sản phẩm",
      "Trình bày kết quả nghiên cứu và phương pháp luận cho các nhóm liên quan"
    ],
    required_interests: { science: 95, data: 95, technology: 85 },
    required_capabilities: { analytical_thinking: 95, logical_thinking: 95, problem_solving: 95, learning_agility: 90, independent_work: 85 },
    work_style: { independent_vs_team: -30, stable_vs_dynamic: 30, structured_vs_flexible: 10, deep_work_vs_multitask: -70, people_vs_system: -80, theory_vs_practice: 30, detail_vs_big_picture: 30 },
    career_values: { innovation: 95, income: 90, continuous_learning: 95, prestige: 85 },
    negative_conditions: ["avoid_math_heavy", "avoid_programming"],
    salary_range: { entry_level_million: 16, mid_level_million: 35, senior_level_million: 70 },
    career_progression: ["Junior Data Scientist", "Senior Data Scientist", "Lead Data Scientist", "Head of Data Science / Chief Scientist"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Đặt câu hỏi nghiên cứu sắc bén, hiểu rõ giới hạn của dữ liệu mẫu và suy luận quan hệ nhân quả (Causal Inference).",
      future_skills: ["Causal Machine Learning", "Advanced Python & PyTorch", "Experimental Design"],
      summary: "Data Scientist đóng vai trò đầu não chiến lược giúp các doanh nghiệp dẫn đầu về công nghệ số."
    },
    related_major_ids: ["data_science", "applied_math", "cs", "economics"],
    related_career_ids: ["ai_engineer", "data_analyst", "investment_analyst"],
    tags: ["Data Science", "Thống kê", "Python", "Mô hình hóa", "Nghiên cứu"]
  },

  // ================= 11. MÔI TRƯỜNG & NÔNG NGHIỆP BỀN VỮNG =================
  {
    id: "esg_specialist",
    name: "Chuyên gia Bền vững & Kiểm kê Carbon (ESG / Sustainability Specialist)",
    slug: "esg-sustainability-specialist",
    industry_id: "environment",
    industry_name: "Môi trường, Nông nghiệp Công nghệ cao & Bền vững",
    tagline: "Định hình chiến lược phát triển xanh, kinh tế tuần hoàn và tín chỉ carbon",
    description: "Giúp doanh nghiệp đo lường dấu chân carbon (Scope 1, 2, 3), lập báo cáo phát triển bền vững theo tiêu chuẩn quốc tế (GRI, ISSB) và chuyển đổi chuỗi cung ứng xanh.",
    daily_tasks: [
      "Thu thập và kiểm kê dữ liệu phát thải khí nhà kính toàn chuỗi cung ứng",
      "Tư vấn giải pháp tiết kiệm năng lượng và năng lượng mặt trời áp mái",
      "Soạn thảo báo cáo phát triển bền vững ESG thường niên của doanh nghiệp",
      "Làm việc với các tổ chức cấp chứng chỉ xanh quốc tế"
    ],
    required_interests: { nature: 95, social_impact: 90, science: 75, business: 75 },
    required_capabilities: { analytical_thinking: 85, organization: 85, communication: 85, strategic_thinking: 85, adaptability: 80 },
    work_style: { independent_vs_team: 20, stable_vs_dynamic: 40, structured_vs_flexible: -20, deep_work_vs_multitask: 30, people_vs_system: 20, theory_vs_practice: 60, detail_vs_big_picture: 50 },
    career_values: { social_impact: 95, innovation: 85, international_opportunity: 85, job_security: 80 },
    negative_conditions: ["avoid_field_work"],
    salary_range: { entry_level_million: 12, mid_level_million: 26, senior_level_million: 55 },
    career_progression: ["ESG Analyst", "Sustainability Project Manager", "Head of Sustainability & ESG", "Chief Sustainability Officer (CSO)"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Rất cao",
      human_advantage: "Làm việc với các tiêu chuẩn chính sách biến đổi liên tục, đàm phán thay đổi thói quen sản xuất và tư vấn chiến lược xanh.",
      future_skills: ["GHG Protocol & Carbon Accounting", "GRI / ISSB Standards", "Circular Economy Models"],
      summary: "Cam kết Net Zero 2050 của Việt Nam và các rào cản thuế carbon của EU (CBAM) biến đây thành ngành nghề 'nóng' bậc nhất hiện nay."
    },
    related_major_ids: ["environmental_science", "business_admin", "chemical_engineering", "economics"],
    related_career_ids: ["supply_chain_specialist", "management_consultant"],
    tags: ["ESG", "Carbon", "Môi trường", "Bền vững", "Net Zero"]
  },

  // ================= 12. DU LỊCH & QUẢN TRỊ TRẢI NGHIỆM =================
  {
    id: "hospitality_manager",
    name: "Nhà Quản trị Khách sạn & Trải nghiệm Cao cấp (Hotel General Manager)",
    slug: "hotel-hospitality-manager",
    industry_id: "hospitality",
    industry_name: "Du lịch, Khách sạn & Quản trị Trải nghiệm",
    tagline: "Nghệ thuật hiếu khách đỉnh cao, quản trị vận hành chuỗi resort và sự kiện quốc tế",
    description: "Quản lý toàn bộ vận hành lưu trú, ẩm thực (F&B), doanh thu phòng và chất lượng dịch vụ chuẩn 5 sao tại các thương hiệu khách sạn quốc tế.",
    daily_tasks: [
      "Kiểm tra chất lượng dịch vụ tại tất cả các khu vực tiền sảnh, buồng phòng",
      "Họp điều phối chiến lược giá phòng và doanh thu (Revenue Management)",
      "Đón tiếp các khách VIP và xử lý phản hồi trải nghiệm tinh tế",
      "Đào tạo và truyền cảm hứng phục vụ cho đội ngũ nhân sự đa văn hóa"
    ],
    required_interests: { communication: 90, business: 85, arts: 60 },
    required_capabilities: { leadership: 95, communication: 95, problem_solving: 90, adaptability: 90, organization: 85 },
    work_style: { independent_vs_team: 70, stable_vs_dynamic: 60, structured_vs_flexible: -10, deep_work_vs_multitask: 70, people_vs_system: 90, theory_vs_practice: 80, detail_vs_big_picture: 50 },
    career_values: { prestige: 90, international_opportunity: 90, income: 85, leadership: 90 },
    negative_conditions: ["avoid_people_intensive_work", "avoid_shift_work"],
    salary_range: { entry_level_million: 10, mid_level_million: 25, senior_level_million: 70 },
    career_progression: ["Duty Manager", "Operations Manager", "Hotel Resident Manager", "General Manager (GM) Resort 5 sao"],
    ai_impact: {
      automation_exposure: "Thấp",
      ai_augmentation_level: "Trung bình",
      human_advantage: "Sự ấm áp, tinh tế trong từng cử chỉ đón tiếp và khả năng làm hài lòng khách hàng khó tính bằng chỉ số cảm xúc EQ cao.",
      future_skills: ["Hospitality Revenue Management", "Cross-cultural Leadership", "Luxury Guest Experience"],
      summary: "Dù công nghệ có phát triển đến đâu, sự chân thành của nụ cười và dịch vụ từ trái tim luôn là đặc quyền của con người."
    },
    related_major_ids: ["hospitality_management", "tourism", "business_admin", "foreign_languages"],
    related_career_ids: ["event_manager", "customer_experience_lead"],
    tags: ["Khách sạn", "Resort", "Hiếu khách", "Dịch vụ", "Sự kiện"]
  }
];
