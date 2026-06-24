// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.5.0
pragma solidity ^0.8.27;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

contract IjazahSBT is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public nextTokenId;

    // 1 address = 1 SBT only
    mapping(address => bool) public hasSBT;

    event Minted(uint256 indexed tokenId, address indexed to);
    event Burned(uint256 indexed tokenId);

    constructor(address defaultAdmin, address minter)
        ERC721("Ijazah Digital SBT", "IJZSBT")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    // ====================================================================
    // [PRESENTASI: KONSEP SOULBOUND TOKEN]
    // Fungsi _update di-override untuk mematikan kemampuan transfer.
    // Jika 'from' bukan address(0) (bukan proses pencetakan/mint)
    // dan 'to' bukan address(0) (bukan proses pembakaran/burn),
    // maka transaksi akan ditolak (revert) dengan pesan "SBT: non-transferable".
    // Inilah yang membuat ijazah terikat pada dompet mahasiswa selamanya.
    // ====================================================================
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(
            from == address(0) || to == address(0),
            "SBT: non-transferable"
        );
        return super._update(to, tokenId, auth);
    }

    // ====================================================================
    // [PRESENTASI: FUNGSI MINTING (PENCETAKAN IJAZAH)]
    // Fungsi ini dipanggil oleh Backend setelah file diupload ke IPFS.
    // Parameter 'uri' berisi hash/CID dari IPFS.
    // Hanya pengguna dengan 'MINTER_ROLE' (Admin Kampus) yang bisa memanggilnya.
    // ====================================================================
    function mint(address to, string memory uri)
        public
        onlyRole(MINTER_ROLE)
        returns (uint256)
    {
        // Memastikan 1 mahasiswa (address) hanya memiliki 1 ijazah
        require(!hasSBT[to], "SBT: address already has a token");

        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        hasSBT[to] = true;

        emit Minted(tokenId, to);
        return tokenId;
    }

    function burn(uint256 tokenId)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        address owner = ownerOf(tokenId);
        hasSBT[owner] = false;
        _burn(tokenId);

        emit Burned(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}