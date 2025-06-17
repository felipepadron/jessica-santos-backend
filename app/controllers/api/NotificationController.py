# 🔔 Controller de Notificações - API

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import json

notifications_bp = Blueprint('notifications', __name__)

# Simulação de dados (em produção seria banco de dados)
notifications_db = []
subscriptions_db = []
configs_db = {}

@notifications_bp.route('/notifications', methods=['GET'])
def get_notifications():
    """Busca notificações do usuário"""
    user_id = request.args.get('user_id', 'admin')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    status = request.args.get('status', 'all')
    
    # Filtrar notificações
    user_notifications = [n for n in notifications_db if n.get('user_id') == user_id]
    
    if status != 'all':
        user_notifications = [n for n in user_notifications if n.get('status') == status]
    
    # Paginação
    start = (page - 1) * limit
    end = start + limit
    paginated = user_notifications[start:end]
    
    return jsonify({
        "success": True,
        "notifications": paginated,
        "total": len(user_notifications),
        "page": page,
        "limit": limit,
        "unread_count": len([n for n in user_notifications if n.get('status') == 'pendente'])
    })

@notifications_bp.route('/notifications', methods=['POST'])
def create_notification():
    """Cria uma nova notificação"""
    data = request.get_json()
    
    notification = {
        "id": f"notif_{len(notifications_db) + 1}",
        "user_id": data.get('user_id', 'admin'),
        "title": data.get('title', ''),
        "message": data.get('message', ''),
        "type": data.get('type', 'sistema'),
        "priority": data.get('priority', 'media'),
        "status": "pendente",
        "data": data.get('data', {}),
        "action_url": data.get('action_url', ''),
        "icon": data.get('icon', '/icons/default.png'),
        "image_url": data.get('image_url', ''),
        "scheduled_at": data.get('scheduled_at'),
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    notifications_db.append(notification)
    
    # Se não é agendada, enviar imediatamente
    if not notification["scheduled_at"]:
        send_push_notification(notification)
    
    return jsonify({
        "success": True,
        "notification": notification,
        "message": "Notificação criada com sucesso"
    })

@notifications_bp.route('/notifications/<notification_id>/read', methods=['POST'])
def mark_as_read(notification_id):
    """Marca notificação como lida"""
    for notification in notifications_db:
        if notification["id"] == notification_id:
            notification["status"] = "lida"
            notification["read_at"] = datetime.now().isoformat()
            notification["updated_at"] = datetime.now().isoformat()
            
            return jsonify({
                "success": True,
                "message": "Notificação marcada como lida"
            })
    
    return jsonify({
        "success": False,
        "message": "Notificação não encontrada"
    }), 404

@notifications_bp.route('/notifications/mark-all-read', methods=['POST'])
def mark_all_as_read():
    """Marca todas as notificações como lidas"""
    data = request.get_json()
    user_id = data.get('user_id', 'admin')
    
    count = 0
    for notification in notifications_db:
        if notification["user_id"] == user_id and notification["status"] == "pendente":
            notification["status"] = "lida"
            notification["read_at"] = datetime.now().isoformat()
            notification["updated_at"] = datetime.now().isoformat()
            count += 1
    
    return jsonify({
        "success": True,
        "message": f"{count} notificações marcadas como lidas"
    })

@notifications_bp.route('/notifications/subscribe', methods=['POST'])
def subscribe_push():
    """Registra subscription para push notifications"""
    data = request.get_json()
    
    subscription = {
        "id": f"sub_{len(subscriptions_db) + 1}",
        "user_id": data.get('user_id', 'admin'),
        "endpoint": data.get('endpoint', ''),
        "keys": {
            "p256dh": data.get('keys', {}).get('p256dh', ''),
            "auth": data.get('keys', {}).get('auth', '')
        },
        "user_agent": request.headers.get('User-Agent', ''),
        "active": True,
        "created_at": datetime.now().isoformat()
    }
    
    subscriptions_db.append(subscription)
    
    return jsonify({
        "success": True,
        "subscription_id": subscription["id"],
        "message": "Subscription registrada com sucesso"
    })

@notifications_bp.route('/notifications/config', methods=['GET'])
def get_notification_config():
    """Busca configurações de notificação do usuário"""
    user_id = request.args.get('user_id', 'admin')
    
    config = configs_db.get(user_id, {
        "user_id": user_id,
        "agendamento_enabled": True,
        "pagamento_enabled": True,
        "ensaio_enabled": True,
        "sistema_enabled": False,
        "marketing_enabled": True,
        "whatsapp_enabled": True,
        "push_enabled": True,
        "email_enabled": True,
        "quiet_hours_enabled": True,
        "quiet_hours_start": "22:00",
        "quiet_hours_end": "08:00",
        "sound_enabled": True,
        "vibration_enabled": True
    })
    
    return jsonify({
        "success": True,
        "config": config
    })

@notifications_bp.route('/notifications/config', methods=['POST'])
def update_notification_config():
    """Atualiza configurações de notificação"""
    data = request.get_json()
    user_id = data.get('user_id', 'admin')
    
    configs_db[user_id] = {
        **configs_db.get(user_id, {}),
        **data,
        "updated_at": datetime.now().isoformat()
    }
    
    return jsonify({
        "success": True,
        "config": configs_db[user_id],
        "message": "Configurações atualizadas com sucesso"
    })

@notifications_bp.route('/notifications/templates', methods=['GET'])
def get_notification_templates():
    """Busca templates de notificação disponíveis"""
    templates = {
        "agendamento_novo": {
            "name": "Novo Agendamento",
            "description": "Notificação para novos agendamentos",
            "variables": ["cliente_nome", "tipo_ensaio", "data_ensaio", "hora_ensaio"],
            "example": "Novo Agendamento - Maria Silva para Ensaio Gestante em 20/06/2025 às 14:00"
        },
        "pagamento_aprovado": {
            "name": "Pagamento Aprovado",
            "description": "Notificação para pagamentos aprovados",
            "variables": ["cliente_nome", "valor", "plano_nome"],
            "example": "Pagamento Aprovado - R$ 850,00 de Ana Santos para Ensaio Newborn"
        },
        "ensaio_lembrete": {
            "name": "Lembrete de Ensaio",
            "description": "Lembrete de ensaio próximo",
            "variables": ["cliente_nome", "tipo_ensaio", "data_ensaio", "hora_ensaio"],
            "example": "Lembrete: Ensaio Gestante com Maria Silva amanhã às 14:00"
        },
        "whatsapp_mensagem": {
            "name": "Nova Mensagem WhatsApp",
            "description": "Notificação para novas mensagens",
            "variables": ["cliente_nome", "preview_mensagem"],
            "example": "Nova Mensagem de João Silva: Olá, gostaria de agendar..."
        }
    }
    
    return jsonify({
        "success": True,
        "templates": templates
    })

@notifications_bp.route('/notifications/send-test', methods=['POST'])
def send_test_notification():
    """Envia notificação de teste"""
    data = request.get_json()
    
    test_notification = {
        "id": f"test_{datetime.now().timestamp()}",
        "user_id": data.get('user_id', 'admin'),
        "title": "Notificação de Teste",
        "message": "Esta é uma notificação de teste do sistema ERP Jéssica Santos",
        "type": "sistema",
        "priority": "media",
        "status": "enviada",
        "icon": "/icons/test-icon.png",
        "action_url": "/dashboard",
        "created_at": datetime.now().isoformat()
    }
    
    notifications_db.append(test_notification)
    
    return jsonify({
        "success": True,
        "notification": test_notification,
        "message": "Notificação de teste enviada"
    })

@notifications_bp.route('/notifications/stats', methods=['GET'])
def get_notification_stats():
    """Busca estatísticas de notificações"""
    user_id = request.args.get('user_id', 'admin')
    days = int(request.args.get('days', 7))
    
    # Filtrar notificações dos últimos X dias
    cutoff_date = datetime.now() - timedelta(days=days)
    recent_notifications = [
        n for n in notifications_db 
        if (n.get('user_id') == user_id and 
            datetime.fromisoformat(n['created_at']) > cutoff_date)
    ]
    
    stats = {
        "total": len(recent_notifications),
        "by_type": {},
        "by_status": {},
        "by_priority": {},
        "daily_count": {}
    }
    
    # Contar por tipo, status e prioridade
    for notification in recent_notifications:
        # Por tipo
        tipo = notification.get('type', 'sistema')
        stats["by_type"][tipo] = stats["by_type"].get(tipo, 0) + 1
        
        # Por status
        status = notification.get('status', 'pendente')
        stats["by_status"][status] = stats["by_status"].get(status, 0) + 1
        
        # Por prioridade
        priority = notification.get('priority', 'media')
        stats["by_priority"][priority] = stats["by_priority"].get(priority, 0) + 1
        
        # Por dia
        day = datetime.fromisoformat(notification['created_at']).strftime('%Y-%m-%d')
        stats["daily_count"][day] = stats["daily_count"].get(day, 0) + 1
    
    return jsonify({
        "success": True,
        "stats": stats,
        "period_days": days
    })

def send_push_notification(notification):
    """Função auxiliar para enviar push notification"""
    # Em produção, aqui seria implementado o envio real
    # usando bibliotecas como pywebpush
    print(f"Enviando push notification: {notification['title']}")
    notification["status"] = "enviada"
    notification["sent_at"] = datetime.now().isoformat()
    return True

# Dados de exemplo para demonstração
def init_sample_data():
    """Inicializa dados de exemplo"""
    sample_notifications = [
        {
            "id": "notif_1",
            "user_id": "admin",
            "title": "Novo Agendamento - Ana Silva",
            "message": "Agendamento para Ensaio Gestante em 20/06/2025 às 14:00",
            "type": "agendamento",
            "priority": "alta",
            "status": "pendente",
            "icon": "/icons/calendar-icon.png",
            "action_url": "/dashboard/agendamentos",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": "notif_2",
            "user_id": "admin",
            "title": "Pagamento Aprovado - R$ 850",
            "message": "Pagamento de Maria Santos para Ensaio Newborn foi aprovado",
            "type": "pagamento",
            "priority": "alta",
            "status": "lida",
            "icon": "/icons/money-icon.png",
            "action_url": "/configuracoes-pagamentos",
            "created_at": (datetime.now() - timedelta(hours=2)).isoformat(),
            "read_at": (datetime.now() - timedelta(hours=1)).isoformat()
        },
        {
            "id": "notif_3",
            "user_id": "admin",
            "title": "Lembrete: Ensaio Amanhã",
            "message": "Ensaio de Família com João Silva amanhã às 16:00",
            "type": "ensaio",
            "priority": "media",
            "status": "pendente",
            "icon": "/icons/reminder-icon.png",
            "action_url": "/dashboard/ensaios",
            "created_at": (datetime.now() - timedelta(hours=4)).isoformat()
        }
    ]
    
    notifications_db.extend(sample_notifications)

# Inicializar dados de exemplo
init_sample_data()

