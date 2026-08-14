import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.offers.models import Offer
from apps.flyers.models import Flyer, FlyerPage
from apps.catalog.models import Product, Brand, Category
from apps.stores.models import Store, StoreBranch, StoreCategory
from apps.locations.models import Locality, City, State, Country

def purge_seed_data():
    print("Purging sample seed data while keeping superuser and accounts...")

    cnt_offers, _ = Offer.objects.all().delete()
    cnt_flyer_pages, _ = FlyerPage.objects.all().delete()
    cnt_flyers, _ = Flyer.objects.all().delete()
    cnt_products, _ = Product.objects.all().delete()
    cnt_brands, _ = Brand.objects.all().delete()
    cnt_categories, _ = Category.objects.all().delete()
    cnt_branches, _ = StoreBranch.objects.all().delete()
    cnt_stores, _ = Store.objects.all().delete()
    cnt_scategories, _ = StoreCategory.objects.all().delete()
    cnt_localities, _ = Locality.objects.all().delete()
    cnt_cities, _ = City.objects.all().delete()
    cnt_states, _ = State.objects.all().delete()
    cnt_countries, _ = Country.objects.all().delete()

    print("Purged seed entities successfully.")

if __name__ == '__main__':
    purge_seed_data()
