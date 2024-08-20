import uuid

from django.contrib.auth.models import User, Group
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

from user_dashboard.models import subro_organization, subro_organization_user, subro_offer_request, \
    subro_offer_responder
from django.utils.translation import gettext_lazy as _

from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
import base64

class SubroCoins(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)
    origin = models.TextField(blank=True, default="")
    destination = models.TextField(blank=True, default="")
    amount = models.DecimalField(max_digits=20,  decimal_places=2, default=0.0)
    organization = models.ForeignKey(subro_organization, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.origin + " - " + self.destination

    class Meta:
        verbose_name = "Subro Coins"
        verbose_name_plural = "Subro Coins"


class ActionsLogs(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, default=None)

    class LogType(models.TextChoices):
        CREATE = 'CREATE', _('CREATE')
        UPDATE = 'UPDATE', _('UPDATE')
        SIGN = 'SIGN', _('SIGN')
        ARCHIVE = 'ARCHIVE', _('ARCHIVE')
        DELETE = 'DELETE', _('DELETE')

    log_type = models.CharField(
        max_length=20, choices=LogType.choices, default=LogType.CREATE)

    class EntityType(models.TextChoices):
        ORGANIZATION = 'ORGANIZATION', _('ORGANIZATION')
        OFFER = 'OFFER', _('OFFER')
        RESPONSE = 'RESPONSE', _('RESPONSE')

    entity_type = models.CharField(
        max_length=20, choices=EntityType.choices, default=EntityType.ORGANIZATION)
    field_name = models.CharField(max_length=100, blank=True, default="")
    organization = models.ForeignKey(subro_organization, on_delete=models.CASCADE, null=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.log_type.lower() + self.entity_type.title()

    @staticmethod
    def create_record(*ars, **kwargs):
        ActionsLogs.objects.create(**kwargs)


@receiver(post_save, sender=subro_offer_request)
def create_action_log(sender, instance, created, **kwargs):
    if created:
        ActionsLogs.create_record(
            user=instance.requestor.user.user_id,
            log_type=ActionsLogs.LogType.CREATE,
            entity_type=ActionsLogs.EntityType.OFFER,
            organization=instance.responderCompany
        )
        return

    log_type = ActionsLogs.LogType.UPDATE
    if instance.status == "Signed":
        log_type = ActionsLogs.LogType.SIGN

    if instance.status == "Cancelled":
        log_type = ActionsLogs.LogType.ARCHIVE

    ActionsLogs.create_record(
        user=instance.requestor.user.user_id,
        log_type=log_type,
        entity_type=ActionsLogs.EntityType.OFFER,
        organization=instance.responderCompany
    )


@receiver(post_save, sender=subro_offer_responder)
def create_action_log(sender, instance, created, **kwargs):
    if created:
        ActionsLogs.create_record(
            user=instance.offer_sent_by.user.user_id,
            log_type=ActionsLogs.LogType.CREATE,
            entity_type=ActionsLogs.EntityType.RESPONSE,
            organization=instance.subro_offer_request_id.responderCompany
        )
        return

    log_type = ActionsLogs.LogType.UPDATE
    if instance.is_accepted:
        log_type = ActionsLogs.LogType.SIGN

    ActionsLogs.create_record(
        user=instance.offer_sent_by.user.user_id,
        log_type=log_type,
        entity_type=ActionsLogs.EntityType.RESPONSE,
        organization=instance.subro_offer_request_id.responderCompany
    )


class KeyModel(models.Model):
    key_name = models.CharField(max_length=100, null=True, blank=True)
    public_key = models.TextField()
    private_key = models.TextField()
    encrypted_aes_key = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

    def generate_keys(self):
        # Generate RSA keys
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )
        public_key = private_key.public_key()

        # Serialize keys
        self.private_key = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.BestAvailableEncryption(b'my_secret_password')
        ).decode('utf-8')

        self.public_key = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')

        # Generate AES key
        aes_key = os.urandom(32)  # 256-bit AES key

        # Encrypt AES key with RSA public key
        encrypted_aes_key = public_key.encrypt(
            aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )

        self.encrypted_aes_key = base64.b64encode(encrypted_aes_key).decode('utf-8')

    def decrypt_aes_key(self):
        # Deserialize private key
        private_key = serialization.load_pem_private_key(
            self.private_key.encode('utf-8'),
            password=b'my_secret_password',
            backend=default_backend()
        )

        # Decrypt AES key
        encrypted_aes_key = base64.b64decode(self.encrypted_aes_key)
        aes_key = private_key.decrypt(
            encrypted_aes_key,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )

        return aes_key


class AdminKey(KeyModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_key')

    def __str__(self):
        return self.user.username + " - " + self.key_name


class SubroKey(KeyModel):
    owner = models.ForeignKey(subro_organization, on_delete=models.CASCADE, related_name='owned_keys')
    assigned_user = models.OneToOneField(subro_organization_user, on_delete=models.CASCADE, related_name='assigned_key', null=True, blank=True)
