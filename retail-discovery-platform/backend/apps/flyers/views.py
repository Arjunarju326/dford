import os
import io
import logging
from PIL import Image
from django.conf import settings
from django.utils import timezone
from django.db.models import Q
from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Flyer, FlyerPage, FlyerItem
from .extraction_service import extract_flyer_deals, normalize_grid
from .serializers import (
    FlyerListSerializer,
    FlyerDetailSerializer,
    FlyerCreateSerializer,
    FlyerItemSerializer,
    FlyerDealsItemSerializer,
)

logger = logging.getLogger(__name__)


# ==========================================
# MULTI-PAGE FLYER UPLOAD ENDPOINT
# ==========================================

class FlyerUploadAPIView(APIView):
    """
    POST /api/v1/flyers/upload
    Accepts multi-page image uploads or PDF file.
    Converts PDF pages into images, saves Flyer, FlyerPages, and bulk-inserts normalized FlyerItems.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        files = request.FILES.getlist('files') or request.FILES.getlist('images')
        single_file = request.FILES.get('file') or request.FILES.get('image')
        
        if single_file and not files:
            files = [single_file]

        if not files:
            return Response({'error': 'No flyer image or PDF file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check total file sizes (<10MB per page file)
        for f in files:
            if f.size > 10 * 1024 * 1024:
                return Response({'error': f'File {f.name} exceeds 10MB limit.'}, status=status.HTTP_400_BAD_REQUEST)

        page_images = []  # List of tuples: (image_bytes, width, height, filename_hint)

        for file_obj in files:
            file_bytes = file_obj.read()
            is_pdf = file_obj.name.lower().endswith('.pdf') or file_obj.content_type == 'application/pdf'

            if is_pdf:
                try:
                    from pdf2image import convert_from_bytes
                    pdf_pages = convert_from_bytes(file_bytes)
                    for p_idx, page_img in enumerate(pdf_pages):
                        img_buf = io.BytesIO()
                        page_img.save(img_buf, format='PNG')
                        p_bytes = img_buf.getvalue()
                        page_images.append((p_bytes, page_img.width, page_img.height, f"pdf_page_{p_idx+1}.png"))
                except Exception as err:
                    logger.error(f"Failed to convert PDF file: {err}")
                    return Response({'error': f'Failed to process PDF file: {str(err)}'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                try:
                    pil_img = Image.open(io.BytesIO(file_bytes))
                    page_images.append((file_bytes, pil_img.width, pil_img.height, file_obj.name))
                except Exception as err:
                    return Response({'error': f'Invalid image file {file_obj.name}: {str(err)}'}, status=status.HTTP_400_BAD_REQUEST)

        if not page_images:
            return Response({'error': 'No valid flyer pages found in upload.'}, status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title') or f"Flyer Circular {int(timezone.now().timestamp())}"
        store_name = request.data.get('store_name') or request.data.get('store') or "Retail Outlet"
        store_logo_url = request.data.get('store_logo_url') or ""
        category_str = request.data.get('category') or "Supermarket"
        valid_from = request.data.get('valid_from') or timezone.now().date()
        valid_to = request.data.get('valid_to') or (timezone.now() + timezone.timedelta(days=7)).date()

        # Create 1st Level: Flyer
        flyer = Flyer.objects.create(
            title=title,
            store_name=store_name,
            store_logo_url=store_logo_url,
            category_slug=category_str,
            page_count=len(page_images),
            start_date=valid_from if isinstance(valid_from, timezone.datetime) else timezone.now(),
            end_date=valid_to if isinstance(valid_to, timezone.datetime) else (timezone.now() + timezone.timedelta(days=7)),
            valid_from=valid_from if isinstance(valid_from, timezone.datetime) else timezone.now(),
            valid_to=valid_to if isinstance(valid_to, timezone.datetime) else (timezone.now() + timezone.timedelta(days=7)),
            status='PUBLISHED',
            processing_status='PROCESSED',
            published_at=timezone.now(),
            created_by=request.user if request.user.is_authenticated else None
        )

        total_extracted_items = 0

        # Process each page (2nd Level: FlyerPage, 3rd Level: FlyerItem)
        for page_num, (p_bytes, width, height, fname_hint) in enumerate(page_images, start=1):
            fname = f"flyer_{flyer.id}_page_{page_num}_{int(timezone.now().timestamp())}.png"
            save_dir = os.path.join(settings.MEDIA_ROOT, 'flyers')
            os.makedirs(save_dir, exist_ok=True)
            save_path = os.path.join(save_dir, fname)

            with open(save_path, 'wb') as f:
                f.write(p_bytes)

            image_url = request.build_absolute_uri(f"{settings.MEDIA_URL}flyers/{fname}")

            if page_num == 1:
                flyer.cover_image_url = image_url
                flyer.image_url = image_url
                flyer.image_width = width
                flyer.image_height = height
                flyer.save(update_fields=['cover_image_url', 'image_url', 'image_width', 'image_height'])

            # Create FlyerPage
            flyer_page = FlyerPage.objects.create(
                flyer=flyer,
                page_number=page_num,
                image_url=image_url,
                image_width=width,
                image_height=height,
            )

            # Call Gemini vision extraction (returns normalized grid items)
            try:
                extracted_grid = extract_flyer_deals(p_bytes)
            except Exception as err:
                logger.error(f"Extraction failed on page {page_num}: {err}")
                extracted_grid = []

            items_to_create = []
            for d in extracted_grid:
                items_to_create.append(FlyerItem(
                    flyer=flyer,
                    flyer_page=flyer_page,
                    name=d.get('name', ''),
                    product_name=d.get('name', ''),
                    mrp=d.get('mrp'),
                    original_price=d.get('mrp'),
                    offer_price=d.get('offer_price'),
                    deal_text=d.get('deal_text', ''),
                    row_index=int(d.get('row_index', 0)),
                    col_index=int(d.get('col_index', 0)),
                    bbox_x=d.get('bbox_x', 0.0),
                    bbox_y=d.get('bbox_y', 0.0),
                    bbox_w=d.get('bbox_w', 0.0),
                    bbox_h=d.get('bbox_h', 0.0),
                    x=d.get('bbox_x', 0.0) * 100,
                    y=d.get('bbox_y', 0.0) * 100,
                    width=d.get('bbox_w', 0.0) * 100,
                    height=d.get('bbox_h', 0.0) * 100,
                ))

            if items_to_create:
                FlyerItem.objects.bulk_create(items_to_create)
                total_extracted_items += len(items_to_create)

        return Response({
            'id': flyer.id,
            'title': flyer.title,
            'store_name': flyer.store_name,
            'cover_image_url': flyer.cover_image_url,
            'page_count': flyer.page_count,
            'total_items': total_extracted_items,
            'message': f'Uploaded flyer with {flyer.page_count} pages and extracted {total_extracted_items} grid items.'
        }, status=status.HTTP_201_CREATED)


# ==========================================
# READ ENDPOINTS
# ==========================================

class FlyerDealsListAPIView(APIView):
    """
    GET /api/v1/flyers?category=&store=
    Paginated list for browse/listing page with days_left & page_count.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category', '')
        store = request.query_params.get('store', '')

        qs = Flyer.objects.filter(status='PUBLISHED').order_by('-created_at')

        if category:
            qs = qs.filter(Q(category_slug__icontains=category) | Q(category__name__icontains=category))
        if store:
            qs = qs.filter(Q(store_name__icontains=store) | Q(store__name__icontains=store))

        now = timezone.now()
        results = []
        for flyer in qs:
            valid_to_dt = flyer.valid_to or flyer.end_date
            days_left = 0
            if valid_to_dt:
                if isinstance(valid_to_dt, timezone.datetime):
                    delta = valid_to_dt - now
                else:
                    delta = valid_to_dt - now.date()
                days_left = max(0, delta.days)

            results.append({
                'id': flyer.id,
                'title': flyer.title,
                'store_name': flyer.store_name or (flyer.store.name if flyer.store else "Store"),
                'store_logo_url': flyer.store_logo_url or (flyer.store.logo_url if flyer.store else None),
                'category': flyer.category_slug or (flyer.category.name if flyer.category else "Supermarket"),
                'cover_image_url': flyer.cover_image_url or flyer.image_url,
                'page_count': flyer.page_count,
                'valid_from': flyer.valid_from or flyer.start_date,
                'valid_to': flyer.valid_to or flyer.end_date,
                'days_left': days_left,
                'created_at': flyer.created_at,
            })

        return Response(results)


