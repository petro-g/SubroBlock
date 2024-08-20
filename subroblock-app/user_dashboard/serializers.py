import json
from django.core.mail import send_mail
from rest_framework import serializers, status
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate
from django.db import transaction

from subro_admin.models import SubroKey
from subroblock.exceptions import APIExceptions
from subroblock.settings import DEFAULT_FROM_EMAIL
from user_dashboard import models
from user_dashboard.models import ResetPassword, subro_offer_request, subro_offer_request_file, \
    subro_org_wallet_transaction, SubroOfferSignature, SubroResponderSignature, subro_offer_responder, \
    subro_organization_user
from subro_mailer.utils import send_single_mail, EmailTemplate
from drf_yasg import openapi

User = get_user_model()


class LoginOrganizationSerializer(serializers.Serializer):
    organizationId = serializers.IntegerField(source='id')
    name = serializers.CharField(source='company')
    rootUserEmail = serializers.EmailField(source='root_user.email')


class LoginSerializer(serializers.ModelSerializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)
    roles = serializers.SerializerMethodField()
    hasKeyAssigned = serializers.SerializerMethodField()
    organization = serializers.SerializerMethodField()

    def get_roles(self, obj):
        return list(obj.groups.values_list('name', flat=True))

    def get_hasKeyAssigned(self, obj):
        org_user = self.context.get('org_user')
        if not org_user:
            return False
        return SubroKey.objects.filter(assigned_user=org_user).exists()

    def get_organization(self, obj):
        org_user = self.context.get('org_user')
        if not org_user:
            return None
        return LoginOrganizationSerializer(org_user.company).data

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'roles', 'password', 'hasKeyAssigned', 'organization']


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()
    frontUrl = serializers.CharField()

    def send_email(self):
        email = self.validated_data['email']
        front_url = self.validated_data['frontUrl']

        user = User.objects.filter(email=email)
        if user.exists():
            user = user.first()
            ResetPassword.objects.filter(user=user).delete()
            reset_password_instance = ResetPassword.objects.create(user=user)
            reset_link = f"{front_url}/login/reset?resetToken={reset_password_instance.token}"
            send_mail(
                'Reset Your Password',
                f'Click the following link to reset your password: {reset_link}',
                DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )

class UpdatePasswordSerializer(serializers.Serializer):
    resetToken = serializers.CharField()
    newPassword = serializers.CharField()

    def update_password(self):
        token = self.validated_data['resetToken']
        new_password = self.validated_data['newPassword']
        if not ResetPassword.objects.filter(token=token).exists():
            return {"error": {"message": "Token is invalid.", "code": "TOKEN_INVALID"}}, True

        instance = ResetPassword.objects.get(token=token)
        if not instance.is_valid or instance.is_expired:
            return {"error": {"message": "Reset link has expired. Please request a new password reset link.",
                              "code": "TOKEN_EXPIRED"}}, True

        user = instance.user
        user.set_password(new_password)
        user.save()
        instance.delete()

        return {"message": "Your password has been successfully reset. Please sign in with your updated credentials."
                }, False


class SuspendUserSerializer(serializers.Serializer):
    status = serializers.CharField(allow_null=False, allow_blank=False, required=True)

    def validate(self, attrs):
        input_status = attrs.get('status')

        if input_status not in ['SUSPENDED', 'ACTIVE']:
            raise serializers.ValidationError("Input status value should be ACTIVE or SUSPENDED. ")
        attrs = super().validate(attrs)

        return attrs

    def check_permissions(self):
        user = self.context
        groups_queryset = user.groups.filter(name="admin")
        if not groups_queryset.exists():
            raise APIExceptions("You dont have appropriate permission to use this API. Contact Administrator.",
                                status_code=status.HTTP_400_BAD_REQUEST)

    def update_user(self, user_id):
        instance = User.objects.filter(id=user_id).first()
        if not instance:
            raise APIExceptions("User with this id does not exists.", status_code=status.HTTP_404_NOT_FOUND)

        if self.context.id == user_id:
            raise APIExceptions("You can not suspend your own account.", status_code=status.HTTP_406_NOT_ACCEPTABLE)

        if self.validated_data['status'] == "SUSPENDED":
            instance.is_active = False
        if self.validated_data['status'] == "ACTIVE":
            instance.is_active = True
        instance.save()
        return instance


