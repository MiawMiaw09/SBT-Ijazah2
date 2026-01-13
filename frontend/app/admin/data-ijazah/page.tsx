'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDateTime } from '@/app/services/api';
import MintPopup from '../../components/MintPopup';
import { MintStep } from '../../types/ijazah';
import { useRouter } from 'next/navigation';

// Interface untuk data ijazah berdasarkan database
interface ExtendedDiploma {
  id: number;
  nama_lengkap: string;
  nim: string;
  program_studi: string;
  gelar_akademik: string;
  fakultas?: string;
  tanggal_lulus: string;
  ipk?: number;
  judul_skripsi?: string;
  tahun_akademik?: string;
  yudisium?: string;
  wallet_address?: string;
  transaction_hash?: string;
  contract_address?: string;
  token_id?: string;
  block_number?: number;
  nama_file: string;
  path_file: string;
  ukuran_file: number;
  tipe_file: string;
  file_hash?: string;
  certificate_id: string;
  status: 'pending' | 'verified' | 'minted' | 'rejected';
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  minted_at?: string;
  uploaded_by: string;
  verified_by?: string;
  minted_by?: string;
  nik?: string;
  tempat_tanggal_lahir?: string;
  nomor_sk_rektor?: string;
  tanggal_sk_rektor?: string;
  student_email?: string;
}

// Interface untuk IjazahData yang diharapkan MintPopup
interface PopupDiplomaData {
  id: number;
  namaMahasiswa: string;
  npm: string;
  nik: string;
  tempatTanggalLahir: string;
  programStudi: string;
  fakultas: string;
  gelarAkademik: string;
  tanggalKelulusan: string;
  tahunLulus: string;
  nomorSKRektor: string;
  tanggalSKRektor: string;
  walletAddress: string;
  ipfs: string;
  alamatPenerbit: string;
  tokenID: string;
  status: 'Pending' | 'Minted';
  selected: boolean;
}

