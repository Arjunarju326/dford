from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from .models import Flyer, FlyerPage, FlyerItem
from .serializers import (
    FlyerListSerializer,
    FlyerDetailSerializer,
    FlyerCreateSerializer,
)

class ShopFlyerViewSet(viewsets.ModelViewSet):
    """GET/POST/PATCH/DELETE /api/v1/shop/flyers/ — Shop flyer management."""
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FlyerCreateSerializer
        if self.action == 'retrieve':
            return FlyerDetailSerializer
        return FlyerListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Flyer.objects.all()
        return Flyer.objects.filter(
            Q(store__owner=user) | Q(created_by=user)
        ).distinct()

    def perform_create(self, serializer):
        from apps.stores.models import Store
        store = Store.objects.filter(owner=self.request.user).first()
        serializer.save(
            store=store,
            created_by=self.request.user,
            status='PUBLISHED',  # Direct publishing without admin verification requirement
            processing_status='PROCESSED',
            published_at=timezone.now()
        )


class ShopFlyerSubmitView(APIView):
    """POST /api/v1/shop/flyers/{id}/submit/ — Direct publish flyer."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            flyer = Flyer.objects.get(pk=pk)
            if not request.user.is_staff and flyer.store and flyer.store.owner != request.user:
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            flyer.status = 'PUBLISHED'
            flyer.published_at = timezone.now()
            flyer.save()
            return Response({'message': 'Flyer published directly.', 'flyer': FlyerListSerializer(flyer).data})
        except Flyer.DoesNotExist:
            return Response({'error': 'Flyer not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminFlyerPendingListView(generics.ListAPIView):
    serializer_class = FlyerDetailSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Flyer.objects.filter(status='PENDING_REVIEW').order_by('-created_at')


class AdminFlyerApproveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            flyer = Flyer.objects.get(pk=pk)
            flyer.status = 'PUBLISHED'
            flyer.approved_by = request.user
            flyer.approved_at = timezone.now()
            flyer.published_at = timezone.now()
            flyer.rejection_reason = ''
            flyer.save()
            return Response({'message': f'Flyer "{flyer.title}" published successfully.', 'flyer': FlyerDetailSerializer(flyer).data})
        except Flyer.DoesNotExist:
            return Response({'error': 'Flyer not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminFlyerRejectView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        reason = request.data.get('rejection_reason')
        if not reason:
            return Response({'error': 'rejection_reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            flyer = Flyer.objects.get(pk=pk)
            flyer.status = 'REJECTED'
            flyer.rejection_reason = reason
            flyer.save()
            return Response({'message': f'Flyer "{flyer.title}" rejected.', 'flyer': FlyerDetailSerializer(flyer).data})
        except Flyer.DoesNotExist:
            return Response({'error': 'Flyer not found.'}, status=status.HTTP_404_NOT_FOUND)


class PublicFlyerListView(generics.ListAPIView):
    """GET /api/v1/flyers/ — Public listing of published active flyers."""
    serializer_class = FlyerListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        now = timezone.now()
        return Flyer.objects.filter(
            status='PUBLISHED',
            start_date__lte=now,
            end_date__gte=now
        ).filter(
            Q(store__status='APPROVED', store__is_active=True) |
            Q(store_branch__store__status='APPROVED', store_branch__store__is_active=True)
        ).select_related('store', 'store_branch').order_by('-start_date')


class PublicFlyerDetailView(generics.RetrieveAPIView):
    """GET /api/v1/flyers/{slug}/ — Interactive Flyer detail viewer."""
    serializer_class = FlyerDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

    def get_object(self):
        lookup_val = self.kwargs.get('id')
        queryset = Flyer.objects.prefetch_related('pages__items').select_related('store', 'store_branch')
        if str(lookup_val).isdigit():
            flyer = queryset.filter(id=int(lookup_val)).first()
        else:
            flyer = queryset.filter(id=lookup_val).first()

        if not flyer:
            raise generics.NotFound('Flyer not found.')
        return flyer
