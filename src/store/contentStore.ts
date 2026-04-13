import { create } from 'zustand'
import type { Service, PortfolioProject, TeamMember, AboutContent, ContactInfo, OperatingHours, HomeStats } from '@/types'

interface ContentState {
  // Services
  services: Service[]
  setServices: (services: Service[]) => void
  fetchServices: () => Promise<void>

  // Portfolio
  portfolio: PortfolioProject[]
  setPortfolio: (portfolio: PortfolioProject[]) => void
  fetchPortfolio: () => Promise<void>

  // Team Members
  teamMembers: TeamMember[]
  setTeamMembers: (teamMembers: TeamMember[]) => void
  fetchTeamMembers: () => Promise<void>

  // About Content
  aboutContent: AboutContent[]
  setAboutContent: (content: AboutContent[]) => void
  fetchAboutContent: () => Promise<void>

  // Contact Info
  contactInfo: ContactInfo[]
  setContactInfo: (info: ContactInfo[]) => void
  fetchContactInfo: () => Promise<void>

  // Operating Hours
  operatingHours: OperatingHours[]
  setOperatingHours: (hours: OperatingHours[]) => void
  fetchOperatingHours: () => Promise<void>

  // Home Stats
  homeStats: HomeStats[]
  setHomeStats: (stats: HomeStats[]) => void
  fetchHomeStats: () => Promise<void>

  // Loading states
  loading: {
    services: boolean
    portfolio: boolean
    teamMembers: boolean
    aboutContent: boolean
    contactInfo: boolean
    operatingHours: boolean
    homeStats: boolean
  }
  setLoading: (key: keyof ContentState['loading'], value: boolean) => void

  // Error states
  errors: {
    services: string | null
    portfolio: string | null
    teamMembers: string | null
    aboutContent: string | null
    contactInfo: string | null
    operatingHours: string | null
    homeStats: string | null
  }
  setError: (key: keyof ContentState['errors'], value: string | null) => void
}

