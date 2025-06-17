# 🔔 Sistema de Notificações Push - Backend Models

from datetime import datetime
from enum import Enum

class NotificationType(Enum):
    AGENDAMENTO = "agendamento"
    PAGAMENTO = "pagamento"
    ENSAIO = "ensaio"
    SISTEMA = "sistema"
    MARKETING = "marketing"
    WHATSAPP = "whatsapp"

class NotificationPriority(Enum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    URGENTE = "urgente"

class NotificationStatus(Enum):
    PENDENTE = "pendente"
    ENVIADA = "enviada"
    LIDA = "lida"
    FALHADA = "falhada"

class Notification:
    def __init__(self):
        self.id = None
        self.user_id = None
        self.title = ""
        self.message = ""
        self.type = NotificationType.SISTEMA
        self.priority = NotificationPriority.MEDIA
        self.status = NotificationStatus.PENDENTE
        self.data = {}  # JSON data adicional
        self.action_url = ""
        self.icon = ""
        self.image_url = ""
        self.scheduled_at = None
        self.sent_at = None
        self.read_at = None
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class NotificationTemplate:
    def __init__(self):
        self.id = None
        self.name = ""
        self.type = NotificationType.SISTEMA
        self.title_template = ""
        self.message_template = ""
        self.variables = []  # Lista de variáveis disponíveis
        self.enabled = True
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class NotificationConfig:
    def __init__(self):
        self.id = None
        self.user_id = None
        self.type = NotificationType.SISTEMA
        self.enabled = True
        self.push_enabled = True
        self.email_enabled = True
        self.whatsapp_enabled = False
        self.quiet_hours_start = "22:00"
        self.quiet_hours_end = "08:00"
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class PushSubscription:
    def __init__(self):
        self.id = None
        self.user_id = None
        self.endpoint = ""
        self.p256dh_key = ""
        self.auth_key = ""
        self.user_agent = ""
        self.active = True
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

