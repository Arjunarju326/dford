# D4D-Style Retail Offers & Flyer Discovery Platform
## End-to-End Implementation Plan for Antigravity

**Document purpose:** Give an AI coding agent a complete, phase-by-phase engineering specification for building a D4D-style retail offers/flyer discovery platform.

**Primary implementation stack:** Next.js + TypeScript + Tailwind CSS + shadcn/ui + Django + Django REST Framework + PostgreSQL + Redis + Celery + object storage + Cloudflare.

**Execution model:** Antigravity writes the code. The developer/user reviews, runs the application, provides credentials/configuration, and approves each phase before moving to the next.

**Important:** The reference site is inspiration for functional scope and information architecture only. Do not copy its source code, protected branding, proprietary content, logos, images, or exact copyrighted design. Build an original brand, visual system, copy, assets, and data model.

---

# 1. PRODUCT DEFINITION

## 1.1 Product concept

Build a location-aware retail discovery platform where users can:

- discover current promotions
- browse stores
- browse flyers
- search products and offers
- filter offers by location and category
- view offer details
- save offers
- create shopping lists
- discover nearby branches
- compare offers across stores
- browse promotional content
- receive notifications for saved interests
- eventually receive personalized deal recommendations

The platform is a **discovery and comparison product**, not initially an e-commerce checkout platform.

## 1.2 Primary user types

### Guest
Can:
- browse home page
- browse categories
- browse stores
- browse flyers
- browse offers
- search
- filter
- view locations
- view offer details

Cannot:
- save favorites
- create lists
- receive personalized notifications
- manage profile

### Registered User
Can:
- do everything a guest can
- save offers
- favorite stores
- create shopping lists
- manage preferences
- select location
- receive notifications
- manage account
- remove saved content

### Admin
Can:
- manage stores
- manage branches
- manage categories
- manage brands
- manage products
- create/import offers
- upload flyers
- publish/unpublish content
- approve/reject content
- manage users
- manage locations
- manage advertisements
- view audit logs
- monitor processing jobs
- view analytics summaries

### Content Manager
Can:
- create/edit products
- create/edit offers
- upload flyers
- manage promotional content
- manage publishing lifecycle

Cannot:
- change system configuration
- manage administrator permissions

### Store/Retailer Account (future phase)
Can:
- manage own store profile
- submit flyers
- submit offers
- manage branches
- review performance
- purchase sponsored placement

---

# 2. REFERENCE-SITE FUNCTIONAL OBSERVATIONS

The reference platform demonstrates the following useful concepts:

- location-specific retail discovery
- local offers
- flyer discovery
- store/category navigation
- categories such as electronics, grocery, health & beauty, home, fashion, etc.
- search-oriented discovery
- multilingual/country-aware URL patterns
- user login
- “add your company” / retailer onboarding concepts
- shopping-list / favorite-offer style functionality

The current reference service describes itself as an aggregated retail promotions platform and states that it is primarily a search tool rather than an online purchase system.

Representative source:
- https://www.d4donline.com/terms
- https://www.d4donline.com/
- https://w3techs.com/sites/info/d4donline.com

Use these sources for **feature inspiration only**.

---

# 3. PROJECT GOALS

## 3.1 MVP goal

Launch a production-quality retail-offer discovery MVP with:

1. responsive home page
2. location selection
3. stores
4. store details
5. store branches
6. categories/subcategories
7. products
8. offers
9. flyers
10. flyer viewer
11. search
12. filters
13. user authentication
14. favorites
15. shopping lists
16. admin panel
17. publishing workflow
18. SEO-friendly public pages
19. analytics
20. logging
21. deployment
22. automated tests

## 3.2 Future goal

Add:

- OCR flyer extraction
- AI-assisted product extraction
- automatic categorization
- retailer portal
- personalized feed
- deal ranking
- price history
- coupon system
- push notifications
- sponsored listings
- advertising manager
- recommendation engine
- multilingual support
- mobile apps
- advanced analytics

---

# 4. TECHNOLOGY STACK

## 4.1 Frontend

### Required
- Next.js
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Lucide icons

### Recommended
- Zustand for small client-state requirements
- next/image
- next/font
- Playwright
- Vitest
- ESLint
- Prettier

## 4.2 Backend

- Python
- Django
- Django REST Framework
- django-filter
- SimpleJWT or secure cookie-based JWT strategy
- PostgreSQL
- Celery
- Redis
- django-cors-headers where necessary
- drf-spectacular for OpenAPI

## 4.3 Storage

Use object storage for:
- store logos
- product images
- offer images
- flyer PDFs
- flyer page images
- optimized thumbnails
- banners
- user-uploaded assets

Recommended:
- Cloudflare R2
or
- AWS S3

## 4.4 Infrastructure

- Docker
- Docker Compose for local development
- Nginx or managed reverse proxy
- Cloudflare
- Sentry
- GitHub Actions

## 4.5 Search evolution

Start:
- PostgreSQL trigram/full-text search

Later:
- OpenSearch or Elasticsearch

Do not introduce Elasticsearch on day one unless scale requires it.

## 4.6 Maps and location

Choose one:
- Mapbox
- Google Maps

Use geocoded branch coordinates:
- latitude
- longitude

---

# 5. HIGH-LEVEL ARCHITECTURE

```text
                         ┌───────────────────────┐
                         │      Cloudflare       │
                         │ CDN / DNS / WAF / TLS │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      Next.js Web      │
                         │       Frontend        │
                         └───────────┬───────────┘
                                     │ HTTPS / REST
                                     ▼
                         ┌───────────────────────┐
                         │     Django + DRF      │
                         │      REST API         │
                         └───────┬─────┬─────────┘
                                 │     │
                    ┌────────────┘     └──────────────┐
                    ▼                                  ▼
          ┌──────────────────┐                ┌─────────────────┐
          │   PostgreSQL     │                │      Redis      │
          │  relational data │                │ cache / broker  │
          └──────────────────┘                └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │     Celery      │
                                              │ background jobs │
                                              └───────┬─────────┘
                                                      │
                     ┌────────────────────────────────┼────────────────────┐
                     ▼                                ▼                    ▼
             ┌───────────────┐                ┌─────────────┐      ┌──────────────┐
             │ Object Store  │                │ OCR / AI    │      │ Notifications│
             │ S3 / R2       │                │ processing  │      │ email/push   │
             └───────────────┘                └─────────────┘      └──────────────┘
```

---

# 6. REPOSITORY STRUCTURE

Use a monorepo initially:

```text
retail-discovery-platform/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── styles/
│   │   ├── public/
│   │   └── tests/
│   │
│   └── api/
│       ├── config/
│       ├── apps/
│       │   ├── accounts/
│       │   ├── locations/
│       │   ├── stores/
│       │   ├── catalog/
│       │   ├── offers/
│       │   ├── flyers/
│       │   ├── shopping/
│       │   ├── favorites/
│       │   ├── notifications/
│       │   ├── advertising/
│       │   ├── analytics/
│       │   └── audit/
│       ├── manage.py
│       └── requirements/
│
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   └── scripts/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── product/
│   └── operations/
│
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── fixtures/
│
├── .github/
│   └── workflows/
│
├── .env.example
├── docker-compose.yml
├── README.md
└── DEVELOPMENT.md
```

