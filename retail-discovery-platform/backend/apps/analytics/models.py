from django.db import models

class PageView(models.Model):
    """
    Track page views across the application
    """
    PAGE_TYPES = [
        ('home', 'Home'),
        ('store_list', 'Store List'),
        ('store_detail', 'Store Detail'),
        ('category_list', 'Category List'),
        ('product_list', 'Product List'),
        ('product_detail', 'Product Detail'),
        ('offer_list', 'Offer List'),
        ('offer_detail', 'Offer Detail'),
        ('flyer_list', 'Flyer List'),
        ('flyer_viewer', 'Flyer Viewer'),
        ('search', 'Search'),
        ('shopping_list', 'Shopping List'),
        ('favorites', 'Favorites'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    page_type = models.CharField(max_length=50, choices=PAGE_TYPES)
    page_url = models.CharField(max_length=500)
    referrer = models.CharField(max_length=500, blank=True)
    
    # Related objects
    store = models.ForeignKey('stores.Store', on_delete=models.SET_NULL, null=True, blank=True)
    category = models.ForeignKey('catalog.Category', on_delete=models.SET_NULL, null=True, blank=True)
    product = models.ForeignKey('catalog.Product', on_delete=models.SET_NULL, null=True, blank=True)
    
    session_id = models.CharField(max_length=100, blank=True, db_index=True)
    user_agent = models.TextField(blank=True)
    
    viewed_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['user', 'viewed_at']),
            models.Index(fields=['page_type', 'viewed_at']),
        ]
    
    def __str__(self):
        return f"View of {self.page_type} at {self.viewed_at}"


class SearchQuery(models.Model):
    """
    Track user search queries
    """
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    query = models.CharField(max_length=255, db_index=True)
    location = models.ForeignKey('locations.City', on_delete=models.SET_NULL, null=True, blank=True)
    filters = models.JSONField(default=dict, blank=True)
    results_count = models.IntegerField(default=0)
    
    searched_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        ordering = ['-searched_at']
        indexes = [
            models.Index(fields=['query']),
            models.Index(fields=['searched_at']),
        ]
    
    def __str__(self):
        return f'Search: "{self.query}"'


class UserSession(models.Model):
    """
    Track user sessions for analytics
    """
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='sessions')
    session_id = models.CharField(max_length=100, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(null=True, blank=True)
    
    page_views = models.IntegerField(default=0)
    actions = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"Session {self.session_id}"


class DailyAnalytics(models.Model):
    """
    Aggregated daily analytics
    """
    date = models.DateField(unique=True, db_index=True)
    
    # Traffic
    unique_visitors = models.IntegerField(default=0)
    total_page_views = models.IntegerField(default=0)
    total_sessions = models.IntegerField(default=0)
    
    # Engagement
    total_searches = models.IntegerField(default=0)
    total_offers_viewed = models.IntegerField(default=0)
    total_offers_saved = models.IntegerField(default=0)
    total_flyers_viewed = models.IntegerField(default=0)
    
    # User actions
    new_users = models.IntegerField(default=0)
    new_shopping_lists = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
    
    def __str__(self):
        return f"Analytics for {self.date}"
