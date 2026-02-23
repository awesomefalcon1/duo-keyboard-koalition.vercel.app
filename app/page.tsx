"use client"

import { useEffect } from "react"
import Loading from "@/components/Loading"

export default function HomePage() {
  useEffect(() => {
    // Redirect all public traffic to the GitHub Pages landing site
    window.location.href = "https://duo-keyboard-koalition.github.io"
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
      <div className="text-center">
        <Loading />
        <p className="text-gray-400 mt-4">Redirecting to Duo Keyboard Koalition...</p>
      </div>
    </div>
  )
}
