import django_filters
from django.db.models import QuerySet, Q
from rest_framework.filters import BaseFilterBackend

from user_dashboard.models import subroUser, subro_offer_request


class BusinessUserGetFilter(django_filters.FilterSet):
    id = django_filters.NumberFilter(field_name='user_id__id')
    first_name = django_filters.CharFilter(field_name='user_id__first_name', lookup_expr='icontains')
    last_name = django_filters.CharFilter(field_name='user_id__last_name', lookup_expr='icontains')
    email = django_filters.CharFilter(field_name='user_id__email', lookup_expr='icontains')
    organizationId = django_filters.NumberFilter(field_name='subro_organization_user__company__id')
    organizationName = django_filters.CharFilter(field_name='subro_organization_user__company__company', lookup_expr='icontains')
    organizationRootUserEmail = django_filters.CharFilter(field_name='subro_organization_user__company__root_user__email', lookup_expr='icontains')
    active = django_filters.CharFilter(field_name='user_id__is_active')
    hasKeyAssigned = django_filters.BooleanFilter(field_name='subro_organization_user__subro_organization_key__key', lookup_expr='isnull', exclude=True)

    class Meta:
        model = subroUser
        fields = '__all__'


class ListOfferAdminFilter(django_filters.FilterSet):
    submissionDate = django_filters.DateFromToRangeFilter(field_name='submission_date')
    accidentDate = django_filters.DateFromToRangeFilter(field_name='accident_date')
    company = django_filters.CharFilter(field_name='responderCompany__id', lookup_expr='iexact')
    search = django_filters.CharFilter(method='search_filter')
    status = django_filters.CharFilter(method='status_filter', lookup_expr='icontains')
    responderCompany = django_filters.CharFilter(method='responder_company_filter', lookup_expr='icontains')
    senderCompany = django_filters.CharFilter(method='sender_company_filter', lookup_expr='icontains')

    def search_filter(self, queryset: QuerySet, name, value):
        return queryset.filter(
            Q(requestor__company__company__icontains=value) |
            Q(responderCompany__company__icontains=value) |
            Q(offerVehicleVin_id__vin_id__VehicleVin__icontains=value) |
            Q(respondVehicleVin_id__vin_id__VehicleVin__icontains=value)
        )

    def status_filter(self, queryset: QuerySet, name, value):
        values = value.split(",")
        return queryset.filter(status__in=values)

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

    class Meta:
        model = subro_offer_request
        fields = ['submissionDate', 'accidentDate', 'company', 'search', 'status', 'responderCompany', 'senderCompany']


class SortingFilterBackendOffers(BaseFilterBackend):
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