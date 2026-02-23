"use client"

import Image from "next/image"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative w-40 h-40">
        {/* Outer pulsing circles */}
        <div className="absolute inset-[-30px] border-2 border-primary/40 rounded-full animate-circle-pulse"></div>
        <div className="absolute inset-[-30px] border-2 border-primary/40 rounded-full animate-circle-pulse" style={{ animationDelay: "0.7s" }}></div>
        <div className="absolute inset-[-30px] border-2 border-primary/40 rounded-full animate-circle-pulse" style={{ animationDelay: "1.4s" }}></div>

        {/* Outer rotating circle with gradient */}
        <div
          className="absolute inset-[-20px] border-2 border-transparent border-t-primary border-r-primary border-b-primary border-l-primary rounded-full animate-circle-rotate loading-glow-outer"
        ></div>

        {/* Middle rotating circle (reverse) */}
        <div
          className="absolute inset-[-10px] border-2 border-transparent border-t-primary border-r-primary border-b-primary border-l-primary rounded-full animate-circle-rotate loading-glow-inner"
          style={{ animationDirection: "reverse" }}
        ></div>

        {/* Inner pulsing circle */}
        <div className="absolute inset-0 border-2 border-primary/50 rounded-full animate-circle-pulse"></div>

        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="animate-logo-pulse">
            <Image
              src="/Aurajay - NoBG.png"
              alt="Duo Keyboard Koalition Logo"
              width={80}
              height={80}
              className="w-20 h-20 loading-logo-glow"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}

