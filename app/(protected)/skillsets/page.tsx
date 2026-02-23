export default function SkillSets() {
  return (
    <div className="max-w-6xl mx-auto pt-20 text-white px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#FFB84D] to-[#CC8400]">
        Skill Sets & Expertise
      </h1>
      <p className="text-xl text-center mb-12 text-gray-300">
        Discover builders by their skills and learn from the community
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors text-center">
          <div className="text-5xl mb-4">🔨</div>
          <h2 className="text-xl font-semibold mb-3 text-primary">Hardware Design</h2>
          <p className="text-gray-400 text-sm mb-4">PCB design, circuit layout, component selection</p>
          <div className="text-primary font-semibold">24 builders</div>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-colors text-center">
          <div className="text-5xl mb-4">💻</div>
          <h2 className="text-xl font-semibold mb-3 text-purple-300">Firmware Development</h2>
          <p className="text-gray-400 text-sm mb-4">QMK, VIA, custom firmware programming</p>
          <div className="text-purple-300 font-semibold">18 builders</div>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-pink-500/30 rounded-lg p-6 hover:border-pink-500/50 transition-colors text-center">
          <div className="text-5xl mb-4">🎨</div>
          <h2 className="text-xl font-semibold mb-3 text-pink-300">Case Design</h2>
          <p className="text-gray-400 text-sm mb-4">3D modeling, CAD, case fabrication</p>
          <div className="text-pink-300 font-semibold">31 builders</div>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors text-center">
          <div className="text-5xl mb-4">⌨️</div>
          <h2 className="text-xl font-semibold mb-3 text-primary">Keycap Design</h2>
          <p className="text-gray-400 text-sm mb-4">Custom keycap profiles, colorways, legends</p>
          <div className="text-primary font-semibold">15 builders</div>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-colors text-center">
          <div className="text-5xl mb-4">🔧</div>
          <h2 className="text-xl font-semibold mb-3 text-purple-300">Assembly & Modding</h2>
          <p className="text-gray-400 text-sm mb-4">Soldering, lubing, stabilizer tuning</p>
          <div className="text-purple-300 font-semibold">42 builders</div>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-pink-500/30 rounded-lg p-6 hover:border-pink-500/50 transition-colors text-center">
          <div className="text-5xl mb-4">📐</div>
          <h2 className="text-xl font-semibold mb-3 text-pink-300">Ergonomics</h2>
          <p className="text-gray-400 text-sm mb-4">Ergonomic layouts, hand positioning, comfort</p>
          <div className="text-pink-300 font-semibold">12 builders</div>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors text-center">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-xl font-semibold mb-3 text-primary">Documentation</h2>
          <p className="text-gray-400 text-sm mb-4">Build guides, tutorials, technical writing</p>
          <div className="text-primary font-semibold">9 builders</div>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-colors text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-xl font-semibold mb-3 text-purple-300">Testing & QA</h2>
          <p className="text-gray-400 text-sm mb-4">Switch testing, quality assurance, validation</p>
          <div className="text-purple-300 font-semibold">7 builders</div>
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-primary">Top Contributors</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-primary/20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-2xl font-bold">
              KB
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Keyboard Master</h3>
              <p className="text-sm text-gray-400 mb-2">Hardware Design • Firmware Development • Case Design</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">Expert</span>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">Mentor</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">127</div>
              <div className="text-xs text-gray-400">Projects</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-primary/20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold">
              CB
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-1">Case Builder Pro</h3>
              <p className="text-sm text-gray-400 mb-2">Case Design • 3D Modeling • Assembly</p>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-xs">Expert</span>
                <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">Contributor</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-300">89</div>
              <div className="text-xs text-gray-400">Projects</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
