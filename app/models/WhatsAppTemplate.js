const { DataTypes } = require('sequelize');
const sequelize = require('#configs/database');

const WhatsAppTemplate = sequelize.define('WhatsAppTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Nome único do template'
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nome amigável do template'
  },
  category: {
    type: DataTypes.ENUM('marketing', 'utility', 'authentication'),
    allowNull: false,
    comment: 'Categoria do template'
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'pt_BR',
    comment: 'Idioma do template'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'disabled'),
    defaultValue: 'pending',
    comment: 'Status de aprovação do WhatsApp'
  },
  headerType: {
    type: DataTypes.ENUM('text', 'image', 'video', 'document'),
    allowNull: true,
    comment: 'Tipo do cabeçalho'
  },
  headerText: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Texto do cabeçalho'
  },
  headerMedia: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL da mídia do cabeçalho'
  },
  bodyText: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Texto do corpo da mensagem'
  },
  footerText: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Texto do rodapé'
  },
  buttons: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Configuração dos botões'
  },
  variables: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Variáveis do template'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Se o template está ativo'
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Número de vezes que foi usado'
  },
  lastUsedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Última vez que foi usado'
  }
}, {
  tableName: 'whatsapp_templates',
  timestamps: true,
  indexes: [
    {
      fields: ['name']
    },
    {
      fields: ['category']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = WhatsAppTemplate;

