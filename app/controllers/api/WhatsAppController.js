const WhatsAppMessage = require('#models/WhatsAppMessage');
const WhatsAppTemplate = require('#models/WhatsAppTemplate');
const WhatsAppConfig = require('#models/WhatsAppConfig');
const Cliente = require('#models/Cliente');
const { Op } = require('sequelize');

const WhatsAppController = () => {

  // Obter status da conexão WhatsApp
  const getConnectionStatus = async (req, res) => {
    try {
      const config = await WhatsAppConfig.findOne({
        where: { isActive: true }
      });

      // Mock data baseado no frontend
      const status = {
        connected: true,
        phoneNumber: '+55 11 99999-9999',
        businessName: 'Jéssica Santos Fotografia',
        qrCode: null, // Se desconectado, retornaria QR code
        lastConnection: new Date(),
        stats: {
          messagesSent: 1247,
          messagesReceived: 892,
          activeChats: 12,
          automationRate: 85.3
        }
      };

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao verificar status WhatsApp',
        error: error.message
      });
    }
  };

  // Configurar WhatsApp
  const configureWhatsApp = async (req, res) => {
    try {
      const {
        phoneNumber,
        businessName,
        workingHours,
        autoReply,
        webhookUrl
      } = req.body;

      const [config, created] = await WhatsAppConfig.findOrCreate({
        where: { phoneNumber },
        defaults: {
          phoneNumber,
          businessName,
          workingHours: workingHours || {
            monday: { start: '09:00', end: '18:00', enabled: true },
            tuesday: { start: '09:00', end: '18:00', enabled: true },
            wednesday: { start: '09:00', end: '18:00', enabled: true },
            thursday: { start: '09:00', end: '18:00', enabled: true },
            friday: { start: '09:00', end: '18:00', enabled: true },
            saturday: { start: '09:00', end: '14:00', enabled: true },
            sunday: { start: '09:00', end: '14:00', enabled: false }
          },
          autoReply: autoReply || {
            enabled: true,
            message: 'Olá! Obrigada pelo contato. Em breve retornaremos sua mensagem.'
          },
          webhookUrl,
          isActive: true
        }
      });

      if (!created) {
        await config.update({
          businessName,
          workingHours,
          autoReply,
          webhookUrl
        });
      }

      res.json({
        success: true,
        data: config,
        message: 'WhatsApp configurado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao configurar WhatsApp',
        error: error.message
      });
    }
  };

  // Listar templates
  const getTemplates = async (req, res) => {
    try {
      const { category, active } = req.query;
      
      const where = {};
      if (category) where.category = category;
      if (active !== undefined) where.isActive = active === 'true';

      const templates = await WhatsAppTemplate.findAll({
        where,
        order: [['category', 'ASC'], ['name', 'ASC']]
      });

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar templates',
        error: error.message
      });
    }
  };

  // Criar template
  const createTemplate = async (req, res) => {
    try {
      const {
        name,
        category,
        content,
        variables,
        isActive = true
      } = req.body;

      const template = await WhatsAppTemplate.create({
        name,
        category,
        content,
        variables: variables || [],
        isActive,
        usageCount: 0
      });

      res.status(201).json({
        success: true,
        data: template,
        message: 'Template criado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar template',
        error: error.message
      });
    }
  };

  // Atualizar template
  const updateTemplate = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const template = await WhatsAppTemplate.findByPk(id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template não encontrado'
        });
      }

      await template.update(updateData);

      res.json({
        success: true,
        data: template,
        message: 'Template atualizado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar template',
        error: error.message
      });
    }
  };

  // Deletar template
  const deleteTemplate = async (req, res) => {
    try {
      const { id } = req.params;

      const template = await WhatsAppTemplate.findByPk(id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template não encontrado'
        });
      }

      await template.destroy();

      res.json({
        success: true,
        message: 'Template deletado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar template',
        error: error.message
      });
    }
  };

  // Enviar mensagem
  const sendMessage = async (req, res) => {
    try {
      const {
        to,
        templateId,
        variables,
        message,
        clienteId
      } = req.body;

      let finalMessage = message;

      // Se usar template, processar variáveis
      if (templateId) {
        const template = await WhatsAppTemplate.findByPk(templateId);
        if (!template) {
          return res.status(404).json({
            success: false,
            message: 'Template não encontrado'
          });
        }

        finalMessage = template.content;
        
        // Substituir variáveis
        if (variables && Object.keys(variables).length > 0) {
          Object.entries(variables).forEach(([key, value]) => {
            finalMessage = finalMessage.replace(
              new RegExp(`{{${key}}}`, 'g'), 
              value
            );
          });
        }

        // Incrementar contador de uso
        await template.increment('usageCount');
      }

      // Criar registro da mensagem
      const whatsappMessage = await WhatsAppMessage.create({
        to,
        message: finalMessage,
        templateId,
        clienteId,
        status: 'sent',
        sentAt: new Date(),
        metadata: { variables }
      });

      // TODO: Integrar com WhatsApp Business API real
      console.log(`Enviando WhatsApp para ${to}: ${finalMessage}`);

      res.json({
        success: true,
        data: whatsappMessage,
        message: 'Mensagem enviada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar mensagem',
        error: error.message
      });
    }
  };

  // Listar mensagens
  const getMessages = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        clienteId, 
        status,
        startDate,
        endDate 
      } = req.query;
      
      const where = {};
      if (clienteId) where.clienteId = clienteId;
      if (status) where.status = status;
      
      if (startDate && endDate) {
        where.sentAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const messages = await WhatsAppMessage.findAndCountAll({
        where,
        include: [
          { model: Cliente, as: 'cliente', required: false },
          { model: WhatsAppTemplate, as: 'template', required: false }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['sentAt', 'DESC']]
      });

      res.json({
        success: true,
        data: messages.rows,
        pagination: {
          total: messages.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(messages.count / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar mensagens',
        error: error.message
      });
    }
  };

  // Analytics WhatsApp
  const getAnalytics = async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      
      // Mock data baseado no frontend
      const analytics = {
        summary: {
          messagesSent: 1247,
          openRate: 87.3,
          responseRate: 71.5,
          conversionRate: 12.5
        },
        funnel: [
          { stage: 'Mensagens Enviadas', value: 1247, percentage: 100 },
          { stage: 'Mensagens Abertas', value: 1089, percentage: 87.3 },
          { stage: 'Respostas Recebidas', value: 779, percentage: 71.5 },
          { stage: 'Conversões', value: 156, percentage: 12.5 }
        ],
        byTemplate: [
          { name: 'Confirmação Agendamento', sent: 450, opened: 423, clicked: 156 },
          { name: 'Lembrete 24h', sent: 320, opened: 298, clicked: 89 },
          { name: 'Link Pagamento', sent: 280, opened: 245, clicked: 67 },
          { name: 'Entrega Fotos', sent: 197, opened: 123, clicked: 45 }
        ]
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar analytics',
        error: error.message
      });
    }
  };

  return {
    getConnectionStatus,
    configureWhatsApp,
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendMessage,
    getMessages,
    getAnalytics
  };
};

module.exports = WhatsAppController;

