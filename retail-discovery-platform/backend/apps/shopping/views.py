from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from .models import ShoppingList, ShoppingListItem, SavedOffer
from .serializers import ShoppingListSerializer, ShoppingListItemSerializer, SavedOfferSerializer


class ShoppingListViewSet(viewsets.ModelViewSet):
    """
    GET/POST /api/shopping/lists/
    GET/PATCH/DELETE /api/shopping/lists/{id}/
    """
    serializer_class = ShoppingListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShoppingList.objects.filter(
            user=self.request.user, is_active=True
        ).prefetch_related('items__product')


class ShoppingListItemViewSet(viewsets.ModelViewSet):
    serializer_class = ShoppingListItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ShoppingListItem.objects.filter(
            shopping_list__user=self.request.user
        ).select_related('product', 'preferred_store', 'preferred_offer')


class SavedOfferViewSet(viewsets.ModelViewSet):
    """
    GET /api/shopping/saved-offers/
    POST /api/shopping/saved-offers/
    DELETE /api/shopping/saved-offers/{id}/
    """
    serializer_class = SavedOfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedOffer.objects.filter(
            user=self.request.user
        ).select_related('offer', 'offer__store_branch__store')
