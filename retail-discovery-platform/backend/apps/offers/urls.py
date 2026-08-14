from rest_framework.routers import DefaultRouter
from .views import OfferViewSet, OfferCategoryViewSet

router = DefaultRouter()
router.register('', OfferViewSet, basename='offer')
router.register('categories', OfferCategoryViewSet, basename='offer-category')

urlpatterns = router.urls