---

# 7. DOMAIN MODEL

## 7.1 Country

Fields:
- id
- name
- code
- currency_code
- currency_symbol
- default_language
- is_active
- created_at
- updated_at

Constraints:
- code unique
- only active countries selectable by public UI

## 7.2 State / Province

Fields:
- id
- country_id
- name
- code
- is_active

Constraint:
- unique(country_id, name)

## 7.3 City

Fields:
- id
- state_id
- name
- slug
- latitude
- longitude
- is_active

Constraint:
- unique(state_id, slug)

## 7.4 Locality

Fields:
- id
- city_id
- name
- slug
- postal_code
- latitude
- longitude
- is_active

## 7.5 Store

Fields:
- id
- name
- slug
- legal_name
- description
- logo
- cover_image
- website_url
- contact_phone
- contact_email
- status
- is_verified
- is_featured
- sort_order
- seo_title
- seo_description
- created_at
- updated_at

Status:
- draft
- pending_review
- published
- suspended
- archived

## 7.6 Store Branch

Fields:
- id
- store_id
- name
- address_line_1
- address_line_2
- locality_id
- city_id
- postal_code
- latitude
- longitude
- phone
- opening_hours_json
- is_active
- created_at
- updated_at

Indexes:
- store_id
- city_id
- locality_id
- latitude/longitude if supported

## 7.7 Category

Fields:
- id
- parent_id nullable
- name
- slug
- description
- icon
- image
- is_featured
- sort_order
- is_active

Hierarchy:

```text
Electronics
├── Mobiles
├── TV
├── Computers
├── Tablets
├── Cameras
└── Appliances

Grocery
├── Rice
├── Oil
├── Dairy
├── Meat
└── Beverages

Health & Beauty
...
```

## 7.8 Brand

Fields:
- id
- name
- slug
- logo
- description
- is_active

## 7.9 Product

Fields:
- id
- category_id
- brand_id nullable
- name
- slug
- sku nullable
- barcode nullable
- description
- specifications_json
- primary_image
- gallery_images
- is_active
- created_at
- updated_at

Do not force one global product identity if retailer-specific packaging differs. Add product variants later.

## 7.10 Product Variant

Fields:
- id
- product_id
- variant_name
- size
- unit
- pack_quantity
- sku
- barcode
- attributes_json
- is_active

## 7.11 Offer

Fields:
- id
- store_id
- branch_id nullable
- product_id nullable
- variant_id nullable
- category_id
- title
- description
- original_price
- offer_price
- discount_type
- discount_value
- currency
- valid_from
- valid_until
- image
- terms
- source_type
- source_reference
- status
- is_featured
- created_by
- reviewed_by
- published_at
- created_at
- updated_at

Discount type:
- percentage
- fixed_amount
- buy_one_get_one
- bundle
- price_only
- custom

Offer status:
- draft
- pending_review
- published
- expired
- rejected
- archived

Business rule:
`expired` is a derived/state-transition condition based on `valid_until`, not a manual substitute for bad data.

## 7.12 Flyer

Fields:
- id
- store_id
- title
- slug
- description
- cover_image
- pdf_file nullable
- valid_from
- valid_until
- source
- status
- processing_status
- published_at
- created_by
- created_at
- updated_at

Processing states:
- uploaded
- queued
- processing
- processed
- failed

## 7.13 Flyer Page

Fields:
- id
- flyer_id
- page_number
- original_image
- web_image
- thumbnail
- width
- height
- extracted_text nullable
- processing_status
- created_at

Unique:
- unique(flyer_id, page_number)

## 7.14 Flyer Item

Optional advanced model connecting detected regions to offers:

- id
- flyer_page_id
- offer_id nullable
- bounding_box_json
- extracted_title
- extracted_price
- confidence_score
- reviewed_by
- status

## 7.15 Favorite Store

- id
- user_id
- store_id
- created_at

Unique:
- unique(user_id, store_id)

## 7.16 Saved Offer

- id
- user_id
- offer_id
- created_at

Unique:
- unique(user_id, offer_id)

## 7.17 Shopping List

- id
- user_id
- name
- is_default
- created_at
- updated_at

## 7.18 Shopping List Item

- id
- shopping_list_id
- product_id nullable
- offer_id nullable
- text
- quantity
- checked
- notes
- created_at
- updated_at

## 7.19 User Preferences

- user_id
- preferred_country
- preferred_state
- preferred_city
- preferred_locality
- language
- notification_settings_json

---

# 8. DATA INTEGRITY RULES

## Offer integrity

1. valid_from must be <= valid_until.
2. offer_price cannot be negative.
3. original_price cannot be negative.
4. percentage discount must be between 0 and 100 unless explicitly modeled as promotional copy.
5. If original_price and offer_price exist:
   - discount_percentage may be derived.
6. Published offers must belong to an active store.
7. Published offers must have a valid publication window.
8. Expired offers must not appear in “active” endpoints.
9. Deleted records should be soft-deleted where auditability matters.
10. Admin should see expired, archived, and rejected content separately.

## Flyer integrity

1. A flyer must have a store.
2. valid_from <= valid_until.
3. A published flyer requires either a PDF or at least one processed page.
4. Page numbers must be unique.
5. Failed processing should be retryable.
6. Uploading a new version must preserve the old version for audit if replacement/versioning is enabled.

---

# 9. FRONTEND ROUTES

## Public routes

```text
/
 /offers
 /offers/[slug]
 /category/[slug]
 /category/[parent]/[child]
 /stores
 /stores/[slug]
 /stores/[slug]/offers
 /stores/[slug]/flyers
 /flyers
 /flyers/[slug]
 /search
 /location
 /location/[country]
 /location/[country]/[state]
 /location/[country]/[state]/[city]
 /about
 /contact
 /privacy
 /terms
```

## Authenticated routes

```text
/account
/account/profile
/account/favorites
/account/stores
/account/offers
/account/lists
/account/lists/[id]
/account/notifications
```

## Admin routes

```text
/admin
/admin/stores
/admin/branches
/admin/categories
/admin/brands
/admin/products
/admin/offers
/admin/flyers
/admin/flyers/[id]
/admin/users
/admin/locations
/admin/advertising
/admin/audit
/admin/jobs
/admin/settings
```

---

# 10. HOME PAGE REQUIREMENTS

The home page must not simply look like an e-commerce product grid.

## Section order

1. announcement bar (optional)
2. header
3. location selector
4. hero/search area
5. quick category chips
6. trending offers
7. featured stores
8. latest flyers
9. top categories
10. nearby offers
11. personalized content for logged-in users
12. promotional banner
13. SEO content block
14. footer

## Mobile

Header:
- menu
- logo
- location
- search icon
- user/account

Search:
- full-width
- rounded input
- search icon
- microphone icon optional in future

Offer cards:
- image
- store
- title
- original price
- offer price
- discount
- validity
- save button

