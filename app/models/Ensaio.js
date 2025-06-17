const { DataTypes } = require('sequelize');
const database = require('#services/db.service');

const Ensaio = database.define(
  'Ensaio',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    agendamentoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'agendamentos',
        key: 'id'
      }
    },
    dataRealizacao: {
      type: DataTypes.DATE,
      allowNull: true
    },
    localRealizado: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    statusEntrega: {
      type: DataTypes.ENUM('processando', 'pronto', 'entregue'),
      defaultValue: 'processando'
    },
    quantidadeFotos: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    dataEntrega: {
      type: DataTypes.DATE,
      allowNull: true
    },
    linkGaleria: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    avaliacaoCliente: {
      type: DataTypes.INTEGER, // 1-5 estrelas
      allowNull: true
    },
    comentarioCliente: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    tableName: 'ensaios',
    timestamps: true
  }
);

module.exports = Ensaio;

