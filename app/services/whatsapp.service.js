const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const WhatsAppMessage = require('#models/WhatsAppMessage');
const WhatsAppTemplate = require('#models/WhatsAppTemplate');
const WhatsAppConfig = require('#models/WhatsAppConfig');
const Cliente = require('#models/Cliente');
const Agendamento = require('#models/Agendamento');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.qrCode = null;
    this.status = 'disconnected';
  }

  async initialize() {
    try {
      this.client = new Client({
        authStrategy: new LocalAuth({
          name: 'jessica-santos-session'
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      this.setupEventHandlers();
      await this.client.initialize();
      
      return { success: true, message: 'WhatsApp inicializado com sucesso' };
    } catch (error) {
      console.error('Erro ao inicializar WhatsApp:', error);
      return { success: false, message: error.message };
    }
  }

  setupEventHandlers() {
    this.client.on('qr', (qr) => {
      this.qrCode = qr;
      this.status = 'qr_code';
      qrcode.generate(qr, { small: true });
      console.log('QR Code gerado. Escaneie com seu WhatsApp.');
    });

    this.client.on('ready', () => {
      this.isReady = true;
      this.status = 'ready';
      console.log('WhatsApp conectado e pronto!');
    });

    this.client.on('authenticated', () => {
      this.status = 'authenticated';
      console.log('WhatsApp autenticado!');
    });

    this.client.on('auth_failure', (msg) => {
      this.status = 'auth_failure';
      console.error('Falha na autenticação:', msg);
    });

    this.client.on('disconnected', (reason) => {
      this.isReady = false;
      this.status = 'disconnected';
      console.log('WhatsApp desconectado:', reason);
    });

    this.client.on('message', async (message) => {
      await this.handleIncomingMessage(message);
    });

    this.client.on('message_ack', async (message, ack) => {
      await this.handleMessageAck(message, ack);
    });
  }

  async handleIncomingMessage(message) {
    try {
      const contact = await message.getContact();
      const chat = await message.getChat();

      // Salvar mensagem no banco
      await WhatsAppMessage.create({
        messageId: message.id.id,
        from: message.from,
        to: message.to,
        body: message.body,
        type: message.type,
        direction: 'inbound',
        status: 'received',
        metadata: {
          contactName: contact.name || contact.pushname,
          chatName: chat.name,
          timestamp: message.timestamp
        }
      });

      // Processar comandos automáticos
      await this.processAutomaticCommands(message);

    } catch (error) {
      console.error('Erro ao processar mensagem recebida:', error);
    }
  }

  async handleMessageAck(message, ack) {
    try {
      const statusMap = {
        1: 'sent',
        2: 'delivered',
        3: 'read'
      };

      const status = statusMap[ack] || 'pending';
      const updateData = { status };

      if (ack === 1) updateData.sentAt = new Date();
      if (ack === 2) updateData.deliveredAt = new Date();
      if (ack === 3) updateData.readAt = new Date();

      await WhatsAppMessage.update(updateData, {
        where: { messageId: message.id.id }
      });

    } catch (error) {
      console.error('Erro ao atualizar status da mensagem:', error);
    }
  }

  async processAutomaticCommands(message) {
    const body = message.body.toLowerCase().trim();

    // Comando para agendar
    if (body.includes('agendar') || body.includes('agendamento')) {
      await this.sendMessage(message.from, 
        'Olá! Para agendar seu ensaio, acesse nosso site: https://jessicasantos.com/agendar\n\nOu me informe:\n1. Tipo de ensaio\n2. Data preferida\n3. Horário preferido'
      );
    }

    // Comando para preços
    if (body.includes('preço') || body.includes('valor') || body.includes('quanto')) {
      await this.sendMessage(message.from,
        '📸 *Nossos Ensaios:*\n\n' +
        '• Retrato Individual - R$ 450\n' +
        '• Ensaio de Casal - R$ 650\n' +
        '• Ensaio Familiar - R$ 750\n' +
        '• Gestante - R$ 550\n' +
        '• Newborn - R$ 850\n' +
        '• Corporativo - R$ 350\n\n' +
        'Todos incluem edição e galeria online! 💕'
      );
    }

    // Comando para portfólio
    if (body.includes('portfólio') || body.includes('portfolio') || body.includes('trabalhos')) {
      await this.sendMessage(message.from,
        'Confira meu portfólio completo em:\n📸 https://jessicasantos.com/portfolio\n\nTambém estou no Instagram: @jessicasantosfoto'
      );
    }
  }

  async sendMessage(to, message, options = {}) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp não está conectado');
      }

      const sentMessage = await this.client.sendMessage(to, message, options);

      // Salvar mensagem enviada no banco
      await WhatsAppMessage.create({
        messageId: sentMessage.id.id,
        from: sentMessage.from,
        to: sentMessage.to,
        body: message,
        type: 'text',
        direction: 'outbound',
        status: 'sent',
        sentAt: new Date(),
        isAutomated: options.isAutomated || false,
        templateName: options.templateName || null,
        clienteId: options.clienteId || null,
        agendamentoId: options.agendamentoId || null
      });

      return { success: true, messageId: sentMessage.id.id };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      return { success: false, message: error.message };
    }
  }

  async sendTemplate(to, templateName, variables = {}) {
    try {
      const template = await WhatsAppTemplate.findOne({
        where: { name: templateName, isActive: true }
      });

      if (!template) {
        throw new Error('Template não encontrado');
      }

      let message = template.bodyText;

      // Substituir variáveis
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        message = message.replace(regex, variables[key]);
      });

      const result = await this.sendMessage(to, message, {
        templateName: templateName,
        isAutomated: true,
        ...variables
      });

      if (result.success) {
        // Atualizar estatísticas do template
        await WhatsAppTemplate.update({
          usageCount: template.usageCount + 1,
          lastUsedAt: new Date()
        }, {
          where: { id: template.id }
        });
      }

      return result;
    } catch (error) {
      console.error('Erro ao enviar template:', error);
      return { success: false, message: error.message };
    }
  }

  async sendReminder(agendamentoId, type = 'confirmation') {
    try {
      const agendamento = await Agendamento.findByPk(agendamentoId, {
        include: [{ model: Cliente, as: 'cliente' }]
      });

      if (!agendamento || !agendamento.cliente) {
        throw new Error('Agendamento ou cliente não encontrado');
      }

      const cliente = agendamento.cliente;
      const phone = cliente.telefone.replace(/\D/g, ''); // Remove caracteres não numéricos

      let templateName, variables;

      switch (type) {
        case 'confirmation':
          templateName = 'lembrete_confirmacao';
          variables = {
            nome: cliente.nome,
            data: agendamento.data,
            horario: agendamento.horario,
            tipo: agendamento.tipo,
            valor: agendamento.valor
          };
          break;

        case 'reminder_24h':
          templateName = 'lembrete_24h';
          variables = {
            nome: cliente.nome,
            data: agendamento.data,
            horario: agendamento.horario,
            endereco: 'Estúdio Jéssica Santos - Rua das Flores, 123'
          };
          break;

        case 'reminder_2h':
          templateName = 'lembrete_2h';
          variables = {
            nome: cliente.nome,
            horario: agendamento.horario
          };
          break;

        default:
          throw new Error('Tipo de lembrete inválido');
      }

      return await this.sendTemplate(`55${phone}@c.us`, templateName, {
        ...variables,
        clienteId: cliente.id,
        agendamentoId: agendamento.id
      });

    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      return { success: false, message: error.message };
    }
  }

  async getStatus() {
    return {
      isReady: this.isReady,
      status: this.status,
      qrCode: this.qrCode,
      info: this.isReady ? await this.client.info : null
    };
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.destroy();
        this.isReady = false;
        this.status = 'disconnected';
      }
      return { success: true, message: 'WhatsApp desconectado' };
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      return { success: false, message: error.message };
    }
  }

  async getChats() {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp não está conectado');
      }

      const chats = await this.client.getChats();
      return chats.map(chat => ({
        id: chat.id._serialized,
        name: chat.name,
        isGroup: chat.isGroup,
        unreadCount: chat.unreadCount,
        lastMessage: chat.lastMessage ? {
          body: chat.lastMessage.body,
          timestamp: chat.lastMessage.timestamp,
          from: chat.lastMessage.from
        } : null
      }));
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
      return [];
    }
  }

  async getChatMessages(chatId, limit = 50) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp não está conectado');
      }

      const chat = await this.client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit });

      return messages.map(msg => ({
        id: msg.id.id,
        body: msg.body,
        from: msg.from,
        to: msg.to,
        timestamp: msg.timestamp,
        type: msg.type,
        fromMe: msg.fromMe
      }));
    } catch (error) {
      console.error('Erro ao buscar mensagens do chat:', error);
      return [];
    }
  }
}

module.exports = new WhatsAppService();

