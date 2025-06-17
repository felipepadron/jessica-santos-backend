# 🔔 Serviço de Notificações Push

import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from pywebpush import webpush, WebPushException

class NotificationService:
    def __init__(self):
        self.vapid_private_key = "YOUR_VAPID_PRIVATE_KEY"
        self.vapid_public_key = "YOUR_VAPID_PUBLIC_KEY"
        self.vapid_claims = {
            "sub": "mailto:jessica@jessicasantos.com"
        }
        
    def send_push_notification(self, subscription: Dict, notification_data: Dict) -> bool:
        """Envia notificação push para um dispositivo específico"""
        try:
            response = webpush(
                subscription_info=subscription,
                data=json.dumps(notification_data),
                vapid_private_key=self.vapid_private_key,
                vapid_claims=self.vapid_claims
            )
            return response.status_code == 201
        except WebPushException as ex:
            print(f"Erro ao enviar push notification: {ex}")
            return False
    
    def send_bulk_notification(self, subscriptions: List[Dict], notification_data: Dict) -> Dict:
        """Envia notificação para múltiplos dispositivos"""
        results = {
            "success": 0,
            "failed": 0,
            "errors": []
        }
        
        for subscription in subscriptions:
            if self.send_push_notification(subscription, notification_data):
                results["success"] += 1
            else:
                results["failed"] += 1
                results["errors"].append(subscription.get("endpoint", "Unknown"))
        
        return results
    
    def create_notification_data(self, title: str, message: str, **kwargs) -> Dict:
        """Cria dados estruturados para notificação"""
        return {
            "title": title,
            "body": message,
            "icon": kwargs.get("icon", "/icons/notification-icon.png"),
            "badge": kwargs.get("badge", "/icons/badge-icon.png"),
            "image": kwargs.get("image", ""),
            "data": {
                "url": kwargs.get("action_url", "/dashboard"),
                "timestamp": datetime.now().isoformat(),
                "type": kwargs.get("type", "sistema"),
                "priority": kwargs.get("priority", "media"),
                **kwargs.get("extra_data", {})
            },
            "actions": kwargs.get("actions", [
                {
                    "action": "view",
                    "title": "Ver Detalhes",
                    "icon": "/icons/view-icon.png"
                },
                {
                    "action": "dismiss",
                    "title": "Dispensar",
                    "icon": "/icons/dismiss-icon.png"
                }
            ]),
            "requireInteraction": kwargs.get("require_interaction", False),
            "silent": kwargs.get("silent", False),
            "vibrate": kwargs.get("vibrate", [200, 100, 200])
        }

