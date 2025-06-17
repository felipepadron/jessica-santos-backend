# 📧 Serviço de Email Marketing

import json
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

class EmailService:
    def __init__(self):
        # Configurações SMTP (exemplo com Gmail)
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.smtp_username = "jessica@jessicasantos.com"
        self.smtp_password = "app_password_here"
        
        # Configurações de APIs externas
        self.sendgrid_api_key = "SG.your_sendgrid_api_key"
        self.mailchimp_api_key = "your_mailchimp_api_key"
        
    def send_email_smtp(self, to_email: str, subject: str, html_content: str, text_content: str = "") -> bool:
        """Envia email via SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.smtp_username
            msg['To'] = to_email
            
            # Adicionar conteúdo texto e HTML
            if text_content:
                part1 = MIMEText(text_content, 'plain')
                msg.attach(part1)
            
            part2 = MIMEText(html_content, 'html')
            msg.attach(part2)
            
            # Conectar e enviar
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.send_message(msg)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Erro ao enviar email: {e}")
            return False
    
    def send_email_sendgrid(self, to_email: str, subject: str, html_content: str) -> bool:
        """Envia email via SendGrid API"""
        try:
            url = "https://api.sendgrid.com/v3/mail/send"
            headers = {
                "Authorization": f"Bearer {self.sendgrid_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "personalizations": [{
                    "to": [{"email": to_email}],
                    "subject": subject
                }],
                "from": {"email": self.smtp_username, "name": "Jéssica Santos"},
                "content": [{
                    "type": "text/html",
                    "value": html_content
                }]
            }
            
            response = requests.post(url, headers=headers, json=data)
            return response.status_code == 202
        except Exception as e:
            print(f"Erro SendGrid: {e}")
            return False
    
    def send_bulk_email(self, recipients: List[str], subject: str, html_content: str) -> Dict:
        """Envia email em massa"""
        results = {
            "success": 0,
            "failed": 0,
            "errors": []
        }
        
        for email in recipients:
            if self.send_email_smtp(email, subject, html_content):
                results["success"] += 1
            else:
                results["failed"] += 1
                results["errors"].append(email)
        
        return results

class EmailTemplateService:
    """Serviço para gerenciar templates de email"""
    
    def __init__(self):
        self.templates = {
            "boas_vindas": {
                "name": "Boas-vindas",
                "subject": "Bem-vinda ao mundo da fotografia, {nome}!",
                "html": """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <header style="background: linear-gradient(135deg, #D4AF37, #F4E4BC); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Jéssica Santos Fotografia</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Capturando momentos únicos</p>
                    </header>
                    
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #333;">Olá, {nome}!</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Seja muito bem-vinda! Estou muito feliz em tê-la como parte da nossa família.
                        </p>
                        <p style="color: #666; line-height: 1.6;">
                            Aqui você receberá dicas exclusivas de fotografia, promoções especiais e 
                            novidades sobre nossos ensaios.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://jessicasantos.com/portfolio" 
                               style="background: #D4AF37; color: white; padding: 15px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Ver Portfólio
                            </a>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6;">
                            Com carinho,<br>
                            <strong>Jéssica Santos</strong>
                        </p>
                    </div>
                    
                    <footer style="background: #f8f8f8; padding: 20px; text-align: center; color: #999;">
                        <p>Jéssica Santos Fotografia | jessica@jessicasantos.com</p>
                        <p><a href="{unsubscribe_url}" style="color: #999;">Descadastrar</a></p>
                    </footer>
                </div>
                """,
                "variables": ["nome", "unsubscribe_url"]
            },
            
            "promocao_ensaio": {
                "name": "Promoção de Ensaio",
                "subject": "🎉 Promoção especial: {desconto}% OFF em ensaios!",
                "html": """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <header style="background: linear-gradient(135deg, #D4AF37, #F4E4BC); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">PROMOÇÃO ESPECIAL</h1>
                        <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">{desconto}% OFF</p>
                    </header>
                    
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #333;">Olá, {nome}!</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Temos uma promoção especial só para você! 
                        </p>
                        
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="color: #D4AF37; margin: 0 0 10px 0;">🎯 {tipo_ensaio}</h3>
                            <p style="color: #666; margin: 0; line-height: 1.6;">
                                {descricao_promocao}
                            </p>
                            <p style="color: #333; font-weight: bold; margin: 10px 0 0 0;">
                                De R$ {valor_original} por apenas R$ {valor_promocional}
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://jessicasantos.com/agendamento" 
                               style="background: #D4AF37; color: white; padding: 15px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                AGENDAR AGORA
                            </a>
                        </div>
                        
                        <p style="color: #999; font-size: 14px; text-align: center;">
                            ⏰ Promoção válida até {data_limite}
                        </p>
                    </div>
                    
                    <footer style="background: #f8f8f8; padding: 20px; text-align: center; color: #999;">
                        <p>Jéssica Santos Fotografia | jessica@jessicasantos.com</p>
                        <p><a href="{unsubscribe_url}" style="color: #999;">Descadastrar</a></p>
                    </footer>
                </div>
                """,
                "variables": ["nome", "desconto", "tipo_ensaio", "descricao_promocao", 
                            "valor_original", "valor_promocional", "data_limite", "unsubscribe_url"]
            },
            
            "follow_up_ensaio": {
                "name": "Follow-up Pós-Ensaio",
                "subject": "Como foi seu ensaio, {nome}? 📸",
                "html": """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <header style="background: linear-gradient(135deg, #D4AF37, #F4E4BC); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Obrigada pela Confiança!</h1>
                    </header>
                    
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #333;">Oi, {nome}!</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Espero que tenha amado seu ensaio de {tipo_ensaio}! Foi um prazer imenso 
                            fotografar você e capturar esses momentos especiais.
                        </p>
                        
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="color: #D4AF37; margin: 0 0 10px 0;">📸 Suas fotos estão prontas!</h3>
                            <p style="color: #666; margin: 0; line-height: 1.6;">
                                Suas fotos editadas já estão disponíveis na galeria privada. 
                                Acesse com o link que enviei por WhatsApp.
                            </p>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6;">
                            Gostaria muito de saber sua opinião sobre o ensaio. Sua avaliação 
                            é muito importante para mim!
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://jessicasantos.com/avaliacao" 
                               style="background: #D4AF37; color: white; padding: 15px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                DEIXAR AVALIAÇÃO
                            </a>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6;">
                            Com muito carinho,<br>
                            <strong>Jéssica Santos</strong>
                        </p>
                    </div>
                    
                    <footer style="background: #f8f8f8; padding: 20px; text-align: center; color: #999;">
                        <p>Jéssica Santos Fotografia | jessica@jessicasantos.com</p>
                        <p><a href="{unsubscribe_url}" style="color: #999;">Descadastrar</a></p>
                    </footer>
                </div>
                """,
                "variables": ["nome", "tipo_ensaio", "unsubscribe_url"]
            },
            
            "newsletter_mensal": {
                "name": "Newsletter Mensal",
                "subject": "📸 Newsletter {mes}/{ano} - Novidades e Dicas",
                "html": """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <header style="background: linear-gradient(135deg, #D4AF37, #F4E4BC); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Newsletter {mes}/{ano}</h1>
                        <p style="color: white; margin: 10px 0 0 0;">Jéssica Santos Fotografia</p>
                    </header>
                    
                    <div style="padding: 30px; background: white;">
                        <h2 style="color: #333;">Olá, {nome}!</h2>
                        <p style="color: #666; line-height: 1.6;">
                            Mais um mês se passou e tenho muitas novidades para compartilhar com você!
                        </p>
                        
                        <div style="margin: 30px 0;">
                            <h3 style="color: #D4AF37;">🎯 Destaques do Mês</h3>
                            <ul style="color: #666; line-height: 1.8;">
                                <li>{destaque_1}</li>
                                <li>{destaque_2}</li>
                                <li>{destaque_3}</li>
                            </ul>
                        </div>
                        
                        <div style="margin: 30px 0;">
                            <h3 style="color: #D4AF37;">💡 Dica de Fotografia</h3>
                            <p style="color: #666; line-height: 1.6;">
                                {dica_fotografia}
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://jessicasantos.com/blog" 
                               style="background: #D4AF37; color: white; padding: 15px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                LER MAIS NO BLOG
                            </a>
                        </div>
                    </div>
                    
                    <footer style="background: #f8f8f8; padding: 20px; text-align: center; color: #999;">
                        <p>Jéssica Santos Fotografia | jessica@jessicasantos.com</p>
                        <p><a href="{unsubscribe_url}" style="color: #999;">Descadastrar</a></p>
                    </footer>
                </div>
                """,
                "variables": ["nome", "mes", "ano", "destaque_1", "destaque_2", "destaque_3", 
                            "dica_fotografia", "unsubscribe_url"]
            }
        }
    
    def get_template(self, template_name: str) -> Dict:
        """Retorna um template específico"""
        return self.templates.get(template_name, {})
    
    def render_template(self, template_name: str, variables: Dict) -> Dict:
        """Renderiza um template com as variáveis fornecidas"""
        template = self.get_template(template_name)
        if not template:
            raise ValueError(f"Template '{template_name}' não encontrado")
        
        rendered = template.copy()
        
        # Substituir variáveis no subject e HTML
        rendered["subject"] = template["subject"].format(**variables)
        rendered["html"] = template["html"].format(**variables)
        
        return rendered
    
    def get_available_templates(self) -> List[str]:
        """Retorna lista de templates disponíveis"""
        return list(self.templates.keys())

class EmailAutomationService:
    """Serviço para automações de email"""
    
    def __init__(self):
        self.email_service = EmailService()
        self.template_service = EmailTemplateService()
        
    def trigger_welcome_sequence(self, subscriber_email: str, subscriber_name: str):
        """Dispara sequência de boas-vindas"""
        variables = {
            "nome": subscriber_name,
            "unsubscribe_url": f"https://jessicasantos.com/unsubscribe?email={subscriber_email}"
        }
        
        # Email imediato de boas-vindas
        template = self.template_service.render_template("boas_vindas", variables)
        self.email_service.send_email_smtp(
            subscriber_email, 
            template["subject"], 
            template["html"]
        )
        
        # Agendar emails de follow-up (seria implementado com scheduler)
        # self.schedule_follow_up_emails(subscriber_email, subscriber_name)
    
    def trigger_post_session_follow_up(self, client_email: str, client_name: str, session_type: str):
        """Dispara follow-up pós-ensaio"""
        variables = {
            "nome": client_name,
            "tipo_ensaio": session_type,
            "unsubscribe_url": f"https://jessicasantos.com/unsubscribe?email={client_email}"
        }
        
        template = self.template_service.render_template("follow_up_ensaio", variables)
        self.email_service.send_email_smtp(
            client_email, 
            template["subject"], 
            template["html"]
        )

class EmailAnalyticsService:
    """Serviço para analytics de email"""
    
    def __init__(self):
        self.tracking_data = {}
    
    def track_email_open(self, email_id: str, recipient_email: str):
        """Registra abertura de email"""
        if email_id not in self.tracking_data:
            self.tracking_data[email_id] = {
                "opens": [],
                "clicks": [],
                "sent_count": 0
            }
        
        self.tracking_data[email_id]["opens"].append({
            "email": recipient_email,
            "timestamp": datetime.now().isoformat()
        })
    
    def track_email_click(self, email_id: str, recipient_email: str, url: str):
        """Registra clique em link"""
        if email_id not in self.tracking_data:
            self.tracking_data[email_id] = {
                "opens": [],
                "clicks": [],
                "sent_count": 0
            }
        
        self.tracking_data[email_id]["clicks"].append({
            "email": recipient_email,
            "url": url,
            "timestamp": datetime.now().isoformat()
        })
    
    def get_campaign_stats(self, email_id: str) -> Dict:
        """Retorna estatísticas de uma campanha"""
        data = self.tracking_data.get(email_id, {
            "opens": [],
            "clicks": [],
            "sent_count": 0
        })
        
        unique_opens = len(set([open_data["email"] for open_data in data["opens"]]))
        unique_clicks = len(set([click_data["email"] for click_data in data["clicks"]]))
        
        return {
            "sent_count": data["sent_count"],
            "open_count": len(data["opens"]),
            "unique_opens": unique_opens,
            "click_count": len(data["clicks"]),
            "unique_clicks": unique_clicks,
            "open_rate": (unique_opens / data["sent_count"] * 100) if data["sent_count"] > 0 else 0,
            "click_rate": (unique_clicks / data["sent_count"] * 100) if data["sent_count"] > 0 else 0,
            "click_to_open_rate": (unique_clicks / unique_opens * 100) if unique_opens > 0 else 0
        }

# Instâncias globais dos serviços
email_service = EmailService()
template_service = EmailTemplateService()
automation_service = EmailAutomationService()
analytics_service = EmailAnalyticsService()

