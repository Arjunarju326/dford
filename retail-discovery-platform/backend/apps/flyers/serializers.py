from rest_framework import serializers
from django.utils import timezone
from .models import Flyer, FlyerPage, FlyerItem

class FlyerItemSerializer(serializers.ModelSerializer):
    store_branch_name = serializers.CharField(source='store_branch.name', read_only=True)
    name = serializers.CharField(required=False, allow_blank=True)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = FlyerItem
        fields = [
            'id', 'flyer', 'flyer_page', 'product', 'offer', 'store_branch', 'store_branch_name',
            'name', 'product_name', 'item_category', 'offer_price', 'original_price', 'mrp',
            'savings', 'discount_percentage', 'deal_type', 'deal_text',
            'bbox_x', 'bbox_y', 'bbox_w', 'bbox_h', 'x', 'y', 'width', 'height'
        ]

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get('name'):
            ret['name'] = instance.product_name or "Promotional Item"
        if ret.get('mrp') is None:
            ret['mrp'] = instance.original_price
        return ret


class FlyerDealsItemSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    mrp = serializers.SerializerMethodField()

    class Meta:
        model = FlyerItem
        fields = [
            'id', 'name', 'offer_price', 'mrp', 'deal_text',
            'bbox_x', 'bbox_y', 'bbox_w', 'bbox_h',
            'item_category', 'savings', 'deal_type'
        ]

    def get_name(self, obj):
        return obj.name or obj.product_name or "Deal Item"

    def get_mrp(self, obj):
        return obj.mrp or obj.original_price


class FlyerPageSerializer(serializers.ModelSerializer):
    items = FlyerItemSerializer(many=True, read_only=True)

    class Meta:
        model = FlyerPage
        fields = ['id', 'page_number', 'image_url', 'thumbnail_url', 'extracted_text', 'items']


class FlyerListSerializer(serializers.ModelSerializer):
    store_name = serializers.SerializerMethodField()
    store_logo = serializers.SerializerMethodField()
    store_slug = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Flyer
        fields = [
            'id', 'title', 'description', 'store', 'store_branch', 'branches', 'category', 'category_name', 'store_name',
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
            'id', 'store', 'store_branch', 'branches', 'category', 'title', 'description', 'start_date',
            'end_date', 'cover_image_url', 'pdf_url', 'online_shopping_url', 'items'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        branches_data = validated_data.pop('branches', [])
        user = self.context['request'].user
        validated_data['created_by'] = user
        validated_data['status'] = 'PUBLISHED'  # Direct publishing without admin verification
        validated_data['processing_status'] = 'PROCESSED'
        validated_data['published_at'] = timezone.now()
        flyer = super().create(validated_data)

        if branches_data:
            flyer.branches.set(branches_data)

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
