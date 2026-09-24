import type { AboutPage, AiTool, Category, Post, Project, Settings } from "@/lib/types";

const NOW = "1970-01-01T00:00:00.000Z";

function project(
  id: string,
  title: string,
  description: string,
  tags: string[],
  color: string,
  sort_order: number,
  link_url: string | null = null
): Project {
  return {
    id,
    title,
    slug: id,
    description,
    content: "",
    image_url: null,
    tags,
    color,
    link_url,
    featured: sort_order <= 3,
    published: true,
    sort_order,
    created_at: NOW,
    updated_at: NOW,
  };
}

export const FALLBACK_PROJECTS: Project[] = [
  project(
    "edupath-platform",
    "EduPath — Bản đồ Hướng nghiệp 2026",
    "Ứng dụng web gamified 9 màn thám hiểm giúp học sinh THPT khám phá năng lực và chọn trường đại học phù hợp.",
    ["Next.js", "AI Education", "Gamification"],
    "from-yellow-100 to-amber-100",
    1,
    "/ai-tools/edupath"
  ),
  project(
    "riasec-career-survey",
    "Khảo sát Hướng nghiệp RIASEC & Đa trí tuệ",
    "Bộ công cụ đối chiếu 6 nhóm tính cách Holland và thuyết đa trí tuệ với ngân hàng dữ liệu các ngành đào tạo đại học.",
    ["Holland RIASEC", "EdTech", "Analytics"],
    "from-purple-100 to-pink-100",
    2,
    "/ai-tools/huong-nghiep"
  ),
  project(
    "browser-logo-composer",
    "Ghép Logo & Chữ lên ảnh (Canvas Studio)",
    "Công cụ xử lý đồ họa trực tiếp trên trình duyệt, giữ nguyên từng pixel logo gốc và không bị AI vẽ lại sai.",
    ["Canvas API", "Web App", "Branding"],
    "from-blue-100 to-cyan-100",
    3,
    "/ai-tools/logo-composer"
  ),
  project(
    "tra-cuu-dai-hoc-hub",
    "Tra cứu Điểm chuẩn Đại học Toàn quốc",
    "Cơ sở dữ liệu điểm chuẩn, học phí và tỷ lệ việc làm của hơn 200 trường đại học Việt Nam với bộ lọc thông minh.",
    ["Data Search", "University", "Interactive"],
    "from-green-100 to-emerald-100",
    4,
    "/#tra-cuu-dai-hoc"
  ),
  project(
    "brand-strategy-analyzer",
    "Brand Strategy & AI Persona Studio",
    "Hệ thống định vị 12 hình mẫu thương hiệu Carl Jung, ma trận tông giọng Do's & Don'ts và tạo AI System Prompt tự hành.",
    ["Branding", "AI System Prompt", "Strategy"],
    "from-purple-100 to-pink-100",
    5,
    "/ai-tools/brand-strategy"
  ),
  project(
    "social-media-content-lab",
    "Social Media Content Lab",
    "Quy trình và công cụ sáng tạo nội dung đa nền tảng kết hợp AI hỗ trợ tối ưu thông điệp truyền thông.",
    ["Content", "Social Media", "AI Tools"],
    "from-indigo-100 to-blue-100",
    6
  ),
];

function tool(
  id: string,
  title: string,
  description: string,
  icon: string,
  color: string,
  sort_order: number,
  status = "Coming Soon",
  status_color = "yellow",
  link_url: string | null = null
): AiTool {
  return {
    id,
    title,
    description,
    icon,
    color,
    status,
    status_color,
    link_url,
    published: true,
    sort_order,
    created_at: NOW,
    updated_at: NOW,
  };
}

export const FALLBACK_AI_TOOLS: AiTool[] = [
  tool(
    "career-guidance-v3",
    "Trợ lý AI Hướng nghiệp & Ra Quyết định",
    "Hệ thống trí tuệ hướng nghiệp toàn diện: Đánh giá thích ứng, so khớp tất định 80+ nghề & 60+ ngành, phân tích khoảng trống kỹ năng, lộ trình 5 chặng và AI Coach đồng hành.",
    "🧭",
    "from-indigo-100 to-blue-100",
    0,
    "Mới • VIP",
    "green",
    "/ai-tools/career-guidance"
  ),
  tool(
    "edupath-2026",
    "EduPath 2026",
    "Bản đồ định hướng đại học 9 ải, dự báo điểm chuẩn và phân tích nguyện vọng cá nhân hoá.",
    "🎓",
    "from-yellow-100 to-amber-100",
    1,
    "Sẵn sàng",
    "green",
    "/ai-tools/edupath"
  ),
  tool(
    "huong-nghiep-riasec",
    "Khảo sát Hướng nghiệp RIASEC",
    "Khảo sát 62 câu hỏi đối chiếu đặc trưng ngành học, tính cách Holland và thuyết đa trí tuệ.",
    "🧭",
    "from-purple-100 to-pink-100",
    2,
    "Sẵn sàng",
    "green",
    "/ai-tools/huong-nghiep"
  ),
  tool(
    "logo-composer",
    "Ghép Logo & Chữ lên ảnh",
    "Công cụ canvas ghép logo vector gốc và typography pixel-perfect trực tiếp trên trình duyệt.",
    "🖼️",
    "from-blue-100 to-cyan-100",
    3,
    "Hoạt động",
    "blue",
    "/ai-tools/logo-composer"
  ),
  tool(
    "content-generator",
    "AI Content Generator",
    "Hỗ trợ xây dựng kịch bản video, cấu trúc bài viết và copywriting truyền thông thương hiệu.",
    "✍️",
    "from-orange-100 to-red-100",
    4,
    "Đang thử nghiệm",
    "yellow"
  ),
  tool(
    "brand-strategy-studio",
    "Brand Voice & Strategy Studio",
    "Định vị 12 hình mẫu Carl Jung, ma trận quy tắc phát ngôn Do's & Don'ts và xuất System Prompt chuẩn hóa cho AI.",
    "🎯",
    "from-purple-100 to-pink-100",
    4,
    "Sẵn sàng",
    "green",
    "/ai-tools/brand-strategy"
  ),
  tool(
    "seo-optimizer",
    "SEO & Keyword Planner",
    "Tối ưu hóa nội dung web, nghiên cứu từ khóa và tạo metadata chuẩn SEO tự động.",
    "🔍",
    "from-indigo-100 to-blue-100",
    6,
    "Coming Soon",
    "yellow"
  ),
];

