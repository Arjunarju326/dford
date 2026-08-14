from rest_framework.routers import DefaultRouter
from .views import CountryViewSet, StateViewSet, CityViewSet, LocalityViewSet

router = DefaultRouter()
router.register('countries', CountryViewSet, basename='country')
router.register('states', StateViewSet, basename='state')
router.register('cities', CityViewSet, basename='city')
router.register('localities', LocalityViewSet, basename='locality')

urlpatterns = router.urls