class PasswordResetValidateSerializer(serializers.Serializer):
    token = serializers.CharField()


class subroCaseSerializer(serializers.ModelSerializer):
    offer_vehicle_vin = serializers.SerializerMethodField()
    respond_vehicle_vin = serializers.SerializerMethodField()

    class Meta:
        model = models.subro_offer_request
        fields = [
            'requestor',
            'responderCompany',
            'submission_date',
            'modified_date',
            'accidentDate',
            'offerVehicleVin_id',
            'offer_vehicle_vin',
            'respondVehicleVin_id',
            'respond_vehicle_vin',
            'offerAmount',
            'reservedOfferAmount',
            'case_files']

    def get_offer_vehicle_vin(self, obj):
        return obj.offerVehicleVin_id.vin_id.VehicleVin

    def get_respond_vehicle_vin(self, obj):
        return obj.respondVehicleVin_id.vin_id.VehicleVin


class SubroArbitorCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.subro_offer_request
        fields = [
            'requestor',
            'responderCompany',
            'submission_date',
            'modified_date',
            'accidentDate',
            'offerVehicleVin',
            'respondVehicleVin',
            'offerAmount',
            'reservedOfferAmount',
            'arbitrationBinding',
            'aiArbitration',
            'case_files']


class OfferAttachmentSerializer(serializers.Serializer):
    uuid = serializers.UUIDField()
    offerId = serializers.IntegerField(write_only=True)
    fileFormat = serializers.CharField(read_only=True)
    fileName = serializers.CharField()
    key = serializers.CharField()
    uploadedAt = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        offer_id = validated_data.get('offerId')
        uuid = validated_data.get('uuid')
        filename = f"{validated_data.get('fileName')}".split('.')[0]
        file_format = f".{validated_data.get('fileName').split('.')[-1]}"
        key = validated_data.get('key')
        uploaded_by_organization = self.context.get('user_organization')

        offer_req = subro_offer_request.objects.get(id=offer_id)
        offer_file = subro_offer_request_file.objects.create(
            uuid=uuid,
            offer_id=offer_req,
            file_format=file_format,
            filename=filename,
            key=key,
            uploaded_by_organization=uploaded_by_organization
        )
        return offer_file

    def to_representation(self, instance):
        return {
            'uuid': instance.uuid,
            'offerId': instance.offer_id.id,
            'fileName': instance.filename,
            'fileFormat': instance.file_format,
            'key': instance.key,
            'uploadedAt': instance.uploaded_at
        }


class SubroOfferSerializer(serializers.Serializer):
    responderCompanyId = serializers.IntegerField(write_only=True)
    accidentDate = serializers.DateField(write_only=True)
    offerVehicleVin = serializers.CharField(write_only=True)
    responderVehicleVin = serializers.CharField(write_only=True)
    publicOfferAmount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)
    secretOfferAmount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True)

    @transaction.atomic
    def create(self, validated_data):
        user = self.context.get('request').user
        subro_user = models.subroUser.objects.get(user_id=user)

        org_user = models.subro_organization_user.objects.filter(user=subro_user)
        if not org_user.exists():
            raise ValidationError('You must be organization user to create an offer.')
        org_user = org_user.first()
        requestor_company = org_user.company
        responder_company = models.subro_organization.objects.get(id=validated_data.get('responderCompanyId'))

        offer_vehicle_vin = models.subro_vehicle_vin.objects.get_or_create(
            subro_organization_id=requestor_company,
            VehicleVin=validated_data.get('offerVehicleVin')
        )[0]
        offer_vehicle_vin_org = models.subro_offer_org_vehicle_vin.objects.get_or_create(
            organization_id=requestor_company,
            vin_id=offer_vehicle_vin
        )[0]
        responder_vehicle_vin = models.subro_vehicle_vin.objects.get_or_create(
            subro_organization_id=responder_company,
            VehicleVin=validated_data.get('responderVehicleVin')
        )[0]
        responder_vehicle_vin_org = models.subro_resp_org_vehicle_vin.objects.get_or_create(
            organization_id=responder_company,
            vin_id=responder_vehicle_vin
        )[0]
        offer = models.subro_offer_request.objects.create(
            requestor=org_user,
            responderCompany=responder_company,
            accidentDate=validated_data.get('accidentDate'),
            offerVehicleVin_id=offer_vehicle_vin_org,
            respondVehicleVin_id=responder_vehicle_vin_org,
            offerAmount=validated_data.get('publicOfferAmount'),
            reservedOfferAmount=validated_data.get('secretOfferAmount'),
        )
        return offer


