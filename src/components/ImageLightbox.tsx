'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageLightboxProps {
  images: {
    id: number
    title: string
    description: string
    image: string
  }[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export default function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isAnimating, setIsAnimating] = useState(false)

  const goToNext = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
      setIsAnimating(false)
    }, 150)
  }

  const goToPrevious = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      setIsAnimating(false)
    }, 150)
  }

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsAnimating(false)
    }, 150)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          e.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex])

  if (!isOpen) return null

  const currentImage = images[currentIndex]

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center">
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Previous Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToPrevious}
        className="absolute left-4 z-10 text-white hover:bg-white/10"
        disabled={isAnimating}
      >
        <ChevronLeft className="w-8 h-8" />
      </Button>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={goToNext}
        className="absolute right-4 z-10 text-white hover:bg-white/10"
        disabled={isAnimating}
      >
        <ChevronRight className="w-8 h-8" />
      </Button>

      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
        <div
          className={`relative max-w-7xl w-full h-full max-h-[90vh] transition-transform duration-300 ${
            isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <img
            src={currentImage.image}
            alt={currentImage.title}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Image Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="container mx-auto max-w-7xl">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {currentImage.title}
          </h3>
          <p className="text-gray-300 text-lg">
            {currentImage.description}
          </p>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-4 left-4 text-white/70 text-sm bg-black/50 px-3 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
