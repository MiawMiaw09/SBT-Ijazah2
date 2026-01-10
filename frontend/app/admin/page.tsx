"use client";

import { useState, useEffect } from 'react';
import { getIjazahData } from './utils/ijazahStorage';

interface IjazahData {
  id: number;
  status: 'Minted' | 'Pending';
  // ... field lainnya
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalIjazah: 0,
    sudahMinted: 0,
    belumMinted: 0,
    mintedPercentage: 0,
    pendingPercentage: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [ijazahData, setIjazahData] = useState<IjazahData[]>([]);

  const calculateStats = (data: IjazahData[]) => {
    const total = data.length;
    const minted = data.filter(item => item.status === 'Minted').length;
    const pending = total - minted;
    
    const mintedPercentage = total > 0 ? Math.round((minted / total) * 100) : 0;
    const pendingPercentage = total > 0 ? 100 - mintedPercentage : 0;
    
    return {
      totalIjazah: total,
      sudahMinted: minted,
      belumMinted: pending,
      mintedPercentage,
      pendingPercentage
    };
  };

  useEffect(() => {
    loadDashboardData();
    
    // Setup polling untuk update otomatis setiap 30 detik
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    setIsLoading(true);
    
    try {
      const data = getIjazahData();
      setIjazahData(data);
      
      const newStats = calculateStats(data);
      setStats(newStats);
      
      setLastUpdated(new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk pie chart yang sudah diperbaiki
  const getPieChartPath = (percentage: number, isSecondPart: boolean = false) => {
    if (percentage === 100) {
      return "M 50 50 L 50 0 A 40 40 0 1 1 50 50 Z";
    }
    
    if (percentage === 0) {
      return "M 50 50 L 50 50 L 50 50 Z";
    }
    
    // Konversi persentase ke radian
    const angle = (percentage / 100) * 2 * Math.PI;
    
    // Hitung koordinat titik di tepi lingkaran
    const x = 50 + 40 * Math.cos(angle - Math.PI / 2);
    const y = 50 + 40 * Math.sin(angle - Math.PI / 2);
    
    if (!isSecondPart) {
      // Path untuk bagian pertama (sudut 0 hingga persentase)
      return `M 50 50 L 50 0 A 40 40 0 ${angle > Math.PI ? 1 : 0} 1 ${x} ${y} Z`;
    } else {
      // Path untuk bagian kedua (dari persentase hingga 360 derajat)
      return `M 50 50 L ${x} ${y} A 40 40 0 ${angle > Math.PI ? 0 : 1} 1 50 0 Z`;
    }
  };

  // Fungsi untuk pie chart menggunakan conic-gradient (lebih sederhana)
  const getConicGradient = () => {
    if (stats.mintedPercentage === 0 && stats.pendingPercentage === 0) {
      return "conic-gradient(#e5e7eb 0% 100%)";
    }
    
    return `conic-gradient(
      #10b981 0% ${stats.mintedPercentage}%, 
      #ef4444 ${stats.mintedPercentage}% 100%
    )`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Sistem Manajemen Ijazah Digital</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadDashboardData}
              disabled={isLoading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Memuat...' : 'Refresh Data'}
            </button>
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Terakhir update: {lastUpdated}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Ijazah */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Ijazah</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {isLoading ? '...' : stats.totalIjazah}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Total dokumen yang diupload
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-2xl">📊</span>
            </div>
          </div>
        </div>
        
        {/* Sudah Minted */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Sudah Minted</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {isLoading ? '...' : stats.sudahMinted}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.mintedPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {stats.mintedPercentage}%
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-2xl">✅</span>
            </div>
          </div>
        </div>
        
        {/* Belum Minted */}
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Belum Minted</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {isLoading ? '...' : stats.belumMinted}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${stats.pendingPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  {stats.pendingPercentage}%
                </span>
              </div>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Distribusi Ijazah</h3>
          <div className="text-sm text-gray-500">
            {stats.totalIjazah > 0 ? (
              <>
                {stats.mintedPercentage}% Minted • {stats.pendingPercentage}% Pending
              </>
            ) : (
              'Belum ada data'
            )}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center">
          {/* Pie Chart */}
          <div className="w-56 h-56 mb-6 md:mb-0 md:mr-10 relative">
            {isLoading ? (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : stats.totalIjazah === 0 ? (
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No Data</span>
              </div>
            ) : (
              <>
                {/* Versi menggunakan conic-gradient (lebih mudah dan akurat) */}
                <div 
                  className="w-full h-full rounded-full"
                  style={{
                    background: getConicGradient(),
                  }}
                >
                  {/* Overlay untuk bagian tengah */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-gray-700">
                        {stats.totalIjazah}
                      </span>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>
                
                {/* Versi alternatif menggunakan SVG (jika conic-gradient tidak didukung) */}
                <div className="sr-only">
                  <svg width="224" height="224" viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d={getPieChartPath(stats.mintedPercentage)}
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d={getPieChartPath(stats.mintedPercentage, true)}
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </>
            )}
          </div>
          
          {/* Legend & Details */}
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Status Detail</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <span className="text-gray-700 font-medium">Sudah Minted</span>
                          <p className="text-xs text-gray-500">SBT sudah diterbitkan</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-green-600">
                          {stats.sudahMinted}
                        </span>
                        <div className="text-sm text-gray-500">
                          {stats.mintedPercentage}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                        <div>
                          <span className="text-gray-700 font-medium">Belum Minted</span>
                          <p className="text-xs text-gray-500">Menunggu proses mint</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-red-600">
                          {stats.belumMinted}
                        </span>
                        <div className="text-sm text-gray-500">
                          {stats.pendingPercentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Statistik Cepat</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {stats.totalIjazah}
                      </div>
                      <div className="text-xs text-gray-600">Total Dokumen</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {stats.sudahMinted}
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
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : ijazahData.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📄</div>
            <p className="text-gray-500">Belum ada aktivitas ijazah</p>
            <p className="text-sm text-gray-400 mt-1">Upload ijazah pertama Anda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ijazahData.slice(0, 5).map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    item.status === 'Minted' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-800">
                      Ijazah #{item.id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {item.status === 'Minted' ? 'Sudah di-mint' : 'Menunggu mint'}
                    </p>
                  </div>
                </div>
                <span className={`text-sm px-2 py-1 rounded ${
                  item.status === 'Minted'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
            
            {ijazahData.length > 5 && (
              <div className="text-center pt-3">
                <button className="text-sm text-blue-600 hover:text-blue-800">
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