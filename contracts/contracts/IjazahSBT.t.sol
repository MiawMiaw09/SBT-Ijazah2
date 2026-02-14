// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {IjazahSBT} from "./IjazahSBT.sol";
import {Test} from "forge-std/Test.sol";

contract IjazahSBTTest is Test {
    IjazahSBT sbt;
    address admin = address(1);
    address minter = address(2);
    address student = address(3);
    address student2 = address(4);

    function setUp() public {
        sbt = new IjazahSBT(admin, minter);
    }

    // --- Deployment ---
    function test_Deployment() public view {
        require(sbt.nextTokenId() == 0, "Initial token ID should be 0");
        require(sbt.hasRole(sbt.DEFAULT_ADMIN_ROLE(), admin), "Admin role not set");
        require(sbt.hasRole(sbt.MINTER_ROLE(), minter), "Minter role not set");
    }

    // --- Minting ---
    function test_MintSuccess() public {
        vm.prank(minter);
        uint256 tokenId = sbt.mint(student, "ipfs://QmTest123");

        require(tokenId == 0, "First token ID should be 0");
        require(sbt.ownerOf(0) == student, "Student should own token");
        require(sbt.hasSBT(student) == true, "hasSBT should be true");
        require(sbt.nextTokenId() == 1, "nextTokenId should be 1");
        require(
            keccak256(bytes(sbt.tokenURI(0))) == keccak256(bytes("ipfs://QmTest123")),
            "Token URI should match"
        );
    }

    function test_MintRevertIfNotMinter() public {
        vm.prank(student);
        vm.expectRevert();
        sbt.mint(student, "ipfs://QmTest123");
    }

    function test_MintRevertIfAlreadyHasSBT() public {
        vm.prank(minter);
        sbt.mint(student, "ipfs://QmTest123");

        vm.prank(minter);
        vm.expectRevert("SBT: address already has a token");
        sbt.mint(student, "ipfs://QmTest456");
    }

    function test_MintMultipleStudents() public {
        vm.prank(minter);
        sbt.mint(student, "ipfs://QmStudent1");

        vm.prank(minter);
        sbt.mint(student2, "ipfs://QmStudent2");

        require(sbt.nextTokenId() == 2, "Should have 2 tokens");
        require(sbt.ownerOf(0) == student, "Student1 should own token 0");
        require(sbt.ownerOf(1) == student2, "Student2 should own token 1");
    }

    // --- Soulbound (Non-Transferable) ---
    function test_TransferReverts() public {
        vm.prank(minter);
        sbt.mint(student, "ipfs://QmTest123");

        vm.prank(student);
        vm.expectRevert("SBT: non-transferable");
        sbt.transferFrom(student, student2, 0);
    }

    // --- Burn ---
    function test_BurnSuccess() public {
        vm.prank(minter);
        sbt.mint(student, "ipfs://QmTest123");

        vm.prank(admin);
        sbt.burn(0);

        require(sbt.hasSBT(student) == false, "hasSBT should be false after burn");

        vm.expectRevert();
        sbt.ownerOf(0); // Should revert — token no longer exists
    }

    function test_BurnRevertIfNotAdmin() public {
        vm.prank(minter);
        sbt.mint(student, "ipfs://QmTest123");

        vm.prank(student);
        vm.expectRevert();
        sbt.burn(0);
    }

    function test_CanRemintAfterBurn() public {
        vm.prank(minter);
        sbt.mint(student, "ipfs://QmOld");

        vm.prank(admin);
        sbt.burn(0);

        vm.prank(minter);
        uint256 newTokenId = sbt.mint(student, "ipfs://QmNew");

        require(newTokenId == 1, "New token ID should be 1");
        require(sbt.hasSBT(student) == true, "hasSBT should be true again");
    }
}
