"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { addIjazah, IjazahData } from '../utils/ijazahStorage'; // Import fungsi dari storage

interface FormData {
  // Data Mahasiswa
  namaMahasiswa: string;
  npm: string;
  nik: string;
  tempatTanggalLahir: string;
  programStudi: string;
  fakultas: string;
  gelarAkademik: string;
  
  // Data Akademik
  tanggalKelulusan: string;
  tahunLulus: string;
  nomorSKRektor: string;
  tanggalSKRektor: string;
  
  // Wallet Address
  walletAddress: string;
  
  // Upload File
  fileIjazah: File | null;
  
  // Data Sistem
  tokenID: string;
  alamatPenerbit: string;
  ipfsHash: string;
}

export default function UploadIjazah() {
  // Data kosong sebagai initial state
  const initialEmptyFormData: FormData = {
    namaMahasiswa: '',
    npm: '',
    nik: '',
    tempatTanggalLahir: '',
    programStudi: '',
    fakultas: '',
    gelarAkademik: '',
    
    tanggalKelulusan: '',
    tahunLulus: '',
    nomorSKRektor: '',
    tanggalSKRektor: '',
    
    walletAddress: '',
    
    fileIjazah: null,
    
    tokenID: `UWD-${new Date().getFullYear()}-001`,
    alamatPenerbit: '0x1234567890abcdef1234567890abcdef12345678',
    ipfsHash: ''
  };

  const [formData, setFormData] = useState<FormData>(initialEmptyFormData);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [nextTokenNumber, setNextTokenNumber] = useState(1);

  // Inisialisasi form kosong saat pertama kali dibuka
  useEffect(() => {
    resetForm();
  }, []);

  // Update token ID ketika tahun lulus berubah
  useEffect(() => {
    const year = formData.tahunLulus || new Date().getFullYear();
    setFormData(prev => ({
      ...prev,
      tokenID: `UWD-${year}-${nextTokenNumber.toString().padStart(3, '0')}`
    }));
  }, [formData.tahunLulus, nextTokenNumber]);

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
        fileIjazah: file
      }));
      setFileName(file.name);
      
      // Simulasi mendapatkan IPFS Hash setelah upload
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
        }));
      }, 1000);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Data yang diupload:', formData);
      
      // Validasi data wajib
      if (!formData.namaMahasiswa || !formData.npm || !formData.nik || 
          !formData.programStudi || !formData.tahunLulus || 
          !formData.nomorSKRektor || !formData.walletAddress) {
        alert('Harap lengkapi semua field yang wajib diisi!');
        setIsSubmitting(false);
        return;
      }
      
      // Validasi format wallet address
      const walletPattern = /^0x[a-fA-F0-9]{40}$/;
      if (!walletPattern.test(formData.walletAddress)) {
        alert('Format wallet address tidak valid! Harus dimulai dengan 0x dan diikuti 40 karakter hex.');
        setIsSubmitting(false);
        return;
      }
      
      // Validasi file
      if (!formData.fileIjazah) {
        alert('Harap pilih file ijazah PDF!');
        setIsSubmitting(false);
        return;
      }
      
      // Simulasi upload ke blockchain/IPFS
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // === SIMPAN DATA KE SISTEM ===
      const newIjazahData: Omit<IjazahData, 'id' | 'status'> = {
        namaMahasiswa: formData.namaMahasiswa,
        npm: formData.npm,
        nik: formData.nik,
        tempatTanggalLahir: formData.tempatTanggalLahir,
        programStudi: formData.programStudi,
        fakultas: formData.fakultas,
        gelarAkademik: formData.gelarAkademik,
        tahunLulus: formData.tahunLulus,
        tanggalKelulusan: formData.tanggalKelulusan,
        nomorSKRektor: formData.nomorSKRektor,
        tanggalSKRektor: formData.tanggalSKRektor,
        walletAddress: formData.walletAddress,
        tokenID: formData.tokenID,
        ipfs: formData.ipfsHash || `Qm${Date.now().toString(36)}`,
        alamatPenerbit: formData.alamatPenerbit,
        selected: false, // Added to fulfill the required property
      };
      
      // Simpan ke storage (localStorage)
      const savedIjazah = addIjazah(newIjazahData);
      
      // Tampilkan informasi sukses
      alert(`Data ijazah berhasil diupload!\n\nToken ID: ${savedIjazah.tokenID}\nNama: ${savedIjazah.namaMahasiswa}\nStatus: ${savedIjazah.status}\n\nData sekarang muncul di halaman Mint SBT dan Dashboard.`);
      
      // Reset form setelah submit sukses
      resetForm();
      
      // Increment token number untuk berikutnya
      setNextTokenNumber(prev => prev + 1);
      
      // Dashboard akan auto-update melalui event listener
      
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat mengupload data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk reset form ke kondisi awal (semua kosong)
  const resetForm = () => {
    const year = new Date().getFullYear();
    const newTokenID = `UWD-${year}-${nextTokenNumber.toString().padStart(3, '0')}`;
    
    setFormData({
      ...initialEmptyFormData,
      tokenID: newTokenID
    });
    setFileName('');
    
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
    'Psikologi'
  ];

  const fakultasOptions = [
    'Teknologi Informasi',
    'Teknik',
    'Ekonomi dan Bisnis',
    'Hukum',
    'Psikologi'
  ];

  const gelarOptions = [
    'Sarjana Komputer (S.Kom.)',
    'Sarjana Teknik (S.T.)',
    'Sarjana Ekonomi (S.E.)',
    'Sarjana Hukum (S.H.)',
    'Sarjana Psikologi (S.Psi.)'
  ];

  const tahunLulusOptions = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i + 1);

  // Fungsi untuk mengecek apakah form masih kosong
  const isFormEmpty = () => {
    return (
      formData.namaMahasiswa === '' &&
      formData.npm === '' &&
      formData.nik === '' &&
      formData.tempatTanggalLahir === '' &&
      formData.programStudi === '' &&
      formData.fakultas === '' &&
      formData.gelarAkademik === '' &&
      formData.tanggalKelulusan === '' &&
      formData.tahunLulus === '' &&
      formData.nomorSKRektor === '' &&
      formData.tanggalSKRektor === '' &&
      formData.walletAddress === '' &&
      fileName === ''
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Upload Ijazah</h1>
        <p className="text-gray-600 mt-2">Upload data ijazah mahasiswa untuk diterbitkan SBT</p>
        <div className="mt-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
          <span className="font-medium">ℹ️ Data yang diupload akan:</span>
          <ul className="mt-1 ml-5 list-disc">
            <li>Tampil di halaman <strong>Mint SBT</strong> sebagai "Pending"</li>
            <li>Ditampilkan di <strong>Dashboard</strong> statistik real-time</li>
            <li>Disimpan di <strong>Data Ijazah</strong> untuk pengelolaan</li>
          </ul>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          {/* Section 1: Data Mahasiswa */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
              Data Mahasiswa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Mahasiswa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaMahasiswa"
                  value={formData.namaMahasiswa}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Masukkan nama lengkap mahasiswa"
                  required
                />
              </div>

              {/* NPM/NIM */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NPM / NIM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="npm"
                  value={formData.npm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Masukkan NPM/NIM"
                  required
                />
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
                  placeholder="Masukkan NIK"
                  required
                />
              </div>

              {/* Tempat, Tanggal Lahir */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempat, Tanggal Lahir
                </label>
                <input
                  type="text"
                  name="tempatTanggalLahir"
                  value={formData.tempatTanggalLahir}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Contoh: Kota, 01 Januari 2000"
                />
              </div>

              {/* Program Studi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Studi <span className="text-red-500">*</span>
                </label>
                <select
                  name="programStudi"
                  value={formData.programStudi}
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
                  Gelar Akademik
                </label>
                <select
                  name="gelarAkademik"
                  value={formData.gelarAkademik}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">Pilih Gelar</option>
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
              {/* Tanggal Kelulusan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Kelulusan
                </label>
                <input
                  type="date"
                  name="tanggalKelulusan"
                  value={formData.tanggalKelulusan}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Tahun Lulus */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Lulus <span className="text-red-500">*</span>
                </label>
                <select
                  name="tahunLulus"
                  value={formData.tahunLulus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                >
                  <option value="">Pilih Tahun Lulus</option>
                  {tahunLulusOptions.map((tahun) => (
                    <option key={tahun} value={tahun}>{tahun}</option>
                  ))}
                </select>
              </div>

              {/* Nomor SK Rektor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor SK Rektor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nomorSKRektor"
                  value={formData.nomorSKRektor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Masukkan nomor SK Rektor"
                  required
                />
              </div>

              {/* Tanggal SK Rektor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal SK Rektor
                </label>
                <input
                  type="date"
                  name="tanggalSKRektor"
                  value={formData.tanggalSKRektor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
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
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-mono"
                placeholder="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                pattern="^0x[a-fA-F0-9]{40}$"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Alamat wallet ini akan menerima SBT ijazah. Format harus valid (0x diikuti 40 karakter hex).
              </p>
            </div>
          </div>

          {/* Section 4: Upload File Ijazah */}
          <div className="mb-10 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">
              Upload File Ijazah
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
                        {formData.fileIjazah ? `Ukuran: ${(formData.fileIjazah.size / 1024 / 1024).toFixed(2)} MB` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, fileIjazah: null, ipfsHash: '' }));
                        setFileName('');
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
              {/* Token ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token ID (Auto-generate)
                </label>
                <input
                  type="text"
                  name="tokenID"
                  value={formData.tokenID}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                  readOnly
                />
                <p className="text-sm text-gray-500 mt-1">Format: UWD-Tahun-Urutan</p>
              </div>

              {/* Alamat Penerbit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Penerbit (Universitas)
                </label>
                <input
                  type="text"
                  name="alamatPenerbit"
                  value={formData.alamatPenerbit}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                  readOnly
                />
              </div>

              {/* IPFS Hash */}
              {formData.ipfsHash && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IPFS Hash
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg border border-gray-300">
                    <code className="text-sm text-gray-800 font-mono break-all">
                      {formData.ipfsHash}
                    </code>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Hash ini akan digunakan untuk verifikasi dokumen di blockchain
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-gray-200 gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={isFormEmpty()}
              >
                {showPreview ? 'Sembunyikan Preview' : 'Lihat Preview Data'}
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
                className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition"
                disabled={isFormEmpty()}
              >
                Reset Form
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-medium transition ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : 'Upload & Simpan Data'}
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
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Data Mahasiswa</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Nama Lengkap</p>
                          <p className="font-medium">{formData.namaMahasiswa || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">NPM/NIM</p>
                          <p className="font-medium">{formData.npm || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">NIK</p>
                          <p className="font-medium">{formData.nik || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tempat/Tgl Lahir</p>
                          <p className="font-medium">{formData.tempatTanggalLahir || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Program Studi</p>
                          <p className="font-medium">{formData.programStudi || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fakultas</p>
                          <p className="font-medium">{formData.fakultas || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Gelar Akademik</p>
                          <p className="font-medium">{formData.gelarAkademik || '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Data Akademik</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Tanggal Kelulusan</p>
                          <p className="font-medium">{formData.tanggalKelulusan || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tahun Lulus</p>
                          <p className="font-medium">{formData.tahunLulus || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Nomor SK Rektor</p>
                          <p className="font-medium">{formData.nomorSKRektor || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tanggal SK Rektor</p>
                          <p className="font-medium">{formData.tanggalSKRektor || '-'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Wallet Address</h4>
                      <div className="p-3 bg-gray-100 rounded">
                        <p className="font-mono text-sm break-all">{formData.walletAddress || '-'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">File Ijazah</h4>
                      <p className="font-medium">{fileName || 'Belum ada file'}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Data Sistem</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm text-gray-500">Token ID</p>
                          <p className="font-medium font-mono">{formData.tokenID}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">IPFS Hash</p>
                          <p className="font-medium font-mono text-xs break-all">{formData.ipfsHash || '-'}</p>
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
  );
}