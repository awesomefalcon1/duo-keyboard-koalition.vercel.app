"use client"

import { Suspense } from "react"
import { useAuth } from "@/context/AuthContext"
import { useSearchParams } from "next/navigation"
import Loading from "@/components/Loading"
import AuthForm from "@/components/AuthForm"
import { ExternalLink } from "lucide-react"

function HomePageContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  
  const view = (searchParams.get("view") as "signin" | "signup") || "signin"

  // If user is logged in, redirect to dashboard
  if (user) {
    window.location.href = "/dashboard"
    return null
  }

  return (
    <div className="max-w-2xl mx-auto text-center w-full">
      <h1 className="text-5xl font-bold text-white italic mb-4 cyber-glow">
        DUO KEYBOARD KOALITION
      </h1>
      <p className="text-[#FFA500] text-xl mb-8">Hack. Build. Create.</p>
      
      <AuthForm view={view} error={null} message={null} />

      <div className="mt-8">
        <p className="text-gray-500 text-sm">
          Visit our public landing page at{" "}
          <a
            href="https://duo-keyboard-koalition.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFA500] hover:underline inline-flex items-center"
          >
            duo-keyboard-koalition.github.io
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loading />
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-8">
      <Suspense fallback={
        <div className="text-center">
          <Loading />
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      }>
        <HomePageContent />
      </Suspense>
    </div>
  )
}
