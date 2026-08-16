import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.stores.models import Store, StoreBranch
from apps.catalog.models import Category
from apps.flyers.models import Flyer, FlyerPage, FlyerItem
from apps.locations.models import City, State, Country
from django.utils import timezone
from datetime import timedelta

def seed():
    print("--- Seeding Multiple Stores, Outlets, Categories & Per-Item Branch Deals ---")

    # Country, State & Cities
    india, _ = Country.objects.get_or_create(code="IN", defaults={"name": "India", "currency_code": "INR", "currency_symbol": "₹"})
    kerala, _ = State.objects.get_or_create(country=india, name="Kerala")
    maharashtra, _ = State.objects.get_or_create(country=india, name="Maharashtra")
    karnataka, _ = State.objects.get_or_create(country=india, name="Karnataka")

    uae, _ = Country.objects.get_or_create(code="AE", defaults={"name": "United Arab Emirates", "currency_code": "AED", "currency_symbol": "AED"})
    dubai_state, _ = State.objects.get_or_create(country=uae, name="Dubai")
    sharjah_state, _ = State.objects.get_or_create(country=uae, name="Sharjah")

    cities_dict = {}
    for cname, s_obj in [("Mumbai", maharashtra), ("Kochi", kerala), ("Trivandrum", kerala), ("Bengaluru", karnataka), ("Dubai", dubai_state), ("Sharjah", sharjah_state)]:
        city, _ = City.objects.get_or_create(slug=cname.lower(), defaults={"name": cname, "state": s_obj})
        cities_dict[cname] = city

    # 1. Categories
    categories_data = [
        {"name": "Supermarket", "icon": "shopping-cart"},
        {"name": "Electronics", "icon": "tv"},
        {"name": "Mobiles & Tech", "icon": "smartphone"},
        {"name": "Fashion & Apparel", "icon": "shirt"},
        {"name": "Home & Living", "icon": "home"},
        {"name": "Beauty & Health", "icon": "heart"},
        {"name": "Baby & Kids", "icon": "smile"},
        {"name": "Automotive & Tools", "icon": "tool"},
    ]

    cats = []
    for cdata in categories_data:
        cat, created = Category.objects.get_or_create(
            name=cdata["name"],
            defaults={"icon": cdata["icon"], "order": len(cats)}
        )
        cats.append(cat)
    print(f"Created/Verified {len(cats)} Categories.")

    # 2. Stores & Branches
    stores_info = [
        {
            "name": "LuLu Hypermarket",
            "slug": "lulu-hypermarket",
            "logo_url": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=120&q=80",
            "branches": [
                {"name": "LuLu Kochi Edapally Supercenter", "city_name": "Kochi", "address": "NH 544, Edapally Bypass", "location_url": "https://maps.google.com/?q=LuLu+Kochi+Edapally"},
                {"name": "LuLu Trivandrum Mall", "city_name": "Trivandrum", "address": "Akkulam Bridge, NH 66", "location_url": "https://maps.google.com/?q=LuLu+Trivandrum"},
                {"name": "LuLu Mumbai Bandra Outlet", "city_name": "Mumbai", "address": "Hill Road, Bandra West", "location_url": "https://maps.google.com/?q=LuLu+Mumbai+Bandra"}
            ]
        },
        {
            "name": "Carrefour",
            "slug": "carrefour",
            "logo_url": "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=120&q=80",
            "branches": [
                {"name": "Carrefour Mall of Emirates", "city_name": "Dubai", "address": "Sheikh Zayed Road, Al Barsha", "location_url": "https://maps.google.com/?q=Carrefour+Mall+of+Emirates"},
                {"name": "Carrefour City Centre Deira", "city_name": "Dubai", "address": "8th Street, Port Saeed", "location_url": "https://maps.google.com/?q=Carrefour+City+Centre+Deira"}
            ]
        },
        {
            "name": "Nesto Hypermarket",
            "slug": "nesto-hypermarket",
            "logo_url": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=120&q=80",
            "branches": [
                {"name": "Nesto Karama Hypermarket", "city_name": "Dubai", "address": "Kuwait Street, Al Karama", "location_url": "https://maps.google.com/?q=Nesto+Karama"},
                {"name": "Nesto Sharjah Rolla Square", "city_name": "Sharjah", "address": "Al Arouba St, Rolla", "location_url": "https://maps.google.com/?q=Nesto+Sharjah+Rolla"}
            ]
        },
        {
            "name": "Reliance SMART",
            "slug": "reliance-smart",
            "logo_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80",
            "branches": [
                {"name": "Reliance SMART Central Branch", "city_name": "Mumbai", "address": "LBS Marg, Kurla West", "location_url": "https://maps.google.com/?q=Reliance+SMART+Kurla"},
                {"name": "Reliance SMART Andheri East Outlet", "city_name": "Mumbai", "address": "SV Road, Andheri West", "location_url": "https://maps.google.com/?q=Reliance+SMART+Andheri"}
            ]
        },
        {
            "name": "IKEA",
            "slug": "ikea",
            "logo_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=120&q=80",
            "branches": [
                {"name": "IKEA Nagasandra Store", "city_name": "Bengaluru", "address": "Tumkur Road, Nagasandra", "location_url": "https://maps.google.com/?q=IKEA+Nagasandra"},
                {"name": "IKEA Navi Mumbai Store", "city_name": "Mumbai", "address": "Turbhe, Navi Mumbai", "location_url": "https://maps.google.com/?q=IKEA+Navi+Mumbai"}
            ]
        }
    ]

    created_stores = {}
    created_branches = {}

    for sinfo in stores_info:
        store, _ = Store.objects.get_or_create(
            slug=sinfo["slug"],
            defaults={
                "name": sinfo["name"],
                "status": "APPROVED",
                "is_active": True,
                "logo_url": sinfo["logo_url"]
            }
        )
        created_stores[sinfo["slug"]] = store

        b_list = []
        for bdata in sinfo["branches"]:
            c_obj = cities_dict.get(bdata["city_name"])
            branch, _ = StoreBranch.objects.get_or_create(
                store=store,
                name=bdata["name"],
                defaults={
                    "city": c_obj,
                    "address": f"{bdata['city_name']} - {bdata['address']}",
                    "location_url": bdata["location_url"],
                    "is_active": True
                }
            )
            b_list.append(branch)
        created_branches[sinfo["slug"]] = b_list

    print(f"Created/Verified {len(created_stores)} Stores with multi-branch outlets.")

    # 3. Create Multi-Page Flyers with Per-Item Branch Allocations
    now = timezone.now()
    valid_until = now + timedelta(days=10)

    # Flyer 1: LuLu Mega Supermarket Sale
    lulu_store = created_stores["lulu-hypermarket"]
    lulu_branches = created_branches["lulu-hypermarket"]

    f1, _ = Flyer.objects.get_or_create(
        title="LuLu Weekend Mega Groceries & Fresh Deals",
        store=lulu_store,
        defaults={
            "store_name": lulu_store.name,
            "store_logo_url": lulu_store.logo_url,
            "category_slug": "Supermarket",
            "cover_image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
            "page_count": 2,
            "start_date": now,
            "end_date": valid_until,
            "valid_from": now.date(),
            "valid_to": valid_until.date(),
            "status": "PUBLISHED"
        }
    )
    f1.branches.set(lulu_branches)

    # Page 1
    fp1, _ = FlyerPage.objects.get_or_create(
        flyer=f1, page_number=1,
        defaults={"image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"}
    )

    # Items for Page 1 with per-item branch assignment
    item1, _ = FlyerItem.objects.get_or_create(
        flyer_page=fp1, name="Fresh Organic Alphonso Mangoes 1kg",
        defaults={
            "mrp": 299.00, "offer_price": 199.00, "deal_text": "SAVE ₹100",
            "row_index": 0, "col_index": 0, "bbox_x": 0.05, "bbox_y": 0.10, "bbox_w": 0.42, "bbox_h": 0.35
        }
    )
    item1.available_branches.set([lulu_branches[0], lulu_branches[1]]) # Available in Kochi & Trivandrum

    item2, _ = FlyerItem.objects.get_or_create(
        flyer_page=fp1, name="LuLu Premium Basmati Rice 5kg",
        defaults={
            "mrp": 650.00, "offer_price": 449.00, "deal_text": "SAVE ₹201",
            "row_index": 0, "col_index": 1, "bbox_x": 0.52, "bbox_y": 0.10, "bbox_w": 0.42, "bbox_h": 0.35
        }
    )
    item2.available_branches.set([lulu_branches[2]]) # Available ONLY in Mumbai Bandra

    # Flyer 2: Carrefour Tech & Electronics Special
    carrefour_store = created_stores["carrefour"]
    carrefour_branches = created_branches["carrefour"]

    f2, _ = Flyer.objects.get_or_create(
        title="Carrefour Tech Fest & Gadget Circular",
        store=carrefour_store,
        defaults={
            "store_name": carrefour_store.name,
            "store_logo_url": carrefour_store.logo_url,
            "category_slug": "Electronics",
            "cover_image_url": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80",
            "page_count": 1,
            "start_date": now,
            "end_date": valid_until,
            "valid_from": now.date(),
            "valid_to": valid_until.date(),
            "status": "PUBLISHED"
        }
    )
    f2.branches.set(carrefour_branches)

    fp2, _ = FlyerPage.objects.get_or_create(
        flyer=f2, page_number=1,
        defaults={"image_url": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80"}
    )

    citem1, _ = FlyerItem.objects.get_or_create(
        flyer_page=fp2, name="Sony Bravia 65\" 4K Ultra HD Smart OLED TV",
        defaults={
            "mrp": 4999.00, "offer_price": 3499.00, "deal_text": "SAVE ₹1500",
            "row_index": 0, "col_index": 0, "bbox_x": 0.05, "bbox_y": 0.10, "bbox_w": 0.42, "bbox_h": 0.35
        }
    )
    citem1.available_branches.set([carrefour_branches[0]]) # Mall of Emirates only

    citem2, _ = FlyerItem.objects.get_or_create(
        flyer_page=fp2, name="Apple MacBook Air M2 256GB SSD",
        defaults={
            "mrp": 3999.00, "offer_price": 3199.00, "deal_text": "SAVE ₹800",
            "row_index": 0, "col_index": 1, "bbox_x": 0.52, "bbox_y": 0.10, "bbox_w": 0.42, "bbox_h": 0.35
        }
    )
    citem2.available_branches.set(carrefour_branches) # Available in all Carrefour branches

    # Flyer 3: IKEA Home Furniture Catalogue
    ikea_store = created_stores["ikea"]
    ikea_branches = created_branches["ikea"]

    f3, _ = Flyer.objects.get_or_create(
        title="IKEA Home Comforts & Living Catalogue",
        store=ikea_store,
        defaults={
            "store_name": ikea_store.name,
            "store_logo_url": ikea_store.logo_url,
            "category_slug": "Home & Living",
            "cover_image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
            "page_count": 1,
            "start_date": now,
            "end_date": valid_until,
            "valid_from": now.date(),
            "valid_to": valid_until.date(),
            "status": "PUBLISHED"
        }
    )
    f3.branches.set(ikea_branches)

    fp3, _ = FlyerPage.objects.get_or_create(
        flyer=f3, page_number=1,
        defaults={"image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"}
    )

    iitem1, _ = FlyerItem.objects.get_or_create(
        flyer_page=fp3, name="IKEA STRANDMON Wing Chair Grey",
        defaults={
            "mrp": 19990.00, "offer_price": 14990.00, "deal_text": "SAVE ₹5000",
            "row_index": 0, "col_index": 0, "bbox_x": 0.05, "bbox_y": 0.10, "bbox_w": 0.42, "bbox_h": 0.35
        }
    )
    iitem1.available_branches.set([ikea_branches[0]]) # Nagasandra store only

    iitem2, _ = FlyerItem.objects.get_or_create(
        flyer_page=fp3, name="IKEA MARKUS Ergonomic Office Desk Chair",
        defaults={
            "mrp": 15990.00, "offer_price": 11990.00, "deal_text": "SAVE ₹4000",
            "row_index": 0, "col_index": 1, "bbox_x": 0.52, "bbox_y": 0.10, "bbox_w": 0.42, "bbox_h": 0.35
        }
    )
    iitem2.available_branches.set([ikea_branches[1]]) # Navi Mumbai store only

    print("--- Successfully Seeded Multiple Stores, Categories & Per-Item Branch Allocations! ---")

if __name__ == "__main__":
    seed()
