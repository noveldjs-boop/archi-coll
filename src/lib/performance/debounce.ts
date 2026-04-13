/**
 * Debounce function - delay function execution until after wait milliseconds have elapsed
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeoutId = null
      func(...args)
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(later, wait)
  }
}

/**
 * Debounce with immediate execution on first call
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function with immediate execution
 */
export function debounceImmediate<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  let firstCall = true

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeoutId = null
      if (!firstCall) {
        func(...args)
      }
      firstCall = false
    }

    if (firstCall) {
      func(...args)
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(later, wait)
  }
}

/**
 * Debounce async function
 * @param func - Async function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced async function
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T> | null = null

  return function executedFunction(...args: Parameters<T>) {
    lastArgs = args

    const later = async () => {
      timeoutId = null
      if (lastArgs) {
        await func(...lastArgs)
        lastArgs = null
      }
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(later, wait)
  }
}
