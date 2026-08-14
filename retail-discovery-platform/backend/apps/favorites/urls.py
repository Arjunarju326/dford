from rest_framework.routers import DefaultRouter
from .views import FavoriteStoreViewSet, FavoriteCategoryViewSet, FavoriteProductViewSet

router = DefaultRouter()
router.register('stores', FavoriteStoreViewSet, basename='favorite-store')
router.register('categories', FavoriteCategoryViewSet, basename='favorite-category')
router.register('products', FavoriteProductViewSet, basename='favorite-product')

urlpatterns = router.urls
