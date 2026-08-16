from django.db import models

class Notification(models.Model):
    """
    Notification model for user alerts
    """
    NOTIFICATION_TYPES = [
        ('offer_available', 'Offer Available'),
        ('price_drop', 'Price Drop'),
        ('new_flyer', 'New Flyer'),
        ('store_update', 'Store Update'),
        ('custom', 'Custom'),
    ]
    
    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('push', 'Push'),
        ('sms', 'SMS'),
        ('in_app', 'In-App'),
    ]
    
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    
    # Related objects
    offer = models.ForeignKey('offers.Offer', on_delete=models.SET_NULL, null=True, blank=True)
    flyer = models.ForeignKey('flyers.Flyer', on_delete=models.SET_NULL, null=True, blank=True)
    store = models.ForeignKey('stores.Store', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['is_sent', 'created_at']),
        ]
    
    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"


class NotificationTemplate(models.Model):
    """
    Email/notification templates
    """
    name = models.CharField(max_length=100, unique=True)
    subject = models.CharField(max_length=255)
    body = models.TextField()
    variables = models.JSONField(default=list, blank=True)  # List of variable placeholders
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class Announcement(models.Model):
    """
    Broadcast announcement by admins to all users
    """
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_by = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='announcements')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

