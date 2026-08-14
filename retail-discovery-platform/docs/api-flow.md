# End-to-End API Flow Specification

## Complete Workflow API Endpoint Reference

### 1. Shop Registration & Admin Approval
- `POST /api/v1/shop-registration/` — Shop registration payload (`status='PENDING_APPROVAL'`).
- `GET /api/v1/shop/me/` — Shop owner checks status (`PENDING_APPROVAL`, `APPROVED`, `REJECTED`).
- `GET /api/v1/admin/shops/pending/` — Admin views pending shops queue.
- `POST /api/v1/admin/shops/{id}/approve/` — Admin approves shop (`status='APPROVED'`, `is_active=True`).
- `POST /api/v1/admin/shops/{id}/reject/` — Admin rejects shop with `rejection_reason`.

### 2. Shop Branch & Flyer Management
- `GET/POST/PATCH/DELETE /api/v1/shop/branches/` — Shop manages branches.
- `POST /api/v1/shop/flyers/` — Shop uploads flyer PDF/Images.
- `POST /api/v1/shop/flyers/{id}/submit/` — Shop submits flyer for review (`status='PENDING_REVIEW'`).
- `GET /api/v1/admin/flyers/pending/` — Admin views pending flyers queue.
- `POST /api/v1/admin/flyers/{id}/approve/` — Admin approves flyer (`status='PUBLISHED'`).

### 3. Public Discovery & Product Detail Loop
- `GET /api/v1/flyers/` — Public list of published flyers from approved shops.
- `GET /api/v1/flyers/{slug}/` — Interactive flyer viewer with pages & hotspots.
- `GET /api/v1/products/{slug}/` — Product detail with price, shop, source flyer page.
- `GET /api/v1/products/{slug}/availability/` — Branch availability table (`AVAILABLE`, `LIMITED`, `UNKNOWN`).
- `GET /api/v1/products/{slug}/related/` — Scored related products recommendation carousel.
- `GET /api/v1/search/` — Location-aware multi-entity search.
