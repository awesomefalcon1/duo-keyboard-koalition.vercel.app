"use client"

import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, AlertCircle } from "lucide-react"

export default function UnauthorizedPage() {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    // Flush auth context by signing out and clearing state
    try {
      await signOut()
      // Clear any remaining auth state
      if (typeof window !== 'undefined') {
        // Clear localStorage if any auth data is stored
        localStorage.clear()
        // Clear sessionStorage
        sessionStorage.clear()
      }
      // Redirect to home/login page
      router.push("/")
    } catch (error) {
      console.error("Error clearing auth:", error)
      // Force redirect even if signOut fails
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0a0a1a]/80 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8 text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500/50">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          </div>

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Image
              src="/Aurajay - NoBG.png"
              alt="Duo Keyboard Koalition Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <h1 className="text-2xl font-bold text-white italic">
              DUO KEYBOARD KOALITION
            </h1>
          </div>

          {/* Error Message */}
          <h2 className="text-2xl font-semibold text-red-300 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-300 mb-2">
            Your session has expired or you need to log in to access this page.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Please log in again to continue.
          </p>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3 rounded-lg transition-colors mb-4"
          >
            Log In Again
          </Button>

          {/* Trust Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-primary/70">
            <Shield className="w-3 h-3 text-primary" />
            <span>Secure Authentication</span>
          </div>
        </div>
      </div>
    </div>
  )
}

