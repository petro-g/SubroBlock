from typing import Union

from django.contrib.auth.models import Group, User
from rest_framework import serializers, status
from django.db import transaction
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.db.models import Q

from arbitrator_dashboard.models import ArbitratorUserActionsLogs
from subro_admin.models import SubroCoins, ActionsLogs, SubroKey, AdminKey
from subro_admin.permissions import UserPermissions
from subro_admin.utils import parse_int
from subroblock.exceptions import APIExceptions
from user_dashboard.models import subro_organization, subro_offer_request, User, subro_organization_user, subroUser, \
    subro_organization_key, subro_offer_responder, subro_org_wallet, subro_org_wallet_transaction, RequestOfferStatus


class OrganizationSerializer(serializers.Serializer):
    organizationName = serializers.CharField(allow_null=False, allow_blank=False, required=True)
    rootUserEmail = serializers.EmailField(allow_null=False, allow_blank=False, required=True)
    rootUserPassword = serializers.CharField(allow_null=False, allow_blank=False, required=True)

    def save(self, **kwargs):
        group, _ = Group.objects.get_or_create(name="org_root")
        if User.objects.filter(email=self.validated_data['rootUserEmail']).exists():
            raise APIExceptions(f"User with this email already exists", status_code=status.HTTP_409_CONFLICT)

        user = User.objects.create(
            email=self.validated_data['rootUserEmail'],
            username=self.validated_data['rootUserEmail']
        )
        user.set_password(self.validated_data['rootUserPassword'])
        user.groups.add(group)
        user.save()

        instance = subro_organization(
            company=self.validated_data['organizationName'],
            root_user=user
        )
        instance.save()
        return {
            "organizationId": str(instance.id),
            "organizationName": instance.company,
            "rootUserEmail": user.email
        }

    def get_organization(self, pk):
        queryset = subro_organization.objects.filter(id=int(pk))
        if not queryset.exists():
            raise APIExceptions(f"The specified organization does not exist.", status_code=status.HTTP_404_NOT_FOUND)
        return queryset.first()


class GetOrganizationSerializer(serializers.ModelSerializer):
    rootUserEmail = serializers.SerializerMethodField()
    subroCoins = serializers.SerializerMethodField()
    subroOffers = serializers.SerializerMethodField()
    users = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    @staticmethod
    def get_status(obj):
        return "ACTIVE" if obj.status == subro_organization.Status.ACTIVE else "SUSPENDED"

    @staticmethod
    def get_rootUserEmail(obj):
        return obj.root_user.email

    @staticmethod
    def get_subroCoins(obj):
        return SubroCoins.objects.filter(organization=obj).count()

    @staticmethod
    def get_subroOffers(obj):
        return subro_offer_request.objects.filter(responderCompany=obj).count()

    @staticmethod
    def get_users(obj):
        queryset = subro_organization_user.objects.filter(company=obj)
        recent_users = [f"{instance.user.user_id.first_name} {instance.user.user_id.last_name}" for instance in
                        queryset.order_by('-created_at')[:2]]
        return recent_users, queryset.count()

    class Meta:
        model = subro_organization
        fields = ["id", 'company', 'status', 'rootUserEmail', 'subroCoins', 'subroOffers', 'users']


class SingleOrganizationSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company')
    root_user_email = serializers.SerializerMethodField()
    subro_coins_balance = serializers.SerializerMethodField()
    subro_offers_count = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    @staticmethod
    def get_status(obj):
        return "ACTIVE" if obj.status == subro_organization.Status.ACTIVE else "SUSPENDED"

    @staticmethod
    def get_root_user_email(obj):
        return obj.root_user.email

    @staticmethod
    def get_subro_coins_balance(obj):
        return SubroCoins.objects.filter(organization=obj).count()

    @staticmethod
    def get_subro_offers_count(obj):
        return subro_offer_request.objects.filter(responderCompany=obj).count()

    class Meta:
        model = subro_organization
        fields = ["id", 'company_name', 'status', 'root_user_email', 'subro_coins_balance', 'subro_offers_count',
                  'created_at', 'updated_at']


