const { DataTypes } = require('sequelize');
const database = require('#services/db.service');

const Agendamento = database.define(
  'Agendamento',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clienteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id'
      }
    },
    dataHora: {
      type: DataTypes.DATE,
      allowNull: false
    },
    tipoEnsaio: {
      type: DataTypes.ENUM(
        'retrato_individual',
        'ensaio_casal', 
        'ensaio_familiar',
        'gestante',
        'newborn',
        'corporativo'
      ),
      allowNull: false
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('agendado', 'confirmado', 'realizado', 'cancelado'),
      defaultValue: 'agendado'
    },
    localEnsaio: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duracao: {
      type: DataTypes.INTEGER, // em minutos
      defaultValue: 120
    }
  },
  {
    tableName: 'agendamentos',
    timestamps: true
  }
);

module.exports = Agendamento;