---

# 11. TEST UI PHASE

This phase is specifically required by the project owner.

## Goal

Create a functional UI using:
- placeholder images
- generated gradients
- generic product images
- mock JSON data
- local icons
- no final branding
- no final colors
- no final logo
- no final typography decision

The goal is to validate:
- information architecture
- component sizing
- spacing
- navigation
- mobile responsiveness
- browsing flow

Do NOT delay backend integration because of final visual design.

## Test UI pages

Build first:

1. home
2. offers list
3. offer detail
4. store list
5. store detail
6. flyer list
7. flyer viewer
8. category page
9. search result
10. favorites
11. shopping list
12. login
13. admin dashboard

## Mock data requirements

Create 20-50 realistic records for each major entity.

Use synthetic names.

Example stores:
- FreshMart
- City Electronics
- Daily Basket
- HomePlus
- Style Avenue

Do not use real retailer trademarks in test data unless the project has rights to use them.

---

# 12. FINAL UI PHASE

After information architecture is approved:

Replace test UI with:
- final design system
- brand palette
- final typography
- final logo
- final imagery
- refined cards
- polished mobile navigation
- loading skeletons
- empty states
- error states
- hover states
- focus states
- active states
- disabled states
- accessibility improvements

---

# 13. DESIGN SYSTEM

## General direction

Recommended visual language:
- modern discovery platform
- clean
- high information density but not cluttered
- strong offer price hierarchy
- clear discount badges
- compact store identity
- rounded cards with restrained shadows
- neutral background
- highly readable typography

Do not blindly clone the reference site.

## Typography hierarchy

- Display
- H1
- H2
- H3
- Body large
- Body
- Caption
- Metadata
- Price
- Discount
- Button

## Spacing

Use a 4/8-based spacing system.

## Radius

Use:
- small
- medium
- large
- pill

## States

Every interactive component must define:
- default
- hover
- active
- focused
- disabled
- loading
- error

---

# 14. OFFER CARD SPECIFICATION

Desktop:

```text
┌─────────────────────────────┐
│           image             │
│                       ♥     │
├─────────────────────────────┤
│ Store Name                  │
│ Product title               │
│                             │
│ ₹ 2,499                     │
│ ₹ 3,499   28% OFF           │
│                             │
│ Valid until 20 Aug          │
└─────────────────────────────┘
```

Required fields:
- image
- store
- title
- offer price
- original price if available
- discount
- expiry
- save action

Optional:
- category
- branch
- badge
- sponsored indicator

---

# 15. OFFER DETAIL PAGE

Sections:

1. breadcrumb
2. gallery
3. title
4. store
5. price
6. discount
7. valid dates
8. terms
9. availability
10. save offer
11. add to shopping list
12. nearby branches
13. map
14. related offers
15. similar products
16. retailer information
17. report issue

SEO:
- canonical URL
- OpenGraph
- JSON-LD
- descriptive title
- description

---

# 16. STORE PAGE

Sections:

1. cover/header
2. logo
3. store name
4. verification state
5. description
6. branch summary
7. current offers
8. current flyers
9. popular categories
10. map
11. contact
12. website
13. favorite store
14. report issue

---

# 17. FLYER VIEWER

Requirements:

- responsive page viewer
- zoom
- pinch zoom on mobile
- previous/next page
- page counter
- thumbnail strip
- download/open action if permitted
- text accessibility
- loading state
- broken image state
- keyboard navigation
- fullscreen mode on supported browsers

Advanced:
- clickable flyer regions
- offer overlays
- deep links to extracted offers

---

# 18. SEARCH SYSTEM

## Search inputs

Search:
- products
- offers
- stores
- categories
- brands

## Search ranking

Initial weighted scoring:

```text
exact product name       high
exact store name         high
prefix name              medium-high
brand match              medium-high
category match           medium
description match        low
```

## Filters

- location
- store
- category
- subcategory
- brand
- min price
- max price
- discount
- valid date
- featured
- newest
- ending soon

## Sort

- relevance
- newest
- price low-high
- price high-low
- discount high-low
- ending soon
- popularity

---

# 19. LOCATION SYSTEM

Priority:

```text
Country
  ↓
State
  ↓
City
  ↓
Locality
  ↓
Nearby branches
```

Future GPS flow:

1. ask browser geolocation permission
2. if accepted, get coordinates
3. resolve nearest supported city
4. ask user to confirm
5. store preference
6. filter content

Never make location permission mandatory.

Fallback:
- manual location selection

---

# 20. API DESIGN

Base:
`/api/v1/`

## Auth

```text
POST /auth/register/
POST /auth/login/
POST /auth/refresh/
POST /auth/logout/
GET  /auth/me/
PATCH /auth/me/
POST /auth/change-password/
POST /auth/forgot-password/
POST /auth/reset-password/
```

## Locations

```text
GET /countries/
GET /states/
GET /cities/
GET /localities/
GET /locations/resolve/
GET /locations/nearby/
```

## Stores

```text
GET /stores/
GET /stores/{slug}/
GET /stores/{slug}/offers/
GET /stores/{slug}/flyers/
GET /stores/{slug}/branches/
```

## Categories

```text
GET /categories/
GET /categories/{slug}/
GET /categories/{slug}/offers/
```

## Products

```text
GET /products/
GET /products/{slug}/
GET /products/{slug}/offers/
```

## Offers

```text
GET /offers/
GET /offers/{slug}/
POST /offers/{id}/save/
DELETE /offers/{id}/save/
POST /offers/{id}/report/
```

## Flyers

```text
GET /flyers/
GET /flyers/{slug}/
GET /flyers/{slug}/pages/
```

## Favorites

```text
GET /me/favorite-stores/
POST /me/favorite-stores/{store_id}/
DELETE /me/favorite-stores/{store_id}/

GET /me/saved-offers/
POST /me/saved-offers/{offer_id}/
DELETE /me/saved-offers/{offer_id}/
```

## Shopping lists

```text
GET /me/lists/
POST /me/lists/
GET /me/lists/{id}/
PATCH /me/lists/{id}/
DELETE /me/lists/{id}/

POST /me/lists/{id}/items/
PATCH /me/lists/{id}/items/{item_id}/
DELETE /me/lists/{id}/items/{item_id}/
```

## Search

```text
GET /search/?q=
```

Return grouped:
- offers
- stores
- products
- categories

---

# 21. API RESPONSE STANDARD

Every API response should have predictable structure.

Success collection:

```json
{
  "count": 120,
  "next": "...",
  "previous": null,
  "results": []
}
```

Success detail:

```json
{
  "data": {}
}
```

Validation error:

```json
{
  "code": "validation_error",
  "message": "Validation failed.",
  "errors": {
    "field": [
      "Error message."
    ]
  }
}
```

General error:

```json
{
  "code": "server_error",
  "message": "Something went wrong."
}
```

Never expose Python tracebacks in production.

---

# 22. DJANGO APP BOUNDARIES

Create:

```text
accounts
locations
stores
catalog
offers
flyers
shopping
favorites
notifications
advertising
analytics
audit
core
```

