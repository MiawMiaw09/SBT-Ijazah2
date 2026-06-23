'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  walletAddress: string | null
  token: string | null
  login: (address: string, token?: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check auth status saat component mount
  useEffect(() => {
    const checkAuth = () => {
      const savedWallet = localStorage.getItem('adminWallet')
      const savedToken = localStorage.getItem('adminToken')
      if (savedWallet && savedToken) {
        setWalletAddress(savedWallet)
        setToken(savedToken)
        setIsAuthenticated(true)
        // Pastikan cookie juga di-set
        document.cookie = `adminWallet=${savedWallet}; path=/; max-age=${7 * 24 * 60 * 60}`
        document.cookie = `adminToken=${savedToken}; path=/; max-age=${7 * 24 * 60 * 60}`
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = (address: string, jwtToken?: string) => {
    localStorage.setItem('adminWallet', address)
    if (jwtToken) {
      localStorage.setItem('adminToken', jwtToken)
      setToken(jwtToken)
      document.cookie = `adminToken=${jwtToken}; path=/; max-age=${7 * 24 * 60 * 60}`
    }
    // Set cookie untuk middleware
    document.cookie = `adminWallet=${address}; path=/; max-age=${7 * 24 * 60 * 60}`
    setWalletAddress(address)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('adminWallet')
    localStorage.removeItem('adminToken')
    // Clear cookies
    document.cookie = 'adminWallet=; path=/; max-age=0'
    document.cookie = 'adminToken=; path=/; max-age=0'
    setWalletAddress(null)
    setToken(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        walletAddress,
        token,
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