class OrgUpdatePasswordSerializer(serializers.Serializer):
    organizationId = serializers.CharField(allow_null=False, allow_blank=False, required=True)
    newPassword = serializers.CharField(allow_null=False, allow_blank=False, required=True)

    def check_permissions(self):
        user = self.context.user
        groups_queryset = user.groups.filter(name="admin")
        if not groups_queryset.exists():
            raise APIExceptions("You dont have appropriate permission to use this API. Contact Administrator.",
                                status_code=status.HTTP_400_BAD_REQUEST)

    def update_password(self, **kwargs):
        org_id = parse_int(self.validated_data['organizationId'], "organizationId")
        queryset = subro_organization.objects.filter(id=org_id)
        if not queryset.exists():
            raise APIExceptions("Organization does not exists.", status_code=status.HTTP_404_NOT_FOUND)
        organization = queryset.first()
        organization.root_user.set_password(self.validated_data['newPassword'])
        organization.root_user.save()
        ActionsLogs.create_record(user=self.context.user, log_type="UPDATE", field_name="ROOT_USER_PASSWORD",
                              organization=organization)


class SubroUserCreateSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)
    organizationId = serializers.IntegerField(write_only=True)
    user_id = serializers.IntegerField(read_only=True)
    company_id = serializers.IntegerField(read_only=True)
    firstName = serializers.CharField(write_only=True, allow_null=False,allow_blank=False, required=False,
                                      source="first_name")
    lastName = serializers.CharField(write_only=True, allow_null=False, allow_blank=False, required=False,
                                     source="last_name")

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.filter(username=validated_data['email'])
        if user.exists():
            raise ValueError("User with this email already exists")

        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        if validated_data.get('first_name'):
            user.first_name = validated_data.get('first_name')
        if validated_data.get('last_name'):
            user.first_name = validated_data.get('last_name')
        user.save()
        subro_user, created = subroUser.objects.get_or_create(user_id=user)
        organization_id = validated_data.get('organizationId')
        organization = subro_organization.objects.get(pk=organization_id)
        subro_org_user = subro_organization_user.objects.create(
            user=subro_user,
            company=organization
        )
        group, _ = Group.objects.get_or_create(name="org_user")
        user.groups.add(group)
        return subro_org_user


class SubroOrganizationKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = subro_organization_key
        fields = ['subro_organization_user_id', 'key']

    @classmethod
    def has_key_assigned(cls, subro_org_user):
        if not subro_org_user.exists():
            return False
        return subro_organization_key.objects.filter(subro_organization_user_id=subro_org_user.first()).exists()


class SubroUserSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source='user_id.id')
    status = serializers.SerializerMethodField()
    firstName = serializers.CharField(source='user_id.first_name')
    lastName = serializers.CharField(source='user_id.last_name')
    email = serializers.EmailField(source='user_id.email')
    hasKeyAssigned = serializers.SerializerMethodField()
    organization = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='account_created')
    loggedAt = serializers.DateTimeField(source='user_id.last_login')

    class Meta:
        model = subroUser
        fields = ['userId', 'firstName', 'lastName', 'email', 'status', 'hasKeyAssigned', 'organization', 'createdAt',
                  'loggedAt']

    def get_organization(self, obj):
        subro_org_user_qs = obj.subro_organization_user
        if subro_org_user_qs.exists():
            org = subro_org_user_qs.first().company
            return {
                'organizationId': org.id,
                'name': org.company,
                'rootUserEmail': org.root_user.email,
            }
        return None

    @staticmethod
    def get_status(obj):
        return "ACTIVE" if obj.user_id.is_active else "SUSPENDED"

    @staticmethod
    def get_hasKeyAssigned(obj):
        return SubroOrganizationKeySerializer.has_key_assigned(obj.subro_organization_user)


class SuspendOrganizationSerializer(serializers.Serializer):
    status = serializers.CharField(allow_null=False, allow_blank=False, required=True)

    def validate(self, attrs):
        input_status = attrs.get('status')

        if input_status not in ['SUSPENDED', 'ACTIVE']:
            raise serializers.ValidationError("Input status value should be ACTIVE or SUSPENDED. ")
        attrs = super().validate(attrs)

        return attrs

    def verify_organization(self, pk):
        queryset = subro_organization.objects.filter(id=int(pk))
        if not queryset.exists():
            raise APIExceptions(f"The specified organization does not exist.", status_code=status.HTTP_404_NOT_FOUND)
        return queryset.first()

    def update_status(self, org: subro_organization):
        if self.validated_data['status'] == "SUSPENDED":
            org.status = subro_organization.Status.SUSPEND
            org.save()
            OutstandingToken.objects.filter(user_id=org.root_user.id).delete()
            user_ids = subro_organization_user.objects.filter(company=org).values_list('user__user_id', flat=True)
            tokens = OutstandingToken.objects.filter(user_id__in=user_ids)
            blacklisted_tokens = [BlacklistedToken(token=token) for token in tokens]
            BlacklistedToken.objects.bulk_create(blacklisted_tokens)
            tokens.delete()
        if self.validated_data['status'] == "ACTIVE":
            org.status = subro_organization.Status.ACTIVE
            org.save()


