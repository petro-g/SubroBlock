"""
URL configuration for subroblock project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Subroblock API",
        default_version='v1',
        description="API for Subroblock",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
    authentication_classes=[JWTAuthentication],
)
urlpatterns = [
    re_path(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    path('v1/admin/', admin.site.urls),
    path('v1/api-auth/', include('rest_framework.urls')),
    path('v1/arb-user/', include("arbitrator_dashboard.urls")),
    path('v1/docs<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('v1/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('v1/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('v1/', include("subro_admin.urls")),
    path('v1/', include("user_dashboard.urls")),
]

if settings.USE_DEBUG_TOOLBAR:
    urlpatterns = [
        path('__debug__/', include('debug_toolbar.urls')),
    ] + urlpatterns

urlpatterns += static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)
