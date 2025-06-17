module.exports = {
	'GET /users/name': 'UsersController.getFullName',
	
	// Rotas de Clientes
	'GET /clientes': 'ClienteController.getAll',
	'POST /clientes': 'ClienteController.create',
	'GET /clientes/:id': 'ClienteController.getById',
	'PUT /clientes/:id': 'ClienteController.update',
	'DELETE /clientes/:id': 'ClienteController.delete',
	
	// Rotas de Agendamentos
	'GET /agendamentos': 'AgendamentoController.getAll',
	'POST /agendamentos': 'AgendamentoController.create',
	'GET /agendamentos/:id': 'AgendamentoController.getById',
	'PUT /agendamentos/:id': 'AgendamentoController.update',
	'DELETE /agendamentos/:id': 'AgendamentoController.delete',
	
	// Rotas de Ensaios
	'GET /ensaios': 'EnsaioController.getAll',
	'POST /ensaios': 'EnsaioController.create',
	'GET /ensaios/:id': 'EnsaioController.getById',
	'PUT /ensaios/:id': 'EnsaioController.update',
	'DELETE /ensaios/:id': 'EnsaioController.delete',
	
	// Rotas de Upload
	'POST /upload': 'UploadController.uploadFotos',
	'GET /fotos/:ensaioId': 'UploadController.getFotosByEnsaio',
	'DELETE /fotos/:id': 'UploadController.deleteFoto',
	
	// Rotas de Pagamentos
	'POST /payments/stripe/configure': 'PaymentController.configureStripe',
	'POST /payments/pagseguro/configure': 'PaymentController.configurePagSeguro',
	'POST /payments/stripe/checkout': 'PaymentController.createStripeCheckout',
	'POST /payments/stripe/webhook': 'PaymentController.stripeWebhook',
	'GET /payments': 'PaymentController.getPayments',
	'GET /payments/report': 'PaymentController.getFinancialReport',
	
	// Rotas de Planos
	'GET /plans': 'PlanController.getPlans',
	'POST /plans': 'PlanController.createPlan',
	'GET /plans/:id': 'PlanController.getPlan',
	'PUT /plans/:id': 'PlanController.updatePlan',
	'DELETE /plans/:id': 'PlanController.deletePlan',
	
	// Rotas de Relatórios
	'GET /reports/dashboard': 'ReportController.getDashboardData',
	'GET /reports/financial': 'ReportController.getFinancialReport',
	'GET /reports/whatsapp': 'ReportController.getWhatsAppReport',
	'POST /reports/export': 'ReportController.exportReport',
	
	// Rotas de Notificações
	'GET /notifications': 'NotificationController.getNotifications',
	'POST /notifications': 'NotificationController.createNotification',
	'PUT /notifications/:id/read': 'NotificationController.markAsRead',
	'PUT /notifications/read-all': 'NotificationController.markAllAsRead',
	'DELETE /notifications/:id': 'NotificationController.deleteNotification',
	'GET /notifications/config': 'NotificationController.getNotificationConfig',
	'PUT /notifications/config': 'NotificationController.updateNotificationConfig',
	'GET /notifications/stats': 'NotificationController.getNotificationStats',
	
	// Rotas de WhatsApp
	'GET /whatsapp/status': 'WhatsAppController.getConnectionStatus',
	'POST /whatsapp/configure': 'WhatsAppController.configureWhatsApp',
	'GET /whatsapp/templates': 'WhatsAppController.getTemplates',
	'POST /whatsapp/templates': 'WhatsAppController.createTemplate',
	'PUT /whatsapp/templates/:id': 'WhatsAppController.updateTemplate',
	'DELETE /whatsapp/templates/:id': 'WhatsAppController.deleteTemplate',
	'POST /whatsapp/send': 'WhatsAppController.sendMessage',
	'GET /whatsapp/messages': 'WhatsAppController.getMessages',
	'GET /whatsapp/analytics': 'WhatsAppController.getAnalytics',
	
	// Rotas de Email Marketing
	'GET /email/dashboard': 'EmailController.getEmailDashboard',
	'GET /email/campaigns': 'EmailController.getCampaigns',
	'POST /email/campaigns': 'EmailController.createCampaign',
	'PUT /email/campaigns/:id': 'EmailController.updateCampaign',
	'DELETE /email/campaigns/:id': 'EmailController.deleteCampaign',
	'POST /email/campaigns/:id/send': 'EmailController.sendCampaign',
	'GET /email/templates': 'EmailController.getTemplates',
	'POST /email/templates': 'EmailController.createTemplate',
	'GET /email/analytics': 'EmailController.getEmailAnalytics',
	'GET /email/automations': 'EmailController.getAutomations'
};