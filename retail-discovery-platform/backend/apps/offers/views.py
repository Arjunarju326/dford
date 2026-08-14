from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Offer, OfferCategory
from .serializers import OfferListSerializer, OfferDetailSerializer, OfferCategorySerializer


class OfferViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/offers/       — active offers list
    GET /api/offers/{id}/  — offer detail
    """
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'store_branch', 'store_branch__store', 'product__category']
    search_fields = ['title', 'product__name', 'store_branch__store__name']
    ordering_fields = ['offer_price', 'discount_percentage', 'start_date', 'end_date']
    ordering = ['-start_date']

    def get_queryset(self):
        now = timezone.now()
        return (
            Offer.objects
            .filter(status='active', start_date__lte=now, end_date__gte=now)
            .select_related(
                'product', 'product__category',
                'store_branch', 'store_branch__store', 'store_branch__city',
            )
        )

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OfferDetailSerializer
        return OfferListSerializer


class OfferCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OfferCategory.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = OfferCategorySerializer
    permission_classes = [permissions.AllowAny]
