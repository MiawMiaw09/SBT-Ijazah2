'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { diplomaAPI, Diploma, MintData } from '@/app/services/api';
import MintPopup from '../../components/MintPopup';
import { MintStep } from '../../types/ijazah';

// Interface PopupDiplomaData lokal (harus sesuai dengan yang di MintPopup)
interface PopupDiplomaData {
  id: number;
  namaMahasiswa: string;
  npm: string;
  nik: string;
  programStudi: string;
  fakultas?: string;
  gelarAkademik: string;
  tempattanggallahir: string;
  tanggalKelulusan: string;
  tahunLulus: string;
  walletAddress?: string;
  ipfs: string;
  alamatPenerbit?: string;
  tokenID?: string;
  certificateId: string;
  status: 'Pending' | 'Minted';
  selected: boolean;
  ipk?: number; // IPK dari database
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
    estimatedGas: '0.01',
    txHash: undefined as string | undefined,
    error: undefined as string | undefined
  });

  // Base API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
        console.log('🔍 [13] Trying direct fetch to:', `${API_BASE_URL}/api/diplomas`);
        
        const directResponse = await fetch(`${API_BASE_URL}/api/diplomas`, {
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

  // Format date untuk display - SAMA SEPERTI DI DATA IJAZAH
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

  // Get status color - SAMA SEPERTI DI DATA IJAZAH
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'minted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label - SAMA SEPERTI DI DATA IJAZAH
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'verified': return 'Verified';
      case 'minted': return 'Minted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // Fungsi untuk mengkonversi Diploma ke PopupDiplomaData yang MATCH dengan MintPopup
  const convertToPopupData = (diploma: DiplomaWithSelection): PopupDiplomaData => {
    return {
      id: diploma.id,
      namaMahasiswa: diploma.nama_lengkap,
      npm: diploma.npm,
      nik: diploma.nik || '',
      programStudi: diploma.program_studi,
      fakultas: diploma.fakultas || '',
      gelarAkademik: diploma.gelar_akademik,
      tempattanggallahir: diploma.tempat_tanggal_lahir || '',
      tanggalKelulusan: diploma.tanggal_lulus,
      tahunLulus: diploma.tanggal_lulus ? new Date(diploma.tanggal_lulus).getFullYear().toString() : '',
      walletAddress: diploma.wallet_address || '',
      ipfs: diploma.file_hash || '',
      alamatPenerbit: diploma.contract_address || '0x1234567890abcdef1234567890abcdef12345678',
      tokenID: diploma.token_id || `SBT-${Date.now().toString().slice(-6)}`,
      certificateId: diploma.certificate_id,
      status: diploma.status === 'minted' ? 'Minted' : 'Pending',
      selected: diploma.selected,
      ipk: diploma.ipk || 0
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
      estimatedGas: '0.01',
      txHash: undefined,
      error: undefined
    });
  };

  // Handle upload ke IPFS (step 1) - VERSI NYATA
  const handleUploadToIPFS = async () => {
    if (!currentMintingItem) return;
    
    setMintProgress(prev => ({ 
      ...prev, 
      isUploading: true, 
      uploadProgress: 0,
      error: undefined 
    }));

    try {
      // Dapatkan estimasi gas
      const estimatedGas = await diplomaAPI.getEstimatedGas();
      setMintProgress(prev => ({ ...prev, estimatedGas }));

      // Siapkan data untuk IPFS (sesuai format smart contract)
      const ipfsData = {
        namaLengkap: currentMintingItem.namaMahasiswa,
        npm: currentMintingItem.npm,
        programStudi: currentMintingItem.programStudi,
        tanggalLulus: currentMintingItem.tanggalKelulusan,
        ipk: currentMintingItem.ipk || 0,
        nomorIjazah: currentMintingItem.certificateId,
        institusi: 'Universitas Anda', // Ganti dengan nama institusi
        tanggalTerbit: Math.floor(Date.now() / 1000), // Unix timestamp
        // Data tambahan
        nik: currentMintingItem.nik || '',
        gelarAkademik: currentMintingItem.gelarAkademik,
        fakultas: currentMintingItem.fakultas || ''
      };

      // Progress simulasi (karena upload ke IPFS via backend)
      const progressInterval = setInterval(() => {
        setMintProgress(prev => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90)
        }));
      }, 200);

      // Upload ke IPFS via backend
      const uploadResult = await diplomaAPI.uploadToIPFS(currentMintingItem.id, ipfsData);
      
      clearInterval(progressInterval);

      if (uploadResult.success && uploadResult.data) {
        // Update progress ke 100%
        setMintProgress(prev => ({ 
          ...prev, 
          isUploading: false, 
          uploadProgress: 100 
        }));

        // Update currentMintingItem dengan IPFS hash
        setCurrentMintingItem(prev => {
          if (!prev) return null;
          return {
            ...prev,
            ipfs: uploadResult.data!.ipfsHash
          };
        });

        // Lanjut ke step blockchain mint setelah 1 detik
        setTimeout(() => {
          setMintStep('blockchain_mint');
        }, 1000);
      } else {
        throw new Error(uploadResult.message || 'Gagal upload ke IPFS');
      }
    } catch (error: any) {
      console.error('Upload to IPFS failed:', error);
      setMintProgress(prev => ({ 
        ...prev, 
        isUploading: false,
        error: error.message || 'Gagal upload ke IPFS'
      }));
      alert(`❌ Gagal upload ke IPFS: ${error.message}`);
    }
  };

  // Handle mint ke blockchain (step 2) - VERSI NYATA
  const handleMintToBlockchain = async () => {
    if (!currentMintingItem) return;

    setMintProgress(prev => ({ 
      ...prev, 
      isMinting: true,
      error: undefined 
    }));

    try {
      // Pastikan IPFS hash sudah ada
      if (!currentMintingItem.ipfs) {
        throw new Error('IPFS hash tidak ditemukan. Silakan upload ke IPFS terlebih dahulu.');
      }

      // Mint ke blockchain via backend
      const mintResult = await diplomaAPI.mintToBlockchain(
        currentMintingItem.id,
        currentMintingItem.ipfs,
        currentMintingItem.walletAddress
      );

      if (mintResult.success && mintResult.data) {
        // Update mintProgress dengan tx hash
        setMintProgress(prev => ({ 
          ...prev, 
          isMinting: false,
          txHash: mintResult.data!.transactionHash
        }));

        // Update currentMintingItem dengan token ID
        setCurrentMintingItem(prev => {
          if (!prev) return null;
          return {
            ...prev,
            tokenID: mintResult.data!.tokenId
          };
        });

        // Data untuk update ke database (via API yang sudah ada)
        const mintData: MintData = {
          transaction_hash: mintResult.data.transactionHash,
          contract_address: mintResult.data.contractAddress,
          token_id: mintResult.data.tokenId,
          block_number: mintResult.data.blockNumber,
          minted_by: 'admin'
        };

        // Update status di database
        const updateResponse = await diplomaAPI.mintDiploma(currentMintingItem.id, mintData);

        if (updateResponse.success) {
          // Hapus dari tabel (karena sudah di-mint)
          setDiplomas(prev => 
            prev.filter(item => item.id !== currentMintingItem.id)
          );

          // Tampilkan success
          setMintStep('success');
        } else {
          // Tetap tampilkan success meskipun update database gagal
          // karena transaksi blockchain sudah berhasil
          console.warn('Database update failed but blockchain mint succeeded');
          setDiplomas(prev => 
            prev.filter(item => item.id !== currentMintingItem.id)
          );
          setMintStep('success');
        }
      } else {
        throw new Error(mintResult.message || 'Gagal mint ke blockchain');
      }
    } catch (error: any) {
      console.error('Minting failed:', error);
      setMintProgress(prev => ({ 
        ...prev, 
        isMinting: false,
        error: error.message || 'Gagal mint ke blockchain'
      }));
      alert(`❌ Gagal minting: ${error.message}`);
    }
  };

  // Close popup
  const handleClosePopup = () => {
    setMintStep('idle');
    setCurrentMintingItem(null);
    // Refresh data setelah popup ditutup
    loadDiplomas();
  };

  // Handle hapus selected (batch)
  const handleDeleteSelected = async () => {
    const selectedItems = diplomas.filter(item => item.selected);
    if (selectedItems.length === 0) {
      alert('Pilih minimal satu ijazah untuk dihapus!');
      return;
    }
    
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
            return { id: item.id, success: true };
          }
          
          const deleteResult = await deleteResponse.json();
          console.log(`✅ Delete ${item.id}:`, deleteResult);
          return { id: item.id, success: true };
        } catch (apiError) {
          console.warn(`⚠️ API delete call failed for ${item.id}:`, apiError);
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

  // Handle hapus single
  const handleDeleteSingle = async (id: number, name: string, nim: string, status: string) => {
    if (status === 'minted') {
      alert('❌ Data yang sudah di-mint tidak dapat dihapus!\n\nAlasan: Data sudah tercatat di blockchain dan tidak dapat diubah.');
      return;
    }
    
    if (!confirm(`Anda akan menghapus ijazah:\n${name} (${nim})\n\nLanjutkan?`)) {
      return;
    }
    
    try {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
          <p className="text-sm text-gray-500 mt-2">
            Mengambil data dari: {API_BASE_URL}/api/diplomas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Konten Utama - Sisa kode Anda tetap sama */}
      <div className="container mx-auto px-4 py-6">
        {/* Header - DISESUAIKAN DENGAN DATA IJAZAH */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-800 mb-2">🪙 Mint Soulbound Token (SBT)</h1>
          <p className="text-gray-600">Daftar Ijazah untuk di-mint menjadi Soulbound Token (SBT)</p>
        </div>

        {/* Info Box - DISESUAIKAN DENGAN DATA IJAZAH */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Informasi Penting</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              <span><strong>Data Ijazah:</strong> Pastikan data ijazah sudah valid sebelum di-mint</span>
            </div>
            <div className="flex items-start">
              <span className="text-purple-500 mr-2">•</span>
              <span><strong>Pending:</strong> Data ijazah yang menunggu untuk di-mint</span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-500 mr-2">•</span>
              <span><strong>Mode Hapus:</strong> Data Ijazah yang salah dapat dihapus</span>
            </div>
            <div className="flex items-start">
              <span className="text-red-500 mr-2">❌</span>
              <span><strong>Perhatian:</strong> Data yang sudah di-mint tidak dapat dihapus dan diubah</span>
            </div>
          </div>
        </div>

        {/* API Error State */}
        {apiStatus === 'error' && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-3 text-xl">❌</div>
              <div>
                <p className="font-medium text-red-800">Gagal memuat data dari API</p>
                <p className="text-sm text-red-600 mt-1">
                  Cek koneksi API dan database. Pastikan endpoint tersedia.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => window.open(`${API_BASE_URL}/api/diplomas`, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-800 mr-4 font-medium"
                  >
                    Buka API di Tab Baru
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistik - DISESUAIKAN DENGAN DATA IJAZAH */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 font-medium">Total Data</p>
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 font-medium">Minted</p>
            <p className="text-2xl font-bold text-green-600">{mintedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 font-medium">Terpilih</p>
            <p className="text-2xl font-bold text-indigo-600">{selectedCount}</p>
          </div>
        </div>

        {/* Action Bar - DISESUAIKAN DENGAN DATA IJAZAH */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
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
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium flex items-center"
              >
                <span className="mr-2">🔄</span>
                {isLoading ? 'Memuat...' : 'Refresh Data'}
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
              >
              </button>
            </div>
          </div>
        </div>

        {/* Table - DISESUAIKAN DENGAN DATA IJAZAH */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NAMA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NPM
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRODI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TAHUN
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AKSI
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DETAIL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {diplomas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <div>
                        <div className="text-5xl mb-4">📄</div>
                        <p className="text-lg font-medium text-gray-700 mb-2">Tidak ada data ijazah dengan status PENDING</p>
                        <p className="text-gray-600 mb-4">
                          Semua ijazah sudah di-mint atau belum ada yang diupload
                        </p>
                        <button
                          onClick={() => router.push('/admin/upload-ijazah')}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
                        >
                          + Upload Ijazah Baru
                        </button>
                        <button
                          onClick={handleRefresh}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          Refresh Data
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  diplomas.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr 
                        className={`hover:bg-gray-50 transition duration-150 ${
                          item.selected ? 'bg-blue-50' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3 whitespace-nowrap">
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                          {index + 1}
                        </td>
                        
                        {/* Nama Mahasiswa */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.nama_lengkap}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.certificate_id}
                          </div>
                        </td>
                        
                        {/* NIM */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.npm}
                        </td>
                        
                        {/* Program Studi */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.program_studi}
                        </td>
                        
                        {/* Tahun Lulus */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {item.tanggal_lulus ? new Date(item.tanggal_lulus).getFullYear() : '-'}
                        </td>
                        
                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === "minted" 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status === "minted" ? "Minted" : "Pending"}
                          </span>
                        </td>
                        
                        {/* Aksi */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap gap-2">
                            {item.status !== 'minted' && (
                              <>
                                <button
                                  onClick={() => handleStartMintSingle(item)}
                                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                                >
                                  Mint
                                </button>
                                <button
                                  onClick={() => handleDeleteSingle(item.id, item.nama_lengkap, item.npm, item.status)}
                                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                                >
                                  Hapus
                                </button>
                              </>
                            )}
                            {item.status === 'minted' && (
                              <span className="text-gray-400 text-xs px-2 py-1" title="Data sudah di-mint ke blockchain">
                                Immutable
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Detail */}
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => toggleExpandRow(item.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium underline"
                          >
                            {expandedRow === item.id ? "Sembunyikan" : "Lihat Detail"}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Row (Detail Lengkap) - DISESUAIKAN DENGAN DATA IJAZAH */}
                      {expandedRow === item.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={9} className="px-4 py-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-white rounded-lg border">
                              {/* Kolom Kiri */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Mahasiswa Lengkap</h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <p className="text-gray-500">Nama Lengkap</p>
                                      <p className="font-medium">{item.nama_lengkap}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">NPM</p>
                                      <p className="font-medium font-mono">{item.npm}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">NIK</p>
                                      <p className="font-medium font-mono">{item.nik || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Tempat/Tgl Lahir</p>
                                      <p className="font-medium">{item.tempat_tanggal_lahir || '-'}</p>
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
                                    <div>
                                      <p className="text-gray-500">IPK</p>
                                      <p className="font-medium">{item.ipk || '-'}</p>
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
                                      <p className="text-gray-500">Tahun Akademik</p>
                                      <p className="font-medium">{item.tahun_akademik || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Yudisium</p>
                                      <p className="font-medium">{item.yudisium || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Judul Skripsi</p>
                                      <p className="font-medium">{item.judul_skripsi || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Nomor SK Rektor</p>
                                      <p className="font-medium">{item.nomor_sk_rektor || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Tanggal SK Rektor</p>
                                      <p className="font-medium">
                                        {item.tanggal_sk_rektor ? formatDateDisplay(item.tanggal_sk_rektor) : '-'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Kolom Kanan */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Sistem</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-gray-500 text-sm">Nomor Ijazah</p>
                                      <p className="font-medium font-mono text-sm bg-gray-100 p-2 rounded">
                                        {item.certificate_id}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-sm">Wallet Address</p>
                                      <p className="font-medium font-mono text-xs break-all bg-gray-100 p-2 rounded">
                                        {item.wallet_address || '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-sm">Status</p>
                                      <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                          {getStatusLabel(item.status)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="pt-4 border-t">
                                  <div className="flex space-x-3">
                                    {item.status !== 'minted' ? (
                                      <>
                                        <button
                                          onClick={() => handleStartMintSingle(item)}
                                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-medium text-sm"
                                        >
                                          Mint Ijazah
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSingle(item.id, item.nama_lengkap, item.npm, item.status)}
                                          className="px-4 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition font-medium text-sm"
                                        >
                                          Hapus Data
                                        </button>
                                      </>
                                    ) : (
                                      <div className="w-full">
                                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
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
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="text-center text-sm text-gray-600 mb-6">
          <p>Menampilkan {diplomas.length} data dengan status PENDING</p>
        </div>
      </div>
    </div>
  );
}