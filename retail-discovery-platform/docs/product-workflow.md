# Product & Offer Workflow Specification

## User Interaction Flow
```text
User Opens Flyer (/flyers/{slug})
        ↓
User Clicks Product Hotspot Box (x, y, width, height)
        ↓
Backend Resolves FlyerItem -> Product -> Offer
        ↓
Product Detail Page (/products/{slug})
        ├── Product Title, Brand, Image, Category, Description
        ├── Current Offer Price, Original Price, Discount %
        ├── Source Flyer Link & Page Number ("View in Flyer")
        ├── Available Branches & Location Distance
        ├── Directions Button (Google Maps)
        └── Related Products Recommendation Carousel
```