class UpdateOrganizationSerializer(serializers.Serializer):

    def check_permissions(self, user):
        groups_queryset = user.groups.filter(name="admin")
        if not groups_queryset.exists():
            raise APIExceptions("You dont have appropriate permission to use this API. Contact Administrator.",
                                status_code=status.HTTP_400_BAD_REQUEST)

    def get_organization_instance(self):
        org_id = self.context.get('pk', "")
        if len(org_id) == 0:
            raise APIExceptions("Invalid input", status_code=status.HTTP_400_BAD_REQUEST)
        queryset = subro_organization.objects.filter(id=int(org_id))
        if not queryset.exists():
            raise APIExceptions(f"The specified organization does not exist.", status_code=status.HTTP_404_NOT_FOUND)
        return queryset.first()

    def perform_update(self, instance):
        for key, value in self.initial_data.items():
            if key == "organizationName":
                instance.company = value
            elif key == "rootUserEmail":
                instance.root_user.email = value
                instance.root_user.save()
            elif key == "rootUserPassword":
                instance.root_user.set_password(value)
                instance.root_user.save()
            instance.save()


class OrganizationUserSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source='user.user_id.id')
    name = serializers.SerializerMethodField()
    email = serializers.CharField(source='user.user_id.email')
    hasKeyAssigned = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='user.account_created')
    loggedAt = serializers.DateTimeField(source='user.user_id.last_login')

    class Meta:
        model = subro_organization_user
        fields = [
            'userId',
            'name',
            'email',
            'hasKeyAssigned',
            'status',
            'createdAt',
            'loggedAt'
        ]

    def get_name(self, obj):
        return obj.user.user_id.first_name + " " + obj.user.user_id.last_name

    def get_hasKeyAssigned(self, obj):
        return obj.has_key_assigned

    def get_status(self, obj):
        return "ACTIVE" if obj.user.user_id.is_active else "SUSPENDED"


class OfferAdminSerializer(serializers.ModelSerializer):
    responderCompany = serializers.SerializerMethodField()
    responderCompanyId = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    offerVehicleVin = serializers.SerializerMethodField()
    offerVehicleVinId = serializers.SerializerMethodField()
    responderVehicleVin = serializers.SerializerMethodField()
    responderVehicleVinId = serializers.SerializerMethodField()
    issuerCompany = serializers.SerializerMethodField()
    issuerCompanyId = serializers.SerializerMethodField()
    accidentDate = serializers.DateField()
    cycleTime = serializers.SerializerMethodField()
    cycleTimeDurDecimal = serializers.SerializerMethodField()
    numberOfKeysSigned = serializers.SerializerMethodField()
    dateOfOffer = serializers.SerializerMethodField()
    modifiedDate = serializers.SerializerMethodField()
    failedResponses = serializers.SerializerMethodField(required=False)
    responseAmount = serializers.SerializerMethodField()
    priorResponseAmount = serializers.SerializerMethodField()
    arbitrationMethod = serializers.SerializerMethodField()



    class Meta:
        model = subro_offer_request
        exclude = ['reservedOfferAmount', 'submission_date', 'modified_date', 'offerVehicleVin_id', 'respondVehicleVin_id', 'cycle_time']

    def get_priorResponseAmount(self, obj):
        responses = obj.subro_offer_responder_set.all()
        if not responses.exists() or len(responses) == 1:
            return None
        if len(responses) == 2:
            return responses.first().offer_amount
        return responses[len(responses) - 2].offer_amount

    def get_responderVehicleVinId(self, obj):
        return obj.respondVehicleVin_id.id

    def get_responderCompanyId(self, obj):
        return obj.responderCompany.id

    def get_arbitrationMethod(self, obj):
        if obj.aiArbitration:
            return "AI"
        return "Manual"

    def get_responseAmount(self, obj):
        responses = obj.subro_offer_responder_set.all()
        if responses.exists():
            return responses.last().offer_amount
        return None

    def get_issuerCompany(self, obj):
        return obj.requestor.company.company

    def get_failedResponses(self, obj):
        return obj.subro_offer_responder_set.filter(is_accepted=False).count()

    def get_issuerCompanyId(self, obj):
        return obj.requestor.company.id

    def get_dateOfOffer(self, obj):
        return obj.submission_date

    def get_modifiedDate(self, obj):
        return obj.modified_date

    def get_offerVehicleVinId(self, obj):
        return obj.offerVehicleVin_id.id

    def get_respondVehicleVinId(self, obj):
        return obj.respondVehicleVin_id.id

    def get_cycleTime(self, obj):
        if not obj.cycle_time:
            return None
        return f"{obj.cycle_time.days} days {obj.cycle_time.seconds // 3600} hours {obj.cycle_time.seconds % 3600 // 60} minutes"

    def get_cycleTimeDurDecimal(self, obj) -> float:
        if not obj.cycle_time:
            return None
        return obj.cycle_time.total_seconds()

    def get_numberOfKeysSigned(self, obj):
        return 2

    def get_offerVehicleVin(self, obj):
        return obj.offerVehicleVin_id.vin_id.VehicleVin

    def get_responderVehicleVin(self, obj):
        return obj.respondVehicleVin_id.vin_id.VehicleVin

    def get_responderCompany(self, obj):
        return obj.responderCompany.company

    def get_status(self, obj):
        return obj.status


