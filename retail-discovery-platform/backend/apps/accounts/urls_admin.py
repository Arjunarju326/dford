from django.urls import path
from .views import AdminUserListView, AdminUserDetailView

urlpatterns = [
    path('', AdminUserListView.as_view(), name='admin-users-list'),
    path('<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
