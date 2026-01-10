'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyMahasiswaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showVerificationConfirm, setShowVerificationConfirm] = useState(false)

  const menuItems = [
    { href: '/verify-mahasiswa', label: 'Ijazah Saya', icon: '📜' },
    { 
      href: '#', 
      label: 'Verifikasi Ijazah', 
      icon: '📁',
      onClick: () => setShowVerificationConfirm(true)
    },
  ]

  const handleLogout = () => {
    console.log('User logged out')
    setShowLogoutConfirm(false)
    router.push('/')
  }

  const handleVerificationRedirect = () => {
    setShowVerificationConfirm(false)
    // Langsung redirect ke verify-perusahaan
    router.push('/verify-perusahaan')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white min-h-screen">
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Image 
                src="/gambar/UWD.png" 
                alt="UWD Logo" 
                width={32} 
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold">Universitas Widya Dharma</h1>
              <p className="text-blue-200 text-xs">Pontianak</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => (
              <li key={item.href}>
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className={`flex items-center px-4 py-3 rounded-lg transition w-full text-left ${
                      pathname === item.href
                        ? 'bg-blue-800 text-white shadow-lg'
                        : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition ${
                      pathname === item.href
                        ? 'bg-blue-800 text-white shadow-lg'
                        : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </li>
            ))}
            <li className="border-t border-blue-800 pt-4 mt-4">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center px-4 py-3 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition w-full text-left"
              >
                <span className="mr-3 text-lg">🚪</span>
                <span className="font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Ijazah Saya</h2>
              <p className="text-gray-600 text-sm">Verifikasi Ijazah Digital Mahasiswa</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium text-gray-800">Mahasiswa</p>
                <p className="text-sm text-gray-600">Status: Terverifikasi</p>
              </div>
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                M
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-all duration-300"
            onClick={() => setShowLogoutConfirm(false)}
          ></div>
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 z-50 animate-in fade-in-90 zoom-in-90 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Logout</h3>
                  <p className="text-sm text-gray-500">Sistem Ijazah Digital</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-2">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Anda yakin ingin logout?</h4>
                <p className="text-gray-600 mb-1">
                  Anda akan keluar dari sistem ijazah digital
                </p>
                <p className="text-sm text-gray-500">
                  Semua perubahan yang belum disimpan akan hilang
                </p>
              </div>
            </div>

            <div className="flex space-x-3 justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-200 font-medium text-sm"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Batal</span>
                </div>
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 font-medium text-sm"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Ya, Logout</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Verification Confirmation Modal */}
      {showVerificationConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-all duration-300"
            onClick={() => setShowVerificationConfirm(false)}
          ></div>
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 z-50 animate-in fade-in-90 zoom-in-90 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Verifikasi Ijazah</h3>
                  <p className="text-sm text-gray-500">Sistem Ijazah Digital</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="text-center mb-2">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Beralih ke Mode Verifikasi</h4>
                <p className="text-gray-600 mb-3">
                  Anda akan dialihkan ke halaman verifikasi ijazah untuk perusahaan/verifikator.
                </p>
                <p className="text-sm text-gray-500">
                  Fitur ini memungkinkan Anda memverifikasi keaslian ijazah digital.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowVerificationConfirm(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-200 font-medium text-sm"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Batal</span>
                </div>
              </button>
              <button
                onClick={handleVerificationRedirect}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium text-sm"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Logout&Verifikasi</span>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}