"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import SidebarToggle from "./SidebarToggle"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export default function SidebarClient({ 
  navItems, 
  isActive: serverIsActive,
  children 
}: { 
  navItems: NavItem[]
  isActive: (path: string) => boolean
  children: React.ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(true)
  const pathname = usePathname()
  
  // Use client-side pathname if available, otherwise fall back to server
  const isActive = (path: string) => pathname ? pathname === path : serverIsActive(path)

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-16"
        } transition-all duration-300 bg-card/90 backdrop-blur-sm border-r border-primary/30 flex flex-col`}
      >
        {/* Sidebar Header with Navbar Logo */}
        <div className="p-4 border-b border-primary/30">
          <div className="flex items-center justify-between">
            {isOpen && (
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image
                  src="/aurajay.png"
                  alt="Duo Keyboard Koalition Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-lg font-bold text-primary italic">
                  DUO KEYBOARD
                </span>
              </Link>
            )}
            <SidebarToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active
                    ? "bg-primary/20 text-primary border border-primary/50"
                    : "text-gray-400 hover:text-primary hover:bg-primary/10"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

