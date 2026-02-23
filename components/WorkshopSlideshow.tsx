"use client"

import { useState } from "react"

const slides = [
  {
    title: "Soldering Basics",
    description:
      "Learn the fundamentals of soldering switches, diodes, and other components. Master proper technique, temperature control, and troubleshooting common issues.",
    background: "bg-gradient-to-r from-primary/80 via-[#CC8400] to-[#996400]",
    symbol: "🔌",
    symbolName: "Soldering",
  },
  {
    title: "PCB Assembly",
    description:
      "Understand PCB layout, component placement, and assembly techniques. Learn how to read schematics and build your first custom keyboard PCB.",
    background: "bg-gradient-to-r from-primary/60 to-primary/40",
    symbol: "⚡",
    symbolName: "Electronics",
  },
  {
    title: "Case Design",
    description:
      "Master 3D modeling and CAD design for keyboard cases. Learn about materials, manufacturing methods, and how to create ergonomic and aesthetic designs.",
    background: "bg-gradient-to-r from-primary/70 to-[#CC8400]",
    symbol: "🎨",
    symbolName: "Design",
  },
  {
    title: "Firmware Programming",
    description:
      "Dive into QMK and VIA configuration. Learn to program custom keymaps, layers, and macros. Create advanced features like tap-dance and combos.",
    background: "bg-gradient-to-r from-primary/50 to-gray-900",
    symbol: "💻",
    symbolName: "Code",
  },
  {
    title: "Switch Modding",
    description:
      "Explore switch customization techniques including lubing, filming, and spring swapping. Learn how to achieve the perfect feel and sound for your keyboard.",
    background: "bg-gradient-to-r from-primary to-[#FFB84D]",
    symbol: "⌨️",
    symbolName: "Switches",
  },
  {
    title: "Keycap Design",
    description:
      "Design custom keycap profiles and colorways. Learn about manufacturing processes, legends, and how to create unique aesthetic combinations.",
    background: "bg-gradient-to-r from-primary/60 to-primary/40",
    symbol: "🎯",
    symbolName: "Keycaps",
  },
]

export default function WorkshopSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div
        className={`p-8 rounded-lg shadow-lg text-white ${slides[currentSlide].background} border border-primary/20 relative overflow-hidden`}
      >
        <div className="flex flex-col">
          <div className="absolute opacity-10 left-4 top-4 text-8xl">
            {slides[currentSlide].symbol}
          </div>
          <div className="flex items-center justify-center mb-5 space-x-3">
            <span className="text-4xl">{slides[currentSlide].symbol}</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-center">
            {slides[currentSlide].title}
          </h2>
        </div>
        <p className="text-lg leading-relaxed text-center">
          {slides[currentSlide].description}
        </p>
      </div>
      <div className="flex justify-between mt-6">
        <button
          onClick={prevSlide}
          className="px-4 py-2 bg-primary rounded-lg text-black hover:bg-primary/90 transition-all font-semibold"
        >
          Previous
        </button>
        <div className="flex space-x-1">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? "bg-primary" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
        <button
          onClick={nextSlide}
          className="px-4 py-2 bg-primary rounded-lg text-black hover:bg-primary/90 transition-all font-semibold"
        >
          Next
        </button>
      </div>
    </div>
  )
}
