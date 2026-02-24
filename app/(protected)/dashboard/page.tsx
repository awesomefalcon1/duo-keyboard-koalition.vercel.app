"use client"

import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Loading from "@/components/Loading"
import { ExternalLink, FolderKanban, Users, Link2 } from "lucide-react"

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
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Image
              src="/aurajay.png"
              alt="Duo Keyboard Koalition Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-3xl font-bold text-white italic mb-2 cyber-glow">
                DUO KEYBOARD KOALITION
              </h1>
              <p className="text-primary">Welcome to your dashboard</p>
            </div>
          </div>
          <Button onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Quick Links */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 cyber-box">
            <div className="flex items-center gap-3 mb-4">
              <FolderKanban className="w-8 h-8 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Projects</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Explore community projects and showcase your work.</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open('https://duo-keyboard-koalition.github.io/projects', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Projects
            </Button>
          </div>

          <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 cyber-box">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Community</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Connect with other hackers and build together.</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open('https://discord.gg/6GaWZAawUc', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Join Discord
            </Button>
          </div>

          <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 cyber-box">
            <div className="flex items-center gap-3 mb-4">
              <Link2 className="w-8 h-8 text-primary" />
              <h2 className="text-lg font-semibold text-primary">Home</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">Visit our home page.</p>
            <Link href="/">
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* User Profile */}
        <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 mb-6 cyber-box">
          <h2 className="text-xl font-semibold mb-4 text-primary">Your Profile</h2>
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="font-medium text-primary">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium text-primary">User ID:</span> {user.id}
            </p>
            {user.user_metadata?.full_name && (
              <p>
                <span className="font-medium text-primary">Name:</span> {user.user_metadata.full_name}
              </p>
            )}
          </div>
        </div>

        {/* User Data (JSON) */}
        <div className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 cyber-box">
          <h2 className="text-xl font-semibold mb-4 text-primary">User Data (JSON)</h2>
          <div className="bg-background rounded-lg p-4 border border-primary/20 overflow-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
