import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.locations.models import Country, State, City, Locality
from apps.catalog.models import Category, Brand, Product
from apps.stores.models import Store, StoreCategory, StoreBranch
from apps.offers.models import Offer

def seed():
    print("Seeding default configuration data into PostgreSQL 'd4d' database...")

    # 1. Countries
    india, _ = Country.objects.get_or_create(name='India', code='IN', currency_code='INR', currency_symbol='Rs')
    uae, _ = Country.objects.get_or_create(name='United Arab Emirates', code='AE', currency_code='AED', currency_symbol='AED')

    # 2. States
    kerala, _ = State.objects.get_or_create(country=india, name='Kerala', defaults={'code': 'KL'})
    karnataka, _ = State.objects.get_or_create(country=india, name='Karnataka', defaults={'code': 'KA'})
    dubai_state, _ = State.objects.get_or_create(country=uae, name='Dubai State', defaults={'code': 'DU'})

    # 3. Cities
    kochi, _ = City.objects.get_or_create(state=kerala, name='Kochi', defaults={'slug': 'kochi', 'latitude': 9.9312, 'longitude': 76.2673})
    trivandrum, _ = City.objects.get_or_create(state=kerala, name='Trivandrum', defaults={'slug': 'trivandrum', 'latitude': 8.5241, 'longitude': 76.9366})
    calicut, _ = City.objects.get_or_create(state=kerala, name='Calicut', defaults={'slug': 'calicut', 'latitude': 11.2588, 'longitude': 75.7804})
    bengaluru, _ = City.objects.get_or_create(state=karnataka, name='Bengaluru', defaults={'slug': 'bengaluru', 'latitude': 12.9716, 'longitude': 77.5946})
    dubai_city, _ = City.objects.get_or_create(state=dubai_state, name='Dubai', defaults={'slug': 'dubai', 'latitude': 25.2048, 'longitude': 55.2708})

    # 4. Localities
    kakkanad, _ = Locality.objects.get_or_create(city=kochi, name='Kakkanad', defaults={'slug': 'kakkanad', 'latitude': 10.0159, 'longitude': 76.3419})
    edappally, _ = Locality.objects.get_or_create(city=kochi, name='Edappally', defaults={'slug': 'edappally', 'latitude': 10.0261, 'longitude': 76.3084})
    indiranagar, _ = Locality.objects.get_or_create(city=bengaluru, name='Indiranagar', defaults={'slug': 'indiranagar', 'latitude': 12.9784, 'longitude': 77.6408})

    print("Locations (Countries, States, Cities, Localities) seeded.")

    # 5. Catalog Categories
    cat_supermarket, _ = Category.objects.get_or_create(name='Supermarket & Grocery', slug='supermarket-grocery', defaults={'icon': 'ShoppingBag', 'order': 1})
    cat_electronics, _ = Category.objects.get_or_create(name='Electronics & Gadgets', slug='electronics-gadgets', defaults={'icon': 'Tv', 'order': 2})
    cat_fashion, _ = Category.objects.get_or_create(name='Fashion & Apparel', slug='fashion-apparel', defaults={'icon': 'Shirt', 'order': 3})
    cat_beauty, _ = Category.objects.get_or_create(name='Health & Beauty', slug='health-beauty', defaults={'icon': 'Sparkles', 'order': 4})

    # 6. Store Categories & Stores
    scat_hypermarket, _ = StoreCategory.objects.get_or_create(name='Hypermarket')
    scat_electronics, _ = StoreCategory.objects.get_or_create(name='Electronics')

    lulu, _ = Store.objects.get_or_create(
        name='Lulu Hypermarket',
        slug='lulu-hypermarket',
        defaults={
            'description': 'World class shopping experience with incredible deals on fresh groceries, electronics & lifestyle.',
            'logo_url': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200&h=200&fit=crop',
            'banner_url': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=400&fit=crop',
            'is_featured': True,
        }
    )

    nesto, _ = Store.objects.get_or_create(
        name='Nesto Hypermarket',
        slug='nesto-hypermarket',
        defaults={
            'description': 'Best price everyday supermarket and retail discount destination.',
            'logo_url': 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=200&h=200&fit=crop',
            'banner_url': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&h=400&fit=crop',
            'is_featured': True,
        }
    )

    bismi, _ = Store.objects.get_or_create(
        name='Bismi Hypermarket & Electronics',
        slug='bismi-hypermarket',
        defaults={
            'description': 'Leading electronics, home appliances & supermarket deals in Kerala.',
            'logo_url': 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200&h=200&fit=crop',
            'banner_url': 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=1200&h=400&fit=crop',
            'is_featured': True,
        }
    )

    # 7. Store Branches
    lulu_edappally, _ = StoreBranch.objects.get_or_create(
        store=lulu,
        name='Lulu Mall Edappally Branch',
        slug='lulu-edappally',
        city=kochi,
        locality=edappally,
        defaults={
            'address': 'Lulu International Shopping Mall, Edappally Junction, Kochi',
            'phone': '+91 484 2727777',
            'latitude': 10.0261,
            'longitude': 76.3084,
        }
    )

    nesto_kakkanad, _ = StoreBranch.objects.get_or_create(
        store=nesto,
        name='Nesto Hypermarket Kakkanad Branch',
        slug='nesto-kakkanad',
        city=kochi,
        locality=kakkanad,
        defaults={
            'address': 'Seaport-Airport Road, Kakkanad, Kochi',
            'phone': '+91 484 2424555',
            'latitude': 10.0159,
            'longitude': 76.3419,
        }
    )

    print("Stores & Store Branches seeded.")

    # 8. Brands & Products
    samsung, _ = Brand.objects.get_or_create(name='Samsung', slug='samsung')

    p_tv, _ = Product.objects.get_or_create(
        name='Samsung 55 inch 4K Ultra HD Smart QLED TV',
        slug='samsung-55-4k-qled-tv',
        category=cat_electronics,
        brand=samsung,
        defaults={
            'sku': 'SKU-TV-55-QLED',
            'description': 'Crystal clear 4K Smart TV with Dolby Atmos sound.',
        }
    )

    p_oil, _ = Product.objects.get_or_create(
        name='Fortune Sunlite Refined Sunflower Oil 5L Can',
        slug='fortune-sunflower-oil-5l',
        category=cat_supermarket,
        defaults={
            'sku': 'SKU-OIL-SUNFLOWER-5L',
            'description': '100% pure refined sunflower oil for healthy cooking.',
        }
    )

    # 9. Active Promotional Offers
    now = timezone.now()
    next_week = now + timedelta(days=7)

    Offer.objects.get_or_create(
        title='Mega Electronics Weekend Sale - 25% Off 55 Smart TV',
        product=p_tv,
        store_branch=lulu_edappally,
        defaults={
            'original_price': 64990.00,
            'offer_price': 48990.00,
            'discount_percentage': 24.6,
            'start_date': now,
            'end_date': next_week,
            'image_url': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=400&fit=crop',
            'status': 'active',
        }
    )

    Offer.objects.get_or_create(
        title='Supermarket Grocery Fest - Sunflower Oil 5L Super Saver Deal',
        product=p_oil,
        store_branch=nesto_kakkanad,
        defaults={
            'original_price': 899.00,
            'offer_price': 649.00,
            'discount_percentage': 27.8,
            'start_date': now,
            'end_date': next_week,
            'image_url': 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=600&h=400&fit=crop',
            'status': 'active',
        }
    )

    print("DEFAULT CONFIGURATION DATA SEEDED SUCCESSFULLY!")

if __name__ == '__main__':
    seed()
