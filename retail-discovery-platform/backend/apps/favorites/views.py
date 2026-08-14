from rest_framework import viewsets, permissions
from .models import FavoriteStore, FavoriteCategory, FavoriteProduct
from .serializers import FavoriteStoreSerializer, FavoriteCategorySerializer, FavoriteProductSerializer


class FavoriteStoreViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteStoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteStore.objects.filter(user=self.request.user).select_related('store')


class FavoriteCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteCategory.objects.filter(user=self.request.user).select_related('category')


class FavoriteProductViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteProduct.objects.filter(user=self.request.user).select_related('product')
