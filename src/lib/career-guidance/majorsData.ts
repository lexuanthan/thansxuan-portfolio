import { MajorDNA } from "./types";

export const MAJORS_DATA: MajorDNA[] = [
  {
    id: "data_science",
    code: "7480108",
    name: "Khoa học Dữ liệu & Trí tuệ Nhân tạo (AI)",
    slug: "khoa-hoc-du-lieu-ai",
    industry_id: "tech",
    industry_name: "Công nghệ & Trí tuệ nhân tạo (AI)",
    description: "Đào tạo phương pháp thu thập, tiền xử lý và khai phá dữ liệu lớn; thuật toán máy học (Machine Learning), học sâu (Deep Learning) và triển khai mô hình AI.",
    learning_content: [
      "Toán rời rạc, Xác suất thống kê ứng dụng và Đại số tuyến tính",
      "Lập trình Python chuyên sâu, SQL và cấu trúc dữ liệu thuật toán",
      "Machine Learning, Deep Learning và Xử lý ngôn ngữ tự nhiên (NLP)",
      "Điện toán đám mây và kỹ thuật dữ liệu lớn (Big Data Engineering)"
    ],
    suitability_traits: [
      "Tư duy logic và đam mê khám phá các mô hình toán học",
      "Thích tìm kiếm quy luật và ý nghĩa từ những con số",
      "Khả năng tự học công nghệ và đọc tài liệu tiếng Anh tốt"
    ],
    interest_requirements: { data: 95, technology: 85, science: 75, business: 55 },
    ability_requirements: { analytical_thinking: 95, logical_thinking: 90, problem_solving: 90, learning_agility: 90 },
    academic_requirements: {
      required_subjects: ["Toán", "Tin học", "Tiếng Anh", "Vật lý"],
      math_intensity: "Cao",
      english_intensity: "Cao",
      avg_cutoff_score: 26.5
    },
    learning_style: { theory_vs_practice: 20, group_work_intensity: "Trung bình" },
    difficulty_level: "Cao",
    ai_impact: "Ngành học cốt lõi nghiên cứu và phát triển AI; sinh viên tốt nghiệp được săn đón với mức lương khởi điểm hàng đầu.",
    career_paths: ["Data Analyst", "Data Scientist", "AI Engineer", "Machine Learning Specialist", "Business Intelligence Lead"],
    top_universities: [
      { id: "BKA", name: "Đại học Bách Khoa Hà Nội", cutoff: 28.2 },
      { id: "UIT", name: "ĐH Công nghệ Thông tin - ĐHQG TP.HCM", cutoff: 27.5 },
      { id: "HCMUS", name: "ĐH Khoa học Tự nhiên - ĐHQG TP.HCM", cutoff: 26.8 },
      { id: "NEU", name: "Đại học Kinh tế Quốc dân", cutoff: 27.2 }
    ]
  },
  {
    id: "se",
    code: "7480103",
    name: "Kỹ thuật Phần mềm (Software Engineering)",
    slug: "ky-thuat-phan-mem",
    industry_id: "tech",
    industry_name: "Công nghệ & Trí tuệ nhân tạo (AI)",
    description: "Tập trung vào toàn bộ vòng đời phát triển phần mềm: từ khảo sát yêu cầu, thiết kế kiến trúc, lập trình, kiểm thử đến triển khai hệ thống quy mô lớn.",
    learning_content: [
      "Lập trình hướng đối tượng (Java, C++, TypeScript)",
      "Kiến trúc phần mềm, Thiết kế vi dịch vụ (Microservices)",
      "Quy trình phát triển phần mềm Agile / Scrum và CI/CD",
      "Bảo mật ứng dụng và tối ưu cơ sở dữ liệu phân tán"
    ],
    suitability_traits: [
      "Tư duy giải thuật chặt chẽ và khả năng ngồi giải quyết lỗi (debug) kiên trì",
      "Thích tạo ra các sản phẩm công nghệ có người dùng thật",
      "Làm việc nhóm tốt trong các dự án phát triển phần mềm"
    ],
    interest_requirements: { technology: 95, engineering: 80, data: 60 },
    ability_requirements: { logical_thinking: 95, problem_solving: 90, independent_work: 85, learning_agility: 85 },
    academic_requirements: {
      required_subjects: ["Toán", "Tin học", "Tiếng Anh", "Vật lý"],
      math_intensity: "Cao",
      english_intensity: "Cao",
      avg_cutoff_score: 26.0
    },
    learning_style: { theory_vs_practice: 60, group_work_intensity: "Cao" },
    difficulty_level: "Cao",
    ai_impact: "Lập trình viên sử dụng AI Copilot để tăng tốc độ phát triển; chú trọng năng lực kiến trúc và kiểm thử.",
    career_paths: ["Software Engineer", "Frontend / Backend Developer", "DevOps Engineer", "Software Architect"],
    top_universities: [
      { id: "BKA_HCM", name: "ĐH Bách Khoa - ĐHQG TP.HCM", cutoff: 27.5 },
      { id: "UET", name: "ĐH Công nghệ - ĐHQG Hà Nội", cutoff: 27.4 },
      { id: "UIT", name: "ĐH Công nghệ Thông tin TP.HCM", cutoff: 27.2 },
      { id: "FPT", name: "Đại học FPT", cutoff: 23.0 }
    ]
  },
  {
    id: "cs",
    code: "7480101",
    name: "Khoa học Máy tính (Computer Science)",
    slug: "khoa-hoc-may-tinh",
    industry_id: "tech",
    industry_name: "Công nghệ & Trí tuệ nhân tạo (AI)",
    description: "Nền tảng hàn lâm sâu rộng về lý thuyết tính toán, thuật toán phức tạp, hệ điều hành, bảo mật và trí tuệ nhân tạo tiên tiến.",
    learning_content: [
      "Lý thuyết đồ thị, giải thuật nâng cao và độ phức tạp thuật toán",
      "Hệ điều hành, mạng máy tính và trình biên dịch",
      "Học máy, xử lý tín hiệu số và thị giác máy tính",
      "Tính toán song song và điện toán hiệu năng cao (HPC)"
    ],
    suitability_traits: [
      "Niềm đam mê nghiên cứu bản chất các thuật toán",
      "Năng lực toán học trừu tượng xuất sắc",
      "Mong muốn làm việc tại các trung tâm R&D công nghệ cao toàn cầu"
    ],
    interest_requirements: { technology: 95, science: 90, data: 85 },
    ability_requirements: { logical_thinking: 95, analytical_thinking: 95, problem_solving: 95, independent_work: 85 },
    academic_requirements: {
      required_subjects: ["Toán", "Vật lý", "Tiếng Anh", "Tin học"],
      math_intensity: "Cao",
      english_intensity: "Cao",
      avg_cutoff_score: 27.0
    },
    learning_style: { theory_vs_practice: -10, group_work_intensity: "Trung bình" },
    difficulty_level: "Rất cao",
    ai_impact: "Ngành đào tạo những người tạo ra các mô hình AI nền tảng tiếp theo của thế giới.",
    career_paths: ["AI Engineer", "Algorithms Specialist", "Data Scientist", "Research Scientist"],
    top_universities: [
      { id: "BKA", name: "Đại học Bách Khoa Hà Nội", cutoff: 28.5 },
      { id: "BKA_HCM", name: "ĐH Bách Khoa TP.HCM", cutoff: 27.8 },
      { id: "HCMUS", name: "ĐH Khoa học Tự nhiên TP.HCM", cutoff: 27.0 }
    ]
  },
  {
    id: "is",
    code: "7480104",
    name: "Hệ thống Thông tin Quản lý & Phân tích Nghiệp vụ (MIS / Business Information Systems)",
    slug: "he-thong-thong-tin-quan-ly",
    industry_id: "business",
    industry_name: "Kinh doanh, Thương mại & Quản trị",
    description: "Giao thoa hoàn hảo giữa CNTT và Kinh tế: Đào tạo cách thiết kế, quản lý hệ thống dữ liệu doanh nghiệp (ERP, CRM) và phân tích nghiệp vụ số.",
    learning_content: [
      "Phân tích và thiết kế hệ thống thông tin (UML, BPMN)",
      "Cơ sở dữ liệu nâng cao, SQL và Quản trị Data Warehouse",
      "Hệ thống thông tin quản lý doanh nghiệp (SAP, Oracle ERP)",
      "Phân tích kinh doanh (Business Analytics) và Quản trị dự án Agile"
    ],
    suitability_traits: [
      "Thích ứng dụng công nghệ để giải quyết bài toán kinh doanh cụ thể",
      "Giao tiếp tốt và thích làm việc với con người",
      "Tư duy logic nhưng không thích code thuật toán quá nặng"
    ],
    interest_requirements: { business: 90, technology: 75, data: 80, communication: 70 },
    ability_requirements: { analytical_thinking: 90, communication: 85, organization: 85, problem_solving: 85 },
    academic_requirements: {
      required_subjects: ["Toán", "Tiếng Anh", "Tin học", "Ngữ văn"],
      math_intensity: "Trung bình",
      english_intensity: "Cao",
      avg_cutoff_score: 25.5
    },
    learning_style: { theory_vs_practice: 50, group_work_intensity: "Cao" },
    difficulty_level: "Vừa phải",
    ai_impact: "Đóng vai trò chủ chốt trong việc đưa giải pháp AI vào quy trình làm việc thực tế của doanh nghiệp.",
    career_paths: ["Business Analyst (BA)", "Product Manager", "Data Analyst", "ERP Consultant"],
    top_universities: [
      { id: "NEU", name: "Đại học Kinh tế Quốc dân", cutoff: 26.8 },
      { id: "UEH", name: "Đại học Kinh tế TP.HCM", cutoff: 26.5 },
      { id: "UIT", name: "ĐH Công nghệ Thông tin TP.HCM", cutoff: 26.0 },
      { id: "UET", name: "ĐH Công nghệ - ĐHQG Hà Nội", cutoff: 26.2 }
    ]
  },
  {
    id: "cybersecurity",
    code: "7480202",
    name: "An toàn Thông tin (Information Security / Cybersecurity)",
    slug: "an-toan-thong-tin",
    industry_id: "tech",
    industry_name: "Công nghệ & Trí tuệ nhân tạo (AI)",
    description: "Đào tạo mật mã học, phòng thủ mạng, phát hiện xâm nhập, dịch ngược mã độc và điều tra tội phạm mạng (Digital Forensics).",
    learning_content: [
      "Mật mã học cổ điển và hiện đại (RSA, ECC, AES)",
      "An ninh mạng máy tính và phòng thủ hệ thống",
      "Kỹ thuật dịch ngược mã độc và kiểm thử xâm nhập (Pen-test)",
      "Quản lý an toàn thông tin và tiêu chuẩn ISO 27001"
    ],
    suitability_traits: [
      "Tính cẩn trọng, kỷ luật và đạo đức nghề nghiệp liêm chính",
      "Tư duy thám tử: thích điều tra dấu vết và lật ngược vấn đề",
      "Khả năng chịu áp lực cao khi có sự cố hệ thống"
    ],
    interest_requirements: { technology: 90, engineering: 75, law: 60 },
    ability_requirements: { problem_solving: 95, attention_to_detail: 95, logical_thinking: 90, independent_work: 85 },
    academic_requirements: {
      required_subjects: ["Toán", "Tin học", "Tiếng Anh", "Vật lý"],
      math_intensity: "Cao",
      english_intensity: "Cao",
      avg_cutoff_score: 25.8
    },
    learning_style: { theory_vs_practice: 50, group_work_intensity: "Trung bình" },
    difficulty_level: "Cao",
    ai_impact: "AI tạo ra các cuộc tấn công mạng tự động, khiến nhu cầu kỹ sư an ninh mạng phòng thủ tăng vọt.",
    career_paths: ["Cybersecurity Specialist", "SOC Analyst", "Penetration Tester", "CISO"],
    top_universities: [
      { id: "PTIT", name: "Học viện Công nghệ Bưu chính Viễn thông", cutoff: 26.2 },
      { id: "UIT", name: "ĐH Công nghệ Thông tin TP.HCM", cutoff: 26.8 },
      { id: "BKA", name: "Đại học Bách Khoa Hà Nội", cutoff: 27.2 }
    ]
  },
  {
    id: "mechatronics",
    code: "7520114",
    name: "Kỹ thuật Cơ điện tử & Robotics",
    slug: "ky-thuat-co-dien-tu-robotics",
    industry_id: "engineering",
    industry_name: "Kỹ thuật, Cơ điện tử & Tự động hoá",
    description: "Kết hợp giữa cơ khí chính xác, mạch điện tử điều khiển và công nghệ thông tin để chế tạo các hệ thống tự động thông minh và robot.",
    learning_content: [
      "Thiết kế cơ khí 3D và mô phỏng động lực học (CAD/CAM/CAE)",
      "Mạch điện tử công suất, cảm biến và vi điều khiển",
      "Hệ thống điều khiển tự động PLC và khí nén thủy lực",
      "Lập trình robot công nghiệp và thị giác máy tính"
    ],
    suitability_traits: [
      "Thích sáng chế, lắp ráp máy móc và quan sát chuyển động vật lý",
      "Tư duy không gian và giải quyết vấn đề kỹ thuật tốt",
      "Sẵn sàng làm việc tại các xưởng chế tạo và nhà máy thông minh"
    ],
    interest_requirements: { engineering: 95, technology: 85, science: 75 },
    ability_requirements: { logical_thinking: 90, problem_solving: 90, attention_to_detail: 85, independent_work: 80 },
    academic_requirements: {
      required_subjects: ["Toán", "Vật lý", "Tin học", "Hóa học"],
      math_intensity: "Cao",
      english_intensity: "Trung bình",
      avg_cutoff_score: 25.0
    },
    learning_style: { theory_vs_practice: 70, group_work_intensity: "Cao" },
    difficulty_level: "Cao",
    ai_impact: "Tích hợp AI tạo nên các dòng robot tự hành và cánh tay thông minh cho công nghiệp tương lai.",
    career_paths: ["Kỹ sư Cơ điện tử", "Kỹ sư Robotics", "Kỹ sư Tự động hóa", "R&D Automation Lead"],
    top_universities: [
      { id: "BKA", name: "Đại học Bách Khoa Hà Nội", cutoff: 26.8 },
      { id: "BKA_HCM", name: "ĐH Bách Khoa TP.HCM", cutoff: 26.5 },
      { id: "HCMUTE", name: "ĐH Sư phạm Kỹ thuật TP.HCM", cutoff: 25.5 },
      { id: "DUT", name: "ĐH Bách Khoa - ĐH Đà Nẵng", cutoff: 25.0 }
    ]
  },
  {
    id: "semiconductor",
    code: "7520215",
    name: "Thiết kế Vi mạch Bán dẫn (IC Design & Semiconductor)",
    slug: "thiet-ke-vi-mach-ban-dan",
    industry_id: "engineering",
    industry_name: "Kỹ thuật, Cơ điện tử & Tự động hoá",
    description: "Đào tạo chuyên sâu về kiến trúc vi xử lý, thiết kế mạch logic số, mạch tương tự vi mô và quy trình đóng gói kiểm thử chip bán dẫn.",
    learning_content: [
      "Vật lý bán dẫn và linh kiện vi điện tử",
      "Thiết kế mạch số với Verilog và VHDL",
      "Thiết kế mạch tích hợp tương tự (Analog IC Design)",
      "Kiểm thử và xác thực vi mạch (Verification with UVM)"
    ],
    suitability_traits: [
      "Cực kỳ kiên trì, tỉ mỉ và chuẩn xác đến từng chi tiết vi mô",
      "Năng khiếu về vật lý linh kiện và logic điện tử",
      "Khát khao tham gia vào ngành công nghiệp nghìn tỷ đô toàn cầu"
    ],
    interest_requirements: { engineering: 95, technology: 90, science: 85 },
    ability_requirements: { attention_to_detail: 95, analytical_thinking: 95, logical_thinking: 95, problem_solving: 90 },
    academic_requirements: {
      required_subjects: ["Toán", "Vật lý", "Tin học", "Tiếng Anh"],
      math_intensity: "Cao",
      english_intensity: "Cao",
      avg_cutoff_score: 26.0
    },
    learning_style: { theory_vs_practice: 40, group_work_intensity: "Trung bình" },
    difficulty_level: "Rất cao",
    ai_impact: "Chế tạo các con chip chuyên dụng cho tính toán AI (NPU, TPU, GPU), nhu cầu kỹ sư tăng trưởng theo cấp số nhân.",
    career_paths: ["IC Design Engineer", "Chip Verification Engineer", "Physical Layout Specialist", "Silicon Architect"],
    top_universities: [
      { id: "BKA", name: "Đại học Bách Khoa Hà Nội", cutoff: 27.2 },
      { id: "BKA_HCM", name: "ĐH Bách Khoa TP.HCM", cutoff: 27.0 },
      { id: "UIT", name: "ĐH Công nghệ Thông tin TP.HCM", cutoff: 26.5 },
      { id: "VKU", name: "ĐH CNTT Việt - Hàn Đà Nẵng", cutoff: 24.0 }
    ]
  },
  {
    id: "business_admin",
    code: "7340101",
    name: "Quản trị Kinh doanh & Khởi nghiệp",
    slug: "quan-tri-kinh-doanh-khoi-nghiep",
    industry_id: "business",
    industry_name: "Kinh doanh, Thương mại & Quản trị",
    description: "Cung cấp kiến thức toàn diện về quản trị chiến lược, vận hành tổ chức, tài chính doanh nghiệp, marketing và xây dựng mô hình khởi nghiệp.",
    learning_content: [
      "Quản trị học căn bản và Hành vi tổ chức",
      "Quản trị Marketing và Nghiên cứu thị trường",
      "Quản trị Tài chính doanh nghiệp và Kế toán quản trị",
      "Đổi mới sáng tạo và Khởi sự kinh doanh"
    ],
    suitability_traits: [
      "Năng động, thích kết nối và lãnh đạo tập thể",
      "Tư duy chiến lược, nhạy bén trước các cơ hội thị trường",
      "Không ngại đương đầu với thách thức và cạnh tranh"
    ],
    interest_requirements: { business: 95, entrepreneurship: 90, communication: 85 },
    ability_requirements: { leadership: 90, communication: 90, strategic_thinking: 85, adaptability: 90 },
    academic_requirements: {
      required_subjects: ["Toán", "Ngữ văn", "Tiếng Anh"],
      math_intensity: "Trung bình",
      english_intensity: "Trung bình",
      avg_cutoff_score: 25.5
    },
    learning_style: { theory_vs_practice: 60, group_work_intensity: "Cao" },
    difficulty_level: "Vừa phải",
    ai_impact: "AI giúp tự động hóa phân tích thị trường; kỹ năng lãnh đạo con người và ra quyết định chiến lược là cốt lõi.",
    career_paths: ["Quản lý Kinh doanh", "Nhà sáng lập Startup", "Tư vấn Quản trị", "Giám đốc Vận hành"],
    top_universities: [
      { id: "NEU", name: "Đại học Kinh tế Quốc dân", cutoff: 27.2 },
      { id: "UEH", name: "Đại học Kinh tế TP.HCM", cutoff: 26.8 },
      { id: "FTU", name: "Đại học Ngoại thương", cutoff: 27.8 }
    ]
  },
  {
    id: "finance",
    code: "7340201",
    name: "Tài chính - Ngân hàng & Fintech",
    slug: "tai-chinh-ngan-hang-fintech",
    industry_id: "finance",
    industry_name: "Tài chính, Ngân hàng & Fintech",
    description: "Đào tạo nguyên lý vận hành thị trường vốn, phân tích cổ phiếu, trái phiếu, thẩm định tín dụng ngân hàng và ứng dụng công nghệ tài chính (Fintech).",
    learning_content: [
      "Thị trường tài chính và các định chế tài chính",
      "Phân tích báo cáo tài chính và Định giá tài sản",
      "Quản trị danh mục đầu tư và Phái sinh tài chính",
      "Ngân hàng số, Blockchain và Thanh toán điện tử"
    ],
    suitability_traits: [
      "Nhạy bén với biến động kinh tế và các chỉ số tiền tệ",
      "Tư duy tính toán nhanh, cẩn thận và tôn trọng tính chính xác",
      "Mong muốn làm việc trong môi trường tài chính chuyên nghiệp"
    ],
    interest_requirements: { finance: 95, business: 85, data: 80 },
    ability_requirements: { analytical_thinking: 95, logical_thinking: 90, attention_to_detail: 90, strategic_thinking: 85 },
    academic_requirements: {
      required_subjects: ["Toán", "Tiếng Anh", "Ngữ văn"],
      math_intensity: "Cao",
      english_intensity: "Cao",
      avg_cutoff_score: 26.2
    },
    learning_style: { theory_vs_practice: 50, group_work_intensity: "Trung bình" },
    difficulty_level: "Cao",
    ai_impact: "AI hỗ trợ thuật toán giao dịch (Algorithmic Trading) và chấm điểm tín dụng; vai trò tư vấn chiến lược đầu tư giữ vị trí độc tôn.",
    career_paths: ["Investment Analyst", "Risk Manager", "Financial Planner", "Fintech Product Manager"],
    top_universities: [
      { id: "NEU", name: "Đại học Kinh tế Quốc dân", cutoff: 27.5 },
      { id: "UEH", name: "Đại học Kinh tế TP.HCM", cutoff: 26.9 },
      { id: "BA", name: "Học viện Ngân hàng", cutoff: 26.0 }
    ]
  },
  {
    id: "logistics",
    code: "7510605",
    name: "Logistics & Quản lý Chuỗi Cung ứng",
    slug: "logistics-chuoi-cung-ung",
    industry_id: "business",
    industry_name: "Kinh doanh, Thương mại & Quản trị",
    description: "Đào tạo quản lý luồng lưu chuyển hàng hóa, chứng từ xuất nhập khẩu, quản trị kho bãi thông minh và tối ưu hóa mạng lưới vận tải quốc tế.",
    learning_content: [
      "Quản trị Logistics quốc tế và Vận tải đa phương thức",
      "Nghiệp vụ Ngoại thương và Thủ tục Hải quan",
      "Quản trị kho hàng và Quản trị tồn kho",
      "Mô hình hóa và Tối ưu hóa chuỗi cung ứng"
    ],
    suitability_traits: [
      "Năng lực tổ chức, sắp xếp công việc khoa học và ngăn nắp",
      "Khả năng ứng biến nhanh với tình huống phát sinh",
      "Thích môi trường giao thương quốc tế năng động"
    ],
    interest_requirements: { business: 85, data: 70, communication: 75 },
    ability_requirements: { organization: 90, problem_solving: 90, adaptability: 85, communication: 80 },
    academic_requirements: {
      required_subjects: ["Toán", "Tiếng Anh", "Địa lý"],
      math_intensity: "Trung bình",
      english_intensity: "Cao",
      avg_cutoff_score: 26.5
    },
    learning_style: { theory_vs_practice: 70, group_work_intensity: "Cao" },
    difficulty_level: "Vừa phải",
    ai_impact: "AI định tuyến xe tải và tự động hóa kho hàng; con người điều phối chiến lược và quan hệ đối tác.",
    career_paths: ["Supply Chain Specialist", "Logistics Planner", "Procurement Officer", "Operations Director"],
    top_universities: [
      { id: "FTU", name: "Đại học Ngoại thương", cutoff: 28.0 },
      { id: "NEU", name: "Đại học Kinh tế Quốc dân", cutoff: 27.4 },
      { id: "UEH", name: "Đại học Kinh tế TP.HCM", cutoff: 27.0 },
      { id: "UTH", name: "ĐH Giao thông Vận tải TP.HCM", cutoff: 24.5 }
    ]
  },
  {
    id: "marketing",
    code: "7340115",
    name: "Marketing & Truyền thông Tiếp thị Số",
    slug: "marketing-truyen-thong-so",
    industry_id: "communication",
    industry_name: "Truyền thông, Marketing & Nội dung số",
    description: "Đào tạo thấu hiểu insight người tiêu dùng, xây dựng thương hiệu, sáng tạo nội dung đa nền tảng và triển khai chiến dịch tiếp thị số dựa trên dữ liệu.",
    learning_content: [
      "Hành vi người tiêu dùng và Tâm lý học tiếp thị",
      "Quản trị thương hiệu và Chiến lược định vị",
      "Digital Marketing (SEO, SEM, Social Media, Content)",
      "Phân tích dữ liệu tiếp thị (Marketing Analytics)"
    ],
    suitability_traits: [
      "Trực giác nhạy cảm với xu hướng xã hội và thị hiếu giới trẻ",
      "Giao tiếp lôi cuốn, tư duy ngôn từ và hình ảnh sáng tạo",
      "Kết hợp giữa nghệ thuật bay bổng và kỷ luật số liệu"
    ],
    interest_requirements: { communication: 90, business: 85, design: 70, data: 65 },
    ability_requirements: { creativity: 90, adaptability: 90, communication: 90, analytical_thinking: 80 },
    academic_requirements: {
      required_subjects: ["Ngữ văn", "Tiếng Anh", "Toán"],
      math_intensity: "Trung bình",
      english_intensity: "Cao",
      avg_cutoff_score: 26.8
    },
    learning_style: { theory_vs_practice: 70, group_work_intensity: "Cao" },
    difficulty_level: "Vừa phải",
    ai_impact: "AI hỗ trợ viết content và làm banner; năng lực thấu cảm con người và sáng tạo chiến dịch viral là vũ khí bất bại.",
    career_paths: ["Digital Marketer", "Brand Specialist", "Content Strategist", "Chief Marketing Officer"],
    top_universities: [
      { id: "FTU", name: "Đại học Ngoại thương", cutoff: 27.8 },
      { id: "NEU", name: "Đại học Kinh tế Quốc dân", cutoff: 27.5 },
      { id: "UEH", name: "Đại học Kinh tế TP.HCM", cutoff: 27.1 }
    ]
  },
  {
    id: "pharmacy",
    code: "7720201",
    name: "Dược học (Pharmacy)",
    slug: "duoc-hoc",
    industry_id: "healthcare",
    industry_name: "Y tế, Dược phẩm & Công nghệ Sinh học",
    description: "Đào tạo chuyên sâu về hóa dược, dược lý, dược động học, bào chế thuốc, kiểm nghiệm chất lượng và sử dụng thuốc lâm sàng an toàn.",
    learning_content: [
      "Hóa hữu cơ, Hóa dược và Hóa phân tích",
      "Dược lý học, Độc chất học và Dược lâm sàng",
      "Công nghệ Bào chế và Sinh dược học",
      "Pháp chế Dược và Quản trị kinh doanh dược"
    ],
    suitability_traits: [
      "Đức tính cẩn trọng, kỷ luật và trung thực tuyệt đối",
      "Niềm say mê môn Hóa học và Sinh học",
      "Tâm niệm cống hiến vì sức khỏe cộng đồng"
    ],
    interest_requirements: { healthcare: 95, science: 90, nature: 65 },
    ability_requirements: { attention_to_detail: 95, analytical_thinking: 90, learning_agility: 85, problem_solving: 85 },
    academic_requirements: {
      required_subjects: ["Hóa học", "Toán", "Sinh học", "Vật lý"],
      math_intensity: "Cao",
      english_intensity: "Trung bình",
      avg_cutoff_score: 25.5
    },
    learning_style: { theory_vs_practice: 50, group_work_intensity: "Trung bình" },
    difficulty_level: "Cao",
    ai_impact: "AI rút ngắn chu kỳ tìm kiếm hoạt chất thuốc; vai trò thẩm định lâm sàng và cấp phát an toàn vẫn thuộc về Dược sĩ.",
    career_paths: ["Clinical Pharmacist", "Dược sĩ R&D", "Kiểm nghiệm viên Dược phẩm", "Trưởng phòng Kinh doanh Dược"],
    top_universities: [
      { id: "DHY_HN", name: "Đại học Dược Hà Nội", cutoff: 26.5 },
      { id: "DHYD_HCM", name: "ĐH Y Dược TP.HCM", cutoff: 26.8 },
      { id: "DHY_DNG", name: "Khoa Y Dược - ĐH Đà Nẵng", cutoff: 24.5 }
    ]
  },
  {
    id: "law",
    code: "7380107",
    name: "Luật Kinh tế & Luật Thương mại Quốc tế",
    slug: "luat-kinh-te-thuong-mai",
    industry_id: "law",
    industry_name: "Luật, Chính sách & Quan hệ Quốc tế",
    description: "Trang bị kiến thức pháp lý về hợp đồng thương mại, pháp luật doanh nghiệp, cạnh tranh, phá sản, giải quyết tranh chấp kinh tế và trọng tài quốc tế.",
    learning_content: [
      "Lý luận chung về Nhà nước và Pháp luật",
      "Luật Doanh nghiệp, Luật Đầu tư và Luật Thương mại",
      "Pháp luật Hợp đồng và Tranh chấp kinh doanh quốc tế",
      "Luật Sở hữu trí tuệ và Pháp luật Tài chính - Ngân hàng"
    ],
    suitability_traits: [
      "Khả năng đọc hiểu văn bản phức tạp và trí nhớ tốt",
      "Tư duy phản biện, suy luận logic sắc sảo",
      "Bản lĩnh và kỹ năng trình bày, bảo vệ quan điểm tự tin"
    ],
    interest_requirements: { law: 95, business: 85, communication: 80 },
    ability_requirements: { logical_thinking: 95, analytical_thinking: 95, attention_to_detail: 95, communication: 90 },
    academic_requirements: {
      required_subjects: ["Ngữ văn", "Toán", "Tiếng Anh", "Lịch sử"],
      math_intensity: "Trung bình",
      english_intensity: "Cao",
      avg_cutoff_score: 26.0
    },
    learning_style: { theory_vs_practice: 40, group_work_intensity: "Trung bình" },
    difficulty_level: "Cao",
    ai_impact: "AI giúp rà soát điều khoản hợp đồng nhanh chóng; nghệ thuật tranh tụng và đàm phán thương lượng thuộc về con người.",
    career_paths: ["Corporate Lawyer", "Chuyên viên Pháp chế Doanh nghiệp", "Thư ký Tòa án / Thẩm phán", "Trọng tài viên Thương mại"],
    top_universities: [
      { id: "HLU", name: "Đại học Luật Hà Nội", cutoff: 26.8 },
      { id: "UL_HCM", name: "Đại học Luật TP.HCM", cutoff: 26.5 },
      { id: "NEU", name: "Đại học Kinh tế Quốc dân", cutoff: 26.2 }
    ]
  },
  {
    id: "multimedia",
    code: "7210403",
    name: "Thiết kế Đồ họa & Truyền thông Đa phương tiện",
    slug: "thiet-ke-do-hoa-da-phuong-tien",
    industry_id: "creative",
    industry_name: "Thiết kế, Nghệ thuật & Sáng tạo Số",
    description: "Đào tạo nghệ thuật thị giác, thiết kế nhận diện thương hiệu, đồ họa 2D/3D, kỹ xảo điện ảnh và thiết kế trải nghiệm người dùng số.",
    learning_content: [
      "Nguyên lý thị giác, Màu sắc học và Nghệ thuật chữ (Typography)",
      "Bộ công cụ thiết kế chuyên nghiệp (Photoshop, Illustrator, InDesign)",
      "Thiết kế 3D và Hoạt hình chuyển động (Blender, After Effects)",
      "Thiết kế giao diện ứng dụng số (Figma UI/UX)"
    ],
    suitability_traits: [
      "Trực giác thẩm mỹ tốt và niềm đam mê vẽ, tạo hình",
      "Thích thể hiện tư tưởng qua hình ảnh và trải nghiệm nghe nhìn",
      "Tư duy cởi mở, không ngại thử nghiệm phong cách mới"
    ],
    interest_requirements: { arts: 95, design: 95, technology: 75 },
    ability_requirements: { creativity: 95, attention_to_detail: 90, independent_work: 85, problem_solving: 75 },
    academic_requirements: {
      required_subjects: ["Ngữ văn", "Tiếng Anh", "Mỹ thuật / Vẽ"],
      math_intensity: "Thấp",
      english_intensity: "Trung bình",
      avg_cutoff_score: 24.5
    },
    learning_style: { theory_vs_practice: 85, group_work_intensity: "Trung bình" },
    difficulty_level: "Vừa phải",
    ai_impact: "AI giúp phác thảo concept nhanh gấp 10 lần; nhà thiết kế định hướng phong cách nghệ thuật tổng thể.",
    career_paths: ["UI/UX Designer", "Motion Designer", "Graphic Designer", "Art Director"],
    top_universities: [
      { id: "MTCN", name: "Đại học Mỹ thuật Công nghiệp", cutoff: 24.0 },
      { id: "KIENTRUC_HCM", name: "Đại học Kiến trúc TP.HCM", cutoff: 25.5 },
      { id: "FPT", name: "Đại học FPT", cutoff: 22.0 }
    ]
  }
];
