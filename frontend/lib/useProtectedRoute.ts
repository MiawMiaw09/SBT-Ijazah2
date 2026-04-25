import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './authContext'

export function useProtectedRoute() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Tunggu auth check selesai
    if (isLoading) return

    // Jika tidak authenticated, redirect ke login
    if (!isAuthenticated) {
      router.push('/login-admin')
    }
  }, [isAuthenticated, isLoading, router])

  return { isLoading, isAuthenticated }
}