class FlyerDealsMetadataAPIView(APIView):
    """GET /api/v1/flyers/{id} — Metadata + page_count."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            flyer = Flyer.objects.get(pk=pk)
            pages = FlyerPage.objects.filter(flyer=flyer).order_by('page_number')
            page_list = [
                {
                    'id': p.id,
                    'page_number': p.page_number,
                    'image_url': p.image_url,
                    'image_width': p.image_width or 800,
                    'image_height': p.image_height or 1200,
                }
                for p in pages
            ]

            valid_to_dt = flyer.valid_to or flyer.end_date
            days_left = 0
            if valid_to_dt:
                now = timezone.now()
                delta = (valid_to_dt - now) if isinstance(valid_to_dt, timezone.datetime) else (valid_to_dt - now.date())
                days_left = max(0, delta.days)

            return Response({
                'id': flyer.id,
                'title': flyer.title,
                'store_name': flyer.store_name or (flyer.store.name if flyer.store else "Store"),
                'store_logo_url': flyer.store_logo_url or (flyer.store.logo_url if flyer.store else None),
                'category': flyer.category_slug or "Supermarket",
                'cover_image_url': flyer.cover_image_url or flyer.image_url,
                'page_count': flyer.page_count or len(page_list) or 1,
                'valid_from': flyer.valid_from or flyer.start_date,
                'valid_to': flyer.valid_to or flyer.end_date,
                'days_left': days_left,
                'created_at': flyer.created_at,
                'pages': page_list,
            })
        except Flyer.DoesNotExist:
            return Response({'error': 'Flyer not found.'}, status=status.HTTP_404_NOT_FOUND)


def get_item_branches(item, flyer):
    branches_list = []

    if item and item.available_branches.exists():
        for b in item.available_branches.all():
            branches_list.append({
                'id': b.id,
                'name': b.name,
                'city': b.city or 'Main City',
                'address': b.address or 'Store Location',
                'location_url': b.location_url or f"https://maps.google.com/?q={b.name}",
                'phone': b.phone or '',
            })
    elif item and item.store_branch:
        b = item.store_branch
        branches_list.append({
            'id': b.id,
            'name': b.name,
            'city': b.city or 'Main City',
            'address': b.address or 'Store Location',
            'location_url': b.location_url or f"https://maps.google.com/?q={b.name}",
            'phone': b.phone or '',
        })
    elif flyer:
        if flyer.branches.exists():
            for b in flyer.branches.all():
                branches_list.append({
                    'id': b.id,
                    'name': b.name,
                    'city': b.city or 'Main City',
                    'address': b.address or 'Store Location',
                    'location_url': b.location_url or f"https://maps.google.com/?q={b.name}",
                    'phone': b.phone or '',
                })
        elif flyer.store and flyer.store.branches.exists():
            for b in flyer.store.branches.all():
                branches_list.append({
                    'id': b.id,
                    'name': b.name,
                    'city': b.city or 'Main City',
                    'address': b.address or 'Store Location',
                    'location_url': b.location_url or f"https://maps.google.com/?q={b.name}",
                    'phone': b.phone or '',
                })
        elif flyer.store_branch:
            b = flyer.store_branch
            branches_list.append({
                'id': b.id,
                'name': b.name,
                'city': b.city or 'Main City',
                'address': b.address or 'Store Location',
                'location_url': b.location_url or f"https://maps.google.com/?q={b.name}",
                'phone': b.phone or '',
            })

    if not branches_list:
        s_name = flyer.store_name if flyer else 'Store'
        branches_list = [
            {
                'id': 1,
                'name': f"{s_name} - Central Branch",
                'city': 'City Centre',
                'address': 'Main Shopping Mall & Retail Complex',
                'location_url': f"https://maps.google.com/?q={s_name}+Central+Branch",
                'phone': '+91 98765 43210',
            },
            {
                'id': 2,
                'name': f"{s_name} - West Outlet",
                'city': 'West Market',
                'address': 'Commercial Hub, Main Road',
                'location_url': f"https://maps.google.com/?q={s_name}+West+Outlet",
                'phone': '+91 98765 43211',
            }
        ]

    return branches_list


class FlyerDealsPageDetailAPIView(APIView):
    """
    GET /api/v1/flyers/{id}/pages/{page_number}
    Returns page image_url, width, height, and its flyer_items (with grid rects & available branches).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk, page_number):
        try:
            flyer = Flyer.objects.get(pk=pk)
            page = FlyerPage.objects.get(flyer=flyer, page_number=page_number)
            items = FlyerItem.objects.filter(flyer_page=page).order_by('row_index', 'col_index', 'id')

            items_serialized = [
                {
                    'id': item.id,
                    'name': item.name or item.product_name or "Deal Item",
                    'mrp': item.mrp or item.original_price,
                    'offer_price': item.offer_price,
                    'deal_text': item.deal_text,
                    'row_index': item.row_index,
                    'col_index': item.col_index,
                    'bbox_x': item.bbox_x,
                    'bbox_y': item.bbox_y,
                    'bbox_w': item.bbox_w,
                    'bbox_h': item.bbox_h,
                    'available_branches': get_item_branches(item, flyer),
                }
                for item in items
            ]

            return Response({
                'id': page.id,
                'flyer_id': flyer.id,
                'page_number': page.page_number,
                'image_url': page.image_url,
                'image_width': page.image_width or 800,
                'image_height': page.image_height or 1200,
                'flyer_items': items_serialized,
            })
        except (Flyer.DoesNotExist, FlyerPage.DoesNotExist):
            return Response({'error': 'Flyer page not found.'}, status=status.HTTP_404_NOT_FOUND)


