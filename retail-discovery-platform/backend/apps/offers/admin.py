from django.contrib import admin
from .models import Offer, OfferCategory, OfferView, OfferClick


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('title', 'product', 'store_branch', 'offer_price', 'status', 'start_date', 'end_date')
    list_filter = ('status', 'start_date', 'end_date')
    search_fields = ('title', 'product__name', 'store_branch__store__name')
    ordering = ('-start_date',)
    readonly_fields = ('discount_percentage', 'created_at', 'updated_at')


@admin.register(OfferCategory)
class OfferCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'is_active')
    list_filter = ('is_active',)


@admin.register(OfferView)
class OfferViewAdmin(admin.ModelAdmin):
    list_display = ('offer', 'user', 'ip_address', 'viewed_at')
    list_filter = ('viewed_at',)
    readonly_fields = ('viewed_at',)


@admin.register(OfferClick)
class OfferClickAdmin(admin.ModelAdmin):
    list_display = ('offer', 'user', 'action', 'clicked_at')
    list_filter = ('action',)