class CreateOrgUserSerializer(serializers.Serializer):
    email = serializers.EmailField(allow_null=False, allow_blank=False, required=True)
    password = serializers.CharField(allow_null=False, allow_blank=False, required=True)
    firstName = serializers.CharField(allow_null=False,allow_blank=False, required=False, source="first_name")
    lastName = serializers.CharField(allow_null=False, allow_blank=False, required=False, source="last_name")

    def create_user(self, root_user):
        org = subro_organization.objects.filter(root_user=root_user)
        if not org.exists():
            raise APIExceptions("You dont have appropriate permission to use this API. Contact Administrator.",
                                status_code=status.HTTP_400_BAD_REQUEST)

        self.validated_data['username'] = self.validated_data['email']
        if User.objects.filter(email=self.validated_data['email']).exists():
            raise APIExceptions("User with this email already exists.", status_code=status.HTTP_409_CONFLICT)
        user, is_created = User.objects.get_or_create(**self.validated_data)
        group, _ = Group.objects.get_or_create(name="org_user")
        user.groups.add(group)
        user.set_password(self.validated_data['password'])
        user.save()
        subro_organization_user.objects.create(company=org.first(),
                                               user=subroUser.objects.filter(user_id=user).first())


class UpdateOrgUserSerializer(serializers.Serializer):
    email = serializers.EmailField(allow_null=False, allow_blank=False, required=False)
    password = serializers.CharField(allow_null=False, allow_blank=False, required=False)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email and not password:
            raise serializers.ValidationError("Email or password is required.")

        # Run default validation for password field
        attrs = super().validate(attrs)

        return attrs

    def perform_update(self, root_user, user_id):
        org = subro_organization.objects.filter(root_user=root_user)
        if not org.exists():
            raise APIExceptions("You dont have appropriate permission to use this API. Contact Administrator.",
                                status_code=status.HTTP_400_BAD_REQUEST)

        org_user = subro_organization_user.objects.filter(company=org.first(), user__user_id_id=user_id)
        if not org_user.exists():
            raise APIExceptions("User doesnt belong to this organization.", status_code=status.HTTP_406_NOT_ACCEPTABLE)

        org_user = org_user.first()
        if self.validated_data.get('email', None):
            org_user.user.user_id.email = self.validated_data['email']
            org_user.user.user_id.username = self.validated_data['email']
        if self.validated_data.get('password', None):
            org_user.user.user_id.set_password(self.validated_data['password'])
        org_user.user.user_id.save()


class GetBusinessUserSerialize(serializers.ModelSerializer):
    userId = serializers.IntegerField(source='user_id.id')
    firstName = serializers.CharField(source='user_id.first_name')
    lastName = serializers.CharField(source='user_id.last_name')
    email = serializers.CharField(source='user_id.email')
    createdAt = serializers.DateTimeField(source='account_created')
    loggedAt = serializers.DateTimeField(source='user_id.last_login')
    status = serializers.SerializerMethodField()
    hasKeyAssigned = serializers.SerializerMethodField()
    keyCreatedAt = serializers.SerializerMethodField()

    def get_hasKeyAssigned(self, obj):
        org_user = subro_organization_user.objects.filter(user=obj).first()
        return SubroKey.objects.filter(assigned_user=org_user).exists()

    def get_status(self, obj):
        return "ACTIVE" if obj.user_id.is_active else "SUSPENDED"

    def get_keyCreatedAt(self, obj):
        org_user = subro_organization_user.objects.filter(user=obj).first()
        key = SubroKey.objects.filter(assigned_user=org_user)
        if not key.exists():
            return None
        return key.first().date_created


    class Meta:
        model = subroUser
        fields = [
            'userId', 'firstName', 'lastName', 'email', 'hasKeyAssigned', 'status', 'createdAt', 'loggedAt',
            'hasKeyAssigned', 'keyCreatedAt'
        ]


