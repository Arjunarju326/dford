# Current vs. Target Gap Analysis

## Overview
This document outlines the gap analysis between the **current platform implementation** and the **target business workflow requirements** for the Retail Offers and Flyer Discovery System.

---

## Gap Analysis Matrix

| Area | Current Implementation | Required Behavior | Gap | Required Change |
|---|---|---|---|---|
| **Shop Registration** | General user registration (`/api/auth/register/`). `Store` model exists without owner or status workflow. | Dedicated Shop registration (`POST /api/v1/shop-registration/`). Creates store with `status='PENDING_APPROVAL'`, `is_active=False`, `owner=user`. | No shop registration workflow, missing owner & status fields on `Store`. | Add `owner`, `status`, `rejection_reason`, `owner_name` to `Store` model. Create `/api/v1/shop-registration/`. |
| **Shop Approval** | Manual boolean edit via Django Admin (`is_active`). No rejection reason or approval queue. | Admin Pending Queue (`GET /api/v1/admin/shops/pending/`), `approve/` (`status='APPROVED'`, `is_active=True`), `reject/` (`status='REJECTED'`, `rejection_reason`). | Missing shop status state machine & admin queue APIs. | Build admin shop approval/rejection views, audit log records, and rejection reason tracking. |
| **Shop Login & Access** | Standard JWT authentication. API endpoints do not enforce shop ownership. | Authenticated shop users manage only their owned shop's profile, branches, flyers, products, and offers. | Missing `IsShopOwner` backend permission. Client sends untrusted `shop_id`. | Implement `IsShopOwner` permission. Resolve shop from `request.user` server-side. |
| **Shop Branches** | `StoreBranch` model exists with `store`, `name`, `city`, `locality`, `address`, `latitude`, `longitude`. | Full Shop Branch CRUD (`/api/v1/shop/branches/`) with geolocation and active state management. | Missing shop branch management API endpoints and ownership validation. | Build `ShopBranchViewSet` scoped to `request.user.owned_shop`. |
| **Flyer Upload & Processing** | `Flyer` model has `pdf_url`, `cover_image_url`, `page_count`. Processing states not tracked. | Flyer upload (`DRAFT` -> `PROCESSING` -> `PENDING_REVIEW`). Async PDF/image page rendering & OCR text extraction. | Missing processing status machine (`UPLOADED`, `PROCESSING`, `PROCESSED`, `FAILED`) & retry logic. | Add processing fields to `Flyer`. Build flyer upload & async processing pipeline. |
| **Flyer Approval** | Flyer status has `draft`, `active`, `expired`. No admin review queue. | Admin Flyer Queue (`GET /api/v1/admin/flyers/pending/`), `approve/` (`status='PUBLISHED'`), `reject/` (`status='REJECTED'`, `rejection_reason`). | Missing `PENDING_REVIEW` & `PUBLISHED` statuses and admin approval endpoints. | Extend `Flyer` status choices. Build admin flyer review & approval/rejection endpoints. |
| **Public Flyer Visibility** | Public API returns active flyers without checking shop approval status. | Public APIs return ONLY `PUBLISHED` flyers from `APPROVED` and `is_active=True` shops within valid date range (`start_date <= now <= end_date`). | Frontend handles status filtering instead of backend queryset security. | Enforce public queryset filtering on backend `Flyer.objects.filter(status='PUBLISHED', store__status='APPROVED', store__is_active=True)`. |
| **Flyer Viewer & Hotspots** | Next.js flyer viewer with synthetic hotspot JSON. | Interactive Flyer Viewer reading backend `FlyerPage` and `FlyerItem` hotspots (`x`, `y`, `width`, `height`). | Bounding box hotspots not backed by relational `FlyerItem` database records. | Create `FlyerItem` model linking `FlyerPage` -> `Product` -> `Offer` with hotspot coordinates. |
| **Product Detail Page** | General offer detail page. | Comprehensive Product Detail (`/api/v1/products/{slug}/`) with Product Image, Name, Brand, Description, Current Price, MRP, Shop, Source Flyer & Page, Validity, Available Branches, Map, Directions, and Related Products. | Product detail lacks source flyer page link, branch availability table, and map routing integration. | Build comprehensive `ProductDetailView` returning product, offer, flyer source page, branch availability, and map coordinates. |
| **Branch Availability** | Offers link to a single `store_branch`. | Explicit `OfferBranchAvailability` relationship model (`AVAILABLE`, `LIMITED`, `UNAVAILABLE`, `UNKNOWN`) and API (`/api/v1/products/{slug}/availability/`). | No multi-branch availability tracking per offer. | Create `OfferBranchAvailability` model & API endpoint. Default to `UNKNOWN` when inventory unconfirmed. |
| **Related Products** | Client-side category filtering. | Algorithmic scoring API (`GET /api/v1/products/{slug}/related/`) (+40 Category, +25 Brand, +20 Store, +15 Flyer) excluding current, expired, or unpublished items. | No backend recommendation scoring engine. | Implement weighted scoring recommendation engine in `RelatedProductsView`. |
| **Search Engine** | Multi-entity client search. | Unified backend search (`GET /api/v1/search/`) covering products, offers, stores, categories, and brands scoped to selected user location. | Search is not location-aware on backend. | Build location-scoped backend `GlobalSearchView` filtering non-public records. |
| **Location System** | `Country`, `State`, `City`, `Locality` models exist. Frontend Zustand location store. | Full location hierarchy filtering across public APIs and search. | Public API endpoints do not scope querysets by selected city/locality. | Add location filtering parameters to DRF viewsets and search pipeline. |

---

## Required Documentation Artifacts
1. `docs/current-vs-target-gap-analysis.md` (This document)
2. `docs/shop-workflow.md`
3. `docs/flyer-workflow.md`
4. `docs/product-workflow.md`
5. `docs/branch-availability.md`
6. `docs/related-products.md`
7. `docs/permissions.md`
8. `docs/status-transitions.md`
9. `docs/api-flow.md`
