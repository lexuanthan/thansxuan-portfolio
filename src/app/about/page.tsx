import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import RichText from "@/components/RichText";
import { getAbout, getSettings } from "@/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "About · Lê Xuân Thân",
};

export default async function About() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  const contactHref = settings.email ? `mailto:${settings.email}` : "/projects";

  return (
    <SiteShell>
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              About Me
            </h1>
          </div>

          {/* Bio */}
          {about.bio && (
            <div className="mb-16 p-8 bg-white border border-gray-200 rounded-lg">
              {about.heading && (
                <h2 className="text-2xl font-bold mb-6 text-gray-900">
                  {about.heading}
                </h2>
              )}
              <RichText
                text={about.bio}
                className="space-y-4 text-gray-700 text-lg leading-relaxed"
              />
            </div>
          )}

          {/* Skills */}
          {about.skills.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">
                🛠️ Skills &amp; Expertise
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {about.skills.map((group) => (
                  <div
                    key={group.category}
                    className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition-all hover:shadow-md"
                  >
                    <h3 className="text-xl font-bold text-blue-600 mb-4">
                      {group.category}
                    </h3>
                    <ul className="space-y-2">
                      {group.items.map((skill) => (
                        <li key={skill} className="flex items-center text-gray-700">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 shrink-0"></span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journey */}
          {about.journey.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-gray-900">
                🚀 My Journey
              </h2>

              <div className="space-y-6">
                {about.journey.map((item, index) => (
                  <div key={`${item.year}-${index}`} className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shrink-0"></div>
                      {index !== about.journey.length - 1 && (
                        <div className="w-0.5 flex-1 min-h-16 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="pb-8">
                      <p className="text-blue-600 font-semibold text-sm">
                        {item.year}
                      </p>
                      <h4 className="text-xl font-bold text-gray-900 mt-2">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 mt-2">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Core values */}
          {about.core_values.length > 0 && (
            <div className="mb-16 p-8 bg-white border border-gray-200 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                💫 Core Values
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {about.core_values.map((value) => (
                  <div key={value.title} className="text-center">
                    <div className="text-4xl mb-3">{value.icon}</div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">
                      {value.title}
                    </h4>
                    <p className="text-gray-600 text-sm">{value.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Interested in collaborating?
            </h3>
            <p className="text-gray-600 mb-8">
              I&apos;m always open to interesting projects, partnerships, and
              conversations
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={contactHref}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all"
              >
                📧 Get in Touch
              </Link>
              <Link
                href="/projects"
                className="border-2 border-blue-600 hover:bg-blue-50 text-blue-600 px-8 py-4 rounded-lg font-semibold transition-all"
              >
                📂 View My Work
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