class FlyerDealsSingleItemAPIView(APIView):
    """GET /api/v1/flyer-items/{item_id} — Single item detail when clicked."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, item_id):
        try:
            item = FlyerItem.objects.get(pk=item_id)
            flyer = item.flyer or (item.flyer_page.flyer if item.flyer_page else None)
            return Response({
                'id': item.id,
                'flyer_page_id': item.flyer_page_id,
                'name': item.name or item.product_name or "Deal Item",
                'mrp': item.mrp or item.original_price,
                'offer_price': item.offer_price,
                'deal_text': item.deal_text,
                'row_index': item.row_index,
                'col_index': item.col_index,
                'bbox_x': item.bbox_x,
                'bbox_y': item.bbox_y,
                'bbox_w': item.bbox_w,
                'bbox_h': item.bbox_h,
                'available_branches': get_item_branches(item, flyer),
            })
        except FlyerItem.DoesNotExist:
            return Response({'error': 'Flyer item not found.'}, status=status.HTTP_404_NOT_FOUND)


# Legacy views for compatibility
class ShopFlyerViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FlyerCreateSerializer
        if self.action == 'retrieve':
            return FlyerDetailSerializer
        return FlyerListSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Flyer.objects.all()
        return Flyer.objects.filter(Q(store__owner=user) | Q(created_by=user)).distinct()

    def perform_create(self, serializer):
        from apps.stores.models import Store
        store = serializer.validated_data.get('store')
        if not store:
            store = Store.objects.filter(owner=self.request.user).first()
        serializer.save(
            store=store,
            created_by=self.request.user,
            status='PUBLISHED',
            processing_status='PROCESSED',
            published_at=timezone.now()
        )


class PublicFlyerListView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FlyerCreateSerializer
        return FlyerListSerializer

    def get_queryset(self):
        now = timezone.now()
        return Flyer.objects.filter(status='PUBLISHED', start_date__lte=now, end_date__gte=now).order_by('-start_date')


class PublicFlyerDetailView(generics.RetrieveAPIView):
    serializer_class = FlyerDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

    def get_object(self):
        lookup_val = self.kwargs.get('id')
        return Flyer.objects.filter(pk=lookup_val).first() or generics.NotFound('Flyer not found.')
