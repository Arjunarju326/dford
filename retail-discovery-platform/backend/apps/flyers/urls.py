from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ShopFlyerViewSet,
    PublicFlyerListView,
    PublicFlyerDetailView,
    FlyerUploadAPIView,
    FlyerDealsListAPIView,
    FlyerDealsMetadataAPIView,
    FlyerDealsPageDetailAPIView,
    FlyerDealsSingleItemAPIView,
)

router = DefaultRouter()
router.register('shop/flyers', ShopFlyerViewSet, basename='shop-flyers')

urlpatterns = [
    # Required grid deals endpoints
    path('flyers/upload', FlyerUploadAPIView.as_view(), name='flyer-upload'),
    path('flyers/<int:pk>/pages/<int:page_number>', FlyerDealsPageDetailAPIView.as_view(), name='flyer-deals-page-detail'),
    path('flyers/<int:pk>', FlyerDealsMetadataAPIView.as_view(), name='flyer-deals-metadata'),
    path('flyers', FlyerDealsListAPIView.as_view(), name='flyer-deals-list'),
    path('flyer-items/<int:item_id>', FlyerDealsSingleItemAPIView.as_view(), name='flyer-single-item-detail'),
    
    # Public & legacy view routes
    path('flyers/', PublicFlyerListView.as_view(), name='public-flyer-list'),
    path('flyers/<str:id>/', PublicFlyerDetailView.as_view(), name='public-flyer-detail'),
    path('', include(router.urls)),
]