Keep each app responsible for its own domain.

Do not create one giant `models.py`.

---

# 23. SERIALIZERS

Use separate serializers for:
- list
- detail
- create
- update
- admin
- compact nested representation

Example:

```text
OfferListSerializer
OfferDetailSerializer
OfferCreateSerializer
OfferUpdateSerializer
OfferAdminSerializer
```

Never return every related object in every serializer.

Prevent N+1 queries.

---

# 24. QUERY OPTIMIZATION

Use:
- select_related
- prefetch_related
- only
- defer
- annotations
- database indexes
- pagination
- queryset reuse

Example:
Offer list should not execute:
- one query for offers
- one query per store
- one query per product
- one query per category

Target:
- bounded query count
- measured using Django Debug Toolbar in development
- enforce with tests for important endpoints

---

# 25. DATABASE INDEX PLAN

Initial indexes:

Stores:
- slug
- status
- is_featured

Branches:
- store_id
- city_id
- locality_id
- is_active

Products:
- slug
- category_id
- brand_id
- barcode
- sku

Offers:
- slug
- store_id
- product_id
- category_id
- valid_from
- valid_until
- status
- is_featured

Flyers:
- slug
- store_id
- valid_from
- valid_until
- status

Users:
- email
- username if used

---

# 26. CACHING STRATEGY

Cache:
- categories
- popular stores
- featured stores
- homepage sections
- location lists
- trending offers
- public flyer summaries

Do not blindly cache:
- authenticated personalized endpoints
- admin mutations
- user-specific lists

Use short TTLs for rapidly changing content.

Invalidate cache when:
- offer is published
- offer changes
- flyer is published
- store changes
- category changes

---

# 27. OFFER LIFECYCLE

```text
Draft
  ↓
Pending Review
  ↓
Approved
  ↓
Published
  ↓
Expired
  ↓
Archived
```

Reject path:

```text
Pending Review
      ↓
Rejected
      ↓
Draft
```

Admin must be able to see:
- who created it
- who approved it
- who rejected it
- when status changed
- rejection reason

---

# 28. FLYER PROCESSING LIFECYCLE

```text
Upload
 ↓
Validate
 ↓
Create Flyer record
 ↓
Queue Celery task
 ↓
Extract pages
 ↓
Generate web images
 ↓
Generate thumbnails
 ↓
Optional OCR
 ↓
Save processing result
 ↓
Admin review
 ↓
Publish
```

Failure path:

```text
Processing
   ↓
Failed
   ↓
Retry
```

Need:
- max retries
- error message
- admin retry action
- job logs

---

# 29. OCR / AI FUTURE ARCHITECTURE

Do not tightly couple OCR to the primary offer creation transaction.

Use:

```text
Flyer
 ↓
Celery
 ↓
OCR service
 ↓
Extract text
 ↓
AI normalization
 ↓
Candidate product/offer records
 ↓
Admin review
 ↓
Publish
```

AI output must be treated as **candidate data**, not automatically trusted business data.

Require:
- confidence
- original text
- source page
- extraction timestamp
- model metadata if applicable
- human review flag

---

# 30. AUTHENTICATION

Recommended browser approach:
- secure HttpOnly cookies
- SameSite configured appropriately
- CSRF protection for cookie-authenticated mutation flows

Alternative:
- short-lived access token
- refresh token
- secure storage strategy

Never:
- store long-lived secrets in localStorage if avoidable
- expose refresh token to arbitrary JS
- return passwords
- log authentication secrets

Add:
- rate limits
- login attempt monitoring
- password reset
- email verification if required

---

# 31. SECURITY REQUIREMENTS

Must include:

- HTTPS
- secure cookies
- CORS restriction
- CSRF protection where applicable
- API throttling
- input validation
- object-level authorization
- admin role checks
- file type validation
- file size limits
- malware scanning strategy for uploaded documents
- signed/private object URLs where needed
- SQL injection protection through ORM
- XSS-safe rendering
- safe HTML sanitization
- audit logs
- secret management
- production DEBUG=False

Do not trust:
- client-side roles
- client-side prices
- client-side dates
- uploaded filenames
- MIME type alone

---

# 32. FILE UPLOAD SECURITY

Allowed:
- JPEG
- PNG
- WebP
- PDF

Validate:
- extension
- MIME
- magic bytes where possible
- file size
- image dimensions
- PDF parsing safety

Rename uploads with generated IDs.

Do not serve user-controlled executable content.

---

# 33. ADMIN DASHBOARD REQUIREMENTS

Dashboard cards:

- active offers
- offers expiring today
- pending reviews
- active flyers
- processing jobs
- failed jobs
- registered users
- featured stores

Recent activity:
- offer published
- flyer uploaded
- product created
- store approved
- user registered

Admin filters:
- date range
- store
- category
- status
- creator

---

# 34. ANALYTICS EVENTS

Track events:

```text
page_view
search_performed
search_result_clicked
offer_viewed
offer_saved
offer_unsaved
store_viewed
store_favorited
flyer_viewed
flyer_page_viewed
flyer_zoomed
shopping_list_created
shopping_list_item_added
location_changed
map_opened
branch_directions_clicked
```

Do not collect unnecessary personal data.

---

# 35. SEO PLAN

Every public entity page needs:

- stable slug
- title
- description
- canonical
- OpenGraph
- Twitter/X card
- sitemap entry
- robots behavior
- JSON-LD where appropriate

Schema types may include:
- Organization
- LocalBusiness
- Product
- Offer
- BreadcrumbList
- ItemList

Do not generate misleading structured data.

---

# 36. SEO URL STRATEGY

Prefer:

```text
/offers/samsung-55-inch-tv
/stores/freshmart
/flyers/freshmart-weekly-deals
/category/electronics/tv
/location/india/kerala/kochi
```

Avoid:

```text
/product?id=1021
/store?id=12
```

as the only public URLs.

Use IDs internally and slugs publicly.

---

# 37. SEO DUPLICATE-CONTENT RULES

Do not create thousands of thin pages solely to generate SEO traffic.

Only index pages with useful content.

Use canonical/noindex for:
- empty filters
- duplicate sort URLs
- internal search variants if required
- parameter combinations with no meaningful content

---

# 38. ACCESSIBILITY

Target WCAG 2.2 AA where practical.

Requirements:
- keyboard navigation
- visible focus
- semantic headings
- alt text
- button names
- form labels
- contrast
- reduced motion
- accessible modals
- accessible drawer
- screen-reader-friendly prices and dates

---

# 39. RESPONSIVE BREAKPOINTS

Support:
- 320px
- 375px
- 390px
- 430px
- 768px
- 1024px
- 1280px
- 1440px
- 1920px

Test:
- iPhone-size mobile
- Android-size mobile
- tablet
- laptop
- desktop
- large desktop

---

# 40. LOADING / EMPTY / ERROR STATES

Every page must have:

### Loading
- skeleton cards
- skeleton text
- image placeholders

### Empty
Examples:
- no offers found
- no saved offers
- no flyers
- no stores nearby
- no shopping list items

