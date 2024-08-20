from datetime import datetime, timedelta, timezone

from django.contrib.auth.models import Group, User
from django.db.models import F, Case, When, FloatField, Sum, Count, Exists, OuterRef
from django.db.models.functions import TruncHour
from django.db.models.expressions import Value

from django.contrib.auth import get_user_model
from django.db.models import Prefetch, Max, Min
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework import generics
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet
from rest_framework_simplejwt.authentication import JWTAuthentication

from arbitrator_dashboard.models import ArbitratorUserActionsLogs
from subro_admin.models import ActionsLogs, SubroKey, AdminKey
from subro_admin.permissions import AdminUserPermission, RootUserPermission, UserPermissions
from subro_admin.serializers import OrganizationSerializer, GetOrganizationSerializer, OrgUpdatePasswordSerializer, \
    SuspendOrganizationSerializer, SingleOrganizationSerializer, UpdateOrganizationSerializer, \
    SubroUserCreateSerializer, SubroUserSerializer, OrganizationUserSerializer, CreateOrgUserSerializer, \
    UpdateOrgUserSerializer, SuspendOrgUserSerializer, OfferAdminSerializer, WalletSerializer, \
    MintTransactionSerializer, SearchWalletSerializer, MoveTransactionSerializer, WalletTransactionSerializer, \
    GetBusinessUserSerialize, OrgUserTransactionSerializer, OrgTransactionSerializer, SubroKeyRetrieveSerializer, \
    GetOrgSerialize, AdminOrgTransactionSerializer, AssignKeySerializer, RenewKeySerializer, CreateArbitratorSerializer, \
    GetArbitratorSerializer, AdminKeySerializer, ArbUserActionLogsSerializer
from subro_admin.utils import ABS

from user_dashboard.models import subro_organization, subroUser, subro_organization_user, subro_offer_request, \
    subro_offer_responder, subro_org_wallet, subro_org_wallet_transaction, RequestOfferStatus

from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from subro_admin.filters import BusinessUserGetFilter, ListOfferAdminFilter, SortingFilterBackendOffers
from subroblock.exceptions import APIExceptions
from subroblock.pagination import SubroPagination



