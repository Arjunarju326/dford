# Related Products Recommendation Specification

## Scoring Engine Algorithm
When a user views a product (e.g., *Fortune Sunflower Oil 1.8L*), the system calculates recommendation scores for all candidate active offers using the following weight matrix:

| Factor | Weight Score | Description |
|---|---|---|
| **Same Category** | +40 | Matches product primary category |
| **Same Brand** | +25 | Matches manufacturer brand |
| **Same Store** | +20 | Offered by the same retail chain |
| **Same Flyer** | +15 | Featured in the same catalog flyer |
| **Name Similarity** | +15 | Word overlap in title |
| **Price Similarity** | +10 | Within ±20% price band |

## Exclusion Rules
The recommendation engine MUST strictly exclude:
1. Current product being viewed
2. Expired offers (`end_date < now`)
3. Unpublished offers (`flyer__status != 'PUBLISHED'`)
4. Inactive shops (`shop__is_active == False` or `shop__status != 'APPROVED'`)
5. Rejected or draft items
