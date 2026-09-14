import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { getProjects, getSettings } from "@/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Portfolio · Lê Xuân Thân",
};

export default async function Projects() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  const contactHref = settings.email ? `mailto:${settings.email}` : "/about";

  return (
    <SiteShell>
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

          {projects.length === 0 ? (
            <p className="text-center text-gray-500 py-20">
              Chưa có dự án nào được đăng.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => {
                const card = (
                  <div
                    className={`bg-gradient-to-br ${project.color} border border-gray-300 hover:border-blue-400 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col`}
                  >
                    {project.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="h-44 w-full object-cover"
                      />
                    )}

                    <div className="flex flex-col flex-grow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-blue-600">
                          Project #{String(index + 1).padStart(2, "0")}
                        </span>
                        {project.featured && (
                          <span className="text-xs font-semibold text-purple-700">
                            ★ Featured
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </h3>

                      <p className="text-gray-700 mb-6 flex-grow whitespace-pre-line">
                        {project.description}
                      </p>

                      {project.tags.length > 0 && (
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
                      )}

                      {project.link_url && (
                        <span className="mt-4 text-sm font-semibold text-blue-700">
                          Xem dự án →
                        </span>
                      )}
                    </div>
                  </div>
                );

                return project.link_url ? (
                  <a
                    key={project.id}
                    href={project.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group h-full block"
                  >
                    {card}
                  </a>
                ) : (
                  <div key={project.id} className="group h-full">
                    {card}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer CTA */}
          <div className="mt-20 text-center p-8 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-2xl font-bold mb-3 text-gray-900">
              Có dự án thú vị?
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy liên hệ với tôi để thảo luận về cách tôi có thể giúp bạn
            </p>
            <Link
              href={contactHref}
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-lg font-semibold transition-all"
            >
              📧 Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