class OrganizationViewSet(ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "put", "patch", "post"]
    serializer_class = GetOrganizationSerializer
    pagination_class = SubroPagination
    order_fields_dict = {'rootUserEmail': 'root_user__email', 'name': 'company', 'status': 'status'}

    def get_queryset(self):
        # Add custom queryset logic
        return subro_organization.objects.all()

    @swagger_auto_schema(method='post', request_body=OrganizationSerializer)
    @action(detail=False, methods=['post'], url_path="create", url_name="create")
    def create_organization(self, request):
        try:
            serializer = OrganizationSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            response = serializer.save()
            return Response({"success": True,
                             "message": "Organization created successfully.",
                             **response
                             }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path="update-root-user-password", url_name="update-root-user-password")
    def update_root_user_password(self, request, *args, **kwargs):
        try:
            serializer = OrgUpdatePasswordSerializer(data=request.data, context=request)
            serializer.is_valid(raise_exception=True)
            serializer.check_permissions()
            serializer.update_password()
            return Response({"success": True,
                             "message": "Updated",
                             }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['GET'], url_path="status", url_name="status")
    def get_status(self, request, pk=None):
        try:
            serializer = OrganizationSerializer()
            org = serializer.get_organization(pk)
            return Response({
                "success": True,
                "message": "",
                "data": {
                    "status": "ACTIVE" if org.status == subro_organization.Status.ACTIVE else "SUSPENDED",
                    "adminId": org.root_user.id
                }
            }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        try:
            search_term = request.GET.get("name", "")
            sort = request.GET.get("sort", "")
            order = request.GET.get("order", "asc")
            queryset = subro_organization.objects.all()
            if len(search_term) != 0:
                queryset = queryset.filter(company__icontains=search_term)

            if self.order_fields_dict.get(sort, '') != '':
                order_field = self.order_fields_dict.get(sort, '')
                queryset = queryset.order_by("-" + order_field if order == "desc" else order_field)
            paged_queryset = self.paginate_queryset(queryset)
            serializer = GetOrganizationSerializer(paged_queryset, many=True)
            return self.get_paginated_response(serializer.data)
        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = subro_organization.objects.filter(id=kwargs['pk']).first()
            if not instance:
                raise APIExceptions("Organization not found.", status_code=status.HTTP_404_NOT_FOUND)
            serializer = SingleOrganizationSerializer(instance, many=False)
            return Response({"success": True, 'data': serializer.data, "message": ""},
                            status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            serializer = UpdateOrganizationSerializer(data=request.data, context=kwargs, )
            serializer.check_permissions(request.user)
            instance = serializer.get_organization_instance()
            serializer.perform_update(instance)
            return Response({
                "id": instance.id,
                "organizationName": instance.company,
                "rootUserEmail": instance.root_user.email,
                "message": "Organization details updated successfully."
            }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class UpdateStatusOrgUserViewSets(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AdminUserPermission]

    def put(self, request, pk):
        try:
            serializer = SuspendOrganizationSerializer(data=request.data, context=request)
            serializer.is_valid(raise_exception=True)
            org = serializer.verify_organization(pk)
            serializer.update_status(org)
            updated_org = subro_organization.objects.filter(id=int(pk)).first()
            return Response({"success": True, "message": "The organization status was successfully updated",
                             "status": "ACTIVE" if updated_org.status == subro_organization.Status.ACTIVE else "SUSPENDED"},
                            status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class GetOrgRootUserAPIView(generics.RetrieveAPIView):
    serializer_class = SingleOrganizationSerializer

    def get(self, request, *args, **kwargs):
        try:
            instance = subro_organization.objects.filter(root_user=request.user).first()
            if not instance:
                raise APIExceptions("Organization not found.", status_code=status.HTTP_404_NOT_FOUND)
            serializer = SingleOrganizationSerializer(instance, many=False)
            return Response({"success": True, 'data': serializer.data, "message": ""},
                            status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class RootUsersOrgAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = subro_organization_user.objects.all()
    serializer_class = OrganizationUserSerializer
    order_fields_dict = {'name': 'user__user_id__first_name', 'email': 'user__user_id__email',
                         'status': 'user__user_id__is_active', "createdAt": "user__account_created",
                         "loggedAt": "user__user_id__last_login"}

    def get(self, request, *args, **kwargs):
        try:
            instance = subro_organization.objects.filter(root_user=request.user).first()
            if not instance:
                raise APIExceptions("Organization not found.", status_code=status.HTTP_404_NOT_FOUND)

            queryset = subro_organization_user.objects.filter(company=instance).annotate(
                has_key_assigned=Exists(
                    SubroKey.objects.filter(assigned_user=OuterRef('pk'))
                )
            )
            search_term = request.GET.get("name", "")
            has_key_assigned = request.GET.get("hasKeyAssigned", None)
            sort = request.GET.get("sort", "")
            order = request.GET.get("order", "asc")
            search = request.GET.get("search", "")
            if len(search) != 0:
                queryset = queryset.filter(
                    Q(user__user_id__first_name__icontains=search) |
                    Q(user__user_id__last_name__icontains=search) |
                    Q(user__user_id__email__icontains=search))

            if len(search_term) != 0:
                queryset = queryset.filter(Q(user__user_id__first_name__icontains=search_term) |
                                           Q(user__user_id__last_name__icontains=search_term))

            if has_key_assigned is not None:
                if has_key_assigned == 'true':
                    queryset = queryset.filter(has_key_assigned=True)
                else:
                    queryset = queryset.exclude(has_key_assigned=True)

            if self.order_fields_dict.get(sort, '') != '':
                order_field = self.order_fields_dict.get(sort, '')
                queryset = queryset.order_by("-" + order_field if order == "desc" else order_field)
            else:
                queryset = queryset.order_by("-created_at")

            paginated_queryset = self.paginate_queryset(queryset)
            serializer = self.get_serializer(paginated_queryset, many=True)
            return self.get_paginated_response(serializer.data)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        try:
            serializer = CreateOrgUserSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.create_user(request.user)
            return Response({"success": True,
                             "message": "New user created.",
                             }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class UpdateUsersOrgAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        try:
            serializer = UpdateOrgUserSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.perform_update(request.user, pk)
            return Response({"success": True,
                             "message": "User Updated.",
                             }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class GetUserOrgAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RootUserPermission]

    def get(self, request, *args, **kwargs):
        try:
            org = subro_organization.objects.filter(root_user=request.user)
            if not org.exists():
                raise APIExceptions("You dont have appropriate permission to use this API. Contact Administrator.",
                                    status_code=status.HTTP_400_BAD_REQUEST)
            org_instance = org.first()
            user_instance = subro_organization_user.objects.filter(company=org_instance,
                                                                   user__user_id_id=kwargs['pk']).first()
            if not user_instance:
                raise APIExceptions("User not found.", status_code=status.HTTP_404_NOT_FOUND)

            serializer = GetBusinessUserSerialize(user_instance.user, many=False)

            return Response({"success": True,
                             "data": serializer.data,
                             "message": "",
                             }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class GetUserAdministratorAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AdminUserPermission]

    def get(self, request, *args, **kwargs):
        try:
            user_instance = subroUser.objects.filter(user_id__id=kwargs['pk']).first()
            if not user_instance:
                raise APIExceptions("User not found.", status_code=status.HTTP_404_NOT_FOUND)

            org_user = subro_organization_user.objects.filter(user=user_instance).first()
            user_serializer = GetBusinessUserSerialize(user_instance, many=False)
            org_data = None
            if org_user:
                org_serializer = GetOrgSerialize(org_user.company, many=False)
                org_data = org_serializer.data

            return Response({"success": True,
                             "data": {
                                 **user_serializer.data,
                                 "organization": org_data
                             },
                             "message": "",
                             }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class UserListAPIView(generics.ListAPIView):
    serializer_class = SubroUserSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = BusinessUserGetFilter
    order_fields_dict = {'name': 'user_id__first_name', 'email': 'user_id__email',
                         'status': 'user_id__is_active'}

    def get_queryset(self):
        return subroUser.objects.prefetch_related(
            "subro_organization_user__company",
            "subro_organization_user__subro_organization_key_set"
        ).select_related(
            "user_id",
        ).all()

    def list(self, request, *args, **kwargs):
        sort = request.GET.get("sort", "")
        order = request.GET.get("order", "asc")
        queryset = self.filter_queryset(self.get_queryset())
        search = request.GET.get("search", "")
        if len(search) != 0:
            queryset = queryset.filter(Q(user_id__first_name__icontains=search) |
                                       Q(user_id__last_name__icontains=search) |
                                       Q(user_id__email__icontains=search))

        if self.order_fields_dict.get(sort, '') != '':
            order_field = self.order_fields_dict.get(sort, '')
            queryset = queryset.order_by("-" + order_field if order == "desc" else order_field)
        else:
            queryset = queryset.order_by("-account_created")

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class UserCreateAPIView(generics.CreateAPIView):

    def get_serializer_class(self):
        return SubroUserCreateSerializer

    def post(self, request, *args, **kwargs):
        serializer = SubroUserCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RetrieveOfferAdmin(generics.RetrieveAPIView):

    serializer_class = OfferAdminSerializer
    permission_classes = [AdminUserPermission]

    def get_queryset(self):
        queryset = subro_offer_request.objects.select_related('responderCompany').prefetch_related(
            Prefetch(
                'subro_offer_responder_set',
                queryset=subro_offer_responder.objects.all(),
                to_attr='responders'
            )
        )

        return queryset


class ListOfferAdmin(generics.ListAPIView):
    serializer_class = OfferAdminSerializer
    permission_classes = [AdminUserPermission]
    filter_backends = [DjangoFilterBackend, SortingFilterBackendOffers]
    filterset_class = ListOfferAdminFilter
    order_fields_dict = {
        'senderCompanyName': 'requestor__company__company',
        'responderCompanyName': 'responderCompany__company',
        'cycleTime': 'cycle_time',
        'offerVehicleVIN': 'offerVehicleVin_id__vin_id',
        'respondVehicleVIN': 'respondVehicleVin_id__vin_id',
        'initialAmount': 'offerAmount',
        'status': 'status',
    }

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        queryset = queryset.order_by('-modified_date')
        sort = request.GET.get("sort", "")
        order = request.GET.get("order", "asc")
        if self.order_fields_dict.get(sort, '') != '':
            order_field = self.order_fields_dict.get(sort, '')
            queryset = queryset.order_by("-" + order_field if order == "desc" else order_field)

        paginated_queryset = self.paginate_queryset(queryset)
        serializer = self.get_serializer(paginated_queryset, many=True)
        return self.get_paginated_response(serializer.data)

    def get_queryset(self):
        queryset = subro_offer_request.objects.select_related('responderCompany').prefetch_related(
            Prefetch(
                'subro_offer_responder_set',
                queryset=subro_offer_responder.objects.all(),
                to_attr='responders'
            )
        )
        return queryset


class CancelOfferAdmin(generics.UpdateAPIView):
    permission_classes = [AdminUserPermission]
    def get_queryset(self):
        return subro_offer_request.objects.all()

    def put(self, request, *args, **kwargs):
        try:
            offer = subro_offer_request.objects.filter(id=kwargs['pk']).first()
            if not offer:
                raise APIExceptions("Offer not found.", status_code=status.HTTP_404_NOT_FOUND)
            if offer.status not in [RequestOfferStatus.SIGNED, RequestOfferStatus.ARBITRATION]:
                raise APIExceptions(f'Offer cannot be cancelled as it in {offer.status} status. Only offers in “Signed” or “Arbitration” statuses can be cancelled.', status_code=status.HTTP_400_BAD_REQUEST)
            offer.status = RequestOfferStatus.CANCELLED
            offer.save()
            return Response({"success": True, "message": "Offer cancelled successfully."}, status=status.HTTP_200_OK)
        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class UserOrgStatusAPIView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = subro_organization_user.objects.all()

    def get_serializer_class(self):
        return SuspendOrgUserSerializer

    def put(self, request, *args, **kwargs):
        try:
            serializer = SuspendOrgUserSerializer(data=request.data, context=request.user)
            serializer.check_permissions()
            serializer.is_valid(raise_exception=True)
            user = serializer.suspend_user(kwargs['pk'])
            return Response({
                "userId": user.id,
                "status": "ACTIVE" if user.is_active else "SUSPENDED",
                "success": True
            }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class UserOrgTransactionsAPIView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RootUserPermission]
    serializer_class = OrgUserTransactionSerializer
    order_fields_dict = {'name': 'origin_wallet__name', 'date': 'transaction_date'}

    def get_queryset(self):
        queryset = ActionsLogs.objects.filter(user_id=self.kwargs['pk'])
        start_date = self.request.query_params.get('startDate', None)
        end_date = self.request.query_params.get('endDate', None)
        transaction_type = self.request.query_params.get('transactionType', "")

        if transaction_type != "":
            queryset = queryset.filter(log_type=str(transaction_type).upper())

        if start_date and end_date:
            queryset = queryset.filter(created_at__range=[start_date, end_date])
        elif start_date:
            # Get all items from start_date to the latest item added
            max_date = queryset.aggregate(Max('created_at'))['created_at__max']
            queryset = queryset.filter(created_at__range=[start_date, max_date])
        elif end_date:
            # Get all items from the earliest item created to end_date
            min_date = queryset.aggregate(Min('created_at'))['created_at__min']
            queryset = queryset.filter(created_at__range=[min_date, end_date])

        return queryset

    def get(self, request, *args, **kwargs):
        try:
            sort = request.GET.get("sort", "")
            order = request.GET.get("order", "asc")

            queryset = self.get_queryset()
            if self.order_fields_dict.get(sort, '') != '':
                order_field = self.order_fields_dict.get(sort, '')
                queryset = queryset.order_by("-" + order_field if order == "desc" else order_field)
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class AdminOrgTransactionsAPIView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AdminUserPermission]
    serializer_class = AdminOrgTransactionSerializer
    order_fields_dict = {'name': 'origin_wallet__name', 'date': 'transaction_date'}

    def get_queryset(self):
        queryset = ActionsLogs.objects.filter(user_id=self.kwargs['pk'])
        start_date = self.request.query_params.get('startDate', None)
        end_date = self.request.query_params.get('endDate', None)
        transaction_type = self.request.query_params.get('transactionType', "")

        if transaction_type != "":
            queryset = queryset.filter(log_type=str(transaction_type).upper())

        if start_date and end_date:
            queryset = queryset.filter(created_at__range=[start_date, end_date])
        elif start_date:
            # Get all items from start_date to the latest item added
            max_date = queryset.aggregate(Max('created_at'))['created_at__max']
            queryset = queryset.filter(created_at__range=[start_date, max_date])
        elif end_date:
            # Get all items from the earliest item created to end_date
            min_date = queryset.aggregate(Min('created_at'))['created_at__min']
            queryset = queryset.filter(created_at__range=[min_date, end_date])

        return queryset

    def get(self, request, *args, **kwargs):
        try:
            sort = request.GET.get("sort", "")
            order = request.GET.get("order", "asc")

            queryset = self.get_queryset()
            if self.order_fields_dict.get(sort, '') != '':
                order_field = self.order_fields_dict.get(sort, '')
                queryset = queryset.order_by("-" + order_field if order == "desc" else order_field)
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class GetOrgTransactionsAPIView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RootUserPermission]
    serializer_class = OrgTransactionSerializer
    order_fields_dict = {'type': 'type', 'amount': 'amount', 'date': 'transaction_date', 'status': 'status'}

    def get_queryset(self):
        org = subro_organization.objects.filter(root_user=self.request.user).first()
        queryset = subro_org_wallet_transaction.objects.filter(origin_wallet__subro_organization_id=org)
        return queryset

    def get(self, request, *args, **kwargs):
        try:
            sort = request.GET.get("sort", "date")
            order = request.GET.get("order", "desc")

            queryset = self.get_queryset()
            if self.order_fields_dict.get(sort, '') != '':
                order_field = self.order_fields_dict.get(sort, '')
                queryset = queryset.order_by("-" + order_field if order == "desc" else order_field)

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class WalletAPIViewSet(ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post"]
    serializer_class = WalletSerializer
    queryset = subro_organization.objects.all()

    @action(detail=False, methods=['post'])
    def buy(self, request, *args, **kwargs):
        try:
            serializer = WalletSerializer(data=request.data, context=request.user)
            serializer.is_valid(raise_exception=True)
            org = serializer.check_permissions()
            funds, received = serializer.buy(org)

            return Response({
                "success": True,
                "data": {
                    "message": "SubroCoins purchased successfully",
                    "new_balance": funds
                }}, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def sell(self, request, *args, **kwargs):
        try:
            serializer = WalletSerializer(data=request.data, context=request.user)
            serializer.is_valid(raise_exception=True)
            org = serializer.check_permissions()
            funds, received = serializer.sell(org)

            return Response({
                "success": True,
                "data": {
                    "message": "SubroCoins sold successfully",
                    "amount_received": received,
                    "new_balance": funds
                }}, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='balance')
    def get_balance(self, request):
        try:
            serializer = WalletSerializer(context=request.user)
            org = serializer.check_permissions()

            return Response({
                "success": True,
                "data": {
                    "balance": serializer.get_balance(org),
                    "pendingSentOffers": serializer.get_pending_sent_offers(org),
                    "pendingReceivedOffers": serializer.get_pending_received_offers(org)
                },
            }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class MintTransactionAdmin(generics.CreateAPIView):
    queryset = subro_organization_user.objects.all()
    permission_classes = [AdminUserPermission]

    def get_serializer_class(self):
        return MintTransactionSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data, context=request.user)
            serializer.is_valid(raise_exception=True)
            transaction_id, destination_wallet_id, amount = serializer.mint()

            return Response({
                  "status": "success",
                  "message": "Mint transaction successfully created",
                  "transactionId": transaction_id,
                  "destinationWalletId": destination_wallet_id,
                  "amount": amount,
                  "timestamp": datetime.now()
                }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class SearchWalletAdmin(generics.ListAPIView):
    queryset = subro_org_wallet.objects.all()
    permission_classes = [AdminUserPermission]

    def get_serializer_class(self):
        return SearchWalletSerializer

    def get(self, request, *args, **kwargs):
        try:
            search = request.GET.get("search", "")
            queryset = self.get_queryset()
            if len(search) != 0:
                try:
                    search_id = int(search)
                    queryset = queryset.filter(
                        Q(id=search_id) |
                        (~Q(name='') & Q(name__icontains=search)) |
                        (Q(name='') & Q(subro_organization_id__company__icontains=search)))
                except:
                    queryset = queryset.filter(
                        (~Q(name='') & Q(name__icontains=search)) |
                        (Q(name='') & Q(subro_organization_id__company__icontains=search)))

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class MoveTransactionAdmin(generics.CreateAPIView):
    queryset = subro_organization_user.objects.all()
    permission_classes = [AdminUserPermission]

    def get_serializer_class(self):
        return MoveTransactionSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data, context=request.user)
            serializer.is_valid(raise_exception=True)
            transaction_id, origin_wallet, destination_wallet, amount = serializer.move_funds()

            return Response({
                  "status": "success",
                  "message": "Transaction successfully created",
                  "transactionId": transaction_id,
                  "originWalletId": origin_wallet,
                  "destinationWalletId": destination_wallet,
                  "amount": amount,
                  "timestamp": datetime.now()
            }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class GetTransactionAdmin(generics.ListAPIView):
    serializer_class = WalletTransactionSerializer
    order_fields_dict = {'wallet': 'id', 'email': 'user_id__email',
                         'status': 'user_id__is_active'}

    def get_queryset(self):
        return subro_org_wallet_transaction.objects.all()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            search_term = request.GET.get("search", "")
            value = request.GET.get("value", "")
            if len(search_term) != 0 and search_term == 'origin_wallet':
                queryset = queryset.filter(origin_wallet__name__icontains=value)

            if len(search_term) != 0 and search_term == 'dest_wallet':
                queryset = queryset.filter(destination_wallet__name__icontains=value)

            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class CreateKeyAPIView(generics.CreateAPIView):
    permission_classes = [RootUserPermission]

    def post(self, request):
        user = request.user
        subro_org = subro_organization.objects.filter(root_user=user).first()
        if not subro_org:
            return Response({"success": False, "error": "Organization not found."},
                            status=status.HTTP_404_NOT_FOUND)
        subro_keys = SubroKey.objects.filter(owner=subro_org)
        if subro_keys.count() >= 3:
            return Response({"success": False, "error": "Organization already has the maximum number of keys (3)."},
                            status=status.HTTP_400_BAD_REQUEST)
        subro_key = SubroKey.objects.create(owner=subro_org, key_name=f"SubroKey {subro_keys.count() + 1}")
        subro_key.generate_keys()
        subro_key.save()
        return Response({"success": True,
                         "message": "Keys generated successfully.",
                         "aesEncryptedKey": subro_key.encrypted_aes_key,
                         "publicKey": subro_key.public_key,
                         "keyName": subro_key.key_name,
                         "userId": user.id,
                         "userName": user.first_name + " " + user.last_name,
                         }, status=status.HTTP_200_OK)


class AssignKeyAPIView(generics.GenericAPIView):
    permission_classes = [RootUserPermission]
    serializer_class = AssignKeySerializer

    def get_queryset(self):
        return SubroKey.objects.all()

    def put(self, request):
        try:
            serializer = AssignKeySerializer(data=request.data, context=request.user)
            serializer.is_valid(raise_exception=True)
            serializer.assign_key(serializer.validated_data['keyId'], serializer.validated_data['userId'])
            return Response({"success": True, "message": "Key assigned successfully."}, status=status.HTTP_200_OK)
        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class BurnKeyAPIView(generics.DestroyAPIView):
    permission_classes = [RootUserPermission]

    def delete(self, request, *args, **kwargs):
        try:
            key_id = kwargs['pk']
            user = request.user
            subro_org = subro_organization.objects.filter(root_user=user).first()
            if not subro_org:
                return Response({"success": False, "error": "Organization not found."},
                                status=status.HTTP_404_NOT_FOUND)
            subro_key = SubroKey.objects.filter(owner=subro_org, id=key_id).first()
            if not subro_key:
                return Response({"success": False, "error": "Key not found."},
                                status=status.HTTP_404_NOT_FOUND)
            subro_key.delete()
            subro_keys = SubroKey.objects.filter(owner=subro_org)
            for idx, key in enumerate(subro_keys):
                key.key_name = f"SubroKey {idx + 1}"
                key.save()
            return Response({"success": True, "message": "Key deleted successfully."}, status=status.HTTP_200_OK)
        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class RenewKeyAPIView(generics.UpdateAPIView):
    permission_classes = [RootUserPermission]

    def get_queryset(self):
        return SubroKey.objects.all()

    def get_serializer_class(self):
        return RenewKeySerializer

    def update(self, request, *args, **kwargs):
        keyId = self.kwargs['pk']
        subro_key = SubroKey.objects.filter(id=keyId).first()
        if not subro_key:
            return Response({"success": False, "error": "Key not found."},
                            status=status.HTTP_404_NOT_FOUND)

        if not subro_key.assigned_user:
            return Response({"success": False, "error": "Key not assigned to any user."},
                            status=status.HTTP_400_BAD_REQUEST)

        self.get_serializer().renew_key(subro_key)
        return Response({"success": True, "message": "Key renewed successfully."}, status=status.HTTP_200_OK)


class ListKeyAPIView(generics.ListAPIView):
    permission_classes = [RootUserPermission]
    pagination_class = None

    def get_serializer_class(self):
        return SubroKeyRetrieveSerializer

    def get_queryset(self):
        user = self.request.user
        subro_org = subro_organization.objects.filter(root_user=user).first()
        if not subro_org:
            return Response({"success": False, "error": "Organization not found."},
                            status=status.HTTP_404_NOT_FOUND)
        return SubroKey.objects.filter(owner=subro_org)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class GetAnalyticsAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [RootUserPermission]

    def get_queryset(self, subro_org, start_date, end_date):
        queryset = subro_org_wallet_transaction.objects.filter(origin_wallet__subro_organization_id=subro_org)

        start_date = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        end_date = datetime.strptime(end_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)

        end_date = end_date + timedelta(days=1)
        queryset = queryset.filter(Q(transaction_date__gte=start_date) & Q(transaction_date__lte=end_date))

        hourly_data = queryset.annotate(
            hour=TruncHour('transaction_date')
        ).values('hour').annotate(
            total=Count('id'),
            incomingTransactionsCount=Count('id', filter=Q(amount__gt=0)),
            outgoingTransactionsCount=Count('id', filter=Q(amount__lt=0)),
            incomingTransactionsAmount=Sum(Case(When(amount__gt=0, then=F('amount')), default=Value(0),
                                                output_field=FloatField())),

            outgoingTransactionsAmount=ABS(Sum(Case(When(amount__lt=0, then=F('amount')), default=Value(0),
                                                    output_field=FloatField())))
        ).order_by('hour')

        return hourly_data

    def get(self, request, *args, **kwargs):
        try:
            subro_org = subro_organization.objects.filter(root_user=request.user).first()
            if not subro_org:
                return Response({"success": False, "error": "Organization not found."},
                                status=status.HTTP_404_NOT_FOUND)

            start_date = self.request.query_params.get('dateFrom', None)
            end_date = self.request.query_params.get('dateTo', None)

            if not start_date:
                return Response({"success": False, "error": "Please provide dateFrom."},
                                status=status.HTTP_404_NOT_FOUND)

            if not end_date:
                return Response({"success": False, "error": "Please provide dateTo."},
                                status=status.HTTP_404_NOT_FOUND)

            if not start_date and not end_date:
                return Response({"success": False, "error": "Please provide dateFrom and dateTo."},
                                status=status.HTTP_404_NOT_FOUND)

            hourly_data = self.get_queryset(subro_org, start_date, end_date)

            return Response({"success": True,
                             "dateFrom": start_date,
                             "dateTo": end_date,
                             "data": hourly_data,
                             "message": "",
                             }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class ArbitratorAPIViewSet(generics.ListAPIView):
    permission_classes = [AdminUserPermission]
    serializer_class = CreateArbitratorSerializer
    order_fields_dict = {'name': 'first_name', 'email': 'email',
                         'status': 'is_active', "createdAt": "date_joined",
                         "loggedAt": "last_login"}

    def get_queryset(self, pk=None):
        group = Group.objects.filter(name=UserPermissions.ARBITRATOR.value).first()
        if not group:
            raise APIExceptions("User Group issue. contact Administrator.", status_code=status.HTTP_409_CONFLICT)
        if pk is not None:
            queryset = User.objects.filter(id=pk, groups__in=[group])
            if not queryset.exists():
                raise APIExceptions("User not found or not part of Arbitrator group.",
                                    status_code=status.HTTP_404_NOT_FOUND)
            return queryset
        return User.objects.filter(groups__in=[group])

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data, context=request.user)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response({
                "status": "success",
                "message": "User successfully created.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        if kwargs.get('pk', None) is not None:
            return self.retrieve_user(kwargs['pk'])
        try:
            queryset = self.get_queryset()
            sort = request.GET.get("sort", "createdAt")
            order = request.GET.get("order", "desc")
            search = request.GET.get("search", "")
            if len(search) != 0:
                queryset = queryset.filter(
                    Q(first_name__icontains=search) |
                    Q(last_name__icontains=search) |
                    Q(email__icontains=search))

            if self.order_fields_dict.get(sort, '') != '':
                order_field = self.order_fields_dict.get(sort, '')
                queryset = queryset.order_by("-" + order_field if order == "desc" else order_field)
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = GetArbitratorSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve_user(self, pk):
        try:
            queryset = self.get_queryset(pk)
            if not queryset.exists():
                return Response({
                    "status": "success",
                    "message": "",
                    "data": {}
                }, status=status.HTTP_200_OK)

            serializer = GetArbitratorSerializer(queryset.first(), many=False)
            return Response({
                "status": "success",
                "message": "",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class GetArbUserLogsAPIView(generics.ListAPIView):
    permission_classes = [AdminUserPermission]
    serializer_class = ArbUserActionLogsSerializer

    def get(self, request, *args, **kwargs):
        try:
            group = Group.objects.filter(name=UserPermissions.ARBITRATOR.value).first()
            if not group:
                raise APIExceptions("User Group issue. contact Administrator.", status_code=status.HTTP_409_CONFLICT)
            user = User.objects.filter(id=kwargs['pk'], groups__in=[group])
            if not user.exists():
                raise APIExceptions("User not found on not part of arbitrator group",
                                    status_code=status.HTTP_404_NOT_FOUND)

            queryset = ArbitratorUserActionsLogs.objects.filter(user=user.first())
            if not queryset.exists():
                return Response({
                    "status": "success",
                    "message": "",
                    "data": []
                }, status=status.HTTP_200_OK)

            serializer = self.get_serializer(queryset, many=True)
            return Response({
                "status": "success",
                "message": "",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class GetOwnKeyAdmin(generics.RetrieveAPIView):
    permission_classes = [AdminUserPermission]

    def get_queryset(self):
        user = self.request.user
        return AdminKey.objects.filter(user=user)

    def get_serializer_class(self):
        return AdminKeySerializer

    def get(self, request, *args, **kwargs):
        qs = self.get_queryset().first()
        if not qs:
            return Response({"success": False, "error": "Key not found."},
                            status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(qs)
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class RenewOwnKeyAdmin(generics.UpdateAPIView):
    permission_classes = [AdminUserPermission]

    def get_queryset(self):
        user = self.request.user
        return AdminKey.objects.filter(user=user)

    def update(self, request, *args, **kwargs):
        key = self.get_queryset().first()
        user = request.user
        if not key:
            return Response({"success": False, "error": "Key not found."},
                            status=status.HTTP_404_NOT_FOUND)
        key.delete()
        new_key = AdminKey.objects.create(user=user, key_name=f"{user.username}AdminKey")
        new_key.generate_keys()
        new_key.save()
        return Response({"success": True, "message": "Key renewed successfully."}, status=status.HTTP_200_OK)


class BurnOwnKeyAdmin(generics.DestroyAPIView):
    permission_classes = [AdminUserPermission]

    def get_queryset(self):
        user = self.request.user
        return AdminKey.objects.filter(user=user)

    def delete(self, request, *args, **kwargs):
        key = self.get_queryset().first()
        if not key:
            return Response({"success": False, "error": "Key not found."},
                            status=status.HTTP_404_NOT_FOUND)
        key.delete()
        return Response({"success": True, "message": "Key deleted successfully."}, status=status.HTTP_200_OK)


class GenerateOwnKeyAdmin(generics.CreateAPIView):
    permission_classes = [AdminUserPermission]

    def post(self, request, *args, **kwargs):
        user = request.user
        admin_key = AdminKey.objects.filter(user=user).first()
        if admin_key:
            return Response({"success": False, "error": "You already have a key assigned. Please, renew the key if you want to update the key pair or burn the existing key first"},
                            status=status.HTTP_400_BAD_REQUEST)
        admin_key = AdminKey.objects.create(user=user, key_name=f"{user.username}AdminKey")
        admin_key.generate_keys()
        admin_key.save()
        return Response({"success": True, "message": "Key created successfully."}, status=status.HTTP_200_OK)