class CaseAndOfferSerializer(serializers.Serializer):
    case = subroCaseSerializer()
    offer = SubroOfferSerializer()


class RequestsAndResponseSerializer(serializers.Serializer):
    case = subroCaseSerializer()
    offer = SubroOfferSerializer()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}  # Ensure password is write-only

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class SubroUserSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    company = serializers.SerializerMethodField()

    class Meta:
        model = models.subroUser
        fields = [
            'username',
            'first_name',
            'last_name',
            'customer_id',
            'company',
            'account_created',
            'last_login']

    def get_username(self, obj):
        return obj.user_id.username

    def get_first_name(self, obj):
        return obj.user_id.first_name

    def get_last_name(self, obj):
        return obj.user_id.last_name

    def get_company(self, obj):
        subro_org_user_qs = models.subro_organization_user.objects.filter(user=obj)
        if subro_org_user_qs.exists():
            return subro_org_user_qs.first().company.company
        return None


class WhoAmISerializer(serializers.Serializer):
    username = serializers.SerializerMethodField()
    hasKeyAssigned = serializers.SerializerMethodField()

    def get_username(self, obj):
        return obj.user.user_id.username

    def get_hasKeyAssigned(self, obj):
        return SubroKey.objects.filter(assigned_user=obj).exists()



class SubroRespVinSerializer(serializers.ModelSerializer):
    vin_number = serializers.ReadOnlyField(source='vin_id.VehicleVin')
    company = serializers.ReadOnlyField(source='organization_id.company')
    company_id = serializers.ReadOnlyField(source='organization_id.id')

    class Meta:
        model = models.subro_resp_org_vehicle_vin
        fields = ['id', 'vin_number', 'company_id', 'company']


class CreateOfferResponseSerializer(serializers.Serializer):
    responseAmount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, min_value=1)
    responseId = serializers.IntegerField(read_only=True)

    def create(self, validated_data):
        offer_id = self.context.get('offerId')
        responder_wallet = self.context.get('responder_wallet')
        response_amount = validated_data.get('responseAmount')
        offer = models.subro_offer_request.objects.get(id=offer_id)
        offer_response = models.subro_offer_responder.objects.create(
            subro_offer_request_id=offer,
            offer_sent_by_id=self.context.get('subro_org_user_id'),
            offer_amount=response_amount,
            is_accepted=False if response_amount < offer.reservedOfferAmount else True
        )
        return offer_response


class OfferResponseSerializer(serializers.ModelSerializer):
    subroOfferRequestId = serializers.ReadOnlyField(source='subro_offer_request_id.id')
    offerSentById = serializers.ReadOnlyField(source='offer_sent_by_id.id')
    submissionDate = serializers.ReadOnlyField(source='submission_date')
    modifiedDate = serializers.ReadOnlyField(source='modified_date')
    offerAmount = serializers.ReadOnlyField(source='offer_amount')
    isAccepted = serializers.ReadOnlyField(source='is_accepted')

    class Meta:
        model = models.subro_offer_responder
        fields = [
            'id', 'subroOfferRequestId', 'offerSentById', 'submissionDate', 'modifiedDate', 'offerAmount', 'isAccepted'
        ]


