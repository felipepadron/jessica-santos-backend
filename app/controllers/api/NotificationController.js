const Notification = require('#models/Notification');
const NotificationTemplate = require('#models/NotificationTemplate');
const NotificationConfig = require('#models/NotificationConfig');
const Cliente = require('#models/Cliente');
const { Op } = require('sequelize');

const NotificationController = () => {

  // Listar notificações
  const getNotifications = async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        type, 
        search,
        userId 
      } = req.query;
      
      const where = {};
      if (status) where.status = status;
      if (type) where.type = type;
      if (userId) where.userId = userId;
      
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { message: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const notifications = await Notification.findAndCountAll({
        where,
        include: [
          { model: Cliente, as: 'cliente', required: false }
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: notifications.rows,
        pagination: {
          total: notifications.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(notifications.count / parseInt(limit))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar notificações',
        error: error.message
      });
    }
  };

  // Criar notificação
  const createNotification = async (req, res) => {
    try {
      const {
        title,
        message,
        type,
        priority,
        userId,
        clienteId,
        scheduledFor,
        channels,
        metadata
      } = req.body;

      const notification = await Notification.create({
        title,
        message,
        type,
        priority: priority || 'medium',
        userId,
        clienteId,
        status: scheduledFor ? 'scheduled' : 'sent',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        sentAt: scheduledFor ? null : new Date(),
        channels: channels || ['push'],
        metadata: metadata || {}
      });

      // Se não é agendada, enviar imediatamente
      if (!scheduledFor) {
        // TODO: Implementar envio real
        console.log(`Enviando notificação: ${title}`);
      }

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notificação criada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar notificação',
        error: error.message
      });
    }
  };

  // Marcar como lida
  const markAsRead = async (req, res) => {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificação não encontrada'
        });
      }

      await notification.update({
        status: 'read',
        readAt: new Date()
      });

      res.json({
        success: true,
        data: notification,
        message: 'Notificação marcada como lida'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao marcar notificação como lida',
        error: error.message
      });
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async (req, res) => {
    try {
      const { userId } = req.body;
      
      await Notification.update({
        status: 'read',
        readAt: new Date()
      }, {
        where: {
          userId,
          status: 'sent'
        }
      });

      res.json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao marcar todas como lidas',
        error: error.message
      });
    }
  };

  // Deletar notificação
  const deleteNotification = async (req, res) => {
    try {
      const { id } = req.params;
      
      const notification = await Notification.findByPk(id);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notificação não encontrada'
        });
      }

      await notification.destroy();

      res.json({
        success: true,
        message: 'Notificação deletada com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar notificação',
        error: error.message
      });
    }
  };

  // Obter configurações de notificação
  const getNotificationConfig = async (req, res) => {
    try {
      const { userId } = req.query;
      
      let config = await NotificationConfig.findOne({
        where: { userId }
      });

      // Se não existe, criar configuração padrão
      if (!config) {
        config = await NotificationConfig.create({
          userId,
          agendamentos: { push: true, email: true, sound: true, vibration: true },
          pagamentos: { push: true, email: true, sound: true, vibration: false },
          ensaios: { push: true, email: false, sound: false, vibration: true },
          whatsapp: { push: true, email: false, sound: true, vibration: false },
          marketing: { push: false, email: true, sound: false, vibration: false },
          sistema: { push: true, email: true, sound: false, vibration: false },
          silentHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
          }
        });
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar configurações',
        error: error.message
      });
    }
  };

  // Atualizar configurações de notificação
  const updateNotificationConfig = async (req, res) => {
    try {
      const { userId, ...configData } = req.body;
      
      const [config, created] = await NotificationConfig.findOrCreate({
        where: { userId },
        defaults: { userId, ...configData }
      });

      if (!created) {
        await config.update(configData);
      }

      res.json({
        success: true,
        data: config,
        message: 'Configurações atualizadas com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar configurações',
        error: error.message
      });
    }
  };

  // Obter estatísticas de notificações
  const getNotificationStats = async (req, res) => {
    try {
      const { userId, period = '30d' } = req.query;
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(period.replace('d', '')));

      const where = {
        createdAt: { [Op.between]: [startDate, endDate] }
      };
      
      if (userId) where.userId = userId;

      const stats = await Notification.findAll({
        where,
        attributes: [
          'type',
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['type', 'status']
      });

      const total = await Notification.count({ where });
      const unread = await Notification.count({ 
        where: { ...where, status: 'sent' } 
      });

      res.json({
        success: true,
        data: {
          total,
          unread,
          read: total - unread,
          byTypeAndStatus: stats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error.message
      });
    }
  };

  return {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationConfig,
    updateNotificationConfig,
    getNotificationStats
  };
};

module.exports = NotificationController;

