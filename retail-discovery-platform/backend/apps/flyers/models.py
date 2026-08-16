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
    branches = models.ManyToManyField('stores.StoreBranch', related_name='multi_flyers', blank=True)
    category = models.ForeignKey('catalog.Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='flyers')
    title = models.CharField(max_length=255)
    store_name = models.CharField(max_length=255, blank=True, default='')
    store_logo_url = models.URLField(blank=True, null=True)
    category_slug = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField(blank=True)
    online_shopping_url = models.URLField(blank=True, null=True)

    # Timing
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_to = models.DateTimeField(null=True, blank=True)

    # Cover image & file
    cover_image_url = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True, null=True)
    image_width = models.IntegerField(default=0, null=True, blank=True)
    image_height = models.IntegerField(default=0, null=True, blank=True)
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
    image_width = models.IntegerField(default=0, null=True, blank=True)
    image_height = models.IntegerField(default=0, null=True, blank=True)

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
    flyer = models.ForeignKey(Flyer, on_delete=models.CASCADE, related_name='direct_items', null=True, blank=True)
    flyer_page = models.ForeignKey(FlyerPage, on_delete=models.CASCADE, related_name='items', null=True, blank=True)
    product = models.ForeignKey('catalog.Product', on_delete=models.SET_NULL, null=True, blank=True, related_name='flyer_items')
    offer = models.ForeignKey('offers.Offer', on_delete=models.SET_NULL, null=True, blank=True, related_name='flyer_items')
    store_branch = models.ForeignKey('stores.StoreBranch', on_delete=models.SET_NULL, null=True, blank=True, related_name='flyer_items')
    available_branches = models.ManyToManyField('stores.StoreBranch', blank=True, related_name='item_flyer_items')

    name = models.CharField(max_length=255, blank=True, default='')
    product_name = models.CharField(max_length=255, blank=True, default='')
    item_category = models.CharField(max_length=255, blank=True, default='')
    offer_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    mrp = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    savings = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    deal_type = models.CharField(max_length=50, blank=True, default='flat_discount')
    deal_text = models.CharField(max_length=255, blank=True, default='')

    # Grid Indices
    row_index = models.IntegerField(default=0)
    col_index = models.IntegerField(default=0)

    # Normalized Bounding Box fractions [0, 1] relative to image width/height
    bbox_x = models.FloatField(default=0.0)
    bbox_y = models.FloatField(default=0.0)
    bbox_w = models.FloatField(default=0.0)
    bbox_h = models.FloatField(default=0.0)

    # Percentage hotspot coordinates (0 to 100)
    x = models.FloatField(default=0)
    y = models.FloatField(default=0)
    width = models.FloatField(default=0)
    height = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.name or self.product_name} (#FL-{self.id})"


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
