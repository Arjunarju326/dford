from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    MeView,
    ChangePasswordView,
    UserPreferenceView,
    PermissionListAPIView,
    UserPermissionsListAPIView,
    UserPermissionToggleAPIView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('preferences/', UserPreferenceView.as_view(), name='auth-preferences'),
    
    # Permission Management Endpoints
    path('permissions/', PermissionListAPIView.as_view(), name='permission-list'),
    path('users/permissions/', UserPermissionsListAPIView.as_view(), name='user-permission-list'),
    path('users/<int:user_id>/permissions/', UserPermissionToggleAPIView.as_view(), name='user-permission-toggle'),
]
