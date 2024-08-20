import json

from django.db import transaction
from rest_framework import serializers, status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate

from arbitrator_dashboard.models import ArbitratorUserActionsLogs
from subroblock.exceptions import APIExceptions
from user_dashboard import models
from user_dashboard.models import subro_offer_request, RequestOfferStatus


class SubroOfferRequestSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = models.subro_offer_request
        fields = [
            'id',
            'requestor',
            'responderCompany',
            'submission_date',
            'modified_date',
            'accidentDate',
            'offerVehicleVin_id',
            'respondVehicleVin_id',
            'offerAmount',
            'reservedOfferAmount']
        # requestor is automatically set to the user creating the request
        read_only_fields = [
            'requestor'
        ]


class ListArbOffersSerializer(serializers.ModelSerializer):
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

    class Meta:
        model = subro_offer_request
        fields = [
            'id', 'responderCompanyId', 'responderCompany', 'issuerCompanyId', 'issuerCompany', 'status', 'cycleTime',
            'cycleTimeDurDecimal', 'offerVehicleVin', 'responderVehicleVin', 'dateOfOffer', 'responseAmount',
            'failedResponses', 'arbitrationMethod', 'offerAmount', 'accidentDate', 'modifiedDate', 'offerVehicleVinId',
            'responderVehicleVinId', 'priorResponseAmount', 'arbitratedAmount'
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


class ApproveOfferSerializer(serializers.Serializer):
    arbitratedAmount = serializers.FloatField(allow_null=False, required=True)

    def validate(self, attrs):
        if attrs.get('arbitratedAmount') == 0:
            raise APIExceptions("arbitrated amount should not be zero", status_code=status.HTTP_400_BAD_REQUEST)

        attrs = super().validate(attrs)
        return attrs

    def claim_approve(self, offer: subro_offer_request):
        with transaction.atomic():
            offer.arbitratedAmount = self.validated_data['arbitratedAmount']
            offer.status = RequestOfferStatus.Arbitration_CA
            offer.save()
            ArbitratorUserActionsLogs.objects.create(
                user=self.context,
                log_type=ArbitratorUserActionsLogs.LogType.APPROVE_CLAIM,
                offer=offer
            )
