const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

// --- INTERFACES ---

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  error?: string;
}

export interface Diploma {
  id: number;
  nama_lengkap: string;
  npm: string;
  nik: string;
  program_studi: string;
  gelar_akademik: string;
  tempat_tanggal_lahir?: string;
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
  tipe_file?: string;
  file_hash: string;
  certificate_id: string;
  
  // IPFS fields (dari backend)
  ipfs_hash?: string;
  ipfs_url?: string;
  
  status: 'pending' | 'verified' | 'minted' | 'rejected';
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  minted_at?: string;
  uploaded_by: string;
  verified_by?: string;
  minted_by?: string;
  // TAMBAHKAN FIELD INI:
  nomor_sk_rektor?: string;
  tanggal_sk_rektor?: string;
}

// Tambahkan interface untuk response blockchain
export interface MintBlockchainResponse {
  success: boolean;
  data?: {
    tokenId: string;
    transactionHash: string;
    blockNumber: number;
    contractAddress: string;
  };
  message?: string;
  error?: string;
}

export interface IPFSUploadResponse {
  success: boolean;
  data?: {
    ipfsHash: string;
    ipfsUrl: string;
    fileName: string;
  };
  message?: string;
  error?: string;
}

// Interface untuk dashboard stats dengan data lengkap
export interface DashboardStats {
  total: number;
  pending: number;
  minted: number;
  mintedPercentage: number;
  pendingPercentage: number;
  percentages?: {
    minted: string;
    pending: string;
  };
}

// Interface untuk extended dashboard stats
export interface ExtendedDashboardStats extends DashboardStats {
  percentages?: {
    minted: string;
    pending: string;
  };
}

// Interface lama (dipertahankan untuk kompatibilitas)
export interface Statistics {
  total: number;
  pending: number;
  minted: number;
  verified: number;
  rejected: number;
  percentages: {
    pending: string;
    minted: string;
    verified: string;
    rejected: string;
  };
}

export interface MintData {
  transaction_hash?: string;
  contract_address?: string;
  token_id?: string;
  block_number?: number;
  minted_by?: string;
}

// --- CORE HELPER FUNCTION WITH ROBUST ERROR HANDLING ---

const apiRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  isFormData: boolean = false
): Promise<ApiResponse<T>> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`🌐 [API] Request: ${method} ${url}`, data || '');
  
  const options: RequestInit = {
    method,
    headers: {},
    credentials: 'include' as RequestCredentials,
    mode: 'cors' as RequestMode
  };

  // Tambahkan headers umum
  options.headers = {
    ...options.headers,
    'Accept': 'application/json',
  };

  // Setup Body & Headers berdasarkan tipe data
  if (data && !isFormData) {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
    options.body = JSON.stringify(data);
  } else if (data && isFormData) {
    // FormData: browser akan mengatur Content-Type secara otomatis
    options.body = data;
  }

  try {
    console.log(`🌐 [API] Making request to: ${url}`);
    console.log(`🌐 [API] Request options:`, {
      method: options.method,
      headers: options.headers,
      hasBody: !!options.body
    });

    const response = await fetch(url, options);
    
    console.log(`📡 [API] Response received:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Mendapatkan dan parsing response
    let result: any = {};
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      try {
        const text = await response.text();
        console.log(`📡 [API] Raw JSON response (first 500 chars):`, text.substring(0, 500));
        
        if (text) {
          result = JSON.parse(text);
        }
      } catch (jsonError) {
        console.error(`❌ [API] JSON Parse Error:`, jsonError);
        throw new Error(`Invalid JSON response from server: ${response.statusText}`);
      }
    } else {
      try {
        const textResponse = await response.text();
        console.warn(`⚠️ [API] Non-JSON response (first 200 chars):`, textResponse.substring(0, 200));
        result = { 
          message: textResponse,
          raw: textResponse
        };
      } catch (textError) {
        console.error(`❌ [API] Text Parse Error:`, textError);
        result = { message: `Unable to parse response: ${textError.message}` };
      }
    }

    // Jika response tidak OK (4xx atau 5xx)
    if (!response.ok) {
      console.error(`❌ [API] Server Error ${response.status}:`, result);
      
      const errorMessage = result.message || 
                          result.error || 
                          result.details || 
                          `Error ${response.status}: ${response.statusText}`;
      
      throw new Error(errorMessage);
    }

    // Berhasil - log success
    console.log(`✅ [API] Success:`, {
      success: result.success,
      message: result.message,
      hasData: !!result.data,
      dataType: typeof result.data,
      dataLength: Array.isArray(result.data) ? result.data.length : 'not array'
    });
    
    // Standardize response format
    if (result.success !== undefined) {
      // Jika backend mengembalikan format yang sudah benar
      return result as ApiResponse<T>;
    } else {
      // Jika backend tidak mengembalikan format standard, kita buat sendiri
      const standardizedResponse: ApiResponse<T> = {
        success: true,
        message: result.message || 'Request successful',
        data: result.data || result,
        count: result.count || (Array.isArray(result.data) ? result.data.length : undefined)
      };
      
      console.log(`🔄 [API] Standardized response:`, standardizedResponse);
      return standardizedResponse;
    }

  } catch (error: any) {
    console.error(`🔥 [API] Request Error (${url}):`, error);
    
    // Deteksi tipe error
    let errorMessage = error.message || 'Unknown network or server error';
    let isNetworkError = false;
    
    // Cek jika ini adalah network error atau CORS error
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      isNetworkError = true;
      errorMessage = `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running.`;
      console.error(`🌐 [API] Network/CORS Error - Backend mungkin tidak berjalan di ${API_BASE_URL}`);
    }
    
    // Cek jika timeout
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout. Server might be busy or unavailable.';
    }
    
    // Mengembalikan objek ApiResponse standar dengan error
    return {
      success: false,
      message: errorMessage,
      error: errorMessage,
      data: undefined
    };
  }
};

// --- EXPORT API FUNCTIONS ---

export const diplomaAPI = {
  // Upload ijazah
  uploadDiploma: async (formData: FormData): Promise<ApiResponse<Diploma>> => {
    console.log('📤 [API] Uploading diploma...');
    return apiRequest('/diplomas/upload', 'POST', formData, true);
  },

  // Ambil data ijazah berdasarkan ID (Digunakan di halaman Mint)
  getDiplomaById: async (id: number): Promise<ApiResponse<Diploma>> => {
    console.log(`📄 [API] Getting diploma by ID: ${id}`);
    return apiRequest(`/diplomas/${id}`);
  },

  // Ambil data ijazah yang berstatus verified untuk dimint
  getPendingDiplomas: async (): Promise<ApiResponse<Diploma[]>> => {
    console.log('⏳ [API] Getting pending diplomas...');
    return apiRequest('/diplomas/pending');
  },

  // Ambil semua data ijazah
  getAllDiplomas: async (): Promise<ApiResponse<Diploma[]>> => {
    console.log('📋 [API] Getting all diplomas...');
    return apiRequest('/diplomas');
  },

  // Cari ijazah berdasarkan NIM
  getDiplomaByNpm: async (npm: string): Promise<ApiResponse<Diploma>> => {
    console.log(`🔍 [API] Getting diploma by NPM: ${npm}`);
    return apiRequest(`/diplomas/npm/${npm}`);
  },

  // Verifikasi ijazah
  verifyDiploma: async (nim: string): Promise<ApiResponse> => {
    console.log(`✅ [API] Verifying diploma NIM: ${nim}`);
    return apiRequest(`/diplomas/verify/${nim}`, 'GET');
  },

  // Update data setelah minting ke Blockchain
  mintDiploma: async (id: number, mintData: MintData): Promise<ApiResponse> => {
    console.log(`🪙 [API] Minting diploma ID: ${id}`, mintData);
    return apiRequest(`/diplomas/mint/${id}`, 'PUT', mintData);
  },

  // Upload ke IPFS via backend
  uploadToIPFS: async (diplomaId: number, diplomaData: any): Promise<IPFSUploadResponse> => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/diplomas/${diplomaId}/upload-ipfs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diplomaData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload to IPFS');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Upload to IPFS error:', error);
      return {
        success: false,
        message: error.message || 'Gagal upload ke IPFS',
        error: error.toString()
      };
    }
  },

  // Mint ke blockchain via backend
  mintToBlockchain: async (diplomaId: number, ipfsHash: string, walletAddress?: string): Promise<MintBlockchainResponse> => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/diplomas/${diplomaId}/mint-blockchain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ipfsHash,
          walletAddress: walletAddress || '' // Bisa dikosongi, backend akan pakai default
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mint to blockchain');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Mint to blockchain error:', error);
      return {
        success: false,
        message: error.message || 'Gagal mint ke blockchain',
        error: error.toString()
      };
    }
  },

  // Get estimated gas
  getEstimatedGas: async (): Promise<string> => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_BASE_URL}/api/diplomas/estimate-gas`);
      const data = await response.json();
      
      return data.estimatedGas || '0.01';
    } catch (error) {
      console.error('Error getting estimated gas:', error);
      return '0.01';
    }
  },

  // Statistik dashboard - LEGACY (untuk kompatibilitas)
  getStatistics: async (): Promise<ApiResponse<DashboardStats>> => {
    console.log('📊 [API] Fetching legacy dashboard statistics...');
    
    try {
      const response = await apiRequest('/diplomas/stats');
      
      console.log('📊 [API] Legacy statistics response:', {
        success: response.success,
        message: response.message,
        hasData: !!response.data
      });
      
      if (response.success && response.data) {
        const stats = response.data as any;
        const dashboardStats: DashboardStats = {
          total: stats.total || 0,
          pending: stats.pending || 0,
          minted: stats.minted || 0,
          mintedPercentage: 0,
          pendingPercentage: 0
        };
        
        // Hitung persentase jika ada data
        if (dashboardStats.total > 0) {
          dashboardStats.mintedPercentage = Math.round((dashboardStats.minted / dashboardStats.total) * 100);
          dashboardStats.pendingPercentage = Math.round((dashboardStats.pending / dashboardStats.total) * 100);
        }
        
        console.log('📊 [API] Processed legacy stats:', dashboardStats);
        
        return {
          success: true,
          message: response.message || 'Legacy statistics fetched successfully',
          data: dashboardStats
        };
      } else {
        console.warn('⚠️ [API] No legacy statistics data returned');
        return {
          success: false,
          message: response.message || 'No statistics data available',
          data: undefined
        };
      }
    } catch (error: any) {
      console.error('❌ [API] Error fetching legacy statistics:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch statistics',
        data: undefined
      };
    }
  },

  // Statistik dashboard - NEW (dengan endpoint baru dan data lengkap)
  getDashboardStats: async (): Promise<ApiResponse<ExtendedDashboardStats>> => {
    console.log('📊 [API] Fetching NEW dashboard statistics...');
    
    try {
      // Gunakan endpoint baru
      const response = await apiRequest('/diplomas/stats/dashboard');
      
      console.log('📊 [API] New dashboard stats response:', {
        success: response.success,
        message: response.message,
        hasData: !!response.data
      });
      
      if (response.success && response.data) {
        const stats = response.data as any;
        
        // Debug log untuk melihat struktur data
        console.log('📊 [API] Raw stats data structure:', {
          keys: Object.keys(stats),
          total: stats.total,
          minted: stats.minted,
          pending: stats.pending,
          hasPercentages: !!stats.percentages,
          hasMintedPercentage: stats.mintedPercentage !== undefined,
          hasPendingPercentage: stats.pendingPercentage !== undefined
        });
        
        // Format data sesuai interface
        const dashboardStats: ExtendedDashboardStats = {
          total: stats.total || 0,
          minted: stats.minted || 0,
          pending: stats.pending || 0,
          mintedPercentage: stats.mintedPercentage || 0,
          pendingPercentage: stats.pendingPercentage || 0,
          percentages: stats.percentages || {
            minted: `${stats.mintedPercentage || 0}%`,
            pending: `${stats.pendingPercentage || 0}%`
          }
        };
        
        // Pastikan persentase dihitung jika tidak ada
        if (dashboardStats.total > 0) {
          if (!dashboardStats.mintedPercentage) {
            dashboardStats.mintedPercentage = Math.round((dashboardStats.minted / dashboardStats.total) * 100);
          }
          if (!dashboardStats.pendingPercentage) {
            dashboardStats.pendingPercentage = Math.round((dashboardStats.pending / dashboardStats.total) * 100);
          }
        }
        
        console.log('📊 [API] Processed dashboard stats:', dashboardStats);
        
        return {
          success: true,
          message: response.message || 'Dashboard statistics fetched successfully',
          data: dashboardStats
        };
      } else {
        console.warn('⚠️ [API] No new dashboard stats data returned, falling back to legacy...');
        
        // Fallback ke endpoint lama
        const legacyResponse = await diplomaAPI.getStatistics();
        if (legacyResponse.success && legacyResponse.data) {
          const legacyData = legacyResponse.data;
          
          const dashboardStats: ExtendedDashboardStats = {
            total: legacyData.total,
            minted: legacyData.minted,
            pending: legacyData.pending,
            mintedPercentage: legacyData.mintedPercentage,
            pendingPercentage: legacyData.pendingPercentage,
            percentages: {
              minted: `${legacyData.mintedPercentage}%`,
              pending: `${legacyData.pendingPercentage}%`
            }
          };
          
          console.log('📊 [API] Using legacy stats as fallback:', dashboardStats);
          
          return {
            success: true,
            message: 'Dashboard statistics fetched from legacy endpoint',
            data: dashboardStats
          };
        }
        
        console.warn('⚠️ [API] All fallback methods failed');
        return {
          success: false,
          message: response.message || 'No dashboard statistics available',
          data: undefined
        };
      }
    } catch (error: any) {
      console.error('❌ [API] Error fetching new dashboard statistics:', error);
      
      // Fallback ke data mock jika semua gagal
      console.log('🔄 [API] Using mock data as final fallback...');
      return {
        success: false,
        message: error.message || 'Failed to fetch dashboard statistics',
        data: generateMockDashboardStats()
      };
    }
  },
  
  // NEW: Get diplomas by status
  getDiplomasByStatus: async (status: string): Promise<ApiResponse<Diploma[]>> => {
    console.log(`📋 [API] Getting diplomas by status: ${status}`);
    return apiRequest(`/diplomas/status/${status}`);
  },
  
  // NEW: Delete diploma (for admin)
  deleteDiploma: async (id: number): Promise<ApiResponse> => {
    console.log(`🗑️ [API] Deleting diploma ID: ${id}`);
    return apiRequest(`/diplomas/${id}`, 'DELETE');
  },
  
  // NEW: Update diploma
  updateDiploma: async (id: number, data: Partial<Diploma>): Promise<ApiResponse<Diploma>> => {
    console.log(`✏️ [API] Updating diploma ID: ${id}`, data);
    return apiRequest(`/diplomas/${id}`, 'PUT', data);
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse> => {
    console.log('🏥 [API] Health check...');
    return apiRequest('/diplomas/health');
  },

  // Test connection function
  testConnection: async (): Promise<ApiResponse> => {
    console.log('🔌 [API] Testing connection to backend...');
    try {
      const response = await fetch(`${API_BASE_URL}/diplomas/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      const isOk = response.ok;
      const status = response.status;
      
      if (isOk) {
        const data = await response.json();
        return {
          success: true,
          message: `Backend is running (Status: ${status})`,
          data
        };
      } else {
        return {
          success: false,
          message: `Backend responded with error (Status: ${status})`,
          error: `HTTP ${status}`
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Cannot connect to backend at ${API_BASE_URL}`,
        error: error.message
      };
    }
  }
};

