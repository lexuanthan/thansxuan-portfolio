import SiteShell from "@/components/SiteShell";
import { getAiTools } from "@/lib/queries";
import { statusClassName } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "AI Tools · Lê Xuân Thân",
};

export default async function AITools() {
  const tools = await getAiTools();

  return (
    <SiteShell>
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Tools
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Các ứng dụng AI cá nhân hóa giúp bạn tạo content, phát triển chiến
              lược, và tự động hóa công việc hàng ngày
            </p>
          </div>

          {/* Tools grid */}
          {tools.length === 0 ? (
            <p className="text-center text-gray-500 py-20">
              Chưa có tool nào được đăng.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {tools.map((tool) => {
                const card = (
                  <div
                    className={`relative bg-gradient-to-br ${tool.color} border border-gray-300 hover:border-blue-400 rounded-lg p-8 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 h-full`}
                  >
                    <div className="absolute top-4 right-4">
                      <span
                        className={`border px-3 py-1 rounded-full text-xs font-semibold ${statusClassName(
                          tool.status_color
                        )}`}
                      >
                        {tool.status}
                      </span>
                    </div>

                    <div className="text-5xl mb-4">{tool.icon}</div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                      {tool.description}
                    </p>

                    {tool.link_url && (
                      <div className="mt-6 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-semibold">Explore →</span>
                      </div>
                    )}
                  </div>
                );

                return tool.link_url ? (
                  <a
                    key={tool.id}
                    href={tool.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    {card}
                  </a>
                ) : (
                  <div key={tool.id} className="group">
                    {card}
                  </div>
                );
              })}
            </div>
          )}

          {/* How it works */}
          <div className="mt-20 p-8 sm:p-12 bg-white border border-gray-200 rounded-lg">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
              Cách hoạt động
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Nhập Input", desc: "Cung cấp thông tin hoặc prompt cho tool" },
                { step: "02", title: "AI Processing", desc: "AI xử lý và tạo kết quả tùy chỉnh" },
                { step: "03", title: "Export & Use", desc: "Tải kết quả, chỉnh sửa, và sử dụng ngay" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-4">
                    {item.step}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
