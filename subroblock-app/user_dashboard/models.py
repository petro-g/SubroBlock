from django.contrib.auth.tokens import default_token_generator
from django.db import models, transaction
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, AbstractUser
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.core.files.storage import FileSystemStorage
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

import uuid

from subroblock.settings import RESET_PASSWORD_TOKEN_LIFETIME

User = get_user_model()

fs = FileSystemStorage(location="/media/")


class subroUser(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    customer_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    title = models.CharField(max_length=100, blank=True)
    account_created = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    acceptsAiArbitrationBinding=models.BooleanField(default=False)

    def __str__(self):
        return self.user_id.username
    
    class Meta:
        verbose_name = "Subro User"
        verbose_name_plural = "Subro Users"


@receiver(post_save, sender=User)
def create_subro_user(sender, instance, created, **kwargs):
    if created:
        created_user = subroUser.objects.create(user_id=instance)
        created_user.save()


class ResetPassword(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, unique=True)
    token = models.CharField(default="", max_length=100)
    is_valid = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_expired(self):
        now = timezone.now()
        time_difference = now - self.created_at
        return time_difference >= RESET_PASSWORD_TOKEN_LIFETIME

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = self.__generate_token()
        super().save(*args, **kwargs)

    def __generate_token(self):
        return default_token_generator.make_token(self.user)


class subro_organization(models.Model):
    company = models.CharField(max_length=100, blank=True)
    root_user = models.ForeignKey(User, on_delete=models.CASCADE, default=1)

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('ACTIVE')
        SUSPEND = 'SUSPEND', _('SUSPEND')

    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def get_company_choices():
        return subro_organization.objects.values_list('company', flat=True).distinct()

    def save(self, *args, **kwargs):
        if self.root_user is None and not kwargs.get('root_user', None):
            self.root_user = kwargs['root_user']
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        if self.company == "":
            return "-"
        return f"{self.company}"


@receiver(post_save, sender=subro_organization)
def create_subro_user(sender, instance, created, **kwargs):
    created_wallet, _ = subro_org_wallet.objects.get_or_create(subro_organization_id=instance)
    if _:
        created_wallet.name = f"{instance.company}'s wallet"
        created_wallet.save()


class subro_organization_user(models.Model):
    company = models.ForeignKey(subro_organization, on_delete=models.CASCADE)
    user = models.ForeignKey(subroUser, on_delete=models.CASCADE, related_name='subro_organization_user')
    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if subro_organization_user.objects.filter(user_id=self.user_id).exclude(pk=self.pk).exists():
            raise ValidationError('User is already assigned to another company.')

        # Check if there is more than one org_root under the same subro_organization
        if subro_organization_user.objects.filter(company__company=self.company.company, user__user_id__groups__name='org_root').count() >1:
            raise ValidationError('Only one org_root user is allowed in each subro_organization.')

    def save(self, *args, **kwargs):
        # Ensure clean is called before saving
        self.full_clean()
        super(subro_organization_user, self).save(*args, **kwargs)

    @staticmethod
    def get_company_choices():
        return subro_organization.objects.values_list('company', flat=True).distinct()

    def __str__(self) -> str:
        return f"{self.user} - {self.company.company}"

class subro_organization_key(models.Model):
    subro_organization_user_id = models.ForeignKey(subro_organization_user, on_delete=models.CASCADE)
    key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    date_assigned = models.DateTimeField(auto_now_add=True)
    last_modified = models.DateTimeField(auto_now=True)

    def clean(self):
        # Check if organization root user is being assigned key
        if Group.objects.filter(name='org_root', user=self.subro_organization_user_id.user.user_id).exists():
            raise ValidationError('Organization Root User cannot be assigned a key.')

        if subro_organization_key.objects.filter(subro_organization_user_id__user_id=self.subro_organization_user_id.user_id).exists():
            raise ValidationError('A user cannot be granted more than one key to an organization.')
        
        # Get the count of keys assigned to users in the same company
        keys_count = subro_organization_key.objects.filter(subro_organization_user_id__company=self.subro_organization_user_id.company).count()

        # Check if the count exceeds 3
        if keys_count >= 3:
            raise ValidationError("A company cannot have more than three keys assigned.")

    def save(self, *args, **kwargs):
        # Ensure clean is called before saving
        self.full_clean()
        super(subro_organization_key, self).save(*args, **kwargs)
    
    def __str__(self) -> str:
        return f"{self.subro_organization_user_id.user.user_id.username} - {self.subro_organization_user_id.company}"


class subro_org_wallet(models.Model):
    subro_organization_id = models.OneToOneField(subro_organization, on_delete=models.CASCADE)
    name = models.CharField(default="", max_length=400, blank=True)
    funds = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date_created = models.DateTimeField(auto_now_add=True)
    last_transaction = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subro_organization_id.company}'s Wallet"


