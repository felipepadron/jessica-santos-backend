const EmailCampaign = require('#models/EmailCampaign');
const EmailTemplate = require('#models/EmailTemplate');
const EmailSubscriber = require('#models/EmailSubscriber');
const EmailAutomation = require('#models/EmailAutomation');
const Cliente = require('#models/Cliente');
const { Op } = require('sequelize');

const EmailController = () => {

  // Dashboard de email marketing
  const getEmailDashboard = async (req, res) => {
    try {
      // Mock data baseado no frontend implementado
      const dashboard = {
        stats: {
          totalSubscribers: {
            value: 1247,
            change: 18.5,
            trend: 'up'
          },
          openRate: {
            value: 76.3,
            change: 12.8,
            trend: 'up'
          },
          clickRate: {
            value: 24.8,
            change: -3.2,
            trend: 'down'
          },
          revenue: {
            value: 15750,
            change: 28.4,
            trend: 'up'
          },
          roi: {
            value: 485,
            change: 15.7,
            trend: 'up'
          },
          unsubscribeRate: {
            value: 2.1,
            change: -8.3,
            trend: 'down'
          }
        },
        recentCampaigns: [
          {
            id: 1,
            name: 'Promoção Ensaio Gestante',
            status: 'sent',
            sentAt: new Date('2025-06-15'),
            recipients: 856,
            openRate: 78.2,
            clickRate: 26.4
          },
          {
            id: 2,
            name: 'Newsletter Junho',
            status: 'scheduled',
            scheduledFor: new Date('2025-06-20'),
            recipients: 1247,
            openRate: null,
            clickRate: null
          }
        ]
      };

      res.json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dashboard de email',
        error: error.message
      });
    }
  };

  // Listar campanhas
  const getCampaigns = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        search 
      } = req.query;
      
      const where = {};
      if (status) where.status = status;
      
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { subject: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const campaigns = await EmailCampaign.findAndCountAll({
        where,
        include: [
          { model: EmailTemplate, as: 'template', required: false }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: campaigns.rows,
        pagination: {
          total: campaigns.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(campaigns.count / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar campanhas',
        error: error.message
      });
    }
  };

  // Criar campanha
  const createCampaign = async (req, res) => {
    try {
      const {
        name,
        subject,
        templateId,
        content,
        scheduledFor,
        segmentation,
        abTest
      } = req.body;

      const campaign = await EmailCampaign.create({
        name,
        subject,
        templateId,
        content,
        status: scheduledFor ? 'scheduled' : 'draft',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        segmentation: segmentation || {},
        abTest: abTest || { enabled: false },
        stats: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          unsubscribed: 0,
          bounced: 0
        }
      });

      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campanha criada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar campanha',
        error: error.message
      });
    }
  };

  // Atualizar campanha
  const updateCampaign = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const campaign = await EmailCampaign.findByPk(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campanha não encontrada'
        });
      }

      await campaign.update(updateData);

      res.json({
        success: true,
        data: campaign,
        message: 'Campanha atualizada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar campanha',
        error: error.message
      });
    }
  };

  // Deletar campanha
  const deleteCampaign = async (req, res) => {
    try {
      const { id } = req.params;

      const campaign = await EmailCampaign.findByPk(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campanha não encontrada'
        });
      }

      await campaign.destroy();

      res.json({
        success: true,
        message: 'Campanha deletada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar campanha',
        error: error.message
      });
    }
  };

  // Listar templates
  const getTemplates = async (req, res) => {
    try {
      const templates = await EmailTemplate.findAll({
        order: [['name', 'ASC']]
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
        subject,
        content,
        variables,
        category
      } = req.body;

      const template = await EmailTemplate.create({
        name,
        subject,
        content,
        variables: variables || [],
        category: category || 'general',
        isActive: true
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

  // Enviar campanha
  const sendCampaign = async (req, res) => {
    try {
      const { id } = req.params;
      const { testEmail } = req.body;

      const campaign = await EmailCampaign.findByPk(id);
      if (!campaign) {
        return res.status(404).json({
          success: false,
          message: 'Campanha não encontrada'
        });
      }

      if (testEmail) {
        // Envio de teste
        console.log(`Enviando email de teste para: ${testEmail}`);
        
        res.json({
          success: true,
          message: 'Email de teste enviado com sucesso'
        });
      } else {
        // Envio real da campanha
        await campaign.update({
          status: 'sending',
          sentAt: new Date()
        });

        // TODO: Implementar envio real via SendGrid/Mailchimp
        console.log(`Enviando campanha: ${campaign.name}`);

        // Simular envio
        setTimeout(async () => {
          await campaign.update({
            status: 'sent',
            stats: {
              sent: 1247,
              delivered: 1198,
              opened: 914,
              clicked: 309,
              unsubscribed: 26,
              bounced: 49
            }
          });
        }, 5000);

        res.json({
          success: true,
          message: 'Campanha enviada com sucesso'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao enviar campanha',
        error: error.message
      });
    }
  };

  // Analytics de email
  const getEmailAnalytics = async (req, res) => {
    try {
      const { campaignId, period = '30d' } = req.query;
      
      // Mock data baseado no frontend
      const analytics = {
        overview: {
          totalSent: 1247,
          deliveryRate: 96.1,
          openRate: 76.3,
          clickRate: 24.8,
          unsubscribeRate: 2.1,
          bounceRate: 3.9
        },
        timeline: [], // Dados temporais
        topLinks: [
          { url: 'https://jessicasantos.com/agendar', clicks: 156, percentage: 50.5 },
          { url: 'https://jessicasantos.com/portfolio', clicks: 89, percentage: 28.8 },
          { url: 'https://jessicasantos.com/contato', clicks: 64, percentage: 20.7 }
        ],
        devices: [
          { device: 'Mobile', percentage: 68.2 },
          { device: 'Desktop', percentage: 28.4 },
          { device: 'Tablet', percentage: 3.4 }
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

  // Listar automações
  const getAutomations = async (req, res) => {
    try {
      const automations = await EmailAutomation.findAll({
        include: [
          { model: EmailTemplate, as: 'template', required: false }
        ],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: automations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar automações',
        error: error.message
      });
    }
  };

  // Configurar email marketing
  const configureEmail = async (req, res) => {
    try {
      const {
        provider,
        sendgridApiKey,
        mailchimpApiKey,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        fromEmail,
        fromName
      } = req.body;

      // Validar configurações baseadas no provider
      if (provider === 'sendgrid' && !sendgridApiKey) {
        return res.status(400).json({
          success: false,
          message: 'SendGrid API Key é obrigatória'
        });
      }

      if (provider === 'mailchimp' && !mailchimpApiKey) {
        return res.status(400).json({
          success: false,
          message: 'Mailchimp API Key é obrigatória'
        });
      }

      if (provider === 'smtp' && (!smtpHost || !smtpUser || !smtpPassword)) {
        return res.status(400).json({
          success: false,
          message: 'Configurações SMTP são obrigatórias'
        });
      }

      // Simular salvamento da configuração
      const config = {
        provider,
        sendgridApiKey: sendgridApiKey ? '***' + sendgridApiKey.slice(-4) : null,
        mailchimpApiKey: mailchimpApiKey ? '***' + mailchimpApiKey.slice(-4) : null,
        smtpHost,
        smtpPort: smtpPort || 587,
        smtpUser,
        smtpPassword: smtpPassword ? '***' : null,
        fromEmail,
        fromName,
        isActive: true,
        configuredAt: new Date()
      };

      res.json({
        success: true,
        data: config,
        message: `${provider.toUpperCase()} configurado com sucesso`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao configurar email marketing',
        error: error.message
      });
    }
  };

  // Obter configuração atual
  const getEmailConfig = async (req, res) => {
    try {
      // Mock data de configuração
      const config = {
        provider: 'sendgrid',
        fromEmail: 'jessica@jessicasantos.com',
        fromName: 'Jéssica Santos Fotografia',
        isActive: true,
        configuredAt: new Date('2025-06-15'),
        status: 'connected'
      };

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar configuração',
        error: error.message
      });
    }
  };

  // Testar configuração
  const testEmailConfig = async (req, res) => {
    try {
      const { testEmail } = req.body;

      // Simular teste de envio
      const testResult = {
        success: true,
        testEmail,
        sentAt: new Date(),
        deliveryTime: '1.2s',
        provider: 'sendgrid'
      };

      res.json({
        success: true,
        data: testResult,
        message: 'Email de teste enviado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao testar configuração',
        error: error.message
      });
    }
  };

  return {
    getEmailDashboard,
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getTemplates,
    createTemplate,
    sendCampaign,
    getEmailAnalytics,
    getAutomations,
    configureEmail,
    getEmailConfig,
    testEmailConfig
  };
};

module.exports = EmailController;

