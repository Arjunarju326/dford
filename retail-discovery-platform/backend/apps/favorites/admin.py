from django.contrib import admin
from .models import FavoriteStore, FavoriteCategory, FavoriteProduct


@admin.register(FavoriteStore)
class FavoriteStoreAdmin(admin.ModelAdmin):
    list_display = ('user', 'store', 'added_at')
    search_fields = ('user__username', 'store__name')


@admin.register(FavoriteCategory)
class FavoriteCategoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'added_at')


@admin.register(FavoriteProduct)
class FavoriteProductAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'added_at')
    search_fields = ('user__username', 'product__name')
