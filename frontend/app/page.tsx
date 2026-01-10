"use client";

import Link from 'next/link';
import { useRef } from 'react';
import Image from 'next/image';

export default function HomePage() {
  const tentangRef = useRef<HTMLDivElement>(null);

  const scrollToTentang = () => {
    tentangRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header - sticky */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="w-16 h-16 relative">
                <Image
                  src="/gambar/UWD.png"
                  alt="Logo Universitas Widya Dharma Pontianak"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              
              {/* Text Logo */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  Universitas Widya
                </h1>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  dharma Pontianak
                </h2>
              </div>
            </div>

            {/* Navigation - Updated */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
              <Link 
                href="/#tentang-sistem"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                About
              </Link>
              <Link 
                href="/contract"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Contract
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Sistem Verifikasi Ijazah<br />
            <span className="text-blue-600">Berbasis Blockchain</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Simpan dan verifikasi ijazah dengan aman menggunakan<br />
            SBT dan Blockchain Polygon
          </p>
        </div>
      </section>

      {/* Features Section - HANYA 2 KOLOM: Mahasiswa & Perusahaan */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mahasiswa Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Mahasiswa & Alumni</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Terima diploma SBT di dompet Anda dan akses detail ijazah digital dengan verifikasi blockchain
            </p>
            <Link 
              href="/login-mahasiswa"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition duration-200 text-base shadow-md hover:shadow-lg"
            >
              Cek Ijazah Saya
            </Link>
          </div>

          {/* Perusahaan Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Perusahaan & Institusi</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Verifikasi keaslian ijazah calon karyawan dengan memeriksa metadata SBT dan file IPFS
            </p>
            <Link 
              href="/verify-perusahaan"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition duration-200 text-base shadow-md hover:shadow-lg"
            >
              Verifikasi Ijazah
            </Link>
          </div>
        </div>
      </section>

      {/* Bagian Tentang Sistem - UPDATED dengan ID */}
      <section 
        id="tentang-sistem"
        ref={tentangRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Tentang Sistem Kami</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Sistem verifikasi ijazah berbasis blockchain ini menggunakan teknologi terkini untuk memastikan keaslian dan keamanan dokumen akademik.
            </p>
            <p>
              Dengan memanfaatkan Polygon blockchain dan Soulbound Tokens (SBT), setiap ijazah yang diterbitkan memiliki sertifikat digital yang tidak dapat dipalsukan.
            </p>
            <p>
              Sistem ini terdiri dari tiga modul utama: Admin untuk penerbitan, Mahasiswa untuk penerimaan, dan Perusahaan untuk verifikasi.
            </p>
            <p>
              Keunggulan sistem kami termasuk transparansi, keamanan tinggi, dan kemudahan verifikasi oleh pihak ketiga tanpa perlu akses ke database pusat.
            </p>
            <p>
              Setiap transaksi dan perubahan status ijazah tercatat secara permanen di blockchain, memberikan jejak audit yang lengkap dan terpercaya.
            </p>
          </div>
        </div>
      </section>

      {/* Section Teknologi */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Teknologi yang Digunakan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-600">
            <div>
              <h3 className="font-semibold text-lg mb-2">Blockchain Polygon</h3>
              <p>Menyediakan infrastruktur blockchain yang cepat, aman, dan hemat biaya untuk transaksi SBT.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Soulbound Tokens (SBT)</h3>
              <p>Token digital yang melekat pada identitas pemilik dan tidak dapat dialihkan.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">IPFS Storage</h3>
              <p>Penyimpanan terdesentralisasi untuk dokumen ijazah asli dengan akses yang aman.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Smart Contracts</h3>
              <p>Kontrak pintar yang mengotomatiskan proses penerbitan dan verifikasi ijazah.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <div className="w-12 h-12 relative mr-4">
                <Image
                  src="/gambar/UWD.png"
                  alt="Logo Universitas Widya Dharma Pontianak"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Universitas Widya Dharma</h3>
                <p className="text-gray-600">Pontianak</p>
              </div>
            </div>
            <p className="text-gray-500">
              &copy; 2025 Universitas Widya Dharma Pontianak.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}