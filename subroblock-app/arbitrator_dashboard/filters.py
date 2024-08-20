import django_filters
from django.db.models import QuerySet, Q

from user_dashboard.models import subro_offer_request


class ArbitratorSentOffersFilter(django_filters.FilterSet):
    responderCompany = django_filters.CharFilter(method='responder_company_filter', lookup_expr='icontains')
    senderCompany = django_filters.CharFilter(method='sender_company_filter', lookup_expr='icontains')
    search = django_filters.CharFilter(method='search_filter')

    def sender_company_filter(self, queryset: QuerySet, name, value):
        try:
            values = value.split(",")
            values_int = map(int, values)
        except:
            values_int = []
        return queryset.filter(requestor__company_id__in=values_int)

    def responder_company_filter(self, queryset: QuerySet, name, value):
        try:
            values = value.split(",")
            values_int = map(int, values)
        except:
            values_int = []
        return queryset.filter(responderCompany_id__in=values_int)

    def search_filter(self, queryset: QuerySet, name, value):
        return queryset.filter(
            Q(requestor__company__company__icontains=value) |
            Q(responderCompany__company__icontains=value) |
            Q(offerVehicleVin_id__vin_id__VehicleVin__icontains=value) |
            Q(respondVehicleVin_id__vin_id__VehicleVin__icontains=value)
        )

    class Meta:
        model = subro_offer_request
        fields = ['responderCompany', 'search', 'senderCompany']
