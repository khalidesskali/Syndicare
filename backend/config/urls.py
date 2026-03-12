from django.contrib import admin
from django.urls import path, include, re_path
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from django.conf import settings
from django.conf.urls.static import static

# Swagger configuration
schema_view = get_schema_view(
    openapi.Info(
        title="Syndic Management API",
        default_version='v1',
        description="API documentation for Syndic Management System",
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Domain-specific apps
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.buildings.urls')),
    path('api/', include('apps.apartments.urls')),
    path('api/', include('apps.complaints.urls')),
    path('api/', include('apps.meetings.urls')),
    path('api/', include('apps.payments.urls')),

    # Chatbot
    path('api/', include("chatbot.urls")),
    
    # Swagger URLs
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_URL)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)