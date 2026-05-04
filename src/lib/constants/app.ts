// App-wide Constants

export const APP_NAME = 'ARCHI-COLL'
export const APP_DESCRIPTION = 'Architecture Collaboration Studio'

export const LANGUAGES = {
  INDONESIAN: 'id',
  ENGLISH: 'en',
} as const

export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES]

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const

// Date Formats
export const DATE_FORMATS = {
  DATE_ONLY: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY: 'DD MMMM YYYY',
  DISPLAY_SHORT: 'DD/MM/YYYY',
  TIME: 'HH:mm',
} as const

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MEMBER: 'member',
} as const

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

// Member Professions
export const MEMBER_PROFESSIONS = {
  ARCHITECT: 'architect',
  STRUCTURE: 'structure',
  MEP: 'mep',
  DRAFTER: 'drafter',
  QS: 'qs',
  LICENSED_ARCHITECT: 'licensed_architect',
} as const

export type MemberProfession = (typeof MEMBER_PROFESSIONS)[keyof typeof MEMBER_PROFESSIONS]

// Member Status
export const MEMBER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
} as const

export type MemberStatus = (typeof MEMBER_STATUS)[keyof typeof MEMBER_STATUS]

// Project Status
export const PROJECT_STATUS = {
  OPEN: 'open',
  LEADER_ASSIGNED: 'leader_assigned',
  TEAM_ASSIGNED: 'team_assigned',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS]

// Building Types
export const BUILDING_TYPES = {
  LOW_RISE: 'low-rise',
  MID_RISE: 'mid-rise',
  HIGH_RISE: 'high-rise',
} as const

export type BuildingType = (typeof BUILDING_TYPES)[keyof typeof BUILDING_TYPES]

// Quality Levels
export const QUALITY_LEVELS = {
  SEDERHANA: 'sederhana',
  MENENGAH: 'menengah',
  MEWAH: 'mewah',
} as const

export type QualityLevel = (typeof QUALITY_LEVELS)[keyof typeof QUALITY_LEVELS]

// Payment Stages
export const PAYMENT_STAGES = {
  PENDING: 'pending',
  DP_PAID: 'dp_paid',
  DESIGN_AGREED: 'design_agreed',
  PAYMENT_80_PERCENT: 'payment_80_percent',
  PAYMENT_20_PERCENT: 'payment_20_percent',
  COMPLETED: 'completed',
} as const

export type PaymentStage = (typeof PAYMENT_STAGES)[keyof typeof PAYMENT_STAGES]

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PRE_DESIGN: 'in_pre_design',
  IN_SCHEMATIC: 'in_schematic',
  IN_DED: 'in_ded',
  IN_REVIEW: 'in_review',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

// API Timeouts
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 120000, // 2 minutes
} as const

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const