### Error
- API failed
- image failed
- flyer processing failed
- location unavailable

### Offline-ish
Show useful retry action where appropriate.

---

# 41. UI COMPONENT LIBRARY

Create reusable components:

```text
AppShell
Header
MobileHeader
DesktopHeader
Footer
SearchBar
LocationPicker
CategoryChip
CategoryGrid
OfferCard
OfferGrid
OfferBadge
PriceBlock
DiscountBadge
StoreCard
StoreLogo
FlyerCard
FlyerViewer
FlyerThumbnail
FilterBar
FilterDrawer
SortSelect
Pagination
MapCard
BranchCard
FavoriteButton
SaveOfferButton
ShoppingListButton
Modal
Drawer
Toast
Dialog
EmptyState
ErrorState
Skeleton
Breadcrumbs
```

Do not duplicate card logic across pages.

---

# 42. MOBILE NAVIGATION

Bottom navigation:

```text
Home
Explore
Search
Saved
Account
```

Do not make the bottom nav too crowded.

Use mobile drawer for:
- categories
- locations
- filters
- account menus

---

# 43. PERFORMANCE BUDGET

Target:
- fast first contentful paint
- responsive interaction
- optimized image loading
- minimal JS on public pages
- server-rendered content where useful

Rules:
- next/image
- responsive image sizes
- lazy load below-the-fold images
- defer third-party scripts
- avoid huge client components
- use server components where appropriate
- paginate offer grids

Do not ship an entire icon library to the browser unnecessarily.

---

# 44. TESTING STRATEGY

## Backend unit tests
Test:
- models
- validators
- services
- serializers
- permissions
- utility functions

## API tests
Test:
- auth
- permissions
- filtering
- pagination
- search
- offer lifecycle
- flyer lifecycle

## Frontend tests
Test:
- components
- forms
- state behavior
- API states

## E2E
Use Playwright.

Critical journeys:

1. guest opens home
2. user selects city
3. user searches
4. user opens offer
5. user saves offer
6. user creates shopping list
7. user opens flyer
8. user logs in
9. admin creates store
10. admin publishes offer
11. admin uploads flyer

---

# 45. ACCEPTANCE CRITERIA

A phase cannot be marked complete just because code compiles.

Every phase needs:

- implementation complete
- tests passing
- no blocking console errors
- no unresolved runtime errors
- mobile check
- desktop check
- API contract check
- database migration check
- loading/empty/error states
- documentation updated
- acceptance criteria checked

---

# 46. DEVELOPMENT ENVIRONMENT

Use Docker Compose:

```text
web
api
postgres
redis
celery
celery-beat
```

Optional:
- mailhog
- minio for local object storage

Recommended local commands:

```bash
docker compose up -d
```

Frontend:
```bash
npm run dev
```

Backend:
```bash
python manage.py runserver
```

Celery:
```bash
celery -A config worker -l info
```

Scheduler:
```bash
celery -A config beat -l info
```

---

# 47. ENVIRONMENT VARIABLES

Frontend:
```text
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_MAP_PROVIDER=
NEXT_PUBLIC_ANALYTICS_ID=
```

Backend:
```text
SECRET_KEY=
DEBUG=
ALLOWED_HOSTS=
DATABASE_URL=
REDIS_URL=
CELERY_BROKER_URL=
CELERY_RESULT_BACKEND=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_ENDPOINT_URL=
SENTRY_DSN=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

Never commit actual secrets.

---

# 48. SEED DATA

Create a safe development seed command:

```bash
python manage.py seed_demo
```

Seed:
- countries
- states
- cities
- categories
- brands
- stores
- branches
- products
- offers
- flyers
- users

Create predictable test accounts:
- admin
- content manager
- normal user

Use obviously fake development credentials.

---

# 49. OBSERVABILITY

Use:
- application logs
- structured logs
- Sentry
- uptime monitoring
- health endpoints

Health:
```text
GET /health/
GET /ready/
```

Health must verify:
- database
- Redis optionally
- app readiness

Do not expose internal secrets or connection strings.

---

# 50. BACKUPS

PostgreSQL:
- daily backup
- retention
- restore test

Object storage:
- versioning if appropriate
- lifecycle rules
- backup policy

Write a restore runbook.

---

# 51. DEPLOYMENT PLAN

## Staging

```text
Cloudflare
  ↓
Next.js
  ↓
Django API
  ↓
Managed PostgreSQL
  ↓
Redis
  ↓
Object Storage
```

## Production

Use:
- separate database
- separate storage bucket
- separate Redis
- separate environment variables
- separate domains
- Sentry project
- Cloudflare WAF
- backup schedule

---

# 52. DOMAIN SETUP

Example:

```text
www.example.com
api.example.com
admin.example.com
```

Potentially:
```text
media.example.com
```

Do not expose Django admin directly at an obvious default path if the project is public; use stronger access controls regardless of URL.

---

# 53. ADMIN SECURITY

Admin:
- require strong authentication
- enforce staff permissions
- consider MFA
- log login activity
- limit superuser count
- use separate staff roles
- review permission inheritance

---

# 54. EMAILS

Prepare templates for:
- verify email
- password reset
- welcome
- account change
- notification
- store approval
- offer approval
- flyer processing failure

---

# 55. NOTIFICATIONS

Start with:
- in-app notifications

Later:
- email
- push notifications
- web push

Notification preferences:
- favorite store new offer
- saved category new offer
- offer expiring
- flyer published
- weekly digest

---

# 56. SHOPPING LIST UX

Users can:

```text
Create list
↓
Add item
↓
Set quantity
↓
Mark purchased
↓
Remove
```

Advanced future:
- add offer directly
- add store
- sort by store
- suggested products
- share list
- export list

---

# 57. FAVORITES

Store favorite:
- new offer notification
- new flyer notification

Saved offer:
- watch expiry
- notify if changed
- add to list

---

# 58. SPONSORED CONTENT

Model separately from normal offers.

Fields:
- advertiser
- campaign
- placement
- start/end
- budget
- priority
- target location
- target category
- click tracking
- impression tracking

Sponsored content must be visually labeled.

---

# 59. MONETIZATION

Possible:
1. featured store
2. sponsored offer
3. banner advertising
4. retailer subscription
5. retailer analytics
6. premium retailer tools
7. affiliate links where legally/commercially appropriate

Do not implement monetization deeply during MVP unless required.

---

# 60. DATA INGESTION OPTIONS

## Manual

Admin enters:
- store
- offer
- product
- price
- expiry

Best for first controlled launch.

## CSV import

Add:
- CSV template
- validation
- preview
- import
- error report
- duplicate handling

## Flyer upload

Admin uploads:
- PDF
- page images

Then processes.

## Future automation

- OCR
- retailer APIs
- supplier feeds
- scheduled imports
- AI normalization

---

# 61. CSV IMPORT REQUIREMENTS

CSV columns:

```text
store
branch
product
category
brand
title
original_price
offer_price
discount_type
discount_value
valid_from
valid_until
image_url
```

Validation flow:

```text
Upload
↓
Parse
↓
Validate rows
↓
Show preview
↓
Show errors
↓
Admin confirms
↓
Import transactionally
↓
Generate report
```

Never silently skip invalid rows.

---

# 62. DUPLICATE DETECTION

For offers, compare:
- store
- normalized product
- dates
- price
- source reference

For products:
- barcode where present
- SKU where appropriate
- normalized brand/name

Use human review for uncertain duplicates.

---

# 63. AUDIT LOGGING

Record:
- actor
- action
- entity
- entity ID
- before
- after
- timestamp
- IP where legally appropriate
- user agent where appropriate

Actions:
- create
- update
- delete
- publish
- unpublish
- approve
- reject
- archive
- login
- role change

---

# 64. REPORT-AN-OFFER

Users can report:
- incorrect price
- expired offer
- wrong store
- wrong image
- duplicate
- inappropriate content
- other

Admin workflow:
- pending
- reviewed
- resolved
- dismissed

---

# 65. LEGAL / CONTENT REQUIREMENTS

Need pages:
- terms
- privacy
- cookie notice/consent if applicable
- contact
- content/report policy

Clearly explain:
- offers can expire
- prices can change
- retailer is responsible for in-store pricing where applicable
- platform is a discovery tool

Have legal counsel review final terms and privacy wording before public launch.

---

# 66. API DOCUMENTATION

Generate OpenAPI automatically.

Document:
- endpoint
- request
- response
- auth
- errors
- query parameters
- examples

Publish docs only where safe.

---

# 67. CODE QUALITY RULES FOR ANTIGRAVITY

Antigravity must:

1. inspect existing code before modifying it
2. never overwrite unrelated code
3. preserve working functionality
4. create small focused modules
5. avoid giant components
6. avoid giant Django views
7. add tests with important logic
8. use typed interfaces
9. handle loading/error/empty states
10. document architectural decisions
11. use migrations
12. avoid raw SQL unless justified
13. avoid duplicate API logic
14. avoid hardcoded secrets
15. keep dependencies minimal
16. run lint/typecheck/tests after meaningful changes

---

# 68. MASTER ANTIGRAVITY PROMPT

Paste this into the coding agent before phase work:

```text
You are the senior full-stack engineer responsible for implementing a location-aware retail offers and flyer discovery platform.

