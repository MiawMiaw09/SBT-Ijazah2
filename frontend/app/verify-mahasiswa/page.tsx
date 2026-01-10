'use client'

import { useState } from 'react'

export default function VerifyMahasiswaPage() {
  const [showDetail, setShowDetail] = useState<boolean>(false) // State untuk toggle detail

  // Data dummy untuk 1 ijazah
  const dummyData = [
    {
      id: 1,
      nama: "Ahmad Budiman",
      npm: "20230001",
      prodi: "Informatika",
      fakultas: "Fakultas Teknik",
      tahunLulus: "2024",
      gelar: "S.Kom",
      tokenId: "SBT-00123",
      wallet: "0x1234...5678",
      status: "Minted",
      skRektor: "SK-001/UNWIDHA/2024",
      tanggalSK: "2024-01-15",
      tanggalLulus: "2024-01-10"
    }
  ]

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    alert(`${label} berhasil disalin!`)
  }

  const openPolygonscan = () => {
    window.open('https://polygonscan.com/', '_blank')
  }

  const toggleDetail = () => {
    setShowDetail(!showDetail)
  }

  const item = dummyData[0]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
              <span className="text-xl text-blue-600">👤</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nama Mahasiswa</p>
              <p className="font-semibold text-gray-800 truncate">{item.nama}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
              <span className="text-xl text-green-600">🎓</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Program Studi</p>
              <p className="font-semibold text-gray-800">{item.prodi}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mr-4">
              <span className="text-xl text-purple-600">🔗</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Jaringan</p>
              <p className="font-semibold text-gray-800">Polygon</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mr-4">
              <span className="text-xl text-yellow-600">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-semibold text-gray-800">SBT Minted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ijazah Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center">
                <span className="text-3xl text-green-600">🎓</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Ijazah Digital</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium">
                    {item.prodi}
                  </span>
                  <span className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-full text-sm font-medium">
                    Tahun {item.tahunLulus}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-sm font-medium">
                    ✅ SBT Minted
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={toggleDetail}
                className="px-4 py-2.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {showDetail ? (
                  <>
                    <span>▲</span>
                    Sembunyikan Detail
                  </>
                ) : (
                  <>
                    <span>▼</span>
                    Lihat Detail
                  </>
                )}
              </button>
              <button
                onClick={() => copyToClipboard(item.tokenId, 'Token ID')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>📋</span>
                Salin Token ID
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Content - Toggle show/hide */}
        {showDetail && (
          <div className="p-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Academic Data */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600">📚</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Data Akademik</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Nama Lengkap</p>
                      <p className="font-semibold text-gray-900">{item.nama}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">NPM</p>
                      <p className="font-semibold text-gray-900 font-mono">{item.npm}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Program Studi</p>
                      <p className="font-semibold text-gray-900">{item.prodi}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Fakultas</p>
                      <p className="font-semibold text-gray-900">{item.fakultas}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Gelar Akademik</p>
                      <p className="font-semibold text-gray-900">{item.gelar}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Tanggal Lulus</p>
                      <p className="font-semibold text-gray-900">{item.tanggalLulus}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-gray-600">🏛️</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Legalitas Resmi</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Nomor SK Rektor</p>
                      <p className="font-semibold text-gray-900">{item.skRektor}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Tanggal SK Rektor</p>
                      <p className="font-semibold text-gray-900">{item.tanggalSK}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Blockchain Data */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-purple-600">🔗</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">Data Blockchain</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-blue-600 uppercase font-medium mb-1">Token ID SBT</p>
                          <p className="font-bold font-mono text-gray-900">{item.tokenId}</p>
                          <p className="text-xs text-blue-700 mt-1">
                            Unique identifier di blockchain
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(item.tokenId, 'Token ID')}
                          className="px-3 py-1.5 bg-white text-blue-600 border border-blue-300 rounded-lg text-sm hover:bg-blue-50 transition-colors flex items-center gap-1"
                        >
                          <span>📋</span>
                          Salin
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Wallet Address</p>
                          <p className="font-semibold font-mono text-sm text-gray-900 truncate">
                            {item.wallet}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tersimpan di wallet Anda
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(item.wallet, 'Wallet Address')}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-1"
                        >
                          <span>📋</span>
                          Salin
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-green-600">✅</span>
                          </div>
                          <div>
                            <p className="font-semibold text-green-800">SBT Sudah Di-Mint</p>
                            <p className="text-sm text-green-700">
                              Ijazah sudah tercatat permanen di blockchain
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded-full text-sm font-medium">
                          Immutable
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      onClick={openPolygonscan}
                      className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <span>🔍</span>
                      Cek di Polygonscan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
            <span className="text-3xl">💡</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-blue-900 mb-3">Cara Menggunakan Ijazah Digital</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Salin Token ID</p>
                  <p className="text-sm text-blue-700">
                    Salin Token ID untuk verifikasi
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Bagikan ke Perusahaan</p>
                  <p className="text-sm text-blue-700">
                    Berikan Token ID untuk verifikasi keaslian
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Cek di Polygonscan</p>
                  <p className="text-sm text-blue-700">
                    Verifikasi transaksi di blockchain explorer
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Aman & Terverifikasi</p>
                  <p className="text-sm text-blue-700">
                    Data tidak bisa dipalsukan atau diubah
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}