class GetOrgSerialize(serializers.ModelSerializer):
    organizationId = serializers.IntegerField(source='id')
    name = serializers.CharField(source='company')
    rootUserEmail = serializers.CharField(source='root_user.email')

    class Meta:
        model = subro_organization
        fields = [
            'organizationId', 'name', 'rootUserEmail'
        ]


class SuspendOrgUserSerializer(serializers.Serializer):
    status = serializers.CharField(allow_null=False, allow_blank=False, required=True)

    def validate(self, attrs):
        input_status = attrs.get('status')

        if input_status not in ['SUSPENDED', 'ACTIVE']:
            raise serializers.ValidationError("Input status value should be ACTIVE or SUSPENDED.")
        attrs = super().validate(attrs)

        return attrs

    def check_permissions(self):
        user = self.context
        org = subro_organization.objects.filter(root_user=user)
        if not org.exists():
            raise APIExceptions("You dont have appropriate permission to use this API. Contact Administrator.",
                                status_code=status.HTTP_400_BAD_REQUEST)

    def suspend_user(self, user_id):
        instance = subro_organization.objects.filter(root_user=self.context).first()
        org_user = subro_organization_user.objects.filter(company=instance, user__user_id_id=user_id)
        if not org_user.exists():
            raise APIExceptions("User doesnt belong to this organization.", status_code=status.HTTP_406_NOT_ACCEPTABLE)

        org_user = org_user.first()
        if self.validated_data['status'] == "SUSPENDED":
            org_user.user.user_id.is_active = False
        if self.validated_data['status'] == "ACTIVE":
            org_user.user.user_id.is_active = True
        org_user.user.user_id.save()
        return org_user.user.user_id


class WalletSerializer(serializers.Serializer):
    amount = serializers.FloatField(allow_null=False, required=True)

    def check_permissions(self):
        user = self.context
        org = subro_organization.objects.filter(root_user=user)
        if not org.exists():
            raise APIExceptions("You dont have appropriate permission to use this API. Contact Administrator.",
                                status_code=status.HTTP_400_BAD_REQUEST)
        return org.first()

    def get_balance(self, org):
        instance = subro_org_wallet.objects.filter(subro_organization_id=org).first()
        if not instance:
            return 0
        return instance.funds

    def get_pending_sent_offers(self, org):
        queryset = subro_offer_request.objects.filter(requestor__company=org)
        queryset = queryset.exclude(
            Q(status__in=[RequestOfferStatus.AP1, RequestOfferStatus.AP2, RequestOfferStatus.AP3]) |
            Q(status=RequestOfferStatus.CANCELLED)
        )
        return queryset.count()

    def get_pending_received_offers(self, org):
        queryset = subro_offer_request.objects.filter(responderCompany=org)
        queryset = queryset.exclude(
            Q(status__in=[RequestOfferStatus.AP1, RequestOfferStatus.AP2, RequestOfferStatus.AP3]) |
            Q(status=RequestOfferStatus.CANCELLED)
        )
        return queryset.count()

    def buy(self, org):
        if self.validated_data['amount'] <= 0:
            raise APIExceptions("Input amount should be positive number and not zero for buy.",
                                status_code=status.HTTP_400_BAD_REQUEST)

        instance, _ = subro_org_wallet.objects.get_or_create(subro_organization_id=org)

        wallet_transaction = subro_org_wallet_transaction(
            origin_wallet=instance,
            amount=self.validated_data['amount'],
            type=subro_org_wallet_transaction.Type.BUY,
            description=f"Funds added."
        )
        instance.funds = float(instance.funds) + self.validated_data['amount']
        instance.save()
        wallet_transaction.save()
        return instance.funds, self.validated_data['amount']

    def sell(self, org):
        if self.validated_data['amount'] <= 0:
            raise APIExceptions("Input amount should be positive number and not zero for sell.",
                                status_code=status.HTTP_400_BAD_REQUEST)

        instance, _ = subro_org_wallet.objects.get_or_create(subro_organization_id=org)

        if instance.funds < self.validated_data['amount']:
            raise APIExceptions("Available funds are lesser than input amount.",
                                status_code=status.HTTP_400_BAD_REQUEST)

        wallet_transaction = subro_org_wallet_transaction(
            origin_wallet=instance,
            amount=(-1 * self.validated_data['amount']),
            type=subro_org_wallet_transaction.Type.SELL,
            description=f"Funds sold."
        )
        instance.funds = float(instance.funds) - self.validated_data['amount']
        instance.save()
        wallet_transaction.save()
        return instance.funds, self.validated_data['amount']


