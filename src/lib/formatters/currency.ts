// Currency Formatting Utilities

/**
 * Format number to Indonesian Rupiah
 * @param amount - Amount in number
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted currency string
 */
export function formatRupiah(
  amount: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  }).format(amount)
}

/**
 * Format number to USD
 * @param amount - Amount in number
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted currency string
 */
export function formatUSD(
  amount: number,
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount)
}

/**
 * Format number with compact notation (e.g., 1K, 1M, 1B)
 * @param amount - Amount in number
 * @returns Formatted compact number string
 */
export function formatCompactNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

/**
 * Parse currency string back to number
 * @param value - Currency string
 * @returns Parsed number
 */
export function parseCurrency(value: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d.-]/g, '')
  return parseFloat(cleaned) || 0
}
