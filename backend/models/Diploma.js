// backend/models/Diploma.js

module.exports = (sequelize, DataTypes) => {
  const Diploma = sequelize.define('Diploma', {
    // Data Mahasiswa
    nama_lengkap: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nama lengkap tidak boleh kosong'
        }
      }
    },
    
    npm: {
      type: DataTypes.STRING(50),
      allowNull: false,
      // HAPUS unique: true di sini, pindah ke indexes
      validate: {
        notEmpty: {
          msg: 'NPM tidak boleh kosong'
        }
      }
    },

    nik: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'NIK tidak boleh kosong'
        }
      }
    },
    
    program_studi: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Program studi tidak boleh kosong'
        }
      }
    },
    
    gelar_akademik: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Gelar akademik tidak boleh kosong'
        }
      }
    },

    tempat_tanggal_lahir: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Tempat tanggal lahir tidak boleh kosong'
        }
      }
    },
    
    fakultas: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    
    // Data Akademik
    tanggal_lulus: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD'
        }
      }
    },
    
    ipk: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'IPK minimal 0.00'
        },
        max: {
          args: [4],
          msg: 'IPK maksimal 4.00'
        }
      }
    },
    
    judul_skripsi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    tahun_akademik: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    
    yudisium: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    
    nomor_sk_rektor: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null
    },
    
    tanggal_sk_rektor: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      validate: {
        isDate: {
          msg: 'Format tanggal SK Rektor tidak valid'
        }
      }
    },
    
    // Data Blockchain
    wallet_address: {
      type: DataTypes.STRING(42),
      allowNull: true,
      validate: {
        len: {
          args: [42, 42],
          msg: 'Alamat wallet harus 42 karakter (0x...)'
        }
      }
    },
    
    transaction_hash: {
      type: DataTypes.STRING(66),
      allowNull: true,
      validate: {
        len: {
          args: [66, 66],
          msg: 'Transaction hash harus 66 karakter'
        }
      }
    },
    
    contract_address: {
      type: DataTypes.STRING(42),
      allowNull: true
    },
    
    token_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    
    block_number: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    
    // File Upload
    nama_file: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    
    path_file: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    
    ukuran_file: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Ukuran file tidak valid'
        }
      }
    },
    
    tipe_file: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    
    // KOLOM UNTUK VALIDASI FILE (SHA-256 HASH)
    file_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      // HAPUS unique: true di sini, pindah ke indexes
      validate: {
        len: {
          args: [64, 64],
          msg: 'File hash harus 64 karakter (SHA-256)'
        }
      }
    },
    
    // ===== KOLOM BARU UNTUK IPFS PDF =====
    pdf_ipfs_hash: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'pdf_ipfs_hash',
      validate: {
        len: {
          args: [46, 100],
          msg: 'IPFS hash harus antara 46-100 karakter'
        }
      }
    },
    
    pdf_ipfs_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'pdf_ipfs_url'
    },
    // ===== END KOLOM BARU =====
    
    // Data Sistem
    certificate_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      // HAPUS unique: true di sini, pindah ke indexes
    },
    
    // Kolom untuk metadata JSON IPFS (sudah ada sebelumnya)
    ipfs_hash: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'ipfs_hash'
    },
    
    ipfs_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'ipfs_url'
    },
    
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'minted', 'rejected'),
      defaultValue: 'pending'
    },
    
    verification_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    // Metadata
    minted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // User tracking
    uploaded_by: {
      type: DataTypes.STRING(100),
      defaultValue: 'admin'
    },
    
    verified_by: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    
    minted_by: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
    
  }, {
    tableName: 'diplomas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    
    // TAMBAHKAN INDEXES MANUAL (hanya yang penting)
    indexes: [
      // Hanya 3 unique indexes yang benar-benar diperlukan
      {
        unique: true,
        fields: ['npm'],
        name: 'idx_npm_unique'
      },
      {
        unique: true,
        fields: ['file_hash'],
        name: 'idx_file_hash_unique'
      },
      {
        unique: true,
        fields: ['certificate_id'],
        name: 'idx_certificate_id_unique'
      },
      // Non-unique indexes untuk pencarian cepat
      {
        fields: ['status'],
        name: 'idx_status'
      },
      {
        fields: ['created_at'],
        name: 'idx_created_at'
      },
      {
        fields: ['tanggal_lulus'],
        name: 'idx_tanggal_lulus'
      },
      // Index untuk kolom IPFS baru
      {
        fields: ['pdf_ipfs_hash'],
        name: 'idx_pdf_ipfs_hash'
      }
    ],
    
    hooks: {
      beforeCreate: (diploma, options) => {
        // HAPUS block kode yang menggenerate certificate_id otomatis
        // Biarkan certificate_id sesuai input dari user
        
        // Format tanggal jika perlu
        if (diploma.tanggal_lulus && typeof diploma.tanggal_lulus === 'string') {
          // Konversi dari dd/mm/yyyy ke yyyy-mm-dd
          const parts = diploma.tanggal_lulus.split('/');
          if (parts.length === 3) {
            diploma.tanggal_lulus = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }

        // Generate IPFS URL dari hash jika pdf_ipfs_hash ada tapi pdf_ipfs_url belum diisi
        if (diploma.pdf_ipfs_hash && !diploma.pdf_ipfs_url) {
          diploma.pdf_ipfs_url = `ipfs://${diploma.pdf_ipfs_hash}`;
        }
      },
      
      beforeUpdate: (diploma, options) => {
        // Format tanggal saat update juga
        if (diploma.tanggal_lulus && typeof diploma.tanggal_lulus === 'string' && diploma.tanggal_lulus.includes('/')) {
          const parts = diploma.tanggal_lulus.split('/');
          if (parts.length === 3) {
            diploma.tanggal_lulus = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }

        // Update IPFS URL jika pdf_ipfs_hash berubah
        if (diploma.changed('pdf_ipfs_hash') && diploma.pdf_ipfs_hash) {
          diploma.pdf_ipfs_url = `ipfs://${diploma.pdf_ipfs_hash}`;
        }
      }
    },
    
    scopes: {
      pending: {
        where: { status: 'pending' }
      },
      minted: {
        where: { status: 'minted' }
      },
      withPdfIpfs: {
        where: {
          pdf_ipfs_hash: { [sequelize.Sequelize.Op.ne]: null }
        }
      },
      byNpm: function(npm) {
        return {
          where: { npm: npm }
        };
      },
      byWallet: function(walletAddress) {
        return {
          where: { wallet_address: walletAddress }
        };
      }
    }
  });

  // Instance methods
  Diploma.prototype.getFormattedDate = function() {
    if (!this.tanggal_lulus) return '';
    const date = new Date(this.tanggal_lulus);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Method untuk mendapatkan URL PDF (gateway)
  Diploma.prototype.getPdfGatewayUrl = function(gateway = 'pinata') {
    if (!this.pdf_ipfs_hash) return null;
    
    const gateways = {
      pinata: `https://gateway.pinata.cloud/ipfs/${this.pdf_ipfs_hash}`,
      ipfs: `https://ipfs.io/ipfs/${this.pdf_ipfs_hash}`,
      cloudflare: `https://cloudflare-ipfs.com/ipfs/${this.pdf_ipfs_hash}`
    };
    
    return gateways[gateway] || gateways.pinata;
  };

  // Class methods
  Diploma.findByNpm = async function(npm) {
    return await this.findOne({ where: { npm: npm } });
  };

  Diploma.findByPdfIpfsHash = async function(ipfsHash) {
    return await this.findOne({ where: { pdf_ipfs_hash: ipfsHash } });
  };

  Diploma.generateCertificateId = function() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `CERT-${year}-${timestamp}-${random}`;
  };

  return Diploma;
};