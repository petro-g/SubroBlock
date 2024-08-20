from django.urls import path
from user_dashboard import views
from user_dashboard.jwt import HomeView, LogoutView, RefreshTokenView
from rest_framework_simplejwt import views as jwt_views

urlpatterns = [
    path('users/<int:pk>', views.UserDetailAPIView.as_view(), name='user-detail'),

    path('case', views.AccidentListAPIView.as_view(), name='case-list'),
    path('case/insert', views.AccidentDetailAPIView.as_view(), name='case-detail'),
    path('case/submit', views.OfferResponseAPIView.as_view(), name='case-detail'),

    path('offers', views.OfferListAPIView.as_view(), name='case-list'),
    path('offers/<int:offer_id>/attachments', views.OfferAttachmentApiView.as_view(), name='offer-attachments'),
    path('offers/<uuid:file_uuid>/attachments', views.OfferAttachmentDeleteApiView.as_view(), name='offer-attachments-delete'),
    path('offers/attachments', views.OfferAttachmentCreateApiView.as_view(), name='offer-attachments-create'),
    path('offers/user', views.OfferDetailAPIView.as_view(), name='case-detail'),
    path('admin-user/users/<int:pk>/status', views.UpdateUserAPIView.as_view(), name='suspend-user'),

    path('responding/vin', views.RespondingVinCompany.as_view(), name='vehicle-details'),

    path('send_offer/<int:pk>', views.OfferDetailAPIView.as_view(), name='case-detail'),

    path('subroblocks', views.OfferListAPIView.as_view(), name='case-list'),
    path('submit_block/<int:pk>', views.OfferDetailAPIView.as_view(), name='case-detail'),

    path('assign-arbitor/<int:pk>', views.OfferDetailAPIView.as_view(), name='case-detail'),

    path('login', views.LoginAPIView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),

    path('forgot-password/initiate-recovery', views.ResetPasswordView.as_view(), name='reset-password'),
    path('forgot-password/validate-token', views.ResetPasswordValidateView.as_view(), name='reset-password'),
    path('forgot-password/new-password', views.UpdatePasswordView.as_view(), name='reset-password'),
    path('password-recovery/resend', views.ResendPasswordViewSet.as_view(), name='resend-password'),

    path('home', HomeView.as_view(), name ='home'),

    path('token', jwt_views.TokenObtainPairView.as_view(), name ='token_obtain_pair'),
    path('token/refresh', RefreshTokenView.as_view(), name ='token_refresh'),

    path('create-user', views.CreateUserAPIView.as_view(), name='create_user'),
    path('whoami', views.WhoAmIView.as_view(), name='whoami'),

    path('files', views.AWSUploadS3.as_view(), name='get_files'),
    path('files/dl', views.AWSDownloadS3.as_view(), name='get_files'),
    path('files/signed-url', views.AWSSignedUrlS3.as_view()),
    path('files/signed-url/initiate-multipart', views.InitiateMultipartUploadView.as_view(), name='get-files-signed-url'),
    path('files/signed-url/upload-part', views.MultiPartPresignedUrlView.as_view(), name='get-files-signed-url'),
    path('files/signed-url/complete-multipart', views.CompleteMultipartUploadView.as_view(), name='get-files-signed-url'),

    path('case-offer/<int:pk>', views.CaseAndOfferView.as_view(), name='get_files'),
    path('business-user/offers/create', views.CreateOfferView.as_view(), name='create-offers'),
    path('business-user/offers/received', views.ListReceivedOffersView.as_view(), name='list-offers'),
    path('business-user/offers/sent', views.ListSentOffersView.as_view(), name='list-sent-offers'),
    path('business-user/offers/history/sent', views.ListSentOffersView.as_view(), {'history': True}, name='list-sent-offers-history'),
    path('business-user/offers/history/received', views.ListReceivedOffersView.as_view(), {'history': True}, name='list-offers-history'),
    path('business-user/offers/<int:pk>', views.RetrieveOfferView.as_view(), name='get-offer'),
    path('business-user/offers/response/<int:responseId>/sign', views.ResponseSignView.as_view(), name='response-offer'),
    path('business-user/offers/<int:offerId>/response', views.OfferResponseCreateView.as_view(), name='response-offer'),
    path('business-user/offers/<int:offerId>/sign', views.OfferSignView.as_view(), name='sign-offer'),
    path('business-user/activity/count', views.GetOfferCountView.as_view(), name='response-offer'),
]