class SubroResponderSignatureSerializer(serializers.ModelSerializer):
    signedBy = serializers.CharField(source='signed_by')
    signedAt = serializers.DateTimeField(source='signed_at')

    class Meta:
        model = SubroResponderSignature
        fields = ['signedBy', 'signedAt']


class SubroOfferResponderSerializer(serializers.ModelSerializer):
    responseId = serializers.IntegerField(source='id')
    responseAmount = serializers.DecimalField(source='offer_amount', max_digits=10, decimal_places=2)
    status = serializers.CharField()
    responseSignedByMe = serializers.SerializerMethodField()
    responseSignatures = SubroResponderSignatureSerializer(many=True, read_only=True, source='responder_signatures')

    class Meta:
        model = subro_offer_responder
        fields = ['responseId', 'responseAmount', 'responseSignedByMe', 'responseSignatures', 'status']

    def get_responseSignedByMe(self, obj):
        user = self.context['request'].user
        subro_org_user = subro_organization_user.objects.get(user__user_id=user)
        return obj.responder_signatures.filter(signed_by=subro_org_user).exists()


class ListOffersReceivedSerializer(serializers.ModelSerializer):
    modifiedDate = serializers.DateTimeField(source='modified_date')
    responderCompany = serializers.CharField(source='responderCompany.company')
    responderCompanyId = serializers.IntegerField(source='responderCompany.id')
    issuerCompany = serializers.CharField(source='requestor.company.company')
    issuerCompanyId = serializers.IntegerField(source='requestor.company.id')
    status = serializers.CharField()
    cycleTime = serializers.SerializerMethodField()
    cycleTimeDurDecimal = serializers.SerializerMethodField()
    offerVehicleVin = serializers.CharField(source='offerVehicleVin_id.vin_id.VehicleVin')
    responderVehicleVin = serializers.CharField(source='respondVehicleVin_id.vin_id.VehicleVin')
    dateOfOffer = serializers.ReadOnlyField(source='submission_date')
    responseAmount = serializers.SerializerMethodField()
    priorResponseAmount = serializers.SerializerMethodField()
    failedResponses = serializers.SerializerMethodField(required=False)
    arbitrationMethod = serializers.SerializerMethodField(required=False)
    offerVehicleVinId = serializers.ReadOnlyField(source='offerVehicleVin_id.id')
    responderVehicleVinId = serializers.ReadOnlyField(source='respondVehicleVin_id.id')
    response = serializers.SerializerMethodField()

    class Meta:
        model = subro_offer_request
        fields = [
            'id', 'responderCompanyId', 'responderCompany', 'issuerCompanyId', 'issuerCompany', 'status', 'cycleTime', 'cycleTimeDurDecimal', 'offerVehicleVin', 'responderVehicleVin', 'dateOfOffer',
            'responseAmount', 'failedResponses', 'arbitrationMethod', 'offerAmount', 'accidentDate', 'modifiedDate', 'offerVehicleVinId', 'responderVehicleVinId', 'priorResponseAmount', 'response',
        ]

    def get_response(self, obj):
        latest_response = obj.subro_offer_responder_set.order_by('-id').first()
        if latest_response:
            serializer = SubroOfferResponderSerializer(latest_response, context=self.context)
            return serializer.data
        return None

    def get_priorResponseAmount(self, obj):
        responses = obj.subro_offer_responder_set.all()
        if not responses.exists() or len(responses) == 1:
            return None
        if len(responses) == 2:
            return responses.first().offer_amount
        return responses[len(responses) - 2].offer_amount

    def get_failedResponses(self, obj):
        return obj.subro_offer_responder_set.filter(is_accepted=False).count()

    def get_arbitrationMethod(self, obj):
        return "AI" if obj.aiArbitration else "Manual"

    def get_responseAmount(self, obj):
        responses = obj.subro_offer_responder_set.all()
        if responses.exists():
            return responses.last().offer_amount
        return None

    def get_cycleTime(self, obj):
        if not obj.cycle_time:
            return None
        return f"{obj.cycle_time.days} days {obj.cycle_time.seconds // 3600} hours {obj.cycle_time.seconds % 3600 // 60} minutes"

    def get_cycleTimeDurDecimal(self, obj) -> float:
        if not obj.cycle_time:
            return None
        return obj.cycle_time.total_seconds()


