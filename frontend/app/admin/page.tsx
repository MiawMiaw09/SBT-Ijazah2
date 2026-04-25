"use client";

import { useState, useEffect } from 'react';
import { useProtectedRoute } from '@/lib/useProtectedRoute';

interface IjazahData {
  id: number;
  status: 'pending' | 'verified' | 'minted' | 'rejected';
  nama_lengkap: string;
  npm: string;
  program_studi: string;
  certificate_id: string;
  created_at: string;
  updated_at?: string;
  minted_at?: string;
}

interface DashboardStats {
  total: number;
  minted: number;
  pending: number;
  mintedPercentage: number;
  pendingPercentage: number;
}

export default function AdminDashboard() {
  const { isLoading: authLoading } = useProtectedRoute()
  
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    minted: 0,
    pending: 0,
    mintedPercentage: 0,
    pendingPercentage: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [ijazahData, setIjazahData] = useState<IjazahData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Tambahkan state untuk current time
  const [currentTime, setCurrentTime] = useState<string>('');

  // Effect untuk update waktu real-time
  useEffect(() => {
    // Update waktu setiap detik
    const timeInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    }, 1000);
    
    // Cleanup interval saat component unmount
    return () => clearInterval(timeInterval);
  }, []);

  // Fungsi untuk mengambil data dari database
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching dashboard data from API...');
      
      // 1. Ambil data statistik dashboard dari API baru
      const statsResponse = await fetch('http://localhost:5000/api/diplomas/stats/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      console.log('Stats Response status:', statsResponse.status);
      
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`);
      }
      
      const statsResult = await statsResponse.json();
      console.log('📊 API Stats Response:', statsResult);
      
      if (statsResult.success && statsResult.data) {
        const apiStats = statsResult.data;
        console.log('📊 API Stats Data:', apiStats);
        
        setStats({
          total: apiStats.total || 0,
          minted: apiStats.minted || 0,
          pending: apiStats.pending || 0,
          mintedPercentage: apiStats.mintedPercentage || 0,
          pendingPercentage: apiStats.pendingPercentage || 0
        });
      } else {
        // Fallback: hitung manual dari data ijazah
        console.warn('⚠️ Using fallback calculation for stats');
        await fetchAndCalculateStats();
      }
      
      // 2. Ambil data ijazah terbaru untuk aktivitas
      const ijazahResponse = await fetch('http://localhost:5000/api/diplomas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Ijazah Response status:', ijazahResponse.status);
      
      if (!ijazahResponse.ok) {
        throw new Error(`HTTP error! status: ${ijazahResponse.status}`);
      }
      
      const ijazahResult = await ijazahResponse.json();
      console.log('📊 API Ijazah Response:', ijazahResult);
      
      if (ijazahResult.success && ijazahResult.data) {
        // Format data untuk aktivitas
        const formattedData: IjazahData[] = ijazahResult.data
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map((item: any) => ({
            id: item.id,
            status: item.status,
            nama_lengkap: item.nama_lengkap,
            npm: item.npm,
            program_studi: item.program_studi,
            certificate_id: item.certificate_id,
            created_at: item.created_at,
            updated_at: item.updated_at,
            minted_at: item.minted_at
          }));
        
        setIjazahData(formattedData);
      }
      
      // Update timestamp
      setLastUpdated(new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      setError('Gagal mengambil data dari server. Pastikan backend berjalan.');
      
      // Fallback data untuk development
      setFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback function untuk menghitung statistik dari data ijazah
  const fetchAndCalculateStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/diplomas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const data = result.data;
        const total = data.length;
        const minted = data.filter((item: any) => item.status === 'minted').length;
        const pending = data.filter((item: any) => item.status === 'pending').length;
        const mintedPercentage = total > 0 ? Math.round((minted / total) * 100) : 0;
        const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;
        
        setStats({
          total,
          minted,
          pending,
          mintedPercentage,
          pendingPercentage
        });
      }
    } catch (error) {
      console.error('Error in fallback calculation:', error);
      throw error;
    }
  };

  // Fallback data untuk development jika API tidak tersedia
  const setFallbackData = () => {
    const mockData: IjazahData[] = [
      { id: 1, status: 'minted', nama_lengkap: 'John Doe', npm: '202210001', program_studi: 'Informatika', certificate_id: 'CERT-2024-0001', created_at: '2024-01-15T10:30:00Z' },
      { id: 2, status: 'pending', nama_lengkap: 'Jane Smith', npm: '202210002', program_studi: 'Sistem Informasi', certificate_id: 'CERT-2024-0002', created_at: '2024-01-16T14:20:00Z' },
      { id: 3, status: 'minted', nama_lengkap: 'Bob Johnson', npm: '202210003', program_studi: 'Teknik Elektro', certificate_id: 'CERT-2024-0003', created_at: '2024-01-17T09:15:00Z' },
      { id: 4, status: 'minted', nama_lengkap: 'Alice Brown', npm: '202210004', program_studi: 'Manajemen', certificate_id: 'CERT-2024-0004', created_at: '2024-01-18T11:45:00Z' },
    ];
    
    const total = mockData.length;
    const minted = mockData.filter(item => item.status === 'minted').length;
    const pending = mockData.filter(item => item.status === 'pending').length;
    const mintedPercentage = Math.round((minted / total) * 100);
    const pendingPercentage = Math.round((pending / total) * 100);
    
    setStats({
      total,
      minted,
      pending,
      mintedPercentage,
      pendingPercentage
    });
    
    setIjazahData(mockData);
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Setup polling untuk update otomatis setiap 30 detik
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fungsi untuk pie chart menggunakan conic-gradient
  const getConicGradient = () => {
    if (stats.mintedPercentage === 0 && stats.pendingPercentage === 0) {
      return "conic-gradient(#e5e7eb 0% 100%)";
    }
    
    return `conic-gradient(
      #10b981 0% ${stats.mintedPercentage}%, 
      #ef4444 ${stats.mintedPercentage}% 100%
    )`;
  };

  // Format tanggal untuk aktivitas
  const formatActivityDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format status untuk display
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'verified': 'Terverifikasi',
      'minted': 'Sudah Minted',
      'rejected': 'Ditolak'
    };
    
    return statusMap[status] || status;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, { bg: string, text: string, dot: string }> = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
      'verified': { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
      'minted': { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' }
    };
    
    return colorMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
  };

  // Show loading screen saat checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header yang lebih kecil dan di kiri */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Sistem Manajemen Ijazah Digital</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memuat...
                </>
              ) : 'Refresh Data'}
            </button>
            
            {/* Display real-time clock */}
            <div className="flex items-center space-x-3">
              {/* Last updated dari API */}
              {lastUpdated && (
                <div className="text-xs text-gray-500 border-r border-gray-300 pr-3">
                </div>
              )}
              {/* Real-time clock */}
              <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1.5 rounded-lg">
                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-gray-700">
                 update: {currentTime || '--:--:--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Ijazah */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ijazah</h3>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {isLoading ? '...' : stats.total}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Total dokumen yang diupload
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Sudah Minted */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sudah Minted</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {isLoading ? '...' : stats.minted}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full" 
                    style={{ width: `${stats.mintedPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {stats.mintedPercentage}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Belum Minted */}
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Belum Minted</h3>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {isLoading ? '...' : stats.pending}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-red-500 h-1.5 rounded-full" 
                    style={{ width: `${stats.pendingPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {stats.pendingPercentage}%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-semibold text-gray-800">Distribusi Ijazah</h3>
        </div>
        
        <div className="flex flex-col md:flex-row items-center">
          {/* Pie Chart */}
          <div className="w-48 h-48 mb-6 md:mb-0 md:mr-8 relative">
            {isLoading ? (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : stats.total === 0 ? (
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No Data</span>
              </div>
            ) : (
              <>
                <div 
                  className="w-full h-full rounded-full"
                  style={{
                    background: getConicGradient(),
                  }}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-xl font-bold text-gray-700">
                        {stats.total}
                      </span>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Legend & Details */}
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Status Detail</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <div>
                          <span className="text-gray-700 font-medium text-sm">Sudah Minted</span>
                          <p className="text-xs text-gray-500">SBT sudah diterbitkan</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">
                          {stats.minted}
                        </span>
                        <div className="text-xs text-gray-500">
                          {stats.mintedPercentage}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <div>
                          <span className="text-gray-700 font-medium text-sm">Belum Minted</span>
                          <p className="text-xs text-gray-500">Menunggu proses mint</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-red-600">
                          {stats.pending}
                        </span>
                        <div className="text-xs text-gray-500">
                          {stats.pendingPercentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Statistik Cepat</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-md font-bold text-blue-600">
                        {stats.total}
                      </div>
                      <div className="text-xs text-gray-600">Total Dokumen</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <div className="text-md font-bold text-purple-600">
                        {stats.minted}
                      </div>
                      <div className="text-xs text-gray-600">SBT Aktif</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-md font-semibold text-gray-800">Aktivitas Terbaru</h3>
          <button 
            onClick={fetchDashboardData}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
          </button>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : ijazahData.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-gray-400 text-3xl mb-3">📄</div>
            <p className="text-gray-500 text-sm">Belum ada aktivitas ijazah</p>
            <p className="text-xs text-gray-400 mt-1">Upload ijazah pertama Anda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ijazahData.slice(0, 5).map((item) => {
              const statusColor = getStatusColor(item.status);
              
              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded transition"
                >
                  <div className="flex items-center">
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${statusColor.dot}`}></div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {item.nama_lengkap} ({item.npm})
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.program_studi} • {formatActivityDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColor.bg} ${statusColor.text}`}>
                      {formatStatus(item.status)}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      Nomor Ijazah: {item.certificate_id}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {ijazahData.length > 5 && (
              <div className="text-center pt-2">
                <button className="text-xs text-blue-600 hover:text-blue-800">
                  Lihat {ijazahData.length - 5} aktivitas lainnya →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}