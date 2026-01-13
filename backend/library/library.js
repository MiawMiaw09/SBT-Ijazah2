async function pinFileToPinata(file) {
  const data = new FormData();

  // file.buffer is a Buffer from multer memoryStorage
  data.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
    headers: {
      ...data.getHeaders(),
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    maxBodyLength: Infinity,
  });

  return res.data.IpfsHash; // CID
}

async function pinJSONToPinata(json) {
  const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", json, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
  });

  return res.data.IpfsHash; // CIDs
}