from django.db import models

class ShoppingList(models.Model):
    """
    User shopping list
    """
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='shopping_lists')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        unique_together = ('user', 'name')
    
    def __str__(self):
        return f"{self.user.username} - {self.name}"


class ShoppingListItem(models.Model):
    """
    Items in a shopping list
    """
    shopping_list = models.ForeignKey(ShoppingList, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    is_purchased = models.BooleanField(default=False)
    
    # Optional preferred store/offer
    preferred_store = models.ForeignKey('stores.Store', on_delete=models.SET_NULL, null=True, blank=True)
    preferred_offer = models.ForeignKey('offers.Offer', on_delete=models.SET_NULL, null=True, blank=True)
    
    added_at = models.DateTimeField(auto_now_add=True)
    purchased_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['added_at']
        unique_together = ('shopping_list', 'product')
    
    def __str__(self):
        return f"{self.shopping_list.name} - {self.product.name}"


class SavedOffer(models.Model):
    """
    User saved offers/favorites
    """
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='saved_offers')
    offer = models.ForeignKey('offers.Offer', on_delete=models.CASCADE, related_name='saved_by_users')
    is_notified = models.BooleanField(default=False)
    saved_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-saved_at']
        unique_together = ('user', 'offer')
        indexes = [
            models.Index(fields=['user', 'is_notified']),
        ]
    
    def __str__(self):
        return f"{self.user.username} saved {self.offer.id}"


class ComparisonCart(models.Model):
    """
    User comparison cart for comparing offers across stores
    """
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='comparison_carts')
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ('user', 'product')
    
    def __str__(self):
        return f"{self.user.username} - {self.product.name}"
