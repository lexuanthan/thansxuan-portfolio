import Link from "next/link";

export default function Projects() {
  const projects = [
    {
      id: 1,
      title: "AI Content Generator",
      description: "Tool tạo content marketing sáng tạo bằng AI. Giúp tự động hóa quá trình viết bài, tạo ý tưởng, và tối ưu hóa copy.",
      tags: ["AI", "NLP", "Content"],
      color: "from-blue-100 to-cyan-100"
    },
    {
      id: 2,
      title: "Brand Strategy Analyzer",
      description: "Phân tích brand positioning, competitor analysis, và tư vấn chiến lược branding toàn diện cho doanh nghiệp.",
      tags: ["Strategy", "Design", "Analytics"],
      color: "from-purple-100 to-pink-100"
    },
    {
      id: 3,
      title: "Video Script Generator",
      description: "Tự động tạo script video, storyboard, và content outline từ ý tưởng ban đầu. Tối ưu cho YouTube, TikTok, Instagram.",
      tags: ["Video", "AI", "Creative"],
      color: "from-orange-100 to-red-100"
    },
    {
      id: 4,
      title: "Social Media Calendar",
      description: "Lên lịch content social media, tối ưu posting time, và track engagement metrics một cách tự động.",
      tags: ["Social Media", "Automation"],
      color: "from-green-100 to-emerald-100"
    },
    {
      id: 5,
      title: "Design System Documentation",
      description: "Xây dựng design system toàn diện cho brand, bao gồm color palette, typography, components, và guidelines.",
      tags: ["Design", "UI/UX", "Documentation"],
      color: "from-yellow-100 to-amber-100"
    },
    {
      id: 6,
      title: "Data Visualization Dashboard",
      description: "Dashboard phân tích dữ liệu marketing, sales metrics, và business insights với visualization tương tác.",
      tags: ["Data", "Analytics", "Dashboard"],
      color: "from-indigo-100 to-blue-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Portfolio
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Các dự án đã thực hiện, từ branding, content creation, đến AI tools
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group cursor-pointer h-full"
            >
              <div className={`bg-gradient-to-br ${project.color} border border-gray-300 hover:border-blue-400 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col p-6`}>
                {/* Project Number */}
                <div className="text-sm font-semibold text-blue-600 mb-4">
                  Project #{String(project.id).padStart(2, '0')}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors text-gray-900">
                  {project.title}
                </h3>

                {/* Description */}
                <p className="text-gray-700 mb-6 flex-grow">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-20 text-center p-8 bg-white border border-gray-200 rounded-lg">
          <h3 className="text-2xl font-bold mb-3 text-gray-900">Có dự án thú vị?</h3>
          <p className="text-gray-600 mb-6">
            Hãy liên hệ với tôi để thảo luận về cách tôi có thể giúp bạn
          </p>
          <Link
            href="mailto:your-email@example.com"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-semibold transition-all"
          >
            📧 Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
