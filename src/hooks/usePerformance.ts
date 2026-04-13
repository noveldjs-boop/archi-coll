'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { throttle, debounce } from '@/lib/performance'

interface PerformanceConfig {
  debounceMs?: number
  throttleMs?: number
  enablePrefetch?: boolean
}

interface UsePerformanceResult {
  fps: number
  isLowFPS: boolean
  isJank: boolean
}

export function usePerformance(config: PerformanceConfig = {}) {
  const { debounceMs = 100, throttleMs = 16, enablePrefetch = true } = config

  const fpsRef = useRef<number>(60)
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const requestRef = useRef<number>()

  const [fps, setFps] = useState<number>(60)
  const [isLowFPS, setIsLowFPS] = useState(false)
  const [isJank, setIsJank] = useState(false)

  // Measure FPS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const measureFPS = () => {
        const now = performance.now()
        const delta = now - lastTimeRef.current
        frameRef.current++

        // Update FPS every 1 second
        if (frameRef.current >= 60) {
          const currentFps = Math.round((frameRef.current * 1000) / delta)
          setFps(currentFps)
          setIsLowFPS(currentFps < 50)
          setIsJank(currentFps < 20)
          
          frameRef.current = 0
          lastTimeRef.current = now
        }
      }

      const measureFPSThrottled = throttle(measureFPS, throttleMs)
      const rafId = requestAnimationFrame(measureFPSThrottled)

      const rafLoop = () => {
        rafId = requestAnimationFrame(rafLoop)
      }

      rafLoop()

      return () => {
        cancelAnimationFrame(rafId)
      }
    }
  }, [throttleMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup will happen in rafLoop cleanup
    }
  }, [throttleMs])

  return { fps, isLowFPS, isJank }
}

/**
 * Hook for measuring render performance
 */
export function useRenderPerformance() {
  const [renderCount, setRenderCount] = useState(0)
  const lastRenderTime = useRef<number>(Date.now())

  useEffect(() => {
    return () => {
      const now = Date.now()
      const timeSinceLastRender = now - lastRenderTime.current
      lastRenderTime.current = now

      // Increment render count (throttled to avoid excessive updates)
      if (timeSinceLastRender >= 1000) {
        setRenderCount(prev => prev + 1)
      }
    }
  }, [])

  return renderCount
}
