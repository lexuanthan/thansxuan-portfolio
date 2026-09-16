import type { AboutPage, AiTool, Project, Settings } from "@/lib/types";

const NOW = "1970-01-01T00:00:00.000Z";

function project(
  id: string,
  title: string,
  description: string,
  tags: string[],
  color: string,
  sort_order: number
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
    link_url: null,
    featured: sort_order <= 2,
    published: true,
    sort_order,
    created_at: NOW,
    updated_at: NOW,
  };
}

export const FALLBACK_PROJECTS: Project[] = [
  project(
    "ai-content-generator",
    "AI Content Generator",
    "Tool tạo content marketing sáng tạo bằng AI. Giúp tự động hóa quá trình viết bài, tạo ý tưởng, và tối ưu hóa copy.",
    ["AI", "NLP", "Content"],
    "from-blue-100 to-cyan-100",
    1
  ),
  project(
    "brand-strategy-analyzer",
    "Brand Strategy Analyzer",
    "Phân tích brand positioning, competitor analysis, và tư vấn chiến lược branding toàn diện cho doanh nghiệp.",
    ["Strategy", "Design", "Analytics"],
    "from-purple-100 to-pink-100",
    2
  ),
  project(
    "video-script-generator",
    "Video Script Generator",
    "Tự động tạo script video, storyboard, và content outline từ ý tưởng ban đầu. Tối ưu cho YouTube, TikTok, Instagram.",
    ["Video", "AI", "Creative"],
    "from-orange-100 to-red-100",
    3
  ),
  project(
    "social-media-calendar",
    "Social Media Calendar",
    "Lên lịch content social media, tối ưu posting time, và track engagement metrics một cách tự động.",
    ["Social Media", "Automation"],
    "from-green-100 to-emerald-100",
    4
  ),
  project(
    "design-system-documentation",
    "Design System Documentation",
    "Xây dựng design system toàn diện cho brand, bao gồm color palette, typography, components, và guidelines.",
    ["Design", "UI/UX", "Documentation"],
    "from-yellow-100 to-amber-100",
    5
  ),
  project(
    "data-visualization-dashboard",
    "Data Visualization Dashboard",
    "Dashboard phân tích dữ liệu marketing, sales metrics, và business insights với visualization tương tác.",
    ["Data", "Analytics", "Dashboard"],
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
  sort_order: number
): AiTool {
  return {
    id,
    title,
    description,
    icon,
    color,
    status: "Coming Soon",
    status_color: "yellow",
    link_url: null,
    published: true,
    sort_order,
    created_at: NOW,
    updated_at: NOW,
  };
}

export const FALLBACK_AI_TOOLS: AiTool[] = [
  tool(
    "content-generator",
    "Content Generator",
    "Tạo content marketing, social media posts, blog articles bằng AI",
    "✍️",
    "from-blue-100 to-cyan-100",
    1
  ),
  tool(
    "brand-advisor",
    "Brand Advisor",
    "Tư vấn branding, brand positioning, visual identity strategy",
    "🎨",
    "from-purple-100 to-pink-100",
    2
  ),
  tool(
    "video-script-writer",
    "Video Script Writer",
    "Viết script video chuyên nghiệp, storyboard, shot list tự động",
    "🎬",
    "from-orange-100 to-red-100",
    3
  ),
  tool(
    "data-analyzer",
    "Data Analyzer",
    "Phân tích dữ liệu, tạo insights, generate reports tự động",
    "📊",
    "from-green-100 to-emerald-100",
    4
  ),
  tool(
    "idea-brainstormer",
    "Idea Brainstormer",
    "Brainstorm ý tưởng campaign, content themes, creative concepts",
    "💡",
    "from-yellow-100 to-amber-100",
    5
  ),
  tool(
    "seo-optimizer",
    "SEO Optimizer",
    "Tối ưu hóa content cho SEO, keyword research, meta tags generation",
    "🔍",
    "from-indigo-100 to-blue-100",
    6
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