export const FALLBACK_ABOUT: AboutPage = {
  id: 1,
  heading: "👋 Hi, I'm Thân",
  bio: [
    "Tôi là **Lê Xuân Thân**, sinh ngày 20/04/1992 — brand strategist, designer và người mê ứng dụng AI vào truyền thông thương hiệu.",
    "Ban ngày tôi phụ trách mảng thiết kế và đổi mới sáng tạo trong quản trị thương hiệu & truyền thông: xây dựng câu chuyện thương hiệu, thiết kế bộ nhận diện, dựng video và sáng tạo nội dung.",
    "Ban đêm (và cuối tuần) tôi là **nghiên cứu sinh tiến sĩ ngành Quản lý kinh tế**, tập trung vào cách AI và công nghệ thay đổi cách làm marketing, branding và chiến lược kinh doanh.",
    "Điều thúc đẩy tôi là **sự đổi mới và sáng tạo không ngừng**. Tôi tin tương lai của branding nằm ở giao điểm giữa sáng tạo của con người và trí tuệ nhân tạo.",
  ].join("\n\n"),
  skills: [
    {
      category: "Brand & Design",
      items: ["Brand Strategy", "Visual Identity", "UI/UX Design", "Design Systems"],
    },
    {
      category: "Content Creation",
      items: ["Copywriting", "Video Storytelling", "Social Media", "Content Strategy"],
    },
    {
      category: "AI & Technology",
      items: ["AI/ML Integration", "Data Analysis", "Automation", "Web Development"],
    },
    {
      category: "Research",
      items: [
        "Consumer Research",
        "Market Analysis",
        "Data Visualization",
        "Business Intelligence",
      ],
    },
  ],
  journey: [
    {
      year: "2012-2016",
      title: "Undergraduate Studies",
      desc: "Nền tảng về kinh doanh và nguyên lý thiết kế",
    },
    {
      year: "2017-2022",
      title: "Professional Work in Branding",
      desc: "Dẫn dắt đội ngũ sáng tạo, quản lý chiến dịch thương hiệu, xây dựng design system",
    },
    {
      year: "2023-Present",
      title: "PhD Student + AI Innovator",
      desc: "Nghiên cứu giao điểm AI và quản trị thương hiệu, song song xây dựng các AI tools",
    },
    {
      year: "2024-Future",
      title: "Creator & Entrepreneur",
      desc: "Xây dựng thương hiệu cá nhân, tạo giải pháp AI, mở rộng giới hạn sáng tạo",
    },
  ],
  core_values: [
    { icon: "✨", title: "Creativity", desc: "Luôn phá vỡ giới hạn, nghĩ khác đi" },
    { icon: "🎯", title: "Strategy", desc: "Quyết định dựa trên dữ liệu, không chỉ đẹp mắt" },
    { icon: "🚀", title: "Innovation", desc: "Đón nhận công nghệ và phương pháp mới" },
  ],
  updated_at: NOW,
};
export const FALLBACK_SETTINGS: Settings = {
  id: 1,
  site_title: "Lê Xuân Thân — Content Creator & Tech Builder",
  site_description:
    "Tôi chia sẻ những nội dung hữu ích về công nghệ, AI, sáng tạo và truyền thông. Đồng thời tôi cũng phát triển các công cụ, ứng dụng web giúp tối ưu công việc và học tập.",
  brand_name: "Lê Xuân Thân",
  hero_title: "Lê Xuân Thân",
  hero_subtitle: "Người sáng tạo nội dung & xây dựng ứng dụng công nghệ",
  quote: "Học hỏi mỗi ngày, tạo ra giá trị mỗi ngày!",
  hero_image_url: null,
  email: "",
  phone: "",
  location: "",
  footer_text:
    "Chia sẻ nội dung về công nghệ, AI và sáng tạo. Đồng thời tự phát triển các công cụ web phục vụ công việc và học tập.",
  social: {},
  updated_at: NOW,
};

export const FALLBACK_CATEGORIES: Category[] = [
  {
    id: "069abd25-b0aa-4b6f-bead-c176cc3e0592",
    name: "Công nghệ",
    slug: "cong-nghe",
    description: "Cập nhật công nghệ, hạ tầng đám mây và hệ thống AI thế hệ mới.",
    sort_order: 1,
    created_at: NOW,
  },
  {
    id: "b28f47e6-d754-4721-8f04-56d382b1c8ef",
    name: "AI & Công cụ",
    slug: "ai-va-cong-cu",
    description: "Công cụ AI thực chiến tối ưu hiệu suất công việc và học tập.",
    sort_order: 2,
    created_at: NOW,
  },
  {
    id: "6f4321d6-49b1-4f0e-9ee7-95cab83ff992",
    name: "Sáng tạo nội dung",
    slug: "sang-tao-noi-dung",
    description: "Kỹ năng sáng tạo nội dung, video storytelling và truyền thông số.",
    sort_order: 3,
    created_at: NOW,
  },
  {
    id: "3f70b98f-353d-4a04-b407-7c21e43f462f",
    name: "Thương hiệu",
    slug: "thuong-hieu",
    description: "Chiến lược định vị thương hiệu cá nhân và quản trị truyền thông.",
    sort_order: 4,
    created_at: NOW,
  },
  {
    id: "091e245b-c798-4427-9308-0d39ed886346",
    name: "Kỹ năng",
    slug: "ky-nang",
    description: "Định hướng nghề nghiệp, kỹ năng mềm và phương pháp luận thành công.",
    sort_order: 5,
    created_at: NOW,
  },
];

