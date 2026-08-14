# Retail Discovery Platform - Backend API

Django REST Framework API for the D4D-style retail discovery platform.

## Overview

This is a production-grade Django + Django REST Framework backend for a comprehensive retail discovery and offer comparison platform. The API serves a Next.js frontend and provides endpoints for:

- User authentication and authorization
- Location management
- Store and branch management
- Product catalog
- Offers and promotions
- Flyer management
- Shopping lists and favorites
- Analytics and tracking

## Tech Stack

- **Python 3.10+**
- **Django 4.2**
- **Django REST Framework 3.14**
- **PostgreSQL**
- **Redis** (for caching and Celery broker)
- **Celery** (async tasks)
- **Cloudinary** (image/file storage)

## Project Structure

```
backend/
├── config/                 # Django configuration
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── __init__.py
├── apps/                   # Django applications
│   ├── accounts/          # User authentication & profiles
│   ├── locations/         # Geographic hierarchy
│   ├── stores/            # Store management
│   ├── catalog/           # Products & categories
│   ├── offers/            # Promotions & offers
│   ├── flyers/            # Flyer management
│   ├── shopping/          # Shopping lists
│   ├── favorites/         # Favorites system
│   ├── notifications/     # Notification system
│   └── analytics/         # Analytics & tracking
├── manage.py
├── requirements.txt
├── .env.example
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- Python 3.10 or higher
- PostgreSQL 12+
- Redis 6+
- pip and virtualenv

### 2. Create Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Key configurations to set:**
- `SECRET_KEY`: Generate a strong secret key
- `DB_*`: PostgreSQL connection details
- `REDIS_URL`: Redis connection string
- `CLOUDINARY_*`: Cloudinary API credentials
- `CORS_ALLOWED_ORIGINS`: Frontend URLs

### 5. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser for admin panel
python manage.py createsuperuser

# (Optional) Load initial data
python manage.py loaddata initial_data.json
```

### 6. Cloudinary Setup

1. Sign up at [Cloudinary.com](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Add them to your `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### 7. Run Development Server

```bash
# Start Django development server
python manage.py runserver

# In another terminal, start Celery worker (for async tasks)
celery -A config worker -l info
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running:
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## API Endpoints Overview

### Authentication
```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/
POST   /api/auth/refresh/
GET    /api/auth/user/
```

### Locations
```
GET    /api/locations/countries/
GET    /api/locations/cities/
GET    /api/locations/localities/
```

### Stores
```
GET    /api/stores/
GET    /api/stores/{id}/
GET    /api/stores/{id}/branches/
```

### Catalog
```
GET    /api/catalog/categories/
GET    /api/catalog/products/
GET    /api/catalog/products/{id}/
GET    /api/catalog/brands/
```

### Offers
```
GET    /api/offers/
GET    /api/offers/{id}/
POST   /api/offers/{id}/save/
DELETE /api/offers/{id}/unsave/
```

### Flyers
```
GET    /api/flyers/
GET    /api/flyers/{id}/
GET    /api/flyers/{id}/pages/
```

### Shopping
```
GET    /api/shopping/lists/
POST   /api/shopping/lists/
POST   /api/shopping/lists/{id}/items/
```

### Favorites
```
POST   /api/favorites/stores/
POST   /api/favorites/products/
GET    /api/favorites/stores/
GET    /api/favorites/products/
```

## Database Models

### Core Models

#### User (accounts.User)
- Extended Django User with user_type, phone, preferred_location
- User authentication and profile management

#### Location Hierarchy
- Country → State → City → Locality
- Geographic organization of stores and offers

#### Store Management
- Store (retail brand/chain)
- StoreBranch (individual location)
- StoreImage, StoreRating

#### Catalog
- Category (hierarchical product categories)
- Brand (manufacturer/brand)
- Product (individual SKUs)
- ProductImage, ProductSpecification

#### Offers
- Offer (promotion with pricing)
- OfferView, OfferClick (analytics)

#### Flyers
- Flyer (promotional document)
- FlyerPage (individual pages with OCR)
- FlyerProduct (extracted products)

#### Shopping & Favorites
- ShoppingList, ShoppingListItem
- SavedOffer, FavoriteStore, FavoriteCategory, FavoriteProduct

#### Analytics
- PageView, SearchQuery, UserSession, DailyAnalytics

## Management Commands

```bash
# Create sample data
python manage.py create_sample_data

# Export offers to CSV
python manage.py export_offers --format csv

# Cleanup expired offers
python manage.py cleanup_expired_offers

# Generate analytics report
python manage.py generate_analytics_report --date 2024-01-01
```

## Celery Tasks

Background tasks for:
- Sending notifications
- Processing flyer uploads
- OCR extraction (future)
- Analytics aggregation
- Image optimization

Run worker:
```bash
celery -A config worker -l info
```

## Testing

```bash
# Run all tests
pytest

# Run specific app tests
pytest apps/offers/tests/

# With coverage
pytest --cov=apps
```

## Deployment

### Using Gunicorn

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

### Using Docker

```bash
docker build -t retail-api .
docker run -p 8000:8000 --env-file .env retail-api
```

## Security Checklist

- [ ] `SECRET_KEY` is strong and unique
- [ ] `DEBUG=False` in production
- [ ] Database credentials are secure
- [ ] Redis connection is authenticated
- [ ] CORS origins are restricted
- [ ] HTTPS is enforced
- [ ] Database backups are configured
- [ ] Logs are monitored
- [ ] Rate limiting is enabled
- [ ] Input validation is in place

## Performance Optimization

- Database indexing on frequently queried fields
- Redis caching for store/category data
- Pagination for list endpoints
- Image optimization via Cloudinary
- Celery for async tasks
- Database connection pooling

## Monitoring & Logging

- Structured logging to stdout/files
- Error tracking with Sentry (optional)
- Performance monitoring with Django Debug Toolbar (dev only)
- API analytics in database

## Common Issues

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d retail_db

# Update connection in .env
DB_HOST=localhost
DB_PORT=5432
```

### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping
```

### Cloudinary Upload Fails
```bash
# Verify credentials in .env
# Check file size is within limits
# Verify ALLOWED_IMAGE_FORMATS
```

## Documentation

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Cloudinary Upload](https://cloudinary.com/documentation/upload_images)
- [Celery Documentation](https://docs.celeryproject.io/)

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Run linting: `flake8 .`
5. Submit a pull request

## License

Proprietary - All Rights Reserved

## Support

For issues and questions, please contact the development team.
