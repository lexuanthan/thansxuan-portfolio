import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-purple-500/20 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Lê Xuân Thân</h4>
            <p className="text-sm text-gray-400">Brand strategist, designer, content creator, and AI enthusiast.</p>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/projects" className="hover:text-purple-400 transition">Portfolio</Link></li>
              <li><Link href="/ai-tools" className="hover:text-purple-400 transition">AI Tools</Link></li>
              <li><Link href="/about" className="hover:text-purple-400 transition">About Me</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-lg mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">Twitter</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">LinkedIn</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition">GitHub</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-sm text-gray-500">© {year} Lê Xuân Thân. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
