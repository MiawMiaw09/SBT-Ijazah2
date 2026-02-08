"use client";

import Link from 'next/link';
import { useRef } from 'react';
import Image from 'next/image';

export default function HomePage() {
  const tentangRef = useRef<HTMLDivElement>(null);
  const tutorialRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ 
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
              <button 
                onClick={() => scrollToSection(tentangRef)}
                className="text-gray-700 hover:text-blue-600 font-medium cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection(tutorialRef)}
                className="text-gray-700 hover:text-blue-600 font-medium cursor-pointer"
              >
                Tutorial Verifikasi
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Updated */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Sistem Verifikasi Ijazah<br />
            <span className="text-blue-600">Berbasis Blockchain</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Verifikasi keaslian ijazah dengan teknologi blockchain Polygon<br />
            Transparan, aman, dan terpercaya
          </p>
        </div>
      </section>

      {/* Features Section - HANYA 1 KOLOM: Perusahaan saja */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Verifikasi Ijazah Digital</h3>
          <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
            Perusahaan & Institusi dapat memverifikasi keaslian ijazah calon karyawan 
            dengan teknologi blockchain Polygon dan Soulbound Tokens (SBT)
          </p>
          <Link 
            href="/verify-perusahaan"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition duration-200 text-base shadow-md hover:shadow-lg"
          >
            Mulai Verifikasi
          </Link>
        </div>
      </section>

      {/* Section Tutorial Verifikasi - DIPERBAIKI: tambah id */}
      <section 
        id="tutorial-verifikasi"  // <-- INI YANG DITAMBAHKAN
        ref={tutorialRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-20"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Cara Verifikasi Ijazah</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Metode 1: Website */}
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Verifikasi via Website</h3>
              <ol className="text-gray-600 space-y-3 pl-4 list-decimal">
                <li>Kunjungi halaman <Link href="/verify-perusahaan" className="text-blue-600 hover:underline font-medium">Verifikasi Ijazah</Link></li>
                <li>Masukkan Token ID / NIM / Nama Mahasiswa</li>
                <li>Upload file ijazah yang ingin diverifikasi</li>
                <li>Sistem akan menampilkan status keaslian ijazah</li>
                <li>Download sertifikat verifikasi jika diperlukan</li>
              </ol>
              <div className="mt-6 text-center">
                <Link 
                  href="/verify-perusahaan"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200 text-sm"
                >
                  Verifikasi Sekarang
                </Link>
              </div>
            </div>

            {/* Metode 2: PolygonScan */}
            <div className="bg-green-50 rounded-xl p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Verifikasi via PolygonScan</h3>
              <ol className="text-gray-600 space-y-3 pl-4 list-decimal">
                <li>Dapatkan informasi dari mahasiswa:
                  <ul className="list-disc ml-4 mt-1 space-y-1">
                    <li>Alamat wallet mahasiswa</li>
                    <li>Token ID SBT</li>
                    <li>Hash file ijazah</li>
                  </ul>
                </li>
                <li>Buka <a href="https://amoy.polygonscan.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">PolygonScan</a></li>
                <li>Cari contract address: <code className="bg-gray-100 px-2 py-1 rounded text-sm">0xUNIVERSITY_SBT</code></li>
                <li>Masukkan Token ID untuk melihat metadata</li>
                <li>Bandingkan hash di blockchain dengan hash file</li>
              </ol>
              <div className="mt-6 text-center">
                <a 
                  href="https://amoy.polygonscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200 text-sm"
                >
                  Buka PolygonScan
                </a>
              </div>
            </div>

            {/* Metode 3: OpenSea */}
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Verifikasi via OpenSea</h3>
              <ol className="text-gray-600 space-y-3 pl-4 list-decimal">
                <li>Dapatkan link OpenSea dari mahasiswa</li>
                <li>Atau buka langsung:
                  <code className="block bg-gray-100 px-2 py-1 rounded text-sm mt-1 overflow-x-auto">
                    https://opensea.io/assets/matic/0xCONTRACT/TOKEN_ID
                  </code>
                </li>
                <li>Lihat detail SBT (Soulbound Token)</li>
                <li>Periksa metadata dan atribut ijazah</li>
                <li>Verifikasi informasi mahasiswa dan institusi</li>
              </ol>
              <div className="mt-6 text-center">
                <a 
                  href="https://opensea.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition duration-200 text-sm"
                >
                  Buka OpenSea
                </a>
              </div>
            </div>
          </div>

          {/* Catatan Penting */}
          <div className="mt-10 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">📝 Catatan Penting:</h4>
            <ul className="text-gray-600 space-y-2">
              <li>✅ <span className="font-medium">Verifikasi via Website</span> - Cepat & mudah untuk semua kalangan</li>
              <li>🔗 <span className="font-medium">Verifikasi via PolygonScan</span> - Transparan & independen, tanpa perantara</li>
              <li>💎 <span className="font-medium">Verifikasi via OpenSea</span> - Visualisasi SBT & metadata lengkap</li>
              <li>🎓 Mahasiswa/alumni dapat mengakses SBT mereka langsung melalui wallet (Metamask)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bagian Tentang Sistem - UPDATED */}
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
              Dengan memanfaatkan Polygon blockchain dan Soulbound Tokens (SBT), setiap ijazah yang diterbitkan memiliki sertifikat digital yang tidak dapat dipalsukan dan melekat pada pemiliknya.
            </p>
            <p>
              Sistem ini dirancang khusus untuk memudahkan perusahaan dan institusi dalam melakukan verifikasi keaslian ijazah calon karyawan secara instan dan terpercaya.
            </p>
            <p>
              Keunggulan sistem kami termasuk transparansi penuh, keamanan kriptografi, dan kemudahan verifikasi oleh pihak ketiga tanpa perlu akses ke database pusat kampus.
            </p>
            <p>
              Setiap ijazah yang diverifikasi melalui sistem ini memiliki bukti keaslian yang tercatat secara permanen di blockchain Polygon, memberikan jejak audit yang lengkap dan dapat dipercaya.
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
              <p>Menyediakan infrastruktur blockchain yang cepat, aman, dan hemat biaya untuk pencatatan ijazah digital.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Soulbound Tokens (SBT)</h3>
              <p>Token digital yang melekat pada identitas pemilik (mahasiswa) dan tidak dapat dialihkan atau diperjualbelikan.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">IPFS Storage</h3>
              <p>Penyimpanan terdesentralisasi untuk dokumen ijazah asli dengan hash yang unik dan tidak dapat diubah.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Smart Contracts</h3>
              <p>Kontrak pintar yang mengotomatiskan proses penerbitan dan validasi keaslian ijazah secara terdesentralisasi.</p>
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
            <p className="text-gray-500 text-sm mb-4">
              Sistem Verifikasi Ijazah Berbasis Blockchain | Polygon Network
            </p>
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} Universitas Widya Dharma Pontianak. 
              <span className="block text-xs mt-1">Smart Contract Address: 0xUNIVERSITY_SBT</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}