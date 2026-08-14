from rest_framework import serializers
from .models import FavoriteStore, FavoriteCategory, FavoriteProduct


class FavoriteStoreSerializer(serializers.ModelSerializer):
    store_name = serializers.ReadOnlyField(source='store.name')
    store_logo = serializers.ReadOnlyField(source='store.logo_url')
    store_slug = serializers.ReadOnlyField(source='store.slug')

    class Meta:
        model = FavoriteStore
        fields = ['id', 'store', 'store_name', 'store_logo', 'store_slug', 'added_at']
        read_only_fields = ['added_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class FavoriteCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_slug = serializers.ReadOnlyField(source='category.slug')

    class Meta:
        model = FavoriteCategory
        fields = ['id', 'category', 'category_name', 'category_slug', 'added_at']
        read_only_fields = ['added_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class FavoriteProductSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_image = serializers.ReadOnlyField(source='product.thumbnail_url')

    class Meta:
        model = FavoriteProduct
        fields = ['id', 'product', 'product_name', 'product_image', 'note', 'added_at']
        read_only_fields = ['added_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
