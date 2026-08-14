from django.contrib import admin
from .models import ShoppingList, ShoppingListItem, SavedOffer, ComparisonCart


@admin.register(ShoppingList)
class ShoppingListAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'is_active', 'created_at')
    search_fields = ('user__username', 'name')


@admin.register(ShoppingListItem)
class ShoppingListItemAdmin(admin.ModelAdmin):
    list_display = ('shopping_list', 'product', 'quantity', 'is_purchased')
    list_filter = ('is_purchased',)


@admin.register(SavedOffer)
class SavedOfferAdmin(admin.ModelAdmin):
    list_display = ('user', 'offer', 'saved_at', 'is_notified')
    list_filter = ('is_notified',)


@admin.register(ComparisonCart)
class ComparisonCartAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at', 'expires_at')
