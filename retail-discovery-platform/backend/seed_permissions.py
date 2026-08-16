import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User, ShopPermission, UserShopPermission
from apps.stores.models import Store, StoreBranch

PERMISSIONS_SEED = [
    # Store & Branch Management Permissions
    {"code": "stores.view_store", "name": "View Store Details", "category": "stores", "description": "View store profile, branding, and details."},
    {"code": "stores.edit_store", "name": "Edit Store Profile", "category": "stores", "description": "Edit store branding, logo, and store information."},
    {"code": "stores.manage_branches", "name": "Manage Store Outlets", "category": "branches", "description": "Add, update, and remove branch locations and operating hours."},
    
    # Flyer & Product Deal Permissions
    {"code": "flyers.upload_flyer", "name": "Upload Flyer Circulars", "category": "flyers", "description": "Upload PDF or image circulars and trigger AI grid extraction."},
    {"code": "flyers.publish_flyer", "name": "Publish Extracted Flyer Deals", "category": "flyers", "description": "Edit and publish extracted products to public shoppers."},
    {"code": "flyers.delete_flyer", "name": "Delete Flyer Circulars", "category": "flyers", "description": "Remove published flyers and extracted deals."},

    # Analytics & Communications Permissions
    {"code": "analytics.view_analytics", "name": "View Store Analytics", "category": "analytics", "description": "View flyer impressions, clicks, and deal performance."},
    {"code": "announcements.send_broadcast", "name": "Send Push Announcements", "category": "analytics", "description": "Broadcast promotional push alerts to registered users."},
    
    # Admin Permissions
    {"code": "admin.manage_permissions", "name": "Manage User Permissions", "category": "admin", "description": "Grant or revoke shop and branch permissions for users."},
]

def seed():
    print("--- Seeding Shop & Branch Permissions ---")
    created_perms = []
    for pdata in PERMISSIONS_SEED:
        perm, _ = ShopPermission.objects.get_or_create(
            code=pdata["code"],
            defaults={
                "name": pdata["name"],
                "category": pdata["category"],
                "description": pdata["description"]
            }
        )
        created_perms.append(perm)
    print(f"Created/Verified {len(created_perms)} Granular System Permissions.")

    # Assign all permissions to Super Admins & Staff automatically
    super_users = User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True) | User.objects.filter(user_type='admin')
    print(f"Auto-assigning permissions to {super_users.count()} Super Admin / Staff user(s)...")

    stores = Store.objects.all()
    for user in super_users:
        for perm in created_perms:
            UserShopPermission.objects.get_or_create(
                user=user,
                permission=perm,
                store=None,
                branch=None,
                defaults={"is_granted": True}
            )

    # Assign store permissions to shop owner 'arjunachuarjun015'
    shop_users = User.objects.filter(email='arjunachuarjun015@gmail.com')
    if shop_users.exists():
        s_user = shop_users.first()
        print(f"Assigning Shop Partner permissions to '{s_user.username}'...")
        for perm in created_perms:
            UserShopPermission.objects.get_or_create(
                user=s_user,
                permission=perm,
                store=None,
                branch=None,
                defaults={"is_granted": True}
            )

    print("--- Successfully Seeded Permissions & Assigned Super Admin Rights! ---")

if __name__ == "__main__":
    seed()