Do not attempt to generate the whole application in one step.

Work strictly in phases.

TECH STACK:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Django
- Django REST Framework
- PostgreSQL
- Redis
- Celery
- Docker
- S3-compatible object storage

PRODUCT:
This platform lets users discover retail offers, flyers, stores, categories, products, locations, favorites and shopping lists. It is a discovery platform, not an initial checkout platform.

ENGINEERING RULES:
1. Inspect the current repository before changing anything.
2. Do not delete or overwrite unrelated functionality.
3. Keep domain boundaries clear.
4. Use migrations for database changes.
5. Use API versioning.
6. Use serializers appropriate for list/detail/create/update.
7. Avoid N+1 queries.
8. Add indexes for high-volume filters.
9. Add loading, empty, error and success states in UI.
10. Make public pages SEO-friendly.
11. Make all public pages mobile-first.
12. Do not use real company trademarks or copyrighted assets in demo data unless authorized.
13. Use placeholder/demo assets during test UI.
14. Use environment variables for secrets.
15. Add automated tests for business-critical behavior.
16. Run lint, typecheck and tests after each significant phase.
17. Provide a concise implementation report after each phase.
18. Do not silently invent business rules; document assumptions in docs/assumptions.md.
19. Never expose internal errors to end users.
20. Never mark a phase complete if the acceptance criteria are not met.

DELIVERY FORMAT FOR EVERY PHASE:
- files created
- files changed
- migrations
- API routes
- UI routes
- tests added
- commands executed
- known issues
- acceptance criteria status
- next phase recommendation

First inspect the repository and produce a technical assessment.
Do not code until the requested phase is explicitly started.
```

---

# 69. PHASE 0 — REPOSITORY AUDIT

## Goal

Understand the existing codebase.

## Prompt

```text
PHASE 0 — REPOSITORY AUDIT

Inspect the entire existing repository.

Do not modify files yet.

Report:
1. frontend framework
2. backend framework
3. package managers
4. database configuration
5. environment files
6. existing authentication
7. existing models
8. existing APIs
9. existing UI components
10. existing routing
11. existing tests
12. existing deployment files
13. technical debt
14. security risks
15. missing dependencies
16. recommended migration path

Create:
docs/repository-audit.md
docs/architecture/decision-log.md
docs/assumptions.md

Do not invent existing functionality.
```

Acceptance:
- audit file exists
- architecture decisions documented
- no application code changed

---

# 70. PHASE 1 — PROJECT FOUNDATION

## Goal

Create production-ready repository foundation.

## Prompt

```text
PHASE 1 — FOUNDATION

Set up the full project foundation.

Frontend:
- Next.js App Router
- TypeScript
- Tailwind
- shadcn/ui
- TanStack Query
- Zod
- React Hook Form
- ESLint
- Prettier

Backend:
- Django
- DRF
- PostgreSQL
- Redis
- Celery
- drf-spectacular

Infrastructure:
- Docker
- docker-compose
- .env.example
- health endpoints

Create:
- README
- DEVELOPMENT.md
- architecture docs

Do not implement business features yet.

Acceptance:
- frontend starts
- backend starts
- PostgreSQL connects
- Redis connects
- Celery starts
- API health works
- frontend can call backend
- lint passes
- typecheck passes
- baseline tests pass
```

---

# 71. PHASE 2 — DATABASE AND CORE DOMAIN

## Goal

Build the foundational data model.

## Prompt

```text
PHASE 2 — CORE DOMAIN

Implement:
- Country
- State
- City
- Locality
- Store
- StoreBranch
- Category
- Brand
- Product
- ProductVariant
- Offer
- Flyer
- FlyerPage

Requirements:
- proper foreign keys
- slug fields
- status choices
- timestamps
- soft deletion where required
- audit-friendly fields
- database indexes
- unique constraints
- validation

Create migrations.

Create admin configuration.

Create model tests for business constraints.

Do not build advanced OCR yet.
```

Acceptance:
- migrations apply cleanly
- rollback strategy documented
- constraints tested
- admin CRUD works

---

# 72. PHASE 3 — AUTHENTICATION AND USERS

## Prompt

```text
PHASE 3 — AUTH

Implement:
- registration
- login
- logout
- token/session refresh
- current user
- profile
- password reset
- password change
- roles
- permissions

Roles:
- user
- content_manager
- admin
- superadmin

Security:
- rate limiting
- secure cookies if cookie auth
- CSRF strategy
- password hashing
- authorization checks
- no sensitive values in logs

Frontend:
- login
- registration
- account
- route protection
- auth-aware navigation
```

---

# 73. PHASE 4 — TEST UI FIRST

This phase is intentionally before final design.

## Prompt

```text
PHASE 4 — TEST UI

Build the entire frontend using mock data.

