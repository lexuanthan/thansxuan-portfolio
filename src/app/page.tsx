import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="mb-6 inline-block">
            <span className="bg-purple-500/20 border border-purple-500/50 text-purple-300 px-4 py-2 rounded-full text-sm font-medium">
              👋 Welcome to my creative space
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 bg-clip-text text-transparent">
            Lê Xuân Thân
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-purple-200 mb-8 font-light">
            Brand Strategist • Designer • AI Innovator
          </p>

          {/* Description */}
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Tạo nên những content sáng tạo, chiến lược branding mạnh mẽ, 
            và các ứng dụng AI cá nhân hóa để giải quyết thử thách trong quản trị thương hiệu
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/projects"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Xem Portfolio
            </Link>
            <Link
              href="/ai-tools"
              className="border border-purple-400 hover:bg-purple-900/30 text-purple-300 hover:text-purple-200 px-8 py-4 rounded-lg font-semibold transition-all"
            >
              Thử AI Tools
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto py-12 border-t border-purple-500/20">
            <div>
              <div className="text-3xl font-bold text-purple-300">50+</div>
              <p className="text-sm text-gray-400 mt-2">Projects Completed</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-300">15+</div>
              <p className="text-sm text-gray-400 mt-2">AI Tools Created</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-300">100%</div>
              <p className="text-sm text-gray-400 mt-2">Creative Focus</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Expertise</h2>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Kỹ năng và kinh nghiệm sẽ giúp bạn đạt mục tiêu
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎨",
                title: "Brand & Design",
                desc: "Chiến lược thiết kế, visual identity, UI/UX design cho doanh nghiệp"
              },
              {
                icon: "✍️",
                title: "Content Creation",
                desc: "Viết content marketing, video storyboarding, copywriting chuyên nghiệp"
              },
              {
                icon: "🤖",
                title: "AI Tools & Automation",
                desc: "Phát triển AI tools cá nhân hóa, xử lý dữ liệu, tự động hóa workflow"
              }
            ].map((item, i) => (
              <div
                key={i}
                className="group bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 hover:border-purple-500/50 p-8 rounded-lg backdrop-blur transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-purple-300">
                  {item.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng hợp tác?</h2>
          <p className="text-gray-400 mb-8">
            Liên hệ với tôi để thảo luận về dự án của bạn
          </p>
          <Link
            href="mailto:your-email@example.com"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            📧 Contact Me
          </Link>
        </div>
      </section>
    </div>
  );
}
