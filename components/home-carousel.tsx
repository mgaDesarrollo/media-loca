'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HomeCarouselProps {
  images: string[]
}

export function HomeCarousel({ images }: HomeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [images.length])

  if (!images || images.length === 0) return null

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <div className="relative mx-auto max-w-4xl w-full px-4 py-8">
      <div className="relative overflow-hidden rounded-2xl aspect-[21/9] md:aspect-[3/1] w-full shadow-lg border border-muted group">
        <div 
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, idx) => (
            <div key={idx} className="min-w-full h-full relative flex items-center justify-center bg-black overflow-hidden">
              {/* Blurred background fallback */}
              <img
                src={image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover filter blur-xl opacity-30 scale-105 select-none pointer-events-none"
              />
              {/* Contained sharp image */}
              <img
                src={image}
                alt={`Media Loca Banner ${idx + 1}`}
                className="relative z-10 max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? 'w-4 bg-primary' : 'w-1.5 bg-primary/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
