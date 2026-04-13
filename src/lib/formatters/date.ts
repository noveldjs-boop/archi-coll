// Date Formatting Utilities

/**
 * Format date to Indonesian locale
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateID(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj)
}

/**
 * Format date to English locale
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDateEN(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj)
}

/**
 * Format date to short format (DD/MM/YYYY)
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dateObj)
}

/**
 * Format date to time only
 * @param date - Date string or Date object
 * @returns Formatted time string
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return 'baru saja'
  } else if (diffMins < 60) {
    return `${diffMins} menit yang lalu`
  } else if (diffHours < 24) {
    return `${diffHours} jam yang lalu`
  } else if (diffDays < 7) {
    return `${diffDays} hari yang lalu`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} minggu yang lalu`
  } else if (diffDays < 365) {
    return `${Math.floor(diffDays / 30)} bulan yang lalu`
  } else {
    return `${Math.floor(diffDays / 365)} tahun yang lalu`
  }
}

/**
 * Check if date is today
 * @param date - Date string or Date object
 * @returns Boolean indicating if date is today
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

/**
 * Get date range in human readable format
 * @param startDate - Start date string or Date object
 * @param endDate - End date string or Date object
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date
): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }

  const startFormatted = new Intl.DateTimeFormat('id-ID', options).format(start)
  const endFormatted = new Intl.DateTimeFormat('id-ID', options).format(end)

  return `${startFormatted} - ${endFormatted}`
}
