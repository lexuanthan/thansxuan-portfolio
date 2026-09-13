import Link from "next/link";

export default function About() {
  const skills = [
    { category: "Brand & Design", items: ["Brand Strategy", "Visual Identity", "UI/UX Design", "Design Systems"] },
    { category: "Content Creation", items: ["Copywriting", "Video Storytelling", "Social Media", "Content Strategy"] },
    { category: "AI & Technology", items: ["AI/ML Integration", "Data Analysis", "Automation", "Web Development"] },
    { category: "Research", items: ["Consumer Research", "Market Analysis", "Data Visualization", "Business Intelligence"] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-purple-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            About Me
          </h1>
        </div>

        {/* Bio Section */}
        <div className="mb-16 p-8 bg-white border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">👋 Hi, I'm Thân</h2>
          
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              I'm <span className="text-blue-600 font-semibold">Lê Xuân Thân</span>, born on April 20, 1992. 
              I'm a brand strategist, designer, and AI enthusiast passionate about creating innovative solutions 
              in the field of branding and communications.
            </p>

            <p>
              By day, I lead design and innovation initiatives in brand management and communications. 
              My work focuses on crafting compelling brand narratives, designing memorable visual identities, 
              and creating engaging content that resonates with audiences.
            </p>

            <p>
              By night (and on weekends), I'm a <span className="text-blue-600 font-semibold">research doctoral student</span> pursuing 
              a PhD in Economic Management. I'm deeply interested in how AI and technology can revolutionize 
              the way we approach marketing, branding, and business strategy.
            </p>

            <p>
              What drives me? The constant pursuit of <span className="text-purple-600 font-semibold">innovation and creativity</span>. 
              I believe the future of branding lies at the intersection of human creativity and artificial intelligence. 
              I'm committed to exploring this frontier through both my professional work and academic research.
            </p>
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">🛠️ Skills & Expertise</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {skills.map((skillGroup) => (
              <div
                key={skillGroup.category}
                className="p-6 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition-all hover:shadow-md"
              >
                <h3 className="text-xl font-bold text-blue-600 mb-4">
                  {skillGroup.category}
                </h3>
                <ul className="space-y-2">
                  {skillGroup.items.map((skill) => (
                    <li key={skill} className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Journey Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">🚀 My Journey</h2>
          
          <div className="space-y-6">
            {[
              {
                year: "2012-2016",
                title: "Undergraduate Studies",
                desc: "Foundation in business and design principles"
              },
              {
                year: "2017-2022",
                title: "Professional Work in Branding",
                desc: "Led creative teams, managed brand campaigns, and developed design systems"
              },
              {
                year: "2023-Present",
                title: "PhD Student + AI Innovator",
                desc: "Researching the intersection of AI and brand management while building AI tools"
              },
              {
                year: "2024-Future",
                title: "Creator & Entrepreneur",
                desc: "Building personal brand, creating AI solutions, and pushing creative boundaries"
              }
            ].map((item, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full border-4 border-white"></div>
                  {index !== 3 && <div className="w-0.5 h-24 bg-gray-300 mt-2"></div>}
                </div>
                <div className="pb-8">
                  <p className="text-blue-600 font-semibold text-sm">{item.year}</p>
                  <h4 className="text-xl font-bold text-gray-900 mt-2">{item.title}</h4>
                  <p className="text-gray-600 mt-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16 p-8 bg-white border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">💫 Core Values</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "✨",
                title: "Creativity",
                desc: "Always pushing boundaries, thinking differently"
              },
              {
                icon: "🎯",
                title: "Strategy",
                desc: "Data-driven decisions, not just pretty designs"
              },
              {
                icon: "🚀",
                title: "Innovation",
                desc: "Embracing new technologies and methodologies"
              }
            ].map((value) => (
              <div key={value.title} className="text-center">
                <div className="text-4xl mb-3">{value.icon}</div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{value.title}</h4>
                <p className="text-gray-600 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Interested in collaborating?</h3>
          <p className="text-gray-600 mb-8">
            I'm always open to interesting projects, partnerships, and conversations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="mailto:your-email@example.com"
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
  );
}
