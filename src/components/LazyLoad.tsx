'use client'

import { useState, useEffect, useRef, ReactNode, memo } from 'react'
import { Loader2 } from 'lucide-react'

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  delay?: number
  minHeight?: string
}

export const LazyLoad = memo<LazyLoadProps>(function LazyLoad({
  children,
  fallback,
  className = '',
  threshold = 0.1, // Trigger when 10% of element is visible
  rootMargin = '50px',
  delay = 0,
  minHeight = '200px',
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!mountedRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && mountedRef.current) {
            if (delay > 0) {
              timeoutRef.current = setTimeout(() => {
                if (mountedRef.current) {
                  setIsVisible(true)
                }
              }, delay)
            } else {
              setIsVisible(true)
            }
          }
        })
      },
      {
        rootMargin,
        threshold,
        root: null, // Use viewport as root
      }
    )

    const element = elementRef.current

    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [threshold, rootMargin, delay])

  if (!isVisible && fallback) {
    return <div className={className} style={{ minHeight }}>{fallback}</div>
  }

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ minHeight, opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease-in' }}
    >
      {children}
    </div>
  )
})
