from django.contrib import admin
from .models import Flyer, FlyerPage, FlyerProduct, FlyerView


class FlyerPageInline(admin.TabularInline):
    model = FlyerPage
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Flyer)
class FlyerAdmin(admin.ModelAdmin):
    list_display = ('title', 'store_branch', 'status', 'start_date', 'end_date', 'page_count')
    list_filter = ('status', 'start_date')
    search_fields = ('title', 'store_branch__store__name')
    ordering = ('-start_date',)
    inlines = [FlyerPageInline]


@admin.register(FlyerPage)
class FlyerPageAdmin(admin.ModelAdmin):
    list_display = ('flyer', 'page_number', 'created_at')
    list_filter = ('flyer',)


@admin.register(FlyerProduct)
class FlyerProductAdmin(admin.ModelAdmin):
    list_display = ('flyer', 'product', 'product_name', 'page_number', 'price')
    search_fields = ('product__name', 'product_name')
