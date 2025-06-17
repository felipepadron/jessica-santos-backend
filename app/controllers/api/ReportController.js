const Report = require('#models/Report');
const Cliente = require('#models/Cliente');
const Agendamento = require('#models/Agendamento');
const Payment = require('#models/Payment');
const WhatsAppMessage = require('#models/WhatsAppMessage');
const EmailCampaign = require('#models/EmailCampaign');
const { Op, sequelize } = require('sequelize');

const ReportController = () => {

  // Dashboard principal - dados gerais
  const getDashboardData = async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      
      // Calcular datas baseado no período
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Receita total
      const totalRevenue = await Payment.sum('amount', {
        where: {
          status: 'completed',
          paidAt: { [Op.between]: [startDate, endDate] }
        }
      }) || 0;

      // Clientes ativos
      const activeClients = await Cliente.count({
        where: {
          status: 'active',
          createdAt: { [Op.between]: [startDate, endDate] }
        }
      });

      // Ensaios realizados
      const completedSessions = await Agendamento.count({
        where: {
          status: 'completed',
          dataAgendamento: { [Op.between]: [startDate, endDate] }
        }
      });

      // Ticket médio
      const avgTicket = totalRevenue > 0 && completedSessions > 0 
        ? totalRevenue / completedSessions 
        : 0;

      // Taxa de conversão (agendamentos confirmados / total)
      const totalBookings = await Agendamento.count({
        where: {
          createdAt: { [Op.between]: [startDate, endDate] }
        }
      });
      
      const conversionRate = totalBookings > 0 
        ? (completedSessions / totalBookings) * 100 
        : 0;

      // NPS Score (simulado - baseado em avaliações)
      const npsScore = 9.2; // Mock data

      // Dados para gráfico de receita (últimos 7 dias)
      const revenueChart = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dayRevenue = await Payment.sum('amount', {
          where: {
            status: 'completed',
            paidAt: {
              [Op.between]: [
                new Date(date.setHours(0, 0, 0, 0)),
                new Date(date.setHours(23, 59, 59, 999))
              ]
            }
          }
        }) || 0;

        revenueChart.push({
          date: date.toISOString().split('T')[0],
          revenue: dayRevenue,
          sessions: Math.floor(Math.random() * 5) + 1, // Mock
          clients: Math.floor(Math.random() * 3) + 1 // Mock
        });
      }

      res.json({
        success: true,
        data: {
          kpis: {
            totalRevenue: {
              value: totalRevenue,
              change: 19.8, // Mock - calcular vs período anterior
              trend: 'up'
            },
            activeClients: {
              value: activeClients,
              change: 29.6,
              trend: 'up'
            },
            completedSessions: {
              value: completedSessions,
              change: 21.4,
              trend: 'up'
            },
            avgTicket: {
              value: avgTicket,
              change: -1.2,
              trend: 'down'
            },
            conversionRate: {
              value: conversionRate,
              change: 6.6,
              trend: 'up'
            },
            npsScore: {
              value: npsScore,
              change: 4.5,
              trend: 'up'
            }
          },
          charts: {
            revenue: revenueChart
          },
          period
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar dados do dashboard',
        error: error.message
      });
    }
  };

  // Relatório financeiro detalhado
  const getFinancialReport = async (req, res) => {
    try {
      const { startDate, endDate, format = 'json' } = req.query;
      
      const where = {
        status: 'completed'
      };
      
      if (startDate && endDate) {
        where.paidAt = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Receita por gateway
      const revenueByGateway = await Payment.findAll({
        where,
        attributes: [
          'gateway',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('AVG', sequelize.col('amount')), 'average']
        ],
        group: ['gateway']
      });

      // Receita total
      const totalRevenue = await Payment.sum('amount', { where });
      const totalTransactions = await Payment.count({ where });

      // Fluxo de caixa (últimos 30 dias)
      const cashFlow = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dayRevenue = await Payment.sum('amount', {
          where: {
            status: 'completed',
            paidAt: {
              [Op.between]: [
                new Date(date.setHours(0, 0, 0, 0)),
                new Date(date.setHours(23, 59, 59, 999))
              ]
            }
          }
        }) || 0;

        cashFlow.push({
          date: date.toISOString().split('T')[0],
          revenue: dayRevenue,
          expenses: dayRevenue * 0.3, // Mock - 30% de custos
          profit: dayRevenue * 0.7
        });
      }

      const reportData = {
        summary: {
          totalRevenue: totalRevenue || 0,
          totalTransactions: totalTransactions || 0,
          averageTicket: totalRevenue && totalTransactions 
            ? totalRevenue / totalTransactions 
            : 0,
          profitMargin: 57.9 // Mock
        },
        byGateway: revenueByGateway,
        cashFlow,
        period: { startDate, endDate }
      };

      if (format === 'pdf' || format === 'excel') {
        // TODO: Implementar exportação
        res.json({
          success: true,
          message: `Exportação ${format} será implementada`,
          data: reportData
        });
      } else {
        res.json({
          success: true,
          data: reportData
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar relatório financeiro',
        error: error.message
      });
    }
  };

  // Relatório de WhatsApp
  const getWhatsAppReport = async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      
      // Mock data baseado no que foi implementado no frontend
      const whatsappData = {
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
        ],
        timeline: [] // Dados temporais
      };

      res.json({
        success: true,
        data: whatsappData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao gerar relatório WhatsApp',
        error: error.message
      });
    }
  };

  // Exportar relatórios
  const exportReport = async (req, res) => {
    try {
      const { type, format, startDate, endDate } = req.body;
      
      // Mock implementation
      res.json({
        success: true,
        message: `Relatório ${type} em formato ${format} será exportado`,
        downloadUrl: `/api/reports/download/${type}-${Date.now()}.${format}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao exportar relatório',
        error: error.message
      });
    }
  };

  return {
    getDashboardData,
    getFinancialReport,
    getWhatsAppReport,
    exportReport
  };
};

module.exports = ReportController;

