"use client";

import { MintStep } from '../types/ijazah';

// Interface yang sesuai dengan API Diploma
interface PopupDiplomaData {
  id: number;
  namaMahasiswa: string;
  npm: string;
  programStudi: string;
  fakultas?: string;
  gelarAkademik: string;
  tanggalKelulusan: string;
  tahunLulus: string;
  walletAddress?: string;
  ipfs: string;
  alamatPenerbit?: string;
  tokenID?: string;
  certificateId: string;
  status: 'Pending' | 'Minted';
  selected: boolean;
}

interface MintPopupProps {
  mintStep: MintStep;
  currentMintingItem: PopupDiplomaData | null;
  mintProgress: {
    isUploading: boolean;
    uploadProgress: number;
    isMinting: boolean;
    estimatedGas: string;
  };
  onUploadToIPFS: () => Promise<void>;
  onMintToBlockchain: () => Promise<void>;
  onClose: () => void;
}

export default function MintPopup({
  mintStep,
  currentMintingItem,
  mintProgress,
  onUploadToIPFS,
  onMintToBlockchain,
  onClose
}: MintPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* POPUP 1: Upload ke IPFS */}
        {mintStep === 'ipfs_upload' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                📤 Upload ke IPFS (Simulasi)
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-3">💡</div>
                  <div>
                    <p className="font-medium text-blue-800">Mode Sandbox</p>
                    <p className="text-sm text-blue-600 mt-1">Ini hanya simulasi. Tidak ada upload ke IPFS nyata.</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Simulasi upload ijazah <strong>{currentMintingItem?.namaMahasiswa}</strong> ke IPFS...
              </p>
              
              {!mintProgress.isUploading ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-4">🚀</div>
                  <p className="text-gray-600 mb-2">Siap untuk simulasi upload</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Klik tombol untuk mulai simulasi proses
                  </p>
                  <button
                    onClick={onUploadToIPFS}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Mulai Simulasi Upload
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          Simulating...
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600">
                          {mintProgress.uploadProgress}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div 
                        style={{ width: `${mintProgress.uploadProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    <p>⏳ Simulasi upload ke IPFS...</p>
                    <p className="mt-1">Mode sandbox - tidak ada data nyata yang diupload</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">📝 Informasi Simulasi:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Proses ini hanya simulasi (sandbox mode)</li>
                <li>CID yang dihasilkan adalah dummy/random</li>
                <li>Tidak ada biaya atau upload nyata</li>
                <li>Data tersimpan ke Database MySQL</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* POPUP 2: Mint ke Blockchain */}
        {mintStep === 'blockchain_mint' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                🏗️ Mint ke Blockchain (Simulasi)
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="text-green-600 mr-3">✅</div>
                  <div>
                    <p className="font-medium text-green-800">Simulasi Upload IPFS Selesai!</p>
                    <p className="text-sm text-green-600 mt-1">Mode sandbox - tidak ada upload nyata</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Detail Minting (Simulasi)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama Mahasiswa:</span>
                      <span className="font-medium">{currentMintingItem?.namaMahasiswa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">NIM:</span>
                      <span className="font-mono">{currentMintingItem?.npm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificate ID:</span>
                      <span className="font-mono">{currentMintingItem?.certificateId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-yellow-600">Verified → Minted</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-3">💰</div>
                    <div>
                      <p className="font-medium text-yellow-800">Biaya Gas Fee (Simulasi)</p>
                      <p className="text-2xl font-bold text-yellow-700 mt-1">
                        {mintProgress.estimatedGas} MATIC
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Mode sandbox - tidak ada pembayaran nyata
                      </p>
                    </div>
                  </div>
                </div>
                
                {!mintProgress.isMinting ? (
                  <button
                    onClick={onMintToBlockchain}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Simulasi Mint SBT
                  </button>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Simulasi minting ke blockchain...</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Mode sandbox - tidak ada transaksi blockchain nyata
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* POPUP 3: Success */}
        {mintStep === 'success' && (
          <div className="p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl text-green-600">✅</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                🎉 Simulasi Berhasil!
              </h3>
              <p className="text-gray-600 mb-4">
                Ijazah <strong>{currentMintingItem?.namaMahasiswa}</strong> berhasil di-mint (simulasi)!
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-3">ℹ️</div>
                  <div>
                    <p className="font-medium text-blue-800">Mode Sandbox Aktif</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Status berubah menjadi "Minted" di database MySQL.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Nama:</span>
                  <span className="font-medium">{currentMintingItem?.namaMahasiswa}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">NIM:</span>
                  <span className="font-mono">{currentMintingItem?.npm}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Certificate ID:</span>
                  <span className="font-mono">{currentMintingItem?.certificateId}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Token ID:</span>
                  <span className="font-mono">{currentMintingItem?.tokenID || 'Generated after mint'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Status:</span>
                  <span className="font-medium text-green-600">MINTED</span>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Tutup & Lanjutkan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}