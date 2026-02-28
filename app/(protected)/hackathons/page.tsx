"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Loading from "@/components/Loading"
import HackathonCard, { type Hackathon } from "@/components/HackathonCard"
import { createClient } from "@/utils/supabase/client"

const FALLBACK_HACKATHONS: Hackathon[] = [
  {
    id: "1",
    title: "Duo Keyboard Build-Off",
    description: "Build the most innovative dual-layout keyboard. Showcase your creativity and technical skills in this flagship DKK event.",
    status: "active",
    start_date: "2026-02-20",
    end_date: "2026-03-05",
    max_team_size: 4,
    tags: ["Hardware", "Design"],
    participant_count: 12,
  },
  {
    id: "2",
    title: "Rapid Prototype Challenge",
    description: "Design and build a functional keyboard prototype in 48 hours. Speed and innovation are key — can you ship under pressure?",
    status: "upcoming",
    start_date: "2026-03-15",
    end_date: "2026-03-17",
    max_team_size: 2,
    tags: ["Speed Build", "Innovation"],
    participant_count: 5,
  },
  {
    id: "3",
    title: "Aesthetic Design Contest",
    description: "Showcase your keyboard's visual design. Winners get featured in the community gallery and DKK hall of fame.",
    status: "upcoming",
    start_date: "2026-04-01",
    end_date: "2026-04-30",
    max_team_size: 1,
    tags: ["Design", "Aesthetics"],
    participant_count: 3,
  },
  {
    id: "4",
    title: "Firmware Hackathon",
    description: "Build innovative firmware features and QMK/VIA configurations. Push the boundaries of what keyboard software can do.",
    status: "ended",
    start_date: "2026-01-10",
    end_date: "2026-01-24",
    max_team_size: 3,
    tags: ["Firmware", "Software"],
    participant_count: 18,
  },
]

type FilterTab = "all" | "active" | "upcoming" | "ended"

const TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "🟢 Active", value: "active" },
  { label: "🔵 Upcoming", value: "upcoming" },
  { label: "⚫ Past", value: "ended" },
]

export default function Hackathons() {
  const { user, loading } = useAuth()
  const [hackathons, setHackathons] = useState<Hackathon[]>([])
  const [filter, setFilter] = useState<FilterTab>("all")
  const [dataLoading, setDataLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/unauthorized"
    }
  }, [loading, user])

  useEffect(() => {
    if (!user) return
    async function fetchHackathons() {
      setDataLoading(true)
      try {
        const { data: hackathonData, error } = await supabase
          .from("hackathons")
          .select("*")
          .order("created_at", { ascending: false })

        // Table missing or empty — show fallback
        if (error || !hackathonData?.length) {
          setHackathons(FALLBACK_HACKATHONS)
          setDataLoading(false)
          return
        }

        // Fetch registration counts and user's own registrations
        const { data: regData } = await supabase
          .from("hackathon_registrations")
          .select("hackathon_id, user_id")

        const countMap: Record<string, number> = {}
        const registeredSet = new Set<string>()
        for (const reg of regData ?? []) {
          countMap[reg.hackathon_id] = (countMap[reg.hackathon_id] ?? 0) + 1
          if (reg.user_id === user?.id) registeredSet.add(reg.hackathon_id)
        }

        setHackathons(
          hackathonData.map((h) => ({
            ...h,
            participant_count: countMap[h.id] ?? 0,
            is_registered: registeredSet.has(h.id),
          }))
        )
      } catch {
        // Network error or table doesn't exist — show fallback
        setHackathons(FALLBACK_HACKATHONS)
      } finally {
        setDataLoading(false)
      }
    }
    fetchHackathons()
  }, [user, supabase])

  if (loading) return <Loading />
  if (!user) return null

  const filtered = filter === "all" ? hackathons : hackathons.filter((h) => h.status === filter)

  return (
    <div className="max-w-6xl mx-auto pt-20 text-white px-4 min-h-screen">
      <h1 className="text-4xl font-bold mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#FFB84D] to-[#CC8400]">
        Hackathons & Events
      </h1>
      <p className="text-xl text-center mb-8 text-gray-300">
        Join keyboard building competitions and community events
      </p>

      {/* Filter Tabs */}
      <div className="flex gap-2 justify-center mb-10 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-primary text-black"
                : "bg-background/60 text-gray-300 border border-primary/30 hover:border-primary/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {dataLoading ? (
        <div className="text-center text-gray-400 py-20">Loading hackathons…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-20">No hackathons in this category yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filtered.map((h) => (
            <HackathonCard key={h.id} hackathon={h} userId={user.id} />
          ))}
        </div>
      )}
    </div>
  )
}
