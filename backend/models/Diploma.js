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
    
    nim: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'NIM tidak boleh kosong'
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
    
    file_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [64, 64],
          msg: 'File hash harus 64 karakter (SHA-256)'
        }
      }
    },
    
    // Data Sistem
    certificate_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
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
    
    hooks: {
      beforeCreate: (diploma, options) => {
        // Generate certificate ID otomatis
        if (!diploma.certificate_id) {
          const year = new Date().getFullYear();
          const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          diploma.certificate_id = `DIP-${year}-${random}`;
        }
        
        // Format tanggal jika perlu
        if (diploma.tanggal_lulus && typeof diploma.tanggal_lulus === 'string') {
          // Konversi dari dd/mm/yyyy ke yyyy-mm-dd
          const parts = diploma.tanggal_lulus.split('/');
          if (parts.length === 3) {
            diploma.tanggal_lulus = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
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
      byNim: function(nim) {
        return {
          where: { nim: nim }
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

  // Class methods
  Diploma.findByNim = async function(nim) {
    return await this.findOne({ where: { nim: nim } });
  };

  Diploma.generateCertificateId = function() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `CERT-${year}-${timestamp}-${random}`;
  };

  return Diploma;
};