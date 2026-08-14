from rest_framework.routers import DefaultRouter
from .views import ShoppingListViewSet, ShoppingListItemViewSet, SavedOfferViewSet

router = DefaultRouter()
router.register('lists', ShoppingListViewSet, basename='shopping-list')
router.register('list-items', ShoppingListItemViewSet, basename='shopping-list-item')
router.register('saved-offers', SavedOfferViewSet, basename='saved-offer')

urlpatterns = router.urls
