from django.db import models
from django.utils import timezone

class Flyer(models.Model):
    """
    Flyer/Promotional document model
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PROCESSING', 'Processing'),
        ('PENDING_REVIEW', 'Pending Review'),
        ('PUBLISHED', 'Published'),
        ('REJECTED', 'Rejected'),
        ('EXPIRED', 'Expired'),
        ('ARCHIVED', 'Archived'),
    ]

    PROCESSING_STATUS_CHOICES = [
        ('UPLOADED', 'Uploaded'),
        ('PROCESSING', 'Processing'),
        ('PROCESSED', 'Processed'),
        ('FAILED', 'Failed'),
    ]

    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, related_name='flyers', null=True, blank=True)
    store_branch = models.ForeignKey('stores.StoreBranch', on_delete=models.CASCADE, related_name='flyers', null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    online_shopping_url = models.URLField(blank=True, null=True)

    # Timing
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()

    # Cover image & file
    cover_image_url = models.URLField(blank=True, null=True)
    thumbnail_url = models.URLField(blank=True, null=True)
    pdf_url = models.URLField(blank=True, null=True)
    page_count = models.IntegerField(default=1)

    # Status State Machines
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT', db_index=True)
    processing_status = models.CharField(max_length=20, choices=PROCESSING_STATUS_CHOICES, default='UPLOADED')
    processing_error = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)

    # Approval audit fields
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_flyers')
    approved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_flyers')
    approved_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['status', 'start_date', 'end_date']),
            models.Index(fields=['store', 'status']),
        ]

    def __str__(self):
        store_name = self.store.name if self.store else (self.store_branch.store.name if self.store_branch else "Store")
        return f"{self.title} - {store_name} ({self.status})"

    @property
    def is_publicly_visible(self):
        now = timezone.now()
        store_ok = False
        if self.store:
            store_ok = self.store.status == 'APPROVED' and self.store.is_active
        elif self.store_branch:
            store_ok = self.store_branch.store.status == 'APPROVED' and self.store_branch.store.is_active

        return (
            self.status == 'PUBLISHED' and
            store_ok and
            self.start_date <= now <= self.end_date
        )


class FlyerPage(models.Model):
    """
    Individual flyer page
    """
    flyer = models.ForeignKey(Flyer, on_delete=models.CASCADE, related_name='pages')
    page_number = models.IntegerField()
    image_url = models.URLField()
    thumbnail_url = models.URLField(blank=True, null=True)

    extracted_text = models.TextField(blank=True)
    extracted_data = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['flyer', 'page_number']
        unique_together = ('flyer', 'page_number')

    def __str__(self):
        return f"Page {self.page_number} of {self.flyer.title}"


class FlyerItem(models.Model):
    """
    Hotspot region on a flyer page linking to a Product & Offer
    """
    flyer_page = models.ForeignKey(FlyerPage, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('catalog.Product', on_delete=models.SET_NULL, null=True, blank=True, related_name='flyer_items')
    offer = models.ForeignKey('offers.Offer', on_delete=models.SET_NULL, null=True, blank=True, related_name='flyer_items')

    product_name = models.CharField(max_length=255)
    offer_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    # Hotspot percentage coordinates on flyer page image (0 to 100)
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    width = models.FloatField(default=0)
    height = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['flyer_page', 'id']

    def __str__(self):
        return f"{self.product_name} on Page {self.flyer_page.page_number}"


class FlyerProduct(models.Model):
    """
    Legacy product mapping model for backwards compatibility
    """
    flyer = models.ForeignKey(Flyer, on_delete=models.CASCADE, related_name='products')
    product = models.ForeignKey('catalog.Product', on_delete=models.SET_NULL, null=True, blank=True)
    page_number = models.IntegerField()
    product_name = models.CharField(max_length=255, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    position_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['flyer', 'page_number']


class FlyerView(models.Model):
    flyer = models.ForeignKey(Flyer, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['flyer', 'viewed_at']),
        ]
