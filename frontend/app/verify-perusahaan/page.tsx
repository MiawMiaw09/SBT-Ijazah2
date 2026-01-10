'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function VerificationPage() {
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenId, setTokenId] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tokenId.trim()) {
      alert('Masukkan Token ID terlebih dahulu');
      return;
    }

    setIsLoading(true);
    
    // Simulasi API call dengan timeout
    setTimeout(() => {
      // Data dummy lengkap untuk verifikator
      const dummyData = {
        // Identitas Mahasiswa
        namaMahasiswa: "Ahmad Budiman",
        npm: "20230001",
        nik: "3201010101010001",
        tempatTanggalLahir: "Pontianak, 15 Januari 2002",
        
        // Data Akademik
        programStudi: "Informatika",
        fakultas: "Fakultas Teknik",
        gelarAkademik: "S.Kom",
        tahunLulus: "2024",
        tanggalKelulusan: "2024-01-10",
        
        // Legalitas
        nomorSKRektor: "SK-001/UNWIDHA/2024",
        tanggalSKRektor: "2024-01-15",
        alamatPenerbit: "Jl. Jenderal Ahmad Yani, Pontianak",
        
        // Data Blockchain
        tokenID: "SBT-00123",
        walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
        ipfs: "QmXyzabc123def456ghi789jkl012mno345pqr678stu901vwx234",
        contractAddress: "0x9876543210fedcba09876543210fedcba098765",
        transactionHash: "0xabc123def456ghi789jkl012mno345pqr678stu901vwx",
        blockNumber: 12345678,
        timestamp: "2024-01-15 10:30:45",
        
        // Status Validasi
        statusValidasi: "Valid",
        statusBlockchain: "Confirmed",
        signatureValid: true,
        metadataValid: true
      };
      
      setVerificationData(dummyData);
      setIsLoading(false);
    }, 1500);
  };

  const resetVerification = () => {
    setVerificationData(null);
    setTokenId('');
    
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
    window.open(`https://polygonscan.com/tx/${hash}`, '_blank');
  };

  const openContract = (address: string) => {
    window.open(`https://polygonscan.com/address/${address}`, '_blank');
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

            {/* Navigation */}
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
          {/* Form Input Token */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Input Token ID</h2>
              <p className="text-gray-600 text-sm">Masukkan Token ID untuk memverifikasi ijazah</p>
            </div>

            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700 mb-2">
                  Token ID Ijazah
                </label>
                <input
                  type="text"
                  id="tokenId"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="Contoh: SBT-00123"
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
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-800 text-sm mb-1">Cara Verifikasi Ijazah</h4>
                  <ul className="text-blue-700 text-xs space-y-1">
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Masukkan Token ID yang tertera pada ijazah
                    </li>
                    <li className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                      Klik tombol "Cek Ijazah" untuk memulai verifikasi
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
              
              {/* Status Validasi */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Status Validasi</h3>
                        <p className="text-green-700 font-medium">
                          {verificationData.statusValidasi} • {verificationData.statusBlockchain}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ✓ Signature Valid
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ✓ Metadata Valid
                      </span>
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
                      <p className="text-base font-semibold text-gray-800">{verificationData.namaMahasiswa}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">NPM</label>
                      <p className="text-base font-semibold text-gray-800 font-mono">{verificationData.npm}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">NIK</label>
                      <p className="text-base font-semibold text-gray-800 font-mono">{verificationData.nik}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tempat/Tgl Lahir</label>
                      <p className="text-base font-semibold text-gray-800">{verificationData.tempatTanggalLahir}</p>
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
                      <p className="text-base font-semibold text-gray-800">{verificationData.programStudi}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Fakultas</label>
                      <p className="text-base font-semibold text-gray-800">{verificationData.fakultas}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Gelar Akademik</label>
                      <p className="text-base font-semibold text-gray-800">{verificationData.gelarAkademik}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tahun Lulus</label>
                      <p className="text-base font-semibold text-gray-800">{verificationData.tahunLulus}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal Kelulusan</label>
                      <p className="text-base font-semibold text-gray-800">
                        {new Date(verificationData.tanggalKelulusan).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
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
                      <p className="text-base font-semibold text-gray-800">{verificationData.nomorSKRektor}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Tanggal SK Rektor</label>
                      <p className="text-base font-semibold text-gray-800">
                        {new Date(verificationData.tanggalSKRektor).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Alamat Penerbit</label>
                      <p className="text-base font-semibold text-gray-800">{verificationData.alamatPenerbit}</p>
                    </div>
                  </div>
                </div>

                {/* Bagian 4: Data Blockchain */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-indigo-600">🔗</span>
                    </span>
                    Data Blockchain
                  </h3>
                  <div className="space-y-4">
                    {/* Token ID */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <label className="block text-xs font-medium text-blue-600 mb-1">Token ID</label>
                          <p className="text-base font-bold text-gray-800 font-mono">{verificationData.tokenID}</p>
                          <p className="text-xs text-blue-700 mt-1">Unique identifier di blockchain</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(verificationData.tokenID, 'Token ID')}
                          className="px-3 py-1.5 bg-white text-blue-600 border border-blue-300 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                        >
                          Salin
                        </button>
                      </div>
                    </div>

                    {/* Wallet Address */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Wallet Address Pemilik</label>
                          <p className="text-sm font-semibold text-gray-800 font-mono break-all">
                            {verificationData.walletAddress}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Address blockchain pemilik ijazah</p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(verificationData.walletAddress, 'Wallet Address')}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                        >
                          Salin
                        </button>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Contract Address</label>
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-semibold text-gray-800 font-mono truncate">
                            {verificationData.contractAddress}
                          </p>
                          <button
                            onClick={() => openContract(verificationData.contractAddress)}
                            className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                          >
                            Buka
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Block Number</label>
                        <p className="text-base font-semibold text-gray-800">#{verificationData.blockNumber}</p>
                      </div>
                    </div>

                    {/* Transaction Hash */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Transaction Hash</label>
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-semibold text-gray-800 font-mono truncate">
                          {verificationData.transactionHash}
                        </p>
                        <button
                          onClick={() => openPolygonscan(verificationData.transactionHash)}
                          className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                        >
                          Cek di Polygonscan
                        </button>
                      </div>
                    </div>

                    {/* IPFS Hash */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <label className="block text-xs font-medium text-gray-500 mb-1">IPFS Hash (Metadata)</label>
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-semibold text-gray-800 font-mono break-all">
                          {verificationData.ipfs}
                        </p>
                        <button
                          onClick={() => copyToClipboard(verificationData.ipfs, 'IPFS Hash')}
                          className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                        >
                          Salin
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="text-sm text-gray-500">
                    <p className="mb-1">Waktu verifikasi: {verificationData.timestamp}</p>
                    <p>Jaringan: <span className="font-medium">Polygon Mainnet</span></p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={resetVerification}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 text-sm"
                    >
                      Verifikasi Lagi
                    </button>
                    <button
                      onClick={() => {
                        const report = JSON.stringify(verificationData, null, 2);
                        copyToClipboard(report, 'Laporan Verifikasi');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 text-sm"
                    >
                      Salin Laporan
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
              &copy; 2025 Universitas Widya Dharma Pontianak.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}