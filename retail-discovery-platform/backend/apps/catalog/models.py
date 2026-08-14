from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    """
    Product category with hierarchical structure
    """
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120)  # unique per parent via unique_together
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    icon = models.CharField(max_length=50, blank=True)
    image_url = models.URLField(blank=True, null=True)  # Cloudinary URL
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'name']
        verbose_name_plural = 'Categories'
        unique_together = ('slug', 'parent')
    
    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    @property
    def breadcrumb(self):
        """Get category breadcrumb path"""
        path = [self.name]
        current = self.parent
        while current:
            path.insert(0, current.name)
            current = current.parent
        return ' > '.join(path)


class Brand(models.Model):
    """
    Product brand/manufacturer
    """
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True, null=True)  # Cloudinary URL
    website = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    """
    Product model - represents individual items
    """
    name = models.CharField(max_length=255)
    slug = models.SlugField()
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    barcode = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    image_url = models.URLField(blank=True, null=True)  # Cloudinary URL
    thumbnail_url = models.URLField(blank=True, null=True)  # Cloudinary thumbnail
    
    # Product specifications
    unit = models.CharField(max_length=50, blank=True)  # e.g., "500g", "1L"
    size = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=50, blank=True)
    
    # Availability
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'name']
        unique_together = ('slug', 'category')
        indexes = [
            models.Index(fields=['slug', 'category']),
            models.Index(fields=['sku']),
            models.Index(fields=['barcode']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.sku})"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ProductImage(models.Model):
    """
    Additional product images
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField()  # Cloudinary URL
    thumbnail_url = models.URLField(blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"Image for {self.product.name}"


class ProductSpecification(models.Model):
    """
    Product-specific attributes
    """
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='specifications')
    key = models.CharField(max_length=100)
    value = models.CharField(max_length=255)
    
    class Meta:
        unique_together = ('product', 'key')
    
    def __str__(self):
        return f"{self.product.name}: {self.key}"