class subro_org_wallet_transaction(models.Model):
    origin_wallet = models.ForeignKey(subro_org_wallet, on_delete=models.CASCADE, null=True, default=None,
                                      related_name="origin_wallet")
    destination_wallet = models.ForeignKey(subro_org_wallet, on_delete=models.CASCADE, null=True, default=None,
                                           related_name="destination_wallet")

    class Type(models.TextChoices):
        BUY = 'BUY', _('BUY')
        SELL = 'SELL', _('SELL')
        MINT = 'MINT', _('MINT')
        MOVE = 'MOVE', _('MOVE')

    type = models.CharField(max_length=10, choices=Type.choices, default=Type.BUY)

    class Status(models.TextChoices):
        SIGNED = 'SIGNED', _('SIGNED')
        NOT_SIGNED = 'NOT_SIGNED', _('NOT_SIGNED')
        AP1 = 'AP1', _('AP1')
        AP2 = 'AP2', _('AP2')
        AP3 = 'AP3', _('AP3')
        FAILED = 'FAILED', _('FAILED')

    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SIGNED)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    transaction_date = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def create_transaction(responder_wallet, issuer_wallet, amount, response_status):
        with transaction.atomic():

            responder_wallet.funds -= amount
            responder_wallet.save()

            issuer_wallet.funds += amount
            issuer_wallet.save()

            subro_org_wallet_transaction.objects.create(
                origin_wallet=issuer_wallet,
                destination_wallet=responder_wallet,
                type=subro_org_wallet_transaction.Type.MOVE,
                status=response_status,
                amount=amount,
                description=f"Transaction due to {response_status}"
            )

            subro_org_wallet_transaction.objects.create(
                origin_wallet=responder_wallet,
                destination_wallet=issuer_wallet,
                type=subro_org_wallet_transaction.Type.MOVE,
                status=response_status,
                amount=(-1 * amount),
                description=f"Transaction due to {response_status}"
            )

            return "Transaction successful"

    def __str__(self):
        if self.origin_wallet:
            return f"{self.origin_wallet.subro_organization_id.company} Transaction - {self.transaction_date}"
        if self.destination_wallet:
            return f"{self.destination_wallet.subro_organization_id.company} Transaction - {self.transaction_date}"
        return f"Transaction - {self.transaction_date}"


class subro_vehicle_vin(models.Model):
    subro_organization_id = models.ForeignKey(subro_organization, on_delete=models.CASCADE)
    VehicleVin = models.CharField(max_length=17)
    def __str__(self) -> str:
        return f"{self.VehicleVin} - {self.subro_organization_id}"


class subro_resp_org_vehicle_vin(models.Model):
    vin_id = models.ForeignKey(subro_vehicle_vin, on_delete=models.CASCADE)
    organization_id = models.ForeignKey(subro_organization, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.vin_id.VehicleVin} - {self.vin_id.subro_organization_id}"


class subro_offer_org_vehicle_vin(models.Model):
    vin_id = models.ForeignKey(subro_vehicle_vin, on_delete=models.CASCADE)
    organization_id = models.ForeignKey(subro_organization, on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.vin_id.VehicleVin} - {self.vin_id.subro_organization_id}"


