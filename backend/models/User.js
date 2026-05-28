module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password'
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'admin'
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  return User;
};