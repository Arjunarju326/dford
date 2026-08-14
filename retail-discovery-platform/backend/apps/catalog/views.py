from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from .models import Product, Category, Brand
from .serializers import ProductListSerializer, ProductDetailSerializer, CategorySerializer, BrandSerializer
from apps.offers.models import Offer, OfferBranchAvailability
from apps.offers.serializers import OfferListSerializer, OfferBranchAvailabilitySerializer
from apps.stores.models import StoreBranch
from apps.stores.serializers import StoreBranchSerializer

class ProductDetailView(APIView):
    """GET /api/v1/products/{slug}/ — Comprehensive Product Detail & Offer Information."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        product = Product.objects.filter(slug=slug).select_related('category', 'brand').first()
        if not product:
            product = Product.objects.filter(id=slug if str(slug).isdigit() else 0).first()
        if not product:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        # Find active offer for product
        active_offer = Offer.objects.filter(
            product=product,
            status='PUBLISHED',
            start_date__lte=now,
            end_date__gte=now
        ).select_related('store', 'store_branch', 'flyer', 'flyer_page').first()

        # Fallback to any offer for product if none published
        if not active_offer:
            active_offer = Offer.objects.filter(product=product).select_related('store', 'store_branch', 'flyer', 'flyer_page').first()

        product_data = ProductDetailSerializer(product).data

        offer_data = None
        source_flyer_data = None
        if active_offer:
            offer_data = {
                'id': active_offer.id,
                'title': active_offer.title or product.name,
                'offer_price': float(active_offer.offer_price),
                'original_price': float(active_offer.original_price),
                'discount_percentage': float(active_offer.discount_percentage),
                'valid_from': active_offer.start_date.strftime('%Y-%m-%d'),
                'valid_until': active_offer.end_date.strftime('%Y-%m-%d'),
                'store_name': active_offer.store.name if active_offer.store else (active_offer.store_branch.store.name if active_offer.store_branch else ''),
                'store_logo': active_offer.store.logo_url if active_offer.store else (active_offer.store_branch.store.logo_url if active_offer.store_branch else ''),
                'store_slug': active_offer.store.slug if active_offer.store else (active_offer.store_branch.store.slug if active_offer.store_branch else ''),
            }
            if active_offer.flyer:
                source_flyer_data = {
                    'flyer_id': active_offer.flyer.id,
                    'flyer_title': active_offer.flyer.title,
                    'flyer_slug': f"flyer-{active_offer.flyer.id}",
                    'page_number': active_offer.flyer_page.page_number if active_offer.flyer_page else 1,
                    'cover_image_url': active_offer.flyer.cover_image_url,
                }

        return Response({
            'product': product_data,
            'offer': offer_data,
            'source_flyer': source_flyer_data,
        })


class ProductAvailabilityView(APIView):
    """GET /api/v1/products/{slug}/availability/ — Branch availability for a product offer."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        product = Product.objects.filter(slug=slug).first()
        if not product and str(slug).isdigit():
            product = Product.objects.filter(id=int(slug)).first()
        if not product:
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        offer = Offer.objects.filter(product=product).first()
        if not offer:
            return Response({'product': {'id': product.id, 'name': product.name}, 'branches': []})

        # Fetch explicitly recorded branch availabilities
        availabilities = OfferBranchAvailability.objects.filter(offer=offer).select_related('branch', 'branch__city')
        branch_list = []

        if availabilities.exists():
            for ava in availabilities:
                branch_list.append({
                    'id': ava.branch.id,
                    'name': ava.branch.name,
                    'address': ava.branch.address,
                    'city': ava.branch.city.name if ava.branch.city else '',
                    'phone': ava.branch.phone,
                    'latitude': float(ava.branch.latitude),
                    'longitude': float(ava.branch.longitude),
                    'availability': ava.status,
                })
        else:
            # If shop has branches but no explicit inventory status, return UNKNOWN
            store = offer.store or (offer.store_branch.store if offer.store_branch else None)
            if store:
                for b in store.branches.filter(is_active=True):
                    branch_list.append({
                        'id': b.id,
                        'name': b.name,
                        'address': b.address,
                        'city': b.city.name if b.city else '',
                        'phone': b.phone,
                        'latitude': float(b.latitude),
                        'longitude': float(b.longitude),
                        'availability': 'UNKNOWN',
                    })

        return Response({
            'product': {'id': product.id, 'name': product.name},
            'branches': branch_list,
        })


class ProductRelatedView(APIView):
    """GET /api/v1/products/{slug}/related/ — Recommendation scoring engine."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        product = Product.objects.filter(slug=slug).select_related('category', 'brand').first()
        if not product and str(slug).isdigit():
            product = Product.objects.filter(id=int(slug)).first()
        if not product:
            return Response({'results': []})

        current_offer = Offer.objects.filter(product=product).select_related('store', 'flyer').first()
        now = timezone.now()

        # Fetch candidate active offers excluding current product
        candidates = Offer.objects.filter(
            status='PUBLISHED',
            start_date__lte=now,
            end_date__gte=now
        ).exclude(product=product).select_related('product', 'product__category', 'product__brand', 'store', 'flyer')

        scored_results = []
        for cand in candidates:
            score = 0
            # Same category +40
            if product.category and cand.product.category and cand.product.category.id == product.category.id:
                score += 40
            # Same brand +25
            if product.brand and cand.product.brand and cand.product.brand.id == product.brand.id:
                score += 25
            # Same store +20
            if current_offer and current_offer.store and cand.store and cand.store.id == current_offer.store.id:
                score += 20
            # Same flyer +15
            if current_offer and current_offer.flyer and cand.flyer and cand.flyer.id == current_offer.flyer.id:
                score += 15

            scored_results.append((score, cand))

        # Sort by score descending
        scored_results.sort(key=lambda x: x[0], reverse=True)
        top_candidates = [item[1] for item in scored_results[:6]]

        return Response({
            'results': OfferListSerializer(top_candidates, many=True).data
        })


class GlobalSearchView(APIView):
    """GET /api/v1/search/ — Location-aware multi-entity search."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        if not query:
            return Response({'products': [], 'flyers': [], 'stores': []})

        now = timezone.now()

        products = Product.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )[:6]

        flyers = Flyer.objects.filter(
            status='PUBLISHED',
            start_date__lte=now,
            end_date__gte=now
        ).filter(Q(title__icontains=query) | Q(description__icontains=query))[:6]

        stores = Store.objects.filter(
            status='APPROVED',
            is_active=True
        ).filter(Q(name__icontains=query) | Q(description__icontains=query))[:6]

        return Response({
            'products': ProductListSerializer(products, many=True).data,
            'flyers': [
                {
                    'id': f.id,
                    'title': f.title,
                    'slug': f"flyer-{f.id}",
                    'cover_image_url': f.cover_image_url,
                    'store_name': f.store.name if f.store else ''
                } for f in flyers
            ],
            'stores': [
                {
                    'id': s.id,
                    'name': s.name,
                    'slug': s.slug,
                    'logo_url': s.logo_url
                } for s in stores
            ]
        })
