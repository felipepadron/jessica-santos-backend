# 📧 Email Marketing Models - Backend

from datetime import datetime
from enum import Enum

class CampaignStatus(Enum):
    RASCUNHO = "rascunho"
    AGENDADA = "agendada"
    ENVIANDO = "enviando"
    ENVIADA = "enviada"
    PAUSADA = "pausada"
    CANCELADA = "cancelada"

class CampaignType(Enum):
    NEWSLETTER = "newsletter"
    PROMOCIONAL = "promocional"
    TRANSACIONAL = "transacional"
    BOAS_VINDAS = "boas_vindas"
    FOLLOW_UP = "follow_up"
    REMARKETING = "remarketing"

class EmailTemplate:
    def __init__(self):
        self.id = None
        self.name = ""
        self.description = ""
        self.category = ""
        self.html_content = ""
        self.text_content = ""
        self.variables = []  # Lista de variáveis disponíveis
        self.thumbnail_url = ""
        self.is_active = True
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class EmailCampaign:
    def __init__(self):
        self.id = None
        self.name = ""
        self.subject = ""
        self.preview_text = ""
        self.from_name = "Jéssica Santos"
        self.from_email = "jessica@jessicasantos.com"
        self.reply_to = "jessica@jessicasantos.com"
        self.template_id = None
        self.html_content = ""
        self.text_content = ""
        self.type = CampaignType.NEWSLETTER
        self.status = CampaignStatus.RASCUNHO
        self.scheduled_at = None
        self.sent_at = None
        self.recipient_count = 0
        self.opened_count = 0
        self.clicked_count = 0
        self.bounced_count = 0
        self.unsubscribed_count = 0
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class EmailList:
    def __init__(self):
        self.id = None
        self.name = ""
        self.description = ""
        self.subscriber_count = 0
        self.is_active = True
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class EmailSubscriber:
    def __init__(self):
        self.id = None
        self.email = ""
        self.first_name = ""
        self.last_name = ""
        self.phone = ""
        self.tags = []
        self.custom_fields = {}
        self.is_subscribed = True
        self.subscribed_at = datetime.now()
        self.unsubscribed_at = None
        self.source = ""  # website, whatsapp, manual, etc.
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class EmailAutomation:
    def __init__(self):
        self.id = None
        self.name = ""
        self.description = ""
        self.trigger_type = ""  # subscription, purchase, birthday, etc.
        self.trigger_conditions = {}
        self.is_active = True
        self.emails = []  # Lista de emails na sequência
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class EmailAutomationStep:
    def __init__(self):
        self.id = None
        self.automation_id = None
        self.step_order = 1
        self.delay_days = 0
        self.delay_hours = 0
        self.template_id = None
        self.subject = ""
        self.conditions = {}  # Condições para envio
        self.is_active = True
        self.created_at = datetime.now()

class EmailSend:
    def __init__(self):
        self.id = None
        self.campaign_id = None
        self.subscriber_id = None
        self.email = ""
        self.status = "pending"  # pending, sent, delivered, opened, clicked, bounced, failed
        self.sent_at = None
        self.delivered_at = None
        self.opened_at = None
        self.clicked_at = None
        self.bounced_at = None
        self.error_message = ""
        self.tracking_data = {}
        self.created_at = datetime.now()

class EmailClick:
    def __init__(self):
        self.id = None
        self.send_id = None
        self.url = ""
        self.clicked_at = datetime.now()
        self.ip_address = ""
        self.user_agent = ""

class EmailSegment:
    def __init__(self):
        self.id = None
        self.name = ""
        self.description = ""
        self.conditions = {}  # Condições de segmentação
        self.subscriber_count = 0
        self.is_dynamic = True  # Se atualiza automaticamente
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

