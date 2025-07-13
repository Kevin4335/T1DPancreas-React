import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.message import EmailMessage
import base64
import smtplib
from config import CONFIG_EMAIL_PASSWORD
from config import CONFIG_EMAIL_USERNAME


EMAIL_NAME = CONFIG_EMAIL_USERNAME 
EMAIL_PASSWORD = CONFIG_EMAIL_PASSWORD


def send_email(receiver: str, subject: str, content: str):
    message = MIMEMultipart()
    message["From"] = EMAIL_NAME
    message["To"] = receiver
    message["Subject"] = subject
    message.attach(MIMEText(content, "plain"))
    server = smtplib.SMTP("smtp.zoho.com", 587)
    server.starttls()
    server.login(EMAIL_NAME, EMAIL_PASSWORD)
    server.sendmail(EMAIL_NAME, receiver, message.as_string())
    server.quit()
  
def send_email_with_attachment(receiver: str, subject: str, content: str, image_b64: str):
    import base64
    from email.mime.base import MIMEBase
    from email import encoders

    message = MIMEMultipart()
    message["From"] = EMAIL_NAME
    message["To"] = receiver
    message["Subject"] = subject
    message.attach(MIMEText(content, "plain"))

    # Strip off the "data:image/png;base64," prefix if present
    if image_b64.startswith("data:image"):
        image_b64 = image_b64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(image_b64)
    except Exception as e:
        print("Base64 decode failed:", e)
        raise

    part = MIMEBase("application", "octet-stream")
    part.set_payload(image_bytes)
    encoders.encode_base64(part)
    part.add_header("Content-Disposition", f"attachment; filename=image.png")
    message.attach(part)

    server = smtplib.SMTP("smtp.zoho.com", 587)
    server.starttls()
    server.login(EMAIL_NAME, EMAIL_PASSWORD)
    server.sendmail(EMAIL_NAME, receiver, message.as_string())
    server.quit()



if __name__ == '__main__':
    send_email('1246jtc@gmail.com', 'Test', 'This is a test email')