class OrgTransactionSerializer(serializers.ModelSerializer):
    transactionId = serializers.IntegerField(source='id')
    type = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='transaction_date')

    def get_type(self, obj):
        if obj.status in [subro_org_wallet_transaction.Status.AP1,
                          subro_org_wallet_transaction.Status.AP2,
                          subro_org_wallet_transaction.Status.AP3]:
            return obj.status
        return obj.type

    def get_status(self, obj):
        if obj.status in [subro_org_wallet_transaction.Status.AP1,
                          subro_org_wallet_transaction.Status.AP2,
                          subro_org_wallet_transaction.Status.AP3] or \
                obj.type in [subro_org_wallet_transaction.Type.BUY,
                             subro_org_wallet_transaction.Type.SELL,
                             subro_org_wallet_transaction.Type.MINT,
                             subro_org_wallet_transaction.Type.MOVE,
                             ]:
            return 'SUCCESS'
        if obj.status == subro_org_wallet_transaction.Status.FAILED:
            return 'FAILED'
        return 'PENDING'

    class Meta:
        model = subro_org_wallet_transaction
        fields = ["transactionId", 'type', 'status', 'date', 'amount']


class OrgUserTransactionSerializer(serializers.ModelSerializer):
    actionId = serializers.CharField(source='id')
    type = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='created_at')

    def get_type(self, obj):
        return f"{obj.log_type.lower()}{obj.entity_type.title()}"

    class Meta:
        model = ActionsLogs
        fields = ["actionId", 'type', 'date']


class AdminOrgTransactionSerializer(serializers.ModelSerializer):
    actionId = serializers.CharField(source='id')
    type = serializers.SerializerMethodField()
    date = serializers.DateTimeField(source='created_at')

    def get_type(self, obj):
        return f"{obj.log_type.lower()}{obj.entity_type.title()}"

    class Meta:
        model = ActionsLogs
        fields = ["actionId", 'type', 'date']


class SearchWalletSerializer(serializers.ModelSerializer):
    walletId = serializers.IntegerField(source='id')
    walletName = serializers.SerializerMethodField()
    ownerOrganizationId = serializers.IntegerField(source='subro_organization_id.id')

    def get_walletName(self, obj):
        if obj.name == "":
            return f"{obj.subro_organization_id.company}'s wallet"
        return obj.name

    class Meta:
        model = subro_org_wallet
        fields = ["walletId", 'walletName', 'ownerOrganizationId']


class MintTransactionSerializer(serializers.Serializer):
    destinationWalletId = serializers.CharField(allow_null=False, allow_blank=False, required=True)
    amount = serializers.FloatField(allow_null=False, required=True)

    def validate(self, attrs):
        try:
            wallet_id = int(attrs.get('destinationWalletId'))
        except:
            raise APIExceptions("Invalid wallet ID", status_code=status.HTTP_400_BAD_REQUEST)

        if not subro_org_wallet.objects.filter(id=wallet_id).exists():
            raise APIExceptions("Wallet Not Found", status_code=status.HTTP_400_BAD_REQUEST)

        if attrs.get('amount') <= 0:
            raise APIExceptions("Amount should be greater than zero.", status_code=status.HTTP_400_BAD_REQUEST)

        attrs = super().validate(attrs)
        return attrs

    def mint(self):
        org_wallet = subro_org_wallet.objects.filter(id=int(self.validated_data['destinationWalletId'])).first()
        org_wallet.funds = float(org_wallet.funds) + self.validated_data['amount']
        org_wallet.save()
        instance = subro_org_wallet_transaction(
            origin_wallet=org_wallet,
            amount=self.validated_data['amount'],
            type=subro_org_wallet_transaction.Type.MINT,
            description=f"funds minted."
        )
        instance.save()
        return instance.id, self.validated_data['destinationWalletId'], self.validated_data['amount']


