"use client"

import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Loading from "@/components/Loading"
import { ExternalLink, Calendar, FolderKanban, Users } from "lucide-react"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/unauthorized"
    }
  }, [user, loading])

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    // Redirect to github.io landing page after sign out
    window.location.href = "https://duo-keyboard-koalition.github.io"
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image
              src="/Aurajay - NoBG.png"
              alt="Duo Keyboard Koalition Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-3xl font-bold text-white italic mb-2">
                DUO KEYBOARD KOALITION
              </h1>
              <p className="text-cyan-300">Welcome to your dashboard</p>
            </div>
          </div>
          <Button onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Quick Links */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-[#0a0a1a]/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-cyan-400" />
              <h2 className="text-lg font-semibold text-cyan-300">Events</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Browse and RSVP to hackathons and community events.</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/20"
              onClick={() => window.open('https://app.getriver.io/beta/duo-keyboard-koalition', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Events
            </Button>
          </div>

          <div className="bg-[#0a0a1a]/80 backdrop-blur-sm border border-magenta-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FolderKanban className="w-8 h-8 text-magenta-400" />
              <h2 className="text-lg font-semibold text-magenta-300">Projects</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Explore community projects and showcase your work.</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-magenta-400 text-magenta-400 hover:bg-magenta-400/20"
              onClick={() => window.open('https://duo-keyboard-koalition.github.io/projects', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Projects
            </Button>
          </div>

          <div className="bg-[#0a0a1a]/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-cyan-400" />
              <h2 className="text-lg font-semibold text-cyan-300">Community</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Connect with other hackers and build together.</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/20"
              onClick={() => window.open('https://discord.gg/6GaWZAawUc', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Join Discord
            </Button>
          </div>

          <div className="bg-[#0a0a1a]/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <ExternalLink className="w-8 h-8 text-cyan-400" />
              <h2 className="text-lg font-semibold text-cyan-300">Landing Site</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Visit our public landing page and learn more about DKK.</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/20"
              onClick={() => window.open('https://duo-keyboard-koalition.github.io', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Site
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="bg-[#0a0a1a]/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-cyan-300">Your Profile</h2>
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="font-medium text-cyan-400">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium text-cyan-400">User ID:</span> {user.id}
            </p>
            {user.user_metadata?.full_name && (
              <p>
                <span className="font-medium text-cyan-400">Name:</span> {user.user_metadata.full_name}
              </p>
            )}
          </div>
        </div>

        {/* User Data (JSON) */}
        <div className="bg-[#0a0a1a]/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-cyan-300">User Data (JSON)</h2>
          <div className="bg-[#0a0a1a] rounded-lg p-4 border border-cyan-500/20 overflow-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