class SubroOfferSignatureSerializer(serializers.ModelSerializer):
    signedBy = serializers.CharField(source='signed_by')
    signedAt = serializers.DateTimeField(source='signed_at')

    class Meta:
        model = SubroOfferSignature
        fields = ['signedBy', 'signedAt']


class ListOffersSerializer(serializers.ModelSerializer):
    modifiedDate = serializers.DateTimeField(source='modified_date')
    responderCompany = serializers.CharField(source='responderCompany.company')
    responderCompanyId = serializers.IntegerField(source='responderCompany.id')
    issuerCompany = serializers.CharField(source='requestor.company.company')
    issuerCompanyId = serializers.IntegerField(source='requestor.company.id')
    status = serializers.CharField()
    cycleTime = serializers.SerializerMethodField()
    cycleTimeDurDecimal = serializers.SerializerMethodField()
    offerVehicleVin = serializers.CharField(source='offerVehicleVin_id.vin_id.VehicleVin')
    responderVehicleVin = serializers.CharField(source='respondVehicleVin_id.vin_id.VehicleVin')
    dateOfOffer = serializers.ReadOnlyField(source='submission_date')
    responseAmount = serializers.SerializerMethodField()
    priorResponseAmount = serializers.SerializerMethodField()
    failedResponses = serializers.SerializerMethodField(required=False)
    arbitrationMethod = serializers.SerializerMethodField(required=False)
    offerVehicleVinId = serializers.ReadOnlyField(source='offerVehicleVin_id.id')
    responderVehicleVinId = serializers.ReadOnlyField(source='respondVehicleVin_id.id')
    signedByMe = serializers.BooleanField()
    signatures = SubroOfferSignatureSerializer(many=True, read_only=True)

    class Meta:
        model = subro_offer_request
        fields = [
            'id', 'responderCompanyId', 'responderCompany', 'issuerCompanyId', 'issuerCompany', 'status', 'cycleTime', 'cycleTimeDurDecimal', 'offerVehicleVin', 'responderVehicleVin', 'dateOfOffer',
            'responseAmount', 'failedResponses', 'arbitrationMethod', 'offerAmount', 'accidentDate', 'modifiedDate', 'offerVehicleVinId', 'responderVehicleVinId', 'priorResponseAmount', 'signedByMe',
            'signatures'
        ]

    def get_priorResponseAmount(self, obj):
        responses = obj.subro_offer_responder_set.all()
        if not responses.exists() or len(responses) == 1:
            return None
        if len(responses) == 2:
            return responses.first().offer_amount
        return responses[len(responses) - 2].offer_amount

    def get_failedResponses(self, obj):
        return obj.subro_offer_responder_set.filter(is_accepted=False).count()

    def get_arbitrationMethod(self, obj):
        return "AI" if obj.aiArbitration else "Manual"

    def get_responseAmount(self, obj):
        responses = obj.subro_offer_responder_set.all()
        if responses.exists():
            return responses.last().offer_amount
        return None

    def get_cycleTime(self, obj):
        if not obj.cycle_time:
            return None
        return f"{obj.cycle_time.days} days {obj.cycle_time.seconds // 3600} hours {obj.cycle_time.seconds % 3600 // 60} minutes"

    def get_cycleTimeDurDecimal(self, obj) -> float:
        if not obj.cycle_time:
            return None
        return obj.cycle_time.total_seconds()


