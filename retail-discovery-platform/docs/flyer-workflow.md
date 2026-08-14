# Flyer Workflow & Processing Specification

## Flyer Lifecycle
```text
Shop Uploads Flyer (POST /api/v1/shop/flyers/)
        ↓
status = DRAFT, processing_status = UPLOADED
        ↓
Processing Pipeline (PDF / Image Split & OCR Extraction)
        ↓
processing_status = PROCESSED (FlyerPages & FlyerItems Created)
        ↓
Shop Submits for Review (POST /api/v1/shop/flyers/{id}/submit/)
        ↓
status = PENDING_REVIEW
        ↓
Admin Review Queue (GET /api/v1/admin/flyers/pending/)
        ├── Admin Approves (POST /api/v1/admin/flyers/{id}/approve/)
        │       ↓
        │   status = PUBLISHED, published_at = now
        │       ↓
        │   Publicly Visible on Web App
        │
        └── Admin Rejects (POST /api/v1/admin/flyers/{id}/reject/)
                ↓
            status = REJECTED, rejection_reason = "..."
```

## Flyer Data Hierarchy
```text
Flyer (store, title, description, start_date, end_date, status, processing_status)
  └── FlyerPage (flyer, page_number, image_url, extracted_text)
        └── FlyerItem (flyer_page, product, offer, x, y, width, height)
```
