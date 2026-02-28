"use client"

import { useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export type Hackathon = {
  id: string
  title: string
  description: string
  status: "upcoming" | "active" | "ended"
  start_date: string | null
  end_date: string | null
  max_team_size: number
  tags: string[]
  participant_count?: number
  is_registered?: boolean
}

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  active: { label: "🟢 Active", classes: "bg-green-500/20 text-green-300 border border-green-500/30" },
  upcoming: { label: "🔵 Upcoming", classes: "bg-blue-500/20 text-blue-300 border border-blue-500/30" },
  ended: { label: "⚫ Ended", classes: "bg-gray-500/20 text-gray-400 border border-gray-500/30" },
}

const TAG_COLORS = [
  "bg-primary/20 text-primary",
  "bg-purple-500/20 text-purple-300",
  "bg-pink-500/20 text-pink-300",
  "bg-cyan-500/20 text-cyan-300",
]

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "TBD"
  const s = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  if (!end) return `From ${s}`
  const e = new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return `${s} – ${e}`
}

type Props = {
  hackathon: Hackathon
  userId: string | null
}

export default function HackathonCard({ hackathon, userId }: Props) {
  const [registered, setRegistered] = useState(hackathon.is_registered ?? false)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(hackathon.participant_count ?? 0)
  const supabase = useMemo(() => createClient(), [])

  // Submission form state
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    repo_url: "",
    demo_url: "",
  })

  const statusStyle = STATUS_STYLES[hackathon.status] ?? STATUS_STYLES.upcoming
  const canSubmitProject = registered && hackathon.status === "active" && userId

  async function handleJoin() {
    if (!userId || registered || hackathon.status === "ended") return
    setLoading(true)
    const { error } = await supabase
      .from("hackathon_registrations")
      .insert({ hackathon_id: hackathon.id, user_id: userId })
    if (!error) {
      setRegistered(true)
      setCount((c) => c + 1)
    }
    setLoading(false)
  }

  async function handleSubmitProject(e: React.FormEvent) {
    e.preventDefault()
    if (!userId || !formData.title.trim()) return
    setSubmitting(true)
    setSubmitError(null)

    const { error } = await supabase.from("hackathon_submissions").insert({
      hackathon_id: hackathon.id,
      user_id: userId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      repo_url: formData.repo_url.trim() || null,
      demo_url: formData.demo_url.trim() || null,
    })

    if (error) {
      setSubmitError("Failed to submit project. Please try again.")
    } else {
      setSubmitted(true)
      setShowSubmitForm(false)
    }
    setSubmitting(false)
  }

  return (
    <div className="bg-background/80 backdrop-blur-sm border border-primary/30 rounded-lg p-6 hover:border-primary/50 transition-colors flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold text-primary leading-tight">{hackathon.title}</h2>
        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusStyle.classes}`}>
          {statusStyle.label}
        </span>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed flex-1">{hackathon.description}</p>

      <div className="flex flex-wrap gap-2">
        {hackathon.tags.map((tag, i) => (
          <span key={tag} className={`px-3 py-1 rounded-full text-xs ${TAG_COLORS[i % TAG_COLORS.length]}`}>
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>📅 {formatDateRange(hackathon.start_date, hackathon.end_date)}</span>
        <span>👥 {count} participant{count !== 1 ? "s" : ""}</span>
      </div>

      <button
        onClick={handleJoin}
        disabled={!userId || registered || hackathon.status === "ended" || loading}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
          registered
            ? "bg-green-500/20 text-green-300 border border-green-500/30 cursor-default"
            : hackathon.status === "ended"
              ? "bg-gray-500/10 text-gray-500 cursor-not-allowed"
              : "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30"
        }`}
      >
        {loading ? "Joining…" : registered ? "✅ Registered" : hackathon.status === "ended" ? "Ended" : "Join Hackathon"}
      </button>

      {/* Submit Project button — only for registered users on active hackathons */}
      {canSubmitProject && !submitted && (
        <button
          onClick={() => setShowSubmitForm((v) => !v)}
          className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-[#FFB84D]/20 text-[#FFB84D] hover:bg-[#FFB84D]/30 border border-[#FFB84D]/30"
        >
          {showSubmitForm ? "Cancel" : "Submit Project"}
        </button>
      )}

      {submitted && (
        <div className="text-center text-sm text-green-300 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
          ✅ Project submitted!
        </div>
      )}

      {/* Inline submission form */}
      {showSubmitForm && (
        <form onSubmit={handleSubmitProject} className="flex flex-col gap-3 border-t border-primary/20 pt-4">
          <input
            type="text"
            placeholder="Project title *"
            required
            value={formData.title}
            onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-background/60 border border-primary/20 text-white text-sm placeholder-gray-500 focus:border-primary/50 focus:outline-none"
          />
          <textarea
            placeholder="Brief description"
            rows={2}
            value={formData.description}
            onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-background/60 border border-primary/20 text-white text-sm placeholder-gray-500 focus:border-primary/50 focus:outline-none resize-none"
          />
          <input
            type="url"
            placeholder="Repo URL (optional)"
            value={formData.repo_url}
            onChange={(e) => setFormData((f) => ({ ...f, repo_url: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-background/60 border border-primary/20 text-white text-sm placeholder-gray-500 focus:border-primary/50 focus:outline-none"
          />
          <input
            type="url"
            placeholder="Demo URL (optional)"
            value={formData.demo_url}
            onChange={(e) => setFormData((f) => ({ ...f, demo_url: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-background/60 border border-primary/20 text-white text-sm placeholder-gray-500 focus:border-primary/50 focus:outline-none"
          />
          {submitError && <p className="text-red-400 text-xs">{submitError}</p>}
          <button
            type="submit"
            disabled={submitting || !formData.title.trim()}
            className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      )}
    </div>
  )
}