export default function DataIjazahPage() {
  const router = useRouter();
  const [diplomas, setDiplomas] = useState<ExtendedDiploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programStudiFilter, setProgramStudiFilter] = useState<string>('all');
  const [tahunFilter, setTahunFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
  // State untuk popup mint
  const [mintStep, setMintStep] = useState<MintStep>('idle');
  const [currentMintingItem, setCurrentMintingItem] = useState<PopupDiplomaData | null>(null);
  const [mintProgress, setMintProgress] = useState({
    isUploading: false,
    uploadProgress: 0,
    isMinting: false,
    estimatedGas: '0.01'
  });

  // Base API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDiplomas();
  }, []);

  // **GUNAKAN API REAL, BUKAN MOCK DATA**
  const fetchDiplomas = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚀 [1] Fetching diplomas from API...');
      
      // Coba endpoint utama (getAllDiplomas)
      try {
        const response = await fetch(`${API_BASE_URL}/api/diplomas`);
        console.log('📡 [2] API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('📊 [3] API Data received:', result);
        
        // Handle various response formats
        let dataArray: any[] = [];
        
        if (Array.isArray(result)) {
          dataArray = result;
        } else if (result.data && Array.isArray(result.data)) {
          dataArray = result.data;
        } else if (result.success && result.data && Array.isArray(result.data)) {
          dataArray = result.data;
        } else {
          console.warn('⚠️ Unexpected API response format:', result);
          throw new Error('Unexpected API response format');
        }
        
        if (dataArray.length === 0) {
          console.log('ℹ️ API returned empty array');
          setDiplomas([]);
          return;
        }
        
        // Format data sesuai interface
        const formattedData: ExtendedDiploma[] = dataArray.map((item: any) => ({
          id: item.id || item.ID || 0,
          nama_lengkap: item.nama_lengkap || item.nama_lengkap || item.nama || '',
          nim: item.nim || item.NIM || '',
          program_studi: item.program_studi || item.program_studi || item.prodi || '',
          gelar_akademik: item.gelar_akademik || item.gelar_akademik || item.gelar || '',
          fakultas: item.fakultas || item.fakultas || '',
          tanggal_lulus: item.tanggal_lulus || item.tanggal_lulus || '',
          ipk: item.ipk || item.IPK || 0,
          judul_skripsi: item.judul_skripsi || item.judul_skripsi || item.judul || '',
          tahun_akademik: item.tahun_akademik || item.tahun_akademik || item.tahun_akademik || '',
          yudisium: item.yudisium || item.yudisium || '',
          wallet_address: item.wallet_address || item.wallet_address || '',
          transaction_hash: item.transaction_hash || item.transaction_hash || '',
          contract_address: item.contract_address || item.contract_address || '',
          token_id: item.token_id || item.token_id || '',
          block_number: item.block_number || item.block_number || 0,
          nama_file: item.nama_file || item.nama_file || '',
          path_file: item.path_file || item.path_file || '',
          ukuran_file: item.ukuran_file || item.ukuran_file || 0,
          tipe_file: item.tipe_file || item.tipe_file || '',
          file_hash: item.file_hash || item.file_hash || '',
          certificate_id: item.certificate_id || item.certificate_id || '',
          status: item.status || item.status || 'pending',
          verification_notes: item.verification_notes || item.verification_notes || '',
          created_at: item.created_at || item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || item.updated_at || new Date().toISOString(),
          minted_at: item.minted_at || item.minted_at || '',
          uploaded_by: item.uploaded_by || item.uploaded_by || 'admin',
          verified_by: item.verified_by || item.verified_by || '',
          minted_by: item.minted_by || item.minted_by || '',
          nik: item.nik || item.nik || '',
          tempat_tanggal_lahir: item.tempat_tanggal_lahir || item.tempat_tanggal_lahir || '',
          nomor_sk_rektor: item.nomor_sk_rektor || item.nomor_sk_rektor || '',
          tanggal_sk_rektor: item.tanggal_sk_rektor || item.tanggal_sk_rektor || '',
          student_email: item.student_email || item.student_email || ''
        }));
        
        setDiplomas(formattedData);
        console.log('✅ [4] Loaded data from API:', formattedData.length, 'items');
        return; // Success, exit function
        
      } catch (apiError: any) {
        console.warn('⚠️ [5] Error with main API endpoint:', apiError);
        console.warn('⚠️ Error message:', apiError.message);
        
        // Coba endpoint alternatif
        try {
          console.log('🔄 [6] Trying alternative endpoint...');
          const fallbackResponse = await fetch(`${API_BASE_URL}/api/diplomas/all`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          
          if (!fallbackResponse.ok) {
            throw new Error(`HTTP error! status: ${fallbackResponse.status}`);
          }
          
          const fallbackResult = await fallbackResponse.json();
          console.log('📡 [7] Fallback response:', fallbackResult);
          
          let fallbackArray: any[] = [];
          
          // Handle various response formats
          if (Array.isArray(fallbackResult)) {
            fallbackArray = fallbackResult;
          } else if (fallbackResult.data && Array.isArray(fallbackResult.data)) {
            fallbackArray = fallbackResult.data;
          } else if (fallbackResult.success && fallbackResult.data && Array.isArray(fallbackResult.data)) {
            fallbackArray = fallbackResult.data;
          }
          
          if (fallbackArray.length > 0) {
            const formattedFallback: ExtendedDiploma[] = fallbackArray.map((item: any) => ({
              id: item.id || item.ID || 0,
              nama_lengkap: item.nama_lengkap || item.nama_lengkap || item.nama || '',
              nim: item.nim || item.NIM || '',
              program_studi: item.program_studi || item.program_studi || item.prodi || '',
              gelar_akademik: item.gelar_akademik || item.gelar_akademik || item.gelar || '',
              fakultas: item.fakultas || item.fakultas || '',
              tanggal_lulus: item.tanggal_lulus || item.tanggal_lulus || '',
              ipk: item.ipk || item.IPK || 0,
              judul_skripsi: item.judul_skripsi || item.judul_skripsi || item.judul || '',
              tahun_akademik: item.tahun_akademik || item.tahun_akademik || item.tahun_akademik || '',
              yudisium: item.yudisium || item.yudisium || '',
              wallet_address: item.wallet_address || item.wallet_address || '',
              transaction_hash: item.transaction_hash || item.transaction_hash || '',
              contract_address: item.contract_address || item.contract_address || '',
              token_id: item.token_id || item.token_id || '',
              block_number: item.block_number || item.block_number || 0,
              nama_file: item.nama_file || item.nama_file || '',
              path_file: item.path_file || item.path_file || '',
              ukuran_file: item.ukuran_file || item.ukuran_file || 0,
              tipe_file: item.tipe_file || item.tipe_file || '',
              file_hash: item.file_hash || item.file_hash || '',
              certificate_id: item.certificate_id || item.certificate_id || '',
              status: item.status || item.status || 'pending',
              verification_notes: item.verification_notes || item.verification_notes || '',
              created_at: item.created_at || item.created_at || new Date().toISOString(),
              updated_at: item.updated_at || item.updated_at || new Date().toISOString(),
              minted_at: item.minted_at || item.minted_at || '',
              uploaded_by: item.uploaded_by || item.uploaded_by || 'admin',
              verified_by: item.verified_by || item.verified_by || '',
              minted_by: item.minted_by || item.minted_by || '',
              nik: item.nik || item.nik || '',
              tempat_tanggal_lahir: item.tempat_tanggal_lahir || item.tempat_tanggal_lahir || '',
              nomor_sk_rektor: item.nomor_sk_rektor || item.nomor_sk_rektor || '',
              tanggal_sk_rektor: item.tanggal_sk_rektor || item.tanggal_sk_rektor || '',
              student_email: item.student_email || item.student_email || ''
            }));
            
            setDiplomas(formattedFallback);
            console.log(`✅ [8] Loaded ${formattedFallback.length} items from fallback API`);
            return; // Success with fallback
          } else {
            throw new Error('Fallback API returned empty data');
          }
          
        } catch (fallbackError: any) {
          console.warn('⚠️ [9] Fallback also failed:', fallbackError);
          console.warn('⚠️ Fallback error message:', fallbackError.message);
        }
      }
      
      // Jika semua API gagal, tampilkan array kosong (tidak pakai mock data)
      console.log('🔄 [10] All API endpoints failed, showing empty state');
      setDiplomas([]);
      
    } catch (error: any) {
      console.error('🔥 [11] Critical error in fetchDiplomas:', error);
      console.error('🔥 [12] Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      setDiplomas([]);
      
    } finally {
      console.log('🏁 [13] Finally: setLoading(false)');
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Filter data berdasarkan kriteria
  const filteredDiplomas = diplomas.filter((diploma) => {
    const matchesSearch = 
      diploma.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diploma.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (diploma.certificate_id && diploma.certificate_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || diploma.status === statusFilter;
    
    const matchesProgramStudi = programStudiFilter === 'all' || 
      diploma.program_studi === programStudiFilter;
    
    let matchesTahun = true;
    if (tahunFilter !== 'all' && diploma.tanggal_lulus) {
      try {
        const tahunLulus = new Date(diploma.tanggal_lulus).getFullYear().toString();
        matchesTahun = tahunLulus === tahunFilter;
      } catch (error) {
        matchesTahun = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesProgramStudi && matchesTahun;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-blue-100 text-blue-800';
      case 'minted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'verified': return 'Verified';
      case 'minted': return 'Minted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // Toggle expanded row
  const toggleExpandRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // === FUNGSI MINT SBT ===
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

  const simulateBlockchainMint = async (): Promise<{
    tokenId: string, 
    txHash: string, 
    contractAddress: string, 
    blockNumber: number
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const fakeTokenId = `SBT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;
        const fakeTxHash = `0x${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36).substring(0, 8)}`;
        const fakeContractAddress = `0x${Math.random().toString(36).substring(2, 42)}`;
        const fakeBlockNumber = Math.floor(Math.random() * 1000000) + 1000000;
        
        resolve({ 
          tokenId: fakeTokenId, 
          txHash: fakeTxHash,
          contractAddress: fakeContractAddress,
          blockNumber: fakeBlockNumber
        });
      }, 2000);
    });
  };

  // Fungsi untuk mengkonversi ExtendedDiploma ke PopupDiplomaData
  const convertToPopupData = (diploma: ExtendedDiploma): PopupDiplomaData => {
    return {
      id: diploma.id,
      namaMahasiswa: diploma.nama_lengkap,
      npm: diploma.nim,
      nik: diploma.nik || '',
      tempatTanggalLahir: diploma.tempat_tanggal_lahir || '',
      programStudi: diploma.program_studi,
      fakultas: diploma.fakultas || '',
      gelarAkademik: diploma.gelar_akademik,
      tanggalKelulusan: diploma.tanggal_lulus,
      tahunLulus: diploma.tanggal_lulus ? new Date(diploma.tanggal_lulus).getFullYear().toString() : '',
      nomorSKRektor: diploma.nomor_sk_rektor || '',
      tanggalSKRektor: diploma.tanggal_sk_rektor || '',
      walletAddress: diploma.wallet_address || '',
      ipfs: diploma.file_hash || '',
      alamatPenerbit: diploma.contract_address || '0x1234567890abcdef1234567890abcdef12345678',
      tokenID: diploma.token_id || diploma.certificate_id || `UWD-${new Date().getFullYear()}-${diploma.id}`,
      status: diploma.status === 'minted' ? 'Minted' : 'Pending',
      selected: false
    };
  };

  const handleStartMint = (item: ExtendedDiploma) => {
    if (item.status === 'minted') {
      alert('Ijazah ini sudah di-mint!');
      return;
    }
    
    if (item.status !== 'verified') {
      alert('Hanya ijazah yang sudah diverifikasi yang bisa di-mint!');
      return;
    }
    
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

  const handleMintToBlockchain = async () => {
    if (!currentMintingItem) return;
    
    setMintProgress(prev => ({ ...prev, isMinting: true }));
    
    try {
      const result = await simulateBlockchainMint();
      
      // Call real API to update mint status
      try {
        const updateResponse = await fetch(`${API_BASE_URL}/api/diplomas/${currentMintingItem.id}/mint`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transaction_hash: result.txHash,
            contract_address: result.contractAddress,
            token_id: result.tokenId,
            block_number: result.blockNumber,
            minted_by: 'admin'
          })
        });
        
        if (!updateResponse.ok) {
          console.warn('⚠️ API update failed, but continuing with local state update');
        } else {
          const updateResult = await updateResponse.json();
          console.log('✅ API update successful:', updateResult);
        }
      } catch (apiError) {
        console.warn('⚠️ API call failed, using local state only:', apiError);
      }
      
      // Update local state
      setDiplomas(prev => 
        prev.map(item => 
          item.id === currentMintingItem.id 
            ? { 
                ...item, 
                status: 'minted',
                transaction_hash: result.txHash,
                contract_address: result.contractAddress,
                token_id: result.tokenId,
                block_number: result.blockNumber,
                minted_at: new Date().toISOString(),
                minted_by: 'admin',
                updated_at: new Date().toISOString()
              } 
            : item
        )
      );
      
      setMintProgress(prev => ({ ...prev, isMinting: false }));
      setMintStep('success');
      
    } catch (error) {
      console.error('Error minting to blockchain:', error);
      alert('❌ Gagal mint ke blockchain. Silakan coba lagi.');
      setMintStep('idle');
    }
  };

  const handleClosePopup = () => {
    setMintStep('idle');
    setCurrentMintingItem(null);
    // Refresh data setelah popup ditutup
    fetchDiplomas();
  };

  // === FUNGSI HAPUS DATA ===
  const handleDeleteDiploma = async (id: number, nama: string, status: string) => {
    if (status === 'minted') {
      alert('❌ Data yang sudah di-mint tidak dapat dihapus!\n\nAlasan: Data sudah tercatat di blockchain dan tidak dapat diubah.');
      return;
    }
    
    if (!confirm(`Apakah Anda yakin ingin menghapus data ijazah ${nama}?\n\nStatus: ${getStatusLabel(status)}`)) {
      return;
    }
    
    try {
      // Try to call real API for deletion
      try {
        const deleteResponse = await fetch(`${API_BASE_URL}/api/diplomas/${id}`, {
          method: 'DELETE'
        });
        
        if (!deleteResponse.ok) {
          console.warn('⚠️ API delete failed, but continuing with local state update');
        } else {
          const deleteResult = await deleteResponse.json();
          console.log('✅ API delete successful:', deleteResult);
        }
      } catch (apiError) {
        console.warn('⚠️ API delete call failed, using local state only:', apiError);
      }
      
      // Update local state
      setDiplomas(prev => prev.filter(item => item.id !== id));
      alert(`✅ Data ijazah ${nama} berhasil dihapus!`);
    } catch (error) {
      console.error('Error deleting diploma:', error);
      alert('❌ Gagal menghapus data ijazah');
    }
  };

  // Options untuk filter
  const programStudiOptions = [...new Set(diplomas.map(d => d.program_studi).filter(Boolean))];
  const tahunOptions = [...new Set(diplomas
    .map(d => {
      if (!d.tanggal_lulus) return '';
      try {
        return new Date(d.tanggal_lulus).getFullYear().toString();
      } catch {
        return '';
      }
    })
    .filter(Boolean)
    .sort((a, b) => parseInt(b) - parseInt(a))
  )];

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  // Statistik
  const stats = {
    total: diplomas.length,
    pending: diplomas.filter(d => d.status === 'pending').length,
    verified: diplomas.filter(d => d.status === 'verified').length,
    minted: diplomas.filter(d => d.status === 'minted').length,
    rejected: diplomas.filter(d => d.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📋 Data Ijazah</h1>
          <p className="text-gray-600 mt-2">Kelola semua data ijazah yang terdaftar dalam sistem</p>
          <div className="mt-2 text-sm text-gray-500">
            Sumber data: <code className="bg-gray-100 px-2 py-1 rounded">{API_BASE_URL}/api/diplomas</code>
            {diplomas.length > 0 && (
              <span className="ml-2 text-green-600">({diplomas.length} data ditemukan)</span>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Ijazah</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Verified</p>
            <p className="text-2xl font-bold text-blue-600">{stats.verified}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Minted</p>
            <p className="text-2xl font-bold text-green-600">{stats.minted}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari (Nama/NIM/Certificate ID)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Cari..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Studi
              </label>
              <select
                value={programStudiFilter}
                onChange={(e) => setProgramStudiFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Program Studi</option>
                {programStudiOptions.map((prodi) => (
                  <option key={prodi} value={prodi}>{prodi}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tahun Lulus
              </label>
              <select
                value={tahunFilter}
                onChange={(e) => setTahunFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Tahun</option>
                {tahunOptions.map((tahun) => (
                  <option key={tahun} value={tahun}>{tahun}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="minted">Minted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchDiplomas}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
          
          {/* Debug Info */}
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex space-x-4">
              <button 
                onClick={() => window.open(`${API_BASE_URL}/api/diplomas`, '_blank')}
                className="text-blue-600 hover:text-blue-800"
              >
                Test API Endpoint
              </button>
              <button 
                onClick={() => console.log('Current diplomas:', diplomas)}
                className="text-gray-600 hover:text-gray-800"
              >
                Log Data State
              </button>
              <button 
                onClick={fetchDiplomas}
                className="text-gray-600 hover:text-gray-800"
              >
                Force Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificate ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program Studi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Detail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDiplomas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {diplomas.length === 0 ? (
                        <div>
                          <div className="text-5xl mb-4">📄</div>
                          <p className="text-lg font-medium text-gray-700 mb-2">Belum ada data ijazah</p>
                          <p className="text-gray-600 mb-4">
                            {API_BASE_URL.includes('localhost') ? 
                              'Pastikan backend server berjalan di http://localhost:5000' : 
                              'Database kosong atau API tidak merespons'}
                          </p>
                          <button
                            onClick={() => router.push('/admin/upload-ijazah')}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
                          >
                            + Tambah Data Ijazah
                          </button>
                          <button
                            onClick={fetchDiplomas}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Coba Lagi
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="text-5xl mb-4">🔍</div>
                          <p className="text-lg font-medium text-gray-700 mb-2">Data tidak ditemukan</p>
                          <p className="text-gray-600 mb-4">Coba ubah filter pencarian Anda</p>
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('all');
                              setProgramStudiFilter('all');
                              setTahunFilter('all');
                            }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                          >
                            Reset Filter
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredDiplomas.map((diploma, index) => (
                    <>
                      <tr key={diploma.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {diploma.certificate_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {diploma.nama_lengkap}
                          </div>
                          {diploma.nik && (
                            <div className="text-xs text-gray-500">NIK: {diploma.nik}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {diploma.nim}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {diploma.program_studi}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(diploma.status)}`}>
                            {getStatusLabel(diploma.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => toggleExpandRow(diploma.id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            {expandedRow === diploma.id ? "Sembunyikan" : "Lihat Detail"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            {diploma.status === 'verified' && (
                              <button
                                onClick={() => handleStartMint(diploma)}
                                className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                              >
                                Mint SBT
                              </button>
                            )}
                            
                            {diploma.status !== 'minted' && (
                              <button
                                onClick={() => handleDeleteDiploma(diploma.id, diploma.nama_lengkap, diploma.status)}
                                className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                              >
                                Hapus
                              </button>
                            )}
                            
                            {diploma.status === 'minted' && (
                              <span className="text-gray-400 text-xs px-2 py-1" title="Data sudah di-mint ke blockchain">
                                Immutable
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row (Detail Lengkap) */}
                      {expandedRow === diploma.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="px-6 py-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 bg-white rounded-lg border">
                              {/* Kolom Kiri */}
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Mahasiswa Lengkap</h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <p className="text-gray-500">Nama Lengkap</p>
                                      <p className="font-medium">{diploma.nama_lengkap}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">NIM</p>
                                      <p className="font-medium font-mono">{diploma.nim}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">NIK</p>
                                      <p className="font-medium font-mono">{diploma.nik || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Tempat/Tgl Lahir</p>
                                      <p className="font-medium">{diploma.tempat_tanggal_lahir || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Program Studi</p>
                                      <p className="font-medium">{diploma.program_studi}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Fakultas</p>
                                      <p className="font-medium">{diploma.fakultas || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Gelar Akademik</p>
                                      <p className="font-medium">{diploma.gelar_akademik}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">IPK</p>
                                      <p className="font-medium">{diploma.ipk || '-'}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Data Akademik</h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <p className="text-gray-500">Tanggal Lulus</p>
                                      <p className="font-medium">
                                        {formatDateDisplay(diploma.tanggal_lulus)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Tahun Akademik</p>
                                      <p className="font-medium">{diploma.tahun_akademik || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Yudisium</p>
                                      <p className="font-medium">{diploma.yudisium || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Judul Skripsi</p>
                                      <p className="font-medium">{diploma.judul_skripsi || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Nomor SK Rektor</p>
                                      <p className="font-medium">{diploma.nomor_sk_rektor || '-'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Tanggal SK Rektor</p>
                                      <p className="font-medium">
                                        {diploma.tanggal_sk_rektor ? formatDateDisplay(diploma.tanggal_sk_rektor) : '-'}
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
                                      <p className="text-gray-500 text-sm">Certificate ID</p>
                                      <p className="font-medium font-mono text-sm bg-gray-100 p-2 rounded">
                                        {diploma.certificate_id}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-sm">Token ID</p>
                                      <p className="font-medium font-mono text-sm bg-gray-100 p-2 rounded">
                                        {diploma.token_id || '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-sm">Wallet Address</p>
                                      <p className="font-medium font-mono text-xs break-all bg-gray-100 p-2 rounded">
                                        {diploma.wallet_address || '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-sm">IPFS Hash</p>
                                      <p className="font-medium font-mono text-xs break-all bg-gray-100 p-2 rounded">
                                        {diploma.file_hash || '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-sm">Contract Address</p>
                                      <p className="font-medium font-mono text-xs break-all bg-gray-100 p-2 rounded">
                                        {diploma.contract_address || '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-sm">Transaction Hash</p>
                                      <p className="font-medium font-mono text-xs break-all bg-gray-100 p-2 rounded">
                                        {diploma.transaction_hash || '-'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500 text-sm">Status</p>
                                      <div className="flex items-center space-x-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(diploma.status)}`}>
                                          {getStatusLabel(diploma.status)}
                                        </span>
                                        {diploma.status === 'verified' ? (
                                          <button
                                            onClick={() => handleStartMint(diploma)}
                                            className="text-sm text-green-600 hover:text-green-800 font-medium"
                                          >
                                            Mint SBT
                                          </button>
                                        ) : diploma.status === 'minted' ? (
                                          <span className="text-sm text-gray-500">
                                            (Immutable - tidak dapat diubah)
                                          </span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="pt-4 border-t">
                                  <div className="flex space-x-3">
                                    {diploma.status === 'verified' ? (
                                      <>
                                        <button
                                          onClick={() => handleStartMint(diploma)}
                                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                                        >
                                          Mint SBT
                                        </button>
                                        <button
                                          onClick={() => handleDeleteDiploma(diploma.id, diploma.nama_lengkap, diploma.status)}
                                          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                                        >
                                          Hapus Data
                                        </button>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(diploma.certificate_id);
                                            alert('Certificate ID berhasil disalin!');
                                          }}
                                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
                                        >
                                          Salin ID
                                        </button>
                                      </>
                                    ) : diploma.status === 'minted' ? (
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
                                    ) : (
                                      <button
                                        onClick={() => handleDeleteDiploma(diploma.id, diploma.nama_lengkap, diploma.status)}
                                        className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                                      >
                                        Hapus Data
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between">
          <div className="text-sm text-gray-600">
            Menampilkan {filteredDiplomas.length} dari {diplomas.length} ijazah
          </div>
          
          <div className="mt-2 md:mt-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span>Pending: {stats.pending}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>Verified: {stats.verified}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Minted: {stats.minted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600">ℹ️</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Aturan Data Ijazah</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Pending</strong>: Menunggu verifikasi admin</li>
                <li>• <strong>Verified</strong>: Sudah diverifikasi, siap di-mint</li>
                <li>• <strong>Minted</strong>: Sudah di-mint ke blockchain</li>
                <li>• <strong>Rejected</strong>: Ditolak dengan catatan alasan</li>
                <li>• <span className="font-bold text-red-600">❌ Data Minted tidak dapat diubah/dihapus</span></li>
                <li>• <span className="font-bold text-green-600">✅ Hanya data Verified yang bisa di-mint</span></li>
                <li>• Minting adalah proses satu kali yang tidak dapat diulang</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}