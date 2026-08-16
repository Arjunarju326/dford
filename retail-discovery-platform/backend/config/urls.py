from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView


def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'd4d-api'})


api_v1_patterns = [
    path('', include('apps.stores.urls')),
    path('', include('apps.flyers.urls')),
    path('', include('apps.catalog.urls')),
    path('', include('apps.accounts.urls')),
    path('auth/', include('apps.accounts.urls')),
    path('admin/users/', include('apps.accounts.urls_admin')),
    path('locations/', include('apps.locations.urls')),
    path('offers/', include('apps.offers.urls')),
    path('shopping/', include('apps.shopping.urls')),
    path('favorites/', include('apps.favorites.urls')),
    path('notifications/', include('apps.notifications.urls')),
    path('analytics/', include('apps.analytics.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),

    # Health
    path('api/health/', health_check, name='health-check'),

    # API Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API Routes (/api/v1/ and legacy /api/)
    path('api/v1/', include(api_v1_patterns)),
    path('api/', include(api_v1_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