class MoveTransactionSerializer(serializers.Serializer):
    originWalletId = serializers.CharField(allow_null=False, allow_blank=False, required=True)
    destinationWalletId = serializers.CharField(allow_null=False, allow_blank=False, required=True)
    amount = serializers.FloatField(allow_null=False, required=True)

    def validate(self, attrs):
        try:
            origin_wallet_id = int(attrs.get('originWalletId'))
        except:
            raise APIExceptions("Invalid origin wallet ID.", status_code=status.HTTP_400_BAD_REQUEST)
        try:
            destination_wallet_id = int(attrs.get('destinationWalletId'))
        except:
            raise APIExceptions("Invalid destination wallet ID.", status_code=status.HTTP_400_BAD_REQUEST)

        if destination_wallet_id == origin_wallet_id:
            raise APIExceptions("You can not transfer amount to same wallet", status_code=status.HTTP_400_BAD_REQUEST)

        if not subro_org_wallet.objects.filter(id=origin_wallet_id).exists():
            raise APIExceptions("Origin wallet Not Found.", status_code=status.HTTP_400_BAD_REQUEST)

        if not subro_org_wallet.objects.filter(id=destination_wallet_id).exists():
            raise APIExceptions("Destination wallet Not Found.", status_code=status.HTTP_400_BAD_REQUEST)

        if attrs.get('amount') <= 0:
            raise APIExceptions("Amount should be greater than zero.", status_code=status.HTTP_400_BAD_REQUEST)

        attrs = super().validate(attrs)
        return attrs

    def move_funds(self):
        origin_wallet = subro_org_wallet.objects.filter(id=int(self.validated_data['originWalletId'])).first()
        dest_wallet = subro_org_wallet.objects.filter(id=int(self.validated_data['destinationWalletId'])).first()

        if origin_wallet.funds < self.validated_data['amount']:
            raise APIExceptions("Available funds are lesser than input amount in the Origin wallet.",
                                status_code=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            origin_wallet.funds = float(origin_wallet.funds) - self.validated_data['amount']
            origin_wallet.save()

            dest_wallet.funds = float(dest_wallet.funds) + self.validated_data['amount']
            dest_wallet.save()

            origin_wallet_transaction = subro_org_wallet_transaction(
                origin_wallet=origin_wallet,
                destination_wallet=dest_wallet,
                amount=(-1 * self.validated_data['amount']),
                type=subro_org_wallet_transaction.Type.MOVE,
                description=f"Funds debited to wallet id: {dest_wallet.id}"
            )

            dest_wallet_transaction = subro_org_wallet_transaction(
                origin_wallet=dest_wallet,
                destination_wallet=origin_wallet,
                type=subro_org_wallet_transaction.Type.MOVE,
                amount=self.validated_data['amount'],
                description=f"funds credited from wallet id: {origin_wallet.id}"
            )

            origin_wallet_transaction.save()
            dest_wallet_transaction.save()

        return origin_wallet_transaction.id, origin_wallet.id, dest_wallet.id, self.validated_data['amount']


class WalletTransactionSerializer(serializers.ModelSerializer):
    transactionId = serializers.IntegerField(source='id')
    originName = serializers.SerializerMethodField()
    originWalletId = serializers.SerializerMethodField()
    amount = serializers.FloatField()
    destinationName = serializers.SerializerMethodField()
    destinationWalletId = serializers.SerializerMethodField()

    def get_originName(self, obj):
        if obj.origin_wallet:
            return obj.origin_wallet.name
        return None

    def get_originWalletId(self, obj) -> Union[int, None]:
        if obj.origin_wallet:
            return obj.origin_wallet.id
        return None

    def get_destinationName(self, obj):
        if obj.destination_wallet:
            return obj.destination_wallet.name
        return None

    def get_destinationWalletId(self, obj) -> Union[int, None]:
        if obj.destination_wallet:
            return obj.destination_wallet.id
        return None

    class Meta:
        model = subro_org_wallet_transaction
        fields = ['transactionId', 'originName', 'originWalletId', 'destinationName', 'destinationWalletId',
                  'type', 'status', 'amount']


class UserInfoSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source='id')
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    email = serializers.EmailField(source='username')
    role = serializers.SerializerMethodField()

    class Meta:
        model = subroUser
        fields = ['userId', 'firstName', 'lastName', 'role', 'email']

    def get_role(self, obj):
        if obj.groups.filter(name="org_root").exists():
            return "Root User"
        return "User"


