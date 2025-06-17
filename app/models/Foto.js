const { DataTypes } = require('sequelize');
const database = require('#services/db.service');

const Foto = database.define(
  'Foto',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ensaioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ensaios',
        key: 'id'
      }
    },
    nomeArquivo: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    caminhoArquivo: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    tamanhoArquivo: {
      type: DataTypes.INTEGER, // em bytes
      allowNull: true
    },
    largura: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    altura: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tipoArquivo: {
      type: DataTypes.STRING(10),
      allowNull: false // jpg, png, etc
    },
    ordem: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    destaque: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    aprovadaCliente: {
      type: DataTypes.BOOLEAN,
      defaultValue: null
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: 'fotos',
    timestamps: true
  }
);

module.exports = Foto;

