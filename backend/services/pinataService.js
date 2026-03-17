// backend/services/pinataService.js
const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');

dotenv.config();

class PinataService {
  constructor() {
    this.jwt = process.env.PINATA_JWT;
    this.apiUrl = 'https://api.pinata.cloud';
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.jwt}`
    };
  }

  // ========== FUNGSI UNTUK UPLOAD FILE (PDF, Gambar, dll) ==========
  // @desc    Upload file ke IPFS via Pinata
  // @param   {Stream} fileStream - Stream file yang akan diupload
  // @param   {string} fileName - Nama file (contoh: ijazah-123456.pdf)
  // @returns {Object} Hasil upload dengan IPFS hash
  async uploadFile(fileStream, fileName) {
    try {
      console.log(`📤 Uploading file to IPFS: ${fileName}`);
      
      const formData = new FormData();
      formData.append('file', fileStream, {
        filename: fileName,
        contentType: 'application/pdf', // Default PDF, bisa disesuaikan
      });
      
      formData.append('pinataMetadata', JSON.stringify({
        name: fileName,
        // Bisa tambahkan metadata lain jika perlu
        keyvalues: {
          type: 'diploma',
          uploadTime: new Date().toISOString()
        }
      }));

      // Opsional: Tambahkan options untuk penamaan di gateway
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1,
        wrapWithDirectory: false
      }));

      const response = await axios.post(
        `${this.apiUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(), // Penting: gabungkan headers FormData
            'Content-Type': 'multipart/form-data',
          },
          maxContentLength: Infinity, // Untuk file besar
          maxBodyLength: Infinity,
          timeout: 60000 // 60 detik timeout untuk file besar
        }
      );

      console.log('✅ File uploaded! IPFS Hash:', response.data.IpfsHash);
      console.log(`📄 File name on Pinata: ${fileName}`);
      
      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        ipfsUrl: `ipfs://${response.data.IpfsHash}`,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        fileName: fileName,
        size: response.data.PinSize || null,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ File upload failed:', error.response?.data || error.message);
      
      // Log detail error untuk debugging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        details: error.response?.data || null
      };
    }
  }

  // ========== FUNGSI UNTUK UPLOAD JSON (METADATA) ==========
  // @desc    Upload JSON ke IPFS via Pinata
  // @param   {Object} data - Data JSON yang akan diupload
  // @param   {string} fileName - Nama file (contoh: JOHN_DOE-123456.json)
  // @returns {Object} Hasil upload dengan IPFS hash
  async uploadJSON(data, fileName = 'diploma.json') {
    try {
      console.log(`📤 Uploading JSON to IPFS via Pinata as: ${fileName}`);
      
      // Validasi data
      if (!data || typeof data !== 'object') {
        throw new Error('Data harus berupa object valid');
      }

      const response = await axios.post(
        `${this.apiUrl}/pinning/pinJSONToIPFS`,
        {
          pinataMetadata: {
            name: fileName,
            keyvalues: {
              type: 'diploma-metadata',
              uploadTime: new Date().toISOString()
            }
          },
          pinataContent: data,
          pinataOptions: {
            cidVersion: 1
          }
        },
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 detik untuk JSON
        }
      );

      console.log('✅ JSON upload successful! IPFS Hash:', response.data.IpfsHash);
      console.log(`📄 File name on Pinata: ${fileName}`);
      
      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        ipfsUrl: `ipfs://${response.data.IpfsHash}`,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
        fileName: fileName,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Pinata JSON upload failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        details: error.response?.data || null
      };
    }
  }

  // ========== FUNGSI UNTUK MENDAPATKAN FILE DARI IPFS ==========
  // @desc    Mendapatkan URL gateway untuk file IPFS
  // @param   {string} ipfsHash - Hash IPFS
  // @param   {string} gateway - Nama gateway (pinata, ipfs, cloudflare)
  // @returns {string} URL file melalui gateway
  getGatewayUrl(ipfsHash, gateway = 'pinata') {
    if (!ipfsHash) return null;
    
    const gateways = {
      pinata: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
      ipfs: `https://ipfs.io/ipfs/${ipfsHash}`,
      cloudflare: `https://cloudflare-ipfs.com/ipfs/${ipfsHash}`,
      dweb: `https://dweb.link/ipfs/${ipfsHash}`
    };
    
    return gateways[gateway] || gateways.pinata;
  }

  // ========== FUNGSI UNPINS (MENGHAPUS DARI PINATA) ==========
  // @desc    Unpin file dari Pinata (menghapus)
  // @param   {string} ipfsHash - Hash IPFS yang akan di-unpin
  // @returns {Object} Hasil unpin
  async unpinFile(ipfsHash) {
    try {
      if (!ipfsHash) {
        throw new Error('IPFS hash diperlukan');
      }

      console.log(`🗑️ Unpinning file from Pinata: ${ipfsHash}`);
      
      const response = await axios.delete(
        `${this.apiUrl}/pinning/unpin/${ipfsHash}`,
        { headers: this.getHeaders() }
      );

      console.log('✅ File unpinned successfully');
      
      return {
        success: true,
        message: `File ${ipfsHash} berhasil di-unpin`
      };
    } catch (error) {
      console.error('❌ Unpin failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // ========== FUNGSI CEK STATUS FILE ==========
  // @desc    Cek status file di Pinata
  // @param   {string} ipfsHash - Hash IPFS yang dicek
  // @returns {Object} Informasi file
  async checkFileStatus(ipfsHash) {
    try {
      if (!ipfsHash) {
        throw new Error('IPFS hash diperlukan');
      }

      console.log(`🔍 Checking file status: ${ipfsHash}`);
      
      const response = await axios.get(
        `${this.apiUrl}/pinning/pinByHash/${ipfsHash}`,
        { headers: this.getHeaders() }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Check status failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // ========== FUNGSI TEST KONEKSI ==========
  // @desc    Test koneksi dan autentikasi ke Pinata
  // @returns {Object} Status koneksi
  async testConnection() {
    try {
      console.log('🔌 Testing Pinata connection...');
      
      const response = await axios.get(
        `${this.apiUrl}/data/testAuthentication`,
        { headers: this.getHeaders() }
      );
      
      console.log('✅ Pinata connection successful');
      
      return {
        success: true,
        message: 'Pinata authentication successful',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Pinata connection failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // ========== FUNGSI GET LIST FILE ==========
  // @desc    Mendapatkan list file yang dipin di Pinata
  // @param   {Object} filters - Filter pencarian (opsional)
  // @returns {Object} List file
  async getPinList(filters = {}) {
    try {
      console.log('📋 Fetching pin list from Pinata...');
      
      const response = await axios.get(
        `${this.apiUrl}/data/pinList`,
        {
          headers: this.getHeaders(),
          params: {
            status: 'pinned',
            pageLimit: 100,
            ...filters
          }
        }
      );

      return {
        success: true,
        count: response.data.count,
        rows: response.data.rows
      };
    } catch (error) {
      console.error('❌ Get pin list failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
}

module.exports = new PinataService();