export interface IjazahData {
  id: number;
  selected: boolean;
  namaMahasiswa: string;
  npm: string;
  nik: string;
  tempatTanggalLahir: string;
  programStudi: string;
  fakultas: string;
  gelarAkademik: string;
  tahunLulus: string;
  tanggalKelulusan: string;
  nomorSKRektor: string;
  tanggalSKRektor: string;
  walletAddress: string;
  tokenID: string;
  ipfs: string;
  alamatPenerbit: string;
  status: 'Minted' | 'Pending';
}

export type MintStep = 'idle' | 'ipfs_upload' | 'blockchain_mint' | 'success';