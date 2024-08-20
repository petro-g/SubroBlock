from django.urls import path, include
from rest_framework.routers import DefaultRouter

from subro_admin.views import OrganizationViewSet, UserCreateAPIView, UserListAPIView, GetOrgRootUserAPIView, \
    RootUsersOrgAPIView, UpdateUsersOrgAPIView, UserOrgStatusAPIView, ListOfferAdmin, RetrieveOfferAdmin, \
    SearchWalletAdmin, WalletAPIViewSet, MintTransactionAdmin, MoveTransactionAdmin, GetTransactionAdmin, \
    CancelOfferAdmin, UpdateStatusOrgUserViewSets, GetUserOrgAPIView, UserOrgTransactionsAPIView, \
    GetOrgTransactionsAPIView, CreateKeyAPIView, ListKeyAPIView, GetUserAdministratorAPIView, GetAnalyticsAPIView, \
    AdminOrgTransactionsAPIView, AssignKeyAPIView, BurnKeyAPIView, RenewKeyAPIView, ArbitratorAPIViewSet, \
    GetOwnKeyAdmin, RenewOwnKeyAdmin, BurnOwnKeyAdmin, GenerateOwnKeyAdmin, GetArbUserLogsAPIView

router = DefaultRouter(trailing_slash=False)
router.register('organization', OrganizationViewSet, basename='organization')
router.register(r'root-user/wallet', WalletAPIViewSet, basename='wallet')

urlpatterns = [
    path('organization/user', UserCreateAPIView.as_view(), name='organization-user'),

    path('root-user/organization', GetOrgRootUserAPIView.as_view(), name='root-user-organization'),
    path('root-user/users', RootUsersOrgAPIView.as_view(), name='root-users-organization'),
    path('root-user/users/<int:pk>/status', UserOrgStatusAPIView.as_view(), name='suspend-user-organization'),
    path('root-user/users/<int:pk>/actions-log', UserOrgTransactionsAPIView.as_view(), name='suspend-user-organization'),
    path('root-user/users/<int:pk>', GetUserOrgAPIView.as_view(), name='osg-user-organization'),
    path('root-user/transactions', GetOrgTransactionsAPIView.as_view(), name='osg-user-organization'),
    path('root-user/keys/generate', CreateKeyAPIView.as_view(), name='generate-keys'),
    path('root-user/keys/assign', AssignKeyAPIView.as_view(), name='assign-keys'),
    path('root-user/keys/<int:pk>/renew', RenewKeyAPIView.as_view(), name='assign-keys'),
    path('root-user/keys/<int:pk>', BurnKeyAPIView.as_view(), name='assign-keys'),
    path('root-user/keys', ListKeyAPIView.as_view(), name='list-keys'),
    path('root-user/wallet/analytics/pl', GetAnalyticsAPIView.as_view(), name='list-keys'),

    path('root/users/<int:pk>', UpdateUsersOrgAPIView.as_view(), name='root-user-organization'),

    path('admin-user/keys/own', GetOwnKeyAdmin.as_view(), name='admin-keys'),
    path('admin-user/keys/renew', RenewOwnKeyAdmin.as_view(), name='admin-keys'),
    path('admin-user/keys/burn', BurnOwnKeyAdmin.as_view(), name='admin-keys'),
    path('admin-user/keys/generate', GenerateOwnKeyAdmin.as_view(), name='admin-keys'),
    path('admin-user/users', UserListAPIView.as_view(), name='admin-users'),
    path('admin-user/users/<int:pk>/actions-log', AdminOrgTransactionsAPIView.as_view(), name='admin-actions'),
    path('admin-user/users/<int:pk>', GetUserAdministratorAPIView.as_view(), name='get-org-user'),
    path('admin-user/offers', ListOfferAdmin.as_view(), name='admin-offers'),
    path('admin-user/offers/<int:pk>', RetrieveOfferAdmin.as_view(), name='admin-offers'),
    path('admin-user/offers/<int:pk>/cancel', CancelOfferAdmin.as_view(), name='cancel-offers'),
    path('admin-user/transactions/mint', MintTransactionAdmin.as_view(), name='mint-transactions'),
    path('admin-user/wallets', SearchWalletAdmin.as_view(), name='search_wallet'),
    path('admin-user/transactions/move', MoveTransactionAdmin.as_view(), name='move-transactions'),
    path('admin-user/transactions', GetTransactionAdmin.as_view(), name='move-transactions'),
    path("admin-user/arb-users/<int:pk>/actions-log", GetArbUserLogsAPIView.as_view(), name="arb-user-logs"),
    path('admin-user/arb-users/<int:pk>', ArbitratorAPIViewSet.as_view(), name='arbitrator-detail'),
    path('admin-user/arb-users', ArbitratorAPIViewSet.as_view(), name='create-arbitrator'),
    path('organization/<int:pk>/status', UpdateStatusOrgUserViewSets.as_view(), name='update-organization-user'),

    path("", include(router.urls)),
]
