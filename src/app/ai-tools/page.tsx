"use client";

import Link from "next/link";

export default function AITools() {
  const tools = [
    {
      id: 1,
      title: "📝 Content Generator",
      description: "Tạo content marketing, social media posts, blog articles bằng AI",
      icon: "✍️",
      color: "from-blue-100 to-cyan-100",
      status: "Coming Soon"
    },
    {
      id: 2,
      title: "🎨 Brand Advisor",
      description: "Tư vấn branding, brand positioning, visual identity strategy",
      icon: "🎨",
      color: "from-purple-100 to-pink-100",
      status: "Coming Soon"
    },
    {
      id: 3,
      title: "🎬 Video Script Writer",
      description: "Viết script video chuyên nghiệp, storyboard, shot list tự động",
      icon: "🎬",
      color: "from-orange-100 to-red-100",
      status: "Coming Soon"
    },
    {
      id: 4,
      title: "📊 Data Analyzer",
      description: "Phân tích dữ liệu, tạo insights, generate reports tự động",
      icon: "📊",
      color: "from-green-100 to-emerald-100",
      status: "Coming Soon"
    },
    {
      id: 5,
      title: "💡 Idea Brainstormer",
      description: "Brainstorm ý tưởng campaign, content themes, creative concepts",
      icon: "💡",
      color: "from-yellow-100 to-amber-100",
      status: "Coming Soon"
    },
    {
      id: 6,
      title: "🔍 SEO Optimizer",
      description: "Tối ưu hóa content cho SEO, keyword research, meta tags generation",
      icon: "🔍",
      color: "from-indigo-100 to-blue-100",
      status: "Coming Soon"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50 py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Tools
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Các ứng dụng AI cá nhân hóa giúp bạn tạo content, phát triển chiến lược, 
            và tự động hóa công việc hàng ngày
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="group relative"
            >
              <div className={`bg-gradient-to-br ${tool.color} border border-gray-300 hover:border-blue-400 rounded-lg p-8 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 h-full`}>
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-200 border border-yellow-400 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {tool.status}
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="text-5xl mb-4">{tool.icon}</div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors text-gray-900">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="text-gray-700 text-base leading-relaxed">
                  {tool.description}
                </p>

                {/* Hover Effect */}
                <div className="mt-6 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-semibold">Explore →</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mt-20 p-8 sm:p-12 bg-white border border-gray-200 rounded-lg">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">Cách hoạt động</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Nhập Input",
                desc: "Cung cấp thông tin hoặc prompt cho tool"
              },
              {
                step: "02",
                title: "AI Processing",
                desc: "AI xử lý và tạo kết quả tùy chỉnh"
              },
              {
                step: "03",
                title: "Export & Use",
                desc: "Tải kết quả, chỉnh sửa, và sử dụng ngay"
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-4">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🎉 Nhận thông báo khi tools mới được phát hành</h3>
          <p className="text-gray-600 mb-6">
            Đăng ký để nhận cập nhật khi các AI tools mới được thêm vào
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}