"use client";

import { useState, useEffect } from 'react';
import { getIjazahData, updateIjazahStatus } from '../utils/ijazahStorage';
import MintPopup from '../../components/MintPopup';
import { IjazahData, MintStep } from '../../types/ijazah';

export default function MintSBT() {
  const [ijazahData, setIjazahData] = useState<IjazahData[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk popup mint
  const [mintStep, setMintStep] = useState<MintStep>('idle');
  const [currentMintingItem, setCurrentMintingItem] = useState<IjazahData | null>(null);
  const [mintProgress, setMintProgress] = useState({
    isUploading: false,
    uploadProgress: 0,
    isMinting: false,
    estimatedGas: '0.01'
  });

  // Load data dari storage saat komponen mount
  useEffect(() => {
    loadIjazahData();
    
    // Listen untuk updates dari halaman lain
    const handleDataUpdate = () => {
      loadIjazahData();
    };
    
    window.addEventListener('ijazahDataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('ijazahDataUpdated', handleDataUpdate);
    };
  }, []);

  // Fungsi untuk load data dari storage
  const loadIjazahData = () => {
    setIsLoading(true);
    try {
      const data = getIjazahData();
      
      // Format data untuk tabel dengan menambahkan 'selected' field
      const formattedData = data.map(item => ({
        ...item,
        selected: false
      }));
      
      // Filter hanya yang status Pending untuk halaman MintSBT
      const pendingData = formattedData.filter(item => item.status === 'Pending');
      
      setIjazahData(pendingData);
    } catch (error) {
      console.error('Error loading ijazah data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle select individual row
  const toggleSelect = (id: number) => {
    setIjazahData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setIjazahData(prev => 
      prev.map(item => ({ ...item, selected: newSelectAll }))
    );
  };

  // Toggle expanded row (untuk melihat detail lengkap)
  const toggleExpandRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Simulasi upload ke IPFS
  const simulateIPFSUpload = async (): Promise<string> => {
    return new Promise((resolve) => {
      // Simulasi proses upload dengan progress bar
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setMintProgress(prev => ({ ...prev, uploadProgress: progress }));
        
        if (progress >= 100) {
          clearInterval(interval);
          // Generate fake IPFS CID untuk simulasi
          const fakeCID = `Qm${Math.random().toString(36).substring(2)}${Date.now().toString(36).substring(0, 10)}`;
          resolve(fakeCID);
        }
      }, 200);
    });
  };

  // Simulasi mint ke blockchain (SANDBOX MODE)
  const simulateBlockchainMint = async (): Promise<{tokenId: string, txHash: string}> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate fake transaction data untuk simulasi
        const fakeTokenId = currentMintingItem?.tokenID || `SBT-${Date.now().toString().slice(-6)}`;
        const fakeTxHash = `0x${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36).substring(0, 8)}`;
        resolve({ tokenId: fakeTokenId, txHash: fakeTxHash });
      }, 2000);
    });
  };

  // Handle mint single dengan popup flow
  const handleStartMintSingle = (item: IjazahData) => {
    setCurrentMintingItem(item);
    setMintStep('ipfs_upload');
    setMintProgress({
      isUploading: false,
      uploadProgress: 0,
      isMinting: false,
      estimatedGas: '0.01'
    });
  };

  // Handle upload ke IPFS (step 1)
  const handleUploadToIPFS = async () => {
    if (!currentMintingItem) return;
    
    setMintProgress(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
    
    try {
      // Simulasi upload ke IPFS (SANDBOX MODE)
      await simulateIPFSUpload();
      
      // Pindah ke step blockchain mint
      setMintProgress(prev => ({ ...prev, isUploading: false }));
      setMintStep('blockchain_mint');
      
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      alert('❌ Gagal upload ke IPFS. Silakan coba lagi.');
      setMintStep('idle');
    }
  };

  // Handle mint ke blockchain (step 2) - SANDBOX MODE
  const handleMintToBlockchain = async () => {
    if (!currentMintingItem) return;
    
    setMintProgress(prev => ({ ...prev, isMinting: true }));
    
    try {
      // Simulasi mint ke blockchain (SANDBOX MODE)
      await simulateBlockchainMint();
      
      // Update status di sistem - INI YANG MEMBUAT STATUS "Minted"
      updateIjazahStatus(currentMintingItem.id, 'Minted');
      
      // Update local state
      setIjazahData(prev => 
        prev.map(item => 
          item.id === currentMintingItem.id 
            ? { ...item, status: 'Minted' } 
            : item
        )
      );
      
      // Pindah ke success step
      setMintProgress(prev => ({ ...prev, isMinting: false }));
      setMintStep('success');
      
    } catch (error) {
      console.error('Error minting to blockchain:', error);
      alert('❌ Gagal mint ke blockchain. Silakan coba lagi.');
      setMintStep('idle');
    }
  };

  // Close popup
  const handleClosePopup = () => {
    setMintStep('idle');
    setCurrentMintingItem(null);
  };

  // Handle mint selected (batch) - TANPA POPUP
  const handleMintSelected = () => {
    const selectedItems = ijazahData.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert('Pilih minimal satu ijazah untuk di-mint!');
      return;
    }
    
    // Konfirmasi sebelum mint
    if (!confirm(`Anda akan mint ${selectedItems.length} ijazah. Lanjutkan?\n\nMode: Sandbox/Simulasi`)) {
      return;
    }
    
    // Update status untuk semua yang terpilih
    selectedItems.forEach(item => {
      updateIjazahStatus(item.id, 'Minted');
    });
    
    // Update local state
    setIjazahData(prev => 
      prev.map(item => 
        item.selected ? { ...item, status: "Minted" } : item
      )
    );
    
    setSelectAll(false);
    
    alert(`✅ Berhasil mint SBT untuk ${selectedItems.length} ijazah terpilih!\n\nMode: Sandbox/Simulasi\nStatus: Minted`);
  };

  // Refresh data
  const handleRefresh = () => {
    loadIjazahData();
  };

  const selectedCount = ijazahData.filter(item => item.selected).length;
  const pendingCount = ijazahData.filter(item => item.status === "Pending").length;

  return (
    <div className="max-w-full mx-auto">
      {/* Popup Mint Flow - TERPISAH */}
      {mintStep !== 'idle' && (
        <MintPopup
          mintStep={mintStep}
          currentMintingItem={currentMintingItem}
          mintProgress={mintProgress}
          onUploadToIPFS={handleUploadToIPFS}
          onMintToBlockchain={handleMintToBlockchain}
          onClose={handleClosePopup}
        />
      )}

      {/* Header dan statistik lainnya tetap sama */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mint SBT</h1>
            <p className="text-gray-600">Daftar Ijazah untuk di-mint menjadi Soulbound Token (SBT)</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Memuat...' : '🔄 Refresh Data'}
          </button>
        </div>
        
        {/*<div className="mt-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          <span className="font-medium">ℹ️ Halaman ini menampilkan ijazah dengan status "Pending"</span>
          <ul className="mt-1 ml-5 list-disc">
            <li>Mode: <strong className="text-yellow-600">Sandbox/Simulasi</strong></li>
            <li>Tidak ada transaksi blockchain nyata</li>
            <li>Status akan otomatis update di semua halaman setelah di-mint</li>
          </ul>
        </div>*/}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-gray-800">
                {isLoading ? '...' : ijazahData.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">📄</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Siap di-Mint</p>
              <p className="text-2xl font-bold text-yellow-600">
                {isLoading ? '...' : pendingCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-lg">⏳</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Terpilih</p>
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? '...' : selectedCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedCount} ijazah terpilih
            </span>
            <button
              onClick={handleMintSelected}
              disabled={selectedCount === 0 || isLoading}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition duration-200 ${
                selectedCount > 0 && !isLoading
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Memuat...' : `Mint Selected (${selectedCount})`}
            </button>
          </div>
          <div className="text-sm text-gray-500 flex items-center space-x-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              Total: {ijazahData.length}
            </span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
              Pending: {pendingCount}
            </span>
            {selectedCount > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                Terpilih: {selectedCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data ijazah...</p>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-12 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        disabled={ijazahData.length === 0}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Mahasiswa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NPM
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Studi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tahun Lulus
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Token ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ijazahData.map((item, index) => (
                  <>
                    <tr 
                      key={item.id}
                      className={`hover:bg-gray-50 transition duration-150 ${
                        item.selected ? 'bg-blue-50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleSelect(item.id)}
                            disabled={item.status === "Minted"}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                          />
                        </div>
                      </td>
                      
                      {/* No */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      
                      {/* Nama Mahasiswa */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.namaMahasiswa}
                          </div>
                          <div className="text-xs text-gray-500">
                            NIK: {item.nik}
                          </div>
                        </div>
                      </td>
                      
                      {/* NPM */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {item.npm}
                      </td>
                      
                      {/* Program Studi */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.programStudi}</div>
                        <div className="text-xs text-gray-500">{item.fakultas}</div>
                      </td>
                      
                      {/* Tahun Lulus */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{item.tahunLulus}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.tanggalKelulusan).toLocaleDateString('id-ID')}
                        </div>
                      </td>
                      
                      {/* Token ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                          {item.tokenID}
                        </div>
                      </td>
                      
                      {/* Wallet Address */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-mono text-gray-600 max-w-[120px] truncate">
                          {item.walletAddress}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "Minted" 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      
                      {/* Aksi */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleStartMintSingle(item)}
                          disabled={item.status === "Minted"}
                          className={`font-medium ${
                            item.status === "Minted"
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {item.status === "Minted" ? "✓ Sudah Mint" : "Mint (Simulasi)"}
                        </button>
                      </td>
                      
                      {/* Detail */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => toggleExpandRow(item.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedRow === item.id ? "Sembunyikan" : "Lihat Detail"}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Row (Detail Lengkap) */}
                    {expandedRow === item.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={11} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-lg border">
                            {/* Kolom Kiri */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Mahasiswa</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500">Nama Lengkap</p>
                                    <p className="font-medium">{item.namaMahasiswa}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">NPM</p>
                                    <p className="font-medium font-mono">{item.npm}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">NIK</p>
                                    <p className="font-medium font-mono">{item.nik}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Tempat/Tgl Lahir</p>
                                    <p className="font-medium">{item.tempatTanggalLahir}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Program Studi</p>
                                    <p className="font-medium">{item.programStudi}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Fakultas</p>
                                    <p className="font-medium">{item.fakultas}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Gelar Akademik</p>
                                    <p className="font-medium">{item.gelarAkademik}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Akademik</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500">Tanggal Kelulusan</p>
                                    <p className="font-medium">
                                      {new Date(item.tanggalKelulusan).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Tahun Lulus</p>
                                    <p className="font-medium">{item.tahunLulus}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Nomor SK Rektor</p>
                                    <p className="font-medium">{item.nomorSKRektor}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Tanggal SK Rektor</p>
                                    <p className="font-medium">
                                      {new Date(item.tanggalSKRektor).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Kolom Kanan */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Sistem & Blockchain</h4>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-gray-500 text-sm">Token ID</p>
                                    <p className="font-medium font-mono text-sm bg-gray-100 p-2 rounded">
                                      {item.tokenID}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-sm">Wallet Address</p>
                                    <p className="font-medium font-mono text-sm break-all bg-gray-100 p-2 rounded">
                                      {item.walletAddress}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-sm">IPFS Hash</p>
                                    <p className="font-medium font-mono text-xs break-all bg-gray-100 p-2 rounded">
                                      {item.ipfs}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-sm">Alamat Penerbit</p>
                                    <p className="font-medium font-mono text-xs break-all bg-gray-100 p-2 rounded">
                                      {item.alamatPenerbit}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-sm">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      item.status === "Minted" 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="pt-4 border-t">
                                <button
                                  onClick={() => handleStartMintSingle(item)}
                                  disabled={item.status === "Minted"}
                                  className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition ${
                                    item.status === "Minted"
                                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {item.status === "Minted" ? "✓ Sudah Di-Mint" : "Mint Sekarang (Simulasi)"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {ijazahData.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📄</div>
              <p className="text-gray-500 text-lg mb-2">Tidak ada ijazah untuk di-mint</p>
              <p className="text-gray-400 text-sm mb-4">
                Semua ijazah sudah di-mint atau belum ada data
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Coba:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Upload ijazah baru di halaman <strong>Upload Ijazah</strong></li>
                  <li>• Cek semua data di halaman <strong>Data Ijazah</strong></li>
                  <li>• Refresh data dengan tombol di atas</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      {/* <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Mode Sandbox/Simulasi</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Mode Sandbox Aktif</strong> - Tidak ada transaksi blockchain nyata</li>
              <li>• Proses upload IPFS adalah simulasi (dummy CID)</li>
              <li>• Minting SBT hanya mengubah status di sistem lokal</li>
              <li>• Tidak ada biaya gas fee yang dikeluarkan</li>
              <li>• Untuk produksi, hubungkan dengan wallet dan smart contract nyata</li>
            </ul>
          </div>
        </div>
      </div>*/}
    </div>
  );
}