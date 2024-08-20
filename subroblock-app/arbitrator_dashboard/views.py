from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from arbitrator_dashboard.filters import ArbitratorSentOffersFilter
from arbitrator_dashboard.serializers import ListArbOffersSerializer, ApproveOfferSerializer
from subroblock.exceptions import APIExceptions
from user_dashboard import models
from arbitrator_dashboard import serializers
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from arbitrator_dashboard.permissions import IsArbitrator
from user_dashboard.filters import SortingFilterBackend
from user_dashboard.models import subro_offer_request, RequestOfferStatus

'''
per arbitor:
    
    list their offers being worked on
    update offer
    create offer
    delete offer
    send offer to kaleido
'''


class OfferListAPIView(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsArbitrator]

    serializer_class = serializers.SubroOfferRequestSerializer

    def get_queryset(self):
        # "subroUser" object corresponding to the "User" object that came with the request
        subroUser_obj = models.subroUser.objects.get(user_id=self.request.user.id)
        return models.subro_offer_request.objects.filter(requestor__user=subroUser_obj)


class CreateOfferAPIView(generics.CreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsArbitrator]

    serializer_class = serializers.SubroOfferRequestSerializer
    
    def perform_create(self, serializer):
        subroUser_obj = models.subroUser.objects.get(user_id=self.request.user.id)
        subro_organization_user_obj = models.subro_organization_user.objects.get(user=subroUser_obj)
        serializer.save(requestor=subro_organization_user_obj)


class UpdateOfferAPIView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsArbitrator]

    queryset = models.subro_offer_request.objects.all()
    serializer_class = serializers.SubroOfferRequestSerializer

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class DeleteOfferAPIView(generics.DestroyAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsArbitrator]

    queryset = models.subro_offer_request.objects.all()
    serializer_class = serializers.SubroOfferRequestSerializer


# Implementation pending Kaleido integration and setup
class SendOfferToKaleidoAPIView(generics.UpdateAPIView):

    def post(self, request):
        pass


class GetPendingOffersAPIView(generics.ListAPIView):
    permission_classes = [IsArbitrator]
    filter_backends = [DjangoFilterBackend, SortingFilterBackend]
    filterset_class = ArbitratorSentOffersFilter
    order_fields_dict = {
        'senderCompanyName': 'requestor__company__company',
        'responderCompanyName': 'requestor__company__company',
        'offerVehicleVIN': 'offerVehicleVin_id__vin_id',
        'respondVehicleVIN': 'respondVehicleVin_id__vin_id',
        'initialAmount': 'offerAmount',
        'offerAmount': 'reservedOfferAmount'
    }
    serializer_class = ListArbOffersSerializer

    def get_queryset(self):
        return subro_offer_request.objects.filter(status=RequestOfferStatus.ARBITRATION, aiArbitration=False)

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            sort = request.GET.get("sort", "createdAt")
            order = request.GET.get("order", "desc")
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


class GetArbOfferAPIView(generics.ListAPIView):
    permission_classes = [IsArbitrator]
    serializer_class = ListArbOffersSerializer

    def get_queryset(self, pk):
        return subro_offer_request.objects.filter(id=pk, status=RequestOfferStatus.ARBITRATION, aiArbitration=False)

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset(kwargs['pk'])
            if not queryset.exists():
                return Response({
                    "status": "success",
                    "message": "",
                    "data": {}
                }, status=status.HTTP_200_OK)

            serializer = self.get_serializer(queryset.first(), many=False)
            return Response({
                "status": "success",
                "message": "",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)


class ApproveOfferAPIView(generics.CreateAPIView):
    permission_classes = [IsArbitrator]
    serializer_class = ApproveOfferSerializer

    def post(self, request, *args, **kwargs):
        try:
            queryset = subro_offer_request.objects.filter(id=kwargs['pk'], status=RequestOfferStatus.ARBITRATION,
                                                          aiArbitration=False)
            if not queryset.exists():
                raise APIExceptions("Offer not found or not in ARBITRATION.",
                                    status_code=status.HTTP_404_NOT_FOUND)
            serializer = ApproveOfferSerializer(data=request.data, context=request.user)
            serializer.is_valid(raise_exception=True)
            serializer.claim_approve(queryset.first())
            return Response({"success": True, "message": "The claim has successfully been approved."},
                            status=status.HTTP_200_OK)

        except APIExceptions as e:
            return Response({"success": False, "error": e.message}, status=e.status_code)
        except Exception as e:
            return Response({"success": False, "error": e.args}, status=status.HTTP_400_BAD_REQUEST)
