export default function Connections() {
  return (
    <div className="max-w-6xl mx-auto pt-20 text-white px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#FFB84D] to-[#CC8400]">
        Builder Connections
      </h1>
      <p className="text-xl text-center mb-12 text-gray-300">
        Connect with fellow keyboard builders and creators
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="text-4xl mb-4">🤝</div>
          <h2 className="text-xl font-semibold mb-3 text-primary">Find Collaborators</h2>
          <p className="text-gray-300">
            Discover builders working on similar projects or complementary skills. Team up and create something amazing together.
          </p>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-colors">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-xl font-semibold mb-3 text-purple-300">Community Chat</h2>
          <p className="text-gray-300">
            Join discussions, share ideas, and get feedback from experienced builders in the community.
          </p>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-pink-500/30 rounded-lg p-6 hover:border-pink-500/50 transition-colors">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold mb-3 text-pink-300">Mentorship</h2>
          <p className="text-gray-300">
            Connect with mentors who can guide you through your building journey, or offer your expertise to newcomers.
          </p>
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-primary">Active Builders</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-primary/20">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-xl">
              KB
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Keyboard Builder</h3>
              <p className="text-sm text-gray-400">Working on: Custom 65% layout</p>
            </div>
            <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
              Connect
            </button>
          </div>
          <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-primary/20">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xl">
              CB
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Case Designer</h3>
              <p className="text-sm text-gray-400">Working on: 3D printed cases</p>
            </div>
            <button className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
              Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
