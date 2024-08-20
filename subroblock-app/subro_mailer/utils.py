from django.core.mail import send_mail, send_mass_mail
from enum import Enum
from django.template.loader import render_to_string
from django.conf import settings


class EmailTemplate(Enum):
    PASSWORD_RESET = "password_reset.html"


def send_single_mail(subject: str, template, recipient_emails, ctx: dict):
    message = render_to_string(template, ctx)
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        recipient_emails,
        fail_silently=False,
        html_message=message,
    )
