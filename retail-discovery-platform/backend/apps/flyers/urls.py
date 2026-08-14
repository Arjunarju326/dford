from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShopFlyerViewSet,
    ShopFlyerSubmitView,
    AdminFlyerPendingListView,
    AdminFlyerApproveView,
    AdminFlyerRejectView,
    PublicFlyerListView,
    PublicFlyerDetailView,
)

router = DefaultRouter()
router.register('shop/flyers', ShopFlyerViewSet, basename='shop-flyers')

urlpatterns = [
    path('shop/flyers/<int:pk>/submit/', ShopFlyerSubmitView.as_view(), name='shop-flyer-submit'),
    path('admin/flyers/pending/', AdminFlyerPendingListView.as_view(), name='admin-flyers-pending'),
    path('admin/flyers/<int:pk>/approve/', AdminFlyerApproveView.as_view(), name='admin-flyer-approve'),
    path('admin/flyers/<int:pk>/reject/', AdminFlyerRejectView.as_view(), name='admin-flyer-reject'),
    path('flyers/', PublicFlyerListView.as_view(), name='public-flyer-list'),
    path('flyers/<str:id>/', PublicFlyerDetailView.as_view(), name='public-flyer-detail'),
    path('', include(router.urls)),
]