// --- UTILITY FUNCTIONS ---

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

export const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '-';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

// --- HELPER FUNCTIONS FOR FRONTEND ---

/**
 * Check if backend is available
 */
export const checkBackendAvailability = async (): Promise<boolean> => {
  try {
    console.log('🔍 Checking backend availability...');
    const testResponse = await fetch(`${API_BASE_URL}/diplomas/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors'
    });
    
    const isAvailable = testResponse.ok;
    console.log(`🔍 Backend availability: ${isAvailable ? '✅ Available' : '❌ Not available'}`);
    return isAvailable;
  } catch (error) {
    console.error('🔍 Backend check error:', error);
    try {
      // Coba endpoint lain sebagai fallback
      const testResponse = await fetch(`${API_BASE_URL}/diplomas`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors'
      });
      return testResponse.ok;
    } catch {
      return false;
    }
  }
};

/**
 * Generate mock data for development/testing
 */
export const generateMockDiplomas = (count: number = 5): Diploma[] => {
  const mockDiplomas: Diploma[] = [];
  const statuses: Diploma['status'][] = ['pending', 'verified', 'minted', 'rejected'];
  const programs = ['Informatika', 'Sistem Informasi', 'Teknik Elektro', 'Manajemen', 'Akuntansi'];
  
  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isMinted = status === 'minted';
    
    mockDiplomas.push({
      id: i,
      nama_lengkap: `Mahasiswa ${i}`,
      npm: `202210370311${i.toString().padStart(3, '0')}`,
      nik: `202210370311${i.toString().padStart(3, '0')}`,
      program_studi: programs[Math.floor(Math.random() * programs.length)],
      gelar_akademik: 'Sarjana Komputer (S.Kom.)',
      fakultas: 'Fakultas Teknologi Informasi',
      tanggal_lulus: '2024-07-15',
      ipk: 3.5 + Math.random() * 0.5,
      judul_skripsi: `Judul Skripsi Mahasiswa ${i}`,
      tahun_akademik: '2023/2024',
      yudisium: 'Memuaskan',
      wallet_address: `0x${Math.random().toString(36).substring(2, 42)}`,
      transaction_hash: isMinted ? `0x${Math.random().toString(36).substring(2, 42)}` : undefined,
      contract_address: isMinted ? `0x${Math.random().toString(36).substring(2, 42)}` : undefined,
      token_id: isMinted ? `SBT-${i.toString().padStart(4, '0')}` : undefined,
      block_number: isMinted ? Math.floor(Math.random() * 1000000) : undefined,
      nama_file: `ijazah_mahasiswa_${i}.pdf`,
      path_file: `/uploads/ijazah_mahasiswa_${i}.pdf`,
      ukuran_file: 1024 * 1024 * (1 + Math.random() * 2), // 1-3 MB
      tipe_file: 'application/pdf',
      file_hash: `Qm${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`,
      certificate_id: `UWD-2024-${i.toString().padStart(4, '0')}`,
      status,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      minted_at: isMinted ? new Date().toISOString() : undefined,
      uploaded_by: 'admin',
      verified_by: status === 'verified' || status === 'minted' ? 'admin' : undefined,
      minted_by: isMinted ? 'admin' : undefined
    });
  }
  
  return mockDiplomas;
};

/**
 * Generate mock dashboard stats
 */
export const generateMockDashboardStats = (): ExtendedDashboardStats => {
  const total = Math.floor(Math.random() * 100) + 50;
  const minted = Math.floor(total * 0.7);
  const pending = total - minted;
  const mintedPercentage = Math.round((minted / total) * 100);
  const pendingPercentage = Math.round((pending / total) * 100);
  
  return {
    total,
    minted,
    pending,
    mintedPercentage,
    pendingPercentage,
    percentages: {
      minted: `${mintedPercentage}%`,
      pending: `${pendingPercentage}%`
    }
  };
};

/**
 * Fallback function that returns mock data when API fails
 */
export const getDiplomasWithFallback = async (): Promise<Diploma[]> => {
  try {
    const response = await diplomaAPI.getAllDiplomas();
    
    if (response.success && response.data && response.data.length > 0) {
      console.log(`✅ Using real API data: ${response.data.length} items`);
      return response.data;
    } else {
      console.warn('⚠️ API returned no data, using mock data');
      return generateMockDiplomas(3);
    }
  } catch (error) {
    console.error('🔥 API failed completely, using mock data:', error);
    return generateMockDiplomas(5);
  }
};

/**
 * Fallback function for dashboard statistics (legacy)
 */
export const getStatisticsWithFallback = async (): Promise<DashboardStats> => {
  try {
    const response = await diplomaAPI.getStatistics();
    
    if (response.success && response.data) {
      console.log(`✅ Using real statistics data:`, response.data);
      return response.data;
    } else {
      console.warn('⚠️ Statistics API returned no data, using mock data');
      return {
        total: 150,
        pending: 45,
        minted: 105,
        mintedPercentage: 70,
        pendingPercentage: 30
      };
    }
  } catch (error) {
    console.error('🔥 Statistics API failed completely, using mock data:', error);
    return {
      total: 150,
      pending: 45,
      minted: 105,
      mintedPercentage: 70,
      pendingPercentage: 30
    };
  }
};

/**
 * Fallback function for NEW dashboard statistics
 */
export const getDashboardStatsWithFallback = async (): Promise<ExtendedDashboardStats> => {
  try {
    const response = await diplomaAPI.getDashboardStats();
    
    if (response.success && response.data) {
      console.log(`✅ Using new dashboard stats:`, response.data);
      return response.data;
    } else {
      console.warn('⚠️ New dashboard stats API returned no data, using mock data');
      return generateMockDashboardStats();
    }
  } catch (error) {
    console.error('🔥 New dashboard stats API failed completely, using mock data:', error);
    return generateMockDashboardStats();
  }
};