class SubroKeyRetrieveSerializer(serializers.ModelSerializer):
    keyId = serializers.IntegerField(source='id')
    publicKey = serializers.CharField(source='public_key')
    keyName = serializers.CharField(source='key_name')
    encryptedAesKey = serializers.CharField(source='encrypted_aes_key')
    createdAt = serializers.DateTimeField(source='date_created')
    owner = serializers.SerializerMethodField()

    def get_owner(self, obj):
        if not obj.assigned_user:
            return None
        return UserInfoSerializer(obj.assigned_user.user.user_id).data

    class Meta:
        model = SubroKey
        fields = ['keyId', 'keyName', 'publicKey', 'owner', 'encryptedAesKey', 'createdAt']


class AssignKeySerializer(serializers.Serializer):
    keyId = serializers.IntegerField(write_only=True)
    userId = serializers.IntegerField(write_only=True)

    def assign_key(self, key, user):
        subro_org_user = subro_organization_user.objects.filter(user__user_id=user).first()
        if not subro_org_user:
            raise APIExceptions("User not found.", status_code=status.HTTP_404_NOT_FOUND)
        (SubroKey.objects.filter(id=key).
         update(assigned_user=subro_org_user))
        return SubroKey.objects.get(id=self.validated_data['keyId'])


class RenewKeySerializer(serializers.Serializer):

    def renew_key(self, subro_key):
        subro_key.delete()
        new_subro_key = SubroKey.objects.create(owner=subro_key.owner, assigned_user=subro_key.assigned_user,
                                                key_name=subro_key.key_name)
        new_subro_key.generate_keys()
        new_subro_key.save()


class CreateArbitratorSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(allow_null=False, allow_blank=False, required=True)
    firstName = serializers.CharField(source="first_name", allow_null=False, allow_blank=False, required=True)
    lastName = serializers.CharField(source="last_name", allow_null=False, allow_blank=False, required=True)
    password = serializers.CharField(write_only=True, allow_null=False, allow_blank=False, required=True)
    role = serializers.SerializerMethodField()

    def get_role(self, obj):
        return [group.name for group in obj.groups.all()]

    def create(self, validated_data):
        if User.objects.filter(email=validated_data['email']).exists():
            raise APIExceptions("User with this email already exists.", status_code=status.HTTP_409_CONFLICT)
        validated_data['username'] = validated_data['email']
        group = Group.objects.filter(name=UserPermissions.ARBITRATOR.value).first()
        if not group:
            raise APIExceptions("User Group issue. contact Administrator.", status_code=status.HTTP_409_CONFLICT)
        user = User.objects.create_user(**validated_data)
        user.groups.add(group)
        return user

    class Meta:
        model = User
        fields = ["id", 'email', 'firstName', 'lastName', 'password', 'role']


class GetArbitratorSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source='id')
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    createdAt = serializers.DateTimeField(source='date_joined')
    loggedAt = serializers.DateTimeField(source='last_login')
    status = serializers.SerializerMethodField()

    def get_status(self, obj):
        return "ACTIVE" if obj.is_active else "SUSPENDED"

    class Meta:
        model = User
        fields = [
            'userId', 'firstName', 'lastName', 'email', 'status', 'createdAt', 'loggedAt']


class AdminKeySerializer(serializers.ModelSerializer):
    keyId = serializers.IntegerField(source='id')
    publicKey = serializers.CharField(source='public_key')
    keyName = serializers.CharField(source='key_name')
    encryptedAesKey = serializers.CharField(source='encrypted_aes_key')
    createdAt = serializers.DateTimeField(source='date_created')
    owner = serializers.SerializerMethodField()

    def get_owner(self, obj):
        return UserInfoSerializer(obj.user).data

    class Meta:
        model = AdminKey
        fields = ['keyId', 'keyName', 'publicKey', 'owner', 'encryptedAesKey', 'createdAt']


class ArbUserActionLogsSerializer(serializers.ModelSerializer):
    actionId = serializers.IntegerField(source='id')
    type = serializers.SerializerMethodField()
    offerId = serializers.IntegerField(source='offer.id')
    date = serializers.DateTimeField(source='created_at')

    def get_type(self, obj):
        return obj.log_type.lower()

    class Meta:
        model = ArbitratorUserActionsLogs
        fields = ["actionId", 'type', 'offerId', 'date']
