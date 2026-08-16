from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Extended User model with additional fields for the retail platform
    """
    USER_TYPES = (
        ('guest', 'Guest'),
        ('user', 'Registered User'),
        ('content_manager', 'Content Manager'),
        ('admin', 'Administrator'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='user')
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    preferred_location = models.ForeignKey('locations.City', on_delete=models.SET_NULL, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    notification_preferences = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('User')
        verbose_name_plural = _('Users')
    
    def has_shop_permission(self, perm_code, store=None, branch=None):
        """
        Super admin automatically has all permissions.
        Otherwise checks if the permission is explicitly assigned to user for store/branch.
        """
        if self.is_superuser or self.is_staff or self.user_type == 'admin':
            return True

        q = self.user_shop_permissions.filter(permission__code=perm_code, is_granted=True)
        if store:
            q = q.filter(models.Q(store=store) | models.Q(store__isnull=True))
        if branch:
            q = q.filter(models.Q(branch=branch) | models.Q(branch__isnull=True))

        return q.exists()


class ShopPermission(models.Model):
    """
    Granular permission definition for Shops, Branches, Flyers, and Admin tools.
    """
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=50, default='stores')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class UserShopPermission(models.Model):
    """
    Mapping of specific permissions to a User for specific Stores or Branches.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_shop_permissions')
    permission = models.ForeignKey(ShopPermission, on_delete=models.CASCADE, related_name='user_mappings')
    store = models.ForeignKey('stores.Store', on_delete=models.CASCADE, null=True, blank=True, related_name='user_permissions')
    branch = models.ForeignKey('stores.StoreBranch', on_delete=models.CASCADE, null=True, blank=True, related_name='user_permissions')

    is_granted = models.BooleanField(default=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'permission', 'store', 'branch')

    def __str__(self):
        target = self.branch.name if self.branch else (self.store.name if self.store else "Global System")
        return f"{self.user.username} -> {self.permission.code} [{target}]"


class UserProfile(models.Model):
    """
    Additional user profile information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    profile_picture = models.URLField(blank=True, null=True)  # Cloudinary URL
    preferences = models.JSONField(default=dict)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profile - {self.user.username}"


class UserPreference(models.Model):
    """
    User preferences and settings
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    preferred_categories = models.ManyToManyField('catalog.Category', blank=True)
    preferred_stores = models.ManyToManyField('stores.Store', blank=True)
    notification_enabled = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    newsletter = models.BooleanField(default=False)
    language = models.CharField(max_length=10, default='en')
    theme = models.CharField(max_length=10, default='light', choices=[('light', 'Light'), ('dark', 'Dark')])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Preferences - {self.user.username}"
