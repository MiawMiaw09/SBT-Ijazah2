"use client";

import { useState, useEffect } from 'react';
import { getIjazahData, deleteIjazah, updateIjazahStatus, IjazahData } from '../utils/ijazahStorage';
import MintPopup from '../../components/MintPopup';
import { MintStep } from '../../types/ijazah';

export default function DataIjazah() {
  const [filterProdi, setFilterProdi] = useState('');
  const [filterTahun, setFilterTahun] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchNpm, setSearchNpm] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [ijazahData, setIjazahData] = useState<IjazahData[]>([]);
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

  // Load data dari storage
  useEffect(() => {
    const loadData = () => {
      try {
        const data = getIjazahData();
        setIjazahData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading ijazah data:', error);
        setIsLoading(false);
      }
    };

    loadData();
    
    // Listen for updates dari halaman lain
    const handleUpdate = () => {
      console.log('Data updated event received');
      loadData();
    };
    
    window.addEventListener('ijazahDataUpdated', handleUpdate);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('ijazahDataUpdated', handleUpdate);
    };
  }, []);

  // Toggle expanded row
  const toggleExpandRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Filter data berdasarkan kriteria
  const filteredData = ijazahData.filter(item => {
    return (
      (filterProdi === '' || item.programStudi === filterProdi) &&
      (filterTahun === '' || item.tahunLulus === filterTahun) &&
      (filterStatus === '' || item.status === filterStatus) &&
      (searchNpm === '' || item.npm.includes(searchNpm) || item.namaMahasiswa.toLowerCase().includes(searchNpm.toLowerCase()))
    );
  });

  // === FUNGSI UNTUK POPUP MINT (DARI MINT-SBT) ===
  // Simulasi upload ke IPFS
  const simulateIPFSUpload = async (): Promise<string> => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setMintProgress(prev => ({ ...prev, uploadProgress: progress }));
        
        if (progress >= 100) {
          clearInterval(interval);
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
        const fakeTokenId = currentMintingItem?.tokenID || `SBT-${Date.now().toString().slice(-6)}`;
        const fakeTxHash = `0x${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36).substring(0, 8)}`;
        resolve({ tokenId: fakeTokenId, txHash: fakeTxHash });
      }, 2000);
    });
  };

  // Handle start mint (buka popup)
  const handleStartMint = (item: IjazahData) => {
    if (item.status === 'Minted') {
      alert('Ijazah ini sudah di-mint!');
      return;
    }
    
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
      await simulateIPFSUpload();
      
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
  // === END FUNGSI POPUP MINT ===

  // Handle delete ijazah - HANYA UNTUK STATUS PENDING
  const handleDelete = (id: number, nama: string, status: 'Minted' | 'Pending') => {
    // Cek jika status Minted, tidak boleh dihapus
    if (status === 'Minted') {
      alert('❌ Data yang sudah di-mint (Minted) tidak dapat dihapus!\n\nAlasan: Data sudah tercatat di blockchain dan tidak dapat diubah.');
      return;
    }
    
    if (confirm(`Apakah Anda yakin ingin menghapus data ijazah ${nama}?\n\nStatus: ${status}`)) {
      try {
        deleteIjazah(id);
        // Trigger update untuk komponen lain
        window.dispatchEvent(new Event('ijazahDataUpdated'));
        alert(`✅ Data ijazah ${nama} berhasil dihapus!`);
      } catch (error) {
        console.error('Error deleting ijazah:', error);
        alert('❌ Gagal menghapus data ijazah');
      }
    }
  };

  // Options untuk filter
  const prodiOptions = ['Semua', 'Informatika', 'Sistem Informasi', 'Teknik Elektro', 'Manajemen'];
  const tahunOptions = ['Semua', '2024', '2025', '2026', '2027', '2028', '2029'];
  const statusOptions = ['Semua', 'Minted', 'Pending'];

  const mintedCount = ijazahData.filter(item => item.status === 'Minted').length;
  const pendingCount = ijazahData.filter(item => item.status === 'Pending').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data ijazah...</p>
        </div>
      </div>
    );
  }

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

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Ijazah Mahasiswa</h1>
        <p className="text-gray-600 mt-1">Kelola dan monitor semua data ijazah yang telah diupload</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ijazah</p>
              <p className="text-2xl font-bold text-gray-800">{ijazahData.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">📄</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sudah Minted</p>
              <p className="text-2xl font-bold text-green-600">{mintedCount}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">✅</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Mint</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-lg">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Token ID</p>
              <p className="text-2xl font-bold text-purple-600">{ijazahData.length}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-lg">🪙</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Filter Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Program Studi Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Studi
            </label>
            <select
              value={filterProdi}
              onChange={(e) => setFilterProdi(e.target.value === 'Semua' ? '' : e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              {prodiOptions.map(prodi => (
                <option key={prodi} value={prodi}>
                  {prodi}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun Lulus
            </label>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value === 'Semua' ? '' : e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              {tahunOptions.map(tahun => (
                <option key={tahun} value={tahun}>
                  {tahun}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status SBT
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value === 'Semua' ? '' : e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Search NPM/Nama */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search (NPM/Nama)
            </label>
            <input
              type="text"
              value={searchNpm}
              onChange={(e) => setSearchNpm(e.target.value)}
              placeholder="Cari berdasarkan NPM atau Nama Mahasiswa..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Reset Filter Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              setFilterProdi('');
              setFilterTahun('');
              setFilterStatus('');
              setSearchNpm('');
            }}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            Reset Semua Filter
          </button>
        </div>

        {/* Results Info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Menampilkan <span className="text-blue-600">{filteredData.length}</span> dari <span className="text-gray-900">{ijazahData.length}</span> ijazah
            </span>
            <div className="flex items-center space-x-3 mt-2 md:mt-0">
              <span className="text-sm text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Minted: {mintedCount}
              </span>
              <span className="text-sm text-gray-600 flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Pending: {pendingCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
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
                  Status SBT
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detail
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <>
                  <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                    {/* No */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    
                    {/* Nama Mahasiswa */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.namaMahasiswa}</div>
                      <div className="text-xs text-gray-500">NIK: {item.nik}</div>
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
                    
                    {/* Status SBT */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Minted' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    
                    {/* Detail */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleExpandRow(item.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        {expandedRow === item.id ? "Sembunyikan" : "Lihat Detail"}
                      </button>
                    </td>
                    
                    {/* Aksi */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        {item.status === 'Pending' ? (
                          <>
                            <button
                              onClick={() => handleStartMint(item)}
                              className="text-green-600 hover:text-green-900 font-medium"
                              title="Mint SBT (Simulasi)"
                            >
                              Mint
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.namaMahasiswa, item.status)}
                              className="text-red-600 hover:text-red-900 font-medium"
                              title="Hapus data ijazah"
                            >
                              Hapus
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-sm" title="Data sudah di-mint ke blockchain dan tidak dapat diubah">
                            Immutable
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Row (Detail Lengkap) */}
                  {expandedRow === item.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-white rounded-lg border">
                          {/* Kolom Kiri */}
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Mahasiswa Lengkap</h4>
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
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Blockchain & Sistem</h4>
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
                                  <p className="text-gray-500 text-sm">Status SBT</p>
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      item.status === 'Minted' 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {item.status}
                                    </span>
                                    {item.status === 'Pending' ? (
                                      <button
                                        onClick={() => handleStartMint(item)}
                                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                                      >
                                        Mint SBT (Simulasi)
                                      </button>
                                    ) : (
                                      <span className="text-sm text-gray-500">
                                        (Immutable - tidak dapat diubah)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t">
                              <div className="flex space-x-3">
                                {item.status === 'Pending' ? (
                                  <>
                                    <button
                                      onClick={() => handleStartMint(item)}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                                    >
                                      Mint SBT
                                    </button>
                                    <button
                                      onClick={() => handleDelete(item.id, item.namaMahasiswa, item.status)}
                                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                                    >
                                      Hapus Data
                                    </button>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(item.tokenID);
                                        alert('Token ID berhasil disalin!');
                                      }}
                                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
                                    >
                                      Salin Token ID
                                    </button>
                                  </>
                                ) : (
                                  <div className="w-full">
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                      <div className="flex items-start">
                                        <div className="text-gray-500 mr-2">🔒</div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Data Terproteksi</p>
                                          <p className="text-xs text-gray-500">
                                            Data sudah di-mint ke blockchain dan tidak dapat diubah/dihapus
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
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
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📄</div>
            <p className="text-gray-500 text-lg mb-2">
              {ijazahData.length === 0 
                ? "Belum ada data ijazah. Mulai tambah data ijazah baru." 
                : "Tidak ada data ijazah yang sesuai dengan filter"}
            </p>
            {ijazahData.length === 0 ? (
              <a
                href="/upload-ijazah" // Ganti dengan path upload yang sesuai
                className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + Tambah Data Ijazah
              </a>
            ) : (
              <button
                onClick={() => {
                  setFilterProdi('');
                  setFilterTahun('');
                  setFilterStatus('');
                  setSearchNpm('');
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Reset semua filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Aturan Data Ijazah</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Status Pending</strong>: Data dapat diubah dan dihapus</li>
              <li>• <strong>Status Minted</strong>: Data sudah tercatat di blockchain</li>
              <li>• <span className="font-bold text-red-600">❌ Tidak bisa diubah dari Minted → Pending</span></li>
              <li>• <span className="font-bold text-red-600">❌ Data Minted tidak bisa dihapus</span></li>
              <li>• <span className="font-bold text-green-600">✅ Hanya bisa dari Pending → Minted (sekali seumur hidup)</span></li>
              <li>• Data yang sudah di-mint bersifat immutable (tidak dapat diubah)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}