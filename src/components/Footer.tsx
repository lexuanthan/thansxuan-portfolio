import Link from "next/link";
import type { Settings, SocialLinks } from "@/lib/types";

const SOCIAL_LABELS: { key: keyof SocialLinks; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "twitter", label: "X" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "website", label: "Website" },
];

export default function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const social = settings.social ?? {};
  const links = SOCIAL_LABELS.filter((s) => social[s.key]);

  return (
    <footer className="bg-black border-t border-purple-500/20 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold text-lg mb-4">
              {settings.hero_title || "Lê Xuân Thân"}
            </h4>
            <p className="text-sm text-gray-400">
              {settings.footer_text ||
                "Brand strategist, designer, content creator, and AI enthusiast."}
            </p>
            {settings.location && (
              <p className="mt-3 text-sm text-gray-500">📍 {settings.location}</p>
            )}
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/projects" className="hover:text-purple-400 transition">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/ai-tools" className="hover:text-purple-400 transition">
                  AI Tools
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-purple-400 transition">
                  About Me
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Connect</h4>

            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="block text-sm text-gray-400 hover:text-purple-400 transition"
              >
                ✉ {settings.email}
              </a>
            )}
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                className="mt-1 block text-sm text-gray-400 hover:text-purple-400 transition"
              >
                ☎ {settings.phone}
              </a>
            )}

            {links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {links.map((s) => (
                  <a
                    key={s.key}
                    href={social[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-purple-400 transition"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {year} {settings.hero_title || "Lê Xuân Thân"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
