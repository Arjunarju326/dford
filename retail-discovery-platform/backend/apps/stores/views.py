from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from apps.accounts.models import User
from apps.flyers.models import Flyer
from .models import Store, StoreBranch
from .serializers import (
    ShopRegistrationSerializer,
    ShopDetailSerializer,
    ShopAdminSerializer,
    StoreBranchSerializer,
)
from .permissions import IsShopOwnerOrAdmin

class ShopRegistrationView(generics.CreateAPIView):
    """POST /api/v1/shop-registration/ — Shop registration."""
    queryset = Store.objects.all()
    serializer_class = ShopRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]


class ShopMeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/v1/shop/me/ — Authenticated user's shop."""
    serializer_class = ShopDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        store = Store.objects.filter(owner=self.request.user).first()
        if not store:
            raise generics.NotFound('No shop found for current account.')
        return store


class ShopBranchViewSet(viewsets.ModelViewSet):
    """GET/POST/PATCH/DELETE /api/v1/shop/branches/ — Shop branch management."""
    serializer_class = StoreBranchSerializer
    permission_classes = [IsShopOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return StoreBranch.objects.all()
        return StoreBranch.objects.filter(store__owner=user)

    def perform_create(self, serializer):
        store = Store.objects.filter(owner=self.request.user).first()
        if not store:
            raise permissions.PermissionDenied('You must own an approved shop to create branches.')
        serializer.save(store=store)


class AdminStatsView(APIView):
    """GET /api/v1/admin/stats/ — Platform statistics counters for Admin Panel."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_shops = Store.objects.count()
        approved_shops = Store.objects.filter(status='APPROVED').count()
        pending_shops = Store.objects.filter(status='PENDING_APPROVAL').count()
        rejected_shops = Store.objects.filter(status='REJECTED').count()
        total_branches = StoreBranch.objects.count()
        total_flyers = Flyer.objects.count()
        published_flyers = Flyer.objects.filter(status='PUBLISHED').count()
        total_users = User.objects.count()

        return Response({
            'total_shops': total_shops,
            'approved_shops': approved_shops,
            'pending_shops': pending_shops,
            'rejected_shops': rejected_shops,
            'total_branches': total_branches,
            'total_flyers': total_flyers,
            'published_flyers': published_flyers,
            'total_users': total_users,
        })


class AdminShopPendingListView(generics.ListAPIView):
    """GET /api/v1/admin/shops/pending/ — Pending Shop Approval Queue."""
    serializer_class = ShopAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Store.objects.filter(status='PENDING_APPROVAL').order_by('-created_at')


class AdminShopListView(generics.ListAPIView):
    """GET /api/v1/admin/shops/ — All Registered Shops Directory."""
    serializer_class = ShopAdminSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return Store.objects.all().order_by('-created_at')


class AdminShopApproveView(APIView):
    """POST /api/v1/admin/shops/{id}/approve/ — Admin approves shop."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        try:
            shop = Store.objects.get(pk=pk)
            shop.status = 'APPROVED'
            shop.is_active = True
            shop.approved_by = request.user
            shop.approved_at = timezone.now()
            shop.rejection_reason = ''
            shop.save()
            return Response({'message': f'Shop "{shop.name}" approved successfully.', 'shop': ShopDetailSerializer(shop).data})
        except Store.DoesNotExist:
            return Response({'error': 'Shop not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminShopRejectView(APIView):
    """POST /api/v1/admin/shops/{id}/reject/ — Admin rejects shop."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        reason = request.data.get('rejection_reason')
        if not reason:
            return Response({'error': 'rejection_reason is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            shop = Store.objects.get(pk=pk)
            shop.status = 'REJECTED'
            shop.is_active = False
            shop.rejection_reason = reason
            shop.save()
            return Response({'message': f'Shop "{shop.name}" rejected.', 'shop': ShopDetailSerializer(shop).data})
        except Store.DoesNotExist:
            return Response({'error': 'Shop not found.'}, status=status.HTTP_404_NOT_FOUND)
