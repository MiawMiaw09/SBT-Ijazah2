// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.27;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract IjazahSBT is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId = 0; // Manual counter sederhana
    
    // Struct untuk menyimpan data ijazah
    struct IjazahData {
        string namaLengkap;
        string npm;
        string programStudi;
        string tanggalLulus;
        string ipk;
        string nomorIjazah;
        string institusi;
        string ipfsHash;
        uint256 tanggalTerbit;
        bool isValid;
        address pemilik;
    }
    
    // Mappings untuk data storage
    mapping(uint256 => IjazahData) private _dataIjazah;
    mapping(string => bool) private _nomorIjazahTerpakai;
    mapping(address => uint256[]) private _ijazahPemilik;
    mapping(string => uint256) private _nomorKeTokenId;
    
    // Events
    event IjazahDiterbitkan(
        uint256 indexed tokenId,
        address indexed mahasiswa,
        string namaLengkap,
        string npm,
        string nomorIjazah
    );
    
    event IjazahDiverifikasi(
        uint256 indexed tokenId,
        address indexed verifikator,
        bool status
    );
    
    // Constructor
    constructor(address defaultAdmin, address minter) 
        ERC721("Ijazah Digital SBT", "IJZSBT") 
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }
    
    // --- Core SBT Functionality: Disable Transfers ---
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);

        // Soulbound token: hanya bisa mint dan burn, tidak bisa transfer
        require(from == address(0) || to == address(0) || to == from, 
            "SBT: Token is soulbound and cannot be transferred");
        
        return super._update(to, tokenId, auth);
    }
    
    // Fungsi untuk menerbitkan ijazah digital
    function terbitkanIjazah(
        address mahasiswa,
        string memory namaLengkap,
        string memory npm,
        string memory programStudi,
        string memory tanggalLulus,
        string memory ipk,
        string memory nomorIjazah,
        string memory institusi,
        string memory ipfsHash,
        string memory tokenURI
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        // Validasi input
        require(bytes(namaLengkap).length > 0, "Nama lengkap diperlukan");
        require(bytes(npm).length > 0, "NPM diperlukan");
        require(bytes(nomorIjazah).length > 0, "Nomor ijazah diperlukan");
        require(!_nomorIjazahTerpakai[nomorIjazah], "Nomor ijazah sudah digunakan");
        require(mahasiswa != address(0), "Alamat mahasiswa tidak valid");
        
        // Generate token ID dengan manual counter
        uint256 tokenId = _nextTokenId;
        _nextTokenId++; // Increment untuk next token
        
        // Mint token ke alamat mahasiswa
        _safeMint(mahasiswa, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        // Simpan data ijazah
        _dataIjazah[tokenId] = IjazahData({
            namaLengkap: namaLengkap,
            npm: npm,
            programStudi: programStudi,
            tanggalLulus: tanggalLulus,
            ipk: ipk,
            nomorIjazah: nomorIjazah,
            institusi: institusi,
            ipfsHash: ipfsHash,
            tanggalTerbit: block.timestamp,
            isValid: true,
            pemilik: mahasiswa
        });
        
        // Update mappings
        _nomorIjazahTerpakai[nomorIjazah] = true;
        _ijazahPemilik[mahasiswa].push(tokenId);
        _nomorKeTokenId[nomorIjazah] = tokenId;
        
        // Emit event
        emit IjazahDiterbitkan(tokenId, mahasiswa, namaLengkap, npm, nomorIjazah);
        
        return tokenId;
    }
    
    // Fungsi untuk verifikasi ijazah
    function verifikasiIjazah(uint256 tokenId) public view returns (
        string memory namaLengkap,
        string memory npm,
        string memory programStudi,
        string memory tanggalLulus,
        string memory ipk,
        string memory nomorIjazah,
        string memory institusi,
        string memory ipfsHash,
        uint256 tanggalTerbit,
        bool isValid,
        address pemilik
    ) {
        require(_exists(tokenId), "Token tidak ditemukan");
        
        IjazahData memory ijazah = _dataIjazah[tokenId];
        
        return (
            ijazah.namaLengkap,
            ijazah.npm,
            ijazah.programStudi,
            ijazah.tanggalLulus,
            ijazah.ipk,
            ijazah.nomorIjazah,
            ijazah.institusi,
            ijazah.ipfsHash,
            ijazah.tanggalTerbit,
            ijazah.isValid,
            ijazah.pemilik
        );
    }
    
    // Fungsi untuk mendapatkan token ID berdasarkan nomor ijazah
    function dapatkanTokenIdDariNomorIjazah(string memory nomorIjazah) 
        public view returns (uint256) 
    {
        require(_nomorIjazahTerpakai[nomorIjazah], "Nomor ijazah tidak ditemukan");
        return _nomorKeTokenId[nomorIjazah];
    }
    
    // Fungsi untuk mendapatkan semua ijazah milik seseorang
    function dapatkanIjazahPemilik(address pemilik) 
        public view returns (uint256[] memory) 
    {
        return _ijazahPemilik[pemilik];
    }
    
    // Fungsi untuk mendapatkan total ijazah yang telah diterbitkan
    function totalIjazah() public view returns (uint256) {
        return _nextTokenId;
    }
    
    // Fungsi untuk mendapatkan data ijazah lengkap
    function dapatkanDataIjazah(uint256 tokenId) 
        public view returns (IjazahData memory) 
    {
        require(_exists(tokenId), "Token tidak ditemukan");
        return _dataIjazah[tokenId];
    }
    
    // Fungsi untuk mengecek apakah nomor ijazah sudah digunakan
    function cekNomorIjazahTerpakai(string memory nomorIjazah) 
        public view returns (bool) 
    {
        return _nomorIjazahTerpakai[nomorIjazah];
    }
    
    // Fungsi untuk invalidate ijazah (hanya admin)
    function invalidateIjazah(uint256 tokenId) 
        public onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_exists(tokenId), "Token tidak ditemukan");
        _dataIjazah[tokenId].isValid = false;
        
        emit IjazahDiverifikasi(tokenId, msg.sender, false);
    }
    
    // Fungsi untuk revalidate ijazah (hanya admin)
    function revalidateIjazah(uint256 tokenId) 
        public onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_exists(tokenId), "Token tidak ditemukan");
        _dataIjazah[tokenId].isValid = true;
        
        emit IjazahDiverifikasi(tokenId, msg.sender, true);
    }
    
    // Fungsi untuk burn ijazah (hanya admin)
    function burnIjazah(uint256 tokenId) 
        public onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(_exists(tokenId), "Token tidak ditemukan");
        
        // Update mappings
        IjazahData memory ijazah = _dataIjazah[tokenId];
        _nomorIjazahTerpakai[ijazah.nomorIjazah] = false;
        delete _nomorKeTokenId[ijazah.nomorIjazah];
        
        // Remove from owner's array
        uint256[] storage ijazahList = _ijazahPemilik[ijazah.pemilik];
        for (uint256 i = 0; i < ijazahList.length; i++) {
            if (ijazahList[i] == tokenId) {
                ijazahList[i] = ijazahList[ijazahList.length - 1];
                ijazahList.pop();
                break;
            }
        }
        
        // Delete data and burn token
        delete _dataIjazah[tokenId];
        _burn(tokenId);
    }
    
    // Fungsi tambahan: cek ijazah berdasarkan NPM
    function cekIjazahDariNPM(string memory npm) 
        public view returns (uint256[] memory) 
    {
        uint256 total = _nextTokenId;
        uint256 count = 0;
        
        // Hitung berapa banyak ijazah dengan NPM ini
        for (uint256 i = 0; i < total; i++) {
            if (_exists(i) && 
                keccak256(abi.encodePacked(_dataIjazah[i].npm)) == keccak256(abi.encodePacked(npm))) {
                count++;
            }
        }
        
        // Buat array hasil
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < total; i++) {
            if (_exists(i) && 
                keccak256(abi.encodePacked(_dataIjazah[i].npm)) == keccak256(abi.encodePacked(npm))) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    // Fungsi tambahan: cek apakah NPM sudah memiliki ijazah
    function cekNPMTerdaftar(string memory npm) 
        public view returns (bool) 
    {
        uint256 total = _nextTokenId;
        
        for (uint256 i = 0; i < total; i++) {
            if (_exists(i) && 
                keccak256(abi.encodePacked(_dataIjazah[i].npm)) == keccak256(abi.encodePacked(npm))) {
                return true;
            }
        }
        
        return false;
    }
    
    // --- Standard ERC-721 Overrides ---
    function safeMint(address to, string memory uri)
        public
        onlyRole(MINTER_ROLE)
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        return tokenId;
    }
    
    // Compatibility function untuk frontend yang menggunakan mint
    function mint(address to, string memory uri) 
        public onlyRole(MINTER_ROLE) returns (uint256) 
    {
        return safeMint(to, uri);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Helper function untuk check existensi token
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}