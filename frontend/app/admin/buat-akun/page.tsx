'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userAPI, ApiResponse, User } from '../../services/api'; 

// Interface untuk form data
interface MahasiswaFormData {
  nama_lengkap: string;
  npm: string;
  fakultas: string;
  program_studi: string;
  angkatan: string;
  wallet_address: string;
  password: string;
}

export default function BuatAkunPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Data form
  const [formData, setFormData] = useState<MahasiswaFormData>({
    nama_lengkap: '',
    npm: '',
    fakultas: '',
    program_studi: '',
    angkatan: new Date().getFullYear().toString(),
    wallet_address: '',
    password: ''
  });

  // Dummy data untuk dropdown
  const fakultasOptions = [
    'Fakultas Ilmu Komputer',
    'Fakultas Teknik',
    'Fakultas Ekonomi dan Bisnis',
    'Fakultas Hukum',
    'Fakultas Kedokteran'
  ];

  const prodiOptions = [
    'Teknik Informatika',
    'Sistem Informasi',
    'Teknik Komputer',
    'Ilmu Komputer',
    'Teknologi Informasi',
    'Manajemen Informatika',
    'Teknik Elektro',
    'Teknik Industri'
  ];

  const angkatanOptions = Array.from(
    { length: 10 },
    (_, i) => (new Date().getFullYear() - i).toString()
  );

  // Handler untuk perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset messages ketika user mulai mengedit
    if (successMessage || errorMessage) {
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  // Validasi form
  const validateForm = (): boolean => {
    // Validasi NPM (harus 8 digit angka)
    if (!/^\d{8}$/.test(formData.npm)) {
      setErrorMessage('NPM harus 8 digit angka');
      return false;
    }

    // Validasi nama lengkap
    if (!formData.nama_lengkap.trim()) {
      setErrorMessage('Nama lengkap wajib diisi');
      return false;
    }

    // Validasi fakultas
    if (!formData.fakultas) {
      setErrorMessage('Fakultas wajib dipilih');
      return false;
    }

    // Validasi program studi
    if (!formData.program_studi) {
      setErrorMessage('Program studi wajib dipilih');
      return false;
    }

    // Validasi wallet address Polygon
    const polygonAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!formData.wallet_address || !polygonAddressRegex.test(formData.wallet_address)) {
      setErrorMessage('Format Polygon wallet address tidak valid. Harus diawali 0x dan 40 karakter hexadecimal');
      return false;
    }

    // Validasi password
    if (formData.password.length < 6) {
      setErrorMessage('Password minimal 6 karakter');
      return false;
    }

    return true;
  };

  // Copy wallet address to clipboard
  const copyWalletToClipboard = () => {
    if (formData.wallet_address) {
      navigator.clipboard.writeText(formData.wallet_address);
      alert('Wallet address berhasil disalin ke clipboard!');
    }
  };

  // Validate Polygon address format
  const validatePolygonAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Format wallet untuk display
  const formatWalletAddress = (address: string): string => {
    if (address.length <= 16) return address;
    return `${address.substring(0, 10)}...${address.substring(address.length - 6)}`;
  };

  // Handler submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Prepare data untuk dikirim ke API
      const payload = {
        npm: formData.npm,
        nama_lengkap: formData.nama_lengkap,
        password: formData.password,
        wallet_address: formData.wallet_address,
        fakultas: formData.fakultas,
        program_studi: formData.program_studi,
        angkatan: parseInt(formData.angkatan),
        role: 'mahasiswa',
        status: 'aktif'
      };

      console.log('📤 Mengirim data ke API:', { ...payload, password: '[HIDDEN]' });
      
      // Gunakan userAPI dari api.ts
      const result: ApiResponse<User> = await userAPI.createUser(payload);
      console.log('📥 Response dari API:', result);

      if (!result.success) {
        throw new Error(result.error || result.message || 'Gagal membuat akun');
      }

      // Reset form jika berhasil
      setSuccessMessage(`✅ Akun berhasil dibuat untuk ${formData.nama_lengkap} (NPM: ${formData.npm})`);
      
      // Reset form data
      setFormData({
        nama_lengkap: '',
        npm: '',
        fakultas: '',
        program_studi: '',
        angkatan: new Date().getFullYear().toString(),
        wallet_address: '',
        password: ''
      });

      // Auto reset success message setelah 5 detik
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      // Redirect ke halaman daftar user setelah 2 detik (opsional)
      setTimeout(() => {
        router.push('/admin/users');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error:', error);
      setErrorMessage(error.message || 'Terjadi kesalahan saat membuat akun');
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk generate password otomatis
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setFormData(prev => ({
      ...prev,
      password: password
    }));
  };

  // Handler untuk copy password ke clipboard
  const copyToClipboard = () => {
    if (formData.password) {
      navigator.clipboard.writeText(formData.password);
      alert('Password berhasil disalin ke clipboard!');
    }
  };

  // Handler untuk reset form
  const handleReset = () => {
    if (confirm('Anda yakin ingin mereset form? Semua data yang telah diisi akan hilang.')) {
      setFormData({
        nama_lengkap: '',
        npm: '',
        fakultas: '',
        program_studi: '',
        angkatan: new Date().getFullYear().toString(),
        wallet_address: '',
        password: ''
      });
      setSuccessMessage('');
      setErrorMessage('');
    }
  };

  // Handle click pada wallet preview
  const handleWalletPreviewClick = () => {
    if (formData.wallet_address && validatePolygonAddress(formData.wallet_address)) {
      // Buka Polygonscan
      const polygonscanUrl = `https://polygonscan.com/address/${formData.wallet_address}`;
      window.open(polygonscanUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Buat Akun Mahasiswa</h1>
          <p className="text-gray-600">
            Form untuk membuat akun mahasiswa baru dengan Polygon wallet address untuk menerima ijazah digital.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  {successMessage}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Akun berhasil dibuat. Redirect ke halaman daftar user...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-2xl mx-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Form Registrasi Mahasiswa dengan Polygon Wallet
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Lengkapi semua field yang diperlukan (*) untuk membuat akun dengan Polygon wallet
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Grid Form Fields */}
            <div className="space-y-6">
              
              {/* Nama Lengkap */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Nama lengkap sesuai ijazah"
                  required
                  disabled={loading}
                />
              </div>

              {/* NPM */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NPM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="npm"
                  value={formData.npm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Contoh: 20231037"
                  pattern="\d{8}"
                  title="NPM harus 8 digit angka"
                  required
                  disabled={loading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Nomor Pokok Mahasiswa (8 digit angka, unik) - digunakan untuk login
                </p>
              </div>

              {/* Fakultas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fakultas <span className="text-red-500">*</span>
                </label>
                <select
                  name="fakultas"
                  value={formData.fakultas}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  disabled={loading}
                >
                  <option value="">Pilih Fakultas</option>
                  {fakultasOptions.map((fakultas, index) => (
                    <option key={index} value={fakultas}>
                      {fakultas}
                    </option>
                  ))}
                </select>
              </div>

              {/* Program Studi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Studi <span className="text-red-500">*</span>
                </label>
                <select
                  name="program_studi"
                  value={formData.program_studi}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  disabled={loading}
                >
                  <option value="">Pilih Program Studi</option>
                  {prodiOptions.map((prodi, index) => (
                    <option key={index} value={prodi}>
                      {prodi}
                    </option>
                  ))}
                </select>
              </div>

              {/* Angkatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Angkatan <span className="text-red-500">*</span>
                </label>
                <select
                  name="angkatan"
                  value={formData.angkatan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                  disabled={loading}
                >
                  {angkatanOptions.map((tahun, index) => (
                    <option key={index} value={tahun}>
                      {tahun}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wallet Address Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-purple-800">
                    Polygon Wallet Address <span className="text-red-500">*</span>
                  </label>
                  {formData.wallet_address && (
                    <button
                      type="button"
                      onClick={copyWalletToClipboard}
                      className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition flex items-center"
                      disabled={loading}
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Salin Address
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="wallet_address"
                    value={formData.wallet_address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                    placeholder="0x..."
                    pattern="^0x[a-fA-F0-9]{40}$"
                    title="Format: 0x diikuti 40 karakter hexadecimal"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mt-3">
                  <div className="flex items-center mb-1">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${formData.wallet_address ? (validatePolygonAddress(formData.wallet_address) ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-300'}`}></span>
                    <span className="text-xs text-purple-700">
                      {formData.wallet_address 
                        ? (validatePolygonAddress(formData.wallet_address) 
                            ? '✓ Format Polygon wallet address valid' 
                            : '✗ Format wallet address tidak valid')
                        : 'Format: 0x + 40 karakter hexadecimal (Polygon network)'}
                    </span>
                  </div>
                  <p className="text-xs text-purple-600">
                    Wallet ini akan digunakan untuk menerima ijazah digital (SBT) di Polygon network
                  </p>
                  {formData.wallet_address && validatePolygonAddress(formData.wallet_address) && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handleWalletPreviewClick}
                        className="text-xs text-purple-600 hover:text-purple-800 flex items-center"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Lihat di Polygonscan: {formatWalletAddress(formData.wallet_address)}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                      disabled={loading}
                    >
                      Generate Password
                    </button>
                    {formData.password && (
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                        disabled={loading}
                      >
                        Salin Password
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                  required
                  disabled={loading}
                />
                <div className="mt-3 text-xs text-gray-500 space-y-1">
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span>Minimal 6 karakter</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span>Rekomendasi: minimal 8 karakter</span>
                  </div>
                </div>
              </div>

              {/* Informasi Akun */}
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">Informasi Akun yang Akan Dibuat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-green-700">Role:</span>
                    <span className="ml-2 font-medium">Mahasiswa</span>
                  </div>
                  <div>
                    <span className="text-green-700">Status:</span>
                    <span className="ml-2 font-medium text-green-600">Aktif</span>
                  </div>
                  <div>
                    <span className="text-green-700">Login dengan:</span>
                    <span className="ml-2 font-medium">NPM & Password</span>
                  </div>
                  <div>
                    <span className="text-green-700">Blockchain Network:</span>
                    <span className="ml-2 font-medium text-purple-600">Polygon</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-green-700">Ijazah akan dikirim ke:</span>
                    <span className="ml-2 font-medium font-mono text-xs break-all">
                      {formData.wallet_address ? formatWalletAddress(formData.wallet_address) : '[wallet address]'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                disabled={loading}
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Membuat Akun...
                  </span>
                ) : (
                  'Buat Akun'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Catatan Penting */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Catatan Penting
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Password akan dienkripsi menggunakan bcrypt sebelum disimpan</li>
              <li>• NPM harus 8 digit angka dan unik</li>
              <li>• Login menggunakan NPM dan password</li>
              <li>• Akun akan langsung aktif dan bisa digunakan untuk login</li>
              <li>• Pastikan password yang dihasilkan disimpan dengan aman</li>
              <li>• Polygon wallet address harus dalam format yang valid (0x...)</li>
              <li>• Ijazah digital (SBT) akan dikirim ke Polygon wallet address ini</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}