from django.core.management.base import BaseCommand
from rest_framework_simplejwt.tokens import OutstandingToken
from datetime import datetime


class Command(BaseCommand):
    help = 'Remove expired JWTs'

    def handle(self, *args, **kwargs):
        now = datetime.utcnow()
        expired_tokens = OutstandingToken.objects.filter(expires_at__lt=now)
        expired_tokens.delete()
        self.stdout.write(self.style.SUCCESS(f'Removed {len(expired_tokens)} expired tokens'))
