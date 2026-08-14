from django.contrib import admin
from .models import Store, StoreCategory, StoreBranch, StoreImage, StoreRating


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'is_featured', 'created_at')
    list_filter = ('is_active', 'is_featured')
    search_fields = ('name', 'slug', 'legal_name', 'email')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('name',)


@admin.register(StoreCategory)
class StoreCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


@admin.register(StoreBranch)
class StoreBranchAdmin(admin.ModelAdmin):
    list_display = ('store', 'name', 'city', 'is_active')
    list_filter = ('is_active', 'city')
    search_fields = ('store__name', 'name', 'address')
    select_related = ('store', 'city', 'locality')


@admin.register(StoreImage)
class StoreImageAdmin(admin.ModelAdmin):
    list_display = ('store', 'image_type', 'order')
    list_filter = ('image_type',)


@admin.register(StoreRating)
class StoreRatingAdmin(admin.ModelAdmin):
    list_display = ('store', 'user', 'rating', 'created_at')
    list_filter = ('rating',)
