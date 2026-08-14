from rest_framework import serializers
from .models import ShoppingList, ShoppingListItem, SavedOffer


class ShoppingListItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.ReadOnlyField(source='product.thumbnail_url')

    class Meta:
        model = ShoppingListItem
        fields = [
            'id', 'shopping_list', 'product', 'product_name', 'product_image',
            'quantity', 'is_purchased', 'preferred_store', 'preferred_offer',
            'added_at', 'purchased_at',
        ]
        read_only_fields = ['added_at']


class ShoppingListSerializer(serializers.ModelSerializer):
    items = ShoppingListItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = ShoppingList
        fields = ['id', 'name', 'description', 'is_active', 'item_count', 'items', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_item_count(self, obj):
        return obj.items.count()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SavedOfferSerializer(serializers.ModelSerializer):
    offer_title = serializers.ReadOnlyField(source='offer.title')
    offer_price = serializers.ReadOnlyField(source='offer.offer_price')
    offer_image = serializers.ReadOnlyField(source='offer.image_url')
    end_date = serializers.ReadOnlyField(source='offer.end_date')

    class Meta:
        model = SavedOffer
        fields = [
            'id', 'offer', 'offer_title', 'offer_price', 'offer_image',
            'end_date', 'saved_at', 'is_notified',
        ]
        read_only_fields = ['saved_at', 'is_notified']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