Pages:
- home
- offers
- offer detail
- stores
- store detail
- flyers
- flyer viewer
- category
- search
- favorites
- shopping lists
- login
- account
- basic admin dashboard

Requirements:
- mobile-first
- responsive
- generic placeholder images
- no final brand assets
- no final logo
- no copyrighted source images
- use local mock JSON
- demonstrate every user flow
- include loading/error/empty states

Do not spend time on visual perfection.

The objective is to validate:
- routing
- information architecture
- content hierarchy
- card dimensions
- page composition
- mobile navigation
- filtering interactions

Create:
docs/ui-test-phase.md
```

Acceptance:
- all listed routes work
- desktop and mobile usable
- no broken navigation
- mock data can be switched later to APIs

---

# 74. PHASE 5 — LOCATION SYSTEM

## Prompt

```text
PHASE 5 — LOCATION

Implement:
- country/state/city/locality APIs
- location selector
- preferred location
- location persistence
- nearby branches
- geolocation permission flow
- manual fallback
- location-aware offer filtering

Rules:
- never require GPS permission
- users may manually select location
- store selected location in account for logged-in users
- guest location can use cookie/local state

Tests:
- selection
- persistence
- invalid location
- nearby search
```

---

# 75. PHASE 6 — STORES AND BRANCHES

## Prompt

```text
PHASE 6 — STORES

Implement:
- store CRUD in admin
- branch CRUD
- store list API
- store detail API
- store offers API
- store flyers API
- branch/map API

Frontend:
- stores list
- store detail
- branch list
- nearby branches
- favorite store

Add:
- pagination
- filtering
- sorting
- empty states
- loading states
- SEO metadata
```

---

# 76. PHASE 7 — CATEGORIES, PRODUCTS, OFFERS

## Prompt

```text
PHASE 7 — CATALOG AND OFFERS

Implement:
- category tree
- brand management
- product CRUD
- variant support
- offer CRUD
- offer status lifecycle
- publish/unpublish
- expiry handling
- featured offers

Frontend:
- category pages
- product pages
- offers page
- offer details
- filter drawer
- sorting
- pagination

Business rules:
- invalid dates rejected
- negative prices rejected
- expired offers excluded from active feeds
- published offer must belong to active store
- admin review workflow
```

---

# 77. PHASE 8 — SEARCH

## Prompt

```text
PHASE 8 — SEARCH

Build search across:
- offers
- products
- stores
- brands
- categories

Implement:
- query normalization
- relevance weighting
- pagination
- filters
- sort
- autocomplete
- recent searches for logged-in users if appropriate

Start with PostgreSQL.

Do not introduce OpenSearch unless performance tests justify it.

Add search API tests and query performance tests.
```

---

# 78. PHASE 9 — FLYERS

## Prompt

```text
PHASE 9 — FLYERS

Implement:
- flyer upload
- PDF validation
- image validation
- object storage integration
- flyer record
- flyer page extraction
- image optimization
- thumbnail generation
- processing status
- retry logic
- admin review
- publish/unpublish

Frontend:
- flyer list
- flyer detail
- flyer viewer
- zoom
- thumbnails
- page navigation
- mobile swipe behavior
- fullscreen where supported
```

---

# 79. PHASE 10 — SHOPPING AND FAVORITES

## Prompt

```text
PHASE 10 — PERSONAL FEATURES

Implement:
- favorite stores
- saved offers
- shopping lists
- list items
- quantities
- checked state
- notes
- account pages

Ensure:
- authenticated ownership checks
- pagination
- proper optimistic UI only where safe
- rollback on mutation failure
```

---

# 80. PHASE 11 — FINAL UI / DESIGN SYSTEM

## Prompt

```text
PHASE 11 — FINAL UI

Replace test UI styling with the approved final design system.

Requirements:
- final palette
- typography
- spacing scale
- radii
- buttons
- cards
- badges
- filters
- nav
- footer
- empty states
- skeletons
- error states

Do not alter working business logic.

Do a full responsive pass.

Test:
- 320
- 375
- 390
- 430
- 768
- 1024
- 1280
- 1440
- 1920
```

---

# 81. PHASE 12 — SEO

## Prompt

```text
PHASE 12 — SEO

Implement:
- metadata per page
- canonical URLs
- sitemap
- robots.txt
- OpenGraph
- JSON-LD
- breadcrumbs
- index/noindex strategy
- stable slugs
- server rendered public content
- pagination SEO strategy

Prevent duplicate indexing for:
- sort parameters
- filter combinations
- empty search pages

Create SEO documentation.
```

---

# 82. PHASE 13 — ANALYTICS

## Prompt

```text
PHASE 13 — ANALYTICS

Implement analytics events:
- page_view
- search
- offer_view
- offer_save
- store_view
- store_favorite
- flyer_view
- flyer_page_view
- location_change
- shopping_list_create
- shopping_list_item_add
- map_open
- directions_click

Do not send passwords, private notes, or sensitive user data.

Build an analytics event abstraction so providers can be swapped.
```

---

# 83. PHASE 14 — ADMIN WORKFLOW

## Prompt

```text
PHASE 14 — ADMIN

Build production admin features:
- dashboard
- moderation queues
- stores
- branches
- products
- categories
- brands
- offers
- flyers
- users
- locations
- jobs
- audit logs
- reports

Add:
- search
- filters
- sorting
- bulk actions
- confirmation dialogs
- permission guards
```

---

# 84. PHASE 15 — OCR AND AI (OPTIONAL)

## Prompt

```text
PHASE 15 — OCR / AI

Implement flyer processing as asynchronous jobs.

Pipeline:
upload
→ validate
→ page extraction
→ OCR
→ structured candidate extraction
→ duplicate matching
→ confidence score
→ admin review
→ publish

Never auto-publish low-confidence AI data.

Store:
- extracted text
- source page
- bounding boxes
- confidence
- extraction job ID
- review state
```

---

# 85. PHASE 16 — PERFORMANCE

## Prompt

```text
PHASE 16 — PERFORMANCE

Audit:
- database queries
- API latency
- bundle size
- image sizes
- rendering mode
- caching
- search latency
- background job duration

Fix:
- N+1 queries
- overfetching
- oversized images
- unnecessary client components
- unnecessary third-party scripts

Add caching:
- homepage
- categories
- featured stores
- trending offers
```

---

# 86. PHASE 17 — SECURITY HARDENING

## Prompt

```text
PHASE 17 — SECURITY

Perform full security review.

Check:
- auth
- authorization
- CSRF
- CORS
- rate limiting
- file uploads
- admin endpoints
- object storage
- secrets
- logging
- XSS
- SSRF risks
- unsafe redirects
- mass assignment
- IDOR
- permission bypass
- exposed debug information

Produce:
docs/security-audit.md

Fix all high severity findings before deployment.
```

---

# 87. PHASE 18 — TESTING

## Prompt

```text
PHASE 18 — QA

Build:
- backend unit tests
- API integration tests
- frontend component tests
- Playwright E2E

Critical E2E:
guest browse
search
location
offer detail
save offer
shopping list
flyer viewer
login
admin publish offer
admin upload flyer

