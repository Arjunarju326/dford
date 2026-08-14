from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.stores.models import Store, StoreBranch
from apps.flyers.models import Flyer, FlyerPage, FlyerItem
from apps.catalog.models import Product, Category, Brand
from apps.offers.models import Offer, OfferBranchAvailability

class WorkflowEndToEndIntegrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(username='admin', email='admin@test.com', password='adminpassword')
        self.shop_user = User.objects.create_user(username='shopowner', email='owner@test.com', password='shoppassword')
        self.category = Category.objects.create(name='Grocery & Oils', slug='grocery-oils')
        self.brand = Brand.objects.create(name='Fortune', slug='fortune')
        self.product = Product.objects.create(
            name='Fortune Sunflower Oil 1.8L',
            slug='fortune-sunflower-oil-1-8l',
            category=self.category,
            brand=self.brand
        )

    def test_full_workflow_chain(self):
        # 1. Shop Registration
        self.client.force_authenticate(user=self.shop_user)
        reg_resp = self.client.post('/api/v1/shop-registration/', {
            'name': 'FreshMart Hypermarket',
            'owner_name': 'Shop Owner',
            'email': 'owner@freshmart.com',
            'phone': '+974 4455 6677',
            'address': 'West Bay, Doha',
        })
        self.assertEqual(reg_resp.status_code, status.HTTP_201_CREATED)
        shop = Store.objects.get(name='FreshMart Hypermarket')
        self.assertEqual(shop.status, 'PENDING_APPROVAL')
        self.assertFalse(shop.is_active)

        # 2. Admin Approves Shop
        self.client.force_authenticate(user=self.admin)
        approve_resp = self.client.post(f'/api/v1/admin/shops/{shop.id}/approve/')
        self.assertEqual(approve_resp.status_code, status.HTTP_200_OK)
        shop.refresh_from_db()
        self.assertEqual(shop.status, 'APPROVED')
        self.assertTrue(shop.is_active)

        # 3. Shop Creates Branch
        self.client.force_authenticate(user=self.shop_user)
        from apps.locations.models import Country, State, City
        country = Country.objects.create(name='Qatar', code='QA')
        state = State.objects.create(country=country, name='Doha')
        city = City.objects.create(state=state, name='Doha')

        branch = StoreBranch.objects.create(
            store=shop,
            name='Doha Main Branch',
            city=city,
            address='Main Street, Doha',
            latitude=25.2854,
            longitude=51.5310,
            phone='+974 4400 1122'
        )

        # 4. Shop Creates Flyer (Directly PUBLISHED)
        now = timezone.now()
        flyer_resp = self.client.post('/api/v1/shop/flyers/', {
            'title': 'Weekend Mega Savings Flyer',
            'start_date': (now - timezone.timedelta(days=1)).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'end_date': (now + timezone.timedelta(days=7)).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'cover_image_url': 'https://images.unsplash.com/photo-1542838132-92c53300491e',
        })
        self.assertEqual(flyer_resp.status_code, status.HTTP_201_CREATED)
        flyer = Flyer.objects.get(title='Weekend Mega Savings Flyer')
        self.assertEqual(flyer.status, 'PUBLISHED')  # Direct publication without admin verification

        flyer_page = FlyerPage.objects.get(flyer=flyer, page_number=1)
        offer = Offer.objects.create(
            store=shop,
            store_branch=branch,
            product=self.product,
            flyer=flyer,
            flyer_page=flyer_page,
            original_price=18.00,
            offer_price=15.00,
            start_date=flyer.start_date,
            end_date=flyer.end_date,
            status='PUBLISHED'
        )
        OfferBranchAvailability.objects.create(
            offer=offer,
            branch=branch,
            status='AVAILABLE'
        )
        FlyerItem.objects.create(
            flyer_page=flyer_page,
            product=self.product,
            offer=offer,
            product_name=self.product.name,
            offer_price=15.00,
            original_price=18.00,
            x=10, y=10, width=30, height=20
        )

        # 5. Public API returns PUBLISHED flyer
        self.client.force_authenticate(user=None)
        pub_after = self.client.get('/api/v1/flyers/')
        self.assertEqual(len(pub_after.data.get('results', pub_after.data)), 1)

        # 6. Product Detail API returns price, flyer source page, and branch availability
        prod_resp = self.client.get(f'/api/v1/products/{self.product.slug}/')
        self.assertEqual(prod_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(prod_resp.data['offer']['offer_price'], 15.00)
        self.assertEqual(prod_resp.data['source_flyer']['page_number'], 1)

        # 7. Product Availability API returns branch status
        ava_resp = self.client.get(f'/api/v1/products/{self.product.slug}/availability/')
        self.assertEqual(ava_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(ava_resp.data['branches'][0]['availability'], 'AVAILABLE')
