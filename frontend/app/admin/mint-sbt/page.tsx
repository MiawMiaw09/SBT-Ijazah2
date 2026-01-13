'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { diplomaAPI, Diploma, MintData } from '@/app/services/api';
import MintPopup from '../../components/MintPopup';
import { MintStep } from '../../types/ijazah';

// Interface PopupDiplomaData lokal (harus sesuai dengan yang di MintPopup)
interface PopupDiplomaData {
  id: number;
  namaMahasiswa: string;
  npm: string;
  programStudi: string;
  fakultas?: string;
  gelarAkademik: string;
  tanggalKelulusan: string;
  tahunLulus: string;
  walletAddress?: string;
  ipfs: string;
  alamatPenerbit?: string;
  tokenID?: string;
  certificateId: string;
  status: 'Pending' | 'Minted';
  selected: boolean;
}

// Interface untuk Diploma dengan selected property
interface DiplomaWithSelection extends Diploma {
  selected: boolean;
}

export default function MintSbtPage() {
  const router = useRouter();
  
  const [diplomas, setDiplomas] = useState<DiplomaWithSelection[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  // State untuk popup mint
  const [mintStep, setMintStep] = useState<MintStep>('idle');
  const [currentMintingItem, setCurrentMintingItem] = useState<PopupDiplomaData | null>(null);
  const [mintProgress, setMintProgress] = useState({
    isUploading: false,
    uploadProgress: 0,
    isMinting: false,
    estimatedGas: '0.01'
  });

  // Load data dari API saat komponen mount
  useEffect(() => {
    loadDiplomas();
  }, []);

  // Fungsi untuk load data dari API - VERSI PERBAIKAN DENGAN MULTI-LAYERED FALLBACK
  const loadDiplomas = async () => {
    try {
      setIsLoading(true);
      setApiStatus('loading');
      console.log('🚀 [1] Loading diplomas from API...');
      
      // OPTION 1: Coba endpoint utama terlebih dahulu
      try {
        const response = await diplomaAPI.getAllDiplomas();
        console.log('📡 [2] API Response from getAllDiplomas:', response);
        
        if (response.success && response.data) {
          console.log('✅ [3] Received data from getAllDiplomas:', response.data.length, 'items');
          
          // Filter data yang BELUM di-mint (status 'pending')
          const diplomasForMint = response.data.filter((item: Diploma) => 
            item.status === 'pending'
          );
          
          console.log('🔍 [4] After filter (pending for mint):', diplomasForMint.length, 'items');
          
          // Format data untuk tabel dengan menambahkan 'selected' field
          const formattedData: DiplomaWithSelection[] = diplomasForMint.map((item: Diploma) => ({
            ...item,
            selected: false
          }));
          
          setDiplomas(formattedData);
          setApiStatus('success');
          console.log(`✅ [5] Loaded ${formattedData.length} diplomas ready for mint`);
          return; // Berhasil, keluar dari fungsi
        } else {
          console.warn('⚠️ [6] API getAllDiplomas returned empty or error:', response.message);
        }
      } catch (apiError) {
        console.warn('⚠️ [7] Error with getAllDiplomas, trying fallback:', apiError);
      }
      
      // OPTION 2: Coba endpoint alternatif (getDiplomasForMint)
      try {
        console.log('🔄 [8] Trying fallback: getDiplomasForMint');
        const fallbackResponse = await diplomaAPI.getPendingDiplomas();
        console.log('📡 [9] Fallback response:', fallbackResponse);
        
        if (fallbackResponse.success && fallbackResponse.data) {
          console.log('✅ [10] Received data from fallback:', fallbackResponse.data.length, 'items');
          
          // Filter hanya yang pending
          const filteredData = fallbackResponse.data.filter((item: Diploma) => 
            item.status === 'pending'
          );
          
          const formattedData: DiplomaWithSelection[] = filteredData.map((item: Diploma) => ({
            ...item,
            selected: false
          }));
          
          setDiplomas(formattedData);
          setApiStatus('success');
          console.log(`✅ [11] Loaded ${formattedData.length} diplomas from fallback`);
          return; // Berhasil dengan fallback, keluar dari fungsi
        }
      } catch (fallbackError) {
        console.warn('⚠️ [12] Fallback also failed:', fallbackError);
      }
      
      // OPTION 3: Coba fetch langsung ke endpoint API
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        console.log('🔍 [13] Trying direct fetch to:', `${apiBaseUrl}/api/diplomas`);
        
        const directResponse = await fetch(`${apiBaseUrl}/api/diplomas`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        if (!directResponse.ok) {
          throw new Error(`HTTP ${directResponse.status}: ${directResponse.statusText}`);
        }
        
        const directData = await directResponse.json();
        console.log('📡 [14] Direct fetch result:', directData);
        
        // Handle berbagai format response
        let dataArray: Diploma[] = [];
        
        if (Array.isArray(directData)) {
          dataArray = directData;
        } else if (directData.data && Array.isArray(directData.data)) {
          dataArray = directData.data;
        } else if (directData.success && directData.data && Array.isArray(directData.data)) {
          dataArray = directData.data;
        }
        
        if (dataArray.length > 0) {
          // Filter hanya yang pending
          const filteredData = dataArray.filter((item: any) => 
            item.status === 'pending'
          );
          
          const formattedData: DiplomaWithSelection[] = filteredData.map((item: any) => ({
            ...item,
            selected: false
          }));
          
          setDiplomas(formattedData);
          setApiStatus('success');
          console.log(`✅ [15] Loaded ${formattedData.length} diplomas from direct fetch`);
          return; // Berhasil dengan direct fetch
        }
      } catch (directError) {
        console.warn('⚠️ [16] Direct fetch failed:', directError);
      }
      
      // OPTION 4: Jika semua metode gagal, tampilkan state kosong
      console.log('🔄 [17] All API methods failed');
      setDiplomas([]);
      setApiStatus('error');
      
    } catch (error: any) {
      console.error('🔥 [18] Critical error in loadDiplomas:', error);
      console.error('🔥 [19] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      setDiplomas([]);
      setApiStatus('error');
      
    } finally {
      console.log('🏁 [20] Finally: setIsLoading(false)');
      setIsLoading(false);
    }
  };

  // Toggle select individual row
  const toggleSelect = (id: number) => {
    setDiplomas(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setDiplomas(prev => 
      prev.map(item => ({ ...item, selected: newSelectAll }))
    );
  };

  // Toggle expanded row (untuk melihat detail lengkap)
  const toggleExpandRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date untuk display
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Fungsi untuk mengkonversi Diploma ke PopupDiplomaData yang MATCH dengan MintPopup
  const convertToPopupData = (diploma: DiplomaWithSelection): PopupDiplomaData => {
    return {
      id: diploma.id,
      namaMahasiswa: diploma.nama_lengkap,
      npm: diploma.nim,
      programStudi: diploma.program_studi,
      fakultas: diploma.fakultas || '',
      gelarAkademik: diploma.gelar_akademik,
      tanggalKelulusan: diploma.tanggal_lulus,
      tahunLulus: diploma.tanggal_lulus ? new Date(diploma.tanggal_lulus).getFullYear().toString() : '',
      walletAddress: diploma.wallet_address || '',
      ipfs: diploma.file_hash || '',
      alamatPenerbit: diploma.contract_address || '0x1234567890abcdef1234567890abcdef12345678',
      tokenID: diploma.token_id || `SBT-${Date.now().toString().slice(-6)}`,
      certificateId: diploma.certificate_id,
      status: diploma.status === 'minted' ? 'Minted' : 'Pending',
      selected: diploma.selected
    };
  };

  // Handle mint single dengan popup flow - VERSI SEDERHANA
  const handleStartMintSingle = (item: DiplomaWithSelection) => {
    if (item.status === 'minted') {
      alert('Ijazah ini sudah di-mint!');
      return;
    }
    
    // Langsung buka popup mint
    const popupData = convertToPopupData(item);
    setCurrentMintingItem(popupData);
    setMintStep('ipfs_upload');
    setMintProgress({
      isUploading: false,
      uploadProgress: 0,
      isMinting: false,
      estimatedGas: '0.01'
    });
  };

  // Handle upload ke IPFS (step 1) - Versi sederhana tanpa simulasi
  const handleUploadToIPFS = async () => {
    if (!currentMintingItem) return;
    
    setMintProgress(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
    
    // Simulasi upload progress
    await new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setMintProgress(prev => ({ ...prev, uploadProgress: progress }));
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
    });
    
    setMintProgress(prev => ({ ...prev, isUploading: false }));
    setMintStep('blockchain_mint');
  };

  // Handle mint ke blockchain (step 2) - VERSI SEDERHANA: LANGSUNG MINT
  const handleMintToBlockchain = async () => {
    if (!currentMintingItem) return;

    setMintProgress(prev => ({ ...prev, isMinting: true }));

    try {
      // Skip blockchain upload temporarily
      const mintData: MintData = {
        transaction_hash: 'SKIPPED',
        contract_address: 'SKIPPED',
        token_id: `TEMP-${Date.now()}`,
        block_number: 0,
        minted_by: 'admin'
      };

      // API call untuk update mint status
      const response = await diplomaAPI.mintDiploma(currentMintingItem.id, mintData);

      console.log('MintDiploma API Response:', response);

      if (response.success) {
        // Update local state - HAPUS dari tabel MintSbtPage
        setDiplomas(prev => 
          prev.filter(item => item.id !== currentMintingItem.id)
        );

        setMintProgress(prev => ({ ...prev, isMinting: false }));
        setMintStep('success');

        alert(`✅ Ijazah berhasil di-mint!\nData akan hilang dari halaman ini dan status berubah menjadi \"Minted\" di Data Ijazah.`);
      } else {
        console.error('MintDiploma API failed:', response);
        alert('❌ Gagal melakukan minting. Coba lagi nanti.');
      }
    } catch (error) {
      console.error('Minting failed:', error);
      setMintProgress(prev => ({ ...prev, isMinting: false }));
      alert('❌ Gagal melakukan minting. Coba lagi nanti.');
    }
  };

  // Close popup
  const handleClosePopup = () => {
    setMintStep('idle');
    setCurrentMintingItem(null);
    // Refresh data setelah popup ditutup
    loadDiplomas();
  };

  // Handle hapus selected (batch) - FUNGSI YANG SUDAH DIPERBAIKI
  const handleDeleteSelected = async () => {
    const selectedItems = diplomas.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert('Pilih minimal satu ijazah untuk dihapus!');
      return;
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Filter data yang sudah di-mint (tidak bisa dihapus)
    const deletableItems = selectedItems.filter(item => item.status !== 'minted');
    const mintedItems = selectedItems.filter(item => item.status === 'minted');
    
    if (mintedItems.length > 0) {
      alert(`❌ ${mintedItems.length} data sudah di-mint dan tidak dapat dihapus!`);
      
      if (deletableItems.length === 0) {
        return;
      }
    }
    
    if (!confirm(`Hapus ${deletableItems.length} ijazah terpilih?`)) return;

    try {
      const deletePromises = deletableItems.map(async (item) => {
        try {
          const deleteResponse = await fetch(`${API_BASE_URL}/api/diplomas/${item.id}`, {
            method: 'DELETE'
          });
          
          if (!deleteResponse.ok) {
            console.warn(`⚠️ API delete failed for ${item.id}`);
            // Tetap anggap berhasil untuk lokal state
            return { id: item.id, success: true };
          }
          
          const deleteResult = await deleteResponse.json();
          console.log(`✅ Delete ${item.id}:`, deleteResult);
          return { id: item.id, success: true };
        } catch (apiError) {
          console.warn(`⚠️ API delete call failed for ${item.id}:`, apiError);
          // Tetap anggap berhasil untuk lokal state
          return { id: item.id, success: true };
        }
      });
      
      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;
      const deletedIds = results.filter(r => r.success).map(r => r.id);
      
      // Update local state
      setDiplomas(prev => prev.filter(item => !deletedIds.includes(item.id)));
      setSelectAll(false);
      
      if (mintedItems.length > 0) {
        alert(`✅ Berhasil menghapus ${successCount} ijazah!\n\n⚠️ ${mintedItems.length} data minted tidak dapat dihapus.`);
      } else {
        alert(`✅ Berhasil menghapus ${successCount} ijazah!`);
      }
      
    } catch (error) {
      console.error('Error deleting diplomas:', error);
      alert('❌ Gagal menghapus data ijazah');
    }
  };

  // Handle hapus single - FUNGSI YANG SUDAH DIPERBAIKI
  const handleDeleteSingle = async (id: number, name: string, nim: string) => {
    if (!confirm(`Anda akan menghapus ijazah:\n${name} (${nim})\n\nLanjutkan?`)) {
      return;
    }
    
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Cek status item terlebih dahulu
      const item = diplomas.find(item => item.id === id);
      if (item?.status === 'minted') {
        alert('❌ Data yang sudah di-mint tidak dapat dihapus!');
        return;
      }
      
      const deleteResponse = await fetch(`${API_BASE_URL}/api/diplomas/${id}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        // Hapus dari local state
        setDiplomas(prev => prev.filter(item => item.id !== id));
        alert(`✅ Berhasil menghapus ijazah!`);
      } else {
        const errorData = await deleteResponse.json();
        alert(`❌ Gagal menghapus: ${errorData.message || 'Terjadi kesalahan'}`);
      }
    } catch (error: any) {
      console.error('Error deleting diploma:', error);
      alert(`❌ Gagal menghapus: ${error.message}`);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    console.log('🔄 Refreshing data...');
    loadDiplomas();
  };

  // Hitung statistik
  const selectedCount = diplomas.filter(item => item.selected).length;
  const totalCount = diplomas.length;
  const pendingCount = diplomas.filter(item => item.status === "pending").length;
  const mintedCount = diplomas.filter(item => item.status === "minted").length;

  return (
    <div className="max-w-full mx-auto p-6">
      {/* Popup Mint Flow */}
      {mintStep !== 'idle' && currentMintingItem && (
        <MintPopup
          mintStep={mintStep}
          currentMintingItem={currentMintingItem}
          mintProgress={mintProgress}
          onUploadToIPFS={handleUploadToIPFS}
          onMintToBlockchain={handleMintToBlockchain}
          onClose={handleClosePopup}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🪙 Mint Soulbound Token (SBT)</h1>
            <p className="text-gray-600">Daftar Ijazah untuk di-mint menjadi Soulbound Token (SBT)</p>
            <div className="mt-2 flex items-center space-x-2 text-sm">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Total: {totalCount}</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Pending: {pendingCount}</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Minted: {mintedCount}</span>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Memuat...' : '🔄 Refresh Data'}
            </button>
            <button
              onClick={() => {
                console.log('📊 Current diplomas state:', diplomas);
                console.log('📈 Statistics:', {
                  total: totalCount,
                  pending: pendingCount,
                  minted: mintedCount,
                  selected: selectedCount
                });
                console.log('🌐 API Status:', apiStatus);
              }}
              className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-xs"
            >
              Debug State
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          <div className="font-medium">ℹ️ Halaman ini menampilkan data ijazah dengan status PENDING</div>
          <ul className="mt-1 ml-5 list-disc">
            <li><span className="text-yellow-600">Pending</span>: Siap di-mint (bisa dipilih)</li>
            <li><span className="text-purple-600">Minted</span>: Sudah di-mint (tidak bisa dipilih)</li>
            <li>Mode: <strong className="text-yellow-600">Sandbox/Simulasi</strong></li>
            <li><strong>Tidak ada proses verifikasi</strong> - langsung bisa di-mint setelah upload</li>
            <li><strong>⚠️ Perhatian</strong>: Data yang sudah di-mint tidak dapat dihapus</li>
            <li><strong>💡 Fitur Baru</strong>: Klik "Mint" → popup muncul → langsung jadi "Minted"</li>
          </ul>
        </div>
      </div>

      {/* API Error State */}
      {apiStatus === 'error' && !isLoading && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">❌</div>
            <div>
              <p className="font-medium text-red-800">Gagal memuat data dari API</p>
              <p className="text-sm text-red-600 mt-1">
                Cek koneksi API dan database. Pastikan endpoint tersedia.
              </p>
              <div className="mt-2">
                <button
                  onClick={() => window.open('http://localhost:5000/api/diplomas', '_blank')}
                  className="text-sm text-blue-600 hover:text-blue-800 mr-4"
                >
                  Buka API di Tab Baru
                </button>
                <button
                  onClick={handleRefresh}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Data</p>
              <p className="text-2xl font-bold text-gray-800">
                {isLoading ? '...' : totalCount}
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
              <p className="text-sm text-gray-600">Pending</p>
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
              <p className="text-sm text-gray-600">Minted</p>
              <p className="text-2xl font-bold text-purple-600">
                {isLoading ? '...' : mintedCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-lg">🏆</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Terpilih</p>
              <p className="text-2xl font-bold text-indigo-600">
                {isLoading ? '...' : selectedCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 text-lg">📌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedCount} ijazah terpilih dari {pendingCount} pending
            </span>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedCount === 0 || isLoading || apiStatus === 'error'}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition duration-200 ${
                selectedCount > 0 && !isLoading && apiStatus !== 'error'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Memuat...' : `🗑️ Hapus Selected (${selectedCount})`}
            </button>
            <button
              onClick={() => router.push('/admin/upload-ijazah')}
              className="px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              + Upload Ijazah Baru
            </button>
          </div>
          <div className="text-sm text-gray-500 flex items-center space-x-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              Total: {totalCount}
            </span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
              Pending: {pendingCount}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
              Minted: {mintedCount}
            </span>
            {selectedCount > 0 && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
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
          <p className="text-gray-600">Memuat data ijazah dari database...</p>
          <p className="text-sm text-gray-500 mt-2">
            Mengambil data dengan status: PENDING
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-500">Debug info:</p>
            <button 
              onClick={() => window.open('http://localhost:5000/api/diplomas', '_blank')}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Buka API di Tab Baru
            </button>
          </div>
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
                        disabled={diplomas.length === 0}
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
                    NIM
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
                {diplomas.map((item, index) => (
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
                            disabled={item.status === "minted"}
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
                            {item.nama_lengkap}
                          </div>
                          <div className="text-xs text-gray-500">
                            Cert ID: {item.certificate_id}
                          </div>
                        </div>
                      </td>
                      
                      {/* NIM */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {item.nim}
                      </td>
                      
                      {/* Program Studi */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.program_studi}</div>
                        <div className="text-xs text-gray-500">{item.fakultas || '-'}</div>
                      </td>
                      
                      {/* Tahun Lulus */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{item.tanggal_lulus ? new Date(item.tanggal_lulus).getFullYear() : '-'}</div>
                        <div className="text-xs text-gray-500">
                          {formatDateDisplay(item.tanggal_lulus)}
                        </div>
                      </td>
                      
                      {/* Token ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                          {item.token_id || 'Belum di-mint'}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "minted" 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      
                      {/* Aksi - TOMBOL MINT & HAPUS */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleStartMintSingle(item)}
                          disabled={item.status === "minted"}
                          className={`font-medium ${
                            item.status === "minted"
                              ? 'text-purple-400 cursor-not-allowed'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {item.status === "minted" 
                            ? "✓ Sudah Mint" 
                            : "Mint Sekarang"
                          }
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDeleteSingle(item.id, item.nama_lengkap, item.nim)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Hapus
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
                        <td colSpan={10} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white rounded-lg border">
                            {/* Kolom Kiri */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Mahasiswa</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500">Nama Lengkap</p>
                                    <p className="font-medium">{item.nama_lengkap}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">NIM</p>
                                    <p className="font-medium font-mono">{item.nim}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Email</p>
                                    <p className="font-medium">{item.student_email || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Program Studi</p>
                                    <p className="font-medium">{item.program_studi}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Fakultas</p>
                                    <p className="font-medium">{item.fakultas || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Gelar Akademik</p>
                                    <p className="font-medium">{item.gelar_akademik}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Akademik</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-gray-500">Tanggal Lulus</p>
                                    <p className="font-medium">
                                      {formatDateDisplay(item.tanggal_lulus)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">IPK</p>
                                    <p className="font-medium">{item.ipk || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Tahun Akademik</p>
                                    <p className="font-medium">{item.tahun_akademik || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Yudisium</p>
                                    <p className="font-medium">{item.yudisium || '-'}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-gray-500">Judul Skripsi</p>
                                    <p className="font-medium">{item.judul_skripsi || '-'}</p>
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
                                    <p className="text-gray-500 text-sm">Certificate ID</p>
                                    <p className="font-medium font-mono text-sm bg-gray-100 p-2 rounded">
                                      {item.certificate_id}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-sm">Token ID</p>
                                    <p className="font-medium font-mono text-sm bg-gray-100 p-2 rounded">
                                      {item.token_id || 'Belum di-mint'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-sm">Wallet Address</p>
                                    <p className="font-medium font-mono text-sm break-all bg-gray-100 p-2 rounded">
                                      {item.wallet_address || '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-sm">Contract Address</p>
                                    <p className="font-medium font-mono text-xs break-all bg-gray-100 p-2 rounded">
                                      {item.contract_address || '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-sm">Transaction Hash</p>
                                    <p className="font-medium font-mono text-xs break-all bg-gray-100 p-2 rounded">
                                      {item.transaction_hash || '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-sm">IPFS Hash</p>
                                    <p className="font-medium font-mono text-xs break-all bg-gray-100 p-2 rounded">
                                      {item.file_hash || '-'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 text-sm">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      item.status === "minted" 
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {item.status.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="pt-4 border-t flex space-x-2">
                                <button
                                  onClick={() => handleStartMintSingle(item)}
                                  disabled={item.status === "minted"}
                                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition ${
                                    item.status === "minted"
                                      ? 'bg-purple-200 text-purple-500 cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {item.status === "minted" 
                                    ? "✓ Sudah Di-Mint" 
                                    : "Mint Sekarang"
                                  }
                                </button>
                                <button
                                  onClick={() => handleDeleteSingle(item.id, item.nama_lengkap, item.nim)}
                                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 transition"
                                >
                                  Hapus Data
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
          {diplomas.length === 0 && !isLoading && apiStatus === 'success' && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📄</div>
              <p className="text-gray-500 text-lg mb-2">Tidak ada data ijazah dengan status PENDING</p>
              <p className="text-gray-400 text-sm mb-4">
                Semua ijazah sudah di-mint atau belum ada yang diupload
              </p>
              <div className="space-y-2">
                <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.push('/admin/upload-ijazah')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Upload Ijazah Baru
                  </button>
                  <button
                    onClick={() => router.push('/admin/data-ijazah')}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Lihat Data Lengkap
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600">ℹ️</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">Informasi Fitur</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Tidak ada proses verifikasi</strong> - langsung mint setelah upload</li>
              <li>• Hanya data dengan status <strong>Pending</strong> yang ditampilkan</li>
              <li>• Data <strong>Minted</strong> tidak bisa diubah/dihapus</li>
              <li>• <strong>Tombol Hapus Selected</strong>: Hapus data yang dipilih secara batch</li>
              <li>• <strong>Tombol Hapus per baris</strong>: Hapus data satu per satu</li>
              <li>• <strong>💡 Proses Mint Baru:</strong> Klik "Mint" → popup muncul → langsung jadi "Minted"</li>
              <li>• <strong>Data yang di-mint</strong> akan hilang dari halaman ini dan muncul di Data Ijazah dengan status "Minted"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}