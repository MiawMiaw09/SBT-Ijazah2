"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [inputAddress, setInputAddress] = useState('');
  const [showInput, setShowInput] = useState(false);
  const router = useRouter();

  // Daftar wallet address untuk demo
  const demoWallets = [
    "0x742E4C2B2e5D3E5A2206932a5f5a5E4C5B2A1B3C",
    "0x8a3B2C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B", 
    "0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A1B",
    "0x9C8B7A6F5E4D3C2B1A0F9E8D7C6B5A4F3E2D1C0B"
  ];

  const handleShowInput = () => {
    setShowInput(true);
  };

  const handleSelectDemoWallet = (address: string) => {
    setInputAddress(address);
  };

  const handleConnectWallet = async () => {
    if (!inputAddress.trim()) {
      alert('Masukkan alamat wallet terlebih dahulu!');
      return;
    }

    // Validasi format wallet address sederhana
    if (!inputAddress.startsWith('0x') || inputAddress.length < 10) {
      alert('Format alamat wallet tidak valid!');
      return;
    }

    setIsConnecting(true);
    
    try {
      // Simulasi koneksi wallet
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWalletAddress(inputAddress);
      
      // Redirect ke admin dashboard setelah 1.5 detik
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Gagal menghubungkan wallet. Coba lagi.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setInputAddress('');
    setShowInput(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo dan Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Image
                src="/gambar/UWD.png"
                alt="Universitas Widya Dharma Pontianak"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Universitas Widya Dharma
          </h1>
          <p className="text-blue-200 text-lg">Pontianak</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Halaman Login</h2>
            <p className="text-gray-600">Silahkan login dengan MetaMask</p>
          </div>

          {/* Wallet Connection Section */}
          <div className="space-y-6">
            {!showInput && !walletAddress ? (
              /* Tombol Masukkan Wallet Address Saja */
              <div className="space-y-4">
                <button
                  onClick={handleShowInput}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16h2v-2h-2v2zm0-4h2v-4h-2v4z"/>
                  </svg>
                  <span>Masukkan Wallet Address</span>
                </button>
              </div>
            ) : (
              /* Input Wallet Address */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputAddress}
                      onChange={(e) => setInputAddress(e.target.value)}
                      placeholder="0x..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono text-sm"
                      disabled={isConnecting || !!walletAddress}
                    />
                    {!walletAddress && (
                      <button
                        onClick={handleConnectWallet}
                        disabled={isConnecting || !inputAddress.trim()}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center min-w-[100px] ${
                          isConnecting || !inputAddress.trim()
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {isConnecting ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Connect'
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Demo Wallet Suggestions */}
                  {!walletAddress && inputAddress && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Contoh wallet address untuk testing:</p>
                      <div className="grid grid-cols-1 gap-1">
                        {demoWallets.map((wallet, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectDemoWallet(wallet)}
                            className="text-left p-2 text-xs font-mono bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                          >
                            {wallet}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Wallet Address Display setelah connect */}
                {walletAddress && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Wallet Address</span>
                      <button
                        onClick={handleDisconnect}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Disconnect
                      </button>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-300">
                      <p className="text-green-900 font-mono text-sm break-all">
                        {walletAddress}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 text-sm font-medium">
                        Redirecting to Admin Dashboard...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status Indicator */}
            <div className="text-center">
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                walletAddress 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  walletAddress ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm font-medium">
                  Status: {walletAddress ? 'Terhubung' : 'Belum terhubung'}
                </span>
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Informasi Login</h4>
                  <p className="text-sm text-blue-700">
                    Klik "Masukkan Wallet Address" untuk mulai. 
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-blue-200 text-sm">
            Sistem Ijazah Digital &copy; 2026 Universitas Widya Dharma Pontianak
          </p>
        </div>
      </div>
    </div>
  );
}