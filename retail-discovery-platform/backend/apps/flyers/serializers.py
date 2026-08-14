from rest_framework import serializers
from django.utils import timezone
from .models import Flyer, FlyerPage, FlyerItem

class FlyerItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlyerItem
        fields = [
            'id', 'flyer_page', 'product', 'offer', 'product_name',
            'offer_price', 'original_price', 'discount_percentage',
            'x', 'y', 'width', 'height'
        ]


class FlyerPageSerializer(serializers.ModelSerializer):
    items = FlyerItemSerializer(many=True, read_only=True)

    class Meta:
        model = FlyerPage
        fields = ['id', 'page_number', 'image_url', 'thumbnail_url', 'extracted_text', 'items']


class FlyerListSerializer(serializers.ModelSerializer):
    store_name = serializers.SerializerMethodField()
    store_logo = serializers.SerializerMethodField()
    store_slug = serializers.SerializerMethodField()

    class Meta:
        model = Flyer
        fields = [
            'id', 'title', 'description', 'store', 'store_branch', 'store_name',
            'store_logo', 'store_slug', 'start_date', 'end_date', 'cover_image_url',
            'thumbnail_url', 'pdf_url', 'page_count', 'status', 'processing_status',
            'online_shopping_url', 'created_at'
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


class FlyerDetailSerializer(FlyerListSerializer):
    pages = FlyerPageSerializer(many=True, read_only=True)

    class Meta(FlyerListSerializer.Meta):
        fields = FlyerListSerializer.Meta.fields + ['pages']


class FlyerCreateSerializer(serializers.ModelSerializer):
    items = FlyerItemSerializer(many=True, required=False)

    class Meta:
        model = Flyer
        fields = [
            'id', 'store', 'store_branch', 'title', 'description', 'start_date',
            'end_date', 'cover_image_url', 'pdf_url', 'online_shopping_url', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user
        validated_data['created_by'] = user
        validated_data['status'] = 'PUBLISHED'  # Direct publishing without admin verification
        validated_data['processing_status'] = 'PROCESSED'
        validated_data['published_at'] = timezone.now()
        flyer = super().create(validated_data)
        
        if flyer.cover_image_url:
            page = FlyerPage.objects.create(
                flyer=flyer,
                page_number=1,
                image_url=flyer.cover_image_url,
                thumbnail_url=flyer.cover_image_url
            )
            for item in items_data:
                FlyerItem.objects.create(flyer_page=page, **item)
        return flyer
