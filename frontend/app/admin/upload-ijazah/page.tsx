'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { diplomaAPI } from '@/app/services/api';

interface FormData {
  // Data Mahasiswa
  nama_lengkap: string;
  nim: string;
  nik: string;
  tempat_tanggal_lahir: string;
  program_studi: string;
  fakultas: string;
  gelar_akademik: string;
  
  // Data Akademik
  tanggal_lulus: string;
  tahun_akademik: string;
  nomor_sk_rektor: string;
  tanggal_sk_rektor: string;
  ipk: string;
  judul_skripsi: string;
  yudisium: string;
  
  // Wallet Address
  wallet_address: string;
  
  // Upload File
  ijazah_file: File | null;
  
  // Data Sistem (auto-generated atau dari backend)
  certificate_id: string;
  uploaded_by: string;
}

export default function UploadIjazah() {
  const router = useRouter();
  
  // Data kosong sebagai initial state
  const initialEmptyFormData: FormData = {
    nama_lengkap: '',
    nim: '',
    nik: '',
    tempat_tanggal_lahir: '',
    program_studi: '',
    fakultas: '',
    gelar_akademik: '',
    
    tanggal_lulus: '',
    tahun_akademik: new Date().getFullYear().toString(),
    nomor_sk_rektor: '',
    tanggal_sk_rektor: '',
    ipk: '',
    judul_skripsi: '',
    yudisium: '',
    
    wallet_address: '',
    
    ijazah_file: null,
    
    certificate_id: '',
    uploaded_by: 'admin'
  };

  const [formData, setFormData] = useState<FormData>(initialEmptyFormData);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [certificateId, setCertificateId] = useState('');

  // Generate certificate ID
  useEffect(() => {
    const generateCertificateId = () => {
      setIsGeneratingCertificate(true);
      // Format: UWD-YYYY-NNNNNN (6 digit random)
      const year = new Date().getFullYear();
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digit
      const certId = `UWD-${year}-${randomNum}`;
      setCertificateId(certId);
      setFormData(prev => ({ ...prev, certificate_id: certId }));
      setIsGeneratingCertificate(false);
    };

    if (!formData.certificate_id) {
      generateCertificateId();
    }
  }, []);

  // Update tahun akademik saat tahun lulus berubah
  useEffect(() => {
    if (formData.tanggal_lulus) {
      const date = new Date(formData.tanggal_lulus);
      const year = date.getFullYear();
      setFormData(prev => ({
        ...prev,
        tahun_akademik: `${year}/${year + 1}`
      }));
    }
  }, [formData.tanggal_lulus]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('File terlalu besar! Maksimum 10MB.');
        return;
      }
      
      if (file.type !== 'application/pdf') {
        alert('Hanya file PDF yang diperbolehkan!');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        ijazah_file: file
      }));
      setFileName(file.name);
      setFileSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Validasi data wajib
      const requiredFields = [
        'nama_lengkap',
        'nim',
        'nik',
        'program_studi',
        'tanggal_lulus',
        'nomor_sk_rektor',
        'wallet_address'
      ];

      const missingFields = requiredFields.filter(field => !formData[field as keyof FormData]);
      
      if (missingFields.length > 0) {
        setError(`Harap lengkapi semua field yang wajib diisi: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }
      
      // Validasi format wallet address
      const walletPattern = /^0x[a-fA-F0-9]{40}$/;
      if (!walletPattern.test(formData.wallet_address)) {
        setError('Format wallet address tidak valid! Harus dimulai dengan 0x dan diikuti 40 karakter hex.');
        setIsSubmitting(false);
        return;
      }
      
      // Validasi NIM (contoh: 202210370311001)
      const nimPattern = /^\d{15}$/;
      if (!nimPattern.test(formData.nim)) {
        setError('Format NIM tidak valid! Harus 15 digit angka.');
        setIsSubmitting(false);
        return;
      }
      
      // Validasi NIK (16 digit)
      const nikPattern = /^\d{16}$/;
      if (!nikPattern.test(formData.nik)) {
        setError('Format NIK tidak valid! Harus 16 digit angka.');
        setIsSubmitting(false);
        return;
      }
      
      // Validasi file
      if (!formData.ijazah_file) {
        setError('Harap pilih file ijazah PDF!');
        setIsSubmitting(false);
        return;
      }
      
      // Validasi IPK
      if (formData.ipk) {
        const ipkValue = parseFloat(formData.ipk);
        if (isNaN(ipkValue) || ipkValue < 0 || ipkValue > 4.0) {
          setError('IPK harus antara 0.00 dan 4.00');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Validasi tanggal
      const today = new Date();
      const lulusDate = new Date(formData.tanggal_lulus);
      if (lulusDate > today) {
        setError('Tanggal lulus tidak boleh di masa depan!');
        setIsSubmitting(false);
        return;
      }
      
      // Membuat FormData untuk API
      const formDataToSend = new FormData();
      
      // Tambahkan semua field form sesuai dengan struktur database
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'ijazah_file' && value !== null && value !== '') {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Tambahkan metadata file
      if (formData.ijazah_file) {
        formDataToSend.append('nama_file', formData.ijazah_file.name);
        formDataToSend.append('ukuran_file', formData.ijazah_file.size.toString());
        formDataToSend.append('tipe_file', formData.ijazah_file.type);
        formDataToSend.append('ijazah_file', formData.ijazah_file);
      }
      
      // Kirim ke API
      console.log('Mengirim data ke API:', {
        certificate_id: formData.certificate_id,
        nama_lengkap: formData.nama_lengkap,
        nim: formData.nim,
        program_studi: formData.program_studi
      });
      
      const response = await diplomaAPI.uploadDiploma(formDataToSend);
      
      // Tampilkan informasi sukses
      alert(`✅ Ijazah berhasil diupload!\n\nCertificate ID: ${response.data?.certificate_id || formData.certificate_id}\nNama: ${formData.nama_lengkap}\nStatus: ${response.data?.status || 'pending'}\n\nData akan diverifikasi sebelum di-mint sebagai SBT.`);
      
      // Reset form setelah submit sukses
      resetForm();
      
      
      
    } catch (err: any) {
      console.error('Upload error:', err);
      
      // Handle specific error messages
      if (err.response?.data?.error) {
        setError(err.response.data.error);
        if (err.response.data.error.includes('NIM sudah terdaftar')) {
          alert('❌ NIM sudah terdaftar dalam sistem!');
        }
      } else if (err.message.includes('Network Error')) {
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
        alert('❌ Gagal terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat mengupload data.');
        alert('❌ Gagal mengupload ijazah: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk reset form ke kondisi awal (semua kosong)
  const resetForm = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newCertificateId = `UWD-${year}-${randomNum}`;
    
    setFormData({
      ...initialEmptyFormData,
      certificate_id: newCertificateId,
      tahun_akademik: year.toString()
    });
    setFileName('');
    setFileSize('');
    setCertificateId(newCertificateId);
    setError('');
    
    // Reset file input jika ada
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const input = document.getElementById('fileInput') as HTMLInputElement;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(files[0]);
        input.files = dataTransfer.files;
        handleFileChange({ target: { files: dataTransfer.files } } as ChangeEvent<HTMLInputElement>);
      }
    }
  };

  // Data untuk dropdown
  const programStudiOptions = [
    'Informatika',
    'Sistem Informasi',
    'Teknik Elektro',
    'Teknik Industri',
    'Manajemen',
    'Akuntansi',
    'Hukum',
    'Psikologi',
    'Kedokteran',
    'Farmasi',
    'Arsitektur',
    'Teknik Sipil'
  ];

  const fakultasOptions = [
    'Fakultas Teknologi Informasi',
    'Fakultas Teknik',
    'Fakultas Ekonomi dan Bisnis',
    'Fakultas Hukum',
    'Fakultas Psikologi',
    'Fakultas Kedokteran',
    'Fakultas Farmasi',
    'Fakultas Arsitektur dan Desain'
  ];

  const gelarOptions = [
    'Sarjana Komputer (S.Kom.)',
    'Sarjana Teknik (S.T.)',
    'Sarjana Ekonomi (S.E.)',
    'Sarjana Hukum (S.H.)',
    'Sarjana Psikologi (S.Psi.)',
    'Sarjana Kedokteran (S.Ked.)',
    'Sarjana Farmasi (S.Farm.)',
    'Sarjana Arsitektur (S.Ars.)'
  ];

  const yudisiumOptions = [
    'Dengan Pujian (Cum Laude)',
    'Sangat Memuaskan',
    'Memuaskan',
    'Lulus'
  ];

  // Fungsi untuk mengecek apakah form masih kosong
  const isFormEmpty = () => {
    return (
      formData.nama_lengkap === '' &&
      formData.nim === '' &&
      formData.nik === '' &&
      formData.tempat_tanggal_lahir === '' &&
      formData.program_studi === '' &&
      formData.fakultas === '' &&
      formData.gelar_akademik === '' &&
      formData.tanggal_lulus === '' &&
      formData.tahun_akademik === '' &&
      formData.nomor_sk_rektor === '' &&
      formData.tanggal_sk_rektor === '' &&
      formData.ipk === '' &&
      formData.judul_skripsi === '' &&
      formData.yudisium === '' &&
      formData.wallet_address === '' &&
      fileName === ''
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header dengan badge ADMIN */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <span className="mr-2">👨‍💼</span>
            MODE ADMIN - Upload Ijazah Digital
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            📤 Upload Ijazah Digital
          </h1>
          <p className="text-gray-600">
            Sebagai admin, Anda dapat mengupload ijazah untuk diverifikasi dan di-mint sebagai Soulbound Token (SBT)
          </p>
          
          {/* Notifikasi untuk admin */}
          <div className="mt-6 max-w-3xl mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">
                <span className="text-blue-600">ℹ️</span>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Informasi Upload Admin</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Certificate ID</strong>: {certificateId} (auto-generated)</li>
                  <li>• Data akan disimpan dengan status <strong>pending</strong></li>
                  <li>• Pastikan dokumen asli sudah diverifikasi fisiknya</li>
                  <li>• Mahasiswa dapat memverifikasi dengan NIM mereka</li>
                  <li>• Setelah verifikasi, data siap di-mint sebagai SBT</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="mr-3">
                <span className="text-red-600">❌</span>
              </div>
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Section 1: Data Mahasiswa */}
            <div className="mb-10 pb-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                Data Mahasiswa <span className="text-sm font-normal text-gray-500">(Wajib diisi)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Masukkan nama lengkap sesuai ijazah"
                    required
                    maxLength={255}
                  />
                </div>

                {/* NIM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIM (Nomor Induk Mahasiswa) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nim"
                    value={formData.nim}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="15 digit NIM (contoh: 202210370311001)"
                    required
                    pattern="\d{15}"
                    title="Masukkan 15 digit NIM"
                  />
                  <p className="text-xs text-gray-500 mt-1">15 digit angka NIM</p>
                </div>

                {/* NIK */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIK (Nomor Induk Kependidikan) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="16 digit NIK"
                    required
                    pattern="\d{16}"
                    title="Masukkan 16 digit NIK"
                  />
                  <p className="text-xs text-gray-500 mt-1">16 digit angka NIK</p>
                </div>

                {/* Tempat, Tanggal Lahir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempat, Tanggal Lahir
                  </label>
                  <input
                    type="text"
                    name="tempat_tanggal_lahir"
                    value={formData.tempat_tanggal_lahir}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Contoh: Jakarta, 01 Januari 2000"
                    maxLength={100}
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Pilih Program Studi</option>
                    {programStudiOptions.map((prodi) => (
                      <option key={prodi} value={prodi}>{prodi}</option>
                    ))}
                  </select>
                </div>

                {/* Fakultas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fakultas
                  </label>
                  <select
                    name="fakultas"
                    value={formData.fakultas}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Pilih Fakultas</option>
                    {fakultasOptions.map((fakultas) => (
                      <option key={fakultas} value={fakultas}>{fakultas}</option>
                    ))}
                  </select>
                </div>

                {/* Gelar Akademik */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gelar Akademik <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gelar_akademik"
                    value={formData.gelar_akademik}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  >
                    <option value="">Pilih Gelar Akademik</option>
                    {gelarOptions.map((gelar) => (
                      <option key={gelar} value={gelar}>{gelar}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Data Akademik */}
            <div className="mb-10 pb-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                Data Akademik
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tanggal Lulus */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Lulus <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal_lulus"
                    value={formData.tanggal_lulus}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Tahun Akademik (auto-generated) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun Akademik
                  </label>
                  <input
                    type="text"
                    name="tahun_akademik"
                    value={formData.tahun_akademik}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated dari tanggal lulus</p>
                </div>

                {/* Nomor SK Rektor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor SK Rektor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nomor_sk_rektor"
                    value={formData.nomor_sk_rektor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Contoh: 123/UN.01/SK/2024"
                    required
                    maxLength={100}
                  />
                </div>

                {/* Tanggal SK Rektor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal SK Rektor
                  </label>
                  <input
                    type="date"
                    name="tanggal_sk_rektor"
                    value={formData.tanggal_sk_rektor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* IPK */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IPK (Indeks Prestasi Kumulatif)
                  </label>
                  <input
                    type="number"
                    name="ipk"
                    value={formData.ipk}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="4.0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="0.00 - 4.00"
                  />
                </div>

                {/* Yudisium */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yudisium
                  </label>
                  <select
                    name="yudisium"
                    value={formData.yudisium}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="">Pilih Yudisium</option>
                    {yudisiumOptions.map((yudisium) => (
                      <option key={yudisium} value={yudisium}>{yudisium}</option>
                    ))}
                  </select>
                </div>

                {/* Judul Skripsi */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Skripsi/Tugas Akhir
                  </label>
                  <textarea
                    name="judul_skripsi"
                    value={formData.judul_skripsi}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Masukkan judul skripsi atau tugas akhir lengkap"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">Maksimal 1000 karakter</p>
                </div>
              </div>
            </div>

            {/* Section 3: Wallet Address */}
            <div className="mb-10 pb-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                Wallet Address
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Wallet Penerima SBT <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="wallet_address"
                  value={formData.wallet_address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono"
                  placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                  pattern="^0x[a-fA-F0-9]{40}$"
                  required
                  maxLength={42}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Alamat wallet Ethereum (0x diikuti 40 karakter hex). Wallet ini akan menerima Soulbound Token ijazah.
                </p>
              </div>
            </div>

            {/* Section 4: Upload File Ijazah */}
            <div className="mb-10 pb-8 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                Upload File Ijazah <span className="text-sm font-normal text-gray-500">(PDF maksimal 10MB)</span>
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih File Ijazah (PDF) <span className="text-red-500">*</span>
                </label>
                
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    fileName 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <div className="text-5xl mb-4">📄</div>
                  <p className="text-lg text-gray-700 mb-2 font-medium">
                    {fileName ? 'File berhasil dipilih!' : 'Klik atau tarik file ke sini'}
                  </p>
                  <p className="text-gray-500 mb-4">
                    {fileName || 'Format yang didukung: PDF (Maks. 10MB)'}
                  </p>
                  
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                    id="fileInput"
                    required={!fileName}
                  />
                  
                  <div className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition">
                    {fileName ? 'Ganti File' : 'Pilih File PDF'}
                  </div>
                </div>
                
                {fileName && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-medium">{fileName}</p>
                        <p className="text-green-600 text-sm mt-1">
                          Ukuran: {fileSize} • Tipe: PDF
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, ijazah_file: null }));
                          setFileName('');
                          setFileSize('');
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Data Sistem */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
                Data Sistem
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Certificate ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="certificate_id"
                      value={formData.certificate_id}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                      readOnly
                    />
                    {isGeneratingCertificate && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">ID unik untuk ijazah (auto-generated)</p>
                </div>

                {/* Uploader Info */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <span className="text-gray-600">👨‍💼</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Uploader</h4>
                      <p className="text-gray-600">Admin</p>
                      <p className="text-xs text-gray-500 mt-1">Status: <span className="text-yellow-600 font-medium">Pending</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Data akan disimpan dengan status <strong>pending</strong> dan dapat di-mint sebagai SBT setelah verifikasi.
                Setelah di-mint, akan muncul informasi blockchain seperti transaction hash, contract address, dan token ID.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-gray-200 gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center"
                  disabled={isFormEmpty()}
                >
                  <span className="mr-2">👁️</span>
                  {showPreview ? 'Sembunyikan Preview' : 'Lihat Preview Data'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/admin/data-ijazah')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center"
                >
                  <span className="mr-2">📋</span>
                  Lihat Data Ijazah
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin mengosongkan semua data? Semua data yang sudah diisi akan hilang.')) {
                      resetForm();
                    }
                  }}
                  className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition flex items-center"
                  disabled={isFormEmpty()}
                >
                  <span className="mr-2">🗑️</span>
                  Reset Form
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-medium transition flex items-center ${
                    isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📤</span>
                      Upload & Simpan Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Preview Data Ijazah</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Certificate ID: {formData.certificate_id}</p>
              </div>
              
              <div className="p-6">
                {isFormEmpty() ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">📝</div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Belum ada data</h4>
                    <p className="text-gray-500">Isi form terlebih dahulu untuk melihat preview</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {/* Certificate ID Banner */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="mr-3">
                            <span className="text-blue-600">🏷️</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Certificate ID</p>
                            <p className="font-mono font-bold text-blue-700">{formData.certificate_id}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">Data Mahasiswa</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Nama Lengkap</p>
                            <p className="font-medium">{formData.nama_lengkap || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">NIM</p>
                            <p className="font-medium font-mono">{formData.nim || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">NIK</p>
                            <p className="font-medium font-mono">{formData.nik || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tempat/Tgl Lahir</p>
                            <p className="font-medium">{formData.tempat_tanggal_lahir || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Program Studi</p>
                            <p className="font-medium">{formData.program_studi || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fakultas</p>
                            <p className="font-medium">{formData.fakultas || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Gelar Akademik</p>
                            <p className="font-medium">{formData.gelar_akademik || '-'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">Data Akademik</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Tanggal Lulus</p>
                            <p className="font-medium">{formData.tanggal_lulus || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tahun Akademik</p>
                            <p className="font-medium">{formData.tahun_akademik || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Nomor SK Rektor</p>
                            <p className="font-medium">{formData.nomor_sk_rektor || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tanggal SK Rektor</p>
                            <p className="font-medium">{formData.tanggal_sk_rektor || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">IPK</p>
                            <p className="font-medium">{formData.ipk || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Yudisium</p>
                            <p className="font-medium">{formData.yudisium || '-'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-sm text-gray-500">Judul Skripsi/Tugas Akhir</p>
                            <p className="font-medium text-sm">{formData.judul_skripsi || '-'}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">Wallet Address</h4>
                        <div className="p-3 bg-gray-100 rounded">
                          <p className="font-mono text-sm break-all">{formData.wallet_address || '-'}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">File Ijazah</h4>
                        <div className="flex items-center p-3 bg-gray-50 rounded">
                          <div className="mr-3 text-2xl">📄</div>
                          <div>
                            <p className="font-medium">{fileName || 'Belum ada file'}</p>
                            {fileSize && <p className="text-sm text-gray-500">Ukuran: {fileSize}</p>}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 pb-2 border-b">Data Sistem</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-500">Uploader</p>
                            <p className="font-medium">Admin</p>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded">
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-medium text-yellow-600">Pending</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setShowPreview(false)}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        Tutup Preview
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}