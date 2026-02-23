export default function Hackathons() {
  return (
    <div className="max-w-6xl mx-auto pt-20 text-white px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#FFB84D] to-[#CC8400]">
        Hackathons & Events
      </h1>
      <p className="text-xl text-center mb-12 text-gray-300">
        Join keyboard building competitions and community events
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">🏆</div>
            <div>
              <h2 className="text-xl font-semibold text-primary">Duo Keyboard Build-Off</h2>
              <p className="text-sm text-gray-400">Active • Ends in 5 days</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            Build the most innovative dual-layout keyboard. Showcase your creativity and technical skills.
          </p>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">Hardware</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Design</span>
          </div>
          <button className="w-full py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
            Join Hackathon
          </button>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">⚡</div>
            <div>
              <h2 className="text-xl font-semibold text-purple-300">Rapid Prototype Challenge</h2>
              <p className="text-sm text-gray-400">Upcoming • Starts in 2 weeks</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            Design and build a functional keyboard prototype in 48 hours. Speed and innovation are key.
          </p>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Speed Build</span>
            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">Innovation</span>
          </div>
          <button className="w-full py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors">
            Register Interest
          </button>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-pink-500/30 rounded-lg p-6 hover:border-pink-500/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">🎨</div>
            <div>
              <h2 className="text-xl font-semibold text-pink-300">Aesthetic Design Contest</h2>
              <p className="text-sm text-gray-400">Ongoing • Monthly</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            Showcase your keyboard&apos;s visual design. Winners featured in community gallery.
          </p>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">Design</span>
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">Aesthetics</span>
          </div>
          <button className="w-full py-2 bg-pink-500/20 text-pink-300 rounded-lg hover:bg-pink-500/30 transition-colors">
            Submit Entry
          </button>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">🔧</div>
            <div>
              <h2 className="text-xl font-semibold text-primary">Firmware Hackathon</h2>
              <p className="text-sm text-gray-400">Upcoming • Starts in 1 month</p>
            </div>
          </div>
          <p className="text-gray-300 mb-4">
            Build innovative firmware features and QMK/VIA configurations. Push the boundaries of keyboard software.
          </p>
          <div className="flex gap-2 mb-4">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">Firmware</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Software</span>
          </div>
          <button className="w-full py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
            Learn More
          </button>
        </div>
      </div>

      <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-primary">Past Winners</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background rounded-lg p-4 border border-primary/20">
            <div className="text-2xl mb-2">🥇</div>
            <h3 className="font-semibold text-white mb-1">Modular 65%</h3>
            <p className="text-sm text-gray-400">by @keyboard_master</p>
          </div>
          <div className="bg-background rounded-lg p-4 border border-primary/20">
            <div className="text-2xl mb-2">🥈</div>
            <h3 className="font-semibold text-white mb-1">Ergo Split Pro</h3>
            <p className="text-sm text-gray-400">by @ergo_builder</p>
          </div>
          <div className="bg-background rounded-lg p-4 border border-primary/20">
            <div className="text-2xl mb-2">🥉</div>
            <h3 className="font-semibold text-white mb-1">Wireless TKL</h3>
            <p className="text-sm text-gray-400">by @wireless_wizard</p>
          </div>
        </div>
      </div>
    </div>
  )
}
