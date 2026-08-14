from django.db import models
from django.utils import timezone
from decimal import Decimal

class Offer(models.Model):
    """
    Promotion/Offer model - special prices at specific stores or store chains
    """
    OFFER_STATUS = [
        ('DRAFT', 'Draft'),
        ('PENDING_REVIEW', 'Pending Review'),
        ('PUBLISHED', 'Published'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
        ('ARCHIVED', 'Archived'),
    ]
    
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, related_name='offers', null=True, blank=True)
    store_branch = models.ForeignKey('stores.StoreBranch', on_delete=models.CASCADE, related_name='offers', null=True, blank=True)
    product = models.ForeignKey('catalog.Product', on_delete=models.CASCADE, related_name='offers')
    flyer = models.ForeignKey('flyers.Flyer', on_delete=models.SET_NULL, null=True, blank=True, related_name='offers')
    flyer_page = models.ForeignKey('flyers.FlyerPage', on_delete=models.SET_NULL, null=True, blank=True, related_name='offers')
    
    # Pricing
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    offer_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Details
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    coupon_code = models.CharField(max_length=50, blank=True)
    terms_conditions = models.TextField(blank=True)
    
    # Timing
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    # Images
    image_url = models.URLField(blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=OFFER_STATUS, default='PUBLISHED', db_index=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['product', 'status']),
            models.Index(fields=['start_date', 'end_date', 'status']),
        ]
    
    def __str__(self):
        store_label = self.store.name if self.store else (self.store_branch.name if self.store_branch else "Store")
        return f"{self.product.name} - {store_label} - ₹{self.offer_price}"
    
    def save(self, *args, **kwargs):
        if self.original_price and self.original_price > 0:
            discount = ((self.original_price - self.offer_price) / self.original_price) * 100
            self.discount_percentage = Decimal(discount).quantize(Decimal('0.01'))
        super().save(*args, **kwargs)
    
    @property
    def is_active(self):
        now = timezone.now()
        return (self.status == 'PUBLISHED' and self.start_date <= now <= self.end_date)
    
    @property
    def savings(self):
        return self.original_price - self.offer_price


class OfferBranchAvailability(models.Model):
    """
    Branch-level availability for an offer.
    """
    AVAILABILITY_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('LIMITED', 'Limited Stock'),
        ('UNAVAILABLE', 'Out of Stock'),
        ('UNKNOWN', 'Availability Not Confirmed'),
    ]

    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='branch_availabilities')
    branch = models.ForeignKey('stores.StoreBranch', on_delete=models.CASCADE, related_name='offer_availabilities')
    status = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='UNKNOWN')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('offer', 'branch')
        ordering = ['branch', 'offer']

    def __str__(self):
        return f"{self.offer.product.name} at {self.branch.name}: {self.status}"


class OfferCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Offer Categories'
    
    def __str__(self):
        return self.name


class OfferView(models.Model):
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['offer', 'viewed_at']),
        ]


class OfferClick(models.Model):
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='clicks')
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(
        max_length=50,
        choices=[
            ('view', 'View'),
            ('save', 'Save'),
            ('share', 'Share'),
            ('copy_coupon', 'Copy Coupon'),
        ]
    )
    clicked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-clicked_at']
        indexes = [
            models.Index(fields=['offer', 'action']),
        ]
