'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  walletAddress: string | null
  login: (address: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check auth status saat component mount
  useEffect(() => {
    const checkAuth = () => {
      const savedWallet = localStorage.getItem('adminWallet')
      if (savedWallet) {
        setWalletAddress(savedWallet)
        setIsAuthenticated(true)
        // Pastikan cookie juga di-set
        document.cookie = `adminWallet=${savedWallet}; path=/; max-age=${7 * 24 * 60 * 60}`
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = (address: string) => {
    localStorage.setItem('adminWallet', address)
    // Set cookie untuk middleware
    document.cookie = `adminWallet=${address}; path=/; max-age=${7 * 24 * 60 * 60}`
    setWalletAddress(address)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('adminWallet')
    // Clear cookie
    document.cookie = 'adminWallet=; path=/; max-age=0'
    setWalletAddress(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        walletAddress,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
