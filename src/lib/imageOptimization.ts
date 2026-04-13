/**
 * Image Optimization Utilities
 */
import { useEffect } from 'react'

/**
 * Check if image format is supported by browser
 */
export const supportsWebP = () => typeof document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp')

/**
 * Check if AVIF format is supported
 */
export const supportsAVIF = () => {
  try {
    const canvas = document.createElement('canvas')
    return canvas.toDataURL('image/avif', 0.1).startsWith('data:image/avif')
  } catch {
    return false
  }
}

/**
 * Get best supported image format
 */
export const getSupportedImageFormat = (): 'image/webp' | 'image/jpeg' => {
  if (supportsWebP()) return 'image/webp'
  return 'image/jpeg'
}

/**
 * Generate blur placeholder for Next.js Image
 */
export const generateBlurPlaceholder = (width: number, height: number): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
  }

  canvas.width = width
  canvas.height = height

  // Fill with base64 transparent PNG with blur effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
  ctx.fillRect(0, 0, width, height)

  // Add subtle noise texture
  const imageData = ctx.getImageData(0, 0, width, height)
  const pixels = new Uint8ClampedArray(imageData.data.buffer)
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = pixels[i] = Math.min(255, pixels[i] + 10)
  }
  ctx.putImageData(imageData, 0, 0)

  return `data:image/png;base64,${canvas.toDataURL('image/png')}`
}

/**
 * Generate loading placeholder SVG
 */
export const generateLoadingSVG = (size = 32): string => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#2a2a2a" opacity="0.1">
      <animate attributeName="opacity" values="0.1;0.2;0.1;0.2;0.1;0.2;0.1" dur="1.5s" repeatCount="indefinite" />
      <rect width="${size}" height="${size}" fill="#3741515C" opacity="0.1">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="none" stroke="#3741515C" stroke-width="2" stroke-dasharray="4 2">
          <animate attributeName="stroke-dashoffset" values="0 8 12 4 8 12 4" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </rect>
    </svg>`

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

/**
 * Preload critical images in background
 */
export function prefetchCriticalImages(imageUrls: string[]): void {
  if (typeof window !== 'undefined') {
    imageUrls.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = src
      link.as = 'image'
      link.crossOrigin = 'anonymous'
      link.onload = () => {
        // Remove preload link after loading
        setTimeout(() => {
          link.remove()
        }, 5000)
      }
      link.onerror = () => {
        // Remove failed preload link
        setTimeout(() => {
          link.remove()
        }, 5000)
      }
      document.head.appendChild(link)
    })
  }
}

/**
 * Lazy load images when they enter viewport
 */
export function useLazyLoadImages() {
  useEffect(() => {
    const imageElements = document.querySelectorAll('img[data-src]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const img = entry.target as HTMLImageElement
          if (!img.src || img.complete || img.src.startsWith('data:')) return

          img.src = img.src
        })
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
        root: null,
      }
    )

    imageElements.forEach(img => observer.observe(img))

    return () => observer.disconnect()
  }, [])
}

/**
 * Create image source with lazy loading attributes
 */
export function createLazyImageSource(
  src: string,
  alt: string,
  className?: string,
  loading?: 'lazy'
): { src: string; className?: string; loading?: 'lazy' } {
  return {
    src: loading === 'lazy' ? `${src}?w=10&q=10` : src,
    className,
    loading,
  }
}

/**
 * Get image dimensions (width, height)
 */
export async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

/**
 * Generate aspect ratio classes
 */
export function getAspectRatioClass(width: number, height: number): string {
  const aspectRatio = width / height

  if (aspectRatio >= 16/9) {
    return 'aspect-video'
  } else if (aspectRatio >= 3 / 2) {
    return 'aspect-video'
  } else if (aspectRatio >= 1.33) {
    return 'aspect-square'
  } else if (aspectRatio >= 16/10) {
    return 'aspect-video'
  } else if (aspectRatio >= 1.7777777) {
    return 'aspect-video'
  } else {
    return 'aspect-square'
  }
}

/**
 * Generate responsive image srcset
 */
export function generateImageSrcset(
  src: string,
  sizes: Array<{ width: number; height: number; format: string }>
): string {
  return sizes
    .map((size, index) => {
      const format = size.format || 'webp'
      return `${src} ${size.width}w ${size.height} ${format} ${index + 1}x`
    })
    .join(', ')
}
