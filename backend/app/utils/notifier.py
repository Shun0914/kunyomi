import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import time
from dotenv import load_dotenv

# プロジェクトのルートにある .env を探して読み込む
# Azure環境では .env が存在しないため、この行は実質スキップされ、
# Azure側の「構成設定」が os.getenv で取得されるようになります。
load_dotenv()

def send_notification_email(to_email: str, subject: str, body: str):
    # Azureの「構成設定」または .env から取得
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        print(f"通知スキップ（設定不足）: To={to_email}")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        print(f"メール送信成功: To={to_email}")
    except Exception as e:
        # バックグラウンド実行のため、ここでエラーをキャッチしてログに残す
        print(f"メール送信エラー: {str(e)}")