"use client";

import { MintStep } from '../types/ijazah';
import { diplomaAPI } from '../services/api';

interface PopupDiplomaData {
  id: number;
  namaMahasiswa: string;
  npm: string;
  nik: string;
  programStudi: string;
  fakultas?: string;
  gelarAkademik: string;
  tempattanggallahir: string;
  tanggalKelulusan: string;
  tahunLulus: string;
  walletAddress?: string;
  ipfs: string;
  alamatPenerbit?: string;
  tokenID?: string;
  certificateId: string;
  status: 'Pending' | 'Minted';
  selected: boolean;
  ipk?: number;
}

interface MintPopupProps {
  mintStep: MintStep;
  currentMintingItem: PopupDiplomaData | null;
  mintProgress: {
    isUploading: boolean;
    uploadProgress: number;
    isMinting: boolean;
    estimatedGas: string;
    txHash?: string;
    error?: string;
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
  if (!currentMintingItem) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">❌ Data Tidak Tersedia</h3>
          <p className="text-gray-600">Data untuk proses minting tidak ditemukan. Silakan coba lagi.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  // Fungsi untuk membuka explorer blockchain
  const openBlockExplorer = (txHash: string) => {
    const network = process.env.NEXT_PUBLIC_NETWORK === 'mainnet' ? '' : 'mumbai.';
    window.open(`https://${network}polygonscan.com/tx/${txHash}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* POPUP 1: Upload ke IPFS */}
        {mintStep === 'ipfs_upload' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                📤 Upload ke IPFS
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
                  <div className="text-blue-600 mr-3">ℹ️</div>
                  <div>
                    <p className="font-medium text-blue-800">Upload ke IPFS</p>
                    <p className="text-sm text-blue-600 mt-1">Mengupload data ijazah ke IPFS via Pinata</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">
                Upload ijazah <strong>{currentMintingItem.namaMahasiswa}</strong> ke IPFS...
              </p>
              
              {!mintProgress.isUploading ? (
                <div className="text-center py-4">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-gray-600 mb-2">Siap untuk upload ke IPFS</p>
                  <p className="text-sm text-gray-500 mb-6">
                    Data akan diupload ke IPFS dan mendapatkan CID
                  </p>
                  <button
                    onClick={onUploadToIPFS}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Upload ke IPFS
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                          Uploading...
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
                    <p>⏳ Mengupload ke IPFS via Pinata...</p>
                    {mintProgress.error && (
                      <p className="text-red-500 mt-2">{mintProgress.error}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">📝 Informasi Upload:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Data akan diupload ke IPFS menggunakan Pinata</li>
                <li>File akan disimpan dengan format JSON</li>
                <li>CID akan disimpan di database</li>
                <li>IPFS Hash: {currentMintingItem.ipfs || 'Belum diupload'}</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* POPUP 2: Mint ke Blockchain */}
        {mintStep === 'blockchain_mint' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                🏗️ Mint ke Blockchain
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
                    <p className="font-medium text-green-800">Upload IPFS Berhasil!</p>
                    <p className="text-sm text-green-600 mt-1">
                      CID: {currentMintingItem.ipfs || 'IPFS Hash'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Detail Minting</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nama Mahasiswa:</span>
                      <span className="font-medium">{currentMintingItem.namaMahasiswa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">NIM:</span>
                      <span className="font-mono">{currentMintingItem.npm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificate ID:</span>
                      <span className="font-mono">{currentMintingItem.certificateId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IPFS Hash:</span>
                      <span className="font-mono text-xs">{currentMintingItem.ipfs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wallet Address:</span>
                      <span className="font-mono text-xs">{currentMintingItem.walletAddress || 'Belum ditentukan'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-3">💰</div>
                    <div>
                      <p className="font-medium text-yellow-800">Biaya Gas Fee</p>
                      <p className="text-2xl font-bold text-yellow-700 mt-1">
                        {mintProgress.estimatedGas} MATIC
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        Estimasi biaya untuk minting SBT
                      </p>
                    </div>
                  </div>
                </div>
                
                {!mintProgress.isMinting ? (
                  <button
                    onClick={onMintToBlockchain}
                    className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Mint SBT ke Blockchain
                  </button>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Minting ke blockchain Polygon...</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Mohon tunggu, transaksi sedang diproses
                    </p>
                    {mintProgress.error && (
                      <p className="text-red-500 text-sm mt-2">{mintProgress.error}</p>
                    )}
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
                🎉 Minting Berhasil!
              </h3>
              <p className="text-gray-600 mb-4">
                Ijazah <strong>{currentMintingItem.namaMahasiswa}</strong> berhasil di-mint ke blockchain!
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-3">ℹ️</div>
                  <div className="text-left w-full">
                    <p className="font-medium text-blue-800">Detail Transaksi</p>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Token ID:</span>
                        <span className="font-mono text-blue-800">{currentMintingItem.tokenID}</span>
                      </div>
                      {mintProgress.txHash && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Tx Hash:</span>
                          <button
                            onClick={() => openBlockExplorer(mintProgress.txHash!)}
                            className="font-mono text-blue-600 hover:underline truncate max-w-[200px]"
                          >
                            {mintProgress.txHash.substring(0, 10)}...{mintProgress.txHash.substring(58)}
                          </button>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-blue-700">IPFS CID:</span>
                        <span className="font-mono text-blue-600 truncate max-w-[150px]">
                          {currentMintingItem.ipfs}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Nama:</span>
                  <span className="font-medium">{currentMintingItem.namaMahasiswa}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">NIM:</span>
                  <span className="font-mono">{currentMintingItem.npm}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Certificate ID:</span>
                  <span className="font-mono">{currentMintingItem.certificateId}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Token ID:</span>
                  <span className="font-mono">{currentMintingItem.tokenID}</span>
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