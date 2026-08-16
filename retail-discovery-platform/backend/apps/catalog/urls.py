from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductDetailView,
    ProductAvailabilityView,
    ProductRelatedView,
    GlobalSearchView,
    CategoryViewSet,
)

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('products/<slug:slug>/availability/', ProductAvailabilityView.as_view(), name='product-availability'),
    path('products/<slug:slug>/related/', ProductRelatedView.as_view(), name='product-related'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('', include(router.urls)),
]
