# Status State Machine Transitions

## 1. Shop Status State Machine
```text
DRAFT ──► PENDING_APPROVAL ──► APPROVED ──► SUSPENDED ──► ARCHIVED
                │                 ▲
                ▼                 │
             REJECTED ────────────┘ (Resubmit)
```

## 2. Flyer Status State Machine
```text
DRAFT ──► PROCESSING ──► PENDING_REVIEW ──► PUBLISHED ──► EXPIRED ──► ARCHIVED
                              │                ▲
                              ▼                │
                           REJECTED ───────────┘ (Resubmit)
```