class OfferRetrieveSerializer(serializers.ModelSerializer):
    responderCompany = serializers.CharField(source='responderCompany.company')
    responderCompanyId = serializers.IntegerField(source='responderCompany.id')
    status = serializers.CharField()
    offerVehicleVin = serializers.CharField(source='offerVehicleVin_id.vin_id.VehicleVin')
    offerVehicleVinId = serializers.IntegerField(source='offerVehicleVin_id.id')
    responderVehicleVin = serializers.CharField(source='respondVehicleVin_id.vin_id.VehicleVin')
    responderVehicleVinId = serializers.IntegerField(source='respondVehicleVin_id.id')
    issuerCompany = serializers.CharField(source='requestor.company.company')
    issuerCompanyId = serializers.IntegerField(source='requestor.company.id')
    accidentDate = serializers.DateField()
    cycleTime = serializers.SerializerMethodField()
    cycleTimeDurDecimal = serializers.SerializerMethodField()
    submissionDate = serializers.DateTimeField(source='submission_date')
    modifiedDate = serializers.DateTimeField(source='modified_date')
    failedResponses = serializers.SerializerMethodField()
    responseAmount = serializers.SerializerMethodField()
    priorResponseAmount = serializers.SerializerMethodField()
    arbitrationMethod = serializers.SerializerMethodField()
    signedByMe = serializers.BooleanField()
    signatures = SubroOfferSignatureSerializer(many=True, read_only=True)
    response = serializers.SerializerMethodField()

    class Meta:
        model = subro_offer_request
        exclude = ['reservedOfferAmount', 'submission_date', 'modified_date', 'offerVehicleVin_id', 'respondVehicleVin_id', 'cycle_time']

    def get_response(self, obj):
        latest_response = obj.subro_offer_responder_set.order_by('-id').first()
        if latest_response:
            serializer = SubroOfferResponderSerializer(latest_response, context=self.context)
            return serializer.data
        return None

    def get_priorResponseAmount(self, obj):
        responses = obj.subro_offer_responder_set.all()
        if not responses.exists() or len(responses) == 1:
            return None
        return responses.order_by('-id')[1].offer_amount if len(responses) > 1 else None

    def get_failedResponses(self, obj):
        return obj.subro_offer_responder_set.filter(is_accepted=False).count()

    def get_arbitrationMethod(self, obj):
        return "AI" if obj.aiArbitration else "Manual"

    def get_responseAmount(self, obj):
        responses = obj.subro_offer_responder_set.all()
        return responses.last().offer_amount if responses.exists() else None

    def get_cycleTime(self, obj):
        if not obj.cycle_time:
            return None
        return f"{obj.cycle_time.days} days {obj.cycle_time.seconds // 3600} hours {obj.cycle_time.seconds % 3600 // 60} minutes"

    def get_cycleTimeDurDecimal(self, obj) -> float:
        if not obj.cycle_time:
            return None
        return obj.cycle_time.total_seconds()


class AWSSignedS3Serializer(serializers.Serializer):
    PERMISSIONS = ['put_object', 'get_object', 'delete_object']
    permission = serializers.ChoiceField(choices=PERMISSIONS)
    company = serializers.CharField()
    folderName = serializers.CharField()
    fileName = serializers.CharField()


class InitiateMultipartUploadSerializer(serializers.Serializer):
    company = serializers.CharField()
    folderName = serializers.CharField()
    fileName = serializers.CharField()


class MultiPartPresignedUrlSerializer(serializers.Serializer):
    partNumber = serializers.IntegerField()
    uploadId = serializers.CharField()
    key = serializers.CharField()


class PartSerializer(serializers.Serializer):
    PartNumber = serializers.IntegerField()
    ETag = serializers.CharField()


class CompleteMultipartUploadSerializer(serializers.Serializer):
    uploadId = serializers.CharField()
    key = serializers.CharField()
    parts = serializers.ListField(child=PartSerializer())