const API_BASE_URL = 'http://localhost:5000/api';

// --- INTERFACES ---

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
}

export interface Diploma {
  id: number;
  nama_lengkap: string;
  nim: string;
  student_email: string;
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
  tipe_file?: string;
  file_hash: string;
  certificate_id: string;
  status: 'pending' | 'verified' | 'minted' | 'rejected';
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  minted_at?: string;
  uploaded_by: string;
  verified_by?: string;
  minted_by?: string;
}

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
  
  console.log(`🌐 [API] Request: ${method} ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {},
    credentials: 'include',
    mode: 'cors'
  };

  // Setup Body & Headers
  if (data && !isFormData) {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json',
    };
    options.body = JSON.stringify(data);
  } else if (data && isFormData) {
    // Note: Jangan set Content-Type jika menggunakan FormData, 
    // browser akan mengaturnya secara otomatis termasuk boundary-nya
    options.body = data;
  }

  try {
    const response = await fetch(url, options);
    console.log(`📡 [API] Response Status: ${response.status} ${response.statusText}`);

    // Mendapatkan data respon
    let result: any;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error(`❌ [API] JSON Parse Error:`, jsonError);
        throw new Error(`Invalid JSON response from server: ${response.statusText}`);
      }
    } else {
      const textResponse = await response.text();
      console.warn(`⚠️ [API] Non-JSON response:`, textResponse.substring(0, 200));
      result = { message: textResponse };
    }

    // Jika response tidak OK (4xx atau 5xx)
    if (!response.ok) {
      console.error(`❌ [API] Server Error ${response.status}:`, result);
      throw new Error(result.message || result.error || `Error ${response.status}: ${response.statusText}`);
    }

    // Berhasil
    console.log(`✅ [API] Success:`, result.success, result.message, `Data length:`, result.data?.length || 0);
    
    // Standardize response format
    if (result.success !== undefined) {
      return result as ApiResponse<T>;
    } else {
      // Jika backend tidak mengembalikan format standard, kita buat sendiri
      return {
        success: true,
        message: 'Request successful',
        data: result.data || result,
        count: result.count || result.data?.length || 0
      };
    }

  } catch (error: any) {
    console.error(`🔥 [API] Request Error (${url}):`, error);
    
    // Cek jika ini adalah network error atau CORS error
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error(`🌐 [API] Network/CORS Error - Backend mungkin tidak berjalan di ${API_BASE_URL}`);
      return {
        success: false,
        message: `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running.`,
        data: undefined
      };
    }
    
    // Mengembalikan objek ApiResponse standar meskipun terjadi crash/error
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown network or server error',
      data: undefined
    };
  }
};

// --- EXPORT API FUNCTIONS ---

export const diplomaAPI = {
  // Upload ijazah
  uploadDiploma: async (formData: FormData): Promise<ApiResponse<Diploma>> => {
    return apiRequest('/diplomas/upload', 'POST', formData, true);
  },

  // Ambil data ijazah berdasarkan ID (Digunakan di halaman Mint)
  getDiplomaById: async (id: number): Promise<ApiResponse<Diploma>> => {
    return apiRequest(`/diplomas/${id}`);
  },

  // Ambil data ijazah yang berstatus verified untuk dimint
  getPendingDiplomas: async (): Promise<ApiResponse<Diploma[]>> => {
    return apiRequest('/diplomas/pending');
  },

  // Ambil semua data ijazah - MODIFIED: Robust endpoint handling
  getAllDiplomas: async (): Promise<ApiResponse<Diploma[]>> => {
    try {
      console.log('📊 [API] Getting ALL diplomas...');
      
      // Coba beberapa endpoint yang mungkin
      const endpoints = [
        '/diplomas',           // Standard
        '/diplomas/all',       // Alternative
        '/diplomas?status=all' // With query
      ];
      
      let lastError: any = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 [API] Trying endpoint: ${endpoint}`);
          const response = await apiRequest<Diploma[]>(endpoint);
          
          if (response.success && response.data) {
            console.log(`✅ [API] Success with endpoint: ${endpoint}, data count: ${response.data.length}`);
            return response;
          } else {
            console.warn(`⚠️ [API] Endpoint ${endpoint} returned no data:`, response.message);
            lastError = response.message;
          }
        } catch (endpointError) {
          console.warn(`⚠️ [API] Endpoint ${endpoint} failed:`, endpointError);
          lastError = endpointError;
        }
      }
      
      // Jika semua endpoint gagal, throw error
      throw new Error(`All endpoints failed. Last error: ${lastError}`);
      
    } catch (error: any) {
      console.error('❌ [API] getAllDiplomas error:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch all diplomas',
        data: undefined
      };
    }
  },

  // Cari ijazah berdasarkan NIM
  getDiplomaByNim: async (nim: string): Promise<ApiResponse<Diploma>> => {
    return apiRequest(`/diplomas/nim/${nim}`);
  },

  // Verifikasi ijazah
  verifyDiploma: async (id: number): Promise<ApiResponse> => {
    return apiRequest(`/diplomas/verify/${id}`, 'POST');
  },

  // Update data setelah minting ke Blockchain
  mintDiploma: async (id: number, mintData: MintData): Promise<ApiResponse> => {
    return apiRequest(`/diplomas/mint/${id}`, 'PUT', mintData);
  },

  // Statistik dashboard
  getStatistics: async (): Promise<ApiResponse<Statistics>> => {
    return apiRequest('/diplomas/stats/dashboard');
  },
  
  // NEW: Get diplomas by status
  getDiplomasByStatus: async (status: string): Promise<ApiResponse<Diploma[]>> => {
    return apiRequest(`/diplomas/status/${status}`);
  },
  
  // NEW: Delete diploma (for admin)
  deleteDiploma: async (id: number): Promise<ApiResponse> => {
    return apiRequest(`/diplomas/${id}`, 'DELETE');
  },
  
  // NEW: Update diploma
  updateDiploma: async (id: number, data: Partial<Diploma>): Promise<ApiResponse<Diploma>> => {
    return apiRequest(`/diplomas/${id}`, 'PUT', data);
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
    const testResponse = await fetch(`${API_BASE_URL}/diplomas/health`);
    return testResponse.ok;
  } catch {
    try {
      const testResponse = await fetch(`${API_BASE_URL}/diplomas`);
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
      nim: `202210370311${i.toString().padStart(3, '0')}`,
      student_email: `mahasiswa${i}@example.com`,
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