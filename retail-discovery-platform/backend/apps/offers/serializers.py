from rest_framework import serializers
from .models import Offer, OfferCategory, OfferBranchAvailability

class OfferCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferCategory
        fields = ['id', 'name', 'description', 'icon', 'order', 'is_active']


class OfferBranchAvailabilitySerializer(serializers.ModelSerializer):
    branch_id = serializers.IntegerField(source='branch.id', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True)
    address = serializers.CharField(source='branch.address', read_only=True)
    city_name = serializers.CharField(source='branch.city.name', read_only=True)
    phone = serializers.CharField(source='branch.phone', read_only=True)
    latitude = serializers.DecimalField(source='branch.latitude', max_digits=9, decimal_places=6, read_only=True)
    longitude = serializers.DecimalField(source='branch.longitude', max_digits=9, decimal_places=6, read_only=True)

    class Meta:
        model = OfferBranchAvailability
        fields = [
            'id', 'branch_id', 'branch_name', 'address', 'city_name', 'phone',
            'latitude', 'longitude', 'status', 'updated_at'
        ]


class OfferListSerializer(serializers.ModelSerializer):
    store_name = serializers.SerializerMethodField()
    store_logo = serializers.SerializerMethodField()
    store_slug = serializers.SerializerMethodField()
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)

    class Meta:
        model = Offer
        fields = [
            'id', 'title', 'product', 'product_name', 'product_slug', 'store',
            'store_branch', 'store_name', 'store_logo', 'store_slug', 'original_price',
            'offer_price', 'discount_percentage', 'start_date', 'end_date', 'image_url',
            'status', 'created_at'
        ]

    def get_store_name(self, obj):
        if obj.store:
            return obj.store.name
        if obj.store_branch and obj.store_branch.store:
            return obj.store_branch.store.name
        return ''

    def get_store_logo(self, obj):
        if obj.store and obj.store.logo_url:
            return obj.store.logo_url
        if obj.store_branch and obj.store_branch.store and obj.store_branch.store.logo_url:
            return obj.store_branch.store.logo_url
        return ''

    def get_store_slug(self, obj):
        if obj.store:
            return obj.store.slug
        if obj.store_branch and obj.store_branch.store:
            return obj.store_branch.store.slug
        return ''


class OfferDetailSerializer(OfferListSerializer):
    branch_availabilities = OfferBranchAvailabilitySerializer(many=True, read_only=True)

    class Meta(OfferListSerializer.Meta):
        fields = OfferListSerializer.Meta.fields + [
            'description', 'coupon_code', 'terms_conditions', 'flyer', 'flyer_page',
            'branch_availabilities'
        ]
