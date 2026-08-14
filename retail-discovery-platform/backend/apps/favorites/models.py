from django.db import models

class FavoriteStore(models.Model):
    """
    User favorite stores
    """
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='favorite_stores')
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, related_name='favorited_by')
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-added_at']
        unique_together = ('user', 'store')
        indexes = [
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.user.username} favored {self.store.name}"


class FavoriteCategory(models.Model):
    """
    User favorite product categories
    """
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='favorite_categories')
    category = models.ForeignKey('catalog.Category', on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-added_at']
        unique_together = ('user', 'category')
    
    def __str__(self):
        return f"{self.user.username} favored {self.category.name}"


class FavoriteProduct(models.Model):
    """
    User favorite products
    """
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='favorite_products')
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE, related_name='favorited_by')
    note = models.TextField(blank=True)
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-added_at']
        unique_together = ('user', 'product')
    
    def __str__(self):
        return f"{self.user.username} favored {self.product.name}"
