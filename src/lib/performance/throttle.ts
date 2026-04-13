/**
 * Throttle function - limit function execution to once every wait milliseconds
 * @param func - Function to throttle
 * @param wait - Wait time in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  let lastResult: ReturnType<T>
  let timeoutId: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true
      lastResult = func(...args)

      setTimeout(() => {
        inThrottle = false
      }, wait)

      return lastResult
    } else {
      return lastResult
    }
  }
}

/**
 * Throttle with trailing execution (execute on the trailing edge)
 * @param func - Function to throttle
 * @param wait - Wait time in milliseconds
 * @returns Throttled function
 */
export function throttleTrailing<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  let lastArgs: Parameters<T> | null = null
  let timeoutId: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
    } else {
      lastArgs = args
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      inThrottle = false
      if (lastArgs) {
        func(...lastArgs)
        lastArgs = null
      }
    }, wait)
  }
}
