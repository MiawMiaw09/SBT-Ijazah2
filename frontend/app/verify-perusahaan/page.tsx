'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Interface untuk data ijazah dari database
interface DiplomaData {
  id: number;
  nama_lengkap: string;
  npm: string;
  nik: string;
  program_studi: string;
  gelar_akademik: string;
  fakultas: string;
  tanggal_lulus: string;
  tempat_tanggal_lahir: string;
  nomor_sk_rektor: string;
  tanggal_sk_rektor: string;
  wallet_address: string;
  contract_address: string;
  token_id: string;
  transaction_hash: string;
  block_number: number;
  file_hash: string;
  certificate_id: string;
  status: 'pending' | 'verified' | 'minted' | 'rejected';
  created_at: string;
  updated_at: string;
  ipk?: number;
  judul_skripsi?: string;
  tahun_akademik?: string;
  yudisium?: string;
  nama_file: string;
  path_file: string;
  ukuran_file: number;
  tipe_file: string;
  verification_notes?: string;
  minted_at?: string;
  uploaded_by: string;
  verified_by?: string;
  minted_by?: string;
}

export default function VerificationPage() {
  const [verificationData, setVerificationData] = useState<DiplomaData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [certificateId, setCertificateId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateId.trim()) {
      alert('Masukkan Certificate ID terlebih dahulu');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationData(null);
    setSearchAttempted(true);
    
    try {
      console.log(`🔍 Mencari ijazah dengan Certificate ID: ${certificateId}`);
      
      // Mencari berdasarkan certificate_id
      const response = await fetch(`${API_BASE_URL}/api/diplomas/certificate/${certificateId}`);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ijazah tidak ditemukan');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 Data diterima:', result);
      
      // Handle berbagai format response
      let diplomaData: DiplomaData;
      
      if (result.data) {
        // Format: { success: true, data: {...} }
        diplomaData = result.data;
      } else if (result.id) {
        // Format langsung data
        diplomaData = result;
      } else {
        throw new Error('Format data tidak valid');
      }
      
      // TAMPILKAN DATA APAPUN STATUSNYA (tidak perlu validasi minted)
      setVerificationData(diplomaData);
      setError(null);
      
    } catch (err: any) {
      console.error('🔥 Error saat verifikasi:', err);
      setError(err.message || 'Terjadi kesalahan saat memverifikasi ijazah');
      setVerificationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetVerification = () => {
    setVerificationData(null);
    setCertificateId('');
    setError(null);
    setSearchAttempted(false);
    
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };

  useEffect(() => {
    if (verificationData && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [verificationData]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} berhasil disalin!`);
  };

  const openPolygonscan = (hash: string) => {
    if (hash && hash.startsWith('0x')) {
      window.open(`https://amoy.polygonscan.com/tx/${hash}`, '_blank');
    } else {
      alert('Hash transaksi tidak valid');
    }
  };

  const openContract = (address: string) => {
    if (address && address.startsWith('0x')) {
      window.open(`https://amoy.polygonscan.com/address/${address}`, '_blank');
    } else {
      alert('Alamat kontrak tidak valid');
    }
  };

  const openIPFS = (hash: string) => {
    if (hash) {
      window.open(`https://ipfs.io/ipfs/${hash}`, '_blank');
    } else {
      alert('Hash IPFS tidak valid');
    }
  };

  // Format date untuk display
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format date singkat
  const formatDateShort = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Ekstrak tahun dari tanggal lulus
  const getYearFromDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).getFullYear().toString();
    } catch {
      return '';
    }
  };

  // Fungsi untuk mendapatkan warna status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'minted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fungsi untuk mendapatkan label status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending / Menunggu Verifikasi';
      case 'verified': return 'Terverifikasi (Siap di-Mint)';
      case 'minted': return 'Telah di-Mint ke Blockchain';
      case 'rejected': return 'Ditolak / Perlu Revisi';
      default: return status;
    }
  };

  // Fungsi untuk mendapatkan ikon status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'verified': return '✅';
      case 'minted': return '🔗';
      case 'rejected': return '❌';
      default: return '📄';
    }
  };

  return (
    <div ref={topRef} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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

            {/* Navigation - UPDATED: Link langsung ke homepage dengan hash */}
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
                href="/#tutorial-verifikasi" 
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Tutorial Verifikasi
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <section className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Verifikasi Ijazah<br />
            <span className="text-purple-600">Untuk Perusahaan</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Verifikasi keaslian ijazah calon karyawan dengan teknologi Blockchain dan SBT
          </p>
        </section>

        <div className="max-w-4xl mx-auto">
          {/* Form Input Certificate ID */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Input Nomor Ijazah</h2>
              <p className="text-gray-600 text-sm">Masukkan Nomor Ijazah untuk memverifikasi ijazah</p>
            </div>

            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label htmlFor="certificateId" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Ijazah
                </label>
                <input
                  type="text"
                  id="certificateId"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Pastikan Nomor Ijazah di Input dengan benar"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-300 text-base"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center text-base"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Cek Ijazah
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt=0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-800 text-sm mb-1">Cara Verifikasi Ijazah</h4>
                  <ul className="text-blue-700 text-xs space-y-1">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Masukkan Nomor Ijazah yang tertera pada ijazah
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Klik tombol "Cek Ijazah" untuk memulai verifikasi
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Sistem akan memverifikasi data dari database
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Hasil verifikasi akan ditampilkan secara detail
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Pesan Error */}
          {error && searchAttempted && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-red-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ijazah Tidak Ditemukan</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>Nomor Ijazah yang dicari:</strong>
                    </p>
                    <p className="font-mono text-base bg-gray-100 p-2 rounded">
                      {certificateId}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Pastikan Nomor Ijazah yang dimasukkan benar. Nomor Ijazah biasanya tercetak pada bagian bawah ijazah.
                  </p>
                  <button
                    onClick={resetVerification}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 text-sm"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          )}

          {verificationData && (
            <div 
              ref={resultsRef}
              className="bg-white rounded-xl shadow-lg p-6 scroll-mt-8"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hasil Verifikasi Lengkap</h2>
                <p className="text-gray-600 text-sm">Detail informasi ijazah yang diverifikasi</p>
              </div>
              
              {/* Status Validasi - MODIFIED untuk semua status */}
              <div className="mb-8">
                <div className={`border rounded-xl p-5 ${
                  verificationData.status === 'minted' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
                  verificationData.status === 'verified' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' :
                  verificationData.status === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' :
                  'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                        verificationData.status === 'minted' ? 'bg-green-100' :
                        verificationData.status === 'verified' ? 'bg-blue-100' :
                        verificationData.status === 'pending' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        <span className="text-2xl">{getStatusIcon(verificationData.status)}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Status Ijazah</h3>
                        <p className={`font-medium ${
                          verificationData.status === 'minted' ? 'text-green-700' :
                          verificationData.status === 'verified' ? 'text-blue-700' :
                          verificationData.status === 'pending' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {getStatusLabel(verificationData.status)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Certificate ID: <span className="font-mono">{verificationData.certificate_id}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        verificationData.status === 'minted' ? 'bg-green-100 text-green-800' :
                        verificationData.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                        verificationData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {verificationData.status === 'minted' ? '✓ Blockchain' : 
                         verificationData.status === 'verified' ? '✓ Terverifikasi' :
                         verificationData.status === 'pending' ? '⏳ Pending' :
                         '✗ Ditolak'}
                      </span>
                      {verificationData.status === 'minted' && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          ✓ Digital Signature
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data dalam Grid Layout */}
              <div className="space-y-6">
                {/* Bagian 1: Identitas Mahasiswa */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600">👤</span>
                    </span>
                    Identitas Mahasiswa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nama Lengkap</label>
                      <p className="text-base font-semibold text-gray-800">{verificationData.nama_lengkap}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">NPM</label>
                      <p className="text-base font-semibold text-gray-800 font-mono">{verificationData.npm}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">NIK</label>
                      <p className="text-base font-semibold text-gray-800 font-mono">
                        {verificationData.nik || '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tempat/Tgl Lahir</label>
                      <p className="text-base font-semibold text-gray-800">
                        {verificationData.tempat_tanggal_lahir || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bagian 2: Data Akademik */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600">🎓</span>
                    </span>
                    Data Akademik
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Program Studi</label>
                      <p className="text-base font-semibold text-gray-800">{verificationData.program_studi}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Fakultas</label>
                      <p className="text-base font-semibold text-gray-800">
                        {verificationData.fakultas || '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Gelar Akademik</label>
                      <p className="text-base font-semibold text-gray-800">{verificationData.gelar_akademik}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tahun Lulus</label>
                      <p className="text-base font-semibold text-gray-800">
                        {getYearFromDate(verificationData.tanggal_lulus)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Kelulusan</label>
                      <p className="text-base font-semibold text-gray-800">
                        {formatDateDisplay(verificationData.tanggal_lulus)}
                      </p>
                    </div>
                    {verificationData.ipk && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1">IPK</label>
                        <p className="text-base font-semibold text-gray-800">{verificationData.ipk}</p>
                      </div>
                    )}
                    {verificationData.yudisium && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Yudisium</label>
                        <p className="text-base font-semibold text-gray-800">{verificationData.yudisium}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bagian 3: Legalitas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-yellow-600">🏛️</span>
                    </span>
                    Legalitas Resmi
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Nomor SK Rektor</label>
                      <p className="text-base font-semibold text-gray-800">
                        {verificationData.nomor_sk_rektor || '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal SK Rektor</label>
                      <p className="text-base font-semibold text-gray-800">
                        {verificationData.tanggal_sk_rektor ? 
                          formatDateShort(verificationData.tanggal_sk_rektor) : '-'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Alamat Universitas</label>
                      <p className="text-base font-semibold text-gray-800">
                        Jl. Jenderal Ahmad Yani, Pontianak, Kalimantan Barat
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bagian 4: Data Blockchain - Hanya tampilkan jika ada data */}
                {(verificationData.token_id || verificationData.transaction_hash || verificationData.contract_address) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-indigo-600">🔗</span>
                      </span>
                      Data Blockchain
                    </h3>
                    <div className="space-y-4">
                      {/* Certificate ID */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <label className="block text-xs font-medium text-blue-600 mb-1">Certificate ID</label>
                            <p className="text-base font-bold text-gray-800 font-mono">{verificationData.certificate_id}</p>
                            <p className="text-xs text-blue-700 mt-1">Unique identifier resmi ijazah</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(verificationData.certificate_id, 'Certificate ID')}
                            className="px-3 py-1.5 bg-white text-blue-600 border border-blue-300 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                          >
                            Salin
                          </button>
                        </div>
                      </div>

                      {/* Token ID */}
                      {verificationData.token_id && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Token ID</label>
                              <p className="text-base font-semibold text-gray-800 font-mono">{verificationData.token_id}</p>
                              <p className="text-xs text-gray-500 mt-1">Unique identifier di blockchain</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(verificationData.token_id!, 'Token ID')}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            >
                              Salin
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Wallet Address */}
                      {verificationData.wallet_address && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Wallet Address Pemilik</label>
                              <p className="text-sm font-semibold text-gray-800 font-mono break-all">
                                {verificationData.wallet_address}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Address blockchain pemilik ijazah</p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(verificationData.wallet_address!, 'Wallet Address')}
                              className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            >
                              Salin
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Transaction Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {verificationData.contract_address && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Contract Address</label>
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-semibold text-gray-800 font-mono truncate">
                                {verificationData.contract_address}
                              </p>
                              <button
                                onClick={() => openContract(verificationData.contract_address!)}
                                className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
                                disabled={!verificationData.contract_address?.startsWith('0x')}
                              >
                                Cek di PolygonScan
                              </button>
                            </div>
                          </div>
                        )}
                        {verificationData.block_number && (
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Block Number</label>
                            <p className="text-base font-semibold text-gray-800">#{verificationData.block_number}</p>
                          </div>
                        )}
                      </div>

                      {/* Transaction Hash */}
                      {verificationData.transaction_hash && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <label className="block text-xs font-medium text-gray-500 mb-1">Transaction Hash</label>
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-semibold text-gray-800 font-mono truncate">
                              {verificationData.transaction_hash}
                            </p>
                            <button
                              onClick={() => openPolygonscan(verificationData.transaction_hash!)}
                              className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
                              disabled={!verificationData.transaction_hash?.startsWith('0x')}
                            >
                              Cek di PolygonScan
                            </button>
                          </div>
                        </div>
                      )}

                      {/* IPFS Hash */}
                      {verificationData.file_hash && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <label className="block text-xs font-medium text-gray-500 mb-1">IPFS Hash (Metadata)</label>
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-semibold text-gray-800 font-mono break-all">
                              {verificationData.file_hash}
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => copyToClipboard(verificationData.file_hash!, 'IPFS Hash')}
                                className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                              >
                                Salin
                              </button>
                              <button
                                onClick={() => openIPFS(verificationData.file_hash!)}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
                              >
                                Lihat
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bagian 5: Catatan jika status rejected */}
                {verificationData.status === 'rejected' && verificationData.verification_notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-red-600">📝</span>
                      </span>
                      Catatan Penolakan
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {verificationData.verification_notes}
                      </p>
                      <p className="text-xs text-red-600 mt-2">
                        Ijazah ini memerlukan revisi sesuai dengan catatan di atas.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - UPDATED: Direct links to amoy.polygonscan.com and opensea.io */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="text-sm text-gray-500">
                    <p className="mb-1">
                      Waktu verifikasi: {formatDateDisplay(new Date().toISOString())}
                    </p>
                    <p>Status: <span className={`font-medium ${getStatusColor(verificationData.status)} px-2 py-1 rounded`}>
                      {getStatusLabel(verificationData.status)}
                    </span></p>
                    {verificationData.minted_at && (
                      <p className="mt-1 text-xs">
                        Waktu mint: {formatDateShort(verificationData.minted_at)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={resetVerification}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Verifikasi Lagi
                    </button>
                    
                    {/* Tombol Cek di PolygonScan - Langsung ke amoy.polygonscan.com */}
                    <button
                      onClick={() => window.open('https://amoy.polygonscan.com', '_blank')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Cek di PolygonScan
                    </button>
                    
                    {/* Tombol Cek di OpenSea - Langsung ke opensea.io */}
                    <button
                      onClick={() => window.open('https://opensea.io', '_blank')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Cek di OpenSea
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex justify-center items-center mb-3">
              <div className="w-10 h-10 relative mr-3">
                <Image
                  src="/gambar/UWD.png"
                  alt="Logo Universitas Widya Dharma Pontianak"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Universitas Widya Dharma</h3>
                <p className="text-gray-600 text-sm">Pontianak</p>
              </div>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Universitas Widya Dharma Pontianak.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Sistem Verifikasi Ijazah - Untuk kepentingan verifikasi perusahaan
            </p>
            <div className="mt-4 text-xs text-gray-400">
              <p>Status Ijazah:</p>
              <div className="flex justify-center space-x-2 mt-1">
                <span className="px-2 py-1 bg-yellow-100 text-gray-800 rounded">Ijazah yang tertera merupakan ijazah yang sudah terverifikasi dan terupload ke blockchain</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}