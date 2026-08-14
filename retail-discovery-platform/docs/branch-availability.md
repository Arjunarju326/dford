# Branch Availability Specification

## Concept
Offers belong to a Shop, but actual availability varies by physical Store Branch.

## OfferBranchAvailability Model
```python
class OfferBranchAvailability(models.Model):
    AVAILABILITY_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('LIMITED', 'Limited Stock'),
        ('UNAVAILABLE', 'Out of Stock'),
        ('UNKNOWN', 'Availability Not Confirmed'),
    ]
    offer = models.ForeignKey(Offer, on_delete=models.CASCADE, related_name='branch_availabilities')
    branch = models.ForeignKey(StoreBranch, on_delete=models.CASCADE, related_name='offer_availabilities')
    status = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='UNKNOWN')
    updated_at = models.DateTimeField(auto_now=True)
```

## Business Rule
If actual inventory data is not explicitly provided by the shop, the system MUST NOT claim the product is `AVAILABLE`. It must default to `UNKNOWN` and display: *"Availability may vary by branch."*
