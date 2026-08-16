from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShopRegistrationView,
    ShopMeView,
    ShopBranchViewSet,
    AdminStatsView,
    AdminShopListView,
    AdminShopPendingListView,
    AdminShopApproveView,
    AdminShopRejectView,
    FileUploadView,
)

router = DefaultRouter()
router.register('branches', ShopBranchViewSet, basename='shop-branch')

urlpatterns = [
    path('shop-registration/', ShopRegistrationView.as_view(), name='shop-registration'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('shop/me/', ShopMeView.as_view(), name='shop-me'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/shops/', AdminShopListView.as_view(), name='admin-shops-list'),
    path('admin/shops/pending/', AdminShopPendingListView.as_view(), name='admin-shops-pending'),
    path('admin/shops/<int:pk>/approve/', AdminShopApproveView.as_view(), name='admin-shop-approve'),
    path('admin/shops/<int:pk>/reject/', AdminShopRejectView.as_view(), name='admin-shop-reject'),
    path('shop/', include(router.urls)),
]
