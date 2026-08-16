from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_shop_welcome_email(shop_name: str, owner_name: str, email: str, password: str) -> bool:
    """
    Sends a styled HTML card email with account credentials and step-by-step instructions
    to the shop owner's business email.
    """
    if not email:
        return False

    subject = f"Welcome to D4D Hub – Credentials for {shop_name}"
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'arjun@nexcrestit.com')
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to D4D Hub</title>
      <style>
        body {{ font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #e8e2f7; margin: 0; padding: 40px 10px; }}
        .card-container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 15px 35px rgba(123, 97, 255, 0.12); }}
        .card-header {{ background: linear-gradient(135deg, #7B61FF 0%, #8B5CF6 100%); padding: 36px 30px; text-align: center; color: #ffffff; }}
        .card-header h1 {{ margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }}
        .card-header p {{ margin: 6px 0 0; font-size: 13px; opacity: 0.9; font-weight: 500; }}
        .card-body {{ padding: 32px 30px; color: #1a1a1a; }}
        .greeting {{ font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1a1a1a; }}
        .intro-text {{ font-size: 14px; color: #555555; line-height: 1.6; margin-bottom: 24px; }}
        .credentials-box {{ background: #f8f6fe; border: 1px solid #e0d7fb; border-radius: 16px; padding: 20px; margin-bottom: 28px; }}
        .cred-item {{ margin-bottom: 12px; font-size: 13px; font-weight: 600; color: #444444; }}
        .cred-item:last-child {{ margin-bottom: 0; }}
        .cred-label {{ color: #8a8a8a; text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }}
        .password-badge {{ font-family: monospace; font-size: 16px; font-weight: bold; color: #7B61FF; background: #ffffff; border: 1px solid #e0d7fb; padding: 6px 12px; border-radius: 8px; display: inline-block; margin-top: 2px; }}
        .instructions {{ margin-bottom: 28px; }}
        .instructions h3 {{ font-size: 14px; font-weight: 700; color: #1a1a1a; margin-bottom: 10px; }}
        .instructions ol {{ margin: 0; padding-left: 20px; font-size: 13px; color: #555555; line-height: 1.7; }}
        .btn-wrapper {{ text-align: center; margin: 32px 0 16px; }}
        .cta-btn {{ background-color: #7B61FF; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 8px 20px rgba(123, 97, 255, 0.25); }}
        .card-footer {{ background-color: #faf9fe; border-top: 1px solid #f0ebfd; padding: 18px 30px; text-align: center; font-size: 11px; color: #8a8a8a; }}
      </style>
    </head>
    <body>
      <div class="card-container">
        <div class="card-header">
          <h1>D4D Retail Discovery</h1>
          <p>Partner Registration & Access Credentials</p>
        </div>
        <div class="card-body">
          <div class="greeting">Welcome aboard, {owner_name or 'Partner'}!</div>
          <div class="intro-text">
            Thank you for registering <strong>{shop_name}</strong> on the D4D Retail Discovery Platform. A partner account has been configured for your business.
          </div>
          
          <div class="credentials-box">
            <div class="cred-item">
              <span class="cred-label">Login Account Email</span>
              <span style="color: #1a1a1a;">{email}</span>
            </div>
            <div class="cred-item" style="margin-top: 14px;">
              <span class="cred-label">Generated Account Password</span>
              <span class="password-badge">{password}</span>
            </div>
          </div>
          
          <div class="instructions">
            <h3>Quick Next Steps:</h3>
            <ol>
              <li>Log in using your email and generated password at the partner portal.</li>
              <li>Complete your store profile and upload high-resolution store logos.</li>
              <li>Add your physical branch outlets, coordinates, and operating hours.</li>
              <li>Publish interactive promotional flyers to reach shoppers across your city.</li>
            </ol>
          </div>
          
          <div class="btn-wrapper">
            <a href="http://localhost:3000/login" class="cta-btn">Log In to Your Dashboard</a>
          </div>
        </div>
        <div class="card-footer">
          &copy; 2026 D4D Retail Discovery Platform. All rights reserved.<br>
          If you did not request this registration, please disregard this email.
        </div>
      </div>
    </body>
    </html>
    """

    text_content = strip_tags(html_content)

    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, [email])
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        logger.info(f"Welcome email with generated credentials sent to {email} for shop {shop_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        return False
