from rest_framework import serializers
from .models import Store, StoreBranch, StoreCategory, StoreImage, StoreRating

class StoreBranchSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    locality_name = serializers.CharField(source='locality.name', read_only=True)

    class Meta:
        model = StoreBranch
        fields = [
            'id', 'store', 'name', 'slug', 'country', 'state', 'city', 'city_name',
            'locality', 'locality_name', 'postal_code', 'address', 'latitude', 'longitude',
            'phone', 'opening_time', 'closing_time', 'opening_hours', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'store', 'slug', 'created_at']


class ShopRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Store
        fields = [
            'name', 'legal_name', 'owner_name', 'email', 'phone', 'description',
            'logo_url', 'banner_url', 'website', 'country', 'state', 'city',
            'locality', 'postal_code', 'address', 'latitude', 'longitude'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['owner'] = user
        validated_data['status'] = 'PENDING_APPROVAL'
        validated_data['is_active'] = False
        return super().create(validated_data)


class ShopDetailSerializer(serializers.ModelSerializer):
    branches = StoreBranchSerializer(many=True, read_only=True)
    branch_count = serializers.IntegerField(source='branches.count', read_only=True)

    class Meta:
        model = Store
        fields = [
            'id', 'name', 'slug', 'legal_name', 'owner_name', 'email', 'phone',
            'description', 'logo_url', 'banner_url', 'website', 'country', 'state',
            'city', 'locality', 'postal_code', 'address', 'latitude', 'longitude',
            'status', 'rejection_reason', 'is_active', 'is_featured', 'branches',
            'branch_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'status', 'rejection_reason', 'is_active', 'created_at', 'updated_at']


class ShopAdminSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Store
        fields = '__all__'
