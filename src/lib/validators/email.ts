// Email Validation Utilities

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate email domain
 * @param email - Email string to validate
 * @param allowedDomains - Array of allowed domains
 * @returns Boolean indicating if domain is allowed
 */
export function isValidEmailDomain(email: string, allowedDomains: string[]): boolean {
  const domain = email.split('@')[1]?.toLowerCase()
  return domain ? allowedDomains.includes(domain) : false
}

/**
 * Extract domain from email
 * @param email - Email string
 * @returns Domain string or null
 */
export function extractEmailDomain(email: string): string | null {
  const parts = email.split('@')
  return parts.length === 2 ? parts[1].toLowerCase() : null
}

/**
 * Normalize email (lowercase and trim)
 * @param email - Email string
 * @returns Normalized email string
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
