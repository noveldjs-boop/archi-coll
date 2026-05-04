'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Member } from '@/types'

interface AuthState {
  user: User | null
  member: Member | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isMember: boolean
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    member: null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false,
    isMember: false,
  })

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/members/me')
        const data = await res.json()

        if (isMounted) {
          if (data.success) {
            setState({
              user: data.user || null,
              member: data.member || null,
              loading: false,
              isAuthenticated: !!data.user,
              isAdmin: data.user?.role === 'admin',
              isMember: data.user?.role === 'member',
            })
          } else {
            setState({
              user: null,
              member: null,
              loading: false,
              isAuthenticated: false,
              isAdmin: false,
              isMember: false,
            })
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        if (isMounted) {
          setState({
            user: null,
            member: null,
            loading: false,
            isAuthenticated: false,
            isAdmin: false,
            isMember: false,
          })
        }
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (email: string, password: string, isAdmin = false) => {
    const endpoint = isAdmin ? '/api/auth-admin/signin' : '/api/auth/signin'

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (data.success) {
        // Re-fetch auth state after successful login
        const authRes = await fetch('/api/members/me')
        const authData = await authRes.json()

        if (authData.success) {
          setState({
            user: authData.user || null,
            member: authData.member || null,
            loading: false,
            isAuthenticated: !!authData.user,
            isAdmin: authData.user?.role === 'admin',
            isMember: authData.user?.role === 'member',
          })
        }
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setState({
        user: null,
        member: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
        isMember: false,
      })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refresh = async () => {
    setState(prev => ({ ...prev, loading: true }))

    try {
      const res = await fetch('/api/members/me')
      const data = await res.json()

      if (data.success) {
        setState({
          user: data.user || null,
          member: data.member || null,
          loading: false,
          isAuthenticated: !!data.user,
          isAdmin: data.user?.role === 'admin',
          isMember: data.user?.role === 'member',
        })
      } else {
        setState({
          user: null,
          member: null,
          loading: false,
          isAuthenticated: false,
          isAdmin: false,
          isMember: false,
        })
      }
    } catch (error) {
      console.error('Error refreshing auth:', error)
      setState({
        user: null,
        member: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false,
        isMember: false,
      })
    }
  }

  return {
    ...state,
    login,
    logout,
    refresh,
  }
}
