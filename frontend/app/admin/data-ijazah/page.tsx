'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDateTime } from '@/app/services/api';
import { useRouter } from 'next/navigation';

// Interface untuk data ijazah berdasarkan database
interface ExtendedDiploma {
  id: number;
  nama_lengkap: string;
  npm: string;
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

  // Base API URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDiplomas();
  }, []);

  const fetchDiplomas = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚀 [1] Fetching diplomas from API...');
      
      const response = await fetch(`${API_BASE_URL}/api/diplomas`);
      console.log('📡 [2] API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('📊 [3] API Data received:', result);
      
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
      
      const formattedData: ExtendedDiploma[] = dataArray.map((item: any) => ({
        id: item.id || item.ID || 0,
        nama_lengkap: item.nama_lengkap || item.nama || '',
        npm: item.npm || '',
        nik: item.nik || '',
        program_studi: item.program_studi || '',
        gelar_akademik: item.gelar_akademik || '',
        tempat_tanggal_lahir: item.tempat_tanggal_lahir || '',
        fakultas: item.fakultas || '',
        tanggal_lulus: item.tanggal_lulus || '',
        ipk: item.ipk || 0,
        judul_skripsi: item.judul_skripsi || '',
        tahun_akademik: item.tahun_akademik || '',
        yudisium: item.yudisium || '',
        wallet_address: item.wallet_address || '',
        transaction_hash: item.transaction_hash || '',
        contract_address: item.contract_address || '',
        token_id: item.token_id || '',
        block_number: item.block_number || 0,
        nama_file: item.nama_file || '',
        path_file: item.path_file || '',
        ukuran_file: item.ukuran_file || 0,
        tipe_file: item.tipe_file || '',
        file_hash: item.file_hash || '',
        certificate_id: item.certificate_id || '',
        status: item.status || 'pending',
        verification_notes: item.verification_notes || '',
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
        minted_at: item.minted_at || '',
        uploaded_by: item.uploaded_by || '',
        verified_by: item.verified_by || '',
        minted_by: item.minted_by || '',
        nomor_sk_rektor: item.nomor_sk_rektor || '',
        tanggal_sk_rektor: item.tanggal_sk_rektor || '',
      }));
      
      setDiplomas(formattedData);
    } catch (error) {
      console.error('🔥 Error in fetchDiplomas:', error);
      alert('❌ Gagal memuat data ijazah. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Filter data berdasarkan kriteria
  const filteredDiplomas = diplomas.filter((diploma) => {
    const matchesSearch = 
      diploma.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diploma.npm.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const deleteResponse = await fetch(`${API_BASE_URL}/api/diplomas/${id}`, {
        method: 'DELETE'
      });
      
      if (!deleteResponse.ok) {
        console.warn('⚠️ API delete failed, but continuing with local state update');
      } else {
        const deleteResult = await deleteResponse.json();
        console.log('✅ API delete successful:', deleteResult);
      }
      
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Data Ijazah</h3>
          <p className="text-gray-600">Kelola semua data ijazah yang terdaftar dalam sistem</p>
        </div>

        {/* Statistik - 4 KOLOM SESUAI GAMBAR */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 font-medium">Total Ijazah</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-sm text-gray-600 font-medium">Minted</p>
            <p className="text-2xl font-bold text-green-600">{stats.minted}</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Cari (Nama/NPM/Nomor Ijazah)</p>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cari..."
              />
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Program Studi</p>
              <select
                value={programStudiFilter}
                onChange={(e) => setProgramStudiFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Program Studi</option>
                {programStudiOptions.map((prodi) => (
                  <option key={prodi} value={prodi}>{prodi}</option>
                ))}
              </select>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Tahun Lulus</p>
              <select
                value={tahunFilter}
                onChange={(e) => setTahunFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Tahun</option>
                {tahunOptions.map((tahun) => (
                  <option key={tahun} value={tahun}>{tahun}</option>
                ))}
              </select>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="minted">Minted</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={fetchDiplomas}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium flex items-center justify-center"
              >
                <span className="mr-2">🔄</span>
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Table - SESUAI GAMBAR: NO, NAMA, NPM, PRODI, TAHUN, STATUS, AKSI, DETAIL */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {diploma.nama_lengkap}
                          </div>
                          <div className="text-xs text-gray-500">
                            {diploma.certificate_id}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {diploma.npm}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {diploma.program_studi}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {diploma.tanggal_lulus ? new Date(diploma.tanggal_lulus).getFullYear() : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(diploma.status)}`}>
                            {getStatusLabel(diploma.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap gap-2">
                            {diploma.status !== 'minted' ? (
                              <button
                                onClick={() => handleDeleteDiploma(diploma.id, diploma.nama_lengkap, diploma.status)}
                                className="text-red-600 hover:text-red-800 font-medium text-sm"
                              >
                                Hapus
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs px-2 py-1" title="Data sudah di-mint ke blockchain">
                                Immutable
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={() => toggleExpandRow(diploma.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium underline"
                          >
                            {expandedRow === diploma.id ? "Sembunyikan" : "Lihat Detail"}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Row (Detail Lengkap) */}
                      {expandedRow === diploma.id && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="px-4 py-4">
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
                                      <p className="text-gray-500">NPM</p>
                                      <p className="font-medium font-mono">{diploma.npm}</p>
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
                                      <p className="text-gray-500 text-sm">Nomor Ijazah</p>
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
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(diploma.status)}`}>
                                          {getStatusLabel(diploma.status)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="pt-4 border-t">
                                  <div className="flex space-x-3">
                                    {diploma.status !== 'minted' ? (
                                      <button
                                        onClick={() => handleDeleteDiploma(diploma.id, diploma.nama_lengkap, diploma.status)}
                                        className="px-4 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition font-medium text-sm"
                                      >
                                        Hapus Data
                                      </button>
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
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Info */}
        <div className="text-center text-sm text-gray-600 mb-6">
          <p>Menampilkan {filteredDiplomas.length} dari {diplomas.length} ijazah</p>
        </div>

        {/* Info Box */}
        <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Informasi Data Ijazah</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="text-yellow-500 mr-2">•</span>
              <span><strong>Minted:</strong> Status ijazah yang sudah di-mint ke blockchain</span>
            </div>
            <div className="flex items-start col-span-1 md:col-span-2">
              <span className="text-red-500 mr-2">❌</span>
              <span><strong>Data Minted tidak dapat diubah/dihapus</strong></span>
            </div>
            <div className="flex items-start col-span-1 md:col-span-2">
              <span className="text-gray-500 mr-2">•</span>
              <span>Minting adalah proses satu kali yang tidak dapat diulang</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}