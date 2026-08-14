from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import Country, State, City, Locality
from .serializers import CountrySerializer, StateSerializer, CitySerializer, LocalitySerializer


class CountryViewSet(viewsets.ReadOnlyModelViewSet):
    """List countries. GET /api/locations/countries/"""
    queryset = Country.objects.filter(is_active=True).order_by('name')
    serializer_class = CountrySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'code']


class StateViewSet(viewsets.ReadOnlyModelViewSet):
    """List states filtered by country. GET /api/locations/states/?country=1"""
    queryset = State.objects.filter(is_active=True).select_related('country')
    serializer_class = StateSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['country']
    search_fields = ['name']


class CityViewSet(viewsets.ReadOnlyModelViewSet):
    """List cities. GET /api/locations/cities/?state=1"""
    queryset = City.objects.filter(is_active=True).select_related('state__country')
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['state', 'state__country']
    search_fields = ['name', 'slug']
    lookup_field = 'slug'


class LocalityViewSet(viewsets.ReadOnlyModelViewSet):
    """List localities. GET /api/locations/localities/?city=1"""
    queryset = Locality.objects.filter(is_active=True).select_related('city__state__country')
    serializer_class = LocalitySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['city']
    search_fields = ['name', 'postal_code']
