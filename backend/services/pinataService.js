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

  // Upload JSON ke IPFS via Pinata
  async uploadJSON(data, fileName = 'diploma.json') {
    try {
      console.log('📤 Uploading to IPFS via Pinata...');
      
      const response = await axios.post(
        `${this.apiUrl}/pinning/pinJSONToIPFS`,
        data,
        {
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Upload successful! IPFS Hash:', response.data.IpfsHash);
      
      return {
        success: true,
        ipfsHash: response.data.IpfsHash,
        ipfsUrl: `ipfs://${response.data.IpfsHash}`,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      };
    } catch (error) {
      console.error('❌ Pinata upload failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  // Test koneksi ke Pinata
  async testConnection() {
    try {
      const response = await axios.get(
        `${this.apiUrl}/data/testAuthentication`,
        { headers: this.getHeaders() }
      );
      
      return {
        success: true,
        message: 'Pinata authentication successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new PinataService();