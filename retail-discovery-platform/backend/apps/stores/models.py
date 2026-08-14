from django.db import models
from django.utils.text import slugify

class Store(models.Model):
    """
    Main Store / Shop model - represents a retail brand/chain
    """
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PENDING_APPROVAL', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('SUSPENDED', 'Suspended'),
        ('ARCHIVED', 'Archived'),
    ]

    owner = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='owned_stores')
    owner_name = models.CharField(max_length=255, blank=True)
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)
    legal_name = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True, null=True)
    banner_url = models.URLField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    # Location details for primary shop headquarters
    country = models.ForeignKey('locations.Country', on_delete=models.SET_NULL, null=True, blank=True)
    state = models.ForeignKey('locations.State', on_delete=models.SET_NULL, null=True, blank=True)
    city = models.ForeignKey('locations.City', on_delete=models.SET_NULL, null=True, blank=True)
    locality = models.ForeignKey('locations.Locality', on_delete=models.SET_NULL, null=True, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=500, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Status State Machine & Approval Workflow
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='PENDING_APPROVAL', db_index=True)
    rejection_reason = models.TextField(blank=True)
    approved_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_stores')
    approved_at = models.DateTimeField(null=True, blank=True)

    is_active = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.status})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class StoreCategory(models.Model):
    """
    Categories that a store can belong to (e.g., Grocery, Electronics, Fashion)
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Store Categories'
    
    def __str__(self):
        return self.name


class StoreBranch(models.Model):
    """
    Individual store branch/location
    """
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='branches')
    name = models.CharField(max_length=255)
    slug = models.SlugField()
    country = models.ForeignKey('locations.Country', on_delete=models.SET_NULL, null=True, blank=True)
    state = models.ForeignKey('locations.State', on_delete=models.SET_NULL, null=True, blank=True)
    city = models.ForeignKey('locations.City', on_delete=models.PROTECT)
    locality = models.ForeignKey('locations.Locality', on_delete=models.SET_NULL, null=True, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=500)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    phone = models.CharField(max_length=20, blank=True)
    opening_time = models.TimeField(null=True, blank=True)
    closing_time = models.TimeField(null=True, blank=True)
    opening_hours = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('store', 'slug', 'city')
        ordering = ['store', 'city', 'name']
    
    def __str__(self):
        return f"{self.store.name} - {self.name}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class StoreImage(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()
    image_type = models.CharField(
        max_length=20,
        choices=[
            ('logo', 'Logo'),
            ('banner', 'Banner'),
            ('interior', 'Interior'),
            ('exterior', 'Exterior'),
            ('other', 'Other'),
        ],
        default='other'
    )
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.store.name} - {self.image_type}"


class StoreRating(models.Model):
    store = models.ForeignKey(Store, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('store', 'user')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.store.name} - {self.rating}★ by {self.user.username}"
