require("dotenv").config();

const PINATA_JWT = process.env.PINATA_JWT;

// === Sample Ijazah Data ===
const ijazahData = {
    nomorIjazah: "IJZ-2025-001",
    namaLengkap: "Budi Santoso",
    npm: "13521045",
    programStudi: "Teknik Informatika",
    tanggalLulus: "2025-07-20",
    ipk: "3.85",
    institusi: "Institut Teknologi Bandung",
};

// === Generate OpenSea Metadata JSON ===
function generateMetadata(data) {
    return {
        name: `Ijazah S1 - ${data.namaLengkap}`,
        description: `Official Bachelor Degree Certificate from ${data.institusi}. Certificate No: ${data.nomorIjazah}`,
        external_url: `https://university.ac.id/verify/${data.nomorIjazah}`,
        image: `https://apricot-sophisticated-bass-781.mypinata.cloud/ipfs/bafybeievfjpmkm5jls6afm3v2pkuzxh4edujselojt4xa6uemynxwtbgkm`,
        attributes: [
            { trait_type: "Nama Lengkap", value: data.namaLengkap },
            { trait_type: "NPM", value: data.npm },
            { trait_type: "Program Studi", value: data.programStudi },
            { trait_type: "Tanggal Lulus", value: data.tanggalLulus },
            { trait_type: "IPK", value: data.ipk },
            { trait_type: "Nomor Ijazah", value: data.nomorIjazah },
            { trait_type: "Institusi", value: data.institusi },
        ],
    };
}

// === Upload JSON to Pinata IPFS ===
async function uploadToPinata(metadata) {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
            pinataContent: metadata,
            pinataMetadata: {
                name: `ijazah-${metadata.attributes[1].value}`, // name file by NPM
            },
        }),
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Pinata error: ${res.status} - ${error}`);
    }

    return await res.json();
}

// === Main ===
async function main() {
    console.log("=== 📋 Generating Metadata ===");
    const metadata = generateMetadata(ijazahData);
    console.log(JSON.stringify(metadata, null, 2));

    console.log("\n=== 📤 Uploading to Pinata IPFS ===");
    const result = await uploadToPinata(metadata);

    console.log("\n=== ✅ Upload Success! ===");
    console.log("IPFS Hash (CID):", result.IpfsHash);
    console.log("Token URI:", `ipfs://${result.IpfsHash}`);
    console.log("Gateway URL:", `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`);
    console.log("\nUse this as tokenURI when minting:");
    console.log(`  contract.mint(studentAddress, "ipfs://${result.IpfsHash}")`);
}

main().catch(console.error);
