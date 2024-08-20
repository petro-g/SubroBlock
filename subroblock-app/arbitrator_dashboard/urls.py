from django.urls import path
from arbitrator_dashboard import views
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path("arbitor/offers", views.OfferListAPIView.as_view(), name="get-offers"),
    path("arbitor/create", views.CreateOfferAPIView.as_view(), name="create-offer"),
    path("arbitor/update/<int:pk>", views.UpdateOfferAPIView.as_view(), name="update-offer"),
    path("arbitor/delete/<int:pk>", views.DeleteOfferAPIView.as_view(), name="delete-offer"),
    path("offers/arbitration-queue", views.GetPendingOffersAPIView.as_view(), name="queue-offer"),
    path("offers/<int:pk>", views.GetArbOfferAPIView.as_view(), name="arb-offer"),
    path("offers/<int:pk>/claim/approve", views.ApproveOfferAPIView.as_view(), name="approve-offer"),
]