Run test suite in CI.
```

---

# 88. PHASE 19 — DEPLOYMENT

## Prompt

```text
PHASE 19 — PRODUCTION

Prepare:
- Docker production images
- environment variables
- migrations
- static files
- object storage
- reverse proxy
- HTTPS
- Cloudflare
- CI/CD
- health checks
- logging
- Sentry
- backup jobs

Create:
- deployment guide
- rollback guide
- backup/restore guide
- incident guide
```

---

# 89. PHASE 20 — PRODUCTION READINESS

## Prompt

```text
PHASE 20 — FINAL READINESS

Run a release audit.

Check every route.
Check every API.
Check authentication.
Check authorization.
Check all CRUD.
Check all forms.
Check mobile.
Check desktop.
Check loading states.
Check empty states.
Check errors.
Check image failures.
Check search.
Check flyer viewer.
Check expiry logic.
Check SEO.
Check analytics.
Check backups.
Check health endpoints.
Check logs.
Check security headers.

Create:
docs/release-readiness.md

Do not mark production-ready until every critical item is passed.
```

---

# 90. DEVELOPMENT ORDER

Follow this exact order:

```text
0 Audit
1 Foundation
2 Core data model
3 Authentication
4 Test UI
5 Location
6 Stores
7 Categories/Products
8 Offers
9 Search
10 Flyers
11 Favorites/Lists
12 Final UI
13 SEO
14 Analytics
15 Admin
16 OCR/AI
17 Performance
18 Security
19 Testing
20 Deployment
21 Production readiness
```

---

# 91. DO NOT BUILD YET

Avoid early implementation of:
- complex AI
- recommendations
- full retailer billing
- advanced ads
- microservices
- Kubernetes
- Elasticsearch
- multi-region deployment
- native mobile apps

First prove:
- data model
- offer lifecycle
- search
- location
- flyer experience
- admin workflow

---

# 92. ESTIMATED DEVELOPMENT TIME

Assuming one experienced full-time developer supported by Antigravity:

## Prototype

5-8 days:
- test UI
- mock data
- navigation

## MVP

20-30 days:
- auth
- stores
- locations
- catalog
- offers
- flyers
- search
- favorites
- shopping lists
- admin

## Production-quality first release

35-50 days:
- polished UI
- SEO
- analytics
- security
- test suite
- deployment
- monitoring

## Full platform

60-90 days:
- OCR
- AI extraction
- retailer tools
- recommendation foundations
- advanced analytics
- sponsored content
- automation

Actual time depends on:
- developer availability
- content volume
- final UI changes
- number of countries/cities
- retailer onboarding workflow
- image/flyer processing requirements

---

# 93. MVP DEFINITION OF DONE

The MVP is complete when:

- users can discover offers
- users can choose a location
- users can browse stores
- users can browse categories
- users can search
- users can open offer details
- users can view flyers
- users can save offers
- users can create shopping lists
- admins can manage all major entities
- admins can publish/expire offers
- admins can upload/publish flyers
- public pages are SEO-friendly
- application is responsive
- critical flows are covered by automated tests
- application is deployed to staging
- monitoring is enabled

---

# 94. FUTURE FEATURE BACKLOG

Priority A:
- retailer portal
- CSV import
- better search
- OCR
- notifications

Priority B:
- price history
- personalized feed
- AI recommendations
- coupons
- sponsored placement

Priority C:
- mobile app
- retailer billing
- advanced BI
- loyalty
- social sharing
- multilingual expansion

---

# 95. FINAL EXECUTION INSTRUCTION TO ANTIGRAVITY

Use this after the repository is ready:

```text
We are implementing the retail discovery platform according to docs/implementation-plan.md.

Follow the phases in order.

For the current phase:
1. inspect relevant code
2. make the smallest safe set of changes
3. implement the required functionality
4. add tests
5. run tests
6. run lint
7. run type checking
8. verify the UI on mobile and desktop where relevant
9. update documentation
10. produce the phase completion report

Never skip acceptance criteria.

Do not proceed to a later phase automatically.

When a requirement is ambiguous:
- check docs/assumptions.md
- inspect existing implementation
- prefer the least destructive implementation
- document the assumption

Do not rewrite the project architecture unless a serious technical reason exists.
```

---

# 96. DEVELOPER REVIEW GATES

After every phase, the human reviewer should check:

```text
[ ] Application starts
[ ] No unexpected console errors
[ ] Database migration works
[ ] APIs return expected responses
[ ] Authentication is correct
[ ] Mobile UI works
[ ] Desktop UI works
[ ] Loading state works
[ ] Empty state works
[ ] Error state works
[ ] Tests pass
[ ] No unrelated files changed
[ ] Docs updated
```

Only then continue.

---

# 97. IMPORTANT PRODUCT PRINCIPLE

The website's competitive value is not the home-page styling alone.

The core product moat can become:

```text
Location
+
Clean retail data
+
Current offers
+
Excellent search
+
Flyer experience
+
Fast page load
+
Useful personalization
```

A beautiful UI without fresh offer data will not create a strong product.

Therefore the architecture must support content operations from the beginning.

---

# 98. RECOMMENDED FINAL STACK

```text
Frontend
Next.js
TypeScript
Tailwind
shadcn/ui

Backend
Django
Django REST Framework

Database
PostgreSQL

Caching
Redis

Background Jobs
Celery

Storage
Cloudflare R2 / S3

Search
PostgreSQL initially
OpenSearch later if needed

Maps
Mapbox or Google Maps

Analytics
GA4 + privacy-conscious event abstraction

Monitoring
Sentry

Deployment
Docker + Cloudflare + managed infrastructure

Testing
Pytest/Django tests
Vitest
Playwright

CI/CD
GitHub Actions
```

---

# 99. FILE-BY-FILE DOCUMENTATION TARGET

Create and maintain:

```text
docs/
├── implementation-plan.md
├── repository-audit.md
├── assumptions.md
├── release-readiness.md
├── security-audit.md
├── deployment.md
├── backup-restore.md
├── architecture/
│   ├── system-architecture.md
│   ├── data-model.md
│   ├── api-architecture.md
│   └── decision-log.md
├── product/
│   ├── user-roles.md
│   ├── offer-lifecycle.md
│   ├── flyer-processing.md
│   └── search.md
└── operations/
    ├── moderation.md
    ├── incident-response.md
    └── content-operations.md
```

---

# 100. FINAL RESULT

The intended final platform should feel like a modern retail discovery/search engine:

```text
User
 ↓
Select location
 ↓
Search/browse
 ↓
Discover offers
 ↓
Compare stores
 ↓
Open flyer
 ↓
Save offer
 ↓
Add to shopping list
 ↓
Visit store
```

And the operational side should be:

```text
Admin
 ↓
Create/import store
 ↓
Create/import product
 ↓
Upload offer/flyer
 ↓
Validate
 ↓
Review
 ↓
Publish
 ↓
Offer becomes discoverable
 ↓
Expires automatically
 ↓
Analytics recorded
```

This is the target end-to-end system.