class RequestOfferStatus(models.TextChoices):
    ZERO_TWO_KEYS = '0/2 keys'
    ONE_TWO_KEYS = '1/2 keys'
    SIGNED = 'Signed'
    ARBITRATION = 'Arbitration'
    Arbitration_CA = 'Arbitration CA'
    AI = 'AI'
    AP1 = 'AP1'
    AP2 = 'AP2'
    AP3 = 'AP3'
    CANCELLED = 'Cancelled'


class SubroOfferSignature(models.Model):
    signed_by = models.ForeignKey(subro_organization_user, on_delete=models.CASCADE)
    signed_at = models.DateTimeField(auto_now_add=True)
    offer_request = models.ForeignKey('subro_offer_request', on_delete=models.CASCADE, related_name='signatures', blank=True, null=True)


class subro_offer_request(models.Model):
    requestor = models.ForeignKey(subro_organization_user, on_delete=models.CASCADE)
    responderCompany = models.ForeignKey(subro_organization, on_delete=models.CASCADE)
    submission_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)
    accidentDate = models.DateField()
    cycle_time = models.DurationField(blank=True, null=True)
    offerVehicleVin_id = models.ForeignKey(subro_offer_org_vehicle_vin, on_delete=models.CASCADE)
    respondVehicleVin_id = models.ForeignKey(subro_resp_org_vehicle_vin, on_delete=models.CASCADE)
    offerAmount = models.DecimalField(max_digits=10, decimal_places=2)  
    reservedOfferAmount = models.DecimalField(max_digits=15, decimal_places=2)
    arbitratedAmount = models.DecimalField(max_digits=15, decimal_places=2, null=True, default=None)
    arbitrationBinding = models.BooleanField(default=False)
    aiArbitration = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=RequestOfferStatus.choices, default=RequestOfferStatus.ZERO_TWO_KEYS)

    def __str__(self):
        return f"{self.requestor} - {self.responderCompany}"


class subro_offer_request_file(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=True)
    offer_id = models.ForeignKey(subro_offer_request, on_delete=models.CASCADE)
    filename = models.CharField(max_length=255)
    file_format = models.CharField(max_length=10)
    uploaded_by_organization = models.ForeignKey(subro_organization, on_delete=models.CASCADE, null=True)
    key = models.CharField(max_length=100, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.offer_id} - {self.filename}{self.file_type}"


class Arbitration(models.Model):
    """
        Three strikes on response automatically sends to arbitration
    """
    title = models.CharField(max_length=100)
    arbitor_id = models.ForeignKey(subroUser, on_delete=models.CASCADE)
    subro_offer_request_id = models.ForeignKey(subro_offer_request, on_delete=models.CASCADE)

    def __str__(self):  
        return f"{self.title} - {self.arbitor_id.user_id.username}"


class SubroResponderSignature(models.Model):
    signed_by = models.ForeignKey(subro_organization_user, on_delete=models.CASCADE)
    signed_at = models.DateTimeField(auto_now_add=True)
    offer_responder = models.ForeignKey('subro_offer_responder', related_name='responder_signatures', on_delete=models.CASCADE, blank=True, null=True)


class ResponderOfferStatus(models.TextChoices):
    ZERO_TWO_KEYS = '0/2 keys'
    ONE_TWO_KEYS = '1/2 keys'
    SIGNED = 'Signed'


class subro_offer_responder(models.Model):
    subro_offer_request_id = models.ForeignKey(subro_offer_request, on_delete=models.CASCADE)
    offer_sent_by = models.ForeignKey(subro_organization_user, on_delete=models.CASCADE)
    submission_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)
    offer_amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_accepted = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=ResponderOfferStatus.choices, default=ResponderOfferStatus.ZERO_TWO_KEYS)

    def __str__(self):
        return f"${self.offer_amount} - {self.offer_sent_by}"


class sent_block(models.Model):
    arbitration_id = models.ForeignKey(Arbitration, on_delete=models.CASCADE)
    block_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True) # WIll eventually be the token from Kalido
    transaction_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):  
        return f"{self.arbitration_id.title} - {self.arbitration_id.subro_offer_request_id.requestor.user.user_id.username} - {self.arbitration_id.arbitor_id.user_id.username}"
