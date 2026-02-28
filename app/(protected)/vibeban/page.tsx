"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Loading from "@/components/Loading"
import { Dashboard } from "@/components/vibeban/dashboard"

export default function VibeBanPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/unauthorized")
    }
  }, [loading, user, router])

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return null
  }

  return <Dashboard />
}