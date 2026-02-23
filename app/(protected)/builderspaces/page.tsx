export default function BuilderSpaces() {
  return (
    <div className="max-w-6xl mx-auto pt-20 text-white px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#FFB84D] to-[#CC8400]">
        Builder Spaces
      </h1>
      <p className="text-xl text-center mb-12 text-gray-300">
        Dedicated workspaces and collaboration areas for keyboard builders
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🏠</div>
            <div>
              <h2 className="text-xl font-semibold text-primary">Virtual Workspace</h2>
              <p className="text-sm text-gray-400">Online collaboration space</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            Join our virtual workspace where builders share screens, collaborate in real-time, and get instant feedback on their projects.
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">12 active builders</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Live</span>
          </div>
          <button className="w-full py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
            Join Workspace
          </button>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">💬</div>
            <div>
              <h2 className="text-xl font-semibold text-purple-300">Design Studio</h2>
              <p className="text-sm text-gray-400">Case & keycap design</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            A focused space for discussing case designs, keycap profiles, and aesthetic choices. Share renders and get design critiques.
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">8 active designers</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Live</span>
          </div>
          <button className="w-full py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors">
            Enter Studio
          </button>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-pink-500/30 rounded-lg p-6 hover:border-pink-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">🔧</div>
            <div>
              <h2 className="text-xl font-semibold text-pink-300">Hardware Lab</h2>
              <p className="text-sm text-gray-400">PCB & circuit design</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            Technical workspace for PCB design, circuit analysis, and hardware troubleshooting. Get help with component selection and layout optimization.
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">15 active engineers</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Live</span>
          </div>
          <button className="w-full py-2 bg-pink-500/20 text-pink-300 rounded-lg hover:bg-pink-500/30 transition-colors">
            Access Lab
          </button>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl">💻</div>
            <div>
              <h2 className="text-xl font-semibold text-primary">Firmware Workshop</h2>
              <p className="text-sm text-gray-400">Code & programming</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            Collaborative coding space for firmware development, QMK configuration, and custom feature implementation. Pair program and share code snippets.
          </p>
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">9 active developers</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Live</span>
          </div>
          <button className="w-full py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
            Join Workshop
          </button>
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-primary">Create Your Own Space</h2>
        <p className="text-gray-300 mb-6">
          Start a dedicated workspace for your project, team, or interest group. Invite collaborators and build together.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background rounded-lg p-4 border border-primary/20">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-white mb-2">Project Space</h3>
            <p className="text-sm text-gray-400">Dedicated workspace for a specific keyboard project</p>
          </div>
          <div className="bg-background rounded-lg p-4 border border-primary/20">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-white mb-2">Team Space</h3>
            <p className="text-sm text-gray-400">Collaborative space for your building team</p>
          </div>
          <div className="bg-background rounded-lg p-4 border border-primary/20">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-white mb-2">Learning Space</h3>
            <p className="text-sm text-gray-400">Educational space for tutorials and workshops</p>
          </div>
        </div>
        <button className="mt-6 w-full md:w-auto px-6 py-3 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors border border-primary/30">
          + Create New Space
        </button>
      </div>
    </div>
  )
}