export const FALLBACK_POSTS: Post[] = [
  {
    id: "872605e6-8fd5-45c2-8256-0f431188d530",
    title: "Định Hướng Nghề Nghiệp Kỷ Nguyên AI: 5 Nhóm Ngành Bền Vững & Bộ Kỹ Năng Bất Tử",
    slug: "dinh-huong-nghe-nghiep-ky-nguyen-ai-5-nhom-nganh-bat-tu",
    category_id: "091e245b-c798-4427-9308-0d39ed886346",
    category_name: "Kỹ năng",
    cover_url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80",
    tags: ["Định hướng nghề nghiệp", "AI & Tương lai", "Kỹ năng mềm", "Thị trường lao động"],
    featured: true,
    published: true,
    views: 142,
    published_at: "2026-09-16T08:30:00Z",
    created_at: NOW,
    updated_at: NOW,
    excerpt: "Bức tranh việc làm 2026-2030 đang biến chuyển với tốc độ chưa từng có. Đâu là 5 nhóm ngành sở hữu hào bảo vệ tự nhiên trước làn sóng tự động hóa, và bộ kỹ năng nào giúp bạn duy trì lợi thế cạnh tranh độc bản?",
    content: `<h2>Bối cảnh mới: Khi AI không thay thế con người, nhưng người làm chủ AI sẽ thay thế phần còn lại</h2>
<p>Báo cáo Tương lai Việc làm (Future of Jobs) của Diễn đàn Kinh tế Thế giới (WEF) chỉ ra rằng đến năm 2030, hơn 85 triệu công việc truyền thống sẽ biến mất hoặc tái định hình, trong khi gần 97 triệu vai trò mới xuất hiện xoay quanh sự hợp tác giữa người và máy móc. Làn sóng Generative AI và các hệ thống AI Agent tự hành không còn là câu chuyện viễn tưởng mà đã len lỏi vào từng ngõ ngách văn phòng: từ viết mã, dịch thuật, phân tích tài chính đến thiết kế đồ họa.</p>
<p>Điều này đặt học sinh, sinh viên và người đi làm trẻ trước một câu hỏi sinh tử: <em>"Học ngành gì để không bị lỗi thời sau 4 năm đại học?"</em></p>

<h2>5 Nhóm ngành sở hữu sức đề kháng cao nhất trước tự động hoá</h2>
<h3>1. Nhóm ngành Công nghệ lõi & Điều phối hệ thống AI (Core Tech & AI Orchestration)</h3>
<p>AI không tự xuất hiện và tự duy trì. Các chuyên gia nghiên cứu thuật toán học sâu (Deep Learning), kỹ sư hạ tầng đám mây (Cloud & MLOps), bảo mật thông tin (Cybersecurity) và các kiến trúc sư tích hợp AI vào quy trình doanh nghiệp luôn nằm trong danh sách săn đón hàng đầu với mức đãi ngộ vượt trội.</p>

<h3>2. Y tế, Chăm sóc sức khỏe & Trị liệu tâm lý (Healthcare & Wellbeing)</h3>
<p>Dù AI có thể đọc phim X-quang chuẩn xác hay gợi ý phác đồ điều trị, nó không bao giờ có thể thay thế cái nắm tay an ủi của người điều dưỡng, sự thấu cảm của bác sĩ lâm sàng hay ánh mắt đồng cảm của chuyên gia tâm lý. Nhu cầu chăm sóc sức khỏe tinh thần và thể chất toàn diện tại Việt Nam đang tăng trưởng theo cấp số nhân.</p>

<h3>3. Sáng tạo chiến lược & Quản trị thương hiệu (Strategic Creative & Branding)</h3>
<p>AI có thể vẽ một bức tranh trong 5 giây, nhưng AI không biết tại sao bức tranh đó lại chạm đến trái tim của một phân khúc khách hàng mục tiêu tại một thời điểm văn hóa cụ thể. Những nhà chiến lược thương hiệu, giám đốc nghệ thuật và chuyên gia kể chuyện (storyteller) kết hợp tư duy kinh doanh sẽ luôn là linh hồn của mọi chiến dịch.</p>

<h3>4. Giáo dục khai phóng & Khai vấn nhân tài (Education & Coaching)</h3>
<p>Khi kiến thức được phổ cập miễn phí ở khắp mọi nơi trên Internet, vai trò của người thầy chuyển dịch từ "người truyền thụ kiến thức" sang "người truyền cảm hứng, định hướng tư duy phản biện và đồng hành khai mở tiềm năng". Huấn luyện viên cá nhân, cố vấn học đường và chuyên gia hướng nghiệp là những ngành nghề ngày càng được trân trọng.</p>

<h3>5. Kinh tế xanh, Năng lượng tái tạo & Phát triển bền vững (ESG)</h3>
<p>Biến đổi khí hậu và cam kết Net Zero 2050 mở ra một đại dương xanh về việc làm: từ kỹ sư năng lượng gió/mặt trời, chuyên gia thẩm định dấu chân carbon, đến nhà quản lý chuỗi cung ứng tuần hoàn. Đây là lĩnh vực đòi hỏi sự kết hợp phức tạp giữa chính sách vĩ mô, khoa học tự nhiên và kinh tế học.</p>

<h2>Bộ tứ kỹ năng "bất tử" trong kỷ nguyên AI</h2>
<ul>
  <li><strong>Tư duy phản biện sắc bén (Critical Thinking):</strong> Khả năng phân biệt sự thật và ảo giác (hallucination) của AI, đặt câu hỏi ngược lại vấn đề và đánh giá tính xác thực của dữ liệu.</li>
  <li><strong>Trí tuệ cảm xúc & Thấu cảm (High-EQ & Empathy):</strong> Lắng nghe thấu hiểu, xây dựng niềm tin giữa người với người và điều hướng các mối quan hệ xã hội phức tạp.</li>
  <li><strong>Năng lực điều phối & Làm chủ AI (AI Orchestration):</strong> Biến các mô hình ngôn ngữ lớn và công cụ tự động hóa thành đòn bẩy nhân đôi, nhân ba năng suất cá nhân thay vì sợ hãi bị thay thế.</li>
  <li><strong>Tư duy học tập suốt đời (Lifelong Learning & Agility):</strong> Sẵn sàng từ bỏ những kiến thức cũ đã lỗi thời (unlearn) và nhanh chóng tiếp thu những công cụ mới (relearn).</li>
</ul>

<blockquote>"Trong thế giới nơi câu trả lời trở nên dễ dàng và rẻ mạt nhờ AI, giá trị của con người nằm ở khả năng đặt ra những câu hỏi sâu sắc và dũng cảm hành động vì chúng."</blockquote>

<h2>Lời khuyên thực chiến cho các bạn trẻ</h2>
<p>Đừng chọn ngành chỉ vì trào lưu hay điểm chuẩn năm trước tăng vọt. Hãy bắt đầu từ việc thấu hiểu bản thân thông qua các công cụ khoa học như trắc nghiệm Holland RIASEC và bản đồ hướng nghiệp EduPath 2026 ngay trên website này. Khi bạn chọn đúng điểm giao thoa giữa <strong>điều bạn giỏi</strong>, <strong>điều bạn yêu thích</strong> và <strong>nhu cầu thực của xã hội</strong>, bạn sẽ luôn vững vàng trước mọi biến động công nghệ.</p>`,
  },
  {
    id: "bf062a87-5dee-470b-97eb-463202203702",
    title: "Top 7 Ứng Dụng AI Đột Phá Giúp Học Sinh & Sinh Viên Tăng Gấp 3 Lần Hiệu Suất Tự Học 2026",
    slug: "top-7-ung-dung-ai-tang-gap-3-hieu-suat-hoc-tap-2026",
    category_id: "b28f47e6-d754-4721-8f04-56d382b1c8ef",
    category_name: "AI & Công cụ",
    cover_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    tags: ["AI Tools", "Phương pháp học tập", "GenAI", "Năng suất"],
    featured: true,
    published: true,
    views: 218,
    published_at: "2026-09-17T09:15:00Z",
    created_at: NOW,
    updated_at: NOW,
    excerpt: "Tổng hợp 7 công cụ Trí tuệ nhân tạo hàng đầu hỗ trợ nghiên cứu tài liệu, giải toán logic, tóm tắt giáo trình học thuật và xây dựng lộ trình ôn thi cá nhân hóa cực kỳ hiệu quả.",
    content: `<h2>Kỷ nguyên tự học với gia sư AI 1-kèm-1 thông minh</h2>
<p>Nếu bạn vẫn chỉ dùng AI như một công cụ để copy-paste đáp án bài tập về nhà, bạn đang bỏ lỡ 95% tiềm năng thực sự của công nghệ này. Những học sinh, sinh viên xuất sắc nhất năm 2026 xem AI như một người cố vấn học tập cá nhân, một người bạn phản biện tư duy theo phương pháp Socrates (Socratic questioning) và một trợ lý nghiên cứu không bao giờ biết mệt mỏi.</p>
<p>Dưới đây là 7 công cụ AI đột phá nhất đã được kiểm nghiệm thực tế, giúp bạn rút ngắn thời gian học tập mà vẫn nắm sâu bản chất vấn đề.</p>

<h2>7 Ứng dụng AI định hình lại việc học tập</h2>
<h3>1. Perplexity AI — Cỗ máy nghiên cứu và trích dẫn học thuật thời gian thực</h3>
<p>Khắc phục hoàn toàn nhược điểm bịa đặt nguồn của các chatbot thông thường, Perplexity AI hoạt động như một công cụ tìm kiếm tri thức thế hệ mới. Mỗi câu trả lời đều đi kèm các trích dẫn số trang, đường link bài báo khoa học từ arXiv, Nature hay Google Scholar, giúp bạn làm tiểu luận nghiên cứu chuẩn mực.</p>

<h3>2. Claude 3.5 Sonnet & Claude Projects — Bậc thầy đọc hiểu tài liệu chuyên sâu</h3>
<p>Với khả năng tiếp nhận ngữ cảnh lên đến 200.000 tokens và năng lực tư duy logic vượt trội, Claude là lựa chọn số 1 khi bạn cần phân tích các cuốn giáo trình dày hàng trăm trang, bản cáo bạch tài chính hay các đề thi thử đại học môn Toán, Lý, Hóa phức tạp.</p>

<h3>3. NotebookLM (Google) — Biến giáo trình khô khan thành cuộc hội thoại sinh động</h3>
<p>NotebookLM cho phép bạn tải lên tài liệu học tập của riêng mình (PDF, Google Docs, link YouTube). Tính năng <em>Audio Overview</em> kỳ diệu có thể biến toàn bộ nội dung tài liệu thành một chương trình podcast sinh động giữa hai người dẫn chuyện AI, giúp bạn nghe ôn bài mọi lúc mọi nơi.</p>

<h3>4. ChatGPT Plus (Advanced Voice & Canvas) — Luyện phản xạ ngoại ngữ và phỏng vấn</h3>
<p>Chế độ giọng nói thời gian thực với độ trễ siêu thấp cho phép bạn đàm thoại tiếng Anh bản xứ hàng giờ liền với ngữ điệu tự nhiên, được sửa phát âm và ngữ pháp tức thì. Tính năng Canvas giúp bạn vừa viết vừa tinh chỉnh cấu trúc bài luận từng câu chữ.</p>

<h3>5. Wolfram Alpha — Vũ khí tối thượng cho Toán học và Khoa học chính xác</h3>
<p>Khi các mô hình ngôn ngữ lớn có thể tính nhầm ma trận hoặc đạo hàm, Wolfram Alpha mang lại độ chính xác toán học tuyệt đối 100%. Tích hợp các bước giải chi tiết từng bước, vẽ đồ thị hàm số 3D và phân tích công thức hóa học chuẩn xác.</p>

<h3>6. Gamma App — Thiết kế Slide thuyết trình chuyên nghiệp trong 60 giây</h3>
<p>Thay vì mất cả buổi tối loay hoay căn chỉnh font chữ và màu sắc trên PowerPoint, Gamma cho phép bạn nhập dàn ý bài học và tự động tạo ra một bản trình chiếu chuẩn nhận diện thị giác, bố cục cân đối và hình ảnh minh họa sắc nét.</p>

<h3>7. Anki tích hợp AI Flashcards — Ghi nhớ ngắt quãng đỉnh cao</h3>
<p>Phương pháp lặp lại ngắt quãng (Spaced Repetition) kết hợp thuật toán FSRS được tăng tốc bằng AI giúp bạn tự động trích xuất các câu hỏi trắc nghiệm từ bài giảng, đảm bảo kiến thức được khắc sâu vào trí nhớ dài hạn trước mỗi kỳ thi quan trọng.</p>

<h2>Nguyên tắc vàng: Dùng AI như chiếc kính lúp, không phải chiếc nạng</h2>
<blockquote>"Hãy dùng AI để đào sâu câu hỏi 'Tại sao', tìm kiếm phản biện và làm sáng tỏ những chỗ khúc mắc, đừng biến nó thành cái cớ để dừng suy nghĩ."</blockquote>
<p>Bí quyết nằm ở câu lệnh: Thay vì hỏi <em>"Cho tôi đáp án câu này"</em>, hãy prompt: <em>"Hãy đóng vai trò một giảng viên kiên nhẫn, hãy đặt cho tôi 3 câu hỏi gợi ý để tôi tự suy luận ra hướng giải quyết bài toán sau đây..."</em>. Bạn sẽ bất ngờ trước bước nhảy vọt về năng lực tư duy của chính mình!</p>`,
  },
  {
    id: "f9cf6d84-8646-44fd-8997-f7d233051ca0",
    title: "Giải Mã Mô Hình Holland (RIASEC): Mật Mã 6 Nhóm Tính Cách Để Chọn Đúng Ngành Đại Học",
    slug: "giai-ma-mo-hinh-holland-riasec-chon-dung-nganh-dai-hoc",
    category_id: "091e245b-c798-4427-9308-0d39ed886346",
    category_name: "Kỹ năng",
    cover_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    tags: ["Holland RIASEC", "Chọn ngành đại học", "Hướng nghiệp 2026", "Tâm lý học"],
    featured: true,
    published: true,
    views: 310,
    published_at: "2026-09-17T14:20:00Z",
    created_at: NOW,
    updated_at: NOW,
    excerpt: "Tại sao hơn 60% sinh viên ra trường làm trái ngành? Hướng dẫn chi tiết cách ứng dụng trắc nghiệm Holland RIASEC để tìm ra mã ADN nghề nghiệp, chọn trường đại học phù hợp và bền vững.",
    content: `<h2>Thực trạng đáng báo động: Chọn ngành theo cảm tính</h2>
<p>Theo khảo sát của Trung tâm Dự báo Nhu cầu Nhân lực, có đến hơn 60% cử nhân đại học tại Việt Nam ra trường làm việc không đúng chuyên ngành đào tạo, và gần 40% cảm thấy chán nản, mất phương hướng ngay từ năm hai đại học. Lý do phổ biến nhất? <em>Chọn ngành vì nghe tên oai, vì bạn bè rủ rê, hoặc vì kỳ vọng của gia đình mà chưa từng một lần tìm hiểu xem tính cách bẩm sinh của mình tương thích với môi trường nào.</em></p>

<h2>Mô hình Holland RIASEC là gì?</h2>
<p>Được phát triển bởi tiến sĩ tâm lý học người Mỹ John L. Holland, lý thuyết RIASEC là một trong những hệ thống hướng nghiệp khoa học uy tín nhất thế giới, được áp dụng chính thức tại Bộ Lao động Hoa Kỳ (O*NET) và nhiều trường đại học danh tiếng. Mô hình phân chia tính cách con người và môi trường làm việc thành 6 nhóm chủ đạo:</p>

<h2>6 Mảnh ghép tính cách trong lục giác Holland</h2>
<h3>1. Nhóm R (Realistic - Thực tế / Kỹ thuật)</h3>
<p><strong>Đặc điểm:</strong> Thích làm việc với đồ vật cụ thể, máy móc, công cụ, yêu thích hoạt động ngoài trời, có tư duy thực tiễn và tính khéo léo.<br>
<strong>Ngành học tiêu biểu:</strong> Kỹ thuật Cơ điện tử, Tự động hóa, Xây dựng, Lâm nghiệp & Nông nghiệp công nghệ cao, Kiến trúc công trình, Công nghệ ô tô.</p>

<h3>2. Nhóm I (Investigative - Nghiên cứu / Khám phá)</h3>
<p><strong>Đặc điểm:</strong> Say mê tìm hiểu bản chất quy luật của sự vật hiện tượng, thích phân tích dữ liệu, tò mò khoa học và giải quyết các bài toán hóc búa.<br>
<strong>Ngành học tiêu biểu:</strong> Khoa học máy tính, Trí tuệ nhân tạo, Công nghệ sinh học, Dược học, Y đa khoa, Toán ứng dụng, Kinh tế lượng.</p>

<h3>3. Nhóm A (Artistic - Nghệ thuật / Sáng tạo)</h3>
<p><strong>Đặc điểm:</strong> Trực giác nhạy bén, giàu trí tưởng tượng, không thích khuôn khổ gò bó, thể hiện bản thân qua âm nhạc, chữ viết, hình ảnh hoặc thiết kế.<br>
<strong>Ngành học tiêu biểu:</strong> Thiết kế đồ họa & UI/UX, Truyền thông đa phương tiện, Đạo diễn & Biên kịch, Quan hệ công chúng (PR), Mỹ thuật ứng dụng.</p>

<h3>4. Nhóm S (Social - Xã hội / Giúp đỡ)</h3>
<p><strong>Đặc điểm:</strong> Thấu hiểu, nhân ái, có khả năng giao tiếp và lắng nghe xuất sắc, thích giúp đỡ, giảng dạy và phát triển con người.<br>
<strong>Ngành học tiêu biểu:</strong> Sư phạm, Tâm lý học lâm sàng, Công tác xã hội, Quản trị nhân sự, Điều dưỡng, Du lịch & Khách sạn.</p>

<h3>5. Nhóm E (Enterprising - Quản lý / Khởi xướng)</h3>
<p><strong>Đặc điểm:</strong> Năng động, tự tin, có tham vọng và tố chất lãnh đạo, thích thuyết phục người khác và sẵn sàng chấp nhận rủi ro kinh doanh.<br>
<strong>Ngành học tiêu biểu:</strong> Quản trị kinh doanh, Marketing chiến lược, Kinh doanh quốc tế, Tài chính doanh nghiệp, Luật thương mại, Bất động sản.</p>

<h3>6. Nhóm C (Conventional - Nghiệp vụ / Quy củ)</h3>
<p><strong>Đặc điểm:</strong> Cẩn thận, chi tiết, thích sự ngăn nắp, làm việc chuẩn xác theo quy trình và các con số cụ thể.<br>
<strong>Ngành học tiêu biểu:</strong> Kế toán - Kiểm toán, Hệ thống thông tin quản lý (MIS), Quản trị chuỗi cung ứng & Logistics, Thống kê, Hành chính công.</p>

<h2>Cách kết hợp 3 chữ cái để tạo thành "Mật mã Holland" (Holland Code)</h2>
<p>Không ai hoàn toàn thuộc về một nhóm duy nhất. Mỗi cá nhân là sự tổng hòa của 3 nhóm tính cách nổi trội nhất, ví dụ: <strong>SEC</strong> (Xã hội - Quản lý - Nghiệp vụ), <strong>IRA</strong> (Nghiên cứu - Thực tế - Nghệ thuật), hay <strong>EAC</strong> (Quản lý - Nghệ thuật - Nghiệp vụ).</p>

<h2>Trải nghiệm ngay bộ công cụ định hướng trên website</h2>
<p>Để biết chính xác mật mã 3 chữ cái của bạn và đối chiếu với ngân hàng hơn 200 trường đại học tại Việt Nam, hãy làm bài test tại công cụ <strong>Khảo sát Hướng nghiệp RIASEC</strong> và <strong>EduPath 2026</strong> được tích hợp sẵn trong mục AI Tools của chúng tôi. Một bản báo cáo trực quan kèm điểm mạnh, ngành học tối ưu và gợi ý nguyện vọng sẽ được gửi đến bạn hoàn toàn miễn phí!</p>`,
  },
  {
    id: "247c616b-434f-44aa-91dc-4a053275c1bc",
    title: "Kỹ Sư Prompt & Quản Trị AI Agent 2026: Nghề Mới Nghìn USD Hay Chỉ Là Trào Lưu Nhất Thời?",
    slug: "ky-su-prompt-va-ai-agent-2026-nghe-nghin-usd-hay-trao-luu",
    category_id: "069abd25-b0aa-4b6f-bead-c176cc3e0592",
    category_name: "Công nghệ",
    cover_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    tags: ["Prompt Engineering", "AI Agents", "Công nghệ mới", "Tự động hoá"],
    featured: false,
    published: true,
    views: 185,
    published_at: "2026-09-18T06:00:00Z",
    created_at: NOW,
    updated_at: NOW,
    excerpt: "Giải mã sự chuyển dịch ngoạn mục từ những câu lệnh prompt đơn lẻ sang kỷ nguyên AI Agent tự hành: Yêu cầu chuyên môn thực tế, mức đãi ngộ và lộ trình chuẩn bị cho kỹ sư trẻ.",
    content: `<h2>Từ "Thợ gõ prompt" đến "Kiến trúc sư hệ thống AI Agent"</h2>
<p>Năm 2023, khi ChatGPT bùng nổ, cụm từ <em>"Prompt Engineer với mức lương 330.000 USD/năm"</em> từng làm chấn động giới truyền thông toàn cầu. Nhiều người vội vã mở các khóa học dạy viết câu lệnh dài dòng và tin rằng chỉ cần gõ vài từ ngữ thần bí là có thể đổi đời.</p>
<p>Bước sang năm 2026, khi các mô hình ngôn ngữ lớn (LLM) ngày càng thông minh hơn và có thể tự tối ưu câu lệnh, cái gọi là "nghề gõ prompt đơn giản" đã chết. Thay vào đó là sự trỗi dậy mạnh mẽ của một vị trí kỹ thuật cấp cao: <strong>AI Agent Architect / Systems Orchestrator</strong>.</p>

<h2>Bản chất công việc của một AI Agent Architect là gì?</h2>
<p>Một AI Agent không chỉ là một khung chat trả lời câu hỏi. Nó là một thực thể phần mềm có khả năng:</p>
<ul>
  <li>Nhận thức mục tiêu tổng thể và tự động phân rã thành các nhiệm vụ con (Planning & Decomposition).</li>
  <li>Truy xuất dữ liệu nghiệp vụ thời gian thực qua hệ thống RAG (Retrieval-Augmented Generation) và cơ sở dữ liệu vector.</li>
  <li>Chủ động gọi các API bên ngoài qua giao thức MCP (Model Context Protocol) để thực thi hành động: gửi email, đặt vé máy bay, truy vấn cơ sở dữ liệu SQL, hoặc deploy code lên cloud.</li>
  <li>Tự đánh giá kết quả và tự sửa sai nếu gặp lỗi (Self-reflection & Error recovery).</li>
</ul>

<h2>Những kỹ năng kỹ thuật bắt buộc để đón đầu làn sóng này</h2>
<h3>1. Nền tảng lập trình vững chắc (Python & TypeScript)</h3>
<p>Không có đường tắt nào không cần code. Bạn cần làm chủ Python (chuẩn mực cho AI/ML) hoặc TypeScript/Node.js để xây dựng các pipeline tích hợp, quản lý bất đồng bộ và kiểm soát dữ liệu đầu vào/đầu ra.</p>

<h3>2. Hiểu sâu về Frameworks Agent (LangChain, LangGraph, CrewAI, AutoGen)</h3>
<p>Cách tổ chức mô hình nhiều Agent cộng tác (Multi-agent collaboration): Agent A đóng vai trò Researcher, Agent B đóng vai trò Coder, Agent C làm Reviewer và Agent D tổng hợp kết quả.</p>

<h3>3. Kỹ thuật Evals & Kiểm soát an toàn (Guardrails)</h3>
<p>Làm sao để đo lường độ chính xác của Agent qua từng phiên bản? Làm sao để ngăn chặn lỗi Prompt Injection hay dữ liệu nhạy cảm rò rỉ ra ngoài? Đây là bài toán sống còn mà các doanh nghiệp sẵn sàng chi trả lương rất cao cho người giải quyết được.</p>

<blockquote>"Một mô hình AI mạnh mẽ sẽ vô dụng nếu thiếu đi một kiến trúc phần mềm tin cậy bao bọc xung quanh nó."</blockquote>

<h2>Lộ trình hành động cho người mới bắt đầu</h2>
<p>Hãy dừng việc học vẹt các mẫu prompt trên mạng. Bắt đầu bằng việc xây dựng một dự án nhỏ thực tế: ví dụ một bot tự động đọc RSS tin tức công nghệ mỗi sáng, tóm tắt và gửi vào Telegram; hoặc một tool hỗ trợ tra cứu điểm chuẩn tự động. Dự án thực chiến (Proof of Work) chính là tấm vé thông hành giá trị nhất đưa bạn vào kỷ nguyên công nghệ mới.</p>`,
  },
  {
    id: "6ebbf00b-b479-499e-a13c-4a14cf4c5de0",
    title: "Xây Dựng Portfolio Số & Thương Hiệu Cá Nhân Thời AI: Bí Quyết Để Được Săn Đón",
    slug: "xay-dung-portfolio-so-va-thuong-hieu-ca-nhan-thoi-ai",
    category_id: "3f70b98f-353d-4a04-b407-7c21e43f462f",
    category_name: "Thương hiệu",
    cover_url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
    tags: ["Thương hiệu cá nhân", "Portfolio số", "Branding", "Phát triển sự nghiệp"],
    featured: false,
    published: true,
    views: 265,
    published_at: "2026-09-18T08:00:00Z",
    created_at: NOW,
    updated_at: NOW,
    excerpt: "Bản PDF gửi qua email đã không còn đủ sức nặng. Khám phá chiến lược xây dựng không gian hiện diện số đa kênh, biến dự án thực tế thành thỏi nam châm thu hút đối tác và nhà tuyển dụng.",
    content: `<h2>Sự thoái trào của bản CV truyền thống</h2>
<p>Hãy thử tưởng tượng bạn là một nhà tuyển dụng hoặc một đối tác đang tìm kiếm người phụ trách dự án: Bạn nhận được 500 file PDF có tiêu đề <em>"CV_NguyenVanA.pdf"</em>, tất cả đều dùng chung những mẫu template Canva quen thuộc và những từ ngữ sáo rỗng được AI sinh ra hàng loạt như <em>"nhiệt huyết, chịu được áp lực cao, kỹ năng giao tiếp tốt"</em>. Bạn sẽ dành bao nhiêu giây cho mỗi hồ sơ?</p>
<p>Con số thống kê thực tế là: <strong>Chưa đầy 6 giây.</strong></p>
<p>Trong thời đại số, tấm danh thiếp quyền lực nhất của một người làm việc chuyên nghiệp không còn là một tờ giấy, mà là <strong>Không gian số mang đậm dấu ấn cá nhân (Digital Portfolio & Personal Brand)</strong>.</p>

<h2>3 Trụ cột tạo nên một Portfolio số có sức hút mãnh liệt</h2>
<h3>1. Định vị giá trị độc bản (Unique Value Proposition - UVP)</h3>
<p>Bạn không thể giỏi tất cả mọi thứ. Bạn là ai trong mắt người khác? Bạn giải quyết vấn đề gì, cho đối tượng nào, bằng phương pháp khác biệt ra sao? Sự giao thoa độc đáo — ví dụ: <em>"Một nhà thiết kế am hiểu tâm lý người tiêu dùng"</em> hay <em>"Một chuyên viên marketing biết viết code và tự động hóa bằng AI"</em> — sẽ biến bạn thành người duy nhất trong ngách của mình.</p>

<h3>2. Kể câu chuyện Case Study thay vì chỉ khoe sản phẩm cuối cùng</h3>
<p>Người ta không mua kết quả, người ta mua tư duy giải quyết vấn đề của bạn. Một Case Study xuất sắc luôn tuân thủ cấu trúc 4 bước:</p>
<ul>
  <li><strong>Thách thức (Challenge):</strong> Vấn đề cụ thể mà doanh nghiệp hoặc người dùng đang gặp phải là gì?</li>
  <li><strong>Phương pháp tiếp cận (Approach):</strong> Bạn đã nghiên cứu, thử nghiệm và chọn giải pháp nào? Tại sao?</li>
  <li><strong>Quá trình vượt khó (Execution):</strong> Những rào cản bất ngờ phát sinh và cách bạn ứng biến?</li>
  <li><strong>Tác động định lượng (Impact):</strong> Tăng trưởng bao nhiêu % chuyển đổi? Tiết kiệm bao nhiêu giờ làm việc?</li>
</ul>

<h3>3. Trải nghiệm tương tác trực tiếp (Interactive Proof of Work)</h3>
<p>Thay vì chỉ chụp ảnh màn hình tĩnh, hãy để người xem được bấm thử, trải nghiệm thử công cụ bạn đã làm. Chính cảm giác được chạm vào sản phẩm thực sẽ xây dựng niềm tin mãnh liệt hơn bất kỳ lời khẳng định nào.</p>

<h2>Tận dụng AI để khuếch đại tiếng vang mà không làm mất "chất riêng"</h2>
<p>AI là chiếc loa phóng thanh, nhưng bạn phải là người sáng tác bài hát. Hãy sử dụng AI để:</p>
<ul>
  <li>Gợi ý các góc nhìn phân tích đa chiều cho bài viết chuyên môn.</li>
  <li>Biên tập lại cấu trúc câu cú cho mạch lạc, gãy gọn.</li>
  <li>Tối ưu hóa SEO để các bài viết của bạn xuất hiện khi ai đó tìm kiếm giải pháp cho vấn đề chuyên ngành.</li>
</ul>
<blockquote>"Thương hiệu cá nhân không phải là việc bạn cố tỏ ra hoàn hảo, mà là sự kiên định trong việc tạo ra giá trị hữu ích và chia sẻ nó một cách chân thành nhất với cộng đồng."</blockquote>

<h2>Hành động ngay hôm nay</h2>
<p>Đừng chờ đợi đến khi cần tìm việc mới bắt đầu xây dựng portfolio. Hãy bắt đầu ghi chép lại hành trình học tập, đúc kết các bài học từ mỗi dự án và đưa chúng lên website cá nhân của bạn ngay từ hôm nay. Tương lai nghề nghiệp thuộc về những ai dám cất lên tiếng nói của chính mình!</p>`,
  },
  {
    id: "597945a1-ebfe-4839-abb2-3a94adeb8704",
    title: "Đánh Giá Toàn Diện 14 Mô Hình AI Phổ Biến Nhất Hiện Nay",
    slug: "danh-gia-toan-dien-14-mo-hinh-ai-pho-bien-nhat-hien-nay",
    category_id: "069abd25-b0aa-4b6f-bead-c176cc3e0592",
    category_name: "Công nghệ",
    cover_url: "https://lkvpeviezgzzfnaxuqpr.supabase.co/storage/v1/object/public/media/uploads/mo-hinh-ai-mu2sa8ropqn0e.jpeg",
    tags: ["AI", "Mô hình AI", "Công nghệ"],
    featured: true,
    published: true,
    views: 1,
    published_at: "2026-09-15T14:46:00Z",
    created_at: NOW,
    updated_at: NOW,
    excerpt: "So sánh chi tiết ưu nhược điểm, chi phí và trường hợp sử dụng tối ưu của 14 mô hình trí tuệ nhân tạo hàng đầu hiện nay từ OpenAI, Anthropic, Google, Meta và Mistral.",
    content: `<p>Đánh giá chi tiết và so sánh ưu khuyết điểm của các mô hình AI phổ biến nhất hiện nay như ChatGPT, Claude, Gemini, Llama, Mistral và cách lựa chọn mô hình phù hợp với nhu cầu công việc thực tế.</p>`,
  },
  {
    id: "d9e8f7a6-b5c4-4321-9876-123456789abc",
    title: "Chiến Lược Định Vị Thương Hiệu Kỷ Nguyên AI: Khi Brand Voice Trở Thành AI Persona Tự Hành",
    slug: "chien-luoc-dinh-vi-thuong-hieu-ky-nguyen-ai-brand-persona",
    category_id: "3f70b98f-353d-4a04-b407-7c21e43f462f",
    category_name: "Thương hiệu",
    cover_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    tags: ["Branding", "AI Strategy", "Brand Voice", "GenAI", "Quản trị thương hiệu"],
    featured: true,
    published: true,
    views: 345,
    published_at: "2026-09-22T08:00:00Z",
    created_at: NOW,
    updated_at: NOW,
    excerpt: "Trong kỷ nguyên Generative AI, cẩm nang thương hiệu tĩnh (PDF Guidelines) không còn đủ sức bảo vệ tính nhất quán của nhãn hàng. Doanh nghiệp cần chuyển dịch sang 'AI Brand Persona' — một thực thể tự hành thấu hiểu trọn vẹn bản sắc, tông giọng và triết lý thương hiệu trên mọi điểm chạm số.",
    content: `<h2>Sự sụp đổ của Cẩm nang Thương hiệu Tĩnh (Static Brand Guidelines)</h2>
<p>Suốt nửa thế kỷ qua, quy chuẩn quản trị thương hiệu luôn xoay quanh một cuốn cẩm nang dày hàng trăm trang (Brand Identity Guidelines): quy định từ mã màu hex, khoảng cách an toàn của logo đến các tính từ miêu tả giọng điệu. Nhưng bước sang năm 2026, khi các doanh nghiệp xuất bản hàng ngàn mẩu nội dung mỗi tuần thông qua các công cụ Generative AI, cuốn cẩm nang PDF tĩnh ấy đã chính thức bất lực.</p>
<p>Khi mỗi nhân viên, mỗi agency và mỗi hệ thống tự động đều đang dùng ChatGPT, Claude hay Midjourney để sáng tạo nội dung, thương hiệu đối mặt với một cuộc khủng hoảng mới: <strong>sự phân mảnh nhận diện (Brand Dissolution)</strong>. Nội dung được sản xuất với tốc độ ánh sáng, nhưng nhạt nhòa, rập khuôn và đánh mất hoàn toàn linh hồn thương hiệu.</p>
<p>Giải pháp duy nhất không phải là cấm dùng AI, mà là nâng cấp cẩm nang thương hiệu thành một <strong>AI Brand Persona tự hành (Autonomous Brand Persona)</strong>.</p>
<h2>Cấu trúc 4 Tầng của một AI Brand Persona Hiện Đại</h2>
<p>Dưới góc nhìn nghiên cứu quản lý kinh tế và hệ thống thông tin, một AI Brand Persona không đơn thuần là một prompt dài, mà là một kiến trúc tri thức gồm 4 tầng vững chắc: Tầng Triết lý Cốt lõi & Hình mẫu Tâm lý, Hệ thống Quy tắc Tông giọng Động, Ranh giới Đạo đức & Giao thức Khủng hoảng, và Bộ nhớ Bối cảnh & Dữ liệu Tri thức Nội bộ.</p>`,
  },
  {
    id: "c8d7e6f5-a4b3-4210-8765-012345678def",
    title: "Ứng Dụng Generative AI & Synthetic Personas: Cách Mạng Hóa Nghiên Cứu Thị Trường & Định Vị Khách Hàng",
    slug: "ung-dung-generative-ai-synthetic-personas-nghien-cuu-khach-hang",
    category_id: "3f70b98f-353d-4a04-b407-7c21e43f462f",
    category_name: "Thương hiệu",
    cover_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    tags: ["Thương hiệu", "Market Research", "Synthetic Data", "AI Agent", "Hành vi người tiêu dùng"],
    featured: true,
    published: true,
    views: 289,
    published_at: "2026-09-23T09:00:00Z",
    created_at: NOW,
    updated_at: NOW,
    excerpt: "Tạo lập chân dung khách hàng ảo (Synthetic Buyer Personas) bằng các mô hình ngôn ngữ lớn đang làm thay đổi căn bản cách các thương hiệu thử nghiệm thông điệp, khảo sát phản ứng sản phẩm và tối ưu chi phí R&D marketing trước khi tiếp cận thị trường thật.",
    content: `<h2>Nghịch lý của Nghiên cứu Thị trường Truyền thống</h2>
<p>Mọi nhà quản trị thương hiệu đều biết rõ tầm quan trọng sống còn của việc thấu hiểu khách hàng mục tiêu. Tuy nhiên, các phương pháp nghiên cứu truyền thống như Focus Group hay phỏng vấn định tính thường tốn kém hàng trăm triệu đồng và nhiều tuần chờ đợi.</p>
<p>Đó là lý do <strong>Synthetic Personas (Chân dung khách hàng ảo tổng hợp)</strong> đang trở thành vũ khí bí mật của các chiến lược gia thương hiệu hàng đầu thế giới.</p>
<h2>3 Ứng Dụng Thực Chiến Trong Chiến Lược Thương Hiệu</h2>
<p>1. Thử nghiệm thông điệp & Bao bì ảo (Virtual Message Testing).<br/>2. Mô phỏng phỏng vấn định tính 24/7 (Simulated In-depth Interviews).<br/>3. Đóng vai đối thủ cạnh tranh (Red-Teaming the Brand).</p>`,
  },
];