class NotificationTemplateService:
    """Serviço para gerenciar templates de notificação"""
    
    def __init__(self):
        self.templates = {
            "agendamento_novo": {
                "title": "Novo Agendamento - {cliente_nome}",
                "message": "Agendamento para {tipo_ensaio} em {data_ensaio} às {hora_ensaio}",
                "icon": "/icons/calendar-icon.png",
                "type": "agendamento",
                "priority": "alta"
            },
            "agendamento_confirmado": {
                "title": "Agendamento Confirmado",
                "message": "{cliente_nome} confirmou o ensaio de {tipo_ensaio} para {data_ensaio}",
                "icon": "/icons/check-icon.png",
                "type": "agendamento",
                "priority": "media"
            },
            "agendamento_lembrete": {
                "title": "Lembrete: Ensaio Amanhã",
                "message": "Ensaio de {tipo_ensaio} com {cliente_nome} amanhã às {hora_ensaio}",
                "icon": "/icons/reminder-icon.png",
                "type": "agendamento",
                "priority": "alta"
            },
            "pagamento_aprovado": {
                "title": "Pagamento Aprovado - R$ {valor}",
                "message": "Pagamento de {cliente_nome} para {plano_nome} foi aprovado",
                "icon": "/icons/money-icon.png",
                "type": "pagamento",
                "priority": "alta"
            },
            "pagamento_pendente": {
                "title": "Pagamento Pendente",
                "message": "Pagamento de {cliente_nome} está aguardando confirmação",
                "icon": "/icons/pending-icon.png",
                "type": "pagamento",
                "priority": "media"
            },
            "pagamento_falhado": {
                "title": "Falha no Pagamento",
                "message": "Pagamento de {cliente_nome} foi recusado. Verificar com cliente.",
                "icon": "/icons/error-icon.png",
                "type": "pagamento",
                "priority": "urgente"
            },
            "ensaio_concluido": {
                "title": "Ensaio Concluído",
                "message": "Ensaio de {tipo_ensaio} com {cliente_nome} foi marcado como concluído",
                "icon": "/icons/camera-icon.png",
                "type": "ensaio",
                "priority": "media"
            },
            "fotos_prontas": {
                "title": "Fotos Prontas para Entrega",
                "message": "Fotos do ensaio de {cliente_nome} estão prontas para entrega",
                "icon": "/icons/photos-icon.png",
                "type": "ensaio",
                "priority": "alta"
            },
            "whatsapp_mensagem": {
                "title": "Nova Mensagem WhatsApp",
                "message": "Mensagem de {cliente_nome}: {preview_mensagem}",
                "icon": "/icons/whatsapp-icon.png",
                "type": "whatsapp",
                "priority": "media"
            },
            "sistema_backup": {
                "title": "Backup Realizado",
                "message": "Backup automático do sistema foi concluído com sucesso",
                "icon": "/icons/backup-icon.png",
                "type": "sistema",
                "priority": "baixa"
            },
            "marketing_campanha": {
                "title": "Nova Campanha Ativa",
                "message": "Campanha '{campanha_nome}' foi ativada e está sendo enviada",
                "icon": "/icons/marketing-icon.png",
                "type": "marketing",
                "priority": "media"
            }
        }
    
    def render_template(self, template_name: str, variables: Dict) -> Dict:
        """Renderiza um template com as variáveis fornecidas"""
        if template_name not in self.templates:
            raise ValueError(f"Template '{template_name}' não encontrado")
        
        template = self.templates[template_name].copy()
        
        # Substituir variáveis no título e mensagem
        template["title"] = template["title"].format(**variables)
        template["message"] = template["message"].format(**variables)
        
        return template
    
    def get_available_templates(self) -> List[str]:
        """Retorna lista de templates disponíveis"""
        return list(self.templates.keys())
    
    def get_template_variables(self, template_name: str) -> List[str]:
        """Retorna variáveis necessárias para um template"""
        if template_name not in self.templates:
            return []
        
        template = self.templates[template_name]
        variables = set()
        
        # Extrair variáveis do título e mensagem
        import re
        for text in [template["title"], template["message"]]:
            variables.update(re.findall(r'\{(\w+)\}', text))
        
        return list(variables)

class NotificationScheduler:
    """Serviço para agendar notificações"""
    
    def __init__(self):
        self.scheduled_notifications = []
    
    def schedule_notification(self, notification_data: Dict, send_at: datetime) -> str:
        """Agenda uma notificação para ser enviada em um horário específico"""
        notification_id = f"scheduled_{datetime.now().timestamp()}"
        
        scheduled_notification = {
            "id": notification_id,
            "data": notification_data,
            "send_at": send_at,
            "status": "scheduled",
            "created_at": datetime.now()
        }
        
        self.scheduled_notifications.append(scheduled_notification)
        return notification_id
    
    def schedule_reminder(self, base_datetime: datetime, reminder_minutes: int, notification_data: Dict) -> str:
        """Agenda um lembrete baseado em uma data/hora base"""
        reminder_time = base_datetime - timedelta(minutes=reminder_minutes)
        return self.schedule_notification(notification_data, reminder_time)
    
    def get_pending_notifications(self) -> List[Dict]:
        """Retorna notificações pendentes para envio"""
        now = datetime.now()
        pending = []
        
        for notification in self.scheduled_notifications:
            if (notification["status"] == "scheduled" and 
                notification["send_at"] <= now):
                pending.append(notification)
        
        return pending
    
    def mark_as_sent(self, notification_id: str) -> bool:
        """Marca uma notificação agendada como enviada"""
        for notification in self.scheduled_notifications:
            if notification["id"] == notification_id:
                notification["status"] = "sent"
                notification["sent_at"] = datetime.now()
                return True
        return False

# Instâncias globais dos serviços
notification_service = NotificationService()
template_service = NotificationTemplateService()
scheduler_service = NotificationScheduler()