export const useContentStore = create<ContentState>((set, get) => ({
  // Initial state
  services: [],
  portfolio: [],
  teamMembers: [],
  aboutContent: [],
  contactInfo: [],
  operatingHours: [],
  homeStats: [],

  loading: {
    services: false,
    portfolio: false,
    teamMembers: false,
    aboutContent: false,
    contactInfo: false,
    operatingHours: false,
    homeStats: false,
  },

  errors: {
    services: null,
    portfolio: null,
    teamMembers: null,
    aboutContent: null,
    contactInfo: null,
    operatingHours: null,
    homeStats: null,
  },

  // Setters
  setServices: (services) => set({ services }),
  setPortfolio: (portfolio) => set({ portfolio }),
  setTeamMembers: (teamMembers) => set({ teamMembers }),
  setAboutContent: (aboutContent) => set({ aboutContent }),
  setContactInfo: (contactInfo) => set({ contactInfo }),
  setOperatingHours: (operatingHours) => set({ operatingHours }),
  setHomeStats: (homeStats) => set({ homeStats }),

  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),

  setError: (key, value) =>
    set((state) => ({
      errors: { ...state.errors, [key]: value },
    })),

  // Fetch functions
  fetchServices: async () => {
    try {
      set((state) => ({ loading: { ...state.loading, services: true }, errors: { ...state.errors, services: null } }))
      const res = await fetch('/api/services')
      const data = await res.json()
      if (data.success) {
        set({ services: data.data || [] })
      } else {
        set((state) => ({ errors: { ...state.errors, services: data.error || 'Failed to fetch services' } }))
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      set((state) => ({ errors: { ...state.errors, services: 'An error occurred' } }))
    } finally {
      set((state) => ({ loading: { ...state.loading, services: false } }))
    }
  },

  fetchPortfolio: async () => {
    try {
      set((state) => ({ loading: { ...state.loading, portfolio: true }, errors: { ...state.errors, portfolio: null } }))
      const res = await fetch('/api/portfolio')
      const data = await res.json()
      if (data.success) {
        set({ portfolio: data.data || [] })
      } else {
        set((state) => ({ errors: { ...state.errors, portfolio: data.error || 'Failed to fetch portfolio' } }))
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      set((state) => ({ errors: { ...state.errors, portfolio: 'An error occurred' } }))
    } finally {
      set((state) => ({ loading: { ...state.loading, portfolio: false } }))
    }
  },

  fetchTeamMembers: async () => {
    try {
      set((state) => ({ loading: { ...state.loading, teamMembers: true }, errors: { ...state.errors, teamMembers: null } }))
      const res = await fetch('/api/team-members')
      const data = await res.json()
      if (data.success) {
        set({ teamMembers: (data.data || []).filter((m: TeamMember) => m.active) })
      } else {
        set((state) => ({ errors: { ...state.errors, teamMembers: data.error || 'Failed to fetch team members' } }))
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
      set((state) => ({ errors: { ...state.errors, teamMembers: 'An error occurred' } }))
    } finally {
      set((state) => ({ loading: { ...state.loading, teamMembers: false } }))
    }
  },

  fetchAboutContent: async () => {
    try {
      set((state) => ({ loading: { ...state.loading, aboutContent: true }, errors: { ...state.errors, aboutContent: null } }))
      const res = await fetch('/api/about-content')
      const data = await res.json()
      if (data.success) {
        set({ aboutContent: data.data || [] })
      } else {
        set((state) => ({ errors: { ...state.errors, aboutContent: data.error || 'Failed to fetch about content' } }))
      }
    } catch (error) {
      console.error('Error fetching about content:', error)
      set((state) => ({ errors: { ...state.errors, aboutContent: 'An error occurred' } }))
    } finally {
      set((state) => ({ loading: { ...state.loading, aboutContent: false } }))
    }
  },

  fetchContactInfo: async () => {
    try {
      set((state) => ({ loading: { ...state.loading, contactInfo: true }, errors: { ...state.errors, contactInfo: null } }))
      const res = await fetch('/api/contact-info')
      const data = await res.json()
      if (data.success) {
        set({ contactInfo: (data.data || []).filter((item: ContactInfo) => item.active) })
      } else {
        set((state) => ({ errors: { ...state.errors, contactInfo: data.error || 'Failed to fetch contact info' } }))
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
      set((state) => ({ errors: { ...state.errors, contactInfo: 'An error occurred' } }))
    } finally {
      set((state) => ({ loading: { ...state.loading, contactInfo: false } }))
    }
  },

  fetchOperatingHours: async () => {
    try {
      set((state) => ({ loading: { ...state.loading, operatingHours: true }, errors: { ...state.errors, operatingHours: null } }))
      const res = await fetch('/api/operating-hours')
      const data = await res.json()
      if (data.success) {
        set({ operatingHours: data.data || [] })
      } else {
        set((state) => ({ errors: { ...state.errors, operatingHours: data.error || 'Failed to fetch operating hours' } }))
      }
    } catch (error) {
      console.error('Error fetching operating hours:', error)
      set((state) => ({ errors: { ...state.errors, operatingHours: 'An error occurred' } }))
    } finally {
      set((state) => ({ loading: { ...state.loading, operatingHours: false } }))
    }
  },

  fetchHomeStats: async () => {
    try {
      set((state) => ({ loading: { ...state.loading, homeStats: true }, errors: { ...state.errors, homeStats: null } }))
      const res = await fetch('/api/admin/home-stats')
      const data = await res.json()
      if (data.success) {
        set({ homeStats: data.data || [] })
      } else {
        set((state) => ({ errors: { ...state.errors, homeStats: data.error || 'Failed to fetch home stats' } }))
      }
    } catch (error) {
      console.error('Error fetching home stats:', error)
      set((state) => ({ errors: { ...state.errors, homeStats: 'An error occurred' } }))
    } finally {
      set((state) => ({ loading: { ...state.loading, homeStats: false } }))
    }
  },
}))
