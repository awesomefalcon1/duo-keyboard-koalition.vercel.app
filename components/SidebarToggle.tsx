"use client"

import { Menu, X } from "lucide-react"

export default function SidebarToggle({
  isOpen,
  onToggle
}: {
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="text-primary hover:text-[#FFB84D] transition-colors ml-auto"
      aria-label="Toggle sidebar"
    >
      {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </button>
  )
}

