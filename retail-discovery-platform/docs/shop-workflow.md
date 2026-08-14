# Shop Workflow Specification

## Shop Lifecycle
```text
Registration (POST /api/v1/shop-registration/)
        ↓
status = PENDING_APPROVAL, is_active = False
        ↓
Admin Review Queue (GET /api/v1/admin/shops/pending/)
        ├── Admin Approves (POST /api/v1/admin/shops/{id}/approve/)
        │       ↓
        │   status = APPROVED, is_active = True
        │       ↓
        │   Shop Dashboard Access & Branch / Flyer Management
        │
        └── Admin Rejects (POST /api/v1/admin/shops/{id}/reject/)
                ↓
            status = REJECTED, rejection_reason = "..."
                ↓
            Shop Edits Profile & Resubmits
```

## Shop Data Fields
- `owner`: ForeignKey to `User`
- `name`: CharField (Unique)
- `legal_name`: CharField
- `owner_name`: CharField
- `email`: EmailField
- `phone`: CharField
- `description`: TextField
- `logo_url`: URLField
- `banner_url`: URLField
- `website`: URLField
- `country`: ForeignKey to `Country`
- `state`: ForeignKey to `State`
- `city`: ForeignKey to `City`
- `locality`: ForeignKey to `Locality`
- `postal_code`: CharField
- `address`: CharField
- `latitude`: DecimalField
- `longitude`: DecimalField
- `status`: ChoiceField (`DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `SUSPENDED`, `ARCHIVED`)
- `rejection_reason`: TextField
- `approved_by`: ForeignKey to `User`
- `approved_at`: DateTimeField
