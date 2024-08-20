import django_filters
from rest_framework.filters import BaseFilterBackend
from django.db.models import QuerySet, Q

from user_dashboard.models import subroUser, subro_offer_request, RequestOfferStatus


class ListReceivedOffersFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method='status_filter', lookup_expr='icontains')
    responderCompany = django_filters.CharFilter(method='responder_company_filter', lookup_expr='icontains')
    responderCompanyName = django_filters.CharFilter(field_name='responderCompany__company', lookup_expr='icontains')
    senderCompany = django_filters.CharFilter(method='sender_company_filter', lookup_expr='icontains')
    dateOfOffer = django_filters.DateFromToRangeFilter(field_name='submission_date')
    search = django_filters.CharFilter(method='search_filter')
    inDraft = django_filters.BooleanFilter(method='in_draft_filter')

    def in_draft_filter(self, queryset: QuerySet, name, value):
        if value is True:
            return queryset.exclude(
                Q(status__in=[RequestOfferStatus.ZERO_TWO_KEYS, RequestOfferStatus.ONE_TWO_KEYS]) |
                Q(subro_offer_responder__status__in=[RequestOfferStatus.SIGNED])
            )
        if value is False:
            return queryset.filter(
                Q(subro_offer_responder__status__in=[RequestOfferStatus.SIGNED])
            )

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
            Q(offerVehicleVin_id__vin_id__VehicleVin__icontains=value) |
            Q(respondVehicleVin_id__vin_id__VehicleVin__icontains=value)
        )

    def status_filter(self, queryset: QuerySet, name, value):
        values = value.split(",")
        return queryset.filter(status__in=values)

    class Meta:
        model = subro_offer_request
        fields = ['status', 'responderCompanyName', 'responderCompany', 'dateOfOffer', 'search', 'senderCompany']


class ListSentOffersFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(method='status_filter', lookup_expr='icontains')
    inDraft = django_filters.BooleanFilter(method='in_draft_filter')
    responderCompany = django_filters.CharFilter(method='responder_company_filter', lookup_expr='icontains')
    responderCompanyName = django_filters.CharFilter(field_name='responderCompany__company', lookup_expr='icontains')
    senderCompany = django_filters.CharFilter(method='sender_company_filter', lookup_expr='icontains')
    dateOfOffer = django_filters.DateFromToRangeFilter(field_name='submission_date')
    search = django_filters.CharFilter(method='search_filter')

    def in_draft_filter(self, queryset: QuerySet, name, value):
        if value is True:
            return queryset.filter(status__in=[RequestOfferStatus.ZERO_TWO_KEYS, RequestOfferStatus.ONE_TWO_KEYS])
        elif value is False:
            return queryset.exclude(status__in=[RequestOfferStatus.ZERO_TWO_KEYS, RequestOfferStatus.ONE_TWO_KEYS])

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
            Q(responderCompany__company__icontains=value) |
            Q(offerVehicleVin_id__vin_id__VehicleVin__icontains=value) |
            Q(respondVehicleVin_id__vin_id__VehicleVin__icontains=value)
        )

    def status_filter(self, queryset: QuerySet, name, value):
        if value.lower() == 'draft':
            return queryset.filter(status__in=[RequestOfferStatus.ZERO_TWO_KEYS, RequestOfferStatus.ONE_TWO_KEYS])
        if value.lower() == 'signed':
            return queryset.exclude(status__in=[RequestOfferStatus.ZERO_TWO_KEYS, RequestOfferStatus.ONE_TWO_KEYS])
        values = value.split(",")
        return queryset.filter(status__in=values)

    class Meta:
        model = subro_offer_request
        fields = ['status', 'responderCompanyName', 'responderCompany', 'dateOfOffer', 'search', 'senderCompany']


class SortingFilterBackend(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        sort_by = request.query_params.get('sortBy')
        sort_order = request.query_params.get('sortOrder', 'asc')  # Default to ascending order if not provided

        if sort_by:
            if sort_by not in view.get_sortable_fields():
                raise ValueError("Invalid sortBy field")

            if sort_order == 'asc':
                queryset = queryset.order_by(sort_by)
            elif sort_order == 'desc':
                queryset = queryset.order_by(f'-{sort_by}')
            else:
                raise ValueError("Invalid sortOrder value. Must be 'asc' or 'desc'")

        return queryset
