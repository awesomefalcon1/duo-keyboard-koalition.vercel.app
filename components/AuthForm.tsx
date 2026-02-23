"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Loader2 } from "lucide-react"

export default function AuthForm({
  view,
  error: initialError,
  message: initialMessage,
  compact = false,
}: {
  view: "signin" | "signup"
  error: string | null
  message: string | null
  compact?: boolean
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(initialError)
  const [message, setMessage] = useState<string | null>(initialMessage)
  const [isSignUp, setIsSignUp] = useState(view === "signup")

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const supabase = createClient()

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else {
          setMessage("Check your email to confirm your account")
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else {
          router.push("/dashboard")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsPending(false)
    }
  }

  const handleDiscordAuth = async () => {
    setIsPending(true)
    setError(null)

    const supabase = createClient()
    const baseUrl = window.location.origin
    const redirectUrl = baseUrl.includes('localhost') 
      ? `http://localhost:3000/auth/callback?next=/dashboard`
      : `${baseUrl}/auth/callback?next=/dashboard`

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: redirectUrl
        }
      })

      if (error) {
        setError(error.message)
        setIsPending(false)
      } else if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsPending(false)
    }
  }

  if (compact) {
    return (
      <Button
        type="button"
        onClick={() => router.push(`/?view=${isSignUp ? 'signup' : 'signin'}`)}
        className="bg-primary hover:bg-primary/90 text-black font-bold py-2 px-4 rounded-lg transition-colors"
      >
        {isSignUp ? "Sign Up" : "Sign In"}
      </Button>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Toggle Buttons */}
      <div className="flex bg-[#0a0a0a]/50 rounded-xl p-1.5 mb-8 border border-[#FFA500]/30">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false)
            router.push("/?view=signin")
          }}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            !isSignUp
              ? "bg-[#FFA500] text-black font-bold shadow-[0_0_10px_rgba(255,165,0,0.5)]"
              : "bg-transparent border border-[#FFA500]/30 text-gray-400 hover:text-[#FFA500] hover:bg-[#FFA500]/10"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true)
            router.push("/?view=signup")
          }}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            isSignUp
              ? "bg-[#FFA500] text-black font-bold shadow-[0_0_10px_rgba(255,165,0,0.5)]"
              : "bg-transparent border border-[#FFA500]/30 text-gray-400 hover:text-[#FFA500] hover:bg-[#FFA500]/10"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Error/Message Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
          {message}
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-[#FFA500] text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full bg-[#0a0a0a] border border-[#FFA500]/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500] transition-colors"
            placeholder="you@example.com"
            disabled={isPending}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-[#FFA500] text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full bg-[#0a0a0a] border border-[#FFA500]/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500] transition-colors"
            placeholder="••••••••"
            disabled={isPending}
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full font-bold py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isSignUp ? "Creating Account..." : "Signing In..."}
            </>
          ) : (
            isSignUp ? "Sign Up" : "Sign In"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#FFA500]/30"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#0a0a0a]/80 text-[#FFA500]">Or continue with</span>
        </div>
      </div>

      {/* Discord OAuth Button */}
      <Button
        type="button"
        onClick={handleDiscordAuth}
        disabled={isPending}
        className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33a1.125 1.125 0 0 1-1.062-1.173 1.125 1.125 0 1 1 2.124.008 1.119 1.119 0 0 1-1.062 1.165zm7.975 0a1.125 1.125 0 0 1-1.06-1.173 1.125 1.125 0 1 1 2.124.008 1.119 1.119 0 0 1-1.062 1.165z" />
        </svg>
        Continue with Discord
      </Button>
    </div>
  )
}
