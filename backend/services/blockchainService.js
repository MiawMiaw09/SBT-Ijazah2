// backend/services/blockchainService.js
const { ethers } = require('ethers');
const dotenv = require('dotenv');

dotenv.config();

// ABI IjazahSBT - SESUAIKAN DENGAN SMART CONTRACT ANDA
const IjazahSBT_ABI = [
  "function mint(address to, string memory uri) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function getTokenIdByDiploma(string memory certificateId) public view returns (uint256)",
  "function totalSupply() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.initialize();
  }

  initialize() {
    try {
      // ====================================================================
      // [PRESENTASI: KONEKSI KE JARINGAN POLYGON]
      // Inisialisasi provider menggunakan URL RPC dari Polygon Amoy Testnet.
      // Di sini aplikasi terhubung langsung ke node blockchain.
      // ====================================================================
      this.provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      
      // Inisialisasi wallet dengan private key admin kampus untuk membayar gas fee
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      
      // Inisialisasi instance Smart Contract IjazahSBT
      this.contract = new ethers.Contract(
        this.contractAddress,
        IjazahSBT_ABI,
        this.wallet
      );
      
      console.log('✅ Blockchain service initialized for', process.env.BLOCKCHAIN_NETWORK);
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
    }
  }

  // Fungsi untuk mint SBT
  async mintSBT(recipientAddress, ipfsHash, certificateId) {
    try {
      console.log(`🚀 Minting SBT for ${recipientAddress} with IPFS: ${ipfsHash}`);
      
      // ====================================================================
      // [PRESENTASI: INTEGRASI IPFS & BLOCKCHAIN]
      // Menggabungkan hash dari IPFS menjadi format URI standar.
      // URI ini yang akan dicatat permanen di blockchain Polygon.
      // ====================================================================
      const tokenURI = `ipfs://${ipfsHash}`;
      
      // Estimasi gas fee yang dibutuhkan untuk transaksi
      const gasEstimate = await this.contract.estimateGas.mint(recipientAddress, tokenURI);
      const gasPrice = await this.provider.getGasPrice();
      
      console.log(`⛽ Gas estimate: ${gasEstimate.toString()}`);
      console.log(`⛽ Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} Gwei`);

      // ====================================================================
      // [PRESENTASI: EKSEKUSI SMART CONTRACT]
      // Memanggil fungsi 'mint' pada Smart Contract IjazahSBT.
      // Proses ini memerlukan biaya (gas fee) dalam bentuk token MATIC.
      // ====================================================================
      const tx = await this.contract.mint(recipientAddress, tokenURI, {
        gasLimit: gasEstimate.mul(120).div(100), // +20% buffer untuk keamanan
        gasPrice: gasPrice
      });

      console.log(`📝 Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

      // Parse event to get tokenId
      const event = receipt.events?.find(e => e.event === 'Transfer');
      const tokenId = event?.args?.tokenId?.toString();

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        tokenId: tokenId || 'unknown',
        contractAddress: this.contractAddress,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Minting failed:', error);
      return {
        success: false,
        error: error.message,
        transactionHash: null
      };
    }
  }

  // Fungsi untuk mendapatkan estimasi gas
  async estimateGas(recipientAddress, ipfsHash) {
    try {
      const tokenURI = `ipfs://${ipfsHash}`;
      const gasEstimate = await this.contract.estimateGas.mint(recipientAddress, tokenURI);
      const gasPrice = await this.provider.getGasPrice();
      
      const totalCost = gasEstimate.mul(gasPrice);
      
      return {
        success: true,
        gasEstimate: gasEstimate.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        totalCost: ethers.utils.formatEther(totalCost)
      };
    } catch (error) {
      console.error('❌ Gas estimation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Cek koneksi
  async checkConnection() {
    try {
      const network = await this.provider.getNetwork();
      const balance = await this.wallet.getBalance();
      
      return {
        success: true,
        network: {
          name: network.name,
          chainId: network.chainId
        },
        wallet: this.wallet.address,
        balance: ethers.utils.formatEther(balance)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new BlockchainService();