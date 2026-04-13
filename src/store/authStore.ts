import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Member } from '@/types'

interface AuthState {
  user: User | null
  member: Member | null
  isAuthenticated: boolean
  isAdmin: boolean
  isMember: boolean
  loading: boolean

  // Actions
  setUser: (user: User | null) => void
  setMember: (member: Member | null) => void
  setLoading: (loading: boolean) => void
  login: (user: User, member?: Member) => void
  logout: () => void
  refresh: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      member: null,
      isAuthenticated: false,
      isAdmin: false,
      isMember: false,
      loading: true,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isAdmin: user?.role === 'admin',
          isMember: user?.role === 'member',
        }),

      setMember: (member) => set({ member }),

      setLoading: (loading) => set({ loading }),

      login: (user, member) =>
        set({
          user,
          member: member || null,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isMember: user.role === 'member',
          loading: false,
        }),

      logout: () =>
        set({
          user: null,
          member: null,
          isAuthenticated: false,
          isAdmin: false,
          isMember: false,
          loading: false,
        }),

      refresh: async () => {
        try {
          set({ loading: true })
          const res = await fetch('/api/members/me')
          const data = await res.json()

          if (data.success) {
            set({
              user: data.user || null,
              member: data.member || null,
              isAuthenticated: !!data.user,
              isAdmin: data.user?.role === 'admin',
              isMember: data.user?.role === 'member',
              loading: false,
            })
          } else {
            get().logout()
          }
        } catch (error) {
          console.error('Error refreshing auth:', error)
          get().logout()
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isMember: state.isMember,
      }),
    }
  )
